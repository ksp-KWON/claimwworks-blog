/**
 * generate-blog-post.js
 *
 * 보상스쿨 블로그 자동글쓰기 스크립트
 * - 매일 GitHub Actions에 의해 실행됩니다.
 * - Gemini AI를 사용해 손해사정/보험/병원 관련 전문 포스팅을 자동 생성합니다.
 * - 생성된 글은 src/content/posts/ 에 .md 파일로 저장됩니다.
 * - E-E-A-T(경험·전문성·권위성·신뢰성) 기준으로 프롬프트가 설계되어 있습니다.
 */

const fs = require('fs');
const path = require('path');

// ── 환경변수 로드 (.env.local 파일 → 로컬 테스트용) ──
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const firstEquals = trimmed.indexOf('=');
    if (firstEquals === -1) continue;
    const key = trimmed.slice(0, firstEquals).trim();
    let val = trimmed.slice(firstEquals + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

// ── 경로 설정 ──
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// ── 자동글쓰기 토픽 풀 (30개) ──
// 이 목록에서 아직 글이 없는 토픽을 순서대로 선택합니다.
const TOPIC_POOL = [
  {
    slug: 'rotator-cuff-tear-insurance-guide',
    title: '회전근개 파열 보험금 청구 가이드: 수술 후 후유장해 보상 핵심 전략',
    category: '병원 보상 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['회전근개파열', '어깨수술', '후유장해', '실손보험', '손해사정'],
    keywords: '회전근개 파열, 어깨 MRI, 실손보험, 후유장해 보험금',
  },
  {
    slug: 'herniated-disc-compensation-guide',
    title: '목·허리디스크(추간판탈출증) 교통사고 보상 완벽 가이드',
    category: '교통사고 보상 가이드',
    specialtyCategory: '신경외과 (NS)',
    tags: ['목디스크', '허리디스크', '추간판탈출증', '교통사고합의금', '손해사정'],
    keywords: '디스크 교통사고, 추간판탈출증, 신경외과, 후유장해',
  },
  {
    slug: 'cataract-multifocal-lens-insurance-dispute',
    title: '백내장 다초점렌즈 실손보험 분쟁: 보험금 받는 방법과 주의사항',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '안과 (OPH)',
    tags: ['백내장', '다초점렌즈', '실손보험', '비급여', '보험분쟁'],
    keywords: '백내장 실손보험, 다초점렌즈 보험금, 안과 비급여',
  },
  {
    slug: 'uterine-fibroid-hifu-insurance',
    title: '자궁근종 하이푸(HIFU) 시술 실손보험 청구 가이드',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '산부인과 (OBGY)',
    tags: ['자궁근종', '하이푸', 'HIFU', '실손보험', '비급여청구'],
    keywords: '자궁근종 하이푸 보험, 실손보험 청구, 산부인과 비급여',
  },
  {
    slug: 'meniscus-tear-compensation-guide',
    title: '반월상연골판 파열 보험금: 수술 여부에 따른 후유장해 보상 전략',
    category: '병원 보상 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['반월상연골판', '무릎수술', '관절경', '후유장해', '손해사정'],
    keywords: '반월상연골판 파열, 무릎 MRI, 관절경 수술, 보험금',
  },
  {
    slug: 'spinal-stenosis-insurance-guide',
    title: '척추관협착증 비수술·수술 보상 비교: 실손보험 & 후유장해 완벽 정리',
    category: '병원 보상 가이드',
    specialtyCategory: '신경외과 (NS)',
    tags: ['척추관협착증', '비수술치료', '후유장해', '실손보험', '손해사정'],
    keywords: '척추관협착증 실손보험, 비수술 치료, 후유장해 보험금',
  },
  {
    slug: 'acute-myocardial-infarction-insurance',
    title: '급성 심근경색증 보험금: 진단비·수술비·후유장해 한번에 정리',
    category: '병원 보상 가이드',
    specialtyCategory: '내과 (IM)',
    tags: ['심근경색', '진단비', '수술비', '보험금청구', '손해사정'],
    keywords: '심근경색 보험금, 진단비 청구, 심장수술 후유장해',
  },
  {
    slug: 'traffic-accident-settlement-amount-guide',
    title: '교통사고 합의금 계산법: 손해사정사가 알려주는 정당한 금액 산정 기준',
    category: '교통사고 보상 가이드',
    specialtyCategory: '신경외과 (NS)',
    tags: ['교통사고합의금', '합의금계산', '손해사정', '보험사협상', '치료비'],
    keywords: '교통사고 합의금 계산, 손해배상, 보험금 산정',
  },
  {
    slug: 'achilles-tendon-rupture-guide',
    title: '아킬레스건 파열 후 보험금 청구: 수술·재활 후 후유장해 보상 핵심',
    category: '병원 보상 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['아킬레스건파열', '발목수술', '후유장해', '실손보험', '손해사정'],
    keywords: '아킬레스건 파열, 수술 후 재활, 후유장해 보험금',
  },
  {
    slug: 'do-su-therapy-insurance-dispute',
    title: '도수치료 실손보험 분쟁 완벽 가이드: 거절 이유와 대응 전략',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '피부과 (DER) / 성형외과 (PS)',
    tags: ['도수치료', '실손보험', '비급여', '보험분쟁', '보험거절'],
    keywords: '도수치료 실손보험, 비급여 치료, 보험금 거절 대응',
  },
  {
    slug: 'prior-disease-contribution-ratio-guide',
    title: '기왕증(사고 전 질병) 기여도 분쟁: 보험사에 맞서는 대응 전략',
    category: '보험 분쟁 가이드',
    specialtyCategory: '내과 (IM)',
    tags: ['기왕증', '기여도', '보험분쟁', '손해사정', '교통사고'],
    keywords: '기왕증 기여도, 보험금 삭감, 분쟁 해결',
  },
  {
    slug: 'implant-dental-insurance-guide',
    title: '임플란트 치조골 이식술 실손보험 청구 가이드',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '치과 (DEN)',
    tags: ['임플란트', '치조골이식', '실손보험', '치과비급여', '보험청구'],
    keywords: '임플란트 보험금, 치조골 이식 실손, 치과 비급여',
  },
  {
    slug: 'prostate-hyperplasia-urolift-insurance',
    title: '전립선비대증 유로리프트(결찰술) 실손보험 청구 방법',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '비뇨의학과 (URO)',
    tags: ['전립선비대증', '유로리프트', '결찰술', '실손보험', '비급여'],
    keywords: '전립선 유로리프트 보험금, 비뇨기과 실손',
  },
  {
    slug: 'acl-tear-injury-compensation',
    title: '전방십자인대(ACL) 파열 교통사고 후유장해 보상 가이드',
    category: '교통사고 보상 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['전방십자인대', '무릎인대', '후유장해', '교통사고', '손해사정'],
    keywords: '십자인대 파열 보험금, 무릎 교통사고, 후유장해 청구',
  },
  {
    slug: 'traumatic-brain-hemorrhage-guide',
    title: '외상성 뇌출혈 보험금 청구: 후유장해 등급과 보상 핵심 포인트',
    category: '병원 보상 가이드',
    specialtyCategory: '신경외과 (NS)',
    tags: ['뇌출혈', '외상성뇌손상', '후유장해', '교통사고', '손해사정'],
    keywords: '외상성 뇌출혈 보험금, 뇌손상 후유장해, 신경외과',
  },
  {
    slug: 'varicose-veins-insurance-dispute',
    title: '하지정맥류 수술 실손보험 분쟁: 급여·비급여 구분과 청구 전략',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '외과 (GS)',
    tags: ['하지정맥류', '정맥류수술', '실손보험', '비급여', '보험분쟁'],
    keywords: '하지정맥류 실손보험, 수술비 청구, 급여 비급여',
  },
  {
    slug: 'thyroid-cancer-minor-insurance',
    title: '갑상선암 소액암 분쟁: 일반암 vs 소액암 보험금 차이와 대응법',
    category: '보험 분쟁 가이드',
    specialtyCategory: '외과 (GS)',
    tags: ['갑상선암', '소액암', '암보험분쟁', '보험금', '손해사정'],
    keywords: '갑상선암 보험금, 소액암 분쟁, 암보험 청구',
  },
  {
    slug: 'macular-degeneration-injection-insurance',
    title: '황반변성 주사치료(아일리아·루센티스) 실손보험 청구 가이드',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '안과 (OPH)',
    tags: ['황반변성', '아일리아', '루센티스', '실손보험', '비급여주사'],
    keywords: '황반변성 주사 보험금, 안과 비급여, 실손 청구',
  },
  {
    slug: 'traffic-accident-medical-cost-guide',
    title: '교통사고 치료비 전액 받는 방법: 자동차보험 지불보증 완전 정복',
    category: '교통사고 보상 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['지불보증', '자동차보험', '교통사고치료비', '손해사정', '보험처리'],
    keywords: '교통사고 지불보증, 치료비 청구, 자동차보험',
  },
  {
    slug: 'hanok-medicine-chuna-therapy-insurance',
    title: '한방 추나요법·첩약 실손보험 청구: 인정 기준과 분쟁 대응법',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '한방의학과 (KM)',
    tags: ['추나요법', '첩약', '한방실손', '교통사고한방', '보험분쟁'],
    keywords: '추나요법 실손보험, 한방 첩약 보험금, 교통사고 한방 치료',
  },
  {
    slug: 'loss-adjuster-role-guide',
    title: '손해사정사가 하는 일: 보험금을 제대로 받기 위한 전문가 활용법',
    category: '손해사정 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['손해사정사', '보험전문가', '보험금청구', '독립손해사정', '보상가이드'],
    keywords: '손해사정사 역할, 독립 손해사정사, 보험금 청구 도움',
  },
  {
    slug: 'disability-rating-mcbride-ama-guide',
    title: '맥브라이드 vs AMA 장해평가: 후유장해 등급 결정 방식 완벽 비교',
    category: '손해사정 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['맥브라이드', 'AMA장해평가', '후유장해등급', '손해사정', '장해진단서'],
    keywords: '맥브라이드 장해평가, AMA 방식, 후유장해 등급 산정',
  },
  {
    slug: 'car-accident-uninsured-victim-guide',
    title: '무보험·뺑소니 교통사고 피해자 보상 가이드: 정부보장사업 활용법',
    category: '교통사고 보상 가이드',
    specialtyCategory: '신경외과 (NS)',
    tags: ['무보험사고', '뺑소니', '정부보장사업', '피해자보상', '손해사정'],
    keywords: '무보험 교통사고, 뺑소니 보상, 정부보장사업',
  },
  {
    slug: 'incontinence-surgery-insurance-guide',
    title: '요실금 수술 실손보험 청구: 급여·비급여 구분과 분쟁 대응 전략',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '산부인과 (OBGY)',
    tags: ['요실금', '요실금수술', '실손보험', '비급여', '보험분쟁'],
    keywords: '요실금 수술 보험금, 실손 청구, 산부인과 비급여',
  },
  {
    slug: 'wrist-fracture-colles-guide',
    title: '손목 골절(콜레스 골절) 교통사고 후유장해 보상 핵심 가이드',
    category: '교통사고 보상 가이드',
    specialtyCategory: '정형외과 (OS)',
    tags: ['손목골절', '콜레스골절', '후유장해', '교통사고', '손해사정'],
    keywords: '손목 골절 후유장해, 교통사고 골절 보험금',
  },
  {
    slug: 'angina-pectoris-insurance-dispute',
    title: '협심증 진단비 분쟁: 보험사 지급 거절 이유와 승소 전략',
    category: '보험 분쟁 가이드',
    specialtyCategory: '내과 (IM)',
    tags: ['협심증', '진단비', '보험거절', '보험분쟁', '손해사정'],
    keywords: '협심증 진단비 분쟁, 보험금 거절, 심장질환 보험',
  },
  {
    slug: 'fibromyoma-mammotome-insurance',
    title: '유방 섬유선종 맘모톰 절제술 실손보험 청구 완벽 가이드',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '산부인과 (OBGY)',
    tags: ['유방섬유선종', '맘모톰', '실손보험', '비급여', '유방수술'],
    keywords: '맘모톰 절제술 실손보험, 유방 비급여 보험금',
  },
  {
    slug: 'urinary-stone-lithotripsy-guide',
    title: '요로결석 쇄석술 실손보험 청구: 입원·외래 구분과 청구 전략',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '비뇨의학과 (URO)',
    tags: ['요로결석', '쇄석술', '실손보험', '비급여', '비뇨기과'],
    keywords: '요로결석 쇄석술 보험금, 비뇨기과 실손 청구',
  },
  {
    slug: 'glaucoma-insurance-guide',
    title: '녹내장 레이저·수술 실손보험: 급여 전환 후 달라진 청구 방법',
    category: '실손보험 분쟁 가이드',
    specialtyCategory: '안과 (OPH)',
    tags: ['녹내장', '안과레이저', '실손보험', '급여전환', '보험청구'],
    keywords: '녹내장 수술 보험금, 안과 실손 청구, 급여 전환',
  },
];

// ── Gemini API 호출 함수 ──
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // API 키 상태 확인
  if (!apiKey || apiKey === '여기에_입력') {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  console.log(`🔑 API 키 확인: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)} (전체 ${apiKey.length}자)`);

  // gemini-2.0-flash 모델 사용
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log(`🌐 API 엔드포인트: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
  
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 8192,
          topP: 0.9,
        },
      }),
    });
  } catch (fetchErr) {
    throw new Error(`네트워크 연결 실패: ${fetchErr.message}`);
  }

  console.log(`📊 API 응답 상태: HTTP ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API 오류 응답 전체 내용:');
    console.error(errorText);
    throw new Error(`Gemini API 오류 (HTTP ${response.status})`);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    console.error('❌ 빈 응답 데이터:', JSON.stringify(data, null, 2));
    throw new Error('Gemini API가 빈 응답을 반환했습니다.');
  }

  const text = data.candidates[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('❌ 응답 구조 이상:', JSON.stringify(data.candidates[0], null, 2));
    throw new Error('응답에서 텍스트를 추출할 수 없습니다.');
  }

  return text;
}

// ── 오늘 작성할 토픽 선택 함수 ──
function selectTopic() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  // 이미 작성된 슬러그 목록 수집
  const existingSlugs = new Set(
    fs.readdirSync(POSTS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
  );

  console.log(`📂 기존 포스트 수: ${existingSlugs.size}개`);
  console.log(`📋 사용 가능한 토픽 풀: ${TOPIC_POOL.length}개`);

  // 아직 작성되지 않은 토픽 찾기
  const availableTopics = TOPIC_POOL.filter(t => !existingSlugs.has(t.slug));

  if (availableTopics.length === 0) {
    console.log('✅ 모든 토픽이 이미 작성되었습니다. 가장 오래된 토픽부터 재작성합니다.');
    // 모두 소진되면 처음부터 다시 순환 (날짜 기반으로 선택)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return TOPIC_POOL[dayOfYear % TOPIC_POOL.length];
  }

  console.log(`📝 남은 토픽 수: ${availableTopics.length}개 → 첫 번째 토픽 선택`);
  return availableTopics[0];
}

// ── 오늘 날짜를 YYYY-MM-DD 형식으로 반환 ──
function getTodayDate() {
  const now = new Date();
  // KST 기준 날짜 계산 (UTC+9)
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  return kstNow.toISOString().split('T')[0];
}

// ── AI 블로그 글 생성 프롬프트 구성 ──
function buildPrompt(topic) {
  const today = getTodayDate();
  
  return `당신은 "보상스쿨"의 현직 신체손해사정사입니다. 10년 이상의 보험금 청구 실무 경험을 보유하고 있으며, 환자와 보험 가입자가 정당한 보험금을 받을 수 있도록 돕는 전문가입니다.

다음 주제로 구글 E-E-A-T(경험·전문성·권위성·신뢰성) 기준을 충족하는 전문 블로그 포스팅을 작성해주세요.

**주제:** ${topic.title}
**핵심 키워드:** ${topic.keywords}
**작성일:** ${today}

---

## 작성 규칙 (반드시 준수)

1. **길이**: 최소 1,500자 이상의 충실한 내용
2. **문체**: "안녕하세요! 보상스쿨 손해사정사입니다."로 시작, 전문적이지만 일반인도 쉽게 이해할 수 있는 친절한 설명체
3. **구조**: 아래 순서로 작성
   - 도입부 (문제 상황 공감 → 이 글의 목적 소개)
   - H2 섹션 1: 해당 질환/상황 기본 설명 (의학적 배경)
   - H2 섹션 2: 보험금 청구 방법 및 핵심 전략 (단계별 설명)
   - H2 섹션 3: 손해사정사의 실전 조언 (보험사 대응 팁)
   - 마무리 (전문가 상담 유도)
4. **형식**: 순수 마크다운만 사용 (HTML 태그, JSX className 절대 사용 금지)
   - 강조: **굵은 글씨**
   - 중요 경고/팁: > 인용구 형식으로 표현
   - 목록: - 또는 숫자 목록
   - 표: 마크다운 표 형식 (비교가 필요한 경우)
5. **SEO**: 핵심 키워드를 자연스럽게 본문에 포함
6. **E-E-A-T 요소**: 실제 사례 언급, 구체적인 수치나 기준, 주의사항 명시
7. **마지막 문단**: "본 가이드는 보상스쿨 손해사정사의 실무 경험과 공개된 의료·보험 데이터를 기반으로 작성되었습니다. 개별 사례에 따라 결과가 다를 수 있으므로, 정확한 상담은 전문가와 진행하시기 바랍니다." 로 마무리

---

**출력 형식**: 마크다운 본문만 출력하세요. 제목(H1)은 제외하고 본문부터 시작하세요. 프론트매터(---)도 포함하지 마세요.`;
}

// ── 메인 실행 함수 ──
async function main() {
  console.log('🤖 보상스쿨 자동글쓰기 로봇을 시작합니다...\n');

  // 1. 오늘의 토픽 선택
  const topic = selectTopic();
  console.log(`\n📌 선택된 토픽: "${topic.title}"`);
  console.log(`   슬러그: ${topic.slug}`);
  console.log(`   카테고리: ${topic.category} / ${topic.specialtyCategory}`);

  // 2. Gemini AI로 본문 생성
  console.log('\n✍️  Gemini AI가 글을 작성 중입니다...');
  const prompt = buildPrompt(topic);
  let content;
  try {
    content = await callGemini(prompt);
    console.log(`✅ 글 생성 완료! (${content.length}자)`);
  } catch (err) {
    console.error('❌ Gemini API 오류:', err.message);
    process.exit(1);
  }

  // 3. 마크다운 파일 생성
  const today = getTodayDate();
  const tagsYaml = topic.tags.map(t => `"${t}"`).join(',');
  
  const markdownContent = `---
title: "${topic.title}"
date: "${today}"
summary: "${content.split('\n').find(l => l.trim() && !l.startsWith('#'))?.slice(0, 150).replace(/"/g, "'") || topic.title}"
category: "${topic.category}"
specialtyCategory: "${topic.specialtyCategory}"
tags: [${tagsYaml}]
published: true
---

${content.trim()}
`;

  const filePath = path.join(POSTS_DIR, `${topic.slug}.md`);
  fs.writeFileSync(filePath, markdownContent, 'utf8');

  console.log(`\n🎉 블로그 포스팅 완료!`);
  console.log(`   파일 경로: ${filePath}`);
  console.log(`   제목: ${topic.title}`);
  console.log(`   날짜: ${today}`);
  console.log('\n   GitHub Actions가 이 파일을 자동으로 커밋하고 배포합니다.');
}

main();
