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

const SPECIALTY_DISEASES = {
  '정형외과':       ['척추압박골절', '회전근개 파열', '십자인대 파열', '아킬레스건 파열', '반월상 연골판 파열', '손목/발목 골절', '고관절 골절'],
  '신경외과':       ['목/허리디스크(추간판탈출증)', '척추관협착증', '외상성 뇌출혈', '경추/요추 염좌', '뇌경색'],
  '내과':           ['급성 심근경색증', '협심증', '기왕증 기여도 산정', '고혈압성 심질환'],
  '외과':           ['하지정맥류 수술', '탈장 수술', '갑상선암 소액암', '복강경 수술'],
  '산부인과':       ['자궁근종(하이푸 시술)', '유방 섬유선종(맘모톰)', '요실금 수술', '자궁경부암'],
  '안과':           ['백내장(다초점 렌즈)', '황반변성', '녹내장', '망막박리'],
  '피부과':         ['여드름/레이저 미용', '흉터 레이저(핀홀 시술)', '대상포진'],
  '성형외과':       ['도수치료/비급여', '흉터 성형', '지방흡입'],
  '비뇨의학과':     ['전립선비대증(유로리프트)', '요로결석 쇄석술', '방광암'],
  '치과':           ['임플란트/치조골 이식술', '크라운/브릿지', '치주질환'],
  '한방내과':       ['교통사고 첩약 처방', '추나요법', '침구 치료'],
  '재활의학과':     ['도수치료', '체외충격파치료(ESWT)', '통증 재활'],
  '마취통증의학과': ['신경차단술', '경막외 스테로이드', '관절강 내 주사'],
  '신경과':         ['뇌졸중(뇌경색/뇌출혈)', '파킨슨병', '편두통'],
  '이비인후과':     ['후두염', '만성 부비동염', '이명/난청', '편도선 수술'],
  '응급의학과':     ['외상 응급처치', '다발성 골절', '두부 외상'],
  '가정의학과':     ['만성질환 관리', '건강검진', '비만 치료'],
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

async function fetchSejong() {
  const hospitals = [];
  let pageNo = 1;
  const numOfRows = 100;

  while (true) {
    const url = `${BASE_URL}?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=${pageNo}&numOfRows=${numOfRows}&sidoCd=410000&_type=json`;
    console.log(`Fetching page ${pageNo}...`);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const json = await res.json();
      const body = json?.response?.body;
      const items = body?.items?.item;

      if (!items) break;
      const arr = Array.isArray(items) ? items : [items];
      hospitals.push(...arr);

      const totalCount = parseInt(body?.totalCount || '0', 10);
      if (pageNo * numOfRows >= totalCount) break;
      pageNo++;
    } catch (e) {
      console.warn(`Error on page ${pageNo}: ${e.message}`);
      break;
    }
  }
  return hospitals;
}

async function main() {
  console.log('Fetching Sejong hospitals (sidoCd=410000)...');
  const sejongHospitals = await fetchSejong();
  console.log(`Fetched ${sejongHospitals.length} hospitals in Sejong.`);

  const currentData = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));

  for (const h of sejongHospitals) {
    const sido = h.sidoCdNm || h.addr?.split(' ')[0] || '기타'; // e.g., '세종시'
    const sggu = h.sgguCdNm || h.addr?.split(' ')[1] || '기타';
    
    // For Sejong, 'sidoCdNm' and 'sgguCdNm' are both '세종시'. 
    // In our UI, "세종시" is better. Let's force it to "세종특별자치시" and "세종시".
    const finalSido = "세종특별자치시";
    const finalSggu = "세종시";

    const clNm = h.clCdNm || '의원';
    const specialtyFromName = guessSpecialtyFromName(h.yadmNm || '');
    const specialty = specialtyFromName || mapClassToSpecialty(clNm);

    if (!specialty) continue;

    if (!currentData.regions[finalSido]) currentData.regions[finalSido] = { districts: {} };
    if (!currentData.regions[finalSido].districts[finalSggu]) currentData.regions[finalSido].districts[finalSggu] = { specialties: {} };
    if (!currentData.regions[finalSido].districts[finalSggu].specialties[specialty]) {
      currentData.regions[finalSido].districts[finalSggu].specialties[specialty] = {
        count: 0,
        diseases: SPECIALTY_DISEASES[specialty] || [],
        hospitals: []
      };
    }

    const sp = currentData.regions[finalSido].districts[finalSggu].specialties[specialty];
    sp.count++;
    sp.hospitals.push({
      name: h.yadmNm || '',
      address: h.addr || '',
      tel: h.telno || '',
    });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(currentData, null, 2), 'utf8');
  console.log(`Sejong data appended successfully to ${OUT_PATH}`);
}

main().catch(console.error);
