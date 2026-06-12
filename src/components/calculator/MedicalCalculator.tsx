'use client';

import { useState } from 'react';

// ── 세대별 공제 계산 로직 ──
function calcResult(generation: number, hospitalType: number, medicalBill: number) {
  let deductible = 0;
  let coverageRate = 1;

  if (generation === 1) {
    deductible = 5000;
    coverageRate = 1.0;
    deductible = Math.min(deductible, medicalBill);
    return { deductible, returnAmount: Math.max(0, medicalBill - deductible), coverageRate };
  }

  const baseDeductible = hospitalType === 1 ? 10000 : hospitalType === 2 ? 15000 : 20000;

  if (generation === 2) {
    coverageRate = 0.9;
    const ratioDeductible = medicalBill * 0.1;
    deductible = Math.max(baseDeductible, ratioDeductible);
  } else if (generation === 3) {
    coverageRate = 0.85;
    const ratioDeductible = medicalBill * 0.15;
    deductible = Math.max(baseDeductible, ratioDeductible);
  } else {
    coverageRate = 0.75;
    const ratioDeductible = medicalBill * 0.25;
    deductible = Math.max(baseDeductible, ratioDeductible);
  }

  return { deductible, returnAmount: Math.max(0, medicalBill - deductible), coverageRate };
}

const GENERATIONS = [
  { id: 1, label: '1세대', period: '~09년 8월', color: '#1A73E8', note: '공제 5,000원 / 100% 보장' },
  { id: 2, label: '2세대', period: '09.10 ~ 17.03', color: '#34A853', note: '자기부담금 10% / 90% 보장' },
  { id: 3, label: '3세대', period: '17.04 ~ 21.06', color: '#f29900', note: '급여 90% / 비급여 80%' },
  { id: 4, label: '4세대', period: '21.07 ~ 현재', color: '#d93025', note: '급여 80% / 비급여 70%' },
];

const HOSPITAL_TYPES = [
  { id: 1, label: '의원·클리닉', emoji: '🏥', desc: '개인의원, 한의원' },
  { id: 2, label: '병원', emoji: '🏨', desc: '병원급 (30병상↑)' },
  { id: 3, label: '종합병원', emoji: '🏫', desc: '대학병원, 상급종합' },
];

export default function MedicalCalculator() {
  const [generation, setGeneration] = useState(1);
  const [hospitalType, setHospitalType] = useState(1);
  const [medicalBill, setMedicalBill] = useState(100000);

  const fmt = (val: number | string) => {
    if (!val) return '';
    return Number(val.toString().replace(/,/g, '')).toLocaleString();
  };
  const parse = (val: string) => Math.max(0, Number(val.replace(/[^0-9]/g, '')) || 0);

  const { deductible, returnAmount, coverageRate } = calcResult(generation, hospitalType, medicalBill);
  const coveragePct = Math.round(coverageRate * 100);
  const selectedGen = GENERATIONS.find(g => g.id === generation)!;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* ── 좌측 입력 패널 ── */}
        <div className="lg:col-span-6 flex flex-col gap-4">

          {/* 1. 가입 세대 선택 */}
          <div className="bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
            <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-3">
              📅 실손 가입 세대
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENERATIONS.map(gen => {
                const isActive = generation === gen.id;
                return (
                  <button
                    key={gen.id}
                    onClick={() => setGeneration(gen.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? 'border-current shadow-sm'
                        : 'border-gray-200 dark:border-white/8 bg-[#f8f9fa] dark:bg-[#2d2d2d] hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                    style={isActive ? { borderColor: gen.color, backgroundColor: `${gen.color}12`, color: gen.color } : {}}
                  >
                    <div className="font-extrabold text-[14px]">{gen.label}</div>
                    <div className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'opacity-80' : 'text-gray-400'}`}>{gen.period}</div>
                  </button>
                );
              })}
            </div>
            {/* 선택된 세대 설명 */}
            <div className="mt-3 px-3 py-2 rounded-xl text-[11px] font-semibold" style={{ backgroundColor: `${selectedGen.color}12`, color: selectedGen.color }}>
              ℹ️ {selectedGen.note}
            </div>
          </div>

          {/* 2. 병원 규모 선택 */}
          <div className="bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
            <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-3">
              🏥 방문 병원 규모
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HOSPITAL_TYPES.map(ht => {
                const isActive = hospitalType === ht.id;
                return (
                  <button
                    key={ht.id}
                    onClick={() => setHospitalType(ht.id)}
                    className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      isActive
                        ? 'border-[#34A853] bg-[#e6f4ea] dark:bg-[#34A853]/15 text-[#34A853] dark:text-[#81c995]'
                        : 'border-gray-200 dark:border-white/8 bg-[#f8f9fa] dark:bg-[#2d2d2d] text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{ht.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight text-center break-keep">{ht.label}</span>
                    <span className={`text-[9px] leading-tight text-center ${isActive ? 'opacity-70' : 'text-gray-400'}`}>{ht.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 진료비 입력 */}
          <div className="bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
            <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-3">
              💊 총 발생 진료비 (환자 부담 총액)
            </label>
            <div className="relative mb-3">
              <input
                type="text"
                inputMode="numeric"
                value={medicalBill ? fmt(medicalBill) : ''}
                onChange={e => setMedicalBill(parse(e.target.value))}
                placeholder="100,000"
                className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-[16px] text-[#202124] dark:text-[#e8eaed] font-black focus:ring-2 focus:ring-[#34A853] focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all"
              />
              <span className="absolute right-4 top-4 text-[13px] text-gray-400 font-semibold">원</span>
            </div>
            {/* 빠른 금액 버튼 */}
            <div className="grid grid-cols-4 gap-1.5">
              {[50000, 100000, 300000, 500000].map(v => (
                <button key={v} onClick={() => setMedicalBill(v)}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    medicalBill === v
                      ? 'bg-[#34A853] text-white border-[#34A853] shadow-sm'
                      : 'bg-[#f8f9fa] dark:bg-[#2d2d2d] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#34A853]/50 hover:text-[#34A853]'
                  }`}>
                  {v >= 100000 ? `${v / 10000}만` : `${v.toLocaleString()}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 우측 결과 패널 ── */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* 예상 수령액 카드 (대형) */}
          <div className="bg-gradient-to-br from-[#34A853] to-[#137333] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div className="relative z-10">
              <div className="text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1">예상 수령액 (추정치)</div>
              <div className="text-4xl font-black tracking-tight mb-1">
                {Math.round(returnAmount).toLocaleString()}
                <span className="text-xl font-bold text-white/85 ml-1">원</span>
              </div>
              <div className="text-[12px] text-white/70 font-semibold">
                {generation}세대 · {HOSPITAL_TYPES.find(h => h.id === hospitalType)?.label} · 보장률 {coveragePct}%
              </div>
            </div>
          </div>

          {/* 산출 명세 카드 */}
          <div className="bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm flex-1">
            <div className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-4">🧾 산출 명세</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-white/8">
                <span className="text-[13px] text-gray-500 dark:text-gray-400">총 진료비</span>
                <span className="text-[14px] font-bold text-[#202124] dark:text-[#e8eaed]">{medicalBill.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-white/8">
                <span className="text-[13px] text-gray-500 dark:text-gray-400">자기부담금 (공제)</span>
                <span className="text-[14px] font-bold text-[#d93025]">- {Math.round(deductible).toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[13px] font-bold text-[#34A853]">예상 지급액</span>
                <span className="text-[14px] font-black text-[#34A853]">{Math.round(returnAmount).toLocaleString()} 원</span>
              </div>
            </div>

            {/* 보장율 바 */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/8">
              <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                <span>보장 비율</span>
                <span style={{ color: selectedGen.color }}>{coveragePct}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${coveragePct}%`, backgroundColor: selectedGen.color }}
                />
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-[#fce8e6] dark:bg-[#d93025]/10 rounded-xl p-3.5 border border-[#d93025]/15 flex gap-2.5 text-[11px] leading-relaxed text-[#d93025] dark:text-[#f28b82] font-semibold">
            <span className="shrink-0 text-sm">⚠️</span>
            <p>위 결과는 <strong>단순 추정치</strong>입니다. 급여/비급여 비율, 면책 상병, 가입 한도 초과에 따라 실제 지급액이 달라질 수 있습니다.</p>
          </div>

          {/* CTA */}
          <a
            href="https://open.kakao.com/o/sWeszp7"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-4 bg-[#202124] hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#202124] rounded-2xl font-extrabold text-[14px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            💬 보상스쿨 1:1 무료상담 신청하기
          </a>
        </div>
      </div>
    </div>
  );
}
