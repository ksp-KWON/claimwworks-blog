/**
 * generate-blog-post.js
 * 보상스쿨 블로그 자동글쓰기 스크립트 (Core Agent v3)
 *
 * ✅ 토큰 최적화 전략:
 *   - API 호출 3회 → 2회로 단축 (SEO 요약문을 본문 첫 줄에서 파싱)
 *   - 입력 프롬프트 슬림화 (규칙 핵심만 유지, 장황한 설명 제거)
 *   - 출력 토큰 한도 65536 명시 (gemini-2.5-flash 최대 품질 활용)
 *
 * ✅ 안정성 전략:
 *   - 429 : 65초 대기 (분당 쿼터 리셋 대기)
 *   - 503 : 5→10→20→40초 지수 백오프
 *   - 404 : 즉시 다음 모델로 폴백
 *   - 주력: gemini-2.5-flash / 백업: gemini-2.0-flash
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

// ── Gemini 모델 (주력 → 백업 순) ──
// gemini-2.5-flash : 최신 최고 품질, 무료 티어 지원
// gemini-2.0-flash : v1beta 검증된 안전한 백업
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

// ── 구글 트렌드 수집 ──
async function fetchGoogleTrends() {
  try {
    const res = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR');
    if (!res.ok) return [];
    return [...(await res.text()).matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]).slice(1, 16);
  } catch { return []; }
}

// ── 기존 포스트 목록 ──
function getExistingPostsInfo() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const m = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8').match(/title:\s*["']([^"']+)["']/);
      return m ? { slug: f.replace(/\.md$/, ''), title: m[1] } : null;
    })
    .filter(Boolean);
}

// ── Gemini API 호출 (429 전용 65초 대기 / 503 지수백오프 / 404 즉시 폴백) ──
async function callGemini(prompt, schema = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) throw new Error('유효하지 않은 GEMINI_API_KEY');

  // 출력 토큰 한도: 65536(최대품질) / JSON 모드는 4096으로 충분
  const generationConfig = {
    temperature: 0.75,
    maxOutputTokens: schema ? 4096 : 65536,
  };
  if (schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = schema;
  }

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`  [API] 모델 '${model}' 호출 중...`);
    let modelSkip = false;

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
        });

        if (!res.ok) {
          const errText = await res.text();

          if (res.status === 404) {
            // 모델 자체 없음 → 재시도 없이 바로 다음 모델
            console.error(`  [폴백] '${model}' 404. 백업 모델로 전환합니다.`);
            modelSkip = true; break;
          }
          if (res.status === 429 && attempt < 5) {
            // 분당 한도 초과 → 쿼터 리셋까지 65초 대기
            console.warn(`  [429] ${model} 분당 한도 초과. 65초 대기... (${attempt}/5)`);
            await new Promise(r => setTimeout(r, 65000));
            continue;
          }
          if ((res.status === 503 || res.status >= 500) && attempt < 5) {
            // 서버 과부하 → 지수 백오프
            const w = 5000 * Math.pow(2, attempt - 1);
            console.warn(`  [${res.status}] ${model} 서버 오류. ${w / 1000}초 후 재시도... (${attempt}/5)`);
            await new Promise(r => setTimeout(r, w));
            continue;
          }
          throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
        }

        const data = await res.json();
        const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
        if (!text) throw new Error('응답 텍스트 비어있음');

        if (schema) {
          try { return JSON.parse(text.trim()); }
          catch (e) { throw new Error(`JSON 파싱 실패: ${e.message}`); }
        }
        return text;

      } catch (err) {
        if (modelSkip) break;
        if (attempt === 5) {
          console.error(`  [실패] '${model}' 5회 모두 실패. 다음 모델 시도.`);
          break;
        }
        const w = 5000 * Math.pow(2, attempt - 1);
        console.warn(`  [오류] ${err.message.slice(0, 80)}. ${w / 1000}초 후 재시도... (${attempt}/5)`);
        await new Promise(r => setTimeout(r, w));
      }
    }
    if (modelSkip) continue;
  }

  throw new Error('모든 모델이 응답하지 않았습니다. 잠시 후 다시 실행해 주세요.');
}

// ── 프롬프트 헌법 (슬림화 버전 - 핵심 규칙만, 장황한 설명 제거) ──
function buildPrompt(topic, existingPosts) {
  const postsCtx = existingPosts.length > 0
    ? existingPosts.map(p => `- [${p.title}](/blog/${p.slug})`).join('\n')
    : '- (없음)';

  return `# 역할
'보상스쿨' 블로그 수석 콘텐츠 기획자 겸 손해사정 전문 테크니컬 라이터.

# 출력 형식 (필수)
응답의 **첫 줄**에 반드시 다음 형식으로 SEO 요약문을 작성하고 그 다음 줄에 본문을 시작하십시오:
\`\`\`
SEO_META:[구글 검색 노출용 150자 이내 매력적인 한글 요약문]
\`\`\`
그 후 곧바로 마크다운 본문을 작성하십시오.

# 금지 사항
- 대화형 응답("네, 작성하겠습니다" 등) 금지
- 프론트매터(---) 또는 H1 제목(# 제목) 금지
- 카카오톡 외부 상담 링크 삽입 금지
- 상투어("결론적으로", "궁극적으로" 등) 금지

# 작성 목표
타겟 키워드 [${topic.keywords}]를 기반으로, 구글 E-E-A-T(경험·전문성·권위성·신뢰성) 및 YMYL 기준을 충족하는 **5,000자~10,000자** 분량의 초고품질 전문 칼럼 작성.

# 필수 구조 (순서 준수)
1. **오프닝** : 독자 상황 공감 2~3문장 → "이번 포스팅에서는 [주제]에 대해 실무 관점에서 안내해 드리겠습니다." 로 마무리
2. **[💡 Key Points]** (H2) : 핵심 포인트 3가지 불릿
3. **본문 섹션들** (H2/H3 계층 엄수) : 실무 노하우 최소 2개 이상 포함
4. **[🛡️ 내 보험금 1분 자가진단 체크리스트]** (H2) : 체크박스(☑️) 3~5개
5. **[💡 자주 묻는 질문 (FAQ) TOP 3]** (H2) : Q3개(H3) + 팩트 기반 답변

# 콘텐츠 규칙
- **E-E-A-T** : 손해사정사 실무 경험에서 나온 독창적 노하우 2개 이상 (실사 녹취법, 의료자문 방어법 등)
- **YMYL** : 대법원 판례, 근로복지공단 지침 등 검증된 수치와 함께 언급
- **전문용어** : 최초 등장 시 괄호로 일반인 해설 (예: 맥브라이드 장해평가(뜻: ~))
- **강조 색상** : \`<red>경고</red>\` \`<orange>주의</orange>\` \`<green>긍정</green>\` \`<blue>핵심</blue>\` \`<purple>심화</purple>\`
- **표(Table)** : 최소 2곳 이상 사용. 헤더·구분선·데이터 행의 열 개수 반드시 일치
- **인용구** : 주의사항은 \`> \` 블록으로 강조
- **콜론** : 소제목·본문 모두 앞뒤 한 칸 띄움 (예: \`## 3. 꿀팁 : 청구 방법\`)
- **계산기 위젯** : 교통사고·맥브라이드·배상책임 관련이면 \`<calculator type="auto" />\` 를, 실비·병원비 관련이면 \`<calculator type="medical" />\` 를 본문 적절한 위치에 단 한 번 삽입
- **내부 링크** : 아래 기존 글 중 문맥에 맞는 1~2개를 자연스럽게 삽입
${postsCtx}

위 모든 규칙을 엄격히 준수하여 작성하십시오.`;
}

// ── 메인 실행 ──
async function main() {
  console.log(`=== 자동글쓰기 시작 (${new Date().toISOString()}) ===`);
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  // ── Step 1. 토픽 기획 ──
  const existingPosts = getExistingPostsInfo();
  const trends = await fetchGoogleTrends();
  const trendCtx = trends.length > 0
    ? `오늘 구글 트렌드: ${trends.join(', ')}\n(관련 있으면 타겟팅, 억지스러우면 독자 키워드 생성)`
    : '(트렌드 생략)';

  const topicPrompt = `기존 슬러그: [${existingPosts.map(p => p.slug).join(', ')}]
${trendCtx}
중복 없이 검색량 높은 '손해사정/의료/보상' 타겟 키워드 1개 선정.`;

  const topicSchema = {
    type: 'OBJECT',
    properties: {
      slug:             { type: 'STRING', description: '하이픈 구분 영문 소문자 URL 슬러그' },
      title:            { type: 'STRING', description: 'SEO 최적화 포스팅 제목' },
      category:         { type: 'STRING', description: '교통사고|배상책임|후유장해|실손의료비|보험상식 중 택1' },
      specialtyCategory:{ type: 'STRING', description: '전문 진료과목 (예: 정형외과)' },
      tags:             { type: 'ARRAY', items: { type: 'STRING' }, description: '관련 태그 5개' },
      keywords:         { type: 'STRING', description: '타겟 키워드 목록 (쉼표 구분)' },
    },
    required: ['slug', 'title', 'category', 'specialtyCategory', 'tags', 'keywords'],
  };

  const topic = await callGemini(topicPrompt, topicSchema);
  console.log(`[1] 토픽 확정 : ${topic.title} (${topic.slug})`);

  // 연속 호출 429 방지 - 30초 쿨다운
  console.log('  [대기] 30초 쿨다운...');
  await new Promise(r => setTimeout(r, 30000));

  // ── Step 2. 본문 + SEO 요약문 동시 생성 (1회 호출로 처리) ──
  // → SEO 요약문을 첫 줄에 포함시켜 별도 3차 API 호출 완전 제거
  const rawOutput = await callGemini(buildPrompt(topic, existingPosts));

  // SEO_META 첫 줄 파싱
  const lines = rawOutput.split('\n');
  let summary = '';
  let contentStartIdx = 0;

  if (lines[0].startsWith('SEO_META:')) {
    summary = lines[0].replace('SEO_META:', '').replace(/"/g, "'").trim();
    contentStartIdx = 1;
    // 빈 줄 스킵
    while (contentStartIdx < lines.length && lines[contentStartIdx].trim() === '') contentStartIdx++;
  }

  const content = lines.slice(contentStartIdx).join('\n').trim();

  // SEO 요약문 파싱 실패 시 자동 생성 (앞 140자 추출)
  if (!summary) {
    const plainText = content.replace(/[#*`>\[\]]/g, '').replace(/\s+/g, ' ').trim();
    summary = plainText.slice(0, 140);
    console.warn('  [경고] SEO_META 파싱 실패. 본문 앞부분으로 대체합니다.');
  }

  console.log(`[2] 본문 생성 완료 (${content.length}자) | SEO: ${summary.slice(0, 30)}...`);

  // ── Step 3. 마크다운 파일 저장 ──
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

${content}
`;

  const filePath = path.join(POSTS_DIR, `${topic.slug}.md`);
  fs.writeFileSync(filePath, md, 'utf8');
  console.log(`[3] 저장 완료: ${filePath}\n=== 자동글쓰기 종료 ===`);
}

main().catch(err => {
  console.error(`치명적 오류: ${err.message}`);
  process.exit(1);
});
