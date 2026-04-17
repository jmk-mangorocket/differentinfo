import Link from 'next/link'
import Image from 'next/image'
import { getPaginatedPosts, getCategories, getPopularPosts, getAllTags } from '@/lib/supabase-server'

export const revalidate = 3600 // Revalidate every hour

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const [{ posts, totalCount, totalPages }, categories, popularPosts, tags] = await Promise.all([
    getPaginatedPosts(currentPage, 9),
    getCategories(),
    getPopularPosts(5),
    getAllTags(),
  ])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <Link href="/">태국라이프</Link>
              </h1>
              <p className="text-gray-600 mt-1">
                태국 창업·생활·언어까지 — 한국인을 위한 태국 종합 가이드
              </p>
            </div>

            {/* Search Form */}
            <form action="/search" method="GET" className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="검색..."
                className="w-48 md:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                aria-label="검색"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Category Tags */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/"
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  currentPage === 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체 ({totalCount})
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/category/${encodeURIComponent(cat.name)}`}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Posts Grid */}
          <div className="flex-1">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">아직 게시된 글이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-8 flex justify-center" aria-label="페이지 네비게이션">
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      {currentPage > 1 ? (
                        <Link
                          href={`/?page=${currentPage - 1}`}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          이전
                        </Link>
                      ) : (
                        <span className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
                          이전
                        </span>
                      )}

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {generatePageNumbers(currentPage, totalPages).map((pageNum, idx) => (
                          pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <Link
                              key={pageNum}
                              href={`/?page=${pageNum}`}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                pageNum === currentPage
                                  ? 'bg-green-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </Link>
                          )
                        ))}
                      </div>

                      {/* Next Button */}
                      {currentPage < totalPages ? (
                        <Link
                          href={`/?page=${currentPage + 1}`}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          다음
                        </Link>
                      ) : (
                        <span className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
                          다음
                        </span>
                      )}
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-6">
            {/* Popular Posts Section */}
            {popularPosts.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"/>
                  </svg>
                  인기 글
                </h2>
                <nav aria-label="인기 게시물">
                  <ul className="space-y-3">
                    {popularPosts.map((post, index) => (
                      <li key={post.id}>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="flex items-start gap-3 group"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors line-clamp-2">
                            {post.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </section>
            )}

            {/* Category Navigation */}
            {categories.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  카테고리
                </h2>
                <nav aria-label="카테고리 네비게이션">
                  <ul className="space-y-2">
                    {categories.map((cat) => (
                      <li key={cat.name}>
                        <Link
                          href={`/category/${encodeURIComponent(cat.name)}`}
                          className="flex items-center justify-between text-sm text-gray-700 hover:text-green-600 transition-colors py-1"
                        >
                          <span>{cat.name}</span>
                          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                            {cat.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </section>
            )}

            {/* Tag Cloud */}
            {tags.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  인기 태그
                </h2>
                <nav aria-label="태그 클라우드" className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/search?q=${encodeURIComponent(tag.name)}`}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </nav>
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <nav className="flex justify-center gap-4 text-sm text-gray-500 mb-4">
            <Link href="/privacy" className="hover:text-green-600 transition-colors">
              개인정보처리방침
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="hover:text-green-600 transition-colors">
              이용약관
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="hover:text-green-600 transition-colors">
              문의하기
            </Link>
          </nav>
          <p className="text-center text-gray-400 text-xs">
            © {new Date().getFullYear()} 태국라이프. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

// Generate page numbers with ellipsis
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total)
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return pages
}

interface PostCardProps {
  post: {
    id: string
    slug: string
    title: string
    description: string | null
    featured_image: string | null
    category: string
    tags: string[] | null
    published_at: string | null
    product_price: number | null
  }
}

function PostCard({ post }: PostCardProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const formattedPrice = post.product_price
    ? new Intl.NumberFormat('ko-KR').format(post.product_price) + '원'
    : null

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={`${post.title} - ${post.category} 리뷰 이미지`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {/* Category Badge */}
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {post.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{formattedDate}</span>
            {formattedPrice && (
              <span className="font-semibold text-green-600">{formattedPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
