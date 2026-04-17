import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 - 태국라이프',
  description: '태국라이프 사이트의 개인정보처리방침입니다.',
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">시행일: {new Date().getFullYear()}년 1월 1일</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
              <p>
                태국라이프(이하 &quot;본 사이트&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>웹사이트 이용 통계 분석</li>
                <li>서비스 개선 및 맞춤 서비스 제공</li>
                <li>문의 응대 및 고객 지원</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. 수집하는 개인정보 항목</h2>
              <p>본 사이트는 다음과 같은 개인정보를 수집할 수 있습니다:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>자동 수집 항목: IP 주소, 쿠키, 방문 기록, 서비스 이용 기록</li>
                <li>문의 시 수집 항목: 이메일 주소, 문의 내용</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <p>
                본 사이트는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
                동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>웹사이트 이용 기록: 1년</li>
                <li>문의 내역: 3년</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. 쿠키(Cookie)의 사용</h2>
              <p>
                본 사이트는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.
                쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에게 보내는 작은 텍스트 파일로
                이용자의 컴퓨터에 저장됩니다.
              </p>
              <p className="mt-2">
                이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹브라우저에서 옵션을 설정함으로써
                모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. 제3자 서비스</h2>
              <p>본 사이트는 다음과 같은 제3자 서비스를 이용합니다:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Google Analytics: 웹사이트 트래픽 분석</li>
                <li>Google AdSense: 광고 서비스 제공</li>
              </ul>
              <p className="mt-2">
                이러한 서비스들은 자체 개인정보처리방침에 따라 데이터를 수집하고 처리합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. 정보주체의 권리</h2>
              <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. 개인정보 보호책임자</h2>
              <p>
                본 사이트는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
                아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <p className="mt-2">
                문의사항이 있으시면 <Link href="/contact" className="text-green-600 hover:underline">문의하기</Link> 페이지를 통해 연락해 주시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. 개인정보처리방침의 변경</h2>
              <p>
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <nav className="flex justify-center gap-4 text-sm text-gray-500 mb-4">
            <Link href="/privacy" className="text-green-600 font-medium">
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
