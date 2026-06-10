import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "플랫폼 소개 | 보상스쿨 헬스케어 & 손해사정 보상가이드",
  description: "보상스쿨 헬스케어 & 손해사정 보상가이드의 핵심 미션과 E-E-A-T 4대 가치를 소개합니다.",
};

export default function AboutPage() {
  return (
    <article className="w-full max-w-4xl mx-auto space-y-12 sm:space-y-16 pb-10">
      
      {/* 1. Hero Section (최상단 메인 메시지) */}
      <section className="bg-white dark:bg-[#202124] rounded-none sm:rounded-[2rem] px-5 py-12 sm:p-14 border-y sm:border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] text-center relative overflow-hidden">
        {/* 장식용 배경 그래픽 (아주 옅은 패턴 느낌) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a73e8] via-[#ea4335] to-[#fbbc04]"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#174ea6]/20 dark:text-[#8ab4f8] text-[11px] sm:text-xs font-bold mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          프리미엄 보상 정보 플랫폼
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#202124] dark:text-white tracking-tight leading-snug mb-5 break-keep">
          당신의 정당한 권리를 되찾는 여정,<br className="hidden sm:block" />
          <span className="text-[#1a73e8] dark:text-[#8ab4f8]">보상스쿨</span>이 든든한 나침반이 되겠습니다.
        </h1>
        
        <p className="text-sm sm:text-base text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed max-w-2xl mx-auto break-keep font-medium">
          어렵고 복잡한 의학 지식과 거대한 대기업 보험사 앞에서 막막함을 느끼십니까? 보상스쿨은 환자의 올바른 의료 권리와 합당한 보험 보상을 수호하기 위해 탄생한 공인·검증된 전문가 그룹입니다.
        </p>
      </section>

      {/* 2. Our Mission (우리의 미션) */}
      <section className="px-3 sm:px-0">
        <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 dark:bg-zinc-900/50 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-white/5">
          <div className="flex-1 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2">
              <svg className="w-6 h-6 text-[#34a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              정보의 비대칭성을 허물다
            </h2>
            <p className="text-sm sm:text-base text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
              수많은 상해 및 질병 사고 피해자분들이 <strong>전문적인 지식의 부재</strong>로 인해 마땅히 받아야 할 치료를 놓치거나, 보험회사의 일방적인 주장에 이끌려 <strong>정당한 보상금을 포기</strong>하곤 합니다.
            </p>
            <p className="text-sm sm:text-base text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
              우리는 이 기울어진 운동장을 바로잡고자 합니다. 건강보험심사평가원(HIRA)의 방대한 의료 통계와 현직 독립손해사정사의 수천 건의 실무 노하우를 융합하여, <strong>가장 투명하고 강력한 '환자 맞춤형 보상 실무 가이드'</strong>를 무료로 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. E-E-A-T 4대 핵심 가치 */}
      <section className="px-3 sm:px-0">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#202124] dark:text-white">
            보상스쿨의 4대 핵심 가치
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] font-medium">
            구글 E-E-A-T 검색품질 가이드라인을 완벽하게 준수하는 최고 수준의 정보만 약속합니다.
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
          
          {/* Experience */}
          <div className="bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#e8f0fe] dark:bg-[#174ea6]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#1a73e8] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className="text-lg font-bold text-[#202124] dark:text-white mb-2 font-mono">
              <span className="text-[#1a73e8]">E</span>xperience (경험)
            </h3>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
              단순한 이론이 아닙니다. 실제 수천 건의 자동차보험 사고, 개인보험 장해 평가, 산재 합의금 사정 사건을 현장에서 직접 다루며 피땀으로 쌓아올린 <strong>살아있는 실무 노하우</strong>만을 제공합니다.
            </p>
          </div>

          {/* Expertise */}
          <div className="bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#fce8e6] dark:bg-[#c5221f]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#ea4335] dark:text-[#f28b82]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-[#202124] dark:text-white mb-2 font-mono">
              <span className="text-[#ea4335]">E</span>xpertise (전문성)
            </h3>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
              국가공인 손해사정사를 비롯한 보상 전문가 그룹이 직접 집필합니다. 일반인이 접근하기 힘든 <strong>복잡한 약관 해석과 맥브라이드/AMA 장해 평가 기준</strong>을 환자의 눈높이에서 완벽하게 해독해 드립니다.
            </p>
          </div>

          {/* Authoritativeness */}
          <div className="bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#e6f4ea] dark:bg-[#0d652d]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#34a853] dark:text-[#81c995]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <h3 className="text-lg font-bold text-[#202124] dark:text-white mb-2 font-mono">
              <span className="text-[#34a853]">A</span>uthoritativeness (권위성)
            </h3>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
              모든 데이터는 공공데이터포털 및 <strong>건강보험심사평가원(HIRA)의 공식 빅데이터</strong>에 기반합니다. 거주지 주변의 가장 믿을 수 있는 의료기관 정보와 비급여 진료비 통계를 권위 있는 출처를 통해 제공합니다.
            </p>
          </div>

          {/* Trustworthiness */}
          <div className="bg-white dark:bg-[#202124] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-[#fef7e0] dark:bg-[#e37400]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#fbbc04] dark:text-[#fde293]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-[#202124] dark:text-white mb-2 font-mono">
              <span className="text-[#fbbc04]">T</span>rustworthiness (신뢰성)
            </h3>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
              특정 병원이나 보험사에 편향되지 않은 <strong>완벽한 독립성과 중립성</strong>을 유지합니다. 조회수를 위한 자극적이고 과장된 정보가 아닌, 피해자에게 실질적인 금전적/의학적 이익을 가져다주는 정직한 정보만을 발행합니다.
            </p>
          </div>

        </div>
      </section>

      {/* 4. 면책 고지 (Legal Disclaimer) */}
      <section className="px-3 sm:px-0">
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl">
          <strong className="text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            법적 고지 및 안내 사항
          </strong>
          <p className="text-xs sm:text-[13px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
            보상스쿨 헬스케어 & 손해사정 보상가이드에서 제공하는 모든 포스팅 및 통계 정보는 일반적인 참고용 자료입니다. 당사는 사이트 내 정보만으로 어떠한 법률적 대리 행위나 의료 진단 행위를 직접 수행하지 않습니다. 개별 사고의 특수성에 따른 정확한 장해 산정 및 합의 절차는 반드시 공인된 독립손해사정사나 법률 전문가와의 1:1 정식 상담을 통해 결정하시기 바랍니다.
          </p>
        </div>
      </section>

      {/* 5. 하단 액션 버튼 (CTA) */}
      <section className="px-3 sm:px-0 text-center pt-4">
        <Link 
          href="/blog"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1a73e8] px-8 text-sm sm:text-base font-extrabold text-white hover:bg-[#1557b0] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          보상스쿨 전문가 실무 가이드 읽기 &rarr;
        </Link>
      </section>

    </article>
  );
}
