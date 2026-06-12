'use client';

import { useState, useRef, useEffect } from 'react';
import { AutoInsuranceData, initialAutoData } from './calculator-types';
import AutoCalculatorResult from './AutoCalculatorResult';
import { INJURY_DB } from './injury-db';

// ── 탭 정의 ──
const STEPS = [
  { id: 'base',     label: '기본 정보',   icon: '👤' },
  { id: 'damage',   label: '피해 유형',   icon: '📋' },
  { id: 'detail',   label: '상세 입력',   icon: '🔍' },
  { id: 'expense',  label: '추가 비용',   icon: '💊' },
];

export default function ExpertModeForm() {
  const [data, setData] = useState<AutoInsuranceData>(initialAutoData);
  const [activeStep, setActiveStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDiagnosis = (id: string) => {
    setData(prev => {
      let newDiagnoses = [...prev.selectedDiagnoses];
      if (newDiagnoses.includes(id)) {
        newDiagnoses = newDiagnoses.filter(d => d !== id);
      } else {
        newDiagnoses.push(id);
      }
      if (newDiagnoses.length > 0) {
        const selected = INJURY_DB.filter(i => newDiagnoses.includes(i.id));
        if (selected.length > 0) {
          const highestGrade = Math.min(...selected.map(i => i.grade));
          const grades2to11 = selected.filter(i => i.grade >= 2 && i.grade <= 11);
          return {
            ...prev,
            selectedDiagnoses: newDiagnoses,
            injuryGrade: highestGrade,
            hasMultipleInjuries: grades2to11.length >= 2,
            isAutoGrade: true,
          };
        }
      }
      return { ...prev, selectedDiagnoses: newDiagnoses, isAutoGrade: false, hasMultipleInjuries: false };
    });
  };

  const handleChange = (field: keyof AutoInsuranceData, value: number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addValue = (field: keyof AutoInsuranceData, addAmount: number, max?: number) => {
    setData(prev => {
      const current = Number(prev[field] || 0);
      let next = current + addAmount;
      if (max !== undefined && next > max) next = max;
      if (next < 0) next = 0;
      return { ...prev, [field]: next };
    });
  };

  const fmt = (val: number | string) => {
    if (!val) return '';
    return Number(val.toString().replace(/,/g, '')).toLocaleString();
  };
  const parse = (val: string) => Number(val.replace(/[^0-9]/g, ''));

  // ── 탭 컨텐츠 렌더링 ──
  const renderStep = () => {
    switch (activeStep) {
      case 0: // 기본 정보
        return (
          <div className="space-y-5 h-full">
            {/* 소득 */}
            <div>
              <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-2">
                월 소득 / 신고소득
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.income ? fmt(data.income) : ''}
                  onChange={e => handleChange('income', parse(e.target.value))}
                  placeholder="3,500,000"
                  className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-[15px] text-[#202124] dark:text-[#e8eaed] font-bold focus:ring-2 focus:ring-[#1A73E8] focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-3.5 text-[13px] text-gray-400 font-semibold">원</span>
              </div>
              <button
                onClick={() => { handleChange('income', 3284525); handleChange('isIncomeProven', false); }}
                className="mt-2 w-full py-2 bg-[#e8f0fe] dark:bg-[#1A73E8]/15 text-[#1A73E8] dark:text-[#8ab4f8] text-[12px] font-bold rounded-xl border border-[#1A73E8]/20 hover:bg-[#d2e3fc] dark:hover:bg-[#1A73E8]/25 transition-all"
              >
                📊 도시일용근로자 임금 자동 적용 (3,284,525원)
              </button>
            </div>

            {/* 소득 입증 */}
            <div className="flex items-center gap-3 p-3.5 bg-[#f8f9fa] dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-white/10">
              <button
                onClick={() => handleChange('isIncomeProven', !data.isIncomeProven)}
                className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${data.isIncomeProven ? 'bg-[#1A73E8]' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${data.isIncomeProven ? 'left-6' : 'left-1'}`} />
              </button>
              <div>
                <div className="text-[13px] font-bold text-[#202124] dark:text-[#e8eaed]">세법상 소득 입증 가능</div>
                <div className="text-[11px] text-gray-400 mt-0.5">65세 이상이면 소득 입증이 필수입니다</div>
              </div>
            </div>

            {/* 과실 비율 */}
            <div>
              <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-2">
                본인 과실 비율
              </label>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0" max="100"
                  value={data.faultRatio === 0 ? '0' : (data.faultRatio || '')}
                  onChange={e => handleChange('faultRatio', Number(e.target.value))}
                  className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-[15px] text-[#202124] dark:text-[#e8eaed] font-bold focus:ring-2 focus:ring-[#1A73E8] focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-3.5 text-[13px] text-gray-400 font-semibold">%</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 10, 20, 30].map(v => (
                  <button key={v} onClick={() => handleChange('faultRatio', v)}
                    className={`py-2 rounded-lg text-[12px] font-bold transition-all border ${data.faultRatio === v ? 'bg-[#1A73E8] text-white border-[#1A73E8] shadow-sm' : 'bg-white dark:bg-[#2d2d2d] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#1A73E8]/50'}`}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: // 피해 유형
        return (
          <div className="space-y-4 h-full">
            <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-3">
              피해 유형 (복수 선택 가능)
            </label>
            {[
              { key: 'hasInjury',    emoji: '🩹', title: '부상 (상해)',   sub: '대인배상 I',   color: 'blue',   activeClass: 'border-[#1A73E8] bg-[#e8f0fe] dark:bg-[#1A73E8]/15', textActive: 'text-[#1A73E8] dark:text-[#8ab4f8]' },
              { key: 'hasDisability',emoji: '🩼', title: '후유장해',      sub: '대인배상 II',  color: 'purple', activeClass: 'border-[#7C4DFF] bg-[#f3e8ff] dark:bg-[#7C4DFF]/15', textActive: 'text-[#7C4DFF] dark:text-[#ce93d8]' },
              { key: 'hasDeath',     emoji: '🕊️', title: '사망',         sub: '사망 피해보상', color: 'red',    activeClass: 'border-[#d93025] bg-[#fce8e6] dark:bg-[#d93025]/15', textActive: 'text-[#d93025] dark:text-[#f28b82]' },
            ].map(item => {
              const isActive = data[item.key as keyof AutoInsuranceData] as boolean;
              return (
                <button
                  key={item.key}
                  onClick={() => handleChange(item.key as keyof AutoInsuranceData, !isActive)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isActive ? item.activeClass : 'border-gray-200 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#2d2d2d] hover:border-gray-300'}`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className={`font-bold text-[14px] ${isActive ? item.textActive : 'text-[#202124] dark:text-[#e8eaed]'}`}>{item.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{item.sub}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? (item.color === 'blue' ? 'bg-[#1A73E8] border-[#1A73E8]' : item.color === 'purple' ? 'bg-[#7C4DFF] border-[#7C4DFF]' : 'bg-[#d93025] border-[#d93025]') : 'border-gray-300 dark:border-gray-600'}`}>
                    {isActive && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 2: // 상세 입력
        return (
          <div className="space-y-5 h-full overflow-y-auto pr-1" style={{ maxHeight: '420px' }}>
            {data.hasInjury && (
              <div>
                <label className="block text-[11px] font-bold text-[#1A73E8] dark:text-[#8ab4f8] uppercase tracking-wider mb-2">🩹 부상 상세</label>

                {/* 진단명 검색 */}
                <div className="relative mb-3" ref={searchRef}>
                  <div className="relative">
                    <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setIsSearchFocused(true); }}
                      onFocus={() => setIsSearchFocused(true)}
                      placeholder="진단명 검색 (예: 경추염좌, 추간판)"
                      className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-[13px] text-[#202124] dark:text-[#e8eaed] font-medium focus:ring-2 focus:ring-[#1A73E8] focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all"
                    />
                  </div>
                  {isSearchFocused && searchTerm && (
                    <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                      {INJURY_DB.filter(i => {
                        const t = searchTerm.replace(/\s+/g, '').toLowerCase();
                        const n = i.name.replace(/\s+/g, '').toLowerCase();
                        if (n.includes(t)) return true;
                        if ((t.includes('경추') || t.includes('목')) && n.includes('척추')) return true;
                        if (t.includes('디스크') && n.includes('추간판')) return true;
                        return false;
                      }).map(i => (
                        <div key={i.id}
                          onMouseDown={e => { e.preventDefault(); handleToggleDiagnosis(i.id); setSearchTerm(''); setIsSearchFocused(false); }}
                          className="px-3 py-2.5 text-[12px] hover:bg-[#f8f9fa] dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between items-center"
                        >
                          <span className="text-[#202124] dark:text-white">{i.name}</span>
                          <span className="text-[10px] font-bold text-[#1A73E8] bg-[#e8f0fe] dark:bg-[#1A73E8]/20 px-1.5 py-0.5 rounded">{i.grade}급</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {data.selectedDiagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {INJURY_DB.filter(i => data.selectedDiagnoses.includes(i.id)).map(i => (
                      <div key={i.id} className="flex items-center gap-1 bg-[#e8f0fe] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#8ab4f8] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        <span>[{i.grade}급] {i.name}</span>
                        <button onClick={() => handleToggleDiagnosis(i.id)} className="ml-0.5 hover:text-[#d93025] transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: 'hospitalDays' as const, label: '입원 일수', unit: '일', adds: [1, 7] },
                    { field: 'outpatientDays' as const, label: '통원 일수', unit: '일', adds: [1, 7] },
                  ].map(({ field, label, unit, adds }) => (
                    <div key={field}>
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                      <div className="relative mb-1.5">
                        <input type="number" value={data[field] === 0 ? '0' : (data[field] || '')}
                          onChange={e => handleChange(field, Number(e.target.value))}
                          className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-[14px] font-bold text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[#1A73E8] focus:outline-none transition-all" />
                        <span className="absolute right-3 top-3 text-[11px] text-gray-400">{unit}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {adds.map(a => (
                          <button key={a} onClick={() => addValue(field, a)} className="py-1.5 bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-[#e8f0fe] hover:text-[#1A73E8] hover:border-[#1A73E8]/30 transition-all">+{a}{unit}</button>
                        ))}
                        <button onClick={() => handleChange(field, 0)} className="py-1.5 bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 rounded-lg text-[11px] text-gray-400 hover:bg-gray-50 transition-all">0</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.hasDisability && (
              <div>
                <label className="block text-[11px] font-bold text-[#7C4DFF] dark:text-[#ce93d8] uppercase tracking-wider mb-2">🩼 후유장해 상세</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">맥브라이드 장해율</label>
                    <div className="relative mb-1.5">
                      <input type="number" value={data.disabilityRate === 0 ? '0' : (data.disabilityRate || '')}
                        onChange={e => handleChange('disabilityRate', Number(e.target.value))}
                        className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-[14px] font-bold text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[#7C4DFF] focus:outline-none transition-all" />
                      <span className="absolute right-3 top-3 text-[11px] text-gray-400">%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[5, 10, 20].map(v => (
                        <button key={v} onClick={() => handleChange('disabilityRate', v)} className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${data.disabilityRate === v ? 'bg-[#7C4DFF] text-white border-[#7C4DFF]' : 'bg-[#f8f9fa] dark:bg-[#2d2d2d] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#7C4DFF]/50'}`}>{v}%</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">장해 기간 (0=영구)</label>
                    <div className="relative mb-1.5">
                      <input type="number" value={data.disabilityYears === 0 ? '0' : (data.disabilityYears || '')}
                        onChange={e => handleChange('disabilityYears', Number(e.target.value))}
                        className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-[14px] font-bold text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[#7C4DFF] focus:outline-none transition-all" />
                      <span className="absolute right-3 top-3 text-[11px] text-gray-400">년</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 3, 0].map((v, idx) => (
                        <button key={idx} onClick={() => handleChange('disabilityYears', v)} className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${data.disabilityYears === v ? 'bg-[#7C4DFF] text-white border-[#7C4DFF]' : 'bg-[#f8f9fa] dark:bg-[#2d2d2d] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#7C4DFF]/50'}`}>{v === 0 ? '영구' : `${v}년`}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.hasDeath && (
              <div>
                <label className="block text-[11px] font-bold text-[#d93025] dark:text-[#f28b82] uppercase tracking-wider mb-2">🕊️ 사망 상세</label>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">사고 당시 만 나이</label>
                  <div className="relative mb-1.5">
                    <input type="number"
                      value={data.ageAtAccident || ''}
                      onChange={e => handleChange('ageAtAccident', Number(e.target.value))}
                      className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-[14px] font-bold text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[#d93025] focus:outline-none transition-all" />
                    <span className="absolute right-3 top-3 text-[11px] text-gray-400">세</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[30, 40, 50, 60].map(v => (
                      <button key={v} onClick={() => handleChange('ageAtAccident', v)} className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${data.ageAtAccident === v ? 'bg-[#d93025] text-white border-[#d93025]' : 'bg-[#f8f9fa] dark:bg-[#2d2d2d] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#d93025]/50'}`}>{v}세</button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-[#fce8e6] dark:bg-[#d93025]/10 text-[11px] text-[#d93025] dark:text-[#f28b82] font-semibold leading-relaxed">
                  ※ 위자료(최대 8,000만원) + 장례비(500만원)가 자동 반영됩니다.
                </div>
              </div>
            )}

            {!data.hasInjury && !data.hasDisability && !data.hasDeath && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">📋</span>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">이전 탭에서 피해 유형을 먼저 선택해 주세요.</p>
              </div>
            )}
          </div>
        );

      case 3: // 추가 비용
        return (
          <div className="space-y-5 h-full">
            {[
              { field: 'directReceipts' as const, label: '직불영수증 (실제 지출 병원비)', icon: '🧾', adds: [100000, 500000], addLabels: ['+10만', '+50만'] },
              { field: 'futureTreatmentCost' as const, label: '향후치료비 (성형, 흉터, 핀제거 등)', icon: '💉', adds: [500000, 1000000], addLabels: ['+50만', '+100만'] },
            ].map(({ field, label, icon, adds, addLabels }) => (
              <div key={field}>
                <label className="block text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-2">{icon} {label}</label>
                <div className="relative mb-2">
                  <input type="text"
                    value={data[field] ? fmt(data[field] as number) : ''}
                    onChange={e => handleChange(field, parse(e.target.value))}
                    placeholder="0"
                    className="w-full bg-[#f8f9fa] dark:bg-[#2d2d2d] border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-[15px] font-bold text-[#202124] dark:text-[#e8eaed] focus:ring-2 focus:ring-[#34A853] focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all" />
                  <span className="absolute right-4 top-3.5 text-[13px] text-gray-400 font-semibold">원</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {adds.map((a, idx) => (
                    <button key={a} onClick={() => addValue(field, a)}
                      className="py-2 bg-[#e6f4ea] dark:bg-[#34A853]/15 text-[#34A853] dark:text-[#81c995] rounded-xl text-[12px] font-bold border border-[#34A853]/20 hover:bg-[#d4edda] dark:hover:bg-[#34A853]/25 transition-all">
                      {addLabels[idx]}
                    </button>
                  ))}
                  <button onClick={() => handleChange(field, 0)}
                    className="py-2 bg-[#f8f9fa] dark:bg-[#2d2d2d] text-gray-400 rounded-xl text-[12px] font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 transition-all">
                    초기화
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* ── 2단 그리드 (좌: 입력, 우: 결과) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* 좌측: 탭 기반 스텝 입력 */}
        <div className="lg:col-span-6 flex flex-col">
          {/* 탭 네비 */}
          <div className="flex gap-1.5 mb-4 bg-[#f8f9fa] dark:bg-[#2d2d2d] p-1.5 rounded-2xl border border-gray-200 dark:border-white/8">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
                  activeStep === idx
                    ? 'bg-white dark:bg-[#202124] shadow-sm text-[#1A73E8] dark:text-[#8ab4f8] font-bold border border-gray-200/60 dark:border-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#202124] dark:hover:text-white'
                }`}
              >
                <span className="text-base leading-none mb-0.5">{step.icon}</span>
                <span className="text-[10px] font-semibold leading-tight break-keep">{step.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm min-h-[380px]">
            {renderStep()}
          </div>

          {/* 이전/다음 네비 버튼 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveStep(s => Math.max(s - 1, 0))}
              disabled={activeStep === 0}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← 이전
            </button>
            <button
              onClick={() => setActiveStep(s => Math.min(s + 1, STEPS.length - 1))}
              disabled={activeStep === STEPS.length - 1}
              className="flex-1 py-2.5 rounded-xl bg-[#1A73E8] text-white text-[13px] font-bold hover:bg-[#1557b0] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              다음 →
            </button>
          </div>
        </div>

        {/* 우측: 결과 패널 (상시 표시) */}
        <div className="lg:col-span-6">
          <AutoCalculatorResult data={data} />
        </div>
      </div>
    </div>
  );
}
