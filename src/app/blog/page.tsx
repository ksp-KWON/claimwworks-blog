import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '건강 정보 블로그 | 심평원 의료 통계 기반 전문 건강 가이드',
  description: '심평원 공공데이터를 기반으로 최신 건강 및 질병 정보를 알아보기 쉽게 정리하여 전해드리는 전문 건강 블로그입니다.',
};

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="space-y-8">
        <header className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 sm:text-5xl">
            📰 건강·보상 블로그
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-zinc-400">
            의료 빅데이터와 공공 질병 통계를 바탕으로 검증된 신뢰성 높은 건강 가이드를 제공합니다.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800">
            <p className="text-slate-500 dark:text-zinc-400 text-lg">
              등록된 블로그 포스팅이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/50 border-l-4 border-l-blue-500 dark:border-l-blue-400 hover:border-l-blue-600 dark:hover:border-l-blue-500 hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                    <span className="px-2.5 py-1 font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      {post.category}
                    </span>
                    <time className="text-slate-400 dark:text-zinc-500">{post.date}</time>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-3 text-base text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    🔍 자세히 보기 &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
    </div>
  );
}
