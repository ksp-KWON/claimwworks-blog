'use client';

import React, { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQBoxProps {
  items: FAQItem[];
}

export default function FAQBox({ items }: FAQBoxProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="my-12 rounded-2xl overflow-hidden bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#7C4DFF]" />
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#EDE7F6] dark:bg-[#7C4DFF]/20 flex items-center justify-center shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <p className="font-extrabold text-gray-900 dark:text-white text-[16px] tracking-tight">
            자주 묻는 질문 FAQ TOP {items.length}
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            항목을 클릭하면 답변을 확인할 수 있습니다
          </p>
        </div>
      </div>

      {/* 항목들 */}
      <div className="bg-white dark:bg-[#202124] divide-y divide-gray-100 dark:divide-white/5">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-[#303134] transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[13px] font-bold flex items-center justify-center shrink-0 transition-colors">
                Q{i + 1}
              </span>
              <span className={`flex-1 text-[15px] transition-colors break-keep ${openIdx === i ? 'font-extrabold text-[#7C4DFF] dark:text-[#ce93d8]' : 'font-semibold text-gray-800 dark:text-[#e8eaed]'}`}>
                {item.q}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openIdx === i ? 'rotate-180 text-[#7C4DFF]' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openIdx === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-4 pb-4 pt-1.5">
                <div className="flex gap-3.5 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                  <span className="w-8 h-8 rounded-full bg-[#7C4DFF] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                    A
                  </span>
                  <div
                    className="text-[14.5px] text-gray-700 dark:text-gray-300 leading-[1.8] flex-1 break-keep"
                    dangerouslySetInnerHTML={{
                      __html: item.a.replace(
                        /\*\*(.+?)\*\*/g,
                        '<strong style="font-weight:800;color:#202124" class="dark:text-white">$1</strong>'
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
