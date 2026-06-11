/**
 * generate-blog-post.js
 * 보상스쿨 블로그 자동글쓰기 스크립트 (Core Agent)
 * - Gemini AI를 활용한 SEO 특화 전문 포스팅 자동 생성
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ── 환경변수 로드 ──
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/(^['"]|['"]$)/g, '').trim();
  });
}

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

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

// ── 기존 포스트 정보 ──
function getExistingPostsInfo() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => {
    const match = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8').match(/title:\s*["']([^"']+)["']/);
    return match ? { slug: f.replace(/\.md$/, ''), title: match[1] } : null;
  }).filter(Boolean);
}

// ── Gemini API 호출 코어 ──
async function callGemini(prompt, schema = null, retries = 3, delayMs = 2000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error('유효하지 않은 GEMINI_API_KEY');

  // v1beta API 사용 (Structured Outputs 지원)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const generationConfig = { 
    temperature: 0.75, 
    maxOutputTokens: 8192 
  };

  if (schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = schema;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
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
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          if (attempt < retries) {
            console.warn(`[API 경고] 호출 실패 (${res.status}). ${delayMs}ms 후 재시도합니다... (시도 ${attempt}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        }
        throw new Error(`API HTTP ${res.status}: ${await res.text()}`);
      }
      
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map(p => p.text || '').join('');
      if (!text) throw new Error('응답 텍스트 파싱 실패');

      if (schema) {
        try {
          return JSON.parse(text.trim());
        } catch (e) {
          throw new Error(`JSON 파싱 에러: ${text} | 상세: ${e.message}`);
        }
      }
      return text;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.warn(`[API 오류] ${err.message}. ${delayMs}ms 후 재시도합니다... (시도 ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// ── 프롬프트 헌법(Rules) 설정 ──
function buildPrompt(topic, existingPosts) {
  const postsContext = existingPosts.length > 0 
    ? existingPosts.map(p => `- [${p.title}](/blog/${p.slug})`).join('\n')
    : "- (없음)";

  return `# Role
당신은 '보상스쿨' 블로그의 수석 콘텐츠 기획자이자 손해사정 전문 테크니컬 라이터입니다.

# Objective
주어진 타겟 키워드를 바탕으로, 구글 E-E-A-T(경험/전문성/권위성/신뢰성) 기준을 충족하는 최소 2,500자 이상의 전문 칼럼을 작성합니다.

# Input Data
- 타겟 키워드: ${topic.keywords}
- 세부 주제: ${topic.title}에 관심이 있는 현직 실무자 및 일반인

# Strict Rules (블로그 작성 헌법)

## 1. System Safety & Output Format
- 대화형 응답("네, 작성하겠습니다" 등) 금지. 프론트매터(Frontmatter)나 H1 제목('# 제목') 금지. 
- 오직 순수 마크다운(Markdown) 문법으로 바로 본문부터 출력.
- 특별 허용 사항: 본문 중간에 보상금 계산기 위젯을 띄울 수 있습니다. 주제가 **맥브라이드 장해평가, 교통사고, 배상책임** 등과 관련된 케이스라면 본문 적절한 곳에 \`<calculator type="auto" />\` 태그를, **실손의료비(실비보험)나 병원비** 관련이라면 \`<calculator type="medical" />\` 태그를 무조건 단 한 번 삽입하세요. (다른 HTML/JSX 태그는 금지)

## 2. 전문성 및 경험 (Anti-Plagiarism)
- 원론적이고 사전적인 정의 지양. 
- 구체적인 사례, 통계적 수치(가상의 논리적 추정치 포함), 최신 트렌드, 현업 손해사정사로서의 실무적인 애로사항과 해결 노하우를 최소 1개 이상 반드시 포함할 것.

## 3. 구조적 가독성 (Readability & Structure)
- **오프닝 규칙:** 글의 시작은 독자의 억울한 상황에 공감하는 자연스럽고 따뜻한 톤의 2~3문장으로 작성 ("안녕하세요 보상스쿨 손해사정사입니다" 같은 형식적인 인사말은 필수가 아니며 문맥에 맞게 선택적으로 사용). 그 후 "이번 포스팅에서는 [주제]에 대해 실제 보상 실무 관점에서 안내해 드리겠습니다."로 서론 마무리.
- **Key Points:** 오프닝 직후, 반드시 **[💡 Key Points]** (H2) 섹션을 만들어 3가지 핵심 포인트를 불릿(-)으로 제시.
- **강조 색상 다변화:** 무조건 파란색(기본 \`**\`)만 쓰지 말고, 내용의 경중에 따라 다채롭게 강조하세요.
  - 경고/위험/금지: \`<red>절대 합의하지 마세요</red>\`
  - 주의/참고: \`<orange>향후치료비가 핵심입니다</orange>\`
  - 긍정/해결/안전: \`<green>휴업손해 전액 인정 가능합니다</green>\`
  - 핵심 강조: \`<blue>보상스쿨에 문의하세요</blue>\`
  - 심화 내용: \`<purple>후유장해 진단서 발급</purple>\`
- **단어 간격 규칙:** 제목(title)은 물론, **본문 내의 모든 소제목(H2, H3 등)과 본문 내용 전체에서** 콜론(\`:\`)을 사용할 때는 가독성을 위해 예외 없이 반드시 앞뒤로 한 칸씩 띄어 쓰세요. (예: \`## 2. 꿀팁 : 향후치료비\`, \`위자료 : 부상 급수\`)
- **본문 구조:** 소제목은 \`## (H2)\`와 \`### (H3)\` 계층 엄수. 정보 비교 시 최소 2곳 이상에서 '마크다운 표(Table)' 활용. 문단 전환 시 가로 실선(\`---\`) 적절히 배치.
- **전문가 조언:** 주의사항 부분은 인용구(\`> \`) 블록을 활용하여 박스로 강조.

## 4. 톤앤매너 (Tone & Manner)
- LLM 특유의 상투어("결론적으로", "주의를 기울여야 합니다" 등) 절대 금지.
- 도입부/주의사항은 따뜻한 공감 톤, 해결책/기준은 단호한 전문가 톤 혼용.
- 문단은 3~4줄로 짧게 끊고 핵심 키워드는 **볼드** 처리. 어미는 '~입니다/합니다' 통일.

## 5. 자동 내부 링크 (Internal Linking)
- 우리 블로그의 기존 글 목록:
${postsContext}
- 본문 작성 중 자연스러운 문맥에서 위 글 중 1~2개를 \`[관련 글 제목](/blog/슬러그)\` 형태로 삽입.

## 6. 자가진단 (Self-Check)
- 본문 중간 핵심 내용이 끝나는 지점에 **[🛡️ 내 보험금/보상금 1분 자가진단 체크리스트]** (H2) 추가.
- 독자가 상황을 판단할 수 있는 체크박스(☑️) 형태의 질문 3~5개 작성.

## 7. 자주 묻는 질문 (FAQ)
- 글의 맨 마지막에 **[💡 자주 묻는 질문 (FAQ) TOP 3]** (H2) 추가. 핵심 질문 3가지(H3)와 명확한 팩트 기반 답변 작성.

## 8. Call To Action (무료 상담 유도)
- FAQ 직후, 독자의 불안한 심리를 찌르는 강력한 무료 상담 유도 카피 작성 ("혼자 고민하다 수백만 원 손해 보지 마시고...").
- 하단에 마크다운 링크 \`[👉 카카오톡 1:1 무료 상담하기 (클릭)](https://open.kakao.com/o/sWeszp7)\` 버튼 삽입.

위 규칙을 엄격히 준수하여 본문을 작성해 주세요.`;
}

// ── 실행 ──
async function main() {
  console.log(`=== 자동글쓰기 시작 (${new Date().toISOString()}) ===`);

  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  // 1. 토픽 기획
  const existingPosts = getExistingPostsInfo();
  const trends = await fetchGoogleTrends();
  const trendContext = trends.length > 0 
    ? `오늘 구글 트렌드: ${trends.join(', ')}\n(관련이 있다면 트래픽 탈취를 위해 타겟팅하고, 억지스럽다면 독자적인 고품질 타겟 키워드 생성)`
    : '(트렌드 생략)';

  const topicPrompt = `현재 슬러그: [${existingPosts.map(p => p.slug).join(', ')}]
${trendContext}
이 목록과 중복되지 않으면서 검색량이 폭발할 '손해사정/의료/보상' 관련 타겟 키워드 1개를 선정해 주세요.`;

  // 토픽 정보 설계를 위한 스키마
  const topicSchema = {
    type: "OBJECT",
    properties: {
      slug: { 
        type: "STRING", 
        description: "URL 경로명으로 사용할 하이픈(-) 구분 영문 소문자 문자열 (예: car-accident-settlement-calculation)"
      },
      title: { 
        type: "STRING", 
        description: "구글 검색엔진 최적화(SEO) 및 E-E-A-T 기준에 부합하는 가독성이 높은 포스팅 제목" 
      },
      category: { 
        type: "STRING", 
        description: "블로그 카테고리 중 반드시 택1 (예: 교통사고, 배상책임, 후유장해, 실손의료비, 보험상식 등)"
      },
      specialtyCategory: { 
        type: "STRING", 
        description: "전문 진료과목 분류 (예: 정형외과, 신경외과, 재활의학과 등)" 
      },
      tags: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "블로그 키워드와 관련된 태그 목록 (5개)"
      },
      keywords: { 
        type: "STRING", 
        description: "포스팅의 검색 노출 대상이 되는 타겟 핵심 키워드 목록 (쉼표로 구분)" 
      }
    },
    required: ["slug", "title", "category", "specialtyCategory", "tags", "keywords"]
  };

  const topic = await callGemini(topicPrompt, topicSchema);
  console.log(`[1] 토픽 기획 완료: ${topic.title} (${topic.slug})`);

  // 2. 본문 작성
  // 본문 작성을 위한 스키마
  const postSchema = {
    type: "OBJECT",
    properties: {
      content: {
        type: "STRING",
        description: "마크다운(Markdown) 포맷으로 작성된 블로그 본문 전체 (최소 2,500자 이상). 프롬프트 헌법 규칙을 빈틈없이 완벽하게 준수해야 합니다."
      },
      seoSummary: {
        type: "STRING",
        description: "구글 검색엔진 노출을 유도하기 위해 150자 이내로 간결하고 매력적으로 쓰인 글 요약 (SEO 메타 디스크립션)"
      }
    },
    required: ["content", "seoSummary"]
  };

  const postResult = await callGemini(buildPrompt(topic, existingPosts), postSchema);
  console.log(`[2] 본문 및 요약문 생성 완료 (본문: ${postResult.content.length}자, 요약: ${postResult.seoSummary.length}자)`);

  // 3. 파일 저장 전처리
  const summary = postResult.seoSummary.replace(/"/g, "'").trim();
  const finalContent = postResult.content.trim();

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

${finalContent}
`;

  const filePath = path.join(POSTS_DIR, `${topic.slug}.md`);
  fs.writeFileSync(filePath, md, 'utf8');
  console.log(`[3] 저장 완료: ${filePath}\n=== 자동글쓰기 종료 ===`);
}

main().catch(err => {
  console.error(`치명적 오류: ${err.message}`);
  process.exit(1);
});
