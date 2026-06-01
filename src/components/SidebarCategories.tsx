'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// 1. 지역별 의료기관 카테고리
export function RegionalCategories() {
  const [openRegions, setOpenRegions] = useState<{ [key: string]: boolean }>({
    '서울특별시': true, // 서울 기본 열림
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
      districts: ['강남구', '서초구', '송파구']
    },
    {
      name: '부산광역시',
      districts: ['해운대구', '부산진구', '수영구']
    },
    {
      name: '인천광역시',
      districts: ['남동구', '부평구', '송도']
    },
    {
      name: '대구광역시',
      districts: ['중구', '수성구']
    },
    {
      name: '경기도',
      districts: ['수원시', '성남시', '고양시']
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
      <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200 mb-3.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
        🗺️ 지역별 의료기관
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
        {regions.map((region) => {
          const isOpen = !!openRegions[region.name];
          return (
            <li key={region.name} className="space-y-1">
              <button
                onClick={() => toggleRegion(region.name)}
                className="w-full flex items-center justify-between py-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-slate-800 dark:text-zinc-200"
              >
                <span className="flex items-center gap-1">📍 {region.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>
              {isOpen && (
                <ul className="pl-4 border-l-2 border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  {region.districts.map((district) => (
                    <li key={district}>
                      <Link href={`/blog?region=${district}`} className="hover:text-blue-500 dark:hover:text-blue-400 block py-0.5 transition-colors">
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

// 2. 상해별 보상 가이드 카테고리
export function InjuryCategories() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    '🦴 척추 골절 및 손상': true, // 기본 열림
  });

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const sections = [
    {
      title: '🦴 척추 골절 및 손상',
      items: ['척추압박골절', '척추탈구 및 고정술', '방출성골절']
    },
    {
      title: '🩹 관절 및 인대 손상',
      items: ['십자인대 파열', '회전근개 파열', '아킬레스건 파열', '손목/발목 골절']
    },
    {
      title: '🚗 교통사고 및 배상',
      items: ['교통사고 합의금', '일상생활배상책임', '산재 및 근재보험']
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
      <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200 mb-3.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
        🩹 상해별 보상 가이드
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
        {sections.map((section) => {
          const isOpen = !!openSections[section.title];
          return (
            <li key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between py-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-slate-800 dark:text-zinc-200"
              >
                <span>{section.title}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>
              {isOpen && (
                <ul className="pl-4 border-l-2 border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  {section.items.map((item) => (
                    <li key={item}>
                      <Link href={`/blog?category=${item}`} className="hover:text-blue-500 dark:hover:text-blue-400 block py-0.5 transition-colors">
                        • {item}
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

// 3. 질병별 보상 가이드 카테고리
export function DiseaseCategories() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    '🩻 척추 및 관절 질환': true, // 기본 열림
  });

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const sections = [
    {
      title: '🩻 척추 및 관절 질환',
      items: ['목/허리디스크', '척추관협착증', '오십견/퇴행성관절염']
    },
    {
      title: '🧠 뇌 및 심혈관 질환',
      items: ['뇌경색 / 뇌출혈', '급성 심근경색증', '협심증 보상']
    },
    {
      title: '🎗️ 주요 중증 질환',
      items: ['암 진단비 (일반/유사암)', '표적항암 치료비', '경계성 종양']
    },
    {
      title: '📑 실손의료비 및 비급여',
      items: ['도수치료 / MRI 실비', '비급여 보상 한도', '질병 수술비 청구']
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
      <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200 mb-3.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
        🩺 질병별 보상 가이드
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
        {sections.map((section) => {
          const isOpen = !!openSections[section.title];
          return (
            <li key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between py-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-slate-800 dark:text-zinc-200"
              >
                <span>{section.title}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>
              {isOpen && (
                <ul className="pl-4 border-l-2 border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  {section.items.map((item) => (
                    <li key={item}>
                      <Link href={`/blog?category=${item}`} className="hover:text-blue-500 dark:hover:text-blue-400 block py-0.5 transition-colors">
                        • {item}
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
