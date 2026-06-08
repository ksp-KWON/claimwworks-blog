'use client';

import { MedicalInsuranceData } from './medical-calculator-types';

export default function MedicalCalculatorResult({ data }: { data: MedicalInsuranceData }) {
  // 공제금액 한도 상수
  const CLINIC_DEDUCTION = { clinic: 10000, hospital: 15000, general: 20000 };

  const calculateResult = () => {
    let coveredPayout = 0;
    let nonCoveredPayout = 0;
    let specialPayout = 0;
    let totalDeduction = 0;

    const totalCovered = data.coveredCost;
    const totalNormalNonCovered = data.nonCoveredCost;
    const totalSpecialNonCovered = data.manualTherapyCost + data.injectionCost + data.mriCost;
    
    const days = data.treatmentType === 'outpatient' ? (data.outpatientDays || 1) : 1;
    let formulas: string[] = [];

    if (data.generation === 1) {
      // 1세대 (100% 보상, 입원 전액 보상, 통원 5천원 공제)
      if (data.treatmentType === 'inpatient') {
        coveredPayout = totalCovered;
        nonCoveredPayout = totalNormalNonCovered;
        specialPayout = totalSpecialNonCovered;
        totalDeduction = 0;
        formulas.push(`입원 의료비 전액(100%) 보상`);
      } else {
        const totalCost = totalCovered + totalNormalNonCovered + totalSpecialNonCovered;
        totalDeduction = Math.min(totalCost, 5000 * days); // 통원 5천원 공제 * 일수
        const payout = totalCost - totalDeduction;
        // 비율대로 분할 (UI 표시용)
        coveredPayout = payout * (totalCovered / (totalCost || 1));
        nonCoveredPayout = payout * (totalNormalNonCovered / (totalCost || 1));
        specialPayout = payout * (totalSpecialNonCovered / (totalCost || 1));
        formulas.push(`통원 공제: 5,000원 × ${days}일 = ${(5000 * days).toLocaleString()}원 차감`);
      }
    } 
    else if (data.generation === 2) {
      // 2세대 (90% 보상)
      if (data.treatmentType === 'inpatient') {
        coveredPayout = totalCovered * 0.9;
        nonCoveredPayout = totalNormalNonCovered * 0.9;
        specialPayout = totalSpecialNonCovered * 0.9;
        totalDeduction = (totalCovered + totalNormalNonCovered + totalSpecialNonCovered) * 0.1;
        formulas.push(`입원 공제: 총 의료비의 10% 차감`);
      } else {
        const totalCost = totalCovered + totalNormalNonCovered + totalSpecialNonCovered;
        const deductPerDay = CLINIC_DEDUCTION[data.clinicType];
        totalDeduction = Math.min(totalCost, deductPerDay * days);
        const payout = totalCost - totalDeduction;
        coveredPayout = payout * (totalCovered / (totalCost || 1));
        nonCoveredPayout = payout * (totalNormalNonCovered / (totalCost || 1));
        specialPayout = payout * (totalSpecialNonCovered / (totalCost || 1));
        formulas.push(`통원 공제: 병원규모별 최소공제금액(${deductPerDay.toLocaleString()}원) × ${days}일 = ${(deductPerDay * days).toLocaleString()}원 차감`);
      }
    }
    else if (data.generation === 3) {
      // 3세대 (급여 90%, 일반 비급여 80%, 3대 비급여 70%)
      if (data.treatmentType === 'inpatient') {
        coveredPayout = totalCovered * 0.9;
        nonCoveredPayout = totalNormalNonCovered * 0.8;
        specialPayout = totalSpecialNonCovered * 0.7;
        totalDeduction = (totalCovered * 0.1) + (totalNormalNonCovered * 0.2) + (totalSpecialNonCovered * 0.3);
        formulas.push(`급여 10%, 일반비급여 20%, 3대비급여 30% 각각 공제`);
      } else {
        // 통원 공제 (10% 또는 병원규모별 최소금액) vs 20%
        const minDeduct = CLINIC_DEDUCTION[data.clinicType] * days;
        
        // 급여+일반 비급여 통원 계산
        const normalCost = totalCovered + totalNormalNonCovered;
        const normalDeduct = Math.max(minDeduct, (totalCovered * 0.1) + (totalNormalNonCovered * 0.2));
        const actualNormalPayout = Math.max(0, normalCost - normalDeduct);
        coveredPayout = actualNormalPayout * (totalCovered / (normalCost || 1));
        nonCoveredPayout = actualNormalPayout * (totalNormalNonCovered / (normalCost || 1));
        formulas.push(`기본 통원 공제: MAX(의료비의 10~20%, 최소공제금액×${days}일)`);

        // 3대 비급여 통원 계산 (30% 또는 2만원 중 큰 금액)
        const specialDeduct = Math.max(20000 * days, totalSpecialNonCovered * 0.3);
        specialPayout = Math.max(0, totalSpecialNonCovered - specialDeduct);
        if (totalSpecialNonCovered > 0) formulas.push(`3대 비급여 공제: MAX(30%, 2만원×${days}일)`);

        totalDeduction = (normalCost + totalSpecialNonCovered) - (actualNormalPayout + specialPayout);
      }
    }
    else if (data.generation === 4) {
      // 4세대 (급여 80%, 비급여 70%, 3대 비급여 70%)
      if (data.treatmentType === 'inpatient') {
        coveredPayout = totalCovered * 0.8;
        nonCoveredPayout = totalNormalNonCovered * 0.7;
        specialPayout = totalSpecialNonCovered * 0.7;
        totalDeduction = (totalCovered * 0.2) + (totalNormalNonCovered * 0.3) + (totalSpecialNonCovered * 0.3);
        formulas.push(`급여 20%, 비급여 30%, 3대비급여 30% 각각 공제`);
      } else {
        // 급여: 20% 또는 1만원(병원 2만원) 중 큰 금액
        const minCoveredDeduct = (data.clinicType === 'general' ? 20000 : 10000) * days;
        const coveredDeduct = Math.max(minCoveredDeduct, totalCovered * 0.2);
        coveredPayout = Math.max(0, totalCovered - coveredDeduct);
        if (totalCovered > 0) formulas.push(`급여 통원 공제: MAX(20%, 최소공제금액×${days}일)`);

        // 일반 비급여: 30% 또는 3만원 중 큰 금액
        const nonCoveredDeduct = Math.max(30000 * days, totalNormalNonCovered * 0.3);
        nonCoveredPayout = Math.max(0, totalNormalNonCovered - nonCoveredDeduct);
        if (totalNormalNonCovered > 0) formulas.push(`일반 비급여 공제: MAX(30%, 3만원×${days}일)`);

        // 3대 비급여: 30% 또는 3만원 중 큰 금액
        const specialDeduct = Math.max(30000 * days, totalSpecialNonCovered * 0.3);
        specialPayout = Math.max(0, totalSpecialNonCovered - specialDeduct);
        if (totalSpecialNonCovered > 0) formulas.push(`3대 비급여 공제: MAX(30%, 3만원×${days}일)`);

        const totalCost = totalCovered + totalNormalNonCovered + totalSpecialNonCovered;
        totalDeduction = totalCost - (coveredPayout + nonCoveredPayout + specialPayout);
      }
    }

    const totalPayout = coveredPayout + nonCoveredPayout + specialPayout;

    return {
      coveredPayout: Math.floor(coveredPayout),
      nonCoveredPayout: Math.floor(nonCoveredPayout),
      specialPayout: Math.floor(specialPayout),
      totalPayout: Math.floor(totalPayout),
      totalDeduction: Math.floor(totalDeduction),
      totalCost: totalCovered + totalNormalNonCovered + totalSpecialNonCovered,
      formulas
    };
  };

  const result = calculateResult();

  return (
    <div className="bg-white dark:bg-[#202124] rounded-2xl shadow-sm border border-green-200 dark:border-green-900 overflow-hidden">
      <div className="bg-green-600 dark:bg-green-800 p-5 sm:p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">실손의료비 예상 보상금</h3>
        <p className="text-green-100 text-sm">※ 가입 시기와 약관에 따라 실제 지급액과 다를 수 있습니다.</p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-6">
          <div>
            <span className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">고객님께서 받으실 금액</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-green-600 dark:text-green-400">{result.totalPayout.toLocaleString()}원</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">총 발생 의료비</span>
            <span className="font-bold text-gray-900 dark:text-white">{result.totalCost.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-500 dark:text-red-400 font-medium">(-) 본인부담 공제금액</span>
            <span className="font-bold text-red-500 dark:text-red-400">-{result.totalDeduction.toLocaleString()}원</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2 mt-4 text-sm border border-gray-100 dark:border-gray-800">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">세부 보상 내역</h4>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">급여 보상액</span>
            <span className="font-bold text-gray-900 dark:text-white">{result.coveredPayout.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">일반 비급여 보상액</span>
            <span className="font-bold text-gray-900 dark:text-white">{result.nonCoveredPayout.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">3대 비급여 보상액</span>
            <span className="font-bold text-gray-900 dark:text-white">{result.specialPayout.toLocaleString()}원</span>
          </div>
        </div>

        {result.formulas && result.formulas.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-2 mt-4 text-sm border border-blue-100 dark:border-blue-900/30">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">적용된 산출 계산식</h4>
            <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1 text-xs">
              {result.formulas.map((formula, idx) => (
                <li key={idx}>{formula}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
