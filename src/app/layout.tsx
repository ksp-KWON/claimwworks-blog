import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { getSortedPostsData } from "@/lib/posts";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "보상스쿨 헬스케어 & 손해사정 보상가이드",
  description: "건강보험심사평가원의 공개 정보를 기반으로 보상스쿨 손해사정사가 분석한 보상 노하우를 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 사이드바에 연동할 최근 보상 포스트 목록
  const recentPosts = getSortedPostsData().slice(0, 5);

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })()
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
        
        {/* 1. 프리미엄 글래스모피즘 헤더 */}
        <header className="sticky top-0 z-50 w-full h-[60px] border-b border-slate-200/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-slate-800 dark:text-zinc-100 shadow-xs transition-colors">
          <div className="mx-auto flex h-full w-[92vw] xl:w-[85vw] max-w-7xl items-center justify-between px-2 sm:px-5">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif font-extrabold text-lg sm:text-xl flex-shrink-0 text-slate-900 dark:text-white">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <span role="img" aria-label="건강">🩺</span> 보상스쿨 헬스케어 & 손해사정 보상가이드
              </Link>
            </div>
            
            {/* 헤더 메뉴 네비게이션 */}
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link href="/" className="text-sm font-semibold text-slate-650 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-450 transition-colors">
                🏠 홈
              </Link>
              <Link href="/blog" className="text-sm font-semibold text-slate-650 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-450 transition-colors">
                ✍️ 블로그
              </Link>
              <Link href="/about" className="text-sm font-semibold text-slate-650 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-450 transition-colors">
                ℹ️ 소개(About)
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {/* 2. 헤더 아래 가로 탭형 네비게이션 바 (마우스 호버 시 하위 메뉴 노출) */}
        <nav className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 sticky top-[60px] z-40 transition-colors">
          <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl px-5 py-2 flex items-center gap-8 text-sm font-bold text-slate-700 dark:text-zinc-350">
            
            {/* 탭 1: 지역별 의료기관 */}
            <div className="group relative py-2 cursor-pointer">
              <span className="hover:text-blue-650 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                📍 지역별 의료기관 <span className="text-[10px] text-slate-400">▼</span>
              </span>
              {/* 드롭다운 하위 메뉴 */}
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-lg p-3 hidden group-hover:block transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-3">
                  {/* 서울 */}
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      서울특별시 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      <Link href="/blog?region=강남구" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 강남구</Link>
                      <Link href="/blog?region=서초구" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 서초구</Link>
                    </div>
                  </div>
                  {/* 부산 */}
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      부산광역시 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      <Link href="/blog?region=해운대구" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 해운대구</Link>
                      <Link href="/blog?region=부산진구" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 부산진구</Link>
                    </div>
                  </div>
                  {/* 인천 */}
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      인천광역시 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      <Link href="/blog?region=남동구" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 남동구</Link>
                    </div>
                  </div>
                  {/* 대구 */}
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      대구광역시 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      <Link href="/blog?region=중구" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 중구</Link>
                    </div>
                  </div>
                  {/* 경기도 */}
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      경기도 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      <Link href="/blog?region=수원시" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 수원시</Link>
                      <Link href="/blog?region=성남시" className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• 성남시</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 탭 2: 상해별 보상 가이드 */}
            <div className="group relative py-2 cursor-pointer">
              <span className="hover:text-blue-650 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                🩹 상해별 보상 가이드 <span className="text-[10px] text-slate-400">▼</span>
              </span>
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-lg p-3 hidden group-hover:block transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-3">
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      🦴 척추 골절 및 손상 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['척추압박골절', '척추탈구 및 고정술', '방출성골절'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      🩹 관절 및 인대 손상 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['십자인대 파열', '회전근개 파열', '아킬레스건 파열', '손목/발목 골절'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      🚗 교통사고 및 배상 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['교통사고 합의금', '일상생활배상책임', '산재 및 근재보험'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 탭 3: 질병별 보상 가이드 */}
            <div className="group relative py-2 cursor-pointer">
              <span className="hover:text-blue-650 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
                🩺 질병별 보상 가이드 <span className="text-[10px] text-slate-400">▼</span>
              </span>
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-lg p-3 hidden group-hover:block transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-3">
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      🩻 척추 및 관절 질환 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['목/허리디스크', '척추관협착증', '오십견/퇴행성관절염'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      🧠 뇌 및 심혈관 질환 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['뇌경색 / 뇌출혈', '급성 심근경색증', '협심증 보상'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      🎗️ 주요 중증 질환 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['암 진단비 (일반/유사암)', '표적항암 치료비', '경계성 종양'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="group/sub relative">
                    <span className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 py-1 hover:text-blue-500">
                      📑 실손의료비 및 비급여 <span>▶</span>
                    </span>
                    <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-md p-2 hidden group-hover/sub:block">
                      {['도수치료 / MRI 실비', '비급여 보상 한도', '질병 수술비 청구'].map(item => (
                        <Link key={item} href={`/blog?category=${item}`} className="block text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-500 py-1">• {item}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </nav>

        {/* 2. 티스토리 2단 레이아웃 본문 75% : 사이드바 25% 구조 */}
        <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl px-2 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 transition-all duration-300">
          
          {/* 본문 영역 (좌측 75%) */}
          <main className="w-full lg:w-[73%] flex-1 min-w-0">
            {children}
          </main>

          {/* 사이드바 영역 (우측 25%) */}
          <aside className="w-full lg:w-[27%] lg:sticky lg:top-[80px] self-start space-y-6">
            
            {/* 프로필 영역 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-3xl flex items-center justify-center font-bold mb-4 shadow-sm">
                🧑‍⚖️
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-150">
                보상스쿨 손해사정사
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-3.5 w-full">
                {['신체손해사정사', '보험조사분석사', '개인보험심사역', '언더라이터'].map((cert) => (
                  <span key={cert} className="px-2 py-1.5 text-[10px] font-bold rounded-lg bg-blue-50/80 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/30 text-center block truncate">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* 카카오톡 상담신청 박스 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col overflow-hidden">
              <div className="flex justify-center mb-3">
                <span className="px-3 py-1 text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full tracking-wider">💬 실시간 카톡 상담</span>
              </div>
              <a 
                href="https://open.kakao.com/o/sWeszp7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border border-amber-100 dark:border-amber-950/20 bg-amber-50/5 dark:bg-amber-950/5 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-amber-50/20 dark:bg-zinc-850/20">
                  <img 
                    src="/kakao_counsel.png" 
                    alt="카카오 상담 신청" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-amber-50/30 dark:bg-amber-950/10 text-center border-t border-amber-100/50 dark:border-amber-950/20">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    실시간 1:1 카톡 상담 받기
                  </span>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">⚡ 평균 5분 이내 빠른 답변 완료</p>
                </div>
              </a>
            </div>

            {/* 구글 설문지 상담신청 박스 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col overflow-hidden">
              <div className="flex justify-center mb-3">
                <span className="px-3 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full tracking-wider">📋 상세 상담 예약</span>
              </div>
              <a 
                href="https://forms.gle/E9vj7iqAHeJGhJ549" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/5 dark:bg-emerald-950/5 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-emerald-50/20 dark:bg-zinc-850/20">
                  <img 
                    src="/google_counsel.png" 
                    alt="구글 상담 신청" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/10 text-center border-t border-emerald-100/50 dark:border-emerald-950/20">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    상세 예약 설문서 작성
                  </span>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">📑 맞춤형 보상분석 보고서 제공</p>
                </div>
              </a>
            </div>

            {/* 유튜브 채널 박스 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col overflow-hidden">
              <div className="flex justify-center mb-3">
                <span className="px-3 py-1 text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full tracking-wider">📺 보상스쿨 유튜브</span>
              </div>
              <a 
                href="https://www.youtube.com/@bosangschool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border border-rose-100 dark:border-rose-950/20 bg-rose-50/5 dark:bg-rose-950/5 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-rose-50/20 dark:bg-zinc-850/20">
                  <img 
                    src="/youtube_banner.png" 
                    alt="보상스쿨 유튜브" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-rose-50/30 dark:bg-rose-950/10 text-center border-t border-rose-100/50 dark:border-rose-950/20">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    유튜브 영상 강의 구독하기
                  </span>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">🎬 실전 보상 노하우 무료 시청</p>
                </div>
              </a>
            </div>



            {/* 인기 태그 및 키워드 목록 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
                🏷️ 인기 키워드 태그
              </h3>
              <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                {['교통사고합의금', '지불보증', '후유장해', '비급여비용', '도수치료비', 'MRI검사비', '손해사정'].map((tag) => (
                  <span 
                    key={tag}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-55 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-450 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 최근 칼럼 리스트 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
                ✍️ 최근 보상 칼럼
              </h3>
              {recentPosts.length === 0 ? (
                <p className="text-xs text-slate-400">등록된 칼럼이 없습니다.</p>
              ) : (
                <ul className="space-y-3.5 text-xs sm:text-sm">
                  {recentPosts.map((post) => (
                    <li key={post.slug} className="truncate">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-450 transition-colors block py-0.5 text-slate-700 dark:text-zinc-350 font-medium"
                      >
                        • {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </aside>
        </div>

        {/* 3. 프리미엄 다크 네이비/슬레이트 푸터 */}
        <footer className="w-full bg-slate-900 dark:bg-zinc-950 text-slate-400 border-t border-slate-950 shadow-inner">
          <div className="mx-auto flex flex-col md:flex-row h-auto md:h-[70px] w-[92vw] xl:w-[85vw] max-w-7xl items-center justify-between px-2 sm:px-5 py-5 md:py-0 text-xs gap-3">
            <p className="copyright text-center md:text-left text-slate-400 dark:text-zinc-500 font-medium">
              © {new Date().getFullYear()} 보상스쿨 헬스케어 & 손해사정 보상가이드. All rights reserved.
            </p>
            <p className="iagree text-center md:text-right text-slate-400">
              이용약관 | <span className="text-slate-400 hover:underline cursor-pointer font-medium">개인정보처리방침</span> | <Link href="/admin" className="text-blue-400 dark:text-blue-450 hover:underline font-medium">⚙️ 관리자</Link>
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
