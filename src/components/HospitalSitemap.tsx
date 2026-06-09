'use client';

/**
 * HospitalSitemap
 *
 * 지역(구/군) 선택 시 블로그 본문 영역에 사이트맵처럼 표시되는 병원 목록 컴포넌트.
 *
 * 동작:
 * 1. 지역 + 진료과목별로 병원 수를 카드 형태로 표시
 * 2. 진료과목 클릭 → 드롭다운 팝업 (전체 + 치료 가능 병명 목록)
 * 3. 병명 클릭 → 해당 병명 상세 페이지 링크
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface SpecialtyData {
  count: number;
  diseases: string[];
  hospitals: { name: string; address: string; tel: string }[];
}

interface HospitalSitemapProps {
  region: string;          // 예: "강남구"
  sido: string;            // 예: "서울특별시"
  specialties: Record<string, SpecialtyData>;
}

// ─── 진료과목 카드 (팝업 포함) ───
function SpecialtyCard({ specialtyName, data, region, sido }: {
  specialtyName: string;
  data: SpecialtyData;
  region: string;
  sido: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const changeDisease = (disease: string | null) => {
    setSelectedDisease(disease);
    setPage(1);
  };

  // 바깥 클릭 시 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 현재 보여줄 병원 목록 계산
  const filteredHospitals = data.hospitals;
  const totalPages = Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE);
  const visibleHospitals = filteredHospitals.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div ref={cardRef} className={`relative ${open ? 'z-50' : 'z-10'}`}>
      {/* 진료과목 카드 버튼 */}
      <button
        onClick={() => { setOpen(prev => !prev); changeDisease(null); }}
        className={`
          w-full flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 bg-[var(--background)] dark:bg-[#202124] border-[var(--google-border)]
          hover:shadow-sm hover:border-[var(--google-blue)] hover:-translate-y-0.5
          ${open ? 'shadow-md border-[var(--google-blue)] ring-1 ring-[var(--google-blue)]' : ''}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--google-surface-variant)] dark:bg-[#303134] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div className="text-left min-w-0">
            <div className={`text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate`}>
              {specialtyName}
            </div>
            <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
              조회 결과 <span className="font-bold text-[var(--google-blue)]">{data.count.toLocaleString()}</span>건
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[#5f6368] dark:text-[#9aa0a6] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
      </button>

      {/* 팝업 드롭다운 */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-[#202124] rounded-xl shadow-lg border border-[var(--google-border)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 팝업 헤더 */}
          <div className={`px-4 py-3 bg-[var(--google-surface-variant)] dark:bg-[#303134] border-b border-[var(--google-border)] flex items-center justify-between`}>
            <span className={`text-sm font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2`}>
              <svg className="w-4 h-4 text-[#5f6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {region} · {specialtyName}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-[#5f6368] hover:text-[#202124] dark:hover:text-[#e8eaed] p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* 병명 필터 목록 */}
          <div className="p-4">
            <div className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              치료 가능 병명 선택
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* 전체 버튼 */}
              <button
                onClick={() => changeDisease(null)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  selectedDisease === null
                    ? `bg-[var(--google-blue)] text-white border-[var(--google-blue)] shadow-sm`
                    : 'bg-white dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] border-[var(--google-border)] hover:bg-[var(--google-surface-variant)] dark:hover:bg-[#303134]'
                }`}
              >
                전체
              </button>
              {/* 병명 버튼들 */}
              {data.diseases.map((disease) => (
                <button
                  key={disease}
                  onClick={() => changeDisease(disease === selectedDisease ? null : disease)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    selectedDisease === disease
                      ? `bg-[var(--google-blue)] text-white border-[var(--google-blue)] shadow-sm`
                      : 'bg-white dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] border-[var(--google-border)] hover:bg-[var(--google-surface-variant)] dark:hover:bg-[#303134]'
                  }`}
                >
                  {disease}
                </button>
              ))}
            </div>

            {/* 병원 목록 */}
            {/* 병원 목록 */}
            {visibleHospitals.length > 0 ? (
              <div className="space-y-2 pr-1">
                <div className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  {selectedDisease ? `${selectedDisease} 취급 병원` : '전체 병원 목록'}
                </div>
                {visibleHospitals.map((hosp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#202124] border border-[var(--google-border)] hover:border-[var(--google-blue)] hover:shadow-sm transition-all">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--google-surface-variant)] dark:bg-[#303134] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate">{hosp.name}</div>
                      {hosp.address && (
                        <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] truncate flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          {hosp.address}
                        </div>
                      )}
                      {hosp.tel && (
                        <a href={`tel:${hosp.tel}`} className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[11px] font-bold text-[var(--google-blue)] bg-[#e8f0fe] dark:bg-[#174ea6]/30 rounded hover:bg-[#d2e3fc] transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          {hosp.tel}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-[#5f6368] dark:text-[#9aa0a6] bg-[var(--background)] dark:bg-[#202124] rounded-xl border border-[var(--google-border)]">
                <svg className="w-8 h-8 mx-auto text-[#dadce0] dark:text-[#5f6368] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                병원 상세 정보를 수집 중입니다.
              </div>
            )}

            {/* 페이징 버튼 */}
            {totalPages > 1 && visibleHospitals.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--google-border)]">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#202124] text-[var(--google-blue)] dark:text-[#8ab4f8] rounded-full border border-[var(--google-border)] disabled:opacity-40 hover:bg-[var(--google-surface-variant)] transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  이전
                </button>
                <span className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] bg-[var(--google-surface-variant)] dark:bg-[#303134] px-2.5 py-1 rounded-full">
                  <strong className="text-[#202124] dark:text-[#e8eaed]">{page}</strong> / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#202124] text-[var(--google-blue)] dark:text-[#8ab4f8] rounded-full border border-[var(--google-border)] disabled:opacity-40 hover:bg-[var(--google-surface-variant)] transition-colors"
                >
                  다음
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}

            {/* 더보기 링크 */}
            <div className="mt-4 pt-3 border-t border-[var(--google-border)]">
              <Link
                href={`/blog?sido=${encodeURIComponent(sido)}&region=${encodeURIComponent(region)}&specialty=${encodeURIComponent(specialtyName)}${selectedDisease ? `&disease=${encodeURIComponent(selectedDisease)}` : ''}`}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm font-bold transition-all bg-[var(--google-blue)] text-white hover:bg-[#1557b0] hover:shadow-md"
              >
                {region} {specialtyName} 전체 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ───
export default function HospitalSitemap({ region, sido, specialties }: HospitalSitemapProps) {
  const totalHospitals = Object.values(specialties).reduce((sum, sp) => sum + sp.count, 0);
  const specialtyList = Object.entries(specialties).sort((a, b) => b[1].count - a[1].count);

  return (
    <article className="bg-white dark:bg-[#202124] rounded-[24px] sm:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">

      {/* 상단 헤더 */}
      <div className="px-4 py-5 sm:px-6 border-b border-[var(--google-border)] bg-[#f8f9fa] dark:bg-[#303134]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--google-blue)] dark:text-[#8ab4f8] font-bold mb-1.5">
              <span>🗺️</span>
              <span>{sido}</span>
              <span className="text-[#dadce0] dark:text-[#5f6368]">›</span>
              <span>{region}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight">
              {region} 의료기관 안내
            </h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1.5 leading-relaxed">
              공인·검증된 의료기관 정보를 진료과목별로 안내합니다.<br />
              <span className="text-[var(--google-blue)] dark:text-[#8ab4f8] font-semibold">진료과목을 클릭</span>하시면 치료 가능 병명과 병원 목록을 확인하실 수 있습니다.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-[var(--google-blue)] dark:text-[#8ab4f8]">{totalHospitals.toLocaleString()}</div>
            <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6] font-medium">총 등록 의료기관</div>
            <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{specialtyList.length}개 진료과목</div>
          </div>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="mx-4 sm:mx-6 mt-5 p-3.5 bg-[#fef7e0] dark:bg-[#e37400]/10 border border-[#fde293] dark:border-[#e37400]/30 rounded-xl flex items-start gap-2.5">
        <span className="text-base shrink-0 mt-0.5">⚠️</span>
        <p className="text-xs text-[#ea8600] dark:text-[#fde293] leading-relaxed font-bold">
          본 의료기관 정보는 건강보험심사평가원(HIRA) 공개 데이터 기반입니다. 
          개별 진료 가능 여부는 해당 병원에 직접 확인하시기 바랍니다.
        </p>
      </div>

      {/* 진료과목별 카드 그리드 */}
      <div className="p-4 sm:p-6">
        <div className="text-xs font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide mb-4">
          📋 진료과목별 의료기관 현황
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specialtyList.map(([specialtyName, data]) => (
            <SpecialtyCard
              key={specialtyName}
              specialtyName={specialtyName}
              data={data}
              region={region}
              sido={sido}
            />
          ))}
        </div>
      </div>

      {/* 하단 SEO 텍스트 */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="p-4 bg-[#f8f9fa] dark:bg-[#303134] rounded-2xl border border-[var(--google-border)] shadow-sm">
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed break-keep">
            <strong className="text-[#202124] dark:text-[#e8eaed]">{region}</strong>에서 교통사고·상해 치료를 받으셨거나, 
            보험사와의 합의금 분쟁으로 어려움을 겪고 계신다면 
            <strong className="text-[var(--google-blue)] dark:text-[#8ab4f8]"> 보상스쿨 전문가 그룹</strong>에 무료 상담을 신청해 주세요.
            거주지 및 근무지 인근 의료기관 선택부터 정당한 보험금 청구까지 도와드립니다.
          </p>
        </div>
      </div>
    </article>
  );
}
