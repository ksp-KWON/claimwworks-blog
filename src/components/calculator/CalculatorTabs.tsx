'use client';

import { useState } from 'react';
import AutoCalculator from './AutoCalculator';
import MedicalCalculator from './MedicalCalculator';

export default function CalculatorTabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'intro' | 'auto' | 'medical'>('intro');

  return (
    <div className="w-full mt-4">
      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--google-border)] pb-4">
        <button
          onClick={() => setActiveTab('intro')}
          className={`px-4 py-2 text-sm sm:text-base font-bold rounded-full transition-colors border ${
            activeTab === 'intro'
              ? 'bg-[var(--google-surface-variant)] text-[#202124] dark:bg-[#303134] dark:text-[#e8eaed] border-transparent'
              : 'bg-transparent text-[#5f6368] dark:text-[#9aa0a6] border-transparent hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]'
          }`}
        >
          플랫폼 소개
        </button>
        <button
          onClick={() => setActiveTab('auto')}
          className={`px-4 py-2 text-sm sm:text-base font-bold rounded-full transition-colors border ${
            activeTab === 'auto'
              ? 'bg-[#e8f0fe] text-[var(--google-blue)] dark:bg-[#1A73E8]/20 dark:text-[#8ab4f8] border-[var(--google-blue)]/20'
              : 'bg-transparent text-[#5f6368] dark:text-[#9aa0a6] border-transparent hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]'
          }`}
        >
          🚗 교통사고 합의금 계산기
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`px-4 py-2 text-sm sm:text-base font-bold rounded-full transition-colors border ${
            activeTab === 'medical'
              ? 'bg-[#e6f4ea] text-[var(--google-green)] dark:bg-[#34A853]/20 dark:text-[#81c995] border-[var(--google-green)]/20'
              : 'bg-transparent text-[#5f6368] dark:text-[#9aa0a6] border-transparent hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]'
          }`}
        >
          🏥 실손의료비 계산기
        </button>
      </div>

      {/* 탭 콘텐츠 렌더링 영역 */}
      {activeTab === 'intro' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>}
      {activeTab === 'auto' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500"><AutoCalculator /></div>}
      {activeTab === 'medical' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500"><MedicalCalculator /></div>}
    </div>
  );
}
