import AutoCalculator from "@/components/calculator/AutoCalculator";
import MedicalCalculator from "@/components/calculator/MedicalCalculator";

export const metadata = {
  title: '예상 보상금 계산기 | 보상스쿨',
  description: '자동차보험 합의금, 실손의료비 등 숨은 보상금을 직접 진단해 보고 전문가의 조력을 받아보세요.',
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl pt-8 pb-20 px-2 sm:px-5">
      {/* 포스팅 박스 (Blog Post 스타일 컨테이너) */}
      <article className="w-full max-w-4xl mx-auto bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-10 lg:p-12 border border-[var(--google-border)] shadow-sm">
        
        {/* 1. 페이지 헤더 */}
        <header className="border-b border-[var(--google-border)] pb-8 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--google-surface-variant)] text-[var(--google-blue)] dark:bg-[#303134] dark:text-[#8ab4f8] text-xs font-bold mb-4 border border-[var(--google-blue)]/20">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            보상스쿨 종합 보상 센터
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight leading-snug">
            스마트 예상 보상금 계산기
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed font-normal">
            교통사고 합의금부터 실손의료비까지, 숨어있는 내 보상금을 클릭 몇 번으로 진단해 보세요. 보상스쿨의 축적된 전문 데이터를 바탕으로 약관 기준에 맞게 산출됩니다.
          </p>
        </header>

        {/* 2. 자동차보험 합의금 계산기 */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] dark:text-[#e8eaed] mb-6 flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[var(--google-blue)] rounded-full inline-block shrink-0" />
            🚗 자동차보험 합의금 계산기
          </h2>
          <AutoCalculator />
        </section>

        {/* 구분선 */}
        <div className="my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--google-border)] to-transparent" />
          <span className="text-[var(--google-border)] text-xs">✦</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--google-border)] to-transparent" />
        </div>

        {/* 3. 실손의료비 계산기 */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] dark:text-[#e8eaed] mb-6 flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[var(--google-green)] rounded-full inline-block shrink-0" />
            🏥 실손의료비 보상 계산기
          </h2>
          <MedicalCalculator />
        </section>

      </article>
    </div>
  );
}
