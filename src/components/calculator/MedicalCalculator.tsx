'use client';

import { useState } from 'react';

export default function MedicalCalculator() {
  const [generation, setGeneration] = useState<number>(1);
  const [hospitalType, setHospitalType] = useState<number>(1); // 1: 의원, 2: 병원, 3: 종합병원
  const [medicalBill, setMedicalBill] = useState<number>(100000); // 총 발생 의료비

  // 계산 로직 (단순화된 기준)
  let returnAmount = 0;
  let deductible = 0;

  if (generation === 1) {
    // 1세대 (100% 보장, 통원 공제 5000원)
    deductible = 5000;
    returnAmount = Math.max(0, medicalBill - deductible);
  } else if (generation === 2) {
    // 2세대 (90% 보장, 통원 의원 1만, 병원 1.5만, 종병 2만)
    const baseDeductible = hospitalType === 1 ? 10000 : hospitalType === 2 ? 15000 : 20000;
    const ratioDeductible = medicalBill * 0.1;
    deductible = Math.max(baseDeductible, ratioDeductible);
    returnAmount = Math.max(0, medicalBill - deductible);
  } else if (generation === 3) {
    // 3세대 (급여 90%, 비급여 80%) -> 단순 평균 85% 로 가정 (초보자용)
    const baseDeductible = hospitalType === 1 ? 10000 : hospitalType === 2 ? 15000 : 20000;
    const ratioDeductible = medicalBill * 0.15; // 15% 공제 가정
    deductible = Math.max(baseDeductible, ratioDeductible);
    returnAmount = Math.max(0, medicalBill - deductible);
  } else {
    // 4세대 (급여 80%, 비급여 70%) -> 단순 평균 75% 로 가정
    const baseDeductible = hospitalType === 1 ? 10000 : hospitalType === 2 ? 15000 : 20000;
    const ratioDeductible = medicalBill * 0.25; // 25% 공제 가정
    deductible = Math.max(baseDeductible, ratioDeductible);
    returnAmount = Math.max(0, medicalBill - deductible);
  }

  const finalAmount = returnAmount;

  return (
    <div className="bg-white dark:bg-[#202124] rounded-3xl border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-6 sm:p-8 max-w-2xl mx-auto transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#e6f4ea] dark:bg-[#34A853]/20 flex items-center justify-center text-[var(--google-green)] dark:text-[#81c995]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#202124] dark:text-[#e8eaed]">실손의료비(실비) 계산기</h3>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">세대별 자기부담금 단순 추정치 (통원 기준)</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. 가입 세대 */}
        <div>
          <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2">실손 가입 시기 (세대)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1, label: '1세대', desc: '~09.09' },
              { id: 2, label: '2세대', desc: '09.10~17.03' },
              { id: 3, label: '3세대', desc: '17.04~21.06' },
              { id: 4, label: '4세대', desc: '21.07~현재' },
            ].map(gen => (
              <button 
                key={gen.id}
                onClick={() => setGeneration(gen.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  generation === gen.id 
                    ? 'border-[var(--google-green)] bg-[#e6f4ea] dark:bg-[#34A853]/10 text-[var(--google-green)] dark:text-[#81c995] font-bold' 
                    : 'border-[var(--google-border)] bg-transparent text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f8f9fa] dark:hover:bg-[#303134]'
                }`}
              >
                <div className="text-[14px]">{gen.label}</div>
                <div className="text-[11px] opacity-80 mt-0.5">{gen.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 병원 규모 */}
        <div>
          <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2">방문한 병원 규모</label>
          <div className="grid grid-cols-3 gap-2">
            {['일반 의원', '병원', '종합병원'].map((type, idx) => (
              <button 
                key={idx}
                onClick={() => setHospitalType(idx + 1)}
                className={`p-2.5 rounded-lg border text-center text-sm transition-colors ${
                  hospitalType === idx + 1 
                    ? 'border-[var(--google-green)] bg-[#e6f4ea] dark:bg-[#34A853]/10 text-[var(--google-green)] dark:text-[#81c995] font-bold' 
                    : 'border-[var(--google-border)] bg-transparent text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f8f9fa] dark:hover:bg-[#303134]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 총 진료비 */}
        <div>
          <label className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] mb-2">총 발생 의료비 (영수증 환자부담총액)</label>
          <div className="relative">
            <input 
              type="number" step="10000"
              value={medicalBill} onChange={(e) => setMedicalBill(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[var(--google-border)] rounded-lg p-3 pr-10 text-sm text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[var(--google-green)] focus:outline-none"
            />
            <span className="absolute right-4 top-3 text-[#5f6368]">원</span>
          </div>
        </div>
      </div>

      {/* 결과 출력 카드 */}
      <div className="bg-gradient-to-br from-[#f8f9fa] to-white dark:from-[#303134] dark:to-[#202124] border border-black/5 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6 border-b border-black/5 dark:border-white/10 pb-4">
          <h4 className="text-sm font-extrabold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            산출 명세서
          </h4>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#5f6368] dark:text-[#bdc1c6]">총 진료비</span>
            <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{medicalBill.toLocaleString()} 원</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#d93025] dark:text-[#f28b82]">공제금액 (자기부담금)</span>
            <span className="font-semibold text-[#d93025] dark:text-[#f28b82]">- {Math.round(deductible).toLocaleString()} 원</span>
          </div>
        </div>

        <div className="flex items-end justify-between bg-[var(--google-green)] text-white -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-xs sm:text-sm font-bold text-white/80 mb-1">예상 수령액 (추정치)</span>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {Math.round(finalAmount).toLocaleString()}<span className="text-xl sm:text-2xl font-bold ml-1.5 text-white/90">원</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#fce8e6] dark:bg-[#c5221f]/10 border border-[#d93025]/20 flex gap-3">
        <span className="text-lg">⚠️</span>
        <p className="text-[12px] leading-relaxed text-[#c5221f] dark:text-[#f28b82]">
          위 결과는 세대별 기본 통원 약관을 바탕으로 한 <strong>단순 추정치</strong>입니다. 급여/비급여 비율, 면책 상병(보상 제외 질환) 여부, 한도 초과 등에 따라 실제 지급액과 다를 수 있습니다. 청구에 어려움이 있다면 보상스쿨 상담을 이용해 보세요.
        </p>
      </div>

    </div>
  );
}
