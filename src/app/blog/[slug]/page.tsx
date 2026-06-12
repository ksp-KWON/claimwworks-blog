import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import type { Metadata } from 'next';
import BlogPostContent from '@/components/BlogPostContent';

export const dynamicParams = false;

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

  const ogImageUrl = `https://claim-works.com/blog/${slug}/opengraph-image`;

  return {
    title: `${post.title} | 보상스쿨 손해사정 보상가이드`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ['보상스쿨 손해사정사'],
      siteName: '보상스쿨 헬스케어 & 손해사정 보상가이드',
      locale: 'ko_KR',
      url: `https://claim-works.com/blog/${slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://claim-works.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  // FAQ 파싱 헬퍼 (마크다운 본문에서 동적으로 FAQ 스키마 생성용 데이터 추출)
  const lines = post.content.split('\n');
  const faqs: { q: string; a: string }[] = [];
  let inFAQSection = false;
  let currentQ = '';
  let currentA = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed) && /(?:faq|자주\s*묻는)/i.test(trimmed)) {
      inFAQSection = true;
      continue;
    }
    if (inFAQSection) {
      if (/^##\s+/.test(trimmed)) break; // 다음 H2 대제목을 만나면 종료
      if (/^###\s+/.test(trimmed)) {
        if (currentQ) faqs.push({ q: currentQ, a: currentA.trim() });
        currentQ = trimmed.replace(/^###\s*/, '').replace(/^[Q\d.\s#]+/i, '').trim();
        currentA = '';
      } else if (currentQ) {
        if (trimmed === '---') continue;
        currentA += line + '\n';
      }
    }
  }
  if (currentQ) faqs.push({ q: currentQ, a: currentA.trim() });

  const postUrl = `https://claim-works.com/blog/${slug}`;
  const ogImageUrl = `https://claim-works.com/blog/${slug}/opengraph-image`;

  // 1. BlogPosting 구조화 데이터 (구글 리치결과 완전 자격 요건 충족)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary,
    "datePublished": post.date,
    "dateModified": post.date,
    "url": postUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "image": {
      "@type": "ImageObject",
      "url": ogImageUrl,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": "보상스쿨 손해사정사",
      "url": "https://claim-works.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "보상스쿨",
      "url": "https://claim-works.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://claim-works.com/favicon.ico",
        "width": 32,
        "height": 32
      }
    },
    "inLanguage": "ko-KR",
    "keywords": post.tags?.join(', ') ?? ''
  };

  // 2. Breadcrumb 구조화 데이터
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://claim-works.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "블로그",
        "item": "https://claim-works.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": postUrl
      }
    ]
  };

  // 3. FAQ 구조화 데이터 (존재하는 경우에만 생성)
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a.replace(/\*\*/g, '').replace(/<[^>]*>/g, '') // 마크다운 볼드 및 HTML 태그 제거
      }
    }))
  } : null;

  return (
    <article className="w-full bg-white dark:bg-[#202124] rounded-none sm:rounded-3xl py-6 sm:p-10 lg:p-12 border-y sm:border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

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
      <BlogPostContent content={post.content} />

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
