import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs border border-slate-100 dark:border-zinc-800/50">
      
      {/* 1. 소개 헤더 */}
      <header className="border-b border-slate-100 dark:border-zinc-800/80 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
          ℹ️ 플랫폼 소개
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight leading-snug">
          클레임웍스 헬스케어 보상 가이드
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
          환자의 올바른 의료 권리와 정당한 보험 보상을 수호하는 프리미엄 정보 플랫폼입니다.
        </p>
      </header>

      {/* 2. 본문 내용 */}
      <div className="space-y-10 text-slate-700 dark:text-zinc-350 text-sm sm:text-base leading-relaxed">
        
        {/* 섹션 1: 플랫폼 소개 */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🎯</span> 설립 목적 및 미션
          </h2>
          <p className="break-keep font-normal">
            우리는 건강보험심사평가원(HIRA)의 신뢰할 수 있는 <strong>병원별 비급여 통계 정보</strong>와 상해 보상 실무의 권위자인 <strong>10년 차 수석 독립손해사정사</strong>의 현장 노하우를 융합하여 탄생했습니다.
          </p>
          <p className="break-keep font-normal">
            많은 사고 피해자분들이 전문적인 지식 부족으로 인하여 제대로 치료받지 못하거나, 대기업 보험회사의 일방적인 합의 조율에 이끌려 정당한 보상을 포기하곤 합니다. 클레임웍스는 이러한 정보의 비대칭성을 해소하고 환자분들께서 건강하게 일상으로 복귀할 수 있도록 가장 단순하고 정확한 가이드를 무료로 제공합니다.
          </p>
        </section>

        {/* 섹션 2: 3대 핵심 가치 */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🛡️</span> 클레임웍스의 3대 약속 (E-E-A-T)
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {/* 가치 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50">
              <span className="text-xl block mb-2">⭐</span>
              <strong className="block text-slate-900 dark:text-zinc-200 text-sm mb-1">경험 (Experience)</strong>
              <p className="text-xs text-slate-550 dark:text-zinc-405 leading-relaxed font-normal">
                실제 수천 건의 합의금 분석 및 상해 사정 사건을 현장에서 다루어 본 실무 중심의 정보를 선별 제공합니다.
              </p>
            </div>
            {/* 가치 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50">
              <span className="text-xl block mb-2">🎓</span>
              <strong className="block text-slate-900 dark:text-zinc-200 text-sm mb-1">전문성 (Expertise)</strong>
              <p className="text-xs text-slate-550 dark:text-zinc-405 leading-relaxed font-normal">
                교통사고 자동차보험 약관 및 맥브라이드 장해 평가 등 복잡한 실무 기준을 환자 눈높이로 풀어 설명합니다.
              </p>
            </div>
            {/* 가치 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50">
              <span className="text-xl block mb-2">🤝</span>
              <strong className="block text-slate-900 dark:text-zinc-200 text-sm mb-1">신뢰성 (Trustworthiness)</strong>
              <p className="text-xs text-slate-550 dark:text-zinc-405 leading-relaxed font-normal">
                공공데이터 포털의 정합성 높은 의료 통계를 근거로 작성하여 과장되거나 편향되지 않은 중립적 가치를 지향합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 섹션 3: 면책 공지 */}
        <section className="p-5 bg-rose-50/55 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-2xl">
          <strong className="text-rose-700 dark:text-rose-400 block mb-1.5 text-xs sm:text-sm">⚠️ 법적 고지 및 안내 사항</strong>
          <p className="text-xs text-rose-650 dark:text-rose-350 leading-relaxed font-medium break-keep">
            클레임웍스 헬스케어 보상 가이드에서 제공하는 모든 포스팅 및 통계 정보는 일반적인 참고용 자료입니다. 당사는 어떠한 법률적 대리 행위나 의료 진단 행위를 직접 수행하지 않습니다. 개별 사고 사건의 정확한 장해 산정 및 합의 절차는 반드시 공인된 독립손해사정사나 법률 전문가와의 1:1 정식 상담을 통해 결정하시기 바랍니다.
          </p>
        </section>

      </div>

      {/* 3. 하단 네비게이션 */}
      <footer className="mt-10 pt-6 border-t border-slate-100 dark:border-zinc-800/80 text-center">
        <Link 
          href="/blog"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-colors"
        >
          실시간 보상 칼럼 읽으러 가기 &rarr;
        </Link>
      </footer>

    </article>
  );
}
