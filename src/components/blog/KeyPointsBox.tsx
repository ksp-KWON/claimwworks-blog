import React from 'react';

interface KeyPointsBoxProps {
  points: string[];
}

export default function KeyPointsBox({ points }: KeyPointsBoxProps) {
  return (
    <div className="mb-10 rounded-2xl overflow-hidden bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A73E8]" />
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#1A73E8] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-[13px] font-extrabold text-gray-900 dark:text-white uppercase tracking-[0.1em]">Key Points</span>
      </div>
      <ul className="px-4 py-4 space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#8ab4f8] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span
              className="text-[15px] text-gray-800 dark:text-[#e8eaed] leading-[1.7]"
              dangerouslySetInnerHTML={{
                __html: point.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#1A73E8">$1</strong>'),
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
