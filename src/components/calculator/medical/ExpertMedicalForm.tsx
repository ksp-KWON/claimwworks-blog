'use client';

import { useState } from 'react';
import { MedicalInsuranceData, initialMedicalData, MedicalGeneration, TreatmentType, ClinicType } from './medical-calculator-types';
import MedicalCalculatorResult from './MedicalCalculatorResult';

export default function ExpertMedicalForm() {
  const [data, setData] = useState<MedicalInsuranceData>(initialMedicalData);

  const handleChange = (field: keyof MedicalInsuranceData, value: number | string) => {
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
        
        {/* 가입 정보 입력 */}
        <section className="bg-green-50 dark:bg-green-900/10 p-5 sm:p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
          <h3 className="font-bold text-lg mb-4 text-green-900 dark:text-green-400">가입 정보</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">실손 가입 시기 (세대)</label>
              <div className="relative">
                <select 
                  value={data.generation} 
                  onChange={e => handleChange('generation', Number(e.target.value))} 
                  className="appearance-none [&::-ms-expand]:hidden w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 font-bold"
                >
                  <option value={1}>1세대 (2009년 8월 이전 - 100% 보상)</option>
                  <option value={2}>2세대 (2009.8 ~ 2017.3 - 90% 보상)</option>
                  <option value={3}>3세대 (2017.4 ~ 2021.6 - 착한실손)</option>
                  <option value={4}>4세대 (2021년 7월 이후)</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">진료 형태</label>
              <div className="relative">
                <select 
                  value={data.treatmentType} 
                  onChange={e => handleChange('treatmentType', e.target.value as TreatmentType)} 
                  className="appearance-none [&::-ms-expand]:hidden w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 font-bold"
                >
                  <option value="inpatient">입원</option>
                  <option value="outpatient">통원 (외래)</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            
            {data.treatmentType === 'outpatient' && (
              <div className="sm:col-span-2 mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">통원(방문) 일수 (공제금액 계산용)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={data.outpatientDays || 1} 
                      onChange={e => handleChange('outpatientDays', Math.max(1, Number(e.target.value)))} 
                      className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500" 
                      min="1" 
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400">일</span>
                  </div>
                  <button onClick={() => handleChange('outpatientDays', Math.max(1, data.outpatientDays - 1))} className="w-12 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200">-</button>
                  <button onClick={() => handleChange('outpatientDays', data.outpatientDays + 1)} className="w-12 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200">+</button>
                </div>
              </div>
            )}
            {data.treatmentType === 'outpatient' && data.generation > 1 && (
              <div className="sm:col-span-2 mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">병원 규모 (통원 공제금액 계산용)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button onClick={() => handleChange('clinicType', 'clinic')} className={`py-3 sm:py-2 rounded-xl font-bold text-sm border-2 transition-all ${data.clinicType === 'clinic' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>의원 (최소 1만원)</button>
                  <button onClick={() => handleChange('clinicType', 'hospital')} className={`py-3 sm:py-2 rounded-xl font-bold text-sm border-2 transition-all ${data.clinicType === 'hospital' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>병원 (최소 1.5만원)</button>
                  <button onClick={() => handleChange('clinicType', 'general')} className={`py-3 sm:py-2 rounded-xl font-bold text-sm border-2 transition-all ${data.clinicType === 'general' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>종합병원 (최소 2만원)</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 기본 병원비 영수증 입력 */}
        <section className="bg-gray-50 dark:bg-[#303134]/30 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">기본 병원비 영수증</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">급여 (본인부담금)</label>
              <div className="relative">
                <input
                  type="text"
                  value={data.coveredCost ? formatCurrency(data.coveredCost) : ''}
                  onChange={e => handleChange('coveredCost', parseCurrency(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비급여 (본인부담금)</label>
              <div className="relative">
                <input
                  type="text"
                  value={data.nonCoveredCost ? formatCurrency(data.nonCoveredCost) : ''}
                  onChange={e => handleChange('nonCoveredCost', parseCurrency(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold"
                />
                <span className="absolute right-4 top-3.5 text-gray-400">원</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3대 비급여 입력 (3, 4세대 전용) */}
        {(data.generation === 3 || data.generation === 4) && (
          <section className="bg-red-50 dark:bg-red-900/10 p-5 sm:p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
            <h3 className="font-bold text-lg mb-1 text-red-900 dark:text-red-400">3대 비급여 특약 병원비</h3>
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">위의 일반 비급여 항목과 중복 입력하지 마세요.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">도수/체외충격파</label>
                <div className="relative">
                  <input type="text" value={data.manualTherapyCost ? formatCurrency(data.manualTherapyCost) : ''} onChange={e => handleChange('manualTherapyCost', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 font-bold" />
                  <span className="absolute right-4 top-3.5 text-gray-400">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비급여 주사료</label>
                <div className="relative">
                  <input type="text" value={data.injectionCost ? formatCurrency(data.injectionCost) : ''} onChange={e => handleChange('injectionCost', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 font-bold" />
                  <span className="absolute right-4 top-3.5 text-gray-400">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비급여 MRI</label>
                <div className="relative">
                  <input type="text" value={data.mriCost ? formatCurrency(data.mriCost) : ''} onChange={e => handleChange('mriCost', parseCurrency(e.target.value))} placeholder="0" className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 font-bold" />
                  <span className="absolute right-4 top-3.5 text-gray-400">원</span>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* 하단 결과 영역 */}
      <div className="w-full mt-4">
        <MedicalCalculatorResult data={data} />
      </div>
    </div>
  );
}
