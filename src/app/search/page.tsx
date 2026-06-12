'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

// 포스트 데이터 타입
type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 환경에서 /data/posts-data.json을 fetch하여 검색
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/data/posts-data.json');
        if (res.ok) {
          const allPosts: Post[] = await res.json();
          const filtered = allPosts.filter(post => 
            post.title.toLowerCase().includes(q.toLowerCase()) || 
            post.summary.toLowerCase().includes(q.toLowerCase()) ||
            post.content.toLowerCase().includes(q.toLowerCase())
          );
          setResults(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch posts for search', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (q) {
      fetchPosts();
    } else {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--google-border)] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#202124] dark:text-[#e8eaed]">
          {q ? (
            <><span className="text-[var(--google-blue)]">&quot;{q}&quot;</span> 검색 결과</>
          ) : (
            <>검색어를 입력해주세요</>
          )}
        </h1>
        <p className="text-[#5f6368] dark:text-[#9aa0a6] mt-2">
          {isLoading ? '검색 중...' : `총 ${results.length}건의 문서가 검색되었습니다.`}
        </p>
      </div>

      {!isLoading && (
        <div className="space-y-4 px-3 sm:px-0">
          {results.length > 0 ? (
            results.map((post) => (
              <article
                key={post.slug}
                className="bg-white dark:bg-[#202124] rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
              >
                <Link href={`/blog/${post.slug}`} className="block group">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#202124] dark:text-[#e8eaed] mb-2 group-hover:text-[var(--google-blue)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                      {post.date}
                    </span>
                  </div>
                </Link>
              </article>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#202124] rounded-none sm:rounded-[24px] border-y sm:border border-gray-100 dark:border-white/5 shadow-sm">
              <svg className="w-12 h-12 text-[#dadce0] dark:text-[#5f6368] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <p className="text-sm font-bold tracking-wide text-[#5f6368] dark:text-[#9aa0a6]">
                일치하는 검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
