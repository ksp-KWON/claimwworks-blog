import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import CardTitleMarquee from "@/components/CardTitleMarquee";

export default function Home() {
  // 전체 최신 보상 가이드 블로그 목록 로드
  const posts = getSortedPostsData();

  return (
    <div className="space-y-8">
      
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
        <div className="bg-[var(--background)] rounded-2xl p-12 text-center border border-[var(--google-border)]">
          <svg className="w-12 h-12 text-[#dadce0] dark:text-[#5f6368] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M3 15h6"></path><path d="M3 19h6"></path><path d="M10 15h8"></path><path d="M10 19h8"></path></svg>
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] font-medium">등록된 가이드 문서가 아직 존재하지 않습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="group bg-[var(--background)] dark:bg-[#202124] rounded-2xl overflow-hidden border border-[var(--google-border)] hover:border-[var(--google-blue)] hover:shadow-md transition-all duration-200 flex flex-col min-h-[220px]"
            >
              <Link href={`/blog/${post.slug}`} className="p-5 flex flex-col justify-between h-full flex-1">
                
                {/* 상단: 카테고리 배지와 날짜 */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[var(--google-surface-variant)] text-[#5f6368] dark:bg-[#303134] dark:text-[#9aa0a6] border border-transparent">
                    {post.category || '병원보상가이드'}
                  </span>
                  <time className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {post.date}
                  </time>
                </div>

                {/* 중단: 제목 및 설명 */}
                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="text-base font-bold text-[#202124] dark:text-[#e8eaed] group-hover:text-[var(--google-blue)] transition-colors leading-snug">
                    <CardTitleMarquee
                      title={post.title}
                      className="text-base font-bold text-[#202124] dark:text-[#e8eaed] group-hover:text-[var(--google-blue)] transition-colors"
                    />
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed font-normal break-keep">
                    {post.summary}
                  </p>
                </div>

                {/* 하단: 디테일 바로가기 링크 */}
                <div className="mt-3 pt-3 border-t border-[var(--google-border)] flex items-center justify-between text-xs font-bold text-[var(--google-blue)]">
                  <span>전문 읽기</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </span>
                </div>

              </Link>
            </article>
          ))}
        </div>
      )}



    </div>
  );
}
