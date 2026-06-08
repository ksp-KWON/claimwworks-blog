'use client';

import { useState } from 'react';
import { AutoInsuranceData, initialAutoData } from './calculator-types';
import AutoCalculatorResult from './AutoCalculatorResult';

export default function ExpertModeForm() {
  const [data, setData] = useState<AutoInsuranceData>(initialAutoData);

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">월 평균 소득 (세법상 입증 가능한 세후 소득 기준)</label>
              <div className="relative mb-2">
                <input
                  type="text"
                  value={data.income ? formatCurrency(data.income) : ''}
                  onChange={e => handleChange('income', parseCurrency(e.target.value))}
                  placeholder="직접입력 (세법상 입증가능 신고소득)"
                  className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
              <button 
                onClick={() => handleChange('income', 3284525)} 
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">상해 급수 (1~14급)</label>
                <div className="relative">
                  <select value={data.injuryGrade} onChange={e => handleChange('injuryGrade', Number(e.target.value))} className="appearance-none [&::-ms-expand]:hidden w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500">
                    {Array.from({length: 14}, (_, i) => i + 1).map(g => (
                      <option key={g} value={g}>{g}급</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
    </div>
  );
}
