/**
 * generate-blog-post.js
 * 보상스쿨 블로그 자동글쓰기 스크립트
 * - Gemini AI를 사용해 손해사정/보험/병원 관련 전문 포스팅 자동 생성
 * - E-E-A-T 기준 프롬프트 설계
 * - Node.js 내장 모듈(fs, path, fetch)만 사용 → npm install 불필요
 */

'use strict';
const fs = require('fs');
const path = require('path');

// ── .env.local 로컬 테스트용 환경변수 로드 ──
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

// ── 경로 설정 ──
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// ── 자동글쓰기 토픽 풀 (29개) ──
const TOPIC_POOL = [
  { slug: 'rotator-cuff-tear-insurance-guide', title: '회전근개 파열 보험금 청구 가이드: 수술 후 후유장해 보상 핵심 전략', category: '병원 보상 가이드', specialtyCategory: '정형외과 (OS)', tags: ['회전근개파열','어깨수술','후유장해','실손보험','손해사정'], keywords: '회전근개 파열, 어깨 MRI, 실손보험, 후유장해 보험금' },
  { slug: 'herniated-disc-compensation-guide', title: '목·허리디스크(추간판탈출증) 교통사고 보상 완벽 가이드', category: '교통사고 보상 가이드', specialtyCategory: '신경외과 (NS)', tags: ['목디스크','허리디스크','추간판탈출증','교통사고합의금','손해사정'], keywords: '디스크 교통사고, 추간판탈출증, 신경외과, 후유장해' },
  { slug: 'cataract-multifocal-lens-insurance-dispute', title: '백내장 다초점렌즈 실손보험 분쟁: 보험금 받는 방법과 주의사항', category: '실손보험 분쟁 가이드', specialtyCategory: '안과 (OPH)', tags: ['백내장','다초점렌즈','실손보험','비급여','보험분쟁'], keywords: '백내장 실손보험, 다초점렌즈 보험금, 안과 비급여' },
  { slug: 'uterine-fibroid-hifu-insurance', title: '자궁근종 하이푸(HIFU) 시술 실손보험 청구 가이드', category: '실손보험 분쟁 가이드', specialtyCategory: '산부인과 (OBGY)', tags: ['자궁근종','하이푸','HIFU','실손보험','비급여청구'], keywords: '자궁근종 하이푸 보험, 실손보험 청구, 산부인과 비급여' },
  { slug: 'meniscus-tear-compensation-guide', title: '반월상연골판 파열 보험금: 수술 여부에 따른 후유장해 보상 전략', category: '병원 보상 가이드', specialtyCategory: '정형외과 (OS)', tags: ['반월상연골판','무릎수술','관절경','후유장해','손해사정'], keywords: '반월상연골판 파열, 무릎 MRI, 관절경 수술, 보험금' },
  { slug: 'spinal-stenosis-insurance-guide', title: '척추관협착증 비수술·수술 보상 비교: 실손보험 & 후유장해 완벽 정리', category: '병원 보상 가이드', specialtyCategory: '신경외과 (NS)', tags: ['척추관협착증','비수술치료','후유장해','실손보험','손해사정'], keywords: '척추관협착증 실손보험, 비수술 치료, 후유장해 보험금' },
  { slug: 'acute-myocardial-infarction-insurance', title: '급성 심근경색증 보험금: 진단비·수술비·후유장해 한번에 정리', category: '병원 보상 가이드', specialtyCategory: '내과 (IM)', tags: ['심근경색','진단비','수술비','보험금청구','손해사정'], keywords: '심근경색 보험금, 진단비 청구, 심장수술 후유장해' },
  { slug: 'traffic-accident-settlement-amount-guide', title: '교통사고 합의금 계산법: 손해사정사가 알려주는 정당한 금액 산정 기준', category: '교통사고 보상 가이드', specialtyCategory: '신경외과 (NS)', tags: ['교통사고합의금','합의금계산','손해사정','보험사협상','치료비'], keywords: '교통사고 합의금 계산, 손해배상, 보험금 산정' },
  { slug: 'achilles-tendon-rupture-guide', title: '아킬레스건 파열 후 보험금 청구: 수술·재활 후 후유장해 보상 핵심', category: '병원 보상 가이드', specialtyCategory: '정형외과 (OS)', tags: ['아킬레스건파열','발목수술','후유장해','실손보험','손해사정'], keywords: '아킬레스건 파열, 수술 후 재활, 후유장해 보험금' },
  { slug: 'do-su-therapy-insurance-dispute', title: '도수치료 실손보험 분쟁 완벽 가이드: 거절 이유와 대응 전략', category: '실손보험 분쟁 가이드', specialtyCategory: '피부과 (DER) / 성형외과 (PS)', tags: ['도수치료','실손보험','비급여','보험분쟁','보험거절'], keywords: '도수치료 실손보험, 비급여 치료, 보험금 거절 대응' },
  { slug: 'prior-disease-contribution-ratio-guide', title: '기왕증(사고 전 질병) 기여도 분쟁: 보험사에 맞서는 대응 전략', category: '보험 분쟁 가이드', specialtyCategory: '내과 (IM)', tags: ['기왕증','기여도','보험분쟁','손해사정','교통사고'], keywords: '기왕증 기여도, 보험금 삭감, 분쟁 해결' },
  { slug: 'implant-dental-insurance-guide', title: '임플란트 치조골 이식술 실손보험 청구 가이드', category: '실손보험 분쟁 가이드', specialtyCategory: '치과 (DEN)', tags: ['임플란트','치조골이식','실손보험','치과비급여','보험청구'], keywords: '임플란트 보험금, 치조골 이식 실손, 치과 비급여' },
  { slug: 'prostate-hyperplasia-urolift-insurance', title: '전립선비대증 유로리프트(결찰술) 실손보험 청구 방법', category: '실손보험 분쟁 가이드', specialtyCategory: '비뇨의학과 (URO)', tags: ['전립선비대증','유로리프트','결찰술','실손보험','비급여'], keywords: '전립선 유로리프트 보험금, 비뇨기과 실손' },
  { slug: 'acl-tear-injury-compensation', title: '전방십자인대(ACL) 파열 교통사고 후유장해 보상 가이드', category: '교통사고 보상 가이드', specialtyCategory: '정형외과 (OS)', tags: ['전방십자인대','무릎인대','후유장해','교통사고','손해사정'], keywords: '십자인대 파열 보험금, 무릎 교통사고, 후유장해 청구' },
  { slug: 'traumatic-brain-hemorrhage-guide', title: '외상성 뇌출혈 보험금 청구: 후유장해 등급과 보상 핵심 포인트', category: '병원 보상 가이드', specialtyCategory: '신경외과 (NS)', tags: ['뇌출혈','외상성뇌손상','후유장해','교통사고','손해사정'], keywords: '외상성 뇌출혈 보험금, 뇌손상 후유장해, 신경외과' },
  { slug: 'varicose-veins-insurance-dispute', title: '하지정맥류 수술 실손보험 분쟁: 급여·비급여 구분과 청구 전략', category: '실손보험 분쟁 가이드', specialtyCategory: '외과 (GS)', tags: ['하지정맥류','정맥류수술','실손보험','비급여','보험분쟁'], keywords: '하지정맥류 실손보험, 수술비 청구, 급여 비급여' },
  { slug: 'thyroid-cancer-minor-insurance', title: '갑상선암 소액암 분쟁: 일반암 vs 소액암 보험금 차이와 대응법', category: '보험 분쟁 가이드', specialtyCategory: '외과 (GS)', tags: ['갑상선암','소액암','암보험분쟁','보험금','손해사정'], keywords: '갑상선암 보험금, 소액암 분쟁, 암보험 청구' },
  { slug: 'macular-degeneration-injection-insurance', title: '황반변성 주사치료(아일리아·루센티스) 실손보험 청구 가이드', category: '실손보험 분쟁 가이드', specialtyCategory: '안과 (OPH)', tags: ['황반변성','아일리아','루센티스','실손보험','비급여주사'], keywords: '황반변성 주사 보험금, 안과 비급여, 실손 청구' },
  { slug: 'traffic-accident-medical-cost-guide', title: '교통사고 치료비 전액 받는 방법: 자동차보험 지불보증 완전 정복', category: '교통사고 보상 가이드', specialtyCategory: '정형외과 (OS)', tags: ['지불보증','자동차보험','교통사고치료비','손해사정','보험처리'], keywords: '교통사고 지불보증, 치료비 청구, 자동차보험' },
  { slug: 'hanok-medicine-chuna-therapy-insurance', title: '한방 추나요법·첩약 실손보험 청구: 인정 기준과 분쟁 대응법', category: '실손보험 분쟁 가이드', specialtyCategory: '한방의학과 (KM)', tags: ['추나요법','첩약','한방실손','교통사고한방','보험분쟁'], keywords: '추나요법 실손보험, 한방 첩약 보험금, 교통사고 한방 치료' },
  { slug: 'loss-adjuster-role-guide', title: '손해사정사가 하는 일: 보험금을 제대로 받기 위한 전문가 활용법', category: '손해사정 가이드', specialtyCategory: '정형외과 (OS)', tags: ['손해사정사','보험전문가','보험금청구','독립손해사정','보상가이드'], keywords: '손해사정사 역할, 독립 손해사정사, 보험금 청구 도움' },
  { slug: 'disability-rating-mcbride-ama-guide', title: '맥브라이드 vs AMA 장해평가: 후유장해 등급 결정 방식 완벽 비교', category: '손해사정 가이드', specialtyCategory: '정형외과 (OS)', tags: ['맥브라이드','AMA장해평가','후유장해등급','손해사정','장해진단서'], keywords: '맥브라이드 장해평가, AMA 방식, 후유장해 등급 산정' },
  { slug: 'car-accident-uninsured-victim-guide', title: '무보험·뺑소니 교통사고 피해자 보상 가이드: 정부보장사업 활용법', category: '교통사고 보상 가이드', specialtyCategory: '신경외과 (NS)', tags: ['무보험사고','뺑소니','정부보장사업','피해자보상','손해사정'], keywords: '무보험 교통사고, 뺑소니 보상, 정부보장사업' },
  { slug: 'incontinence-surgery-insurance-guide', title: '요실금 수술 실손보험 청구: 급여·비급여 구분과 분쟁 대응 전략', category: '실손보험 분쟁 가이드', specialtyCategory: '산부인과 (OBGY)', tags: ['요실금','요실금수술','실손보험','비급여','보험분쟁'], keywords: '요실금 수술 보험금, 실손 청구, 산부인과 비급여' },
  { slug: 'wrist-fracture-colles-guide', title: '손목 골절(콜레스 골절) 교통사고 후유장해 보상 핵심 가이드', category: '교통사고 보상 가이드', specialtyCategory: '정형외과 (OS)', tags: ['손목골절','콜레스골절','후유장해','교통사고','손해사정'], keywords: '손목 골절 후유장해, 교통사고 골절 보험금' },
  { slug: 'angina-pectoris-insurance-dispute', title: '협심증 진단비 분쟁: 보험사 지급 거절 이유와 승소 전략', category: '보험 분쟁 가이드', specialtyCategory: '내과 (IM)', tags: ['협심증','진단비','보험거절','보험분쟁','손해사정'], keywords: '협심증 진단비 분쟁, 보험금 거절, 심장질환 보험' },
  { slug: 'fibromyoma-mammotome-insurance', title: '유방 섬유선종 맘모톰 절제술 실손보험 청구 완벽 가이드', category: '실손보험 분쟁 가이드', specialtyCategory: '산부인과 (OBGY)', tags: ['유방섬유선종','맘모톰','실손보험','비급여','유방수술'], keywords: '맘모톰 절제술 실손보험, 유방 비급여 보험금' },
  { slug: 'scar-laser-pinhole-insurance', title: '흉터 레이저·핀홀 시술 실손보험 청구: 인정 기준과 거절 대응법', category: '실손보험 분쟁 가이드', specialtyCategory: '피부과 (DER) / 성형외과 (PS)', tags: ['흉터레이저','핀홀시술','실손보험','비급여','피부과'], keywords: '흉터 레이저 실손보험, 피부과 비급여 청구' },
  { slug: 'urinary-stone-lithotripsy-guide', title: '요로결석 쇄석술 실손보험 청구: 입원·외래 구분과 청구 전략', category: '실손보험 분쟁 가이드', specialtyCategory: '비뇨의학과 (URO)', tags: ['요로결석','쇄석술','실손보험','비급여','비뇨기과'], keywords: '요로결석 쇄석술 보험금, 비뇨기과 실손 청구' },
  { slug: 'glaucoma-insurance-guide', title: '녹내장 레이저·수술 실손보험: 급여 전환 후 달라진 청구 방법', category: '실손보험 분쟁 가이드', specialtyCategory: '안과 (OPH)', tags: ['녹내장','안과레이저','실손보험','급여전환','보험청구'], keywords: '녹내장 수술 보험금, 안과 실손 청구, 급여 전환' },
];

// ── Gemini API 호출 ──
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === '여기에_입력' || apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY가 올바르게 설정되지 않았습니다.');
  }

  console.log('  API 키 확인됨 (' + apiKey.length + '자)');
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
  console.log('  엔드포인트: ' + url.replace(apiKey, '[HIDDEN]'));

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 8192 },
      }),
    });
  } catch (fetchErr) {
    throw new Error('네트워크 오류: ' + fetchErr.message);
  }

  console.log('  HTTP 응답: ' + response.status);

  if (!response.ok) {
    const body = await response.text();
    console.error('  API 오류 응답: ' + body);
    throw new Error('Gemini API HTTP ' + response.status);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('  응답 내용: ' + JSON.stringify(data));
    throw new Error('응답에서 텍스트 추출 실패');
  }
  return text;
}

// ── 토픽 선택 ──
function selectTopic() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
  const existing = new Set(
    fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
  );
  console.log('  기존 포스트: ' + existing.size + '개');
  const available = TOPIC_POOL.filter(t => !existing.has(t.slug));
  if (available.length === 0) {
    const idx = Math.floor(Date.now() / 86400000) % TOPIC_POOL.length;
    return TOPIC_POOL[idx];
  }
  return available[0];
}

// ── KST 날짜 반환 ──
function getKSTDate() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return kst.toISOString().split('T')[0];
}

// ── 프롬프트 생성 ──
function buildPrompt(topic) {
  return `# Role (역할)
너는 매일 자동으로 구글 최상단 노출(SEO) 및 애드센스 고품질 평가 기준을 충족하는 블로그 포스팅을 생성하는 'SEO 특화 테크니컬 라이팅 에이전트(Agent)'다. 

# Objective (목적)
주어진 오늘의 타겟 키워드를 바탕으로, 구글 검색 엔진이 선호하는 EEAT(전문성, 권위성, 신뢰성, 경험) 기준에 부합하는 공백 제외 최소 1,500자 이상의 깊이 있는 전문 칼럼을 작성한다.

# Input Data (오늘의 자동화 입력 변수)
- 오늘의 타겟 키워드: ${topic.keywords}
- 세부 주제 및 타겟독자: ${topic.title}에 관심이 있는 현직 실무자 및 일반인

# Strict Rules (에이전트 절대 준수 규칙)

## 1. 출력 형식 통제 (System Safety)
- [CRITICAL] 대화형 응답("네, 작성해 드리겠습니다" 등)은 절대 출력하지 마라.
- 응답에는 어떠한 프론트매터(Frontmatter)나 H1 제목('# 제목')도 포함하지 마라. 바로 본문부터 시작하라.
- 모든 서식은 순수 마크다운(Markdown) 문법만을 사용하여 출력하라. (HTML/JSX 태그 절대 금지)

## 2. 문서 고유성 및 유사 문서 회피 (Anti-Plagiarism)
- 원론적이고 사전적인 정의(예: "~란 무엇인가요?")로 지면을 낭비하지 마라.
- 누구나 아는 뻔한 내용 대신, 구체적인 사례, 통계적 수치(가상의 논리적 추정치라도 명시), 최신 트렌드, 실무적인 해결책을 중심으로 서술하라.
- **[경험(Experience) 강조]:** 실제 현업 전문가(예: 손해사정사)나 실무자가 겪는 애로사항과 이를 해결한 구체적인 노하우를 최소 1개 이상 반드시 포함하라.

## 3. 구조적 가독성 (Readability & Semantic HTML) - 6월 1일 규칙 융합
- 도입부(Hook)는 타겟 독자의 페인포인트(Pain Point)를 찌르는 질문이나 흥미로운 통계로 시작하여 3문장 이내로 핵심을 배치하라. 날씨 인사 등 공허한 도입부를 절대 쓰지 마라.
- **[본문 - Semantic Structure]:** 소제목은 \`## (H2)\`와 \`### (H3)\`를 계층에 맞게 엄격히 사용하라.
- **[시각화 및 가독성]:** 
  - 정보의 비교, 절차, 장단점 설명 시 텍스트로만 나열하지 말고, 글 내부의 최소 2곳 이상에서 **'마크다운 표(Table)'** 또는 **'글머리 기호(-)'**를 사용하여 구글 봇이 정보를 구조화된 데이터로 인식하게 하라.
  - 가독성을 위해 내용 전환 시 문장 간에 가로 실선(\`---\`)을 적절히 배치하라.
  - **손해사정사의 조언/주의사항** 부분은 이모지와 굵은 글씨를 포함한 인용구(\`> \`) 블록을 활용하여 🛡️ 박스로 강조 정리하라.

## 4. AI 워터마크 및 문체 제거 (Tone & Manner)
- 일반적인 LLM이 남발하는 상투어("결론적으로 말씀드리자면", "주의를 기울여야 합니다", "도움이 되길 바랍니다", "중요한 점은")를 문장에서 완벽히 제거하라.
- 문단은 최대 3~4줄 이내로 짧게 끊어 치고, 각 문단에서 가장 중요한 핵심 키워드나 문장은 **볼드(**)** 처리하여 스캐닝이 가능하게 하라.
- 확신에 찬 전문가의 어조를 사용하며, 문장의 끝맺음은 '~입니다', '~합니다'로 간결하게 통일하라.

# Output Generation
위의 모든 규칙을 적용하여, 지금 바로 주어진 타겟 키워드에 대한 포스팅 본문 출력을 시작하라.`;
}

// ── 메인 ──
async function main() {
  console.log('=== 보상스쿨 자동글쓰기 시작 ===');
  console.log('Node: ' + process.version + ' | 시각: ' + new Date().toISOString());

  console.log('\n[1] 토픽 선택...');
  const topic = selectTopic();
  console.log('  선택: ' + topic.slug);

  console.log('\n[2] Gemini API 호출...');
  let content;
  try {
    content = await callGemini(buildPrompt(topic));
    console.log('  성공: ' + content.length + '자 생성됨');
  } catch (err) {
    console.error('  실패: ' + err.message);
    process.exit(1);
  }

  console.log('\n[3] 파일 저장...');
  const today = getKSTDate();
  const tags = topic.tags.map(t => '"' + t + '"').join(',');
  const firstLine = content.split('\n').map(l => l.trim()).find(l => l.length > 20 && !l.startsWith('#') && !l.startsWith('>'));
  const summary = (firstLine || topic.title).slice(0, 150).replace(/"/g, "'");

  const md = '---\ntitle: "' + topic.title + '"\ndate: "' + today + '"\nsummary: "' + summary + '"\ncategory: "' + topic.category + '"\nspecialtyCategory: "' + topic.specialtyCategory + '"\ntags: [' + tags + ']\npublished: true\n---\n\n' + content.trim() + '\n';

  const filePath = path.join(POSTS_DIR, topic.slug + '.md');
  fs.writeFileSync(filePath, md, 'utf8');
  console.log('  저장: ' + filePath);

  console.log('\n=== 자동글쓰기 완료: ' + topic.title + ' ===');
}

main().catch(err => {
  console.error('치명적 오류: ' + err.message);
  process.exit(1);
});
