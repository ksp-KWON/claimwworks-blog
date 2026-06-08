'use client';

import { useState } from 'react';

const ALIMONY_BY_GRADE: Record<number, number> = {
  1: 2000000, 2: 1760000, 3: 1520000, 4: 1280000,
  5: 750000, 6: 500000, 7: 400000, 8: 300000,
  9: 250000, 10: 200000, 11: 200000, 12: 150000,
  13: 150000, 14: 150000,
};

export default function AutoCalculator() {
  const [faultRatio, setFaultRatio] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3000000);
  const [hospitalDays, setHospitalDays] = useState<number>(0);
  const [injuryGrade, setInjuryGrade] = useState<number>(12); // 12급 (염좌) 기본
  const [futureMedical, setFutureMedical] = useState<number>(1000000); // 향후치료비

  // 계산 로직
  const faultFactor = 1 - (faultRatio / 100);
  const alimony = ALIMONY_BY_GRADE[injuryGrade] * faultFactor;
  const lostIncome = (monthlyIncome / 30) * hospitalDays * 0.85 * faultFactor;
  const total = alimony + lostIncome + futureMedical;

  return (
    <div className="bg-white dark:bg-[#202124] rounded-2xl border border-[var(--google-border)] shadow-sm p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 flex items-center justify-center text-[var(--google-blue)] dark:text-[#8ab4f8]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#202124] dark:text-[#e8eaed]">교통사고 합의금 계산기</h3>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">자동차보험 약관 지급기준 (대략적 최소 추정치)</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. 상해 급수 */}
        <div>
          <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2">상해 급수 (1~14급)</label>
          <select 
            value={injuryGrade}
            onChange={(e) => setInjuryGrade(Number(e.target.value))}
            className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-lg p-3 text-sm text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[var(--google-blue)] focus:outline-none appearance-none"
          >
            {[...Array(14)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}급 {i+1 >= 12 ? '(경상/염좌)' : ''}</option>
            ))}
          </select>
        </div>

        {/* 2. 본인 과실 비율 */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-[#202124] dark:text-[#e8eaed]">본인 과실 비율</label>
            <span className="text-[var(--google-blue)] font-bold">{faultRatio}%</span>
          </div>
          <input 
            type="range" min="0" max="100" step="10"
            value={faultRatio} onChange={(e) => setFaultRatio(Number(e.target.value))}
            className="w-full h-2 bg-[#e8eaed] dark:bg-[#5f6368] rounded-lg appearance-none cursor-pointer accent-[var(--google-blue)]"
          />
          <div className="flex justify-between text-xs text-[#5f6368] mt-1">
            <span>무과실 (0%)</span>
            <span>쌍방과실 (50%)</span>
            <span>100% 과실</span>
          </div>
        </div>

        {/* 3. 월 평균 소득 */}
        <div>
          <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2">월 평균 소득 (세전)</label>
          <div className="relative">
            <input 
              type="number" step="100000"
              value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-lg p-3 pr-10 text-sm text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[var(--google-blue)] focus:outline-none"
            />
            <span className="absolute right-4 top-3 text-[#5f6368]">원</span>
          </div>
          <p className="text-[11px] text-[#5f6368] mt-1.5">* 입증 불가 시 도시일용임금(약 300만 원) 기준</p>
        </div>

        {/* 4. 입원 일수 */}
        <div>
          <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2">입원 일수</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setHospitalDays(Math.max(0, hospitalDays - 1))} className="w-10 h-10 rounded-lg bg-[#f1f3f4] dark:bg-[#3c4043] flex items-center justify-center font-bold text-[#5f6368] hover:bg-[#e8eaed] dark:hover:bg-[#5f6368]">-</button>
            <div className="flex-1 text-center font-bold text-lg text-[#202124] dark:text-[#e8eaed]">{hospitalDays} 일</div>
            <button onClick={() => setHospitalDays(hospitalDays + 1)} className="w-10 h-10 rounded-lg bg-[#f1f3f4] dark:bg-[#3c4043] flex items-center justify-center font-bold text-[#5f6368] hover:bg-[#e8eaed] dark:hover:bg-[#5f6368]">+</button>
          </div>
        </div>

        {/* 5. 향후 치료비 (슬라이더) */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-[#202124] dark:text-[#e8eaed]">예상 향후치료비</label>
            <span className="text-[var(--google-green)] font-bold">{(futureMedical / 10000).toLocaleString()}만 원</span>
          </div>
          <input 
            type="range" min="0" max="5000000" step="100000"
            value={futureMedical} onChange={(e) => setFutureMedical(Number(e.target.value))}
            className="w-full h-2 bg-[#e8eaed] dark:bg-[#5f6368] rounded-lg appearance-none cursor-pointer accent-[var(--google-green)]"
          />
        </div>
      </div>

      {/* 6. 결과 출력 카드 */}
      <div className="mt-8 bg-[#f8f9fa] dark:bg-[#303134]/50 border border-[var(--google-border)] rounded-2xl p-5 shadow-sm">
        <h4 className="text-[13px] font-extrabold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-4 border-b border-[var(--google-border)] pb-2">예상 합의금 영수증</h4>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#5f6368] dark:text-[#bdc1c6]">위자료 ({injuryGrade}급)</span>
            <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(alimony).toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#5f6368] dark:text-[#bdc1c6]">휴업손해 ({hospitalDays}일)</span>
            <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{Math.round(lostIncome).toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#5f6368] dark:text-[#bdc1c6]">향후치료비 (추정)</span>
            <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{futureMedical.toLocaleString()} 원</span>
          </div>
        </div>

        <div className="flex items-end justify-between bg-[#e8f0fe] dark:bg-[#1A73E8]/10 -mx-5 -mb-5 p-5 rounded-b-2xl border-t border-[var(--google-blue)]/20">
          <span className="text-sm font-bold text-[var(--google-blue)] dark:text-[#8ab4f8]">총 예상 합의금</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--google-blue)] dark:text-[#8ab4f8]">
            {Math.round(total).toLocaleString()}<span className="text-lg font-bold ml-1">원</span>
          </span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#fce8e6] dark:bg-[#c5221f]/10 border border-[#d93025]/20 flex gap-3">
        <span className="text-lg">⚠️</span>
        <p className="text-[12px] leading-relaxed text-[#c5221f] dark:text-[#f28b82]">
          위 결과는 자동차보험 <strong>약관 지급기준에 따른 대략적인 최소 추정치</strong>입니다. 실제 합의금은 소송가액 기준(특인) 적용, 소득 입증 자료, 흉터/장해 여부 등에 따라 <strong>2~3배 이상 크게 달라질 수 있습니다.</strong> 보험사와 합의하기 전 반드시 전문가의 무료 진단을 받아보세요.
        </p>
      </div>

    </div>
  );
}
