'use client';

import { useState } from 'react';
import { SpecialtyDiseaseCategories, RegionalCategories } from '@/components/SidebarCategories';

/**
 * MobileSidebarToggle
 *
 * 모바일(lg 미만)에서는 접기/펴기 버튼과 함께 사이드바를 표시합니다.
 * 데스크탑(lg 이상)에서는 항상 펼쳐진 상태로 표시됩니다.
 */
export default function SidebarContent() {
  const [isOpen, setIsOpen] = useState(false);

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
        {/* 진료과목별 분쟁 가이드 */}
        <SpecialtyDiseaseCategories />

        {/* 지역별 의료기관 */}
        <RegionalCategories />

        {/* 인기 키워드 태그 */}
        <div className="bg-[var(--background)] p-5 rounded-2xl border border-[var(--google-border)]">
          <h3 className="text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-4 pb-2 border-b border-[var(--google-border)] flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--google-yellow)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            인기 키워드 태그
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {['교통사고합의금', '지불보증', '후유장해', '비급여비용', '도수치료비', 'MRI검사비', '손해사정'].map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--google-surface-variant)] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] border border-transparent hover:border-[var(--google-blue)] hover:text-[var(--google-blue)] transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
