import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SidebarContent from "@/components/SidebarContent";

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
        
        {/* 1. 안드로이드 머티리얼 스타일 App Bar */}
        <header className="sticky top-0 z-50 w-full h-[64px] border-b border-[var(--google-border)] bg-white dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] shadow-sm transition-colors">
          <div className="mx-auto flex h-full w-[92vw] xl:w-[85vw] max-w-7xl items-center justify-between px-2 sm:px-5">

            {/* 로고/제목 영역 */}
            <div className="flex items-center min-w-0 flex-1 mr-2">
              <div className="font-sans font-bold text-base sm:text-lg lg:text-xl text-[#202124] dark:text-white min-w-0 tracking-tight">
                <Link href="/" className="hover:text-[var(--google-blue)] transition-colors flex items-center gap-2 whitespace-nowrap overflow-hidden">
                  <svg className="w-6 h-6 text-[var(--google-blue)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  <span className="hidden sm:inline truncate">보상스쿨 헬스케어 &amp; 손해사정 보상가이드</span>
                  <span className="sm:hidden">보상스쿨</span>
                </Link>
              </div>
            </div>

            {/* 우측 메뉴 영역 */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">
                <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[var(--google-surface-variant)] hover:text-[var(--google-blue)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  <span className="hidden md:inline">홈</span>
                </Link>
                <Link href="/blog" className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[var(--google-surface-variant)] hover:text-[var(--google-blue)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M3 15h6"></path><path d="M3 19h6"></path><path d="M10 15h8"></path><path d="M10 19h8"></path></svg>
                  <span className="hidden md:inline">블로그</span>
                </Link>
                <Link href="/about" className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[var(--google-surface-variant)] hover:text-[var(--google-blue)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span className="hidden md:inline">소개</span>
                </Link>
                <Link href="/calculator" className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[var(--google-surface-variant)] hover:text-[var(--google-blue)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                  <span className="hidden md:inline">계산기</span>
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* 2. 구글 스타일 4단 정보 카드 영역 — sticky 고정 배너 */}
        <section className="sticky top-[64px] z-40 w-full bg-[var(--background)] border-b border-[var(--google-border)] py-2.5 transition-colors shadow-sm">
          <div className="mx-auto w-[92vw] xl:w-[85vw] max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-5">
            
            {/* 링크 1: 보상스쿨 소개 */}
            <Link href="/about" className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(26,115,232,0.2)] hover:border-[#1A73E8] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#e8f0fe] dark:bg-[#174ea6] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--google-blue)] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[var(--google-blue)] transition-colors">보상스쿨 소개</span>
                <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">자격 및 경력사항</span>
              </div>
            </Link>

            {/* 링크 2: 카카오톡 상담 */}
            <a href="https://open.kakao.com/o/sWeszp7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(242,153,0,0.2)] hover:border-[#f29900] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#fef7e0] dark:bg-[#e37400] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#f29900] dark:text-[#fde293]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[#d93025] transition-colors">카카오톡 상담</span>
                <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">실시간 채팅상담</span>
              </div>
            </a>

            {/* 링크 3: 상담신청 양식 */}
            <a href="https://forms.gle/E9vj7iqAHeJGhJ549" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(52,168,83,0.2)] hover:border-[#34A853] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#e6f4ea] dark:bg-[#0d652d] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--google-green)] dark:text-[#81c995]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[var(--google-green)] transition-colors">상담신청 양식</span>
                <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">예약상담 신청서</span>
              </div>
            </a>

            {/* 링크 4: 유튜브 채널 */}
            <a href="https://www.youtube.com/@bosangschool" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(217,48,37,0.2)] hover:border-[#d93025] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#fce8e6] dark:bg-[#c5221f] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--google-red)] dark:text-[#f28b82]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[var(--google-red)] transition-colors">보상스쿨 TV</span>
                <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">유튜브 바로가기</span>
              </div>
            </a>

          </div>
        </section>

        {/* 3. 티스토리 2단 레이아웃 본문 75% : 사이드바 25% 구조 */}
        <div className="mx-auto w-full sm:w-[92vw] xl:w-[85vw] max-w-7xl px-0 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 transition-all duration-300">
          
          {/* 본문 영역 (좌측 75%) */}
          <main className="w-full lg:w-[73%] flex-1 min-w-0">
            {children}
          </main>

          {/* 사이드바 영역 (우측 27%) — 데스크탑: sticky, 모바일: 접기/펴기 토글 */}
          <aside className="w-full lg:w-[27%] lg:sticky lg:top-[80px] self-start space-y-4">
            <SidebarContent />
          </aside>
        </div>

        {/* 4. 구글 표면 색상 푸터 */}
        <footer className="w-full bg-[var(--google-surface-variant)] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] border-t border-[var(--google-border)]">
          <div className="mx-auto flex flex-col md:flex-row h-auto md:h-[70px] w-[92vw] xl:w-[85vw] max-w-7xl items-center justify-between px-2 sm:px-5 py-5 md:py-0 text-[11px] font-bold gap-3">
            <p className="copyright text-center md:text-left flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              © {new Date().getFullYear()} 보상스쿨 헬스케어 & 손해사정 보상가이드. All rights reserved.
            </p>
            <p className="iagree text-center md:text-right flex items-center gap-2">
              <span className="hover:text-[var(--google-blue)] cursor-pointer transition-colors">이용약관</span>
              <span className="w-1 h-1 rounded-full bg-[#dadce0] dark:bg-[#5f6368]"></span>
              <span className="hover:text-[var(--google-blue)] cursor-pointer transition-colors">개인정보처리방침</span>
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
