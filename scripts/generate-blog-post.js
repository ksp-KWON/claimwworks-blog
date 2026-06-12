/**
 * generate-blog-post.js
 * 보상스쿨 블로그 자동글쓰기 스크립트 (Core Agent)
 * - Gemini AI를 활용한 SEO 특화 전문 포스팅 자동 생성
 * - 지수 백오프(Exponential Backoff) 5회 재시도 + 이중 모델 폴백(Fallback) 안전망
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ── 환경변수 로드 (.env.local) ──
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]?.replace(/(^['"]|['"]$)/g, '').trim() ?? '';
  });
}

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// ── Gemini 모델 목록 (앞이 주력, 뒤가 백업) ──
// gemini-2.5-flash: 최신 주력 모델 / gemini-2.0-flash: v1beta 지원 검증된 백업 모델
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

// ── 구글 트렌드 수집 ──
async function fetchGoogleTrends() {
  try {
    const res = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR');
    if (!res.ok) return [];
    return [...(await res.text()).matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]).slice(1, 16);
  } catch {
    return [];
  }
}

// ── 기존 포스트 정보 수집 ──
function getExistingPostsInfo() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const match = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8').match(/title:\s*["']([^"']+)["']/);
      return match ? { slug: f.replace(/\.md$/, ''), title: match[1] } : null;
    })
    .filter(Boolean);
}

// ── Gemini API 호출 (지수 백오프 5회 재시도 + 이중 모델 폴백) ──
async function callGemini(prompt, schema = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error('유효하지 않은 GEMINI_API_KEY. 깃허브 Secrets를 확인하세요.');

  const generationConfig = { temperature: 0.75, maxOutputTokens: 8192 };
  if (schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = schema;
  }

  // 주력 모델 → 백업 모델 순서로 시도
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`  [API] 모델 '${model}' 사용 시도...`);

    // 지수 백오프: 최대 5회 (3초 → 6초 → 12초 → 24초 → 포기)
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          // 404(모델 없음)는 재시도해도 의미 없음 → 즉시 다음 모델로 전환
          if (res.status === 404) {
            throw new Error(`API HTTP 404: 모델 '${model}'을 찾을 수 없습니다.`);
          }
          // 503(과부하), 429(요청 초과), 500번대 서버 에러는 재시도 대상
          if ((res.status === 503 || res.status === 429 || res.status >= 500) && attempt < 5) {
            const waitMs = 3000 * Math.pow(2, attempt - 1); // 3s, 6s, 12s, 24s
            console.warn(`  [API 경고] ${model} - HTTP ${res.status}. ${waitMs / 1000}초 후 재시도... (${attempt}/5)`);
            await new Promise(r => setTimeout(r, waitMs));
            continue;
          }
          throw new Error(`API HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
        if (!text) throw new Error('응답 텍스트가 비어 있습니다.');

        if (schema) {
          try { return JSON.parse(text.trim()); }
          catch (e) { throw new Error(`JSON 파싱 에러: ${e.message} | 원본: ${text.slice(0, 200)}`); }
        }
        return text;

      } catch (err) {
        if (attempt === 5) {
          console.error(`  [API 실패] '${model}' 5회 모두 실패. 백업 모델로 전환합니다.`);
          break; // 백업 모델로 넘어감
        }
        const waitMs = 3000 * Math.pow(2, attempt - 1);
        console.warn(`  [API 오류] ${err.message}. ${waitMs / 1000}초 후 재시도... (${attempt}/5)`);
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
  }

  throw new Error('모든 Gemini 모델이 응답하지 않았습니다. 잠시 후 다시 실행해 주세요.');
}

// ── 프롬프트 헌법(Rules) 설정 ──
function buildPrompt(topic, existingPosts) {
  const postsContext = existingPosts.length > 0
    ? existingPosts.map(p => `- [${p.title}](/blog/${p.slug})`).join('\n')
    : '- (없음)';

  return `# Role
당신은 '보상스쿨' 블로그의 수석 콘텐츠 기획자이자 손해사정 전문 테크니컬 라이터입니다. 당신은 구글 검색엔진 최적화(SEO)의 최상위 가이드라인인 '유용하고 신뢰할 수 있는 사용자 중심 콘텐츠(Helpful Content)' 제작 원칙을 완벽히 이해하고 있습니다.

# Objective
주어진 타겟 키워드를 바탕으로, 구글 E-E-A-T(경험/전문성/권위성/신뢰성) 및 YMYL(재정적/의학적 중대 의사결정) 기준을 완벽하게 만족하는 최소 5,000자 이상(5,000자 ~ 10,000자 적극 권장)의 풍부하고 깊이 있는 초고품질 전문 칼럼을 작성합니다. 글의 분량이 절대 짧아지거나 서술이 단조롭지 않도록 구체적인 사례와 해석을 상세하게 풀어 써야 합니다.

# Input Data
- 타겟 키워드: ${topic.keywords}
- 세부 주제: ${topic.title}에 관심이 있는 현직 실무자 및 일반인

# Strict Rules (블로그 작성 헌법)

## 1. System Safety & Output Format
- 대화형 응답("네, 작성하겠습니다" 등) 금지. 프론트매터(Frontmatter)나 H1 제목('# 제목') 금지.
- 오직 순수 마크다운(Markdown) 문법으로 바로 본문부터 출력.
- 특별 허용 사항: 본문 중간에 보상금 계산기 위젯을 띄울 수 있습니다. 주제가 **맥브라이드 장해평가, 교통사고, 배상책임** 등과 관련된 케이스라면 본문 적절한 곳에 \`<calculator type="auto" />\` 태그를, **실손의료비(실비보험)나 병원비** 관련이라면 \`<calculator type="medical" />\` 태그를 무조건 단 한 번 삽입하세요. (다른 HTML/JSX 태그는 금지)

## 2. 구글 E-E-A-T 및 YMYL 준수 (Helpful Content)
- **독창성 (Originality)**: 단순히 다른 웹페이지나 법률 약관을 짜깁기한 사전적 나열을 엄격히 금지합니다.
- **경험(Experience) 및 전문성(Expertise) 소명**: 실제 손해사정사로서 수년간 분쟁을 해결하며 얻은 주관적인 실무 노하우(예: "보험사 대리인의 현장 실사 요구 시 녹취 및 대처법", "의료자문 동의 요구 방어 꿀팁")와 같은 **독창적이고 실질적인 분석 기법**을 최소 2개 이상 상세히 제시하십시오.
- **YMYL 신뢰성**: 의학적/법률적 팩트(대법원 판례, 근로복지공단 지침, 장해평가 약관 등)는 철저히 정밀하게 검증된 수치와 함께 언급하십시오.

## 3. 친자연적 전문용어 해설 (Readability for People-First)
- 본문에 **'맥브라이드 장해평가', 'AMA 기준', '기왕증 공제(기존 병력 삭감)', '동요도 측정', '휴업손해', '도시일용노임'** 등 고도의 보상/손해사정 전문용어가 최초 등장할 때, 독자가 즉석에서 이해할 수 있도록 반드시 괄호나 한 줄 주석 형태로 **"(뜻: ~)"** 과 같이 일반인 눈높이에 맞춰 친절하게 해설하십시오.

## 4. 구조적 가독성 (Readability & Structure)
- **오프닝 규칙:** 글의 시작은 독자의 억울한 상황에 공감하는 자연스럽고 따뜻한 톤의 2~3문장으로 작성. 그 후 "이번 포스팅에서는 [주제]에 대해 실제 보상 실무 관점에서 안내해 드리겠습니다."로 서론 마무리.
- **Key Points:** 오프닝 직후, 반드시 **[💡 Key Points]** (H2) 섹션을 만들어 3가지 핵심 포인트를 불릿(-)으로 제시.
- **강조 색상 다변화:** 무조건 파란색(기본 \`**\`)만 쓰지 말고, 내용의 경중에 따라 다채롭게 강조하세요.
  - 경고/위험/금지: \`<red>절대 합의하지 마세요</red>\`
  - 주의/참고: \`<orange>향후치료비가 핵심입니다</orange>\`
  - 긍정/해결/안전: \`<green>휴업손해 전액 인정 가능합니다</green>\`
  - 핵심 강조: \`<blue>보상스쿨에 문의하세요</blue>\`
  - 심화 내용: \`<purple>후유장해 진단서 발급</purple>\`
- **단어 간격 규칙:** 본문 내의 모든 소제목(H2, H3 등)과 본문 전체에서 콜론(\`:\`)을 사용할 때는 반드시 앞뒤로 한 칸씩 띄어 쓰세요. (예: \`## 2. 꿀팁 : 향후치료비\`)
- **본문 구조:** 소제목은 \`## (H2)\`와 \`### (H3)\` 계층 엄수. 정보 비교 시 최소 2곳 이상에서 '마크다운 표(Table)' 활용. 이때 표의 헤더 열 개수와 구분선 행 및 데이터 행들의 열(Column) 개수가 반드시 일치해야 합니다. 문단 전환 시 가로 실선(\`---\`) 적절히 배치.
- **전문가 조언:** 주의사항 부분은 인용구(\`> \`) 블록을 활용하여 박스로 강조.

## 5. 톤앤매너 (Tone & Manner)
- LLM 특유의 상투어("결론적으로", "주의를 기울여야 합니다", "궁극적으로" 등) 절대 금지.
- 도입부/주의사항은 따뜻한 공감 톤, 해결책/기준은 단호한 전문가 톤 혼용.
- 문단은 3~4줄로 짧게 끊고 핵심 키워드는 **볼드** 처리. 어미는 '~입니다/합니다' 통일.

## 6. 자동 내부 링크 (Internal Linking)
- 우리 블로그의 기존 글 목록:
${postsContext}
- 본문 작성 중 자연스러운 문맥에서 위 글 중 1~2개를 \`[관련 글 제목](/blog/슬러그)\` 형태로 삽입.

## 7. 자가진단 (Self-Check)
- 본문 중간 핵심 내용이 끝나는 지점에 **[🛡️ 내 보험금/보상금 1분 자가진단 체크리스트]** (H2) 추가.
- 독자가 상황을 판단할 수 있는 체크박스(☑️) 형태의 질문 3~5개 작성.

## 8. 자주 묻는 질문 (FAQ)
- 글의 맨 마지막에 **[💡 자주 묻는 질문 (FAQ) TOP 3]** (H2) 추가. 핵심 질문 3가지(H3)와 명확한 팩트 기반 답변 작성.

## 9. 마크다운 표(Table) 작성 규격
- 정보 비교를 위해 표를 작성할 때, 헤더 행의 열 개수와 구분선 행 및 내용 데이터 행의 열(Column) 개수가 반드시 일치하도록 하십시오. 파이프(|) 구분자를 올바르게 배치하여 렌더링이 깨지지 않게 하십시오. (예: 2열짜리 표라면 모든 행이 2개의 열을 갖추어야 함)

## 10. 외부 링크 삽입 제한 (중복 방지)
- 글 본문 내부에는 카카오톡 링크(https://open.kakao.com/...)나 기타 외부 상담 신청서 링크를 마크다운 텍스트 형태로 중복 삽입하지 마십시오. (사이트 하단에 상담 배너가 항상 상시 노출됩니다.)

위 규칙을 엄격히 준수하여 본문을 작성해 주세요.`;
}

// ── 실행 ──
async function main() {
  console.log(`=== 자동글쓰기 시작 (${new Date().toISOString()}) ===`);
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  // Step 1. 토픽 기획
  const existingPosts = getExistingPostsInfo();
  const trends = await fetchGoogleTrends();
  const trendContext = trends.length > 0
    ? `오늘 구글 트렌드: ${trends.join(', ')}\n(관련 있다면 타겟팅, 억지스럽다면 독자적인 고품질 키워드 생성)`
    : '(트렌드 생략)';

  const topicPrompt = `현재 슬러그: [${existingPosts.map(p => p.slug).join(', ')}]
${trendContext}
이 목록과 중복되지 않으면서 검색량이 폭발할 '손해사정/의료/보상' 관련 타겟 키워드 1개를 선정해 주세요.`;

  const topicSchema = {
    type: 'OBJECT',
    properties: {
      slug: { type: 'STRING', description: 'URL 경로명. 하이픈(-) 구분 영문 소문자 (예: car-accident-settlement)' },
      title: { type: 'STRING', description: 'SEO 최적화된 포스팅 제목' },
      category: { type: 'STRING', description: '블로그 카테고리 (예: 교통사고, 배상책임, 후유장해, 실손의료비, 보험상식)' },
      specialtyCategory: { type: 'STRING', description: '전문 진료과목 (예: 정형외과, 신경외과, 재활의학과)' },
      tags: { type: 'ARRAY', items: { type: 'STRING' }, description: '관련 태그 5개' },
      keywords: { type: 'STRING', description: '타겟 핵심 키워드 목록 (쉼표 구분)' },
    },
    required: ['slug', 'title', 'category', 'specialtyCategory', 'tags', 'keywords'],
  };

  const topic = await callGemini(topicPrompt, topicSchema);
  console.log(`[1] 토픽 기획 완료: ${topic.title} (${topic.slug})`);

  // API 연속 호출 간 429 할당량 초과 방지 - 30초 쿨다운
  console.log('  [대기] API 요청 간격 조절 중... (30초)');
  await new Promise(r => setTimeout(r, 30000));

  // Step 2. 본문 작성 (순수 텍스트/마크다운 모드 - JSON 스키마 없이 전체 길이 보장)
  const content = await callGemini(buildPrompt(topic, existingPosts));
  console.log(`[2] 본문 생성 완료 (${content.length}자)`);

  // API 연속 호출 간 429 할당량 초과 방지 - 30초 쿨다운
  console.log('  [대기] API 요청 간격 조절 중... (30초)');
  await new Promise(r => setTimeout(r, 30000));

  // Step 3. SEO 요약문 생성 (JSON 스키마 강제)
  console.log('[3] SEO 요약문 추출 중...');
  const summarySchema = {
    type: 'OBJECT',
    properties: {
      seoSummary: { type: 'STRING', description: '구글 검색 노출용 150자 이내 매력적인 한글 요약문' },
    },
    required: ['seoSummary'],
  };
  const { seoSummary } = await callGemini(
    `다음 블로그 포스팅 본문을 읽고, 구글 검색 결과에 노출될 150자 이내의 매력적인 클릭 유도용 한글 요약문(SEO 메타 디스크립션)을 작성해 주세요.\n\n포스팅 본문:\n${content}`,
    summarySchema
  );
  const summary = seoSummary.replace(/"/g, "'").trim();
  console.log(`[3] SEO 요약문 완료: ${summary}`);

  // Step 4. 마크다운 파일 저장
  const kstDate = new Date(Date.now() + 9 * 3600 * 1000).toISOString().split('T')[0];
  const tagsStr = topic.tags.map(t => `"${t}"`).join(',');

  const md = `---
title: "${topic.title}"
date: "${kstDate}"
summary: "${summary}"
category: "${topic.category}"
specialtyCategory: "${topic.specialtyCategory}"
tags: [${tagsStr}]
published: true
---

${content.trim()}
`;

  const filePath = path.join(POSTS_DIR, `${topic.slug}.md`);
  fs.writeFileSync(filePath, md, 'utf8');
  console.log(`[4] 저장 완료: ${filePath}\n=== 자동글쓰기 종료 ===`);
}

main().catch(err => {
  console.error(`치명적 오류: ${err.message}`);
  process.exit(1);
});
