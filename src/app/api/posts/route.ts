import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { FaqItem } from '@/types/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Create admin client with service role key (untyped for flexibility)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Simple admin key check (you can replace with proper auth later)
function isAuthorized(request: NextRequest): boolean {
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_SECRET_KEY

  // If no ADMIN_SECRET_KEY is set, allow access (for development)
  if (!expectedKey) return true

  return adminKey === expectedKey
}

// GET - List all posts (including unpublished)
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    if (!supabase) {
      return NextResponse.json({
        error: 'Missing Supabase configuration. Please set SUPABASE_SERVICE_KEY environment variable.',
        debug: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
        }
      }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: data || [] })
  } catch (err) {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.slug || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content, category' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Calculate word count
    const contentText = String(body.content || '')
    const wordCount = contentText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim()
      .split(' ')
      .filter((word: string) => word.length > 0).length

    const postData = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      content: body.content,
      featured_image: body.featured_image || null,
      coupang_url: body.coupang_url || null,
      coupang_product_id: body.coupang_product_id || null,
      product_name: body.product_name || null,
      product_price: body.product_price ? Number(body.product_price) : null,
      category: body.category,
      tags: body.tags || [],
      seo_keywords: body.seo_keywords || [],
      faq: body.faq || [],
      word_count: wordCount,
      is_published: Boolean(body.is_published),
      published_at: body.is_published ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT - Update an existing post
export async function PUT(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Calculate word count if content is updated
    let wordCount: number | undefined = undefined
    if (body.content) {
      const contentText = String(body.content)
      wordCount = contentText
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter((word: string) => word.length > 0).length
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are provided
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.content !== undefined) {
      updateData.content = body.content
      updateData.word_count = wordCount
    }
    if (body.featured_image !== undefined) updateData.featured_image = body.featured_image || null
    if (body.coupang_url !== undefined) updateData.coupang_url = body.coupang_url || null
    if (body.coupang_product_id !== undefined) updateData.coupang_product_id = body.coupang_product_id || null
    if (body.product_name !== undefined) updateData.product_name = body.product_name || null
    if (body.product_price !== undefined) updateData.product_price = body.product_price ? Number(body.product_price) : null
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.seo_keywords !== undefined) updateData.seo_keywords = body.seo_keywords
    if (body.faq !== undefined) updateData.faq = body.faq as FaqItem[]
    if (body.is_published !== undefined) {
      updateData.is_published = Boolean(body.is_published)
      // Set published_at when first published
      if (body.is_published && !body.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post: data })
  } catch (err) {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Delete a post
export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
