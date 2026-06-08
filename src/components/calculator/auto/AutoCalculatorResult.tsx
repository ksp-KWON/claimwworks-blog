'use client';

import { AutoInsuranceData, INJURY_ALIMONY_TABLE } from './calculator-types';

interface Props {
  data: AutoInsuranceData;
}

export default function AutoCalculatorResult({ data }: Props) {
  // 간단한 약관/호프만계수 시연용 계산 로직 (실제 실무 로직은 매우 복잡하므로 시연용 추정치만 산출)
  
  let formulas: string[] = [];

  // 호프만 계수 산출 함수 (월 5/12% 단리 할인 방식 누적합, 판례 한도 240)
  const getHoffmanCoefficient = (months: number) => {
    let sum = 0;
    for (let i = 1; i <= months; i++) {
      sum += 1 / (1 + 0.05 * (i / 12));
    }
    return Math.min(sum, 240);
  };

  // 1. 위자료 (부상, 장해, 사망 중 가장 큰 금액 적용이 원칙)
  const deathAlimony = data.hasDeath ? (data.ageAtAccident >= 65 ? 50000000 : 80000000) : 0;
  const disabilityAlimony = data.hasDisability ? 80000000 * (data.disabilityRate / 100) * 0.7 : 0; // 대략적 산식
  
  // 병급 적용된 상해 급수 계산
  const appliedInjuryGrade = (data.hasMultipleInjuries && data.injuryGrade >= 2 && data.injuryGrade <= 11) ? Math.max(1, data.injuryGrade - 1) : data.injuryGrade;
  const injuryAlimony = data.hasInjury ? (INJURY_ALIMONY_TABLE[appliedInjuryGrade] || 150000) : 0;

  // 세 가지 위자료 중 최대값 하나만 적용
  const alimony = Math.max(deathAlimony, disabilityAlimony, injuryAlimony, 0);

  // 어떤 위자료가 적용되었는지 판별 (명세서 표시용)
  let appliedAlimonyLabel = "위자료 (미해당)";
  if (alimony > 0) {
    if (alimony === deathAlimony && data.hasDeath) {
      appliedAlimonyLabel = "사망 위자료";
      formulas.push(`사망 위자료: ${data.ageAtAccident >= 65 ? '65세 이상(5,000만 원)' : '65세 미만(8,000만 원)'}`);
    } else if (alimony === disabilityAlimony && data.hasDisability) {
      appliedAlimonyLabel = `후유장해 위자료 (${data.disabilityRate}%)`;
      formulas.push(`후유장해 위자료: 장해율에 따른 기준액 산출`);
    } else if (alimony === injuryAlimony && data.hasInjury) {
      appliedAlimonyLabel = `부상 위자료 (${appliedInjuryGrade}급)`;
      if (data.hasMultipleInjuries && data.injuryGrade >= 2 && data.injuryGrade <= 11) {
        formulas.push(`부상 위자료: ${data.injuryGrade}급에서 병급(상향) 적용된 ${appliedInjuryGrade}급 기준액`);
      } else {
        formulas.push(`부상 위자료: 상해 ${appliedInjuryGrade}급 기준액 적용`);
      }
    }
  }

  // 2. 휴업손해 (입원일수 * 일소득 * 85%)
  const canClaimLostIncome = data.ageAtAccident < 65 || data.isIncomeProven;
  const dailyIncome = data.income / 30;
  const lostIncome = (data.hasInjury && canClaimLostIncome) ? Math.floor(dailyIncome * data.hospitalDays * 0.85) : 0;
  
  if (data.hasInjury) {
    if (!canClaimLostIncome && data.hospitalDays > 0) {
      formulas.push(`휴업손해: 65세 이상 및 소득 미입증으로 휴업일수 산정 배제 (0원)`);
    } else if (lostIncome > 0) {
      formulas.push(`휴업손해: (월소득/30) × ${data.hospitalDays}일 × 85% = ${lostIncome.toLocaleString()}원`);
    }
  }

  // 3. 기타손배금 (통원일수 * 8000원)
  const otherDamages = data.hasInjury ? data.outpatientDays * 8000 : 0;
  if (otherDamages > 0) formulas.push(`기타손배금: 통원 ${data.outpatientDays}일 × 8,000원 = ${otherDamages.toLocaleString()}원`);

  // 4. 상실수익액 (소득 * 장해율 * 호프만계수)
  let lostEarnings = 0;
  const DAILY_WORKER_WAGE = 3284525;
  const actualIncome = data.isIncomeProven ? data.income : DAILY_WORKER_WAGE;
  
  // 62세 이상 취업가능월수 규칙 적용
  let totalMonths = 0;
  if (data.ageAtAccident < 62) {
    totalMonths = Math.max((65 - data.ageAtAccident) * 12, 0);
  } else if (data.ageAtAccident < 67) {
    totalMonths = 36;
  } else if (data.ageAtAccident < 76) {
    totalMonths = 24;
  } else {
    totalMonths = 12;
  }

  const monthsUntil65 = Math.max((65 - data.ageAtAccident) * 12, 0);
  const segment1Months = Math.min(totalMonths, monthsUntil65);
  const segment2Months = totalMonths - segment1Months;
  
  const hoffman1 = getHoffmanCoefficient(segment1Months);
  const hoffman2 = segment2Months > 0 ? (getHoffmanCoefficient(totalMonths) - hoffman1) : 0;

  if (data.hasDeath) {
    formulas.push(`사망 장례비: 약관 기준 500만 원 기본 적용`);
    
    if (data.ageAtAccident >= 65 && !data.isIncomeProven) {
      formulas.push(`사망 상실수익액: 65세 이상 및 소득 미입증으로 상실수익액 인정 배제 (0원)`);
    } else {
      const earning1 = Math.floor(actualIncome * (2/3) * hoffman1);
      const earning2 = Math.floor(DAILY_WORKER_WAGE * (2/3) * hoffman2);
      lostEarnings = earning1 + earning2;
      
      let formulaText = `사망 상실수익액(생활비 1/3 공제 반영): `;
      if (segment1Months > 0) formulaText += `[${segment1Months}개월분: 소득 × 2/3 × 호프만(${hoffman1.toFixed(4)})]`;
      if (segment2Months > 0) formulaText += `${segment1Months > 0 ? ' + ' : ''}[정년후 ${segment2Months}개월분: 일용임금 × 2/3 × 호프만(${hoffman2.toFixed(4)})]`;
      formulaText += ` = ${lostEarnings.toLocaleString()}원`;
      formulas.push(formulaText);
    }
  } else if (data.hasDisability && data.disabilityRate > 0) {
    const limitedTotalMonths = data.disabilityYears === 0 ? totalMonths : Math.min(data.disabilityYears * 12, totalMonths);
    const limitedSeg1 = Math.min(limitedTotalMonths, segment1Months);
    const limitedSeg2 = limitedTotalMonths - limitedSeg1;
    
    const h1 = getHoffmanCoefficient(limitedSeg1);
    const h2 = limitedSeg2 > 0 ? (getHoffmanCoefficient(limitedTotalMonths) - h1) : 0;

    if (data.ageAtAccident >= 65 && !data.isIncomeProven) {
      formulas.push(`장해 상실수익액: 65세 이상 및 소득 미입증으로 상실수익액 인정 배제 (0원)`);
    } else {
      const earning1 = Math.floor(actualIncome * (data.disabilityRate / 100) * h1);
      const earning2 = Math.floor(DAILY_WORKER_WAGE * (data.disabilityRate / 100) * h2);
      lostEarnings = earning1 + earning2;
      
      let formulaText = `장해 상실수익액(${data.disabilityRate}%): `;
      if (limitedSeg1 > 0) formulaText += `[${limitedSeg1}개월분: 소득 × 장해율 × 호프만(${h1.toFixed(4)})]`;
      if (limitedSeg2 > 0) formulaText += `${limitedSeg1 > 0 ? ' + ' : ''}[정년후 ${limitedSeg2}개월분: 일용임금 × 장해율 × 호프만(${h2.toFixed(4)})]`;
      formulaText += ` = ${lostEarnings.toLocaleString()}원`;
      formulas.push(formulaText);
    }
  }

  // 5. 합의 조율 항목, 실제 지출 및 장례비
  const directReceipts = data.directReceipts;
  const futureTreatmentCost = data.futureTreatmentCost;
  const funeralCost = data.hasDeath ? 5000000 : 0; // 약관상 장례비 500만원

  // 총 합계 (과실 상계 전)
  const totalBeforeFault = alimony + lostIncome + otherDamages + lostEarnings + directReceipts + futureTreatmentCost + funeralCost;
  
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
        
        {data.hasDeath && (
          <>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">사망 장례비</span>
              <span className="font-bold text-gray-900 dark:text-white">{funeralCost.toLocaleString()} 원</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">상실수익액 (사망, 만 {data.ageAtAccident}세)</span>
              <span className="font-bold text-gray-900 dark:text-white">{lostEarnings.toLocaleString()} 원</span>
            </div>
          </>
        )}
        
        {!data.hasDeath && data.hasDisability && (
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

        {formulas.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-2 mt-4 text-sm border border-blue-100 dark:border-blue-900/30">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">적용된 산출 계산식</h4>
            <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1 text-xs">
              {formulas.map((formula, idx) => (
                <li key={idx}>{formula}</li>
              ))}
            </ul>
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
