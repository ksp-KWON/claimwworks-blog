import Link from "next/link";
import MedicalCalculatorContainer from "@/components/calculator/medical/MedicalCalculatorContainer";

export const metadata = {
  title: '실손의료비 계산기 | 보상스쿨',
  description: '급여/비급여 병원비, 약제비 본인부담금을 공제한 예상 실손 보상금을 산출해 보세요.',
};

export default function MedicalCalculatorPage() {
  return (
    <>
      <div className="mb-6">
        <nav className="flex text-sm text-[#5f6368] dark:text-[#9aa0a6]" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-[var(--google-blue)] transition-colors">홈</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/calculator" className="hover:text-[var(--google-blue)] transition-colors">계산기 홈</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-[#202124] dark:text-[#e8eaed] font-medium" aria-current="page">실손의료비 계산기</li>
          </ol>
        </nav>
      </div>

      <article className="bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-10 shadow-sm border border-[var(--google-border)]">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e6f4ea] dark:bg-[#1e8e3e]/20 text-[var(--google-green)] dark:text-[#81c995] mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight mb-4">
            실손의료비 보상 계산기
          </h1>
          <p className="text-[#5f6368] dark:text-[#9aa0a6] max-w-2xl mx-auto leading-relaxed">
            1세대부터 4세대까지 세대별 약관이 모두 반영된 전문가용 계산기입니다. 
            영수증의 급여/비급여 금액을 입력하여 예상 보상금을 확인하세요.
          </p>
        </header>

        <MedicalCalculatorContainer />
      </article>
    </>
  );
}
