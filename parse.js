const fs = require('fs');
const lines = fs.readFileSync('raw_injury_data.txt', 'utf8').split('\n').filter(l=>l.trim());
let result = `export interface InjuryDiagnosis {
  id: string;
  name: string;
  grade: number;
  category: '머리/목' | '척추' | '가슴/복부' | '팔/다리' | '기타';
}

export const INJURY_DB: InjuryDiagnosis[] = [
`;
let currentGrade = 0;
let idCounter = 1;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  let mGrade = line.match(/^([0-9]+)급/);
  if (mGrade) {
    currentGrade = parseInt(mGrade[1], 10);
    idCounter = 1;
    let mItem = line.match(/^[0-9]+급\s+\S+만원\s+([0-9]+)\.\s+(.*)/);
    if (mItem) {
      let text = mItem[2].trim();
      let cat = '기타';
      if (text.match(/뇌|머리|안구|각막|턱|얼굴|목|치과|결막|고막|시신경|안검|누소관|공막/)) cat = '머리/목';
      else if (text.match(/척추|척주|경추|요추|추간판|마비|등골뼈|신연손상/)) cat = '척추';
      else if (text.match(/팔|다리|골반|손|발|어깨|무릎|관절|종아리|넓적다리|인대|상완|비구|경골|슬개골|요골|척골|족관절|수관절|아킬레스건|쇄골|견갑골|피판술|고관절|치골|수지|족지|대퇴골|아킬레스|힘줄|근육/)) cat = '팔/다리';
      else if (text.match(/가슴|복부|장기|심장|폐|갈비|흉|신장|간|대동맥|대정맥|기관|비장|위|요도|음경|고환|복강|식도|비구|복장뼈/)) cat = '가슴/복부';
      text = text.replace(/'/g, "\\'");
      result += `  { id: '${currentGrade}-${idCounter}', name: '${text}', grade: ${currentGrade}, category: '${cat}' },\n`;
      idCounter++;
    }
  } else {
    let mItem = line.match(/^([0-9]+)\.\s+(.*)/);
    if (mItem) {
      let text = mItem[2].trim();
      let cat = '기타';
      if (text.match(/뇌|머리|안구|각막|턱|얼굴|목|치과|결막|고막|시신경|안검|누소관|공막/)) cat = '머리/목';
      else if (text.match(/척추|척주|경추|요추|추간판|마비|등골뼈|신연손상/)) cat = '척추';
      else if (text.match(/팔|다리|골반|손|발|어깨|무릎|관절|종아리|넓적다리|인대|상완|비구|경골|슬개골|요골|척골|족관절|수관절|아킬레스건|쇄골|견갑골|피판술|고관절|치골|수지|족지|대퇴골|아킬레스|힘줄|근육/)) cat = '팔/다리';
      else if (text.match(/가슴|복부|장기|심장|폐|갈비|흉|신장|간|대동맥|대정맥|기관|비장|위|요도|음경|고환|복강|식도|비구|복장뼈/)) cat = '가슴/복부';
      text = text.replace(/'/g, "\\'");
      result += `  { id: '${currentGrade}-${idCounter}', name: '${text}', grade: ${currentGrade}, category: '${cat}' },\n`;
      idCounter++;
    }
  }
}
result += '];\n';
fs.writeFileSync('src/components/calculator/auto/injury-db.ts', result);
console.log('Parsed and updated injury-db.ts successfully!');
