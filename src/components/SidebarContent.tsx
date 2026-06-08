'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import postsData from '@/lib/posts-data.json';
import { SpecialtyDiseaseCategories, RegionalCategories } from '@/components/SidebarCategories';

/**
 * MobileSidebarToggle
 *
 * 모바일(lg 미만)에서는 접기/펴기 버튼과 함께 사이드바를 표시합니다.
 * 데스크탑(lg 이상)에서는 항상 펼쳐진 상태로 표시됩니다.
 */
export default function SidebarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // 인기 태그 계산 (빈도수 기준 내림차순 정렬)
  const sortedTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    const posts = postsData as unknown as { tags?: string[] }[];
    posts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // 빈도수 높은 순 정렬
      .map(entry => entry[0]);
  }, []);

  const INITIAL_TAG_COUNT = 15;
  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, INITIAL_TAG_COUNT);
  const hasMoreTags = sortedTags.length > INITIAL_TAG_COUNT;

  return (
    <>
      {/* ── 모바일 전용 토글 버튼 (lg 이상에서는 숨김) ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[var(--background)] border border-[var(--google-border)] rounded-2xl text-sm font-bold text-[#202124] dark:text-[#e8eaed] hover:border-[var(--google-blue)] transition-colors"
        aria-expanded={isOpen}
        aria-controls="sidebar-content"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          카테고리 · 인기 키워드
        </span>
        <svg
          className={`w-4 h-4 text-[#5f6368] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── 사이드바 본문 (모바일: 토글 / 데스크탑: 항상 표시) ── */}
      <div
        id="sidebar-content"
        className={`space-y-6 ${isOpen ? 'block' : 'hidden'} lg:block`}
      >
        {/* 🚗 자동차보험 합의금 계산기 (우측 메뉴) */}
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-[var(--google-border)] shadow-sm hover:shadow-md hover:border-[var(--google-blue)] transition-all duration-300 group">
          <h3 className="text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2 flex items-center gap-2 border-l-4 border-[var(--google-blue)] pl-2.5">
            <span className="text-[var(--google-blue)] text-lg leading-none">🚗</span>
            자동차보험 합의금 계산기
          </h3>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mb-4 leading-relaxed">
            약관 지급기준(부상, 장해, 사망) 및 호프만계수를 적용한 정확한 예상 합의금을 확인하세요.
          </p>
          <Link href="/calculator/auto" className="flex items-center justify-center gap-2 w-full bg-[var(--google-blue)] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-[#174ea6] transition-colors shadow-sm">
            자동차보험 계산하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>

        {/* 🏥 실손의료비 보상 계산기 (우측 메뉴) */}
        <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-[var(--google-border)] shadow-sm hover:shadow-md hover:border-[var(--google-green)] transition-all duration-300 group">
          <h3 className="text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2 flex items-center gap-2 border-l-4 border-[var(--google-green)] pl-2.5">
            <span className="text-[var(--google-green)] text-lg leading-none">🏥</span>
            실손의료비 계산기
          </h3>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mb-4 leading-relaxed">
            급여/비급여 병원비, 약제비 본인부담금을 공제한 예상 실손 보상금을 산출해 보세요.
          </p>
          <Link href="/calculator/medical" className="flex items-center justify-center gap-2 w-full bg-[var(--google-green)] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-[#0d652d] transition-colors shadow-sm">
            실손의료비 계산하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>

        {/* 진료과목별 분쟁 가이드 */}
        <SpecialtyDiseaseCategories />

        {/* 지역별 의료기관 */}
        <RegionalCategories />

        {/* 인기 키워드 태그 */}
        <div className="bg-[var(--background)] p-5 rounded-2xl border border-[var(--google-border)]">
          <h3 className="text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-4 flex items-center gap-2 border-l-4 border-[var(--google-red)] pl-2.5">
            <svg className="w-4 h-4 text-[var(--google-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            인기 키워드 태그
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {visibleTags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--google-surface-variant)] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] border border-transparent hover:border-[var(--google-blue)] hover:text-[var(--google-blue)] transition-colors"
              >
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {tag}
              </Link>
            ))}
            
            {/* 더보기 / 접기 버튼 */}
            {hasMoreTags && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] border border-[#dadce0] dark:border-[#5f6368] hover:border-[var(--google-blue)] hover:text-[var(--google-blue)] transition-colors"
              >
                {showAllTags ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    접기
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    더보기 (+{sortedTags.length - INITIAL_TAG_COUNT})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
