'use client';

import { useState, useRef, useEffect } from 'react';
import { AutoInsuranceData, initialAutoData } from './calculator-types';
import AutoCalculatorResult from './AutoCalculatorResult';
import { INJURY_DB, getHintsForGrade, InjuryDiagnosis } from './injury-db';

export default function ExpertModeForm() {
  const [data, setData] = useState<AutoInsuranceData>(initialAutoData);

  // 상해 검색 및 모달 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('전체');
  
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

  // 병급 로직: 선택된 진단명들이 바뀔 때마다 급수 자동 세팅
  useEffect(() => {
    if (data.selectedDiagnoses.length > 0) {
      const selected = INJURY_DB.filter(i => data.selectedDiagnoses.includes(i.id));
      if (selected.length > 0) {
        let highestGrade = Math.min(...selected.map(i => i.grade)); // 숫자가 작을수록 높은 급수
        const grades2to11 = selected.filter(i => i.grade >= 2 && i.grade <= 11);
        
        let hasMultiple = false;
        if (grades2to11.length >= 2) {
          hasMultiple = true;
        }

        setData(prev => ({
          ...prev,
          injuryGrade: highestGrade,
          hasMultipleInjuries: hasMultiple,
          isAutoGrade: true
        }));
      }
    } else if (data.isAutoGrade) {
      // 선택된 게 하나도 없어지면 기본값으로
      setData(prev => ({
        ...prev,
        isAutoGrade: false,
        hasMultipleInjuries: false
      }));
    }
  }, [data.selectedDiagnoses]);

  const handleToggleDiagnosis = (id: string) => {
    setData(prev => {
      if (prev.selectedDiagnoses.includes(id)) {
        return { ...prev, selectedDiagnoses: prev.selectedDiagnoses.filter(d => d !== id) };
      } else {
        return { ...prev, selectedDiagnoses: [...prev.selectedDiagnoses, id] };
      }
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
  const parseCurrency = (val: string) => Number(val.replace(/,/g, ''));

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      {/* 폼 영역 */}
      <div className="space-y-8">
        
        {/* 공통 기준 입력 */}
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">공통 기준 입력</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="isIncomeProven" 
                  checked={data.isIncomeProven} 
                  onChange={e => handleChange('isIncomeProven', e.target.checked)} 
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isIncomeProven" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <span className="font-bold text-gray-900 dark:text-white">세법상 소득 입증 가능</span> <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(65세 이상 보상 인정 필수)</span>
                </label>
              </div>
              <div className="relative mb-2">
                <input
                  type="text"
                  value={data.income ? formatCurrency(data.income) : ''}
                  onChange={e => handleChange('income', parseCurrency(e.target.value))}
                  placeholder="입증가능 신고소득 직접입력"
                  className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
              <button 
                onClick={() => {
                  handleChange('income', 3284525);
                  handleChange('isIncomeProven', false); // 일용근로자 임금은 기본적으로 소득입증 안됨 처리
                }} 
                className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
              >
                도시일용근로자 임금 적용 (3,284,525원)
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">본인 과실 비율</label>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0" max="100"
                  value={data.faultRatio === 0 ? '0' : (data.faultRatio || '')}
                  onChange={e => handleChange('faultRatio', Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">%</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleChange('faultRatio', 0)} className="flex-1 py-1.5 bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">0%</button>
                <button onClick={() => handleChange('faultRatio', 10)} className="flex-1 py-1.5 bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">10%</button>
                <button onClick={() => handleChange('faultRatio', 20)} className="flex-1 py-1.5 bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">20%</button>
                <button onClick={() => addValue('faultRatio', 10, 100)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300">+10%</button>
              </div>
            </div>
          </div>
        </section>

        {/* 피해 상황 다중 선택 (카드형 버튼 UI) */}
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">피해 상황 (다중 선택 가능)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleChange('hasInjury', !data.hasInjury)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${data.hasInjury ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200 dark:bg-[#202124] dark:border-gray-700'}`}
            >
              <div className="text-3xl mb-2">🩹</div>
              <span className="font-bold">부상 (상해)</span>
            </button>
            <button
              onClick={() => handleChange('hasDisability', !data.hasDisability)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${data.hasDisability ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-500' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-200 dark:bg-[#202124] dark:border-gray-700'}`}
            >
              <div className="text-3xl mb-2">🩼</div>
              <span className="font-bold">후유장해</span>
            </button>
            <button
              onClick={() => handleChange('hasDeath', !data.hasDeath)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${data.hasDeath ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500' : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 dark:bg-[#202124] dark:border-gray-700'}`}
            >
              <div className="text-3xl mb-2">🕊️</div>
              <span className="font-bold">사망</span>
            </button>
          </div>
        </section>

        {/* 부상 상세 입력 */}
        {data.hasInjury && (
          <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30">
            <h3 className="font-bold text-lg mb-4 text-blue-800 dark:text-blue-400">부상 상세 입력</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="col-span-1 sm:col-span-3">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    상해 진단명 및 급수 (다중 선택 시 병급 자동 계산)
                  </label>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    내 진단명 찾기 (모달)
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* 스마트 검색창 */}
                  <div className="flex-1 relative" ref={searchRef}>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsSearchFocused(true);
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="진단명 검색 (예: 염좌, 골절)"
                        className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                      />
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    
                    {/* 자동완성 드롭다운 */}
                    {isSearchFocused && searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#303134] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {INJURY_DB.filter(i => i.name.includes(searchTerm)).map(i => (
                          <div 
                            key={i.id} 
                            onClick={() => {
                              handleToggleDiagnosis(i.id);
                              setSearchTerm('');
                              setIsSearchFocused(false);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-900 dark:text-gray-100">{i.name}</span>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">{i.grade}급</span>
                          </div>
                        ))}
                        {INJURY_DB.filter(i => i.name.includes(searchTerm)).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">검색 결과가 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 기존 수동 급수 선택 (수동 입력용) */}
                  <div className="w-full sm:w-48 relative">
                    <select 
                      value={data.injuryGrade} 
                      onChange={e => {
                        handleChange('injuryGrade', Number(e.target.value));
                        // 수동 변경 시 기존 선택 초기화
                        handleChange('selectedDiagnoses', []);
                      }} 
                      className={`appearance-none [&::-ms-expand]:hidden w-full ${data.isAutoGrade ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-[#202124] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white'} border rounded-xl py-3 pl-4 pr-10 font-bold focus:ring-2 focus:ring-blue-500`}
                    >
                      {Array.from({length: 14}, (_, i) => i + 1).map(g => (
                        <option key={g} value={g}>{g}급 {data.isAutoGrade && data.injuryGrade === g ? '(자동)' : ''}</option>
                      ))}
                    </select>
                    <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${data.isAutoGrade ? 'text-blue-500' : 'text-gray-400'} pointer-events-none`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* 힌트 태그 & 선택된 태그 영역 */}
                <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50 min-h-[60px]">
                  {data.selectedDiagnoses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {INJURY_DB.filter(i => data.selectedDiagnoses.includes(i.id)).map(i => (
                        <div key={i.id} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 dark:border-blue-800">
                          <span>[{i.grade}급] {i.name}</span>
                          <button onClick={() => handleToggleDiagnosis(i.id)} className="ml-1 hover:text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">💡 {data.injuryGrade}급 대표 진단명:</span>
                      {getHintsForGrade(data.injuryGrade).map((hint, idx) => (
                        <span key={idx} className="text-xs bg-white dark:bg-[#303134] text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                          #{hint}
                        </span>
                      ))}
                      {getHintsForGrade(data.injuryGrade).length === 0 && <span className="text-xs text-gray-400">등록된 힌트가 없습니다.</span>}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">입원 일수</label>
                <div className="relative mb-2">
                  <input type="number" value={data.hospitalDays === 0 ? '0' : (data.hospitalDays || '')} onChange={e => handleChange('hospitalDays', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">일</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addValue('hospitalDays', 1)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600">+1일</button>
                  <button onClick={() => addValue('hospitalDays', 7)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600">+1주</button>
                  <button onClick={() => handleChange('hospitalDays', 0)} className="flex-1 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 dark:bg-[#202124] dark:border-gray-600">0일</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">통원 일수</label>
                <div className="relative mb-2">
                  <input type="number" value={data.outpatientDays === 0 ? '0' : (data.outpatientDays || '')} onChange={e => handleChange('outpatientDays', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">일</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addValue('outpatientDays', 1)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600">+1일</button>
                  <button onClick={() => addValue('outpatientDays', 7)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600">+1주</button>
                  <button onClick={() => handleChange('outpatientDays', 0)} className="flex-1 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 dark:bg-[#202124] dark:border-gray-600">0일</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 후유장해 상세 입력 */}
        {data.hasDisability && (
          <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-purple-200 dark:border-purple-900/30">
            <h3 className="font-bold text-lg mb-4 text-purple-800 dark:text-purple-400">후유장해 상세 입력</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">맥브라이드 장해율 (%)</label>
                <div className="relative mb-2">
                  <input type="number" value={data.disabilityRate === 0 ? '0' : (data.disabilityRate || '')} onChange={e => handleChange('disabilityRate', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">%</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleChange('disabilityRate', 5)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm font-bold border border-purple-200 dark:border-purple-800">5%</button>
                  <button onClick={() => handleChange('disabilityRate', 10)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm font-bold border border-purple-200 dark:border-purple-800">10%</button>
                  <button onClick={() => addValue('disabilityRate', 1)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300">+1%</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">장해 기간 (0년이면 영구장해)</label>
                <div className="relative mb-2">
                  <input type="number" value={data.disabilityYears === 0 ? '0' : (data.disabilityYears || '')} onChange={e => handleChange('disabilityYears', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">년</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleChange('disabilityYears', 1)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm font-bold border border-purple-200 dark:border-purple-800">한시 1년</button>
                  <button onClick={() => handleChange('disabilityYears', 3)} className="flex-1 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm font-bold border border-purple-200 dark:border-purple-800">한시 3년</button>
                  <button onClick={() => handleChange('disabilityYears', 0)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 text-gray-800 dark:text-white">영구장해(0년)</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 사망 상세 입력 */}
        {data.hasDeath && (
          <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-red-200 dark:border-red-900/30">
            <h3 className="font-bold text-lg mb-4 text-red-800 dark:text-red-400">사망 상세 입력</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">사고 당시 만 나이 (상실수익액 계산용)</label>
                <div className="relative mb-2">
                  <input
                    type="number"
                    value={data.ageAtAccident || ''}
                    onChange={e => handleChange('ageAtAccident', Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 font-bold"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400">세</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addValue('ageAtAccident', -1)} className="flex-1 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold border border-red-200 dark:border-red-800">-1살</button>
                  <button onClick={() => addValue('ageAtAccident', 1)} className="flex-1 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold border border-red-200 dark:border-red-800">+1살</button>
                </div>
              </div>
              <div className="flex flex-col justify-center bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium leading-relaxed">
                  <span className="font-bold">※ 자동 반영 안내</span><br/>
                  약관 기준에 따라 <strong>위자료(최대 8,000만 원)</strong>와 <strong>장례비(500만 원)</strong>가 기본 적용됩니다.<br/>
                  입력하신 <strong>만 나이</strong>와 <strong>소득</strong>을 바탕으로 남은 기대수익(상실수익액)이 정밀하게 산출됩니다.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 추가 지출 (직불영수증 / 향후치료비) */}
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-green-200 dark:border-green-900/30">
          <h3 className="font-bold text-lg mb-4 text-green-800 dark:text-green-400">직불 치료비 및 향후치료비</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">직불영수증 (병원 발행용 영수증 기준)</label>
              <div className="relative mb-2">
                <input type="text" value={data.directReceipts ? formatCurrency(data.directReceipts) : ''} onChange={e => handleChange('directReceipts', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500" />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => addValue('directReceipts', 100000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-bold border border-green-200 dark:border-green-800">+10만</button>
                <button onClick={() => addValue('directReceipts', 500000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-bold border border-green-200 dark:border-green-800">+50만</button>
                <button onClick={() => handleChange('directReceipts', 0)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">0원</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">향후치료비 (성형(흉터제거), 핀제거, 미경과 치료비 등)</label>
              <div className="relative mb-2">
                <input type="text" value={data.futureTreatmentCost ? formatCurrency(data.futureTreatmentCost) : ''} onChange={e => handleChange('futureTreatmentCost', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500" />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => addValue('futureTreatmentCost', 500000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-bold border border-green-200 dark:border-green-800">+50만</button>
                <button onClick={() => addValue('futureTreatmentCost', 1000000)} className="flex-1 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-bold border border-green-200 dark:border-green-800">+100만</button>
                <button onClick={() => handleChange('futureTreatmentCost', 0)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">0원</button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 하단 결과 영역 */}
      <div className="w-full mt-4">
        <AutoCalculatorResult data={data} />
      </div>

      {/* 진단명 찾기 모달 (아이디어 2) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#202124] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">내 진단명 찾기</h3>
                <p className="text-sm text-gray-500 mt-1">부위별 카테고리에서 진단명을 찾아 다중 선택하세요.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* 탭 메뉴 */}
            <div className="flex overflow-x-auto p-4 gap-2 border-b border-gray-100 dark:border-gray-800 scrollbar-hide">
              {['전체', '머리/목', '척추', '가슴/복부', '팔/다리', '기타'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 리스트 영역 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-[#1a1a1c]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INJURY_DB.filter(i => activeTab === '전체' || i.category === activeTab).map(i => {
                  const isSelected = data.selectedDiagnoses.includes(i.id);
                  return (
                    <div 
                      key={i.id}
                      onClick={() => handleToggleDiagnosis(i.id)}
                      className={`flex justify-between items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-transparent bg-white dark:bg-[#303134] hover:border-blue-200 dark:hover:border-blue-800 shadow-sm'}`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{i.category}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${i.grade <= 3 ? 'bg-red-100 text-red-700' : i.grade <= 7 ? 'bg-orange-100 text-orange-700' : i.grade <= 11 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>{i.grade}급</span>
                        </div>
                        <span className={`font-bold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>{i.name}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                        {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 하단 확인 버튼 */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#202124]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                <span>선택 완료</span>
                {data.selectedDiagnoses.length > 0 && (
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">{data.selectedDiagnoses.length}건 적용됨</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
