'use client';

import { useState, useRef, useEffect } from 'react';

// --- 상수 매핑 ---
const ALIMONY_BY_GRADE: Record<number, number> = {
  1: 2000000, 2: 1760000, 3: 1520000, 4: 1280000,
  5: 750000, 6: 500000, 7: 400000, 8: 300000,
  9: 250000, 10: 200000, 11: 200000, 12: 150000,
  13: 150000, 14: 150000,
};

const CARE_DAYS_BY_GRADE: Record<number, number> = {
  1: 60, 2: 60, 3: 30, 4: 30, 5: 15
};

const DAILY_WAGE = 122718; // 2024년 상반기 도시일용임금 기준 (약 12.2만)

const HOFFMANN_MAP = [
  { label: '한시 1년 (12개월)', value: 11.45 },
  { label: '한시 2년 (24개월)', value: 22.25 },
  { label: '한시 3년 (36개월)', value: 32.44 },
  { label: '한시 5년 (60개월)', value: 51.68 },
  { label: '한시 10년 (120개월)', value: 98.77 },
  { label: '영구/가동종료 (240개월)', value: 164.74 },
  { label: '영구/가동종료 (360개월)', value: 209.78 },
];

export default function AutoCalculator() {
  // --- 공통 상태 ---
  const [faultRatio, setFaultRatio] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3500000); 
  
  // --- 모드 스위치 ---
  const [isInjury, setIsInjury] = useState<boolean>(true);
  const [isDisability, setIsDisability] = useState<boolean>(false);
  const [isDeath, setIsDeath] = useState<boolean>(false);

  // --- 부상 상태 ---
  const [injuryGrade, setInjuryGrade] = useState<number>(12);
  const [hospitalDays, setHospitalDays] = useState<number>(0);
  const [clinicDays, setClinicDays] = useState<number>(0);

  // --- 장해 상태 ---
  const [laborLoss, setLaborLoss] = useState<number>(0);
  const [disabilityHoffmann, setDisabilityHoffmann] = useState<number>(32.44); 

  // --- 사망 상태 ---
  const [isUnder65, setIsUnder65] = useState<boolean>(true);
  const [deathHoffmann, setDeathHoffmann] = useState<number>(164.74);

  // 스크롤 제어용
  const resultsRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 계산 로직 (약관 기준)
  // ==========================================
  const faultFactor = Math.max(0, 1 - (faultRatio / 100));

  // 1. 위자료 (Max Rule 적용)
  let injuryAlimony = isInjury ? ALIMONY_BY_GRADE[injuryGrade] : 0;
  
  let disabilityAlimony = 0;
  if (isDisability && laborLoss > 0) {
    if (laborLoss >= 50) {
      disabilityAlimony = (isUnder65 ? 80000000 : 50000000) * (laborLoss / 100) * 0.85;
    } else {
      if (laborLoss >= 35) disabilityAlimony = 4000000;
      else if (laborLoss >= 30) disabilityAlimony = 3000000;
      else if (laborLoss >= 25) disabilityAlimony = 2500000;
      else if (laborLoss >= 20) disabilityAlimony = 2000000;
      else if (laborLoss >= 15) disabilityAlimony = 1500000;
      else if (laborLoss >= 10) disabilityAlimony = 1000000;
      else if (laborLoss >= 5) disabilityAlimony = 500000;
      else disabilityAlimony = 0;
    }
  }

  let deathAlimony = 0;
  if (isDeath) {
    deathAlimony = isUnder65 ? 80000000 : 50000000;
  }

  // 병합: 가장 큰 위자료 1개만 산정
  const rawMaxAlimony = Math.max(injuryAlimony, disabilityAlimony, deathAlimony);
  let activeAlimonyLabel = '위자료';
  if (rawMaxAlimony === deathAlimony && isDeath) activeAlimonyLabel = '사망 위자료';
  else if (rawMaxAlimony === disabilityAlimony && isDisability) activeAlimonyLabel = '후유장해 위자료';
  else if (isInjury) activeAlimonyLabel = `부상 위자료 (${injuryGrade}급)`;

  const finalAlimony = rawMaxAlimony * faultFactor;

  // 2. 부상: 휴업손해, 기타손해, 간병비
  let lostIncome = 0;
  let miscDamages = 0;
  let careCost = 0;
  if (isInjury) {
    lostIncome = (monthlyIncome / 30) * hospitalDays * 0.85 * faultFactor;
    miscDamages = clinicDays * 8000 * faultFactor;
    if (injuryGrade <= 5) {
      careCost = CARE_DAYS_BY_GRADE[injuryGrade] * DAILY_WAGE * faultFactor;
    }
  }

  // 3. 장해: 상실수익액
  let disabilityLFI = 0;
  if (isDisability) {
    disabilityLFI = monthlyIncome * (laborLoss / 100) * disabilityHoffmann * faultFactor;
  }

  // 4. 사망: 상실수익액, 장례비
  let deathLFI = 0;
  let funeralFee = 0;
  if (isDeath) {
    deathLFI = monthlyIncome * (2 / 3) * deathHoffmann * faultFactor;
    funeralFee = 5000000 * faultFactor;
  }

  const total = finalAlimony + lostIncome + miscDamages + careCost + disabilityLFI + deathLFI + funeralFee;

  return (
    <div className="bg-white dark:bg-[#202124] rounded-2xl border border-[var(--google-border)] shadow-sm p-5 sm:p-7 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--google-border)]">
        <div className="w-10 h-10 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 flex items-center justify-center text-[var(--google-blue)] dark:text-[#8ab4f8]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#202124] dark:text-[#e8eaed]">고급 자동차보험 합의금 계산기</h3>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">약관 지급기준 및 호프만계수 적용 (다중 병합 지원)</p>
        </div>
      </div>

      {/* 공통 입력: 월 소득 & 과실 */}
      <div className="bg-[#f8f9fa] dark:bg-[#303134] p-4 sm:p-5 rounded-xl mb-6 space-y-5 border border-[var(--google-border)]">
        <h4 className="text-sm font-bold text-[#1A73E8] dark:text-[#8ab4f8] flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          공통 기준 입력
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#5f6368] dark:text-[#9aa0a6] mb-2">월 평균 소득 (세전)</label>
            <div className="relative">
              <input 
                type="number" step="100000"
                value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#202124] border border-[var(--google-border)] rounded-lg py-2.5 pl-3 pr-10 text-sm text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[var(--google-blue)] focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-[#5f6368] text-sm">원</span>
            </div>
            <p className="text-[10.5px] text-[#5f6368] mt-1.5">* 입증 불가 시 도시일용근로자 임금 적용</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-[#5f6368] dark:text-[#9aa0a6]">본인 과실 비율</label>
              <span className="text-[var(--google-blue)] font-bold text-sm">{faultRatio}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="10"
              value={faultRatio} onChange={(e) => setFaultRatio(Number(e.target.value))}
              className="w-full h-2 bg-[#e8eaed] dark:bg-[#5f6368] rounded-lg appearance-none cursor-pointer accent-[var(--google-blue)] mt-1"
            />
            <div className="flex justify-between text-[10px] text-[#5f6368] mt-1.5">
              <span>무과실(0)</span>
              <span>쌍방(50)</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 복합 토글 스위치 영역 */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-3">피해 상황 (다중 선택 가능)</label>
        <div className="flex flex-wrap gap-2.5">
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-colors ${isInjury ? 'bg-[#e8f0fe] border-[#1A73E8] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8ab4f8]' : 'bg-white border-[#dadce0] text-[#5f6368] dark:bg-[#202124] dark:border-[#5f6368] dark:text-[#9aa0a6]'}`}>
            <input type="checkbox" className="hidden" checked={isInjury} onChange={(e) => setIsInjury(e.target.checked)} />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isInjury ? 'border-[#1A73E8] bg-[#1A73E8]' : 'border-[#dadce0]'}`}>
              {isInjury && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span className="text-sm font-bold">부상 (상해)</span>
          </label>

          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-colors ${isDisability ? 'bg-[#fef7e0] border-[#f29900] text-[#ea8600] dark:bg-[#e37400]/20 dark:text-[#fde293]' : 'bg-white border-[#dadce0] text-[#5f6368] dark:bg-[#202124] dark:border-[#5f6368] dark:text-[#9aa0a6]'}`}>
            <input type="checkbox" className="hidden" checked={isDisability} onChange={(e) => setIsDisability(e.target.checked)} />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isDisability ? 'border-[#f29900] bg-[#f29900]' : 'border-[#dadce0]'}`}>
              {isDisability && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span className="text-sm font-bold">후유장해</span>
          </label>

          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-colors ${isDeath ? 'bg-[#fce8e6] border-[#d93025] text-[#d93025] dark:bg-[#c5221f]/20 dark:text-[#f28b82]' : 'bg-white border-[#dadce0] text-[#5f6368] dark:bg-[#202124] dark:border-[#5f6368] dark:text-[#9aa0a6]'}`}>
            <input type="checkbox" className="hidden" checked={isDeath} onChange={(e) => setIsDeath(e.target.checked)} />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isDeath ? 'border-[#d93025] bg-[#d93025]' : 'border-[#dadce0]'}`}>
              {isDeath && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span className="text-sm font-bold">사망</span>
          </label>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {/* ================= 부상 폼 ================= */}
        {isInjury && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300 border-l-4 border-[#1A73E8] pl-4 py-2 space-y-4">
            <h5 className="text-[13px] font-bold text-[#1A73E8] dark:text-[#8ab4f8]">부상 상세 입력</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">상해 급수</label>
                <select 
                  value={injuryGrade} onChange={(e) => setInjuryGrade(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-md p-2 text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none"
                >
                  {[...Array(14)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}급 {i+1 >= 12 ? '(염좌/타박상)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">입원 일수</label>
                  <input type="number" min="0" value={hospitalDays} onChange={(e) => setHospitalDays(Number(e.target.value))} className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-md p-2 text-sm text-center focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">통원 일수</label>
                  <input type="number" min="0" value={clinicDays} onChange={(e) => setClinicDays(Number(e.target.value))} className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-md p-2 text-sm text-center focus:outline-none" />
                </div>
              </div>
            </div>
            {injuryGrade <= 5 && (
              <p className="text-[11px] text-[var(--google-green)] font-bold">✨ 중증 상해(1~5급)에 해당하여 간병비가 산정됩니다.</p>
            )}
          </div>
        )}

        {/* ================= 후유장해 폼 ================= */}
        {isDisability && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300 border-l-4 border-[#f29900] pl-4 py-2 space-y-4 mt-2">
            <h5 className="text-[13px] font-bold text-[#ea8600] dark:text-[#fde293]">후유장해 상세 입력</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">노동능력상실율 (맥브라이드)</label>
                <div className="relative">
                  <input 
                    type="number" min="0" max="100"
                    value={laborLoss} onChange={(e) => setLaborLoss(Number(e.target.value))}
                    className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-md p-2 pr-8 text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-[#5f6368] text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">장해 판정 기간 (호프만계수)</label>
                <select 
                  value={disabilityHoffmann} onChange={(e) => setDisabilityHoffmann(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-md p-2 text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none"
                >
                  {HOFFMANN_MAP.map(opt => (
                    <option key={opt.label} value={opt.value}>{opt.label} (계수: {opt.value})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= 사망 폼 ================= */}
        {isDeath && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300 border-l-4 border-[#d93025] pl-4 py-2 space-y-4 mt-2">
            <h5 className="text-[13px] font-bold text-[#d93025] dark:text-[#f28b82]">사망 상세 입력</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">사망 시 연령</label>
                <div className="flex gap-2">
                  <button onClick={() => setIsUnder65(true)} className={`flex-1 py-1.5 text-xs rounded-md border ${isUnder65 ? 'bg-[#fce8e6] border-[#d93025] text-[#d93025] font-bold' : 'bg-transparent border-[#dadce0] text-[#5f6368]'}`}>65세 미만</button>
                  <button onClick={() => setIsUnder65(false)} className={`flex-1 py-1.5 text-xs rounded-md border ${!isUnder65 ? 'bg-[#fce8e6] border-[#d93025] text-[#d93025] font-bold' : 'bg-transparent border-[#dadce0] text-[#5f6368]'}`}>65세 이상</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5f6368] mb-1.5">남은 가동연한 (호프만계수)</label>
                <select 
                  value={deathHoffmann} onChange={(e) => setDeathHoffmann(Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-md p-2 text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none"
                >
                  {HOFFMANN_MAP.map(opt => (
                    <option key={opt.label} value={opt.value}>{opt.label} (계수: {opt.value})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 결과 출력 영역으로 스크롤 이동 버튼 (모바일용) */}
      <div className="text-center sm:hidden mb-6">
        <button 
          onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[var(--google-surface-variant)] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] px-4 py-2 rounded-full text-xs font-bold"
        >
          계산 결과 보기 ↓
        </button>
      </div>

      {/* ================= 결과 출력 카드 ================= */}
      <div ref={resultsRef} className="bg-[#f8f9fa] dark:bg-[#303134]/50 border border-[var(--google-border)] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-[var(--google-border)] pb-2">
          <h4 className="text-[13px] font-extrabold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">산출 명세서 (영수증)</h4>
          {faultRatio > 0 && <span className="text-[11px] font-bold text-[#d93025] bg-[#fce8e6] px-2 py-0.5 rounded">과실 {faultRatio}% 상계됨</span>}
        </div>
        
        <div className="space-y-3 mb-6">
          {/* 위자료 병합 결과 표시 */}
          <div className="flex justify-between text-[14px]">
            <span className="text-[#5f6368] dark:text-[#bdc1c6] font-medium">{activeAlimonyLabel} (Max)</span>
            <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(finalAlimony).toLocaleString()} 원</span>
          </div>
          
          {isInjury && lostIncome > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#5f6368] dark:text-[#bdc1c6]">휴업손해 ({hospitalDays}일)</span>
              <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(lostIncome).toLocaleString()} 원</span>
            </div>
          )}
          
          {isInjury && miscDamages > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#5f6368] dark:text-[#bdc1c6]">기타손해 ({clinicDays}일)</span>
              <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(miscDamages).toLocaleString()} 원</span>
            </div>
          )}

          {isInjury && careCost > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#5f6368] dark:text-[#bdc1c6]">간병비 (1~5급)</span>
              <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(careCost).toLocaleString()} 원</span>
            </div>
          )}

          {isDisability && disabilityLFI > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#ea8600] dark:text-[#fde293]">장해 상실수익액</span>
              <span className="font-semibold text-[#ea8600] dark:text-[#fde293]">{Math.round(disabilityLFI).toLocaleString()} 원</span>
            </div>
          )}

          {isDeath && deathLFI > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#d93025] dark:text-[#f28b82]">사망 상실수익액</span>
              <span className="font-semibold text-[#d93025] dark:text-[#f28b82]">{Math.round(deathLFI).toLocaleString()} 원</span>
            </div>
          )}

          {isDeath && funeralFee > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#5f6368] dark:text-[#bdc1c6]">장례비 (정액)</span>
              <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(funeralFee).toLocaleString()} 원</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between bg-[#e8f0fe] dark:bg-[#1A73E8]/10 -mx-5 -mb-5 p-5 rounded-b-2xl border-t border-[var(--google-blue)]/20">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[var(--google-blue)]/70 dark:text-[#8ab4f8]/70 mb-0.5">최종 합의금 (약관 기준)</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--google-blue)] dark:text-[#8ab4f8]">
              {Math.round(total).toLocaleString()}<span className="text-lg font-bold ml-1 text-[#1A73E8]/80">원</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#fce8e6] dark:bg-[#c5221f]/10 border border-[#d93025]/20 flex gap-3">
        <span className="text-lg">⚠️</span>
        <p className="text-[12px] leading-relaxed text-[#c5221f] dark:text-[#f28b82]">
          위 결과는 <strong>보험회사 대인배상 약관 및 일반적인 호프만계수</strong>를 단순 적용한 추정치입니다. 실제로는 과실 비율에 따른 <strong>'치료비 상계'</strong>가 발생할 수 있으며, 법원 기준(소송/특인)을 적용하면 향후치료비 및 위자료가 <strong>수천만 원 이상 증액</strong>될 수 있습니다. 섣불리 합의하지 마시고 반드시 전문가 상담을 통해 권리를 찾으세요.
        </p>
      </div>

    </div>
  );
}
