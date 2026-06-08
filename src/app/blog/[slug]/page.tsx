import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import type { Metadata } from 'next';
import BlogPostContent from '@/components/BlogPostContent';

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
      title: '포스트를 찾을 수 없습니다 | 보상스쿨 손해사정 보상가이드',
    };
  }

  return {
    title: `${post.title} | 보상스쿨 손해사정 보상가이드`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: {
      canonical: `https://claimworks-blog.pages.dev/blog/${slug}`,
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
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          목록으로 돌아가기
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
          {post.specialtyCategory && (
            <span className="px-2.5 py-1 font-bold rounded-md bg-[#e8f0fe] dark:bg-[#174ea6]/20 text-[var(--google-blue)] dark:text-[#8ab4f8] text-xs">
              {post.specialtyCategory}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#202124] dark:text-[#e8eaed] tracking-tight leading-snug">
          {post.title}
        </h1>


      </header>

      {/* 본문 — 새로운 BlogPostContent 컴포넌트로 렌더링 */}
      <BlogPostContent content={post.content} summary={post.summary} />

      {/* 태그 목록 */}
      <footer className="mt-14 pt-8 border-t border-[var(--google-border)]">
        <div className="flex flex-wrap gap-2.5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="text-[13px] font-bold text-[var(--google-blue)] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#174ea6]/20 px-3.5 py-1.5 rounded-full border border-[var(--google-blue)]/20 hover:bg-[#d2e3fc] dark:hover:bg-[#174ea6]/40 transition-colors cursor-pointer"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </footer>
    </article>
  );
}
