import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { getSortedPostsData } from "@/lib/posts";
import { RegionalCategories, SpecialtyDiseaseCategories } from "@/components/SidebarCategories";

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
            <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif font-extrabold text-base sm:text-lg flex-shrink-0 text-slate-900 dark:text-white">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span role="img" aria-label="건강">🩺</span> 보상스쿨 헬스케어 & 손해사정 보상가이드
                </Link>
              </div>

            </div>
            
            {/* 원래 자리에 메뉴 배치 */}
            <div className="flex items-center gap-4 sm:gap-6">
              <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-650 dark:text-zinc-300">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  🏠 홈
                </Link>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  ✍️ 블로그
                </Link>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  ℹ️ 소개(About)
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* 2. 균형있게 배치된 고정식 4단 정보 및 링크 박스 (상징적인 아이콘형 단추로 슬림하게 개선) */}
        <section className="lg:sticky lg:top-[60px] z-30 w-full bg-slate-100/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 py-2.5 transition-colors">
          <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-3 px-2 sm:px-5">
            
            {/* 링크 1: 보상스쿨 손해사정사 프로필 */}
            <Link href="/about" className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 hover:border-blue-400 dark:hover:border-blue-800 shadow-[0_2px_8px_rgba(59,130,246,0.06)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">
                ⚖️
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  보상스쿨 손해사정사
                </span>
                <span className="block text-[9px] text-slate-400 dark:text-zinc-550 truncate mt-0.5">신체손해사정사 소개</span>
              </div>
            </Link>

            {/* 링크 2: 실시간 카톡 상담 */}
            <a href="https://open.kakao.com/o/sWeszp7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 hover:border-amber-450 dark:hover:border-amber-800 shadow-[0_2px_8px_rgba(245,158,11,0.06)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.12)] hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">
                💬
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                  실시간 카톡 상담
                </span>
                <span className="block text-[9px] text-slate-400 dark:text-zinc-550 truncate mt-0.5">평균 5분 이내 답변 완료</span>
              </div>
            </a>

            {/* 링크 3: 구글 상담 신청 */}
            <a href="https://forms.gle/E9vj7iqAHeJGhJ549" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 hover:border-emerald-450 dark:hover:border-emerald-800 shadow-[0_2px_8px_rgba(16,185,129,0.06)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.12)] hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">
                📋
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  구글 상담신청 양식
                </span>
                <span className="block text-[9px] text-slate-400 dark:text-zinc-550 truncate mt-0.5">상세 예약 밀착 분석</span>
              </div>
            </a>

            {/* 링크 4: 유튜브 채널 */}
            <a href="https://www.youtube.com/@bosangschool" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 hover:bg-rose-50/30 dark:hover:bg-rose-950/10 hover:border-rose-450 dark:hover:border-rose-800 shadow-[0_2px_8px_rgba(244,63,94,0.06)] hover:shadow-[0_4px_12px_rgba(244,63,94,0.12)] hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-linear-to-br from-rose-500 to-red-600 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">
                📺
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-extrabold text-slate-800 dark:text-zinc-150 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                  보상스쿨 유튜브
                </span>
                <span className="block text-[9px] text-slate-400 dark:text-zinc-550 truncate mt-0.5">실전 보상 노하우 무료구독</span>
              </div>
            </a>

          </div>
        </section>

        {/* 3. 티스토리 2단 레이아웃 본문 75% : 사이드바 25% 구조 */}
        <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl px-2 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 transition-all duration-300">
          
          {/* 본문 영역 (좌측 75%) */}
          <main className="w-full lg:w-[73%] flex-1 min-w-0">
            {children}
          </main>

          {/* 사이드바 영역 (우측 25%) - 상단 sticky를 슬림해진 4단 박스 높이에 맞추어 top-[140px]로 조정 */}
          <aside className="w-full lg:w-[27%] lg:sticky lg:top-[140px] self-start space-y-6">
            
            {/* 지역별 의료기관 카테고리 */}
            <RegionalCategories />

             {/* 진료과목 및 다빈도 질환 카테고리 */}
             <SpecialtyDiseaseCategories />

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
          </aside>
        </div>

        {/* 4. 프리미엄 다크 네이비/슬레이트 푸터 */}
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
