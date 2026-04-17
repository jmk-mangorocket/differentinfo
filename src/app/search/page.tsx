import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { searchPosts } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: '검색 결과',
  description: '태국라이프 검색 - 발음, 문법, 회화, 어휘 등 다양한 태국어 학습 콘텐츠를 검색하세요.',
  robots: {
    index: false,
    follow: true,
  },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams
  const posts = query ? await searchPosts(query) : []

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-green-600 hover:text-green-700 text-sm">
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">검색 결과</h1>

          {/* Search Form */}
          <form action="/search" method="GET" className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={query || ''}
                placeholder="검색어를 입력하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                검색
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Search Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색어를 입력해주세요.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              &quot;{query}&quot;에 대한 검색 결과가 없습니다.
            </p>
            <Link href="/" className="text-green-600 hover:text-green-700 mt-4 inline-block">
              모든 글 보기
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              &quot;{query}&quot; 검색 결과: {posts.length}개
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/posts/${post.slug}`}>
                    <div className="relative h-48 bg-gray-200">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h2 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                        {post.title}
                      </h2>
                      {post.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <Link href="/" className="text-green-600 hover:text-green-700">
            ← 모든 글 보기
          </Link>
        </div>
      </footer>
    </main>
  )
}
