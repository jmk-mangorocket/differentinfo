import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 - 태국라이프',
  description: '태국라이프 사이트의 이용약관입니다.',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">시행일: {new Date().getFullYear()}년 1월 1일</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제1조 (목적)</h2>
              <p>
                이 약관은 태국라이프(이하 &quot;본 사이트&quot;)가 제공하는 서비스의 이용조건 및 절차,
                이용자와 본 사이트의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제2조 (정의)</h2>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>&quot;서비스&quot;란 본 사이트가 제공하는 태국어 학습 관련 가이드, 발음, 문법, 회화 콘텐츠 등 일체의 서비스를 말합니다.</li>
                <li>&quot;이용자&quot;란 본 사이트에 접속하여 이 약관에 따라 본 사이트가 제공하는 서비스를 이용하는 자를 말합니다.</li>
                <li>&quot;콘텐츠&quot;란 본 사이트가 제공하는 글, 이미지, 영상 등 모든 형태의 정보를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제3조 (약관의 효력과 변경)</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</li>
                <li>본 사이트는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 약관이 변경된 경우에는 지체 없이 이를 공지합니다.</li>
                <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제4조 (서비스의 제공)</h2>
              <p>본 사이트는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>태국라이프 및 정보 제공</li>
                <li>제품 비교 및 추천 정보</li>
                <li>기타 본 사이트가 정하는 서비스</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제5조 (서비스의 중단)</h2>
              <p>
                본 사이트는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
                서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제6조 (저작권의 귀속)</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>본 사이트가 작성한 저작물에 대한 저작권 기타 지적재산권은 본 사이트에 귀속합니다.</li>
                <li>이용자는 본 사이트의 서비스를 이용함으로써 얻은 정보를 본 사이트의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제7조 (이용자의 의무)</h2>
              <p>이용자는 다음 행위를 하여서는 안됩니다:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>타인의 정보 도용</li>
                <li>본 사이트의 운영을 방해하는 행위</li>
                <li>본 사이트의 정보를 무단으로 변경하거나 삭제하는 행위</li>
                <li>본 사이트에 게시된 정보를 무단으로 상업적으로 이용하는 행위</li>
                <li>기타 관계법령에 위반되는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제8조 (면책조항)</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>본 사이트는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>본 사이트는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                <li>본 사이트에서 제공하는 정보는 참고용이며, 이를 기반으로 한 구매 결정 등에 대해서는 이용자 본인의 책임입니다.</li>
                <li>본 사이트는 이용자가 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에 관하여는 책임을 지지 않습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제9조 (광고 및 제휴)</h2>
              <p>
                본 사이트는 서비스 운영을 위해 광고를 게재할 수 있으며, 이용자는 서비스 이용 시 노출되는 광고 게재에 동의합니다.
                광고를 통해 연결되는 외부 사이트의 콘텐츠에 대해서는 본 사이트가 책임지지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">제10조 (분쟁 해결)</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>본 사이트와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용합니다.</li>
                <li>서비스 이용 중 발생한 분쟁에 대해 소송이 제기될 경우, 본 사이트 소재지를 관할하는 법원을 전속관할법원으로 합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">부칙</h2>
              <p>이 약관은 {new Date().getFullYear()}년 1월 1일부터 시행합니다.</p>
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
            <Link href="/terms" className="text-green-600 font-medium">
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
