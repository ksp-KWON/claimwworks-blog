export interface InjuryDiagnosis {
  id: string;
  name: string;
  grade: number;
  category: '머리/목' | '척추' | '가슴/복부' | '팔/다리' | '기타';
}

export const INJURY_DB: InjuryDiagnosis[] = [
  // 1~3급 (중상)
  { id: '1', name: '척수 손상 (완전 사지마비)', grade: 1, category: '척추' },
  { id: '2', name: '뇌손상 (신경학적 증상 고도)', grade: 1, category: '머리/목' },
  { id: '3', name: '내부 장기 적출 수술', grade: 2, category: '가슴/복부' },
  { id: '4', name: '대퇴골 분쇄골절 (수술)', grade: 3, category: '팔/다리' },
  
  // 4~7급 (중등도)
  { id: '5', name: '대퇴골 골절', grade: 4, category: '팔/다리' },
  { id: '6', name: '슬개골 분쇄골절', grade: 5, category: '팔/다리' },
  { id: '7', name: '척추 압박골절 (수술 안함)', grade: 6, category: '척추' },
  { id: '8', name: '치아 5개 이상 파절', grade: 7, category: '머리/목' },
  
  // 8~11급 (일반 골절 등)
  { id: '9', name: '쇄골 골절', grade: 8, category: '팔/다리' },
  { id: '10', name: '추간판 탈출증 (수술)', grade: 9, category: '척추' },
  { id: '11', name: '단순 늑골 골절 (다발성)', grade: 9, category: '가슴/복부' },
  { id: '12', name: '발목(족관절) 골절', grade: 9, category: '팔/다리' },
  { id: '13', name: '뇌진탕', grade: 11, category: '머리/목' },
  { id: '14', name: '수지(손가락) 골절', grade: 11, category: '팔/다리' },
  
  // 12~14급 (경상 - 실무 최다 발생)
  { id: '15', name: '경추 염좌 (목 삐끗)', grade: 12, category: '척추' },
  { id: '16', name: '요추 염좌 (허리 삐끗)', grade: 12, category: '척추' },
  { id: '17', name: '3cm 미만 안면 열상', grade: 12, category: '머리/목' },
  { id: '18', name: '단순 늑골 골절 (단발성)', grade: 12, category: '가슴/복부' },
  { id: '19', name: '흉부 타박상', grade: 13, category: '가슴/복부' },
  { id: '20', name: '단순 타박상', grade: 14, category: '기타' },
  { id: '21', name: '수족지 염좌 (손목/발목)', grade: 14, category: '팔/다리' },
  { id: '22', name: '찰과상', grade: 14, category: '기타' },
];

// 급수별로 대표 진단명을 3개씩 추출하여 힌트로 제공하는 함수
export const getHintsForGrade = (grade: number): string[] => {
  return INJURY_DB.filter(i => i.grade === grade).map(i => i.name).slice(0, 3);
};
