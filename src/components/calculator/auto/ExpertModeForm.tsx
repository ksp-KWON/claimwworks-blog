'use client';

import { useState } from 'react';
import { AutoInsuranceData, initialAutoData } from './calculator-types';
import AutoCalculatorResult from './AutoCalculatorResult';

export default function ExpertModeForm() {
  const [data, setData] = useState<AutoInsuranceData>(initialAutoData);

  const handleChange = (field: keyof AutoInsuranceData, value: number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
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
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">공통 기준 입력</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">월 평균 소득 (세전)</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">본인 과실 비율</label>
              <div className="relative">
                <input
                  type="number"
                  min="0" max="100"
                  value={data.faultRatio || ''}
                  onChange={e => handleChange('faultRatio', Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">%</span>
              </div>
            </div>
          </div>
        </section>

        {/* 피해 상황 다중 선택 */}
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">피해 상황 (다중 선택 가능)</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.hasInjury} onChange={e => handleChange('hasInjury', e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">부상 (상해)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.hasDisability} onChange={e => handleChange('hasDisability', e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">후유장해</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.hasDeath} onChange={e => handleChange('hasDeath', e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">사망</span>
            </label>
          </div>
        </section>

        {/* 부상 상세 입력 */}
        {data.hasInjury && (
          <section className="bg-gray-50 dark:bg-[#303134]/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30">
            <h3 className="font-bold text-lg mb-4 text-blue-800 dark:text-blue-400">부상 상세 입력</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상해 급수 (1~14급)</label>
                <select value={data.injuryGrade} onChange={e => handleChange('injuryGrade', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  {Array.from({length: 14}, (_, i) => i + 1).map(g => (
                    <option key={g} value={g}>{g}급</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">입원 일수</label>
                <div className="relative">
                  <input type="number" value={data.hospitalDays || ''} onChange={e => handleChange('hospitalDays', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">일</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">통원 일수</label>
                <div className="relative">
                  <input type="number" value={data.outpatientDays || ''} onChange={e => handleChange('outpatientDays', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">일</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 후유장해 상세 입력 */}
        {data.hasDisability && (
          <section className="bg-gray-50 dark:bg-[#303134]/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-900/30">
            <h3 className="font-bold text-lg mb-4 text-purple-800 dark:text-purple-400">후유장해 상세 입력</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">맥브라이드 장해율 (%)</label>
                <div className="relative">
                  <input type="number" value={data.disabilityRate || ''} onChange={e => handleChange('disabilityRate', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">한시장해 기간 (0년이면 영구장해)</label>
                <div className="relative">
                  <input type="number" value={data.disabilityYears || ''} onChange={e => handleChange('disabilityYears', Number(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" />
                  <span className="absolute right-4 top-3.5 text-gray-400">년</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 추가 지출 (직불영수증 / 향후치료비) */}
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-6 rounded-2xl border border-green-200 dark:border-green-900/30">
          <h3 className="font-bold text-lg mb-4 text-green-800 dark:text-green-400">직불 치료비 및 향후치료비</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">직불영수증 (본인지출 병원비)</label>
              <div className="relative">
                <input type="text" value={data.directReceipts ? formatCurrency(data.directReceipts) : ''} onChange={e => handleChange('directReceipts', parseCurrency(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 font-bold" />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">향후치료비 (성형, 핀제거 등)</label>
              <div className="relative">
                <input type="text" value={data.futureTreatmentCost ? formatCurrency(data.futureTreatmentCost) : ''} onChange={e => handleChange('futureTreatmentCost', parseCurrency(e.target.value))} className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 font-bold" />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
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
