'use client';

import { useState } from 'react';
import AutoCalculator from './AutoCalculator';
import MedicalCalculator from './MedicalCalculator';

export default function CalculatorTabs() {
  const [activeTab, setActiveTab] = useState<'auto' | 'medical'>('auto');

  return (
    <div className="w-full mt-4">
      {/* Material Design 3 스타일 탭 네비게이션 */}
      <div className="flex bg-[#f8f9fa] dark:bg-[#303134] rounded-2xl p-1.5 mb-8 shadow-inner border border-[var(--google-border)]">
        <button
          onClick={() => setActiveTab('auto')}
          className={`relative flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
            activeTab === 'auto'
              ? 'bg-white text-[var(--google-blue)] dark:bg-[#202124] dark:text-[#8ab4f8] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          🚗 자동차보험 합의금
          {activeTab === 'auto' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--google-blue)] dark:bg-[#8ab4f8] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`relative flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
            activeTab === 'medical'
              ? 'bg-white text-[var(--google-green)] dark:bg-[#202124] dark:text-[#81c995] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          🏥 실손의료비
          {activeTab === 'medical' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--google-green)] dark:bg-[#81c995] rounded-full" />
          )}
        </button>
      </div>

      {/* 탭 콘텐츠 렌더링 영역 */}
      <div className="relative">
        {activeTab === 'auto' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AutoCalculator />
          </div>
        )}
        {activeTab === 'medical' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MedicalCalculator />
          </div>
        )}
      </div>
    </div>
  );
}
