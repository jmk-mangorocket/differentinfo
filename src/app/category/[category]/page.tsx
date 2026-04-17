import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostsByCategory, getCategories } from '@/lib/supabase-server'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ category: string }>
}

// Generate static paths for all categories
export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((cat) => ({
    category: cat.name,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baby-blog.vercel.app'
  const categoryUrl = `${siteUrl}/category/${encodeURIComponent(decodedCategory)}`

  return {
    title: `${decodedCategory} 카테고리`,
    description: `${decodedCategory} 관련 태국어 학습 콘텐츠 모음 — 발음, 문법, 회화, 어휘까지`,
    openGraph: {
      title: `${decodedCategory} - 태국라이프`,
      description: `${decodedCategory} 관련 태국어 학습 콘텐츠 모음`,
      type: 'website',
      url: categoryUrl,
      siteName: '태국라이프',
      locale: 'ko_KR',
    },
    alternates: {
      canonical: categoryUrl,
      languages: {
        'ko-KR': categoryUrl,
        'x-default': categoryUrl,
      },
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const posts = await getPostsByCategory(decodedCategory)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-green-600 hover:text-green-700 text-sm">
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {decodedCategory} 카테고리
          </h1>
          <p className="text-gray-600 mt-1">
            {posts.length}개의 글이 있습니다
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                      alt={`${post.title} - ${post.category} 리뷰 이미지`}
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
