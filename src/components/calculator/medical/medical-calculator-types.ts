export type MedicalGeneration = 1 | 2 | 3 | 4;
export type TreatmentType = 'inpatient' | 'outpatient' | 'prescription';
export type ClinicType = 'clinic' | 'hospital' | 'general'; // 의원, 병원, 종합병원

export interface MedicalInsuranceData {
  generation: MedicalGeneration;
  treatmentType: TreatmentType;
  clinicType: ClinicType; // 통원 시 병원 규모
  outpatientDays: number; // 통원 일수
  
  // 영수증 비용
  coveredCost: number; // 급여 본인부담금
  nonCoveredCost: number; // 일반 비급여 본인부담금
  
  // 3대 비급여 (3, 4세대용)
  manualTherapyCost: number; // 도수치료/증식치료/체외충격파
  injectionCost: number; // 비급여 주사료
  mriCost: number; // 비급여 MRI
}

export const initialMedicalData: MedicalInsuranceData = {
  generation: 4,
  treatmentType: 'outpatient',
  clinicType: 'clinic',
  outpatientDays: 1,
  coveredCost: 0,
  nonCoveredCost: 0,
  manualTherapyCost: 0,
  injectionCost: 0,
  mriCost: 0,
};
