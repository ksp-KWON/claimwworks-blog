import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="w-full bg-[var(--background)] dark:bg-[#202124] rounded-2xl p-6 sm:p-10 lg:p-12 border border-[var(--google-border)]">
      
      {/* 1. 소개 헤더 */}
      <header className="border-b border-[var(--google-border)] pb-6 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--google-surface-variant)] text-[#5f6368] dark:bg-[#303134] dark:text-[#9aa0a6] text-xs font-bold mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          플랫폼 소개
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-[#e8eaed] tracking-tight leading-snug">
          보상스쿨 헬스케어 & 손해사정 보상가이드
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed font-normal">
          환자의 올바른 의료 권리와 정당한 보험 보상을 수호하는 프리미엄 정보 플랫폼입니다.
        </p>
      </header>

      {/* 2. 본문 내용 */}
      <div className="space-y-10 text-[#202124] dark:text-[#e8eaed] text-sm sm:text-base leading-relaxed">
        
        {/* 섹션 1: 플랫폼 소개 */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            설립 목적 및 미션
          </h2>
          <p className="break-keep font-normal text-[#5f6368] dark:text-[#9aa0a6]">
            우리는 건강보험심사평가원(HIRA)의 공개 의료 통계를 기반으로, <strong className="text-[#202124] dark:text-[#e8eaed]">상해와 질병사고로 인한 보상실무 업무를 수행하고 있는 손해사정 전문가 그룹</strong>의 현장 노하우를 융합하여 탄생했습니다.
          </p>
          <p className="break-keep font-normal text-[#5f6368] dark:text-[#9aa0a6]">
            많은 사고 피해자분들이 전문적인 지식 부족으로 인하여 제대로 치료받지 못하거나, 대기업 보험회사의 일방적인 합의 조율에 이끌려 정당한 보상을 포기하곤 합니다. 보상스쿨은 이러한 정보의 비대칭성을 해소하고, 공인·검증된 전문가가 분석한 <strong className="text-[#202124] dark:text-[#e8eaed]">거주지·근무지 등 희망 지역 내에서 본인에게 필요한 의료서비스를 받을 수 있는 지역별 의료기관 정보</strong>와 함께, 환자분들께서 건강하게 일상으로 복귀할 수 있도록 <strong className="text-[#202124] dark:text-[#e8eaed]">가장 단순하고 정확한 보상 가이드를 무료로 제공합니다.</strong>
          </p>
        </section>

        {/* 섹션 2: 3대 핵심 가치 */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--google-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            보상스쿨의 3대 약속 (E-E-A-T)
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {/* 가치 1 */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#202124] border border-[var(--google-border)]">
              <svg className="w-6 h-6 text-[var(--google-yellow)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <strong className="block text-[#202124] dark:text-[#e8eaed] text-sm mb-1.5">경험 (Experience)</strong>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed font-normal">
                실제 수천 건의 합의금 분석 및 상해 사정 사건을 현장에서 다루어 본 실무 중심의 정보를 선별 제공합니다.
              </p>
            </div>
            {/* 가치 2 */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#202124] border border-[var(--google-border)]">
              <svg className="w-6 h-6 text-[var(--google-blue)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              <strong className="block text-[#202124] dark:text-[#e8eaed] text-sm mb-1.5">전문성 (Expertise)</strong>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed font-normal">
                교통사고 자동차보험 약관 및 맥브라이드 장해 평가 등 복잡한 실무 기준을 환자 눈높이로 풀어 설명합니다.
              </p>
            </div>
            {/* 가치 3 */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#202124] border border-[var(--google-border)]">
              <svg className="w-6 h-6 text-[var(--google-green)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <strong className="block text-[#202124] dark:text-[#e8eaed] text-sm mb-1.5">신뢰성 (Trustworthiness)</strong>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed font-normal">
                공공데이터 포털의 정합성 높은 의료 통계를 근거로 작성하여 과장되거나 편향되지 않은 중립적 가치를 지향합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 섹션 3: 면책 공지 */}
        <section className="p-5 bg-[#fef7e0] dark:bg-[#e37400]/10 border border-[var(--google-yellow)] rounded-xl">
          <strong className="text-[#ea8600] dark:text-[#fde293] flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            법적 고지 및 안내 사항
          </strong>
          <p className="text-xs text-[#b06000] dark:text-[#fde293]/80 leading-relaxed font-medium break-keep">
            보상스쿨 헬스케어 & 손해사정 보상가이드에서 제공하는 모든 포스팅 및 통계 정보는 일반적인 참고용 자료입니다. 당사는 어떠한 법률적 대리 행위나 의료 진단 행위를 직접 수행하지 않습니다. 개별 사고 사건의 정확한 장해 산정 및 합의 절차는 반드시 공인된 독립손해사정사나 법률 전문가와의 1:1 정식 상담을 통해 결정하시기 바랍니다.
          </p>
        </section>

      </div>

      {/* 3. 하단 네비게이션 */}
      <footer className="mt-10 pt-6 border-t border-[var(--google-border)] text-center">
        <Link 
          href="/blog"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--google-blue)] px-6 text-xs sm:text-sm font-bold text-white hover:bg-[#1557b0] transition-colors"
        >
          실시간 보상 전문 가이드 읽기 &rarr;
        </Link>
      </footer>

    </article>
  );
}
