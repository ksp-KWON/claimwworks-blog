export interface AutoInsuranceData {
  income: number;
  faultRatio: number;
  
  // 피해 유형 (다중 선택 가능)
  hasInjury: boolean;
  hasDisability: boolean;
  hasDeath: boolean;

  // 부상(상해) 관련
  injuryGrade: number; // 1~14급
  hospitalDays: number;
  outpatientDays: number;

  // 장해 관련
  disabilityRate: number; // 맥브라이드 장해율 (%)
  disabilityYears: number; // 한시장해 기간(년) (0이면 영구장해)

  // 사망 관련
  ageAtAccident: number;

  // 추가/기타 지출
  directReceipts: number; // 직불영수증
  futureTreatmentCost: number; // 향후치료비 (성형, 핀제거 등)
}

export const initialAutoData: AutoInsuranceData = {
  income: 3500000,
  faultRatio: 0,
  
  hasInjury: true,
  hasDisability: false,
  hasDeath: false,

  injuryGrade: 12,
  hospitalDays: 0,
  outpatientDays: 0,
  disabilityRate: 0,
  disabilityYears: 0,

  ageAtAccident: 40,

  directReceipts: 0,
  futureTreatmentCost: 0,
};

// 약관상 급수별 위자료 (시연용 간소화)
export const INJURY_ALIMONY_TABLE: Record<number, number> = {
  1: 2000000, 2: 1760000, 3: 1520000, 4: 1280000, 5: 750000, 
  6: 500000, 7: 400000, 8: 300000, 9: 250000, 10: 200000, 
  11: 200000, 12: 150000, 13: 150000, 14: 150000
};
