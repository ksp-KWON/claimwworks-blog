'use client';

import { useState, useRef, useEffect } from 'react';
import { AutoInsuranceData, initialAutoData } from './calculator-types';
import AutoCalculatorResult from './AutoCalculatorResult';
import { INJURY_DB } from './injury-db';

export default function ExpertModeForm() {
  const [data, setData] = useState<AutoInsuranceData>(initialAutoData);

  // 상해 검색 및 모달 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // 검색 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          const hasMultiple = grades2to11.length >= 2;
          
          return {
            ...prev,
            selectedDiagnoses: newDiagnoses,
            injuryGrade: highestGrade,
            hasMultipleInjuries: hasMultiple,
            isAutoGrade: true
          };
        }
      }

      return {
        ...prev,
        selectedDiagnoses: newDiagnoses,
        isAutoGrade: false,
        hasMultipleInjuries: false
      };
    });
  };

  const handleChange = (field: keyof AutoInsuranceData, value: number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // 퀵 버튼용 숫자 증감 함수
  const addValue = (field: keyof AutoInsuranceData, addAmount: number, max?: number) => {
    setData(prev => {
      const current = Number(prev[field] || 0);
      let next = current + addAmount;
      if (max !== undefined && next > max) next = max;
      return { ...prev, [field]: next };
    });
  };

  const formatCurrency = (val: number | string) => {
    if (!val) return '';
    return Number(val.toString().replace(/,/g, '')).toLocaleString();
  };
  const parseCurrency = (val: string) => Number(val.replace(/[^0-9]/g, ''));

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 2단 그리드 레이아웃: 데스크톱에서는 7:5 구조로 좌우 배치, 모바일에서는 상하 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 좌측: 입력 폼 영역 (7열) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 공통 기준 입력 */}
          <section className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-sm">
            <h3 className="font-extrabold text-base mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
              공통 기준 입력
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <input 
                    type="checkbox" 
                    id="isIncomeProven" 
                    checked={data.isIncomeProven} 
                    onChange={e => handleChange('isIncomeProven', e.target.checked)} 
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isIncomeProven" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    <span className="font-bold text-gray-900 dark:text-white">세법상 소득 입증 가능</span> <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(65세 이상 필수)</span>
                  </label>
                </div>
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={data.income ? formatCurrency(data.income) : ''}
                    onChange={e => handleChange('income', parseCurrency(e.target.value))}
                    placeholder="신고소득 직접입력"
                    className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all font-bold text-sm"
                  />
                  <span className="absolute right-4 top-3 text-sm text-gray-400 dark:text-gray-500 font-medium">원</span>
                </div>
                <button 
                  onClick={() => {
                    handleChange('income', 3284525);
                    handleChange('isIncomeProven', false);
                  }} 
                  className="w-full py-2 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-100 dark:border-blue-900/30 transition-all"
                >
                  도시일용근로자 임금 적용 (3,284,525원)
                </button>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">본인 과실 비율</label>
                <div className="relative mb-2.5">
                  <input
                    type="number"
                    min="0" max="100"
                    value={data.faultRatio === 0 ? '0' : (data.faultRatio || '')}
                    onChange={e => handleChange('faultRatio', Number(e.target.value))}
                    className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all font-bold text-sm"
                  />
                  <span className="absolute right-4 top-3 text-sm text-gray-400 dark:text-gray-500 font-medium">%</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleChange('faultRatio', 0)} className="flex-1 py-2 bg-white dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">0%</button>
                  <button onClick={() => handleChange('faultRatio', 10)} className="flex-1 py-2 bg-white dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">10%</button>
                  <button onClick={() => handleChange('faultRatio', 20)} className="flex-1 py-2 bg-white dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">20%</button>
                  <button onClick={() => addValue('faultRatio', 10, 100)} className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">+10%</button>
                </div>
              </div>
            </div>
          </section>

          {/* 피해 상황 다중 선택 */}
          <section className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-gray-200/80 dark:border-white/5 shadow-sm">
            <h3 className="font-extrabold text-base mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
              피해 상황 (다중 선택 가능)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleChange('hasInjury', !data.hasInjury)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${data.hasInjury ? 'bg-blue-50/50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-[#f8f9fa] border-gray-100 hover:border-gray-200 text-gray-600 dark:bg-[#303134] dark:border-transparent dark:text-gray-300'}`}
              >
                <div className="text-2xl">🩹</div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500">대인배상 I</div>
                  <span className="font-bold text-sm">부상 (상해)</span>
                </div>
              </button>
              <button
                onClick={() => handleChange('hasDisability', !data.hasDisability)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${data.hasDisability ? 'bg-purple-50/50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-[#f8f9fa] border-gray-100 hover:border-gray-200 text-gray-600 dark:bg-[#303134] dark:border-transparent dark:text-gray-300'}`}
              >
                <div className="text-2xl">🩼</div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500">대인배상 II</div>
                  <span className="font-bold text-sm">후유장해</span>
                </div>
              </button>
              <button
                onClick={() => handleChange('hasDeath', !data.hasDeath)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${data.hasDeath ? 'bg-red-50/50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-[#f8f9fa] border-gray-100 hover:border-gray-200 text-gray-600 dark:bg-[#303134] dark:border-transparent dark:text-gray-300'}`}
              >
                <div className="text-2xl">🕊️</div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-gray-400 dark:text-gray-500">사망 피해보상</div>
                  <span className="font-bold text-sm">사망</span>
                </div>
              </button>
            </div>
          </section>

          {/* 부상 상세 입력 */}
          {data.hasInjury && (
            <section className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-visible">
              <h3 className="font-extrabold text-base mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                부상 상세 입력
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="col-span-1 relative">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    부상 진단명 (다중 선택)
                  </label>
                  
                  <div className="relative mb-2.5" ref={searchRef}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsSearchFocused(true);
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="진단명 검색"
                        className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-9 pr-3 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs"
                      />
                    </div>
                    
                    {isSearchFocused && searchTerm && (
                      <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {INJURY_DB.filter(i => {
                          const t = searchTerm.replace(/\s+/g, '').toLowerCase();
                          const n = i.name.replace(/\s+/g, '').toLowerCase();
                          if (n.includes(t)) return true;
                          if (t.includes('경추염좌') || t.includes('요추염좌') || t.includes('목염좌') || t.includes('허리염좌')) {
                            if (n.includes('척추염좌')) return true;
                          }
                          if (t === '경추' || t === '요추') {
                            if (n.includes('척추')) return true;
                          }
                          if (t.includes('디스크')) {
                            if (n.includes('추간판탈출증')) return true;
                          }
                          return false;
                        }).map(i => (
                          <div 
                            key={i.id} 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleToggleDiagnosis(i.id);
                              setSearchTerm('');
                              setIsSearchFocused(false);
                            }}
                            className="px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between items-center text-gray-900 dark:text-white"
                          >
                            <span>{i.name}</span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{i.grade}급</span>
                          </div>
                        ))}
                        {INJURY_DB.filter(i => i.name.includes(searchTerm)).length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-500 text-center">검색 결과가 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-h-[32px] flex flex-wrap gap-1.5">
                    {data.selectedDiagnoses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {INJURY_DB.filter(i => data.selectedDiagnoses.includes(i.id)).map(i => (
                          <div key={i.id} className="flex items-center gap-1 bg-blue-50/70 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-[11px] font-bold border border-blue-100 dark:border-blue-900/40">
                            <span>[{i.grade}급] {i.name}</span>
                            <button onClick={() => handleToggleDiagnosis(i.id)} className="ml-1 hover:text-red-500 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">입원 일수</label>
                  <div className="relative mb-2">
                    <input type="number" value={data.hospitalDays === 0 ? '0' : (data.hospitalDays || '')} onChange={e => handleChange('hospitalDays', Number(e.target.value))} className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs" />
                    <span className="absolute right-4 top-3 text-xs text-gray-400">일</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => addValue('hospitalDays', 1)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200/80 transition-colors">+1일</button>
                    <button onClick={() => addValue('hospitalDays', 7)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200/80 transition-colors">+1주</button>
                    <button onClick={() => handleChange('hospitalDays', 0)} className="flex-1 py-1.5 bg-white border border-gray-200 dark:bg-[#202124] dark:border-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 transition-colors">0일</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">통원 일수</label>
                  <div className="relative mb-2">
                    <input type="number" value={data.outpatientDays === 0 ? '0' : (data.outpatientDays || '')} onChange={e => handleChange('outpatientDays', Number(e.target.value))} className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs" />
                    <span className="absolute right-4 top-3 text-xs text-gray-400">일</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => addValue('outpatientDays', 1)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200/80 transition-colors">+1일</button>
                    <button onClick={() => addValue('outpatientDays', 7)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200/80 transition-colors">+1주</button>
                    <button onClick={() => handleChange('outpatientDays', 0)} className="flex-1 py-1.5 bg-white border border-gray-200 dark:bg-[#202124] dark:border-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 transition-colors">0일</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 후유장해 상세 입력 */}
          {data.hasDisability && (
            <section className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
              <h3 className="font-extrabold text-base mb-4 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-600 rounded-full inline-block" />
                후유장해 상세 입력
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">맥브라이드 장해율 (%)</label>
                  <div className="relative mb-2">
                    <input type="number" value={data.disabilityRate === 0 ? '0' : (data.disabilityRate || '')} onChange={e => handleChange('disabilityRate', Number(e.target.value))} className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs" />
                    <span className="absolute right-4 top-3 text-xs text-gray-400">%</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleChange('disabilityRate', 5)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-900/20 hover:bg-purple-100/30 transition-colors">5%</button>
                    <button onClick={() => handleChange('disabilityRate', 10)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-900/20 hover:bg-purple-100/30 transition-colors">10%</button>
                    <button onClick={() => addValue('disabilityRate', 1)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">+1%</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">장해 기간 (0년은 영구장해)</label>
                  <div className="relative mb-2">
                    <input type="number" value={data.disabilityYears === 0 ? '0' : (data.disabilityYears || '')} onChange={e => handleChange('disabilityYears', Number(e.target.value))} className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs" />
                    <span className="absolute right-4 top-3 text-xs text-gray-400">년</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleChange('disabilityYears', 1)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-900/20 hover:bg-purple-100/30 transition-colors">한시 1년</button>
                    <button onClick={() => handleChange('disabilityYears', 3)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-900/20 hover:bg-purple-100/30 transition-colors">한시 3년</button>
                    <button onClick={() => handleChange('disabilityYears', 0)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">영구 (0년)</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 사망 상세 입력 */}
          {data.hasDeath && (
            <section className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
              <h3 className="font-extrabold text-base mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
                사망 상세 입력
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">사고 당시 만 나이</label>
                  <div className="relative mb-2">
                    <input
                      type="number"
                      value={data.ageAtAccident || ''}
                      onChange={e => handleChange('ageAtAccident', Number(e.target.value))}
                      className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all font-bold text-xs"
                    />
                    <span className="absolute right-4 top-3 text-xs text-gray-400">세</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => addValue('ageAtAccident', -1)} className="flex-1 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/20 hover:bg-red-100/30 transition-colors">-1살</button>
                    <button onClick={() => addValue('ageAtAccident', 1)} className="flex-1 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/20 hover:bg-red-100/30 transition-colors">+1살</button>
                  </div>
                </div>
                <div className="flex flex-col justify-center bg-red-50/50 dark:bg-red-900/5 p-4 rounded-xl border border-red-100/50 dark:border-red-900/20 text-xs text-red-700 dark:text-red-400 leading-relaxed font-semibold">
                  <div>※ 약관상 위자료(최대 8,000만 원) 및 장례비(500만 원)가 기본 반영됩니다.</div>
                  <div className="mt-1">※ 입력하신 나이와 소득을 기준으로 상실수익액이 정밀하게 자동 계산됩니다.</div>
                </div>
              </div>
            </section>
          )}

          {/* 추가 지출 */}
          <section className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm">
            <h3 className="font-extrabold text-base mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
              <span className="w-1 h-4 bg-green-600 rounded-full inline-block" />
              직불 치료비 및 향후치료비
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">직불영수증 (실제 지출 병원비)</label>
                <div className="relative mb-2">
                  <input type="text" value={data.directReceipts ? formatCurrency(data.directReceipts) : ''} onChange={e => handleChange('directReceipts', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs" />
                  <span className="absolute right-4 top-3.5 text-xs text-gray-400">원</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => addValue('directReceipts', 100000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100/30 transition-colors">+10만</button>
                  <button onClick={() => addValue('directReceipts', 500000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100/30 transition-colors">+50만</button>
                  <button onClick={() => handleChange('directReceipts', 0)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">0원</button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">향후치료비 (성형, 흉터, 핀제거 등)</label>
                <div className="relative mb-2">
                  <input type="text" value={data.futureTreatmentCost ? formatCurrency(data.futureTreatmentCost) : ''} onChange={e => handleChange('futureTreatmentCost', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-[#202124] focus:outline-none transition-all text-xs" />
                  <span className="absolute right-4 top-3.5 text-xs text-gray-400">원</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => addValue('futureTreatmentCost', 500000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100/30 transition-colors">+50만</button>
                  <button onClick={() => addValue('futureTreatmentCost', 1000000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100/30 transition-colors">+100만</button>
                  <button onClick={() => handleChange('futureTreatmentCost', 0)} className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">0원</button>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* 우측: 결과 영역 (5열) - 데스크톱에서 스티키(Sticky)하게 고정 */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 lg:self-start">
          <AutoCalculatorResult data={data} />
        </div>

      </div>
    </div>
  );
}
