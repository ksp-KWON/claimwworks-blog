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
  title: "클레임웍스 헬스케어 보상 가이드",
  description: "심평원 의료 빅데이터 분석과 10년 차 독립손해사정사의 실전 보상 가이드를 매칭한 프리미엄 헬스케어 플랫폼입니다.",
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
        
        {/* 1. 프리미엄 글래스모피즘 헤더 (클레임웍스 브랜딩) */}
        <header className="sticky top-0 z-50 w-full h-[60px] border-b border-slate-200/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-slate-800 dark:text-zinc-100 shadow-xs transition-colors">
          <div className="mx-auto flex h-full w-[92vw] xl:w-[85vw] max-w-7xl items-center justify-between px-2 sm:px-5">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif font-extrabold text-lg sm:text-xl flex-shrink-0 text-slate-900 dark:text-white">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <span role="img" aria-label="건강">🩺</span> 클레임웍스 헬스케어 보상 가이드
              </Link>
            </div>
            
            {/* 헤더 메뉴 네비게이션: 홈, 블로그, 소개(About) */}
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link href="/" className="text-sm font-semibold text-slate-650 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 transition-colors">
                🏠 홈
              </Link>
              <Link href="/blog" className="text-sm font-semibold text-slate-650 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 transition-colors">
                ✍️ 블로그
              </Link>
              <Link href="/about" className="text-sm font-semibold text-slate-650 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 transition-colors">
                ℹ️ 소개(About)
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {/* 2. 티스토리 2단 레이아웃 본문 75% : 사이드바 25% 구조 */}
        <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl px-2 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 transition-all duration-300">
          
          {/* 본문 영역 (좌측 75%) */}
          <main className="w-full lg:w-[73%] flex-1 min-w-0">
            {children}
          </main>

          {/* 사이드바 영역 (우측 25% - 애드센스 최적화) */}
          <aside className="w-full lg:w-[27%] lg:sticky lg:top-[80px] self-start space-y-6">
            
            {/* 프로필 영역 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-3xl flex items-center justify-center font-bold mb-4 shadow-sm">
                🧑‍⚖️
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-150">
                보상스쿨 손해사정사
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2.5 leading-relaxed font-medium">
                신체손해사정사<br />
                보험조사분석사<br />
                개인보험심사역<br />
                언더라이터
              </p>
            </div>

            {/* 카카오톡 상담신청 박스 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider block mb-3 text-center">💬 빠른 카톡 상담</span>
              <a 
                href="https://open.kakao.com/o/sWeszp7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-amber-50 dark:bg-zinc-800/20">
                  <img 
                    src="/kakao_counsel.png" 
                    alt="카카오 상담 신청" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-amber-50/20 dark:bg-zinc-800/20 text-center border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-slate-850 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    실시간 카톡 보상상담 받기
                  </span>
                </div>
              </a>
            </div>

            {/* 구글 설문지 상담신청 박스 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60 flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block mb-3 text-center">📋 상세 상담 예약</span>
              <a 
                href="https://forms.gle/E9vj7iqAHeJGhJ549" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-emerald-50/20 dark:bg-zinc-800/20">
                  <img 
                    src="/google_counsel.png" 
                    alt="구글 상담 신청" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-emerald-50/20 dark:bg-zinc-800/20 text-center border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-slate-850 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    구글 무료 상담신청서 작성
                  </span>
                </div>
              </a>
            </div>

            {/* 구글 애드센스 고정 배너 슬롯 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-3 text-center">ADVERTISEMENT</span>
              <div className="w-full h-[250px] bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center p-4">
                <span className="text-2xl mb-1">📢</span>
                <span className="text-[11px] text-slate-450 dark:text-zinc-450 text-center font-medium leading-relaxed">
                  구글 애드센스 광고 슬롯<br />(300x250 PC/Mobile 배너 대응)
                </span>
              </div>
            </div>

            {/* 카테고리 목록 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
                📁 카테고리 분류
              </h3>
              <ul className="space-y-2.5 text-xs">
                {Object.entries(
                  getSortedPostsData().reduce((acc: { [key: string]: number }, post) => {
                    const cat = post.category || '일반';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([catName, count]) => (
                  <li key={catName} className="flex justify-between items-center">
                    <Link
                      href="/blog"
                      className="hover:text-blue-600 dark:hover:text-blue-450 text-slate-700 dark:text-zinc-350 font-medium transition-colors"
                    >
                      • {catName}
                    </Link>
                    <span className="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-450 text-[10px] font-semibold border border-slate-100 dark:border-zinc-700">
                      {count}개
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 인기 태그 및 키워드 목록 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
                🏷️ 인기 키워드 태그
              </h3>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
                ✍️ 최근 보상 칼럼
              </h3>
              {recentPosts.length === 0 ? (
                <p className="text-xs text-slate-400">등록된 칼럼이 없습니다.</p>
              ) : (
                <ul className="space-y-3.5 text-xs">
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
              © {new Date().getFullYear()} 클레임웍스 헬스케어 보상 가이드. All rights reserved.
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
