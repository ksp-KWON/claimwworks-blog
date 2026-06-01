'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function RegionalCategories() {
  const [openRegions, setOpenRegions] = useState<{ [key: string]: boolean }>({
    '서울특별시': true, // Default open Seoul
  });

  const toggleRegion = (region: string) => {
    setOpenRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const regions = [
    {
      name: '서울특별시',
      districts: ['강남구', '서초구']
    },
    {
      name: '부산광역시',
      districts: ['해운대구', '부산진구']
    },
    {
      name: '인천광역시',
      districts: ['남동구']
    },
    {
      name: '대구광역시',
      districts: ['중구']
    },
    {
      name: '경기도',
      districts: ['수원시', '성남시']
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3.5 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
        📁 지역별 의료기관
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-350">
        {regions.map((region) => {
          const isOpen = !!openRegions[region.name];
          return (
            <li key={region.name} className="space-y-1">
              <button
                onClick={() => toggleRegion(region.name)}
                className="w-full flex items-center justify-between py-1 text-left hover:text-blue-600 transition-colors text-slate-800 dark:text-zinc-200"
              >
                <span>📍 {region.name}</span>
                <span className="text-[10px] text-slate-400">
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>
              {isOpen && (
                <ul className="pl-4 border-l border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  {region.districts.map((district) => (
                    <li key={district}>
                      <Link href={`/blog?region=${district}`} className="hover:text-blue-500 block py-0.5">
                        • {district}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DiagnosisCategories() {
  const [isOpen, setIsOpen] = useState(true);

  const diagnoses = [
    { name: '🦴 척추/골절 질환', desc: '목/허리디스크', query: '척추' },
    { name: '🦵 관절/연골 질환', desc: '인대파열/동요', query: '관절' },
    { name: '🧠 뇌/신경 질환', desc: '뇌진탕/상해', query: '신경' },
    { name: '🩹 단순 염좌/기타', desc: '일반상해', query: '염좌' }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 mb-3 text-left"
      >
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          📁 진단명별 분류
        </h3>
        <span className="text-[10px] text-slate-400">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-350">
          {diagnoses.map((diag) => (
            <li key={diag.name}>
              <Link href={`/blog?diag=${diag.query}`} className="hover:text-blue-600 flex justify-between items-center py-1">
                <span>{diag.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">{diag.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
