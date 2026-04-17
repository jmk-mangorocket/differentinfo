import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Model for baby/life item information posts
const FINE_TUNED_MODEL = 'gpt-4o'

// System prompt for info posts (no product promotion)
const INFO_POST_SYSTEM_PROMPT = `당신은 육아용품·생활용품 전문 리뷰어이자 TCO(총비용) 분석 블로거입니다.
육아용품과 생활 아이템의 실제 사용 비용, 소모품 비용, 유지비를 포함한 TCO 관점에서 분석합니다.
초보 부모도 이해하기 쉽게 작성하되, 실사용 데이터를 바탕으로 설명합니다.
제품 홍보가 아닌 순수 정보 공유 목적으로 작성합니다.

응답은 반드시 아래 JSON 형식으로 작성해주세요:
{
  "title": "SEO 최적화된 제목 (50자 이내)",
  "description": "150-160자 내외의 메타 설명",
  "content": "HTML 형식의 본문 (1500-2500자)",
  "tags": ["태그1", "태그2", "태그3"],
  "seo_keywords": ["키워드1", "키워드2", "키워드3"],
  "faq": [
    {"question": "질문1", "answer": "답변1"},
    {"question": "질문2", "answer": "답변2"},
    {"question": "질문3", "answer": "답변3"}
  ]
}

본문 작성 시 주의사항:
- HTML 태그를 사용하여 구조화된 콘텐츠 작성
- h2, h3 태그로 섹션 구분
- p 태그로 단락 구분
- ul, li 태그로 목록 작성
- 쿠팡 링크나 제품 홍보 문구 절대 포함하지 않음
- 순수 정보 제공 목적의 콘텐츠만 작성`

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Simple admin key check
function isAuthorized(request: NextRequest): boolean {
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_SECRET_KEY

  if (!expectedKey) return true
  return adminKey === expectedKey
}

// Generate next baby slug number from database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getNextSlugNumber(supabase: any): Promise<number> {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')

  if (!posts || posts.length === 0) return 1

  const numbers = (posts as { slug: string }[])
    .map(p => p.slug)
    .filter(s => /^baby-\d+$/.test(s))
    .map(s => parseInt(s.replace('baby-', ''), 10))
    .filter(n => !isNaN(n))

  if (numbers.length === 0) return 1
  return Math.max(...numbers) + 1
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 })
    }

    const body = await request.json()
    const { topic } = body

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Generate content using fine-tuned model
    console.log(`Generating info post for topic: ${topic}`)
    console.log(`Using model: ${FINE_TUNED_MODEL}`)

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: FINE_TUNED_MODEL,
        messages: [
          { role: 'system', content: INFO_POST_SYSTEM_PROMPT },
          { role: 'user', content: `다음 주제에 대한 육아용품·생활용품 정보 블로그 포스트를 TCO(총비용) 관점에서 작성해주세요: ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      const errorMessage = openaiError instanceof Error ? openaiError.message : 'OpenAI API call failed'
      return NextResponse.json({ error: `OpenAI Error: ${errorMessage}` }, { status: 500 })
    }

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    // Parse the generated content
    let generatedData
    try {
      generatedData = JSON.parse(responseContent)
    } catch {
      console.error('Failed to parse OpenAI response:', responseContent)
      return NextResponse.json({ error: 'Failed to parse generated content' }, { status: 500 })
    }

    // Validate and prepare post data
    const title = generatedData.title || `${topic} - 육아&생활 아이템 리뷰`

    // Generate slug in baby-X format
    const nextSlugNumber = await getNextSlugNumber(supabase)
    const slug = `baby-${nextSlugNumber}`

    // Calculate word count
    const contentText = String(generatedData.content || '')
    const wordCount = contentText
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((word: string) => word.length > 0).length

    // Prepare post data (NO Coupang-related fields)
    const postData = {
      title,
      slug,
      description: generatedData.description || `${topic}에 대해 TCO 관점에서 분석합니다.`,
      content: generatedData.content || '',
      featured_image: null,
      coupang_url: null,
      coupang_product_id: null,
      product_name: null,
      product_price: null,
      category: '육아용품 가이드',
      tags: Array.isArray(generatedData.tags) ? generatedData.tags : [],
      seo_keywords: Array.isArray(generatedData.seo_keywords) ? generatedData.seo_keywords : [],
      faq: Array.isArray(generatedData.faq) ? generatedData.faq : [],
      word_count: wordCount,
      is_published: true,
      published_at: new Date().toISOString(),
    }

    // Insert into database
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Info post created successfully: ${data.title}`)

    return NextResponse.json({
      post: data,
      message: '정보 포스트가 성공적으로 생성되었습니다.'
    }, { status: 201 })

  } catch (err) {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
