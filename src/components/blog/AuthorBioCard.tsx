import React from 'react';

export default function AuthorBioCard() {
  return (
    <div className="mt-12 rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8faff] to-[#eef3ff] dark:from-[#1c2033] dark:to-[#1a1f35] border border-[#1A73E8]/15 dark:border-[#1A73E8]/20">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        {/* 아바타 */}
        <div className="w-14 h-14 rounded-2xl bg-[#1A73E8] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(26,115,232,0.35)]">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[15px] font-extrabold text-gray-900 dark:text-white">보상스쿨 손해사정사</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8ab4f8] border border-[#1A73E8]/20">
              공인 손해사정사
            </span>
          </div>
          <p className="text-[13px] text-gray-600 dark:text-[#9aa0a6] leading-relaxed">
            교통사고·후유장해·실손의료비 보상 전문가로, 수백 건의 보험 분쟁을 직접 처리한 실무 경험을 바탕으로 소비자 권익 보호에 앞장서고 있습니다.
          </p>
          <div className="mt-3 flex items-center gap-3 text-[12px] text-[#1A73E8] dark:text-[#8ab4f8] font-bold">
            <a href="/about" className="hover:underline flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              저자 소개 보기
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-gray-400 dark:text-gray-500 font-normal">보상스쿨 공식 블로그</span>
          </div>
        </div>
      </div>
    </div>
  );
}
