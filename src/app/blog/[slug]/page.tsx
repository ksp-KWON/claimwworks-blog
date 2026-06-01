import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostData } from '@/lib/posts';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// SEO를 위한 동적 메타데이터 생성
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다 | 심평원 건강·보상 정보 포털',
    };
  }

  return {
    title: `${post.title} | 심평원 건강·보상 정보 포털`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-slate-100 dark:border-zinc-800/50">
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <span className="mr-1.5" role="img" aria-label="목록">↩️</span> 목록으로 돌아가기
        </Link>
      </div>

      {/* 글 헤더 */}
      <header className="border-b border-slate-100 dark:border-zinc-800/80 pb-8 mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
            {post.category}
          </span>
          <time className="text-slate-400 dark:text-zinc-500 font-medium tracking-wide">
            <span role="img" aria-label="작성일" className="mr-1">📅</span>
            {post.date}
          </time>
        </div>
        
        {/* 제목: 글자 크기 조정 (너무 크지 않게, 줄간격 및 자간 최적화) */}
        <h1 className="text-[22px] sm:text-[26px] lg:text-[28px] font-extrabold text-slate-900 dark:text-zinc-50 leading-[1.35] break-keep tracking-tight">
          {post.title}
        </h1>
        
        {/* 요약 박스: 제목과 명확히 구분되는 세련된 디자인 (콜아웃 박스) */}
        <div className="mt-8 p-6 sm:p-7 bg-slate-50/80 dark:bg-zinc-800/30 rounded-[20px] border-l-[6px] border-l-blue-500 border border-slate-200/60 dark:border-zinc-700/50 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] transition-colors">
          <div className="w-10 h-10 shrink-0 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-zinc-700">
            <span className="text-xl" role="img" aria-label="핵심 요약">💡</span>
          </div>
          <div className="flex-1">
            <strong className="block text-[15px] font-bold text-blue-600 dark:text-blue-400 mb-2">핵심 내용 정리</strong>
            <p className="text-[15px] sm:text-[16px] text-slate-700 dark:text-zinc-300 font-normal leading-[1.7] break-keep">
              {post.summary}
            </p>
          </div>
        </div>
      </header>

      {/* 본문 (Markdown 렌더링) */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-[16px] sm:text-[17px] leading-[1.8] break-keep
        prose-headings:font-extrabold prose-headings:text-slate-800 dark:prose-headings:text-zinc-100 prose-headings:tracking-tight
        prose-h2:mt-10 prose-h2:mb-5 prose-h2:text-2xl
        prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-xl
        prose-p:mb-6 prose-p:text-slate-700 dark:prose-p:text-zinc-300
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-800 transition-colors
        prose-strong:text-slate-900 dark:prose-strong:text-zinc-50 prose-strong:font-bold
        prose-ul:my-6 prose-li:my-2
        
        prose-table:w-full prose-table:my-8 prose-table:text-[15px] prose-table:border-collapse prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow-sm
        prose-th:bg-slate-100 dark:prose-th:bg-zinc-800 prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-slate-700 dark:prose-th:text-zinc-300
        prose-td:p-4 prose-td:border-b prose-td:border-slate-100 dark:prose-td:border-zinc-800/80 prose-td:align-top
        prose-tr:transition-colors hover:prose-tr:bg-slate-50 dark:hover:prose-tr:bg-zinc-800/50
      ">
        <div className="overflow-x-auto pb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* 태그 목록 */}
      <footer className="mt-14 pt-8 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex flex-wrap gap-2.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/60 px-3.5 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}
