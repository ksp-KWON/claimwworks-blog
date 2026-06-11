import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import YouTubeBriefing from "@/components/YouTubeBriefing";

// 구글의 대표적인 4색 테마를 카테고리별로 매칭해주는 스타일 헬퍼 함수
function getCategoryColor(category: string) {
  const c = category || '';
  // 1. 빨간색 (외상: 골절, 파열, 외상, 교통사고, 상해, 염좌, 사고 등)
  if (
    c.includes('골절') || 
    c.includes('파열') || 
    c.includes('외상') || 
    c.includes('교통사고') || 
    c.includes('상해') || 
    c.includes('염좌') || 
    c.includes('사고')
  ) {
    return {
      badge: 'bg-[#fce8e6] text-[var(--google-red)] dark:bg-[#c5221f]/20 dark:text-[#f28b82]',
      border: 'hover:border-[var(--google-red)]',
      hoverText: 'group-hover:text-[var(--google-red)]',
      arrowColor: 'text-[var(--google-red)]'
    };
  }
  // 2. 파란색 (질병: 디스크, 추간판탈출증, 협착증, 심근경색, 협심증, 암, 백내장, 전립선, 황반변성, 녹내장, 근종, 섬유선종 등)
  if (
    c.includes('디스크') || 
    c.includes('추간판') || 
    c.includes('협착증') || 
    c.includes('심근경색') || 
    c.includes('협심증') || 
    c.includes('암') || 
    c.includes('백내장') || 
    c.includes('전립선') || 
    c.includes('황반변성') || 
    c.includes('녹내장') || 
    c.includes('근종') || 
    c.includes('선종') || 
    c.includes('질병') ||
    c.includes('요실금') ||
    c.includes('결석')
  ) {
    return {
      badge: 'bg-[#e8f0fe] text-[var(--google-blue)] dark:bg-[#174ea6]/20 dark:text-[#8ab4f8]',
      border: 'hover:border-[var(--google-blue)]',
      hoverText: 'group-hover:text-[var(--google-blue)]',
      arrowColor: 'text-[var(--google-blue)]'
    };
  }
  // 3. 초록색 (특수클리닉: 도수치료, 비급여, 하이푸, 맘모톰, 주사치료, 치조골, 임플란트, 한방, 첩약, 추나, 레이저, 미용, 피부 등)
  if (
    c.includes('도수') || 
    c.includes('비급여') || 
    c.includes('하이푸') || 
    c.includes('맘모톰') || 
    c.includes('주사') || 
    c.includes('치조골') || 
    c.includes('임플란트') || 
    c.includes('한방') || 
    c.includes('첩약') || 
    c.includes('추나') || 
    c.includes('레이저') || 
    c.includes('미용') || 
    c.includes('피부') || 
    c.includes('성형') ||
    c.includes('치료')
  ) {
    return {
      badge: 'bg-[#e6f4ea] text-[var(--google-green)] dark:bg-[#0d652d]/20 dark:text-[#81c995]',
      border: 'hover:border-[var(--google-green)]',
      hoverText: 'group-hover:text-[var(--google-green)]',
      arrowColor: 'text-[var(--google-green)]'
    };
  }
  // 4. 노란색 (그외 기타 가이드)
  return {
    badge: 'bg-[#fef7e0] text-[#b06000] dark:bg-[#e37400]/20 dark:text-[#fde293]',
    border: 'hover:border-[var(--google-yellow)]',
    hoverText: 'group-hover:text-[#d93025] dark:group-hover:text-[#fde293]',
    arrowColor: 'text-[#f29900] dark:text-[#fde293]'
  };
}

export default function Home() {
  // 전체 최신 보상 가이드 블로그 목록 로드
  const posts = getSortedPostsData();

  return (
    <div className="space-y-8 sm:px-0">
      
      {/* 유튜브 전문가 브리핑 섹션 (소개글 위쪽 배치) */}
      <YouTubeBriefing />

      {/* 2. 메인 페이지 인트로 헤더 */}
      <div className="border-b border-[var(--google-border)] pb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
          지역별 병원추천 & 보상 실무 가이드
        </h2>
        <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-1.5">
          건강보험심사평가원의 공개 정보를 기반으로 보상스쿨 전문가가 분석한 실무 노하우를 제공합니다.
        </p>
      </div>

      {/* 3. 본문 영역: 가이드 카드 격자(Grid) 배치 */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-[#202124] rounded-3xl p-12 text-center border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <svg className="w-12 h-12 text-[#dadce0] dark:text-[#5f6368] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M3 15h6"></path><path d="M3 19h6"></path><path d="M10 15h8"></path><path d="M10 19h8"></path></svg>
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] font-medium">등록된 가이드 문서가 아직 존재하지 않습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => {
            const colors = getCategoryColor(post.category);
            return (
              <article 
                key={post.slug}
                className={`group bg-white dark:bg-[#202124] rounded-[20px] sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${colors.border} hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[220px]`}
              >
                <Link href={`/blog/${post.slug}`} className="p-4 sm:p-5 flex flex-col justify-between h-full flex-1">
                  
                  {/* 상단: 카테고리 배지와 날짜 */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border border-transparent ${colors.badge}`}>
                      {post.category || '병원보상가이드'}
                    </span>
                    <time className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {post.date}
                    </time>
                  </div>

                  {/* 중단: 제목 및 설명 */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className={`text-base font-bold text-[#202124] dark:text-[#e8eaed] ${colors.hoverText} transition-colors line-clamp-2 leading-snug`}>
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed font-normal break-keep">
                      {post.summary}
                    </p>
                  </div>

                  {/* 하단: 디테일 바로가기 링크 */}
                  <div className={`mt-3 pt-3 border-t border-[var(--google-border)] flex items-center justify-between text-xs font-bold ${colors.arrowColor}`}>
                    <span>전문 읽기</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                  </div>

                </Link>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
