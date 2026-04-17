'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50">에디터 로딩 중...</div>,
})

interface FaqItem {
  question: string
  answer: string
}

interface Post {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  featured_image: string | null
  coupang_url: string | null
  coupang_product_id: string | null
  product_name: string | null
  product_price: number | null
  category: string
  tags: string[] | null
  seo_keywords: string[] | null
  faq: FaqItem[] | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

type PostFormData = {
  title: string
  slug: string
  description: string
  content: string
  featured_image: string
  coupang_url: string
  coupang_product_id: string
  product_name: string
  product_price: string
  category: string
  tags: string
  seo_keywords: string
  faq: FaqItem[]
  is_published: boolean
}

const DEFAULT_CATEGORIES = [
  '태국사업',
  '태국생활',
  '태국어공부',
  '창업·법인',
  '비자·체류',
  '투자·부동산',
  '주거·음식',
  '의료·건강',
  '발음·문법',
  '기타',
]

const INFO_TOPICS = [
  // 태국사업
  '태국 창업 방법 총정리',
  '태국 법인 설립 절차와 비용',
  '태국 비자 종류 비교',
  '태국 부동산 투자 가이드',
  // 태국생활
  '방콕 한국인 생활 적응 팁',
  '태국 병원 이용 방법',
  '태국 콘도 렌트 구하기',
  '태국 음식 문화 완벽 정리',
  // 태국어공부
  '태국어 성조 배우는 방법',
  '태국어 여행 필수 회화 50가지',
]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoTopic, setInfoTopic] = useState('')
  const [generatingInfo, setGeneratingInfo] = useState(false)
  const [showRagModal, setShowRagModal] = useState(false)
  const [ragKeyword, setRagKeyword] = useState('')
  const [ragCategory, setRagCategory] = useState('태국사업')
  const [ragIntent, setRagIntent] = useState('')
  const [generatingRag, setGeneratingRag] = useState(false)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)

  // Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [editingCategoryValue, setEditingCategoryValue] = useState('')

  const emptyForm: PostFormData = {
    title: '',
    slug: '',
    description: '',
    content: '',
    featured_image: '',
    coupang_url: '',
    coupang_product_id: '',
    product_name: '',
    product_price: '',
    category: categories[0] || '기타',
    tags: '',
    seo_keywords: '',
    faq: [],
    is_published: false,
  }

  const [formData, setFormData] = useState<PostFormData>(emptyForm)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Load posts and settings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPosts()
      loadSettings()
    }
  }, [isAuthenticated])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.')
      }

      setIsAuthenticated(true)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setPosts([])
    } catch {
      // Ignore logout errors
    }
  }

  async function loadPosts() {
    try {
      setLoading(true)
      const res = await fetch('/api/posts')

      // Check if response is ok before parsing JSON
      const text = await res.text()
      if (!text) {
        throw new Error('Empty response from server. Check SUPABASE_SERVICE_KEY environment variable.')
      }

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load posts')
      }

      setPosts(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  async function loadSettings() {
    try {
      setSettingsLoading(true)
      const res = await fetch('/api/settings')
      const data = await res.json()

      if (res.ok && data.settings) {
        setCategories(data.settings.categories || DEFAULT_CATEGORIES)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
      // Keep default categories on error
    } finally {
      setSettingsLoading(false)
    }
  }

  async function saveSettings() {
    setSettingsSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('설정이 저장되었습니다!')
      setShowSettingsModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  function addCategory() {
    if (!newCategory.trim()) return
    if (categories.includes(newCategory.trim())) {
      setError('이미 존재하는 카테고리입니다.')
      return
    }
    setCategories([...categories, newCategory.trim()])
    setNewCategory('')
  }

  function removeCategory(index: number) {
    if (categories.length <= 1) {
      setError('최소 1개의 카테고리가 필요합니다.')
      return
    }
    setCategories(categories.filter((_, i) => i !== index))
  }

  function startEditCategory(index: number) {
    setEditingCategoryIndex(index)
    setEditingCategoryValue(categories[index])
  }

  function saveEditCategory() {
    if (editingCategoryIndex === null) return
    if (!editingCategoryValue.trim()) return

    const newCategories = [...categories]
    newCategories[editingCategoryIndex] = editingCategoryValue.trim()
    setCategories(newCategories)
    setEditingCategoryIndex(null)
    setEditingCategoryValue('')
  }

  function cancelEditCategory() {
    setEditingCategoryIndex(null)
    setEditingCategoryValue('')
  }

  function moveCategory(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    const newCategories = [...categories]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]]
    setCategories(newCategories)
  }

  // Generate next available slug number
  function getNextSlugNumber(): number {
    const thaiSlugs = posts
      .map(p => p.slug)
      .filter(s => /^thai-\d+$/.test(s))
      .map(s => parseInt(s.replace('thai-', ''), 10))
      .filter(n => !isNaN(n))

    if (thaiSlugs.length === 0) return 1
    return Math.max(...thaiSlugs) + 1
  }

  function generateSlug(): string {
    return `thai-${getNextSlugNumber()}`
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug only for new posts (not editing)
      slug: prev.slug || generateSlug(),
    }))
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleFaqChange(index: number, field: 'question' | 'answer', value: string) {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  function addFaq() {
    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }],
    }))
  }

  function removeFaq(index: number) {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }))
  }

  function startNewPost() {
    setEditingPost(null)
    setFormData({
      ...emptyForm,
      slug: generateSlug(), // Auto-generate slug for new post
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  function startEditPost(post: Post) {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      description: post.description || '',
      content: post.content,
      featured_image: post.featured_image || '',
      coupang_url: post.coupang_url || '',
      coupang_product_id: post.coupang_product_id || '',
      product_name: post.product_name || '',
      product_price: post.product_price?.toString() || '',
      category: post.category,
      tags: post.tags?.join(', ') || '',
      seo_keywords: post.seo_keywords?.join(', ') || '',
      faq: post.faq || [],
      is_published: post.is_published,
    })
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  function cancelEdit() {
    setShowForm(false)
    setEditingPost(null)
    setFormData(emptyForm)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const seoKeywords = formData.seo_keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)

      const postBody = {
        ...(editingPost && { id: editingPost.id }),
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        content: formData.content,
        featured_image: formData.featured_image || null,
        coupang_url: formData.coupang_url || null,
        coupang_product_id: formData.coupang_product_id || null,
        product_name: formData.product_name || null,
        product_price: formData.product_price ? Number(formData.product_price) : null,
        category: formData.category,
        tags,
        seo_keywords: seoKeywords,
        faq: formData.faq.filter(f => f.question && f.answer),
        is_published: formData.is_published,
      }

      const res = await fetch('/api/posts', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save post')
      }

      setSuccess(editingPost ? '포스트가 수정되었습니다!' : '포스트가 생성되었습니다!')
      await loadPosts()
      setShowForm(false)
      setEditingPost(null)
      setFormData(emptyForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const res = await fetch(`/api/posts?id=${post.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete post')
      }

      setSuccess('포스트가 삭제되었습니다!')
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  async function handleGenerateInfoPost() {
    if (!infoTopic.trim()) {
      setError('주제를 입력해주세요')
      return
    }

    setError(null)
    setSuccess(null)
    setGeneratingInfo(true)

    try {
      const res = await fetch('/api/generate-lang-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: infoTopic }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate info post')
      }

      setSuccess(`정보 포스트가 생성되었습니다: ${data.post.title}`)
      setShowInfoModal(false)
      setInfoTopic('')
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate info post')
    } finally {
      setGeneratingInfo(false)
    }
  }

  async function handleGenerateRagPost() {
    if (!ragKeyword.trim()) {
      setError('키워드를 입력해주세요')
      return
    }

    setError(null)
    setSuccess(null)
    setGeneratingRag(true)

    try {
      const res = await fetch('/api/generate-rag-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: ragKeyword,
          category: ragCategory,
          searchIntent: ragIntent || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate RAG post')
      }

      const info = data.ragInfo
      setSuccess(`RAG 포스트 생성 완료: ${data.post.title} (${data.post.content?.length || 0}자, 제품 ${info?.scrapedProductsIncluded || 0}개)`)
      setShowRagModal(false)
      setRagKeyword('')
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate RAG post')
    } finally {
      setGeneratingRag(false)
    }
  }

  // Image upload function for editor
  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    return data.url
  }

  // Handle thumbnail upload
  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 가능)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    setThumbnailUploading(true)
    setError(null)

    try {
      const url = await uploadImage(file)
      setFormData(prev => ({
        ...prev,
        featured_image: url,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '썸네일 업로드에 실패했습니다.')
    } finally {
      setThumbnailUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  // Remove thumbnail
  function removeThumbnail() {
    setFormData(prev => ({
      ...prev,
      featured_image: '',
    }))
  }

  // Handle content change from editor
  function handleContentChange(html: string) {
    setFormData(prev => ({
      ...prev,
      content: html,
    }))
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
            <p className="text-gray-600 mt-2">관리자 페이지에 접근하려면 로그인하세요.</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="admin@admin.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="비밀번호"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-green-600">
              ← 블로그로 돌아가기
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
              <p className="text-gray-600 mt-1">포스트 작성 및 관리</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                블로그로 돌아가기
              </a>
              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  정보 포스트 생성
                </button>
              ) : null}
              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowRagModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  RAG 글 생성
                </button>
              ) : null}
              {!showForm ? (
                <button
                  type="button"
                  onClick={startNewPost}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  글쓰기
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                설정
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Post Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">정보 포스트 생성</h2>
              <button
                onClick={() => {
                  setShowInfoModal(false)
                  setInfoTopic('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              AI가 태국어 학습 포스트를 자동으로 작성합니다. 키워드를 입력하거나 추천 주제를 선택하세요.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주제 입력
              </label>
              <input
                type="text"
                value={infoTopic}
                onChange={(e) => setInfoTopic(e.target.value)}
                placeholder="예: 태국어 성조 배우는 방법"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={generatingInfo}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추천 주제
              </label>
              <div className="flex flex-wrap gap-2">
                {INFO_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setInfoTopic(topic)}
                    disabled={generatingInfo}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      infoTopic === topic
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerateInfoPost}
                disabled={generatingInfo || !infoTopic.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingInfo ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    생성 중...
                  </span>
                ) : (
                  '생성하기'
                )}
              </button>
              <button
                onClick={() => {
                  setShowInfoModal(false)
                  setInfoTopic('')
                }}
                disabled={generatingInfo}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAG Post Modal */}
      {showRagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">RAG 글 생성</h2>
              <button
                onClick={() => {
                  setShowRagModal(false)
                  setRagKeyword('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              RAG + 쿠팡 파트너스 제휴링크가 포함된 전문 블로그 글을 자동 생성합니다.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키워드 *
              </label>
              <input
                type="text"
                value={ragKeyword}
                onChange={(e) => setRagKeyword(e.target.value)}
                placeholder="예: 신생아 기저귀 추천"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={generatingRag}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={ragCategory}
                onChange={(e) => setRagCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={generatingRag}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                검색 의도 (선택)
              </label>
              <select
                value={ragIntent}
                onChange={(e) => setRagIntent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={generatingRag}
              >
                <option value="">자동 감지</option>
                <option value="symptom_worry">고민/걱정</option>
                <option value="purchase_compare">제품 비교/구매</option>
                <option value="understanding">원인/이해</option>
                <option value="cost_decision">비용/가격</option>
                <option value="how_to">방법/가이드</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추천 키워드
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  '신생아 기저귀 추천',
                  '이유식 시작 시기',
                  '아기 수면교육 방법',
                  '유모차 추천 비교',
                  '아기 로션 추천',
                  '출산 준비물 리스트',
                  '아기 발열 대처법',
                  '분유 추천 비교',
                ].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setRagKeyword(kw)}
                    disabled={generatingRag}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      ragKeyword === kw
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerateRagPost}
                disabled={generatingRag || !ragKeyword.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingRag ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    생성 중... (약 1~2분)
                  </span>
                ) : (
                  'RAG 글 생성하기'
                )}
              </button>
              <button
                onClick={() => {
                  setShowRagModal(false)
                  setRagKeyword('')
                }}
                disabled={generatingRag}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">블로그 설정</h2>
              <button
                onClick={() => {
                  setShowSettingsModal(false)
                  setNewCategory('')
                  setEditingCategoryIndex(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {settingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">설정 로딩 중...</p>
              </div>
            ) : (
              <>
                {/* Category Management */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">카테고리 관리</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    카테고리를 추가, 수정, 삭제하거나 순서를 변경할 수 있습니다.
                  </p>

                  {/* Add new category */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="새 카테고리 이름"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCategory()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      추가
                    </button>
                  </div>

                  {/* Category list */}
                  <div className="space-y-2">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        {editingCategoryIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={editingCategoryValue}
                              onChange={(e) => setEditingCategoryValue(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  saveEditCategory()
                                } else if (e.key === 'Escape') {
                                  cancelEditCategory()
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={saveEditCategory}
                              className="p-1 text-green-600 hover:text-green-700"
                              title="저장"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditCategory}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="취소"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-gray-700">{cat}</span>
                            <button
                              type="button"
                              onClick={() => moveCategory(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="위로"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCategory(index, 'down')}
                              disabled={index === categories.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="아래로"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditCategory(index)}
                              className="p-1 text-blue-500 hover:text-blue-700"
                              title="수정"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCategory(index)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="삭제"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save/Cancel buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={saveSettings}
                    disabled={settingsSaving}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {settingsSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        저장 중...
                      </span>
                    ) : (
                      '저장하기'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false)
                      setNewCategory('')
                      setEditingCategoryIndex(null)
                      // Reload settings to discard changes
                      loadSettings()
                    }}
                    disabled={settingsSaving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingPost ? '포스트 수정' : '새 포스트 작성'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="포스트 제목을 입력하세요"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 (URL) <span className="text-green-600">(자동 생성)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="thai-1"
                />
                <p className="mt-1 text-xs text-gray-500">URL: /posts/{formData.slug || 'thai-X'}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="포스트에 대한 간략한 설명"
                />
              </div>

              {/* Content - WYSIWYG Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용 <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={handleContentChange}
                  onImageUpload={uploadImage}
                  placeholder="내용을 입력하세요. 이미지는 툴바 버튼, 드래그&드롭, 또는 붙여넣기로 삽입할 수 있습니다."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지
                </label>

                {/* Thumbnail Preview */}
                {formData.featured_image && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={formData.featured_image}
                      alt="썸네일 미리보기"
                      className="max-w-xs max-h-48 rounded-lg border border-gray-300 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      title="썸네일 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <label className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${thumbnailUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {thumbnailUploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-gray-600">업로드 중...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">이미지 업로드</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleThumbnailUpload}
                      disabled={thumbnailUploading}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500">또는</span>
                </div>

                {/* URL Input */}
                <div className="mt-2">
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="이미지 URL 직접 입력 (https://example.com/image.jpg)"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG, GIF, WebP 형식 (최대 5MB)
                </p>
              </div>

              {/* Product Info Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 정보</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="상품명"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품 가격 (원)
                    </label>
                    <input
                      type="number"
                      name="product_price"
                      value={formData.product_price}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="199000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      쿠팡 상품 ID
                    </label>
                    <input
                      type="text"
                      name="coupang_product_id"
                      value={formData.coupang_product_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      쿠팡 링크 URL
                    </label>
                    <input
                      type="url"
                      name="coupang_url"
                      value={formData.coupang_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://www.coupang.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO 설정</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      태그 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="태국어, 발음, 성조"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO 키워드 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      name="seo_keywords"
                      value={formData.seo_keywords}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="태국어 성조 배우는 방법, 태국어 발음 연습"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">FAQ</h3>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    + FAQ 추가
                  </button>
                </div>

                {formData.faq.map((faq, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">FAQ #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={e => handleFaqChange(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="질문"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={e => handleFaqChange(index, 'answer', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="답변"
                    />
                  </div>
                ))}
              </div>

              {/* Publish Checkbox */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">즉시 게시</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  체크하면 저장 즉시 블로그에 공개됩니다
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '저장 중...' : editingPost ? '수정하기' : '저장하기'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              포스트 목록 ({posts.length}개)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              아직 작성된 포스트가 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {posts.map(post => (
                <div key={post.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            post.is_published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {post.is_published ? '게시됨' : '임시저장'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        /{post.slug} · {post.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')} 생성
                        {post.updated_at !== post.created_at && (
                          <> · {new Date(post.updated_at).toLocaleDateString('ko-KR')} 수정</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {post.is_published ? (
                        <a
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          보기
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => startEditPost(post)}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
