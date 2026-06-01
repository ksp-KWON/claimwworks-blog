'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// 1. 대한민국 전체 행정구역 카테고리 (대분류 17개 시/도, 중분류 226개 시/군/구 전수조사 반영)
// 누락된 대한민국 행정구역이 전혀 없도록 전국의 모든 시/군/구를 공식 편제 기준으로 전수 수록
export function RegionalCategories() {
  const [openRegions, setOpenRegions] = useState<{ [key: string]: boolean }>({});

  const toggleRegion = (region: string) => {
    setOpenRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const regions = [
    {
      name: '서울특별시',
      districts: [
        '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', 
        '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', 
        '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
      ]
    },
    {
      name: '부산광역시',
      districts: [
        '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', 
        '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'
      ]
    },
    {
      name: '인천광역시',
      districts: [
        '강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'
      ]
    },
    {
      name: '대구광역시',
      districts: [
        '군위군', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'
      ]
    },
    {
      name: '광주광역시',
      districts: ['광산구', '남구', '동구', '북구', '서구']
    },
    {
      name: '대전광역시',
      districts: ['대덕구', '동구', '서구', '유성구', '중구']
    },
    {
      name: '울산광역시',
      districts: ['남구', '동구', '북구', '울주군', '중구']
    },
    {
      name: '세종특별자치시',
      districts: ['세종시']
    },
    {
      name: '경기도',
      districts: [
        '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', 
        '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', 
        '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', 
        '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'
      ]
    },
    {
      name: '강원특별자치도',
      districts: [
        '강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', 
        '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'
      ]
    },
    {
      name: '충청북도',
      districts: [
        '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'
      ]
    },
    {
      name: '충청남도',
      districts: [
        '계룡시', '금산군', '공주시', '논산시', '당진시', '부여군', '보령시', '서산시', 
        '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'
      ]
    },
    {
      name: '전북특별자치도',
      districts: [
        '고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'
      ]
    },
    {
      name: '전라남도',
      districts: [
        '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', 
        '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', 
        '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'
      ]
    },
    {
      name: '경상북도',
      districts: [
        '경산시', '경주시', '고령군', '구미시', '김천시', '문경시', '봉화군', '상주시', 
        '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', 
        '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'
      ]
    },
    {
      name: '경상남도',
      districts: [
        '거제시', '거창군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', 
        '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'
      ]
    },
    {
      name: '제주특별자치도',
      districts: ['제주시', '서귀포시']
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
                <ul className="pl-4 border-l-2 border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-[1.8]">
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

// 2. 대학병원 진료과목 기준 보상 가이드 카테고리 (진료과목 대분류, 보상/분쟁 대표병명 중분류)
export function SpecialtyDiseaseCategories() {
  const [openSpecialties, setOpenSpecialties] = useState<{ [key: string]: boolean }>({});

  const toggleSpecialty = (specialty: string) => {
    setOpenSpecialties(prev => ({
      ...prev,
      [specialty]: !prev[specialty]
    }));
  };

  const specialties = [
    {
      name: '🦴 정형외과 (OS)',
      diseases: [
        '척추압박골절',
        '회전근개 파열',
        '십자인대 파열',
        '아킬레스건 파열',
        '반월상 연골판 파열',
        '손목/발목 골절'
      ]
    },
    {
      name: '🧠 신경외과 (NS)',
      diseases: [
        '목/허리디스크(추간판탈출증)',
        '척추관협착증',
        '외상성 뇌출혈',
        '경추/요추 염좌'
      ]
    },
    {
      name: '🫀 내과 (IM)',
      diseases: [
        '급성 심근경색증',
        '협심증 보상 분쟁',
        '기왕증 기여도 산정'
      ]
    },
    {
      name: '🔪 외과 (GS)',
      diseases: [
        '하지정맥류 수술',
        '탈장 수술 보상',
        '갑상선암 소액암 분쟁'
      ]
    },
    {
      name: '🤰 산부인과 (OBGY)',
      diseases: [
        '자궁근종 (하이푸 시술)',
        '유방 섬유선종 (맘모톰 절제술)',
        '요실금 수술 실손 분쟁'
      ]
    },
    {
      name: '👁️ 안과 (OPH)',
      diseases: [
        '백내장 (다초점 렌즈 실손)',
        '황반변성 주사 치료',
        '녹내장 보상'
      ]
    },
    {
      name: '🧪 피부과 (DER) / 성형외과 (PS)',
      diseases: [
        '여드름/레이저 미용성 분쟁',
        '흉터 레이저 (핀홀 시술)',
        '도수치료/비급여 도포제 처방'
      ]
    },
    {
      name: '🚽 비뇨의학과 (URO)',
      diseases: [
        '전립선비대증 결찰술(유로리프트)',
        '요로결석 쇄석술'
      ]
    },
    {
      name: '🦷 치과 (DEN)',
      diseases: [
        '임플란트 치조골 이식술',
        '크라운/브릿지 보상'
      ]
    },
    {
      name: '🌿 한방의학과 (KM)',
      diseases: [
        '교통사고 첩약 처방',
        '추나요법 횟수 제한 분쟁'
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-xs border border-slate-200/60 dark:border-zinc-800/60">
      <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200 mb-3.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
        🩺 진료과목별 분쟁 가이드
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
        {specialties.map((specialty) => {
          const isOpen = !!openSpecialties[specialty.name];
          return (
            <li key={specialty.name} className="space-y-1">
              <button
                onClick={() => toggleSpecialty(specialty.name)}
                className="w-full flex items-center justify-between py-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-slate-800 dark:text-zinc-200"
              >
                <span>{specialty.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>
              {isOpen && (
                <ul className="pl-4 border-l-2 border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-[1.8]">
                  {specialty.diseases.map((disease) => (
                    <li key={disease}>
                      <Link href={`/blog?category=${disease}`} className="hover:text-blue-500 dark:hover:text-blue-400 block py-0.5 transition-colors">
                        • {disease}
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

// 하위 호환성을 위해 기존 컴포넌트 이름 유지형 래퍼
export function InjuryCategories() {
  return <SpecialtyDiseaseCategories />;
}

export function DiseaseCategories() {
  return null;
}
