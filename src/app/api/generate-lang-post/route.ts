import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { isKeywordPosted, markKeywordPosted } from '@/lib/keyword-tracker'

export const dynamic = 'force-dynamic'

// === SITE_CONFIG ===
const SITE_CONFIG = {
  siteName: '태국라이프',
  siteDescription: '태국 창업·생활·언어까지 — 한국인을 위한 태국 종합 가이드',
  persona: '한국인을 위한 태국 창업·생활·언어 전문 블로그 에디터',
  slugPrefix: 'thai',
} as const

// ============================================================
// Search Intent Classification
// ============================================================

type SearchIntent =
  | 'business_setup'      // 창업, 법인, 사업자, 세금, 등록
  | 'visa_immigration'    // 비자, 이민, 체류, 입국, 거주
  | 'real_estate_life'    // 부동산, 콘도, 임대, 집, 생활 적응
  | 'health_culture'      // 병원, 의료, 건강, 음식, 맛집, 문화
  | 'pronunciation_study' // 발음, 성조, 읽기, 문자
  | 'grammar_vocab'       // 문법, 단어, 어휘, 표현
  | 'how_to_start'        // 방법, 시작, 독학, 공부법, 배우는법
  | 'compare_review'      // 추천, 비교, 순위, 후기

const INTENT_PATTERNS: Record<SearchIntent, { suffixes: string[]; contains: string[] }> = {
  business_setup: {
    suffixes: ['창업', '법인', '설립', '사업자', '등록', '세금', '계좌', '허가'],
    contains: ['창업', '사업', '법인', '세금', '회계', '수익', '투자처', '비즈니스'],
  },
  visa_immigration: {
    suffixes: ['비자', '이민', '체류', '입국', '거주', '비자발급'],
    contains: ['비자', '이민', '체류', '장기거주', '노마드비자', 'LTR', '교육비자', '엘리트비자'],
  },
  real_estate_life: {
    suffixes: ['콘도', '아파트', '임대', '렌트', '부동산', '집구하기'],
    contains: ['부동산', '콘도', '임대', '렌트', '이사', '주거'],
  },
  health_culture: {
    suffixes: ['병원', '의료', '건강', '음식', '맛집', '문화', '축제'],
    contains: ['병원', '의료', '건강', '음식', '맛집', '생활', '적응', '쏭끄란', '문화'],
  },
  pronunciation_study: {
    suffixes: ['발음', '성조', '발음법', '읽는법', '문자', '알파벳'],
    contains: ['발음', '성조', '헷갈', '어렵', '못 읽'],
  },
  grammar_vocab: {
    suffixes: ['문법', '단어', '어휘', '표현', '뜻', '의미', '차이', '인가요', '이란'],
    contains: ['문법', '단어', '어휘', '표현', '왜', '뜻'],
  },
  how_to_start: {
    suffixes: ['방법', '독학', '하는법', '공부법', '시작', '배우는법', '입문', '가이드'],
    contains: ['어떻게', '시작하', '입문', '독학'],
  },
  compare_review: {
    suffixes: ['추천', '비교', '순위', '후기', '좋은', 'TOP', '베스트'],
    contains: ['추천', '비교', '어떤', '뭐가', '후기', '고르는'],
  },
}

function classifySearchIntent(keyword: string): SearchIntent {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const suffix of patterns.suffixes) {
      if (keyword.endsWith(suffix)) return intent as SearchIntent
    }
    for (const word of patterns.contains) {
      if (keyword.includes(word)) return intent as SearchIntent
    }
  }
  return 'grammar_vocab'
}

// ============================================================
// Prompt Builder
// ============================================================

interface ExistingPost {
  slug: string
  title: string
}

function buildSystemPrompt(intent: SearchIntent): string {
  const isLanguage = ['pronunciation_study', 'grammar_vocab', 'how_to_start', 'compare_review'].includes(intent)
  const isBusiness = ['business_setup', 'visa_immigration'].includes(intent)

  const parts: string[] = []
  parts.push('당신은 ' + SITE_CONFIG.persona + '입니다.')
  parts.push('목표: 한국인 독자에게 실용적이고 신뢰할 수 있는 태국 관련 정보를 제공하는 8,000자 이상 HTML 글 작성')
  parts.push('')
  parts.push('=== 절대 금지 ===')
  parts.push('- 근거 없는 수치/통계 ("~%가 성공", "~명 중 ~명" 등 출처 없는 수치)')
  parts.push('- 클릭베이트 표현 ("충격적", "반드시 알아야", "절대 몰랐던")')
  parts.push('- 외부 서비스·앱·상품 구매 링크 (어필리에이트 링크 절대 금지)')
  parts.push('- 법적·의료·세무 조언을 단정적으로 제시 (면책 고지 필수)')
  parts.push('- 긴급성 유발 표현 ("지금 당장", "기회를 놓치지 마세요")')
  parts.push('')
  parts.push('=== 필수 포함 ===')
  if (isLanguage) {
    parts.push('- 실제 태국어 단어/문장 예시 최소 10개 (한글 독음 및 뜻 포함)')
    parts.push('- 면책 고지: "언어 학습은 개인차가 크며, 꾸준한 연습이 가장 중요합니다."')
  }
  if (isBusiness) {
    parts.push('- 절차·비용·소요기간 비교표 (<table> 필수)')
    parts.push('- 면책 고지: "본 글은 참고용이며, 실제 진행 전 전문가(변호사·세무사) 상담을 권장합니다."')
  }
  if (!isLanguage && !isBusiness) {
    parts.push('- 실용적 팁 최소 5가지 (<ul> 또는 번호 목록)')
    parts.push('- 면책 고지: "개인 상황에 따라 다를 수 있으며, 중요 사항은 공식 기관에 확인하세요."')
  }
  parts.push('- 최소 1개 이상 <table> (비교표 또는 단계표)')
  parts.push('- 마지막 업데이트 날짜')
  parts.push('')
  parts.push('=== 출력 형식 ===')
  parts.push('- 순수 HTML만 출력 (마크다운 코드블록, JSON, 설명 텍스트 일절 금지)')
  parts.push('- <h2> 메인 섹션, <h3> 소섹션, <p>, <table>, <ul>, <ol> 사용')
  parts.push('- 각 <h3> 소제목 아래 최소 200자')
  parts.push('- <table>에는 반드시 <thead>와 <tbody> 사용')

  return parts.join('\n')
}

function buildUserMessage(intent: SearchIntent, keyword: string, existingPosts: ExistingPost[]): string {
  const stageGuide: Record<SearchIntent, string[]> = {
    business_setup: [
      'Stage 1 — 공감 도입 (300자+): "태국에서 사업을 시작하려다 막히셨나요?" 형태의 공감 질문으로 시작. 이 글에서 배울 것 예고.',
      'Stage 2 — 개요 및 법적 구조 교육 (2,500자+): 태국 사업 구조 설명, 필요 허가·서류, 주의사항. 외국인 사업 규제(Foreign Business Act 핵심 요약). 실제 사례·수치 포함.',
      'Stage 3 — 절차·비용 비교표 (2,000자+): 단계별 절차표(<table> — 단계|내용|소요기간|비용 목표). 주요 단계 <h3>으로 상세 설명.',
      'Stage 4 — 주의사항·체크리스트 (1,500자): 한국인이 자주 실수하는 5가지. ✅ 해야 할 것 / ❌ 피해야 할 것으로 구분.',
      'Stage 5 — 관련 글 안내 (300자): "이런 글도 함께 읽어보세요" 형태로 관련 글 2~3개.',
      'Stage 6 — 마무리 (400자): 핵심 요약, 법적 면책 고지, 업데이트 날짜.',
    ],
    visa_immigration: [
      'Stage 1 — 공감 도입 (300자+): 태국 장기 체류나 비자 문제로 고민 중이셨나요? 공감 질문으로 시작.',
      'Stage 2 — 비자 유형 교육 (2,000자+): 주요 태국 비자 종류(관광비자, 은퇴비자, 사업비자, 노마드비자, 엘리트비자 등) 설명. 각 유형의 조건·기간·비용.',
      'Stage 3 — 비교표 (2,000자+): 비자 유형별 비교표(<table> — 비자종류|체류기간|조건|비용|갱신방법). 각 비자 <h3>으로 상세 설명.',
      'Stage 4 — 신청 절차 단계별 안내 (1,500자): 서류 준비부터 수령까지 단계별 설명. 주의사항·자주 하는 실수.',
      'Stage 5 — 관련 글 안내 (300자): 관련 글 2~3개.',
      'Stage 6 — 마무리 (400자): 핵심 요약, 법적 면책 고지, 업데이트 날짜.',
    ],
    real_estate_life: [
      'Stage 1 — 공감 도입 (300자+): 태국에서 집 구하기나 생활 적응이 막막하셨나요? 공감으로 시작.',
      'Stage 2 — 시장 개요 교육 (2,000자+): 태국 부동산/생활 시장 특성, 지역별 특징(방콕/치앙마이/파타야 등), 한국인 선호 지역. 평균 가격대 제시.',
      'Stage 3 — 방법·지역 비교표 (2,000자+): 선택지 비교표(<table>). 각 옵션 <h3>으로 상세 설명.',
      'Stage 4 — 실전 팁 & 주의사항 (1,500자): 한국인이 자주 겪는 문제 5가지. 계약 시 체크리스트.',
      'Stage 5 — 관련 글 안내 (300자): 관련 글 2~3개.',
      'Stage 6 — 마무리 (400자): 핵심 요약, 면책 고지, 업데이트 날짜.',
    ],
    health_culture: [
      'Stage 1 — 공감 도입 (300자+): 태국 생활에서 이 주제가 궁금하셨나요? 공감 질문으로 시작.',
      'Stage 2 — 핵심 정보 교육 (3,000자+): 주제에 맞는 실용 정보(병원·의료라면 주요 병원·비용, 음식이라면 지역별 맛집·주의사항, 문화라면 에티켓·금기사항). 실제 사례 포함.',
      'Stage 3 — 비교·선택 가이드 (1,500자+): 선택지 비교표(<table>). 상황별 추천.',
      'Stage 4 — 실전 팁 & 주의사항 (1,200자): 실용 팁 5가지 이상.',
      'Stage 5 — 관련 글 안내 (300자): 관련 글 2~3개.',
      'Stage 6 — 마무리 (400자): 핵심 요약, 면책 고지, 업데이트 날짜.',
    ],
    pronunciation_study: [
      'Stage 1 — 공감 도입 (300자+): "태국어 발음이 어려우셨나요?" 형태의 공감 질문으로 시작.',
      'Stage 2 — 발음·성조 교육 (3,500자+): 태국어 발음/성조 시스템 상세 설명. 한국어와의 비교표(<table>). 실제 태국어 예시 단어 10개 이상 (한글 독음+뜻). 자주 하는 실수와 교정법.',
      'Stage 3 — 학습 방법 비교 (1,500자+): 발음 마스터 방법 비교표(<table> — 방법|특징|비용). 앱, 유튜브, 원어민 회화, 교재 최소 4가지.',
      'Stage 5 — 관련 글 안내 (300자): 관련 글 2~3개.',
      'Stage 6 — 마무리 (300자): 핵심 요약, 면책 고지, 업데이트 날짜.',
    ],
    grammar_vocab: [
      'Stage 1 — 공감 도입 (300자+): 해당 문법/어휘 개념에 대한 학습자 공감 질문으로 시작.',
      'Stage 2 — 심층 교육 (5,000자+): 개념 정의, 원리 설명. 실제 태국어 예시 단어/문장 10개 이상 (한글 독음+뜻). 단계별 분류표(<table>). 자주 묻는 오개념 정정.',
      'Stage 6 — 마무리 (400자): 핵심 요약, 관련 글 2~3개, 면책 고지, 업데이트 날짜.',
    ],
    how_to_start: [
      'Stage 1 — 공감 도입 (300자+): 태국어/태국 생활/태국 창업 시작이 막막하셨나요? 공감으로 시작.',
      'Stage 2 — 핵심 원리 교육 (2,000자+): 주제에 맞는 기초 개념. 언어라면 태국어 예시 10개 이상 포함.',
      'Stage 3 — 단계별 로드맵 (2,500자+): 입문→중급 단계별 목표와 방법 비교표(<table>). 각 단계 <h3>으로 설명.',
      'Stage 5 — 관련 글 안내 (300자): 관련 글 2~3개.',
      'Stage 6 — 마무리 (400자): 핵심 요약, 면책 고지, 업데이트 날짜.',
    ],
    compare_review: [
      'Stage 1 — 공감 도입 (300자+): 선택지가 너무 많아 고민 중이셨나요? 공감으로 시작.',
      'Stage 2 — 주요 선택지 교육 (2,500자+): 비교 대상 각각의 특징 설명. 언어 관련이라면 태국어 예시 10개 이상.',
      'Stage 4 — 선택 기준 체크리스트 (1,200자): 좋은 선택 기준 5~7가지. ✅ 추천 신호 / ❌ 주의 신호.',
      'Stage 3 — 최종 비교표 (1,000자): 전체 비교표(<table>).',
      'Stage 5 — 관련 글 안내 (300자): 관련 글 2~3개.',
      'Stage 6 — 마무리 (300자): 요약, 면책 고지, 업데이트 날짜.',
    ],
  }

  const stages = stageGuide[intent]
  const parts: string[] = []

  parts.push('"' + keyword + '" 키워드로 태국 관련 전문 블로그 글을 HTML로 작성하세요.')
  parts.push('')
  parts.push('[단계별 구조 — 이 순서대로 작성]')
  stages.forEach((s, i) => parts.push((i + 1) + '. ' + s))
  parts.push('')
  parts.push('[출력 규칙]')
  parts.push('- 순수 HTML만 출력 (코드블록 금지)')
  parts.push('- 총 분량: 최소 8,000자 (한글 기준)')
  parts.push('- 각 <h3> 소제목 아래 최소 200자')

  const isLang = ['pronunciation_study', 'grammar_vocab', 'how_to_start', 'compare_review'].includes(intent)
  if (isLang) {
    parts.push('- 실제 태국어 단어/문장 최소 10개 (한글 독음 + 뜻 포함)')
  }

  if (existingPosts.length > 0) {
    parts.push('')
    parts.push('[내부 관련 글 목록 — 마무리 또는 Stage 5에서 2~3개 선택하여 삽입]')
    existingPosts.slice(0, 8).forEach(p => {
      parts.push('- <a href="/posts/' + p.slug + '">' + p.title + '</a>')
    })
  }

  return parts.join('\n')
}

// ============================================================
// Helper Functions
// ============================================================

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function isAuthorized(request: NextRequest): boolean {
  const key = request.headers.get('x-admin-key')
  const expected = process.env.ADMIN_SECRET_KEY
  if (!expected) return true
  return key === expected
}

async function generateSlug(keyword: string, prefix: string): Promise<string> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Translate Korean keywords to short English URL slugs. Lowercase letters and hyphens only. Max 50 chars. Output ONLY the slug.',
        },
        { role: 'user', content: 'Translate: "' + keyword + '"' },
      ],
      temperature: 0,
      max_tokens: 60,
    })
    const slug = (res.choices[0]?.message?.content || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    if (slug && slug.length >= 5) return slug
  } catch {}
  return prefix + Date.now()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureUniqueSlug(supabase: any, baseSlug: string): Promise<string> {
  const { data } = await supabase.from('posts').select('slug').eq('slug', baseSlug)
  if (!data || data.length === 0) return baseSlug
  for (let i = 2; i < 100; i++) {
    const candidate = baseSlug + '-' + i
    const { data: check } = await supabase.from('posts').select('slug').eq('slug', candidate)
    if (!check || check.length === 0) return candidate
  }
  return baseSlug + '-' + Date.now()
}

function deduplicateContent(html: string): string {
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)]
  const seen = new Set<string>()
  for (const m of h2s) {
    const text = m[1].trim()
    if (seen.has(text)) {
      const dupIdx = html.indexOf(m[0], html.indexOf(m[0]) + m[0].length)
      if (dupIdx > 0) {
        console.log('[THAI] Removed duplicate H2 at char ' + dupIdx)
        return html.substring(0, dupIdx).trim()
      }
    }
    seen.add(text)
  }
  return html
}

// ============================================================
// POST Handler
// ============================================================

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
    const { keyword, category, searchIntent: manualIntent } = body as {
      keyword: string
      category?: string
      searchIntent?: SearchIntent
    }

    const effectiveKeyword = keyword || (body as { topic?: string }).topic
    if (!effectiveKeyword) {
      return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
    }

    // 0. Duplicate check
    const existingSlug = isKeywordPosted(effectiveKeyword)
    if (existingSlug) {
      return NextResponse.json(
        { error: '이미 발행된 키워드입니다: "' + effectiveKeyword + '" → /posts/' + existingSlug, existingSlug },
        { status: 409 }
      )
    }

    // 1. Classify intent
    const intent = manualIntent || classifySearchIntent(effectiveKeyword)
    console.log('[THAI] Keyword: "' + effectiveKeyword + '" | Intent: ' + intent)

    // 2. Fetch existing posts for internal links
    let existingPosts: ExistingPost[] = []
    try {
      const { data } = await supabase
        .from('posts')
        .select('slug, title')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(20)
      if (data) existingPosts = data
    } catch {
      console.log('[THAI] Could not fetch existing posts')
    }

    // 3. Build prompts
    const openai = new OpenAI({ apiKey: openaiApiKey })
    const systemPrompt = buildSystemPrompt(intent)
    const userMessage = buildUserMessage(intent, effectiveKeyword, existingPosts)

    // 4. Step 1: Generate HTML content
    console.log('[THAI] Step 1: Generating content...')
    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.75,
      max_tokens: 16000,
    })

    console.log('[THAI] GPT finish_reason: ' + contentCompletion.choices[0]?.finish_reason)
    let cleanContent = (contentCompletion.choices[0]?.message?.content || '').trim()
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```(?:html)?\s*/, '').replace(/\s*```$/, '')
    }

    // Refusal detection
    const isRefusal = cleanContent.length < 500 && !cleanContent.includes('<h2')
    if (isRefusal) {
      console.log('[THAI] GPT refused (' + cleanContent.length + ' chars). Retrying...')
      const retry = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 ' + SITE_CONFIG.persona + '입니다. 순수 HTML 형식의 태국 정보 블로그 글을 작성하세요. 최소 6,000자.',
          },
          {
            role: 'user',
            content: '"' + effectiveKeyword + '" 주제로 한국인을 위한 태국 정보 전문 블로그 글을 HTML로 8,000자 이상 작성하세요.',
          },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      })
      const retryContent = (retry.choices[0]?.message?.content || '').trim()
      if (retryContent) {
        cleanContent = retryContent.startsWith('```')
          ? retryContent.replace(/^```(?:html)?\s*/, '').replace(/\s*```$/, '')
          : retryContent
        console.log('[THAI] Retry result: ' + cleanContent.length + ' chars')
      }
    }

    // Deduplicate
    cleanContent = deduplicateContent(cleanContent)

    // Continuation if too short
    if (cleanContent.length < 4000 && cleanContent.includes('<h2')) {
      console.log('[THAI] Content short (' + cleanContent.length + ' chars), requesting continuation...')
      const existingH2s = [...cleanContent.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map(m => m[1].trim())
      const contCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '아래 태국 정보 블로그 글에 <h3> 소제목을 추가하여 보강하세요. 기존 내용 반복 금지. 순수 HTML만 출력. 최소 3,000자 추가.',
          },
          {
            role: 'user',
            content: '"' + effectiveKeyword + '" 글 보강. 기존 섹션: ' + existingH2s.join(', ') + '\n\n[기존 글]\n' + cleanContent.substring(0, 3000),
          },
        ],
        temperature: 0.75,
        max_tokens: 10000,
      })
      const contContent = (contCompletion.choices[0]?.message?.content || '').trim()
      if (contContent && contContent.length > 500) {
        const lastH2Idx = cleanContent.lastIndexOf('<h2')
        if (lastH2Idx > 0) {
          cleanContent = cleanContent.substring(0, lastH2Idx) + contContent + '\n' + cleanContent.substring(lastH2Idx)
        } else {
          cleanContent += '\n' + contContent
        }
        console.log('[THAI] After continuation: ' + cleanContent.length + ' chars')
      }
    }

    cleanContent = deduplicateContent(cleanContent)

    // Final quality check
    if (cleanContent.length < 1000 || !cleanContent.includes('<h2')) {
      console.error('[THAI] Content invalid (' + cleanContent.length + ' chars). Aborting.')
      return NextResponse.json(
        { error: '콘텐츠 생성 실패 (' + cleanContent.length + '자). 다시 시도해주세요.' },
        { status: 422 }
      )
    }

    console.log('[THAI] Step 1 complete: ' + cleanContent.length + ' chars')

    // 5. Step 2: Generate metadata
    console.log('[THAI] Step 2: Generating metadata...')
    const metaCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'SEO 전문가. 블로그 글을 분석하여 메타데이터를 JSON으로 생성하세요.' },
        {
          role: 'user',
          content: '키워드: "' + effectiveKeyword + '"\n\n글 앞부분:\n' + cleanContent.substring(0, 2000) + '\n\n아래 JSON 형식으로 정확히 출력:\n{\n  "title": "SEO 최적화 제목 (40~55자, 핵심 키워드 포함)",\n  "description": "150~160자 메타 설명",\n  "tags": ["태그1","태그2","태그3","태그4","태그5"],\n  "seo_keywords": ["메인키워드","서브키워드1","서브키워드2","롱테일1","롱테일2"],\n  "faq": [\n    {"question":"질문1","answer":"답변 (3~5문장)"},\n    {"question":"질문2","answer":"답변"},\n    {"question":"질문3","answer":"답변"},\n    {"question":"질문4","answer":"답변"},\n    {"question":"질문5","answer":"답변"}\n  ]\n}',
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    let meta: Record<string, unknown> = {}
    try {
      meta = JSON.parse(metaCompletion.choices[0]?.message?.content || '{}')
    } catch {
      console.error('[THAI] Failed to parse metadata')
    }

    console.log('[THAI] Step 2 complete. Title: ' + (meta.title as string))

    // 6. Generate slug
    const baseSlug = await generateSlug(effectiveKeyword, SITE_CONFIG.slugPrefix)
    const slug = await ensureUniqueSlug(supabase, baseSlug)

    // 7. Word count
    const wordCount = cleanContent
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((w: string) => w.length > 0).length

    // 8. Build post data
    const postData = {
      title: (meta.title as string) || effectiveKeyword + ' - ' + SITE_CONFIG.siteName,
      slug,
      description:
        (meta.description as string) ||
        effectiveKeyword + '에 대한 태국 생활 가이드',
      content: cleanContent,
      featured_image: null,
      coupang_url: null,
      coupang_product_id: null,
      product_name: null,
      product_price: null,
      category: category || '기타',
      tags: Array.isArray(meta.tags)
        ? [...(meta.tags as string[]), 'thai-generated']
        : ['thai-generated'],
      seo_keywords: Array.isArray(meta.seo_keywords) ? meta.seo_keywords : [],
      faq: Array.isArray(meta.faq) ? meta.faq : [],
      word_count: wordCount,
      is_published: true,
      published_at: new Date().toISOString(),
    }

    // 9. Insert into Supabase
    const { data, error } = await supabase.from('posts').insert(postData).select().single()
    if (error) {
      console.error('[THAI] Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[THAI] Post created: ' + data.title + ' (slug: ' + data.slug + ')')

    // 10. Track keyword in CSV
    markKeywordPosted(effectiveKeyword, data.slug)

    return NextResponse.json(
      {
        post: data,
        intent,
        message: '태국 정보 포스트가 성공적으로 생성되었습니다.',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[THAI] API error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
