import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '문의하기 - 태국라이프',
  description: '태국라이프에 문의사항이 있으시면 연락해 주세요.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-green-600 hover:text-green-700 text-sm">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">문의하기</h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-8">
              태국라이프에 관심을 가져주셔서 감사합니다.
              문의사항, 제안, 피드백이 있으시면 아래 방법으로 연락해 주세요.
            </p>

            <section className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">연락처 정보</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">이메일</h3>
                    <p className="text-gray-600">mangorocket.official@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">영업일 기준 1-2일 내에 답변드리겠습니다.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">문의 유형</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">일반 문의</h3>
                  <p className="text-sm text-gray-600">
                    사이트 이용, 콘텐츠 관련 질문 등 일반적인 문의사항
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">광고 및 제휴</h3>
                  <p className="text-sm text-gray-600">
                    광고 게재, 비즈니스 제휴 관련 문의
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">콘텐츠 제안</h3>
                  <p className="text-sm text-gray-600">
                    다뤄주셨으면 하는 주제나 콘텐츠 제안
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">오류 신고</h3>
                  <p className="text-sm text-gray-600">
                    사이트 오류, 잘못된 정보 등 문제 신고
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">문의 시 참고사항</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>문의 내용을 구체적으로 작성해 주시면 더 빠르고 정확한 답변이 가능합니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>오류 신고 시 스크린샷이나 발생 상황을 함께 알려주시면 도움이 됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>광고 및 제휴 문의는 회사 정보와 제안 내용을 포함해 주세요.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <nav className="flex justify-center gap-4 text-sm text-gray-500 mb-4">
            <Link href="/privacy" className="hover:text-green-600 transition-colors">
              개인정보처리방침
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="hover:text-green-600 transition-colors">
              이용약관
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-green-600 font-medium">
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
