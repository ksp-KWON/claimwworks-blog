import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function Home() {
  // 전체 최신 보상 가이드 블로그 목록 로드
  const posts = getSortedPostsData();

  return (
    <div className="space-y-8">
      
      {/* 1. 애드센스 최적화 상단 배너 */}
      <div className="text-center text-xs text-slate-400 dark:text-zinc-600">
        <div className="inline-block w-full py-4.5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40">
          ADVERTISEMENT (구글 애드센스 상단 반응형 광고 영역)
        </div>
      </div>

      {/* 2. 메인 페이지 인트로 헤더 */}
      <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-5">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
          <span>🩺</span> 최신 병원 & 보상 실무 가이드
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          건강보험심사평가원의 공개 정보를 기반으로 독립손해사정사가 분석한 합의 노하우입니다.
        </p>
      </div>

      {/* 3. 본문 영역: 가이드 카드 격자(Grid) 배치 */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-200/60 dark:border-zinc-800/60">
          <span className="text-4xl block mb-3">📂</span>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">등록된 가이드 카드가 아직 존재하지 않습니다.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <article 
              key={post.slug}
              className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/60 dark:border-zinc-800/60 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-[280px]"
            >
              <Link href={`/blog/${post.slug}`} className="p-6 flex flex-col justify-between h-full flex-1">
                
                {/* 상단: 카테고리 배지와 날짜 */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
                    {post.category || '병원보상가이드'}
                  </span>
                  <time className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                    📅 {post.date}
                  </time>
                </div>

                {/* 중단: 제목 및 설명 */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 break-keep">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal break-keep">
                    {post.summary}
                  </p>
                </div>

                {/* 하단: 디테일 바로가기 링크 */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>가이드 전문 읽기</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>

              </Link>
            </article>
          ))}
        </div>
      )}

      {/* 4. 애드센스 최적화 하단 광고 */}
      <div className="text-center text-xs text-slate-400 dark:text-zinc-600 pt-4">
        <div className="inline-block w-full py-4.5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40">
          ADVERTISEMENT (구글 애드센스 하단 일치형 광고 영역)
        </div>
      </div>

    </div>
  );
}
