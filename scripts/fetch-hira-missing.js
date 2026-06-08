const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const API_KEY = process.env.PUBLIC_DATA_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';
const OUT_PATH = path.join(process.cwd(), 'public/data/hira-hospitals.json');

const MISSING_SIDO_LIST = [
  { code: '340000', name: '충청남도', short: '충남' },
  { code: '350000', name: '전북특별자치도', short: '전북' },
  { code: '380000', name: '경상남도', short: '경남' },
  { code: '390000', name: '제주특별자치도', short: '제주' },
];

const SPECIALTY_DISEASES = {
  '정형외과': ['척추압박골절', '회전근개 파열', '십자인대 파열', '아킬레스건 파열', '반월상 연골판 파열', '손목/발목 골절', '고관절 골절'],
  '신경외과': ['목/허리디스크(추간판탈출증)', '척추관협착증', '외상성 뇌출혈', '경추/요추 염좌', '뇌경색'],
  '내과': ['급성 심근경색증', '협심증', '기왕증 기여도 산정', '고혈압성 심질환'],
  '외과': ['하지정맥류 수술', '탈장 수술', '갑상선암 소액암', '복강경 수술'],
  '산부인과': ['자궁근종(하이푸 시술)', '유방 섬유선종(맘모톰)', '요실금 수술', '자궁경부암'],
  '안과': ['백내장(다초점 렌즈)', '황반변성', '녹내장', '망막박리'],
  '피부과': ['여드름/레이저 미용', '흉터 레이저(핀홀 시술)', '대상포진'],
  '성형외과': ['도수치료/비급여', '흉터 성형', '지방흡입'],
  '비뇨의학과': ['전립선비대증(유로리프트)', '요로결석 쇄석술', '방광암'],
  '치과': ['임플란트/치조골 이식술', '크라운/브릿지', '치주질환'],
  '한방내과': ['교통사고 첩약 처방', '추나요법', '침구 치료'],
  '재활의학과': ['도수치료', '체외충격파치료(ESWT)', '통증 재활'],
  '마취통증의학과': ['신경차단술', '경막외 스테로이드', '관절강 내 주사'],
  '신경과': ['뇌졸중(뇌경색/뇌출혈)', '파킨슨병', '편두통'],
  '이비인후과': ['후두염', '만성 부비동염', '이명/난청', '편도선 수술'],
  '응급의학과': ['외상 응급처치', '다발성 골절', '두부 외상'],
  '가정의학과': ['만성질환 관리', '건강검진', '비만 치료'],
};

function guessSpecialtyFromName(name) {
  const n = name.replace(/\s/g, '');
  if (n.includes('정형')) return '정형외과';
  if (n.includes('신경외과')) return '신경외과';
  if (n.includes('신경과')) return '신경과';
  if (n.includes('재활')) return '재활의학과';
  if (n.includes('통증') || n.includes('마취')) return '마취통증의학과';
  if (n.includes('산부인과') || n.includes('여성')) return '산부인과';
  if (n.includes('안과')) return '안과';
  if (n.includes('이비인후')) return '이비인후과';
  if (n.includes('피부')) return '피부과';
  if (n.includes('성형')) return '성형외과';
  if (n.includes('비뇨')) return '비뇨의학과';
  if (n.includes('한방') || n.includes('한의')) return '한방내과';
  if (n.includes('치과')) return '치과';
  if (n.includes('응급')) return '응급의학과';
  if (n.includes('가정의학')) return '가정의학과';
  return null;
}

function mapClassToSpecialty(clNm) {
  if (!clNm) return '내과';
  if (clNm.includes('치과')) return '치과';
  if (clNm.includes('한방') || clNm.includes('한의')) return '한방내과';
  if (clNm.includes('정신')) return null;
  if (clNm.includes('요양')) return null;
  if (clNm.includes('보건')) return null;
  if (clNm.includes('약국')) return null;
  return '내과';
}

async function fetchAllHospitalsForSido(sidoCode, sidoName) {
  const hospitals = [];
  let pageNo = 1;
  const numOfRows = 100;
  let retryCount = 0;

  while (true) {
    const url = `${BASE_URL}?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=${pageNo}&numOfRows=${numOfRows}&sidoCd=${sidoCode}&_type=json`;
    try {
      // 30초 타임아웃
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const json = await res.json();
      const body = json?.response?.body;
      const items = body?.items?.item;

      if (!items) break;
      const arr = Array.isArray(items) ? items : [items];
      hospitals.push(...arr);

      const totalCount = parseInt(body?.totalCount || '0', 10);
      if (pageNo * numOfRows >= totalCount) break;
      pageNo++;
      retryCount = 0; // 성공 시 리트라이 초기화
      await new Promise(r => setTimeout(r, 200)); // 딜레이 증가
    } catch (e) {
      if (retryCount < 3) {
        retryCount++;
        console.warn(`  ⚠️  ${sidoName} p.${pageNo} 오류: ${e.message} - 재시도 ${retryCount}/3`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error(`  ❌  ${sidoName} p.${pageNo} 최종 실패: ${e.message}`);
        break;
      }
    }
  }
  return hospitals;
}

function buildStructure(allHospitals) {
  const result = { regions: {} };
  for (const h of allHospitals) {
    const sido = h.sidoCdNm || h.addr?.split(' ')[0] || '기타';
    const sggu = h.sgguCdNm || h.addr?.split(' ')[1] || '기타';
    const clNm = h.clCdNm || '의원';
    const specialty = guessSpecialtyFromName(h.yadmNm || '') || mapClassToSpecialty(clNm);

    if (!specialty) continue;
    if (!result.regions[sido]) result.regions[sido] = { districts: {} };
    if (!result.regions[sido].districts[sggu]) result.regions[sido].districts[sggu] = { specialties: {} };
    if (!result.regions[sido].districts[sggu].specialties[specialty]) {
      result.regions[sido].districts[sggu].specialties[specialty] = {
        count: 0,
        diseases: SPECIALTY_DISEASES[specialty] || [],
        hospitals: []
      };
    }
    const sp = result.regions[sido].districts[sggu].specialties[specialty];
    sp.count++;
    sp.hospitals.push({ name: h.yadmNm || '', address: h.addr || '', tel: h.telno || '' });
  }
  return result;
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏥 누락된 지역(충남,전북,경남,제주) 추가 수집 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!fs.existsSync(OUT_PATH)) {
    console.error('원본 hira-hospitals.json 파일이 없습니다.');
    process.exit(1);
  }

  // 기존 데이터 로드
  const existingData = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));

  // 기존 4개 지역의 잘못된(불완전한) 데이터 초기화
  for (const sido of MISSING_SIDO_LIST) {
    if (existingData.regions[sido.short]) {
      delete existingData.regions[sido.short];
      console.log(`기존 불완전한 ${sido.short} 데이터를 삭제했습니다.`);
    }
  }

  const allHospitals = [];
  let totalFetched = 0;

  for (const { code, name } of MISSING_SIDO_LIST) {
    process.stdout.write(`  📡 ${name} 재수집 중...`);
    const hospitals = await fetchAllHospitalsForSido(code, name);
    allHospitals.push(...hospitals);
    totalFetched += hospitals.length;
    console.log(` ${hospitals.length}건 완료 (새로 누계: ${totalFetched}건)`);
  }

  const newStructuredData = buildStructure(allHospitals);

  // 기존 데이터에 새 데이터 병합
  for (const [sido, sidoData] of Object.entries(newStructuredData.regions)) {
    existingData.regions[sido] = sidoData;
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(existingData, null, 2), 'utf8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ 누락 지역 데이터 병합 완료! (${totalFetched}건 추가)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(e => { console.error('오류:', e.message); process.exit(1); });
