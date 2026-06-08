export interface InjuryDiagnosis {
  id: string;
  name: string;
  grade: number;
  category: '머리/목' | '척추' | '가슴/복부' | '팔/다리' | '기타';
}

export const INJURY_DB: InjuryDiagnosis[] = [
  // 1급
  { id: '1-1', name: '수술 여부와 상관없이 뇌손상으로 신경학적 증상이 고도인 상해', grade: 1, category: '머리/목' },
  { id: '1-2', name: '척수 손상으로 인한 완전 사지마비 또는 완전 하반신마비', grade: 1, category: '척추' },
  { id: '1-3', name: '양안 안구 파열로 적출 수술을 한 상해', grade: 1, category: '머리/목' },
  { id: '1-4', name: '심장 파열로 수술을 한 상해', grade: 1, category: '가슴/복부' },
  { id: '1-5', name: '대동맥, 대정맥 파열로 수술을 한 상해', grade: 1, category: '가슴/복부' },

  // 2급
  { id: '2-1', name: '뇌손상으로 신경학적 증상이 중등도인 상해 (수술 필요)', grade: 2, category: '머리/목' },
  { id: '2-2', name: '척수 손상으로 인한 불완전 사지마비 또는 하반신마비', grade: 2, category: '척추' },
  { id: '2-3', name: '간, 비장, 신장 등 복부 장기 파열로 장기 적출 수술을 한 상해', grade: 2, category: '가슴/복부' },
  { id: '2-4', name: '상완골, 대퇴골의 분쇄골절 (수술 동반)', grade: 2, category: '팔/다리' },
  { id: '2-5', name: '골반골 골절 (관절면 침범 또는 심한 전위)', grade: 2, category: '가슴/복부' },

  // 3급
  { id: '3-1', name: '뇌손상으로 신경학적 증상이 경도인 상해 (수술 필요)', grade: 3, category: '머리/목' },
  { id: '3-2', name: '척수 손상을 동반하지 않은 척추 골절 (수술 필요)', grade: 3, category: '척추' },
  { id: '3-3', name: '장기 적출을 하지 않은 복부 장기 파열 (수술 동반)', grade: 3, category: '가슴/복부' },
  { id: '3-4', name: '상완골, 대퇴골, 경골 골절 (단순골절, 수술 동반)', grade: 3, category: '팔/다리' },
  { id: '3-5', name: '안면부 복합 골절', grade: 3, category: '머리/목' },

  // 4급
  { id: '4-1', name: '뇌손상을 동반하지 않은 두개골 함몰 골절', grade: 4, category: '머리/목' },
  { id: '4-2', name: '골반골 단순 골절', grade: 4, category: '가슴/복부' },
  { id: '4-3', name: '슬개골 분쇄 골절', grade: 4, category: '팔/다리' },
  { id: '4-4', name: '요골, 척골, 족관절, 수관절 복합 골절 (수술 동반)', grade: 4, category: '팔/다리' },

  // 5급
  { id: '5-1', name: '수술을 시행하지 않은 척추 (경,흉,요추) 압박골절', grade: 5, category: '척추' },
  { id: '5-2', name: '슬개골, 족근골 단순 골절 (수술 동반)', grade: 5, category: '팔/다리' },
  { id: '5-3', name: '치아 파절 (7개 이상 10개 이하)', grade: 5, category: '머리/목' },

  // 6급
  { id: '6-1', name: '아킬레스건 파열 (수술 동반)', grade: 6, category: '팔/다리' },
  { id: '6-2', name: '십자인대, 반월상 연골 파열 (수술 동반)', grade: 6, category: '팔/다리' },
  { id: '6-3', name: '요골, 척골 간부 단순 골절', grade: 6, category: '팔/다리' },

  // 7급
  { id: '7-1', name: '쇄골 골절', grade: 7, category: '가슴/복부' },
  { id: '7-2', name: '견갑골 골절', grade: 7, category: '가슴/복부' },
  { id: '7-3', name: '치아 파절 (5개 이상 6개 이하)', grade: 7, category: '머리/목' },

  // 8급
  { id: '8-1', name: '수지(손가락) 또는 족지(발가락) 다발성 골절', grade: 8, category: '팔/다리' },
  { id: '8-2', name: '비골(코뼈) 골절 (수술 동반)', grade: 8, category: '머리/목' },
  { id: '8-3', name: '다발성 단순 늑골 골절', grade: 8, category: '가슴/복부' },

  // 9급
  { id: '9-1', name: '추간판 탈출증 (외상성, 수술 동반)', grade: 9, category: '척추' },
  { id: '9-2', name: '치아 파절 (3개 이상 4개 이하)', grade: 9, category: '머리/목' },
  { id: '9-3', name: '외상성 고막 파열', grade: 9, category: '머리/목' },
  { id: '9-4', name: '수지(손가락), 족지(발가락) 단발성 골절', grade: 9, category: '팔/다리' },

  // 10급
  { id: '10-1', name: '안면부 열상 (3cm 이상)', grade: 10, category: '머리/목' },
  { id: '10-2', name: '단발성 늑골 골절', grade: 10, category: '가슴/복부' },

  // 11급
  { id: '11-1', name: '뇌진탕', grade: 11, category: '머리/목' },
  { id: '11-2', name: '안면부 열상 (3cm 미만)', grade: 11, category: '머리/목' },
  { id: '11-3', name: '치아 파절 (2개 이하)', grade: 11, category: '머리/목' },
  { id: '11-4', name: '비골(코뼈) 골절 (수술 안함)', grade: 11, category: '머리/목' },

  // 12급 (실무상 가장 많은 비중)
  { id: '12-1', name: '경추 염좌 (목 삐끗)', grade: 12, category: '척추' },
  { id: '12-2', name: '요추 염좌 (허리 삐끗)', grade: 12, category: '척추' },
  { id: '12-3', name: '견관절(어깨) 염좌', grade: 12, category: '팔/다리' },
  { id: '12-4', name: '슬관절(무릎), 족관절(발목) 염좌', grade: 12, category: '팔/다리' },
  { id: '12-5', name: '추간판 탈출증 (수술 안함, 기왕증 악화 등)', grade: 12, category: '척추' },
  { id: '12-6', name: '근육 또는 힘줄의 단순 파열', grade: 12, category: '팔/다리' },

  // 13급
  { id: '13-1', name: '흉부 타박상', grade: 13, category: '가슴/복부' },
  { id: '13-2', name: '복부 타박상', grade: 13, category: '가슴/복부' },

  // 14급
  { id: '14-1', name: '단순 타박상', grade: 14, category: '기타' },
  { id: '14-2', name: '단순 찰과상 (피부 긁힘)', grade: 14, category: '기타' },
  { id: '14-3', name: '수족지(손발가락) 염좌', grade: 14, category: '팔/다리' },
];

// 급수별로 대표 진단명을 3개씩 추출하여 힌트로 제공하는 함수
export const getHintsForGrade = (grade: number): string[] => {
  return INJURY_DB.filter(i => i.grade === grade).map(i => i.name).slice(0, 3);
};
