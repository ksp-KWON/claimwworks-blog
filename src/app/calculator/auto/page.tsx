import Link from "next/link";
import AutoCalculatorContainer from "@/components/calculator/auto/AutoCalculatorContainer";

export const metadata = {
  title: '자동차보험 합의금 계산기 | 보상스쿨',
  description: '약관 지급기준(부상, 장해, 사망) 및 호프만계수를 적용한 정확한 예상 합의금을 확인하세요.',
};

export default function AutoCalculatorPage() {
  return (
    <>
      <div className="mb-6">
        <nav className="flex text-sm text-[#5f6368] dark:text-[#9aa0a6]" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-[var(--google-blue)] transition-colors">홈</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/calculator" className="hover:text-[var(--google-blue)] transition-colors">계산기 홈</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-[#202124] dark:text-[#e8eaed] font-medium" aria-current="page">자동차보험 합의금 계산기</li>
          </ol>
        </nav>
      </div>

      <article className="w-full bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e8f0fe] dark:bg-[#8ab4f8]/20 text-[var(--google-blue)] dark:text-[#8ab4f8] mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight mb-4">
            자동차보험 합의금 계산기
          </h1>
          <p className="text-[#5f6368] dark:text-[#9aa0a6] max-w-2xl mx-auto leading-relaxed">
            대인배상 약관 기준에 따라 <strong>부상, 후유장해, 사망</strong> 피해에 대한 예상 합의금을 정확하게 산출합니다. 향후치료비 및 직불영수증 상계 로직이 포함되어 있습니다.
          </p>
        </header>

        <div className="relative w-full mx-auto">
          {/* 가상의 기기/스마트폰(태블릿 가로모드) 프레임 */}
          <div className="bg-[#f0f0f0] dark:bg-[#2c2d30] rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#e0e0e0] dark:border-[#3a3b3e]">
            {/* 내부 스크린 */}
            <div className="bg-white dark:bg-[#202124] rounded-[16px] sm:rounded-[24px] overflow-hidden flex flex-col h-full border border-gray-200 dark:border-[#424346] shadow-inner">
              
              {/* 상단 앱 상태바 / 맥OS 스타일 버튼 */}
              <div className="bg-[#f8f9fa] dark:bg-[#303134] px-4 py-3 border-b border-gray-200 dark:border-[#424346] flex items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
                </div>
                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                  BOSANG SCHOOL PRO
                </div>
                <div className="w-10"></div> {/* 우측 여백 맞춤용 */}
              </div>

              {/* 실제 계산기 렌더링 컨테이너 (세로폭 제한, 가로모드 느낌) */}
              <div className="p-1 sm:p-2 overflow-y-auto h-[450px] sm:h-[500px] custom-scrollbar bg-gray-50 dark:bg-black/20">
                <AutoCalculatorContainer />
              </div>

            </div>
          </div>
        </div>

      </article>
    </>
  );
}
