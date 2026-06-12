'use client';

import { useState } from 'react';

export default function MedicalCalculator() {
  const [generation, setGeneration] = useState<number>(1);
  const [hospitalType, setHospitalType] = useState<number>(1); // 1: 의원, 2: 병원, 3: 종합병원
  const [medicalBill, setMedicalBill] = useState<number>(100000); // 총 발생 의료비

  const formatCurrency = (val: number | string) => {
    if (!val) return '';
    return Number(val.toString().replace(/,/g, '')).toLocaleString();
  };
  const parseCurrency = (val: string) => Number(val.replace(/[^0-9]/g, ''));

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
    <div className="w-full max-w-6xl mx-auto">
      {/* 타이틀 영역 */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#e6f4ea] dark:bg-[#34A853]/20 flex items-center justify-center text-[var(--google-green)] dark:text-[#81c995] shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-[#202124] dark:text-[#e8eaed]">실손의료비(실비) 계산기</h3>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">세대별 자기부담금 단순 추정치 (통원 기준)</p>
        </div>
      </div>

      {/* 2단 그리드 레이아웃: 데스크톱 7:5 구조 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 좌측: 입력 폼 영역 (7열) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. 가입 세대 */}
          <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-sm">
            <label className="block text-xs sm:text-sm font-extrabold text-[#202124] dark:text-[#e8eaed] mb-3">실손 가입 시기 (세대 구분)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 1, label: '1세대', desc: '~09년 8월 이전' },
                { id: 2, label: '2세대', desc: '09.10 ~ 17.03' },
                { id: 3, label: '3세대', desc: '17.04 ~ 21.06' },
                { id: 4, label: '4세대', desc: '21.07 ~ 현재' },
              ].map(gen => (
                <button 
                  key={gen.id}
                  type="button"
                  onClick={() => setGeneration(gen.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    generation === gen.id 
                      ? 'border-[var(--google-green)] bg-green-50/50 dark:bg-[#34A853]/15 text-[var(--google-green)] dark:text-[#81c995] font-bold shadow-sm' 
                      : 'border-gray-200 bg-white dark:bg-[#303134] dark:border-transparent text-[#5f6368] dark:text-[#9aa0a6] hover:border-green-300'
                  }`}
                >
                  <div className="text-xs sm:text-sm">{gen.label}</div>
                  <div className="text-[10px] opacity-85 mt-0.5">{gen.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 병원 규모 */}
          <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-sm">
            <label className="block text-xs sm:text-sm font-extrabold text-[#202124] dark:text-[#e8eaed] mb-3">방문한 병원 규모</label>
            <div className="grid grid-cols-3 gap-2">
              {['일반 의원', '병원', '종합병원'].map((type, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => setHospitalType(idx + 1)}
                  className={`py-3 rounded-xl border text-center text-xs sm:text-sm transition-all ${
                    hospitalType === idx + 1 
                      ? 'border-[var(--google-green)] bg-green-50/50 dark:bg-[#34A853]/15 text-[var(--google-green)] dark:text-[#81c995] font-bold shadow-sm' 
                      : 'border-gray-200 bg-white dark:bg-[#303134] dark:border-transparent text-[#5f6368] dark:text-[#9aa0a6] hover:border-green-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 총 진료비 */}
          <div className="bg-white dark:bg-[#202124] p-5 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-sm">
            <label className="block text-xs sm:text-sm font-extrabold text-[#202124] dark:text-[#e8eaed] mb-2.5">총 발생 의료비 (영수증 환자부담총액)</label>
            <div className="relative">
              <input 
                type="text"
                value={medicalBill ? formatCurrency(medicalBill) : ''} 
                onChange={(e) => setMedicalBill(parseCurrency(e.target.value))}
                className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-sm text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[var(--google-green)] focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all font-bold"
              />
              <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-medium">원</span>
            </div>
          </div>
        </div>

        {/* 우측: 결과 출력 카드 (5열) - 데스크톱에서 스티키 고정 */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 lg:self-start">
          <div className="bg-[#f4faf6] dark:bg-[#15271e]/30 border border-green-100/60 dark:border-green-900/20 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-5 border-b border-green-100/30 pb-3">
              <h4 className="text-xs font-extrabold text-green-800 dark:text-green-300 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                산출 명세서
              </h4>
            </div>
            
            <div className="space-y-3 mb-6 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-[#bdc1c6]">총 진료비</span>
                <span className="font-semibold text-[#202124] dark:text-[#e8eaed]">{medicalBill.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between text-red-500 font-bold">
                <span>공제금액 (자기부담금)</span>
                <span>- {Math.round(deductible).toLocaleString()} 원</span>
              </div>
            </div>

            {/* 예상 수령액 카드 (그린 그라데이션) */}
            <div className="bg-gradient-to-br from-[#34A853] to-[#137333] dark:from-[#34A853] dark:to-[#188038] text-white p-5 rounded-2xl text-center shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-6 -translate-y-6">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <div className="relative z-10">
                <span className="block text-[11px] font-bold text-white/85 mb-1">예상 수령액 (추정치)</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center gap-1">
                  {Math.round(finalAmount).toLocaleString()}
                  <span className="text-sm font-bold text-white/90">원</span>
                </span>
              </div>
            </div>

            {/* 상담 신청 버튼 */}
            <a 
              href="https://open.kakao.com/o/sWeszp7" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center w-full mt-5 py-3.5 bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-50 rounded-xl font-extrabold text-sm transition-all shadow-md"
            >
              보상스쿨 1:1 무료상담 신청하기
            </a>
          </div>
        </div>

      </div>

      {/* 안내 주의 사항 */}
      <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex gap-3 text-xs leading-relaxed text-red-700 dark:text-red-400 font-semibold">
        <span className="text-sm shrink-0">⚠️</span>
        <p>
          위 결과는 세대별 기본 통원 약관을 바탕으로 한 <strong>단순 추정치</strong>입니다. 실제 영수증상의 급여/비급여 비율, 보상에서 제외되는 질환(면책 상병) 여부, 가입 한도 초과 등에 따라 실제 지급액과 차이가 날 수 있습니다. 청구서류 검토나 지급 거절 사례 상담이 필요하시다면 보상스쿨 무료상담을 신청해 보세요.
        </p>
      </div>

    </div>
  );
}
