'use client';

import { AutoInsuranceData, INJURY_ALIMONY_TABLE } from './calculator-types';

interface Props {
  data: AutoInsuranceData;
}

export default function AutoCalculatorResult({ data }: Props) {
  // 간단한 약관/호프만계수 시연용 계산 로직 (실제 실무 로직은 매우 복잡하므로 시연용 추정치만 산출)
  
  // 1. 위자료 (부상, 장해, 사망 중 가장 큰 금액 적용이 원칙)
  const deathAlimony = data.hasDeath ? 80000000 : 0; // 약관상 8천만원 (나이 무관 시연용)
  const disabilityAlimony = data.hasDisability ? 80000000 * (data.disabilityRate / 100) * 0.7 : 0; // 대략적 산식
  const injuryAlimony = data.hasInjury ? (INJURY_ALIMONY_TABLE[data.injuryGrade] || 150000) : 0;

  // 세 가지 위자료 중 최대값 하나만 적용
  const alimony = Math.max(deathAlimony, disabilityAlimony, injuryAlimony, 0);

  // 어떤 위자료가 적용되었는지 판별 (명세서 표시용)
  let appliedAlimonyLabel = "위자료 (미해당)";
  if (alimony > 0) {
    if (alimony === deathAlimony && data.hasDeath) {
      appliedAlimonyLabel = "사망 위자료";
    } else if (alimony === disabilityAlimony && data.hasDisability) {
      appliedAlimonyLabel = `후유장해 위자료 (${data.disabilityRate}%)`;
    } else if (alimony === injuryAlimony && data.hasInjury) {
      appliedAlimonyLabel = `부상 위자료 (${data.injuryGrade}급)`;
    }
  }

  // 2. 휴업손해 (입원일수 * 일소득 * 85%)
  const dailyIncome = data.income / 30;
  const lostIncome = data.hasInjury ? Math.floor(dailyIncome * data.hospitalDays * 0.85) : 0;

  // 3. 기타손배금 (통원일수 * 8000원)
  const otherDamages = data.hasInjury ? data.outpatientDays * 8000 : 0;

  // 4. 상실수익액 (소득 * 장해율 * 호프만계수) - 시연용 가라 호프만 계수(240 한도 적용)
  let lostEarnings = 0;
  if (data.hasDisability && data.disabilityRate > 0) {
    // 약관/판례상 호프만 계수는 최대 240개월을 한도로 함.
    const months = data.disabilityYears === 0 ? 240 : Math.min(data.disabilityYears * 12, 240);
    // 단순화된 계산식: 월소득 * 장해율 * 개월수(호프만대체)
    lostEarnings = Math.floor(data.income * (data.disabilityRate / 100) * months * 0.8);
  }

  // 5. 합의 조율 항목 및 실제 지출
  const directReceipts = data.directReceipts;
  const futureTreatmentCost = data.futureTreatmentCost;

  // 총 합계 (과실 상계 전)
  const totalBeforeFault = alimony + lostIncome + otherDamages + lostEarnings + directReceipts + futureTreatmentCost;
  
  // 과실 상계 (직불영수증 등 제외 복잡한 상계가 있지만 여기서는 전체 단순 상계)
  const finalTotal = Math.floor(totalBeforeFault * ((100 - data.faultRatio) / 100));

  return (
    <div className="bg-blue-50 dark:bg-[#303134]/50 rounded-3xl p-5 sm:p-8 border border-blue-100 dark:border-gray-800 shadow-sm sticky top-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block shrink-0" />
        산출 명세서 (추정치)
      </h3>

      <div className="space-y-4 text-sm mb-8">
        {alimony > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 font-medium">{appliedAlimonyLabel} <span className="text-xs text-blue-500 ml-1">(최대치 적용)</span></span>
            <span className="font-bold text-gray-900 dark:text-white">{alimony.toLocaleString()} 원</span>
          </div>
        )}
        
        {data.hasInjury && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">휴업손해 (입원 {data.hospitalDays}일)</span>
              <span className="font-bold text-gray-900 dark:text-white">{lostIncome.toLocaleString()} 원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">기타손배금 (통원 {data.outpatientDays}일)</span>
              <span className="font-bold text-gray-900 dark:text-white">{otherDamages.toLocaleString()} 원</span>
            </div>
          </>
        )}
        
        {data.hasDisability && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">상실수익액 (장해 {data.disabilityRate}%)</span>
            <span className="font-bold text-gray-900 dark:text-white">{lostEarnings.toLocaleString()} 원</span>
          </div>
        )}

        {(data.directReceipts > 0 || data.futureTreatmentCost > 0) && (
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            {data.directReceipts > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">직불 치료비 (영수증)</span>
                <span className="font-bold text-gray-900 dark:text-white">{directReceipts.toLocaleString()} 원</span>
              </div>
            )}
            {data.futureTreatmentCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">향후치료비 추정액</span>
                <span className="font-bold text-gray-900 dark:text-white">{futureTreatmentCost.toLocaleString()} 원</span>
              </div>
            )}
          </div>
        )}

        {data.faultRatio > 0 && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 text-red-500">
            <span className="font-medium">과실 상계 ({data.faultRatio}%)</span>
            <span className="font-bold">-{Math.floor(totalBeforeFault * (data.faultRatio / 100)).toLocaleString()} 원</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#202124] rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-gray-800 text-center shadow-sm">
        <h4 className="text-gray-500 dark:text-gray-400 font-bold mb-2">최종 합의금 (추정치)</h4>
        <div className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tighter">
          {finalTotal.toLocaleString()}<span className="text-2xl ml-1 text-gray-900 dark:text-white">원</span>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 bg-white/50 dark:bg-black/20 p-4 rounded-xl">
        <strong className="text-red-500">⚠️ 참고:</strong> 위 결과는 대인배상 약관 및 단순화된 호프만계수를 적용한 참고용 추정치입니다. 실제로는 치료비 상계가 발생할 수 있으며, 법원 기준(특인) 적용 시 수백~수천만 원 이상 증액될 수 있습니다. 섣불리 합의하지 마시고 반드시 전문가와 상담하세요.
      </div>

      <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="block text-center w-full mt-4 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white rounded-xl font-bold transition-colors">
        보상스쿨 무료 상담 신청하기
      </a>
    </div>
  );
}
