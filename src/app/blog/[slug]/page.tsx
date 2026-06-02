import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import type { Metadata } from 'next';

// 빌드 시 모든 블로그 글을 미리 생성 (정적 사이트 배포용)
export async function generateStaticParams() {
  const posts = getSortedPostsData(false);
  return posts.map((post) => ({ slug: post.slug }));
}

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
    <article className="w-full bg-[var(--background)] dark:bg-[#202124] rounded-2xl p-6 sm:p-10 lg:p-12 border border-[var(--google-border)]">
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-bold text-[#5f6368] hover:text-[var(--google-blue)] transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> 목록으로 돌아가기
        </Link>
      </div>

      {/* 글 헤더 */}
      <header className="border-b border-[var(--google-border)] pb-8 mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-2.5 py-1 font-bold rounded-md bg-[var(--google-surface-variant)] text-[#5f6368] dark:bg-[#303134] dark:text-[#9aa0a6] border border-transparent">
            {post.category}
          </span>
          <time className="text-[#5f6368] dark:text-[#9aa0a6] font-medium tracking-wide flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {post.date}
          </time>
        </div>
        
        {/* 제목: 긴 제목도 끊김 없이 한 줄로 흐르게 하는 흐르는 제목(Marquee) ticker 컨테이너 */}
        <div className="relative w-full overflow-hidden bg-white dark:bg-[#202124] border border-[var(--google-border)] rounded-xl py-3.5 px-4 select-none">
          <div className="animate-marquee hover:[animation-play-state:paused] cursor-pointer">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#202124] dark:text-[#e8eaed] tracking-tight pr-12">
              {post.title}
            </h1>
          </div>
          {/* 좌우 사이드 그라데이션 페이드 효과로 고급스러움 극대화 */}
          <div className="absolute top-0 left-0 h-full w-8 bg-linear-to-r from-white to-transparent dark:from-[#202124] pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-8 bg-linear-to-l from-white to-transparent dark:from-[#202124] pointer-events-none" />
        </div>

        
        {/* 요약 박스: 제목과 명확히 구분되는 세련된 구글 스타일 콜아웃 */}
        <div className="mt-8 p-5 sm:p-6 bg-[#e8f0fe] dark:bg-[#174ea6]/20 rounded-2xl border border-[var(--google-blue)] transition-colors">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <svg className="w-6 h-6 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <strong className="text-[var(--google-blue)] text-lg">핵심 요약</strong>
          </div>
          <p className="text-[#202124] dark:text-[#e8eaed] leading-[1.7] m-0 text-[15px] sm:text-[15.5px] break-keep">
            {post.summary}
          </p>
        </div>
      </header>
 
      {/* 본문 (Markdown 렌더링 - 본문 폰트 크기 미세 조절) */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] sm:text-[16px] leading-[1.8] break-keep
        prose-headings:font-bold prose-headings:text-[#202124] dark:prose-headings:text-[#e8eaed] prose-headings:tracking-tight
        prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-lg sm:prose-h2:text-xl
        prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-base sm:prose-h3:text-lg
        prose-p:mb-6 prose-p:text-[#202124] dark:prose-p:text-[#e8eaed]
        prose-a:text-[var(--google-blue)] dark:prose-a:text-[#8ab4f8] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-[#1557b0] transition-colors
        prose-strong:text-[#202124] dark:prose-strong:text-[#e8eaed] prose-strong:font-bold
        prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:leading-[1.8] prose-ol:leading-[1.8] prose-ul:leading-[1.8]
        
        prose-table:w-full prose-table:my-8 prose-table:text-[14px] prose-table:border-collapse prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow-sm prose-table:border prose-table:border-[var(--google-border)]
        prose-th:bg-[var(--google-surface-variant)] dark:prose-th:bg-[#303134] prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-[#202124] dark:prose-th:text-[#e8eaed]
        prose-td:p-4 prose-td:border-b prose-td:border-[var(--google-border)] prose-td:align-top
        prose-tr:transition-colors hover:prose-tr:bg-[#f8f9fa] dark:hover:prose-tr:bg-[#303134]/50
      ">
        <div className="overflow-x-auto pb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* 태그 목록 */}
      <footer className="mt-14 pt-8 border-t border-[var(--google-border)]">
        <div className="flex flex-wrap gap-2.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[13px] font-bold text-[#5f6368] dark:text-[#9aa0a6] bg-[var(--google-surface-variant)] dark:bg-[#303134] px-3.5 py-1.5 rounded-md border border-[var(--google-border)] hover:bg-[#e8eaed] dark:hover:bg-[#5f6368] transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}
