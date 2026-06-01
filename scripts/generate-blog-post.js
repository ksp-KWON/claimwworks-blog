const fs = require('fs');
const path = require('path');

// .env.local 파일에서 환경변수를 수동으로 읽어오는 함수
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const firstEquals = trimmed.indexOf('=');
      if (firstEquals !== -1) {
        const key = trimmed.slice(0, firstEquals).trim();
        let val = trimmed.slice(firstEquals + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/medical-info.json');
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

function ensureDirectoriesAndFiles() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  if (!fs.existsSync(DATA_FILE_PATH)) {
    const sampleHospitals = [
      { id: "hosp-001", name: "강남바른척추정형외과의원", region: "서울 강남구", specialty: "정형외과", address: "서울특별시 강남구 테헤란로 123", treated: false },
      { id: "hosp-002", name: "부산튼튼신경외과의원", region: "부산 해운대구", specialty: "신경외과", address: "부산광역시 해운대구 해운대로 456", treated: false },
      { id: "hosp-003", name: "대구탑연합정형외과", region: "대구 중구", specialty: "정형외과", address: "대구광역시 중구 달구벌대로 789", treated: false }
    ];
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(sampleHospitals, null, 2), 'utf8');
    console.log('💡 public/data/medical-info.json 파일이 없어서 샘플 데이터를 생성했습니다.');
  }
}

async function generatePost() {
  ensureDirectoriesAndFiles();

  const apiKey = process.env.GEMINI_API_KEY;
  let isTestMode = false;

  if (!apiKey || apiKey === '여기에_입력') {
    console.log('⚠️ [테스트 모드] API Key가 없어서 규칙을 완벽 준수한 테스트 글을 자동 생성합니다.');
    isTestMode = true;
  }

  const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
  let hospitals = [];
  try {
    hospitals = JSON.parse(rawData);
  } catch (e) {
    console.error('❌ 병원 데이터 JSON 파싱 에러:', e);
    process.exit(1);
  }

  const targetHospital = hospitals.find(h => h.treated === false || !h.treated);

  if (!targetHospital) {
    console.log('🎉 모든 병원의 블로그 글 작성이 완료되었습니다! (새로운 데이터를 추가해 주세요)');
    return;
  }

  console.log(`✍️ [${targetHospital.name}] 정보를 기반으로 블로그 글 작성을 시작합니다...`);

  const regionCategory = (targetHospital.region || '').replace(/ /g, '');
  const specialtyCategory = targetHospital.specialty || '';

  // ─────────────────────────────────────────────────────────────
  // [2단계] Gemini AI 프롬프트 생성
  // ─────────────────────────────────────────────────────────────
  const prompt = `너는 척추/관절 및 교통사고 보상을 전문으로 하는 10년 차 수석 독립손해사정사야.
아래 병원 데이터를 바탕으로, 교통사고 피해자나 상해 환자들을 위한 '구글 애드센스 승인용 고품질 정보성 가이드 글'을 작성해 줘.

[병원 데이터]
- 병원 이름: ${targetHospital.name}
- 지역: ${targetHospital.region}
- 전문 과목: ${targetHospital.specialty}
- 주소: ${targetHospital.address}

[필수 작성 규칙 - 이것을 어기면 절대 안 됨]
1. 분량: 공백 제외 반드시 2,000자 ~ 2,500자 이상으로 매우 상세하게 작성할 것.
2. 계층 구조(H태그): 마크다운 문법인 '##' (중제목), '###' (소제목)을 사용하여 논리적인 목차 구조를 갖출 것.
3. 시각적 요소: 본문 중간에 마크다운 표(Table)를 최소 1개 이상 반드시 포함. 숫자 리스트(1. 2. 3.)와 글머리 기호(-)도 적극 활용.
4. 전문성과 독창성: 실제 보상 실무(자동차보험 지불보증 절차, 후유장해 진단서 발급 꿀팁, 합의 요령)를 환자 눈높이에서 전문가적 통찰을 담아 상세히 풀어낼 것.
5. 문체: 환자에게 신뢰감을 주는 "~습니다", "~합니다" 체 사용.

6. [중요] YAML 프론트매터 Title 따옴표 필수:
   - title 값은 반드시 큰따옴표로 감쌀 것. (예: title: "인천 병원 : 합의금 꿀팁")

7. [중요] 볼드체(**) 마크다운 오류 방지 규칙 - 반드시 준수:
   - 볼드체 열고 닫는 별표(**) 안에는 절대로 앞뒤 공백을 넣지 말 것.
   - 올바른 예: **척추압박골절(Compression Fracture)** 또는 **척추 질환 전문성:**
   - 잘못된 예: ** 척추압박골절 ** 또는 **척추 질환 전문성 : **
   - 한영 복합 볼드체도 동일: **척추압박골절(Compression Fracture)** (열고 닫는 ** 안에 공백 없이)

8. 본문 내 섹션 구분선(---) 삽입: 각 ## 중제목 섹션 사이에 반드시 마크다운 수평 구분선(---)을 넣어 가독성 향상.

9. [신규] 텍스트 색상 강조 규칙:
   볼드체 외에, 내용의 성격이나 톤에 맞게 아래 HTML 태그를 활용해 색상 강조를 할 것.
   형식: <span style="color:#색상코드">텍스트</span>

   색상 사용 기준:
   - 파랑 #3182CE : 필수 정보, 안내 사항, 핵심 절차 (예: 지불보증 신청 방법, 핵심 팁)
   - 빨강 #E53E3E : 경고, 주의 사항, 절대 하지 말아야 할 것 (예: 조기 합의 위험, 서명 금지)
   - 주황 #D97706 : 중요 사항, 반드시 확인해야 할 내용 (예: 합의금 팁, 주의해야 할 상황)
   - 초록 #38A169 : 긍정적 정보, 수령 가능 보험금, 성공 사례 (예: 추가 보상 항목, 성공 사례)
   - 보라 #805AD5 : 의학 전문 용어, 법률 용어, 후유장해 병명 (예: 압박골절률, 노동능력상실률)

   색상은 글 전체에서 각 색상당 2~3개씩 자연스럽게 활용하여 고급스럽고 일관된 디자인 유지.

[내용 구조]
- 도입부: 환자의 아픔에 공감하며 병원 소개 (${targetHospital.name})
- 본문 1: 해당 병원의 주요 진료 과목 및 특징
- 본문 2: (전문성) 교통사고 및 상해 발생 시 치료비 지불보증 등 초기 대응 매뉴얼
- 본문 3: (전문성) 척추/관절 상해 시 숨은 보상금 찾기 및 합의 꿀팁
- 결론 및 면책 조항: 요약 정리 및 '※ 본 포스팅은 공공데이터를 기반으로 한 일반적인 정보 제공 목적이며, 의학적 진단이나 법률적/보상적 확정 결과를 보장하지 않습니다. 개별 사건의 정확한 손해액 산정은 반드시 전문가와 상담하시기 바랍니다.' 문구 삽입.

아래 형식으로만 출력해줘 (마크다운 코드 블록으로 감싸지 말고 날것 그대로):
---
title: "(지역명+병원명과 합의금/지불보증 키워드를 섞은 제목)"
date: ${new Date().toISOString().split('T')[0]}
summary: "전체 글을 깔끔하게 정리 한 줄 요약"
category: 병원보상가이드
regionCategory: ${regionCategory}
specialtyCategory: ${specialtyCategory}
tags: [교통사고합의금, 지불보증, ${targetHospital.region.split(' ').join('')}, ${targetHospital.specialty}, 후유장해]
---
(여기에 지침에 따른 본문 내용 작성)

FILENAME: YYYY-MM-DD-영문키워드
`;

  try {
    let textOutput = '';

    if (isTestMode) {
      // ─── 테스트 모드: 규칙 완벽 준수 + 색상 강조 예시 포스팅 ───
      textOutput = `---
title: "${targetHospital.region} ${targetHospital.name} 방문 전 꼭 알아야 할 교통사고 합의금 많이 받는 요령과 지불보증 절차"
date: ${new Date().toISOString().split('T')[0]}
summary: "${targetHospital.region}에 위치한 ${targetHospital.name}의 진료 정보와 함께 교통사고 발생 시 지불보증 신청 절차 및 후유장해 보험금 찾는 핵심 노하우를 정리해 드립니다."
category: 병원보상가이드
regionCategory: ${regionCategory}
specialtyCategory: ${specialtyCategory}
tags: [교통사고합의금, 지불보증, ${targetHospital.region.split(' ').join('')}, ${targetHospital.specialty}, 후유장해]
---
안녕하십니까. 척추, 관절 및 교통사고 보상을 전문으로 하며 환자의 아픔과 보상의 억울함을 꼼꼼히 해결해 드리는 10년 차 수석 독립손해사정사입니다.

갑작스러운 교통사고나 상해로 인해 일상생활이 무너지고 극심한 통증에 시달릴 때, 환자분들은 육체적 고통뿐만 아니라 "치료비는 어떻게 해결해야 하는가?", "보험사와의 합의금 산정은 제대로 이루어지고 있는가?"에 대한 정신적 불안감까지 떠안게 됩니다.

오늘 칼럼에서는 ${targetHospital.region}에 위치하여 환자들의 아픈 곳을 전문적으로 돌보고 있는 **${targetHospital.name}**을 중심으로, 교통사고 발생 초기 대처 방법부터 시작해 숨겨진 보상금인 후유장해 보험금을 온전히 수령하는 실무 팁까지 상세히 풀어드리겠습니다.

---

## 1. ${targetHospital.name}의 진료 과목 및 의료 환경 분석

${targetHospital.region}의 믿을 수 있는 의료기관인 **${targetHospital.name}**은 주로 **${targetHospital.specialty}** 진료를 특화하여 운영하고 있으며, 주소는 **${targetHospital.address}**에 위치하고 있습니다.

교통사고와 같은 상해 사고가 무서운 이유는 사고 직후의 외상보다 <span style="color:#805AD5">**후유증(後遺症)**</span>에 있습니다. 사고 당시 척추나 관절에 가해진 강한 충격은 며칠 혹은 몇 주 뒤에 서서히 나타나 만성 통증으로 굳어지기 마련입니다. 그렇기에 사고 초기부터 ${targetHospital.specialty} 전문의의 정확한 진단과 물리치료, 약물치료 및 적극적인 비수술적 치료를 병행하는 것이 척추 관절 건강을 지키는 핵심입니다.

특히 **척추압박골절(Compression Fracture)**은 사고 직후에는 통증이 미미하다가 시간이 지나면서 심각한 장해로 이어지는 대표적인 부상입니다. <span style="color:#E53E3E">초기 정밀 검사(MRI·CT)를 반드시 받아야</span> 후일 보상 분쟁을 방지할 수 있습니다.

---

## 2. 교통사고 상해 초기 대응: 자동차보험 지불보증 매뉴얼

많은 환자분들께서 사고 직후 병원 창구에서 본인 돈으로 치료비를 수납해야 하는지 혼란스러워하십니다. 자동차보험 사고는 기본적으로 <span style="color:#3182CE">**지불보증(보증서 발행)** 제도를 통해 본인 부담금 없이 진행</span>됩니다.

다음은 치료비 걱정 없이 안정적으로 진료를 받기 위한 필수 초기 매뉴얼입니다.

1. **사고 접수번호 확인**: 사고 발생 후 상대방 보험사로부터 발급받은 '사고 접수번호'를 반드시 챙기셔야 합니다.
2. **지불보증서 발급 의뢰**: 병원 접수처에 상대 보험사 이름과 사고 접수번호를 전달하면, 병원이 보험사에 연락하여 **지불보증서**를 팩스로 전달받습니다.
3. **치료 시작**: 지불보증이 수락되면 환자는 본인 부담금 0원으로 치료에만 전념할 수 있습니다.

> 💡 **손해사정사 실무 꿀팁**
> <span style="color:#E53E3E">보험사 직원이 향후치료비(합의금 선지급) 명목으로 조기 합의를 종용하며 치료 중단을 유도할 수 있습니다.</span> 하지만 척추나 관절 상해는 조기에 치료를 중단할 경우 후유증이 남을 확률이 매우 높고, 합의 이후 발생하는 치료비는 오롯이 본인 부담이 되므로 절대로 서둘러 합의하지 마시고 치료를 충분히 받으십시오.

| 단계 | 주요 업무 | 환자 준비 사항 | 주의 사항 |
| :--- | :--- | :--- | :--- |
| **1단계: 사고 접수** | 보험사에 사고 접수 및 접수번호 발급 | 상대 차량 번호, 블랙박스 | 과실 비율 섣부른 인정 금지 |
| **2단계: 병원 내원** | 접수처에 접수번호와 담당자 연락처 전달 | 신분증, 사고접수증 | 정밀 검사(MRI, CT) 요청 필요 |
| **3단계: 지불보증** | 보험사가 병원으로 지불보증서 전송 | 대기 후 본인부담금 확인 | 치료 보증 범위 및 기간 확인 |
| **4단계: 치료 유지** | 완치될 때까지 지속적인 통원/입원 | 진료기록부, 영상 CD | 중도 통원 누락 시 합의금 감액 |

---

## 3. 척추/관절 상해 시 숨은 보상금(후유장해) 및 합의금 많이 받는 꿀팁

교통사고 피해자가 가장 놓치기 쉬운 숨은 보상금이 바로 <span style="color:#38A169">**맥브라이드식 후유장해 보험금**</span>입니다. 보험사에서는 환자에게 먼저 후유장해 평가를 받으라고 말해주지 않습니다.

### 척추 골절 및 관절 파열의 장해 평가 기준

교통사고로 인해 척추에 <span style="color:#805AD5">미세한 압박골절(압박률)</span>이 발생하거나, 무릎 관절의 인대(십자인대 등)가 파열되어 흔들림(동요)이 남는 경우 세밀한 평가가 필요합니다.
- **척추 골절**: 영구장해 또는 한시장해(3년, 5년) 평가를 통해 위자료와 **상실수익액**을 대폭 상향해 산정해야 합니다.
- **십자인대 파열**: 동요도 검사(스트레스 뷰)를 실시하여 무릎 관절에 흔들림이 남아있는지 확인하고 <span style="color:#805AD5">노동능력상실률</span>을 평가받아야 합니다.

### 손해사정사가 제안하는 합의 성공 3원칙

1. <span style="color:#3182CE">**진료기록부 철저 분석**</span>: 본인의 모든 상해 부위가 진료기록부에 누락 없이 기재되어 있는지 병원(${targetHospital.name}) 치료 단계에서 꼼꼼히 확인해야 합니다.
2. <span style="color:#E53E3E">**섣부른 서명 금지**</span>: 보험사가 제시하는 '의료자문 동의서'에 무심코 서명하면, 보험사 협력 자문의를 통해 장해율이 깎일 우려가 매우 큽니다.
3. <span style="color:#D97706">**독립손해사정사 상담**</span>: 장해 상태가 예상되는 중증 상해의 경우, 보험사의 일방적인 장해 평가 결과를 그대로 수용하기보다 직접 독립손해사정사의 조력을 구해야 객관적인 보상을 받을 수 있습니다.

---

## 4. 결론 및 법적 면책 조항

요약하자면, 교통사고나 상해를 입었을 때는 ${targetHospital.region} **${targetHospital.name}**과 같이 전문적인 치료 인프라를 갖춘 의료기관을 찾아 조기에 정밀 진단과 치료를 충분히 받아 건강을 회복하는 것이 최우선입니다. 이후 치료 과정 중 발생하는 지불보증 분쟁이나 중증 상해로 인한 합의금 및 장해 평가는 혼자 고민하기보다 실무 경험이 풍부한 손해사정사의 컨설팅을 받는 것이 정당한 권리를 지키는 가장 지혜로운 지름길입니다.

※ 본 포스팅은 공공데이터를 기반으로 한 일반적인 정보 제공 목적이며, 의학적 진단이나 법률적/보상적 확정 결과를 보장하지 않습니다. 개별 사건의 정확한 손해액 산정은 반드시 전문가와 직접 상담하시기 바랍니다.

FILENAME: ${new Date().toISOString().split('T')[0]}-${(targetHospital.region.split(' ')[0] || 'seoul').toLowerCase()}-${(targetHospital.specialty || 'medical').replace(/\//g, '-')}
`;
    } else {
      // ─── 실제 Gemini API 호출 ───
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API 응답 실패 (${response.status}): ${errText}`);
      }

      const resJson = await response.json();
      textOutput = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error('Gemini로부터 답변을 받지 못했습니다. API 응답 데이터를 확인해 주세요.');
      }
    }

    // ─── 마크다운 양식 정화 ───
    textOutput = textOutput.trim();
    if (textOutput.startsWith('```markdown')) textOutput = textOutput.slice(11).trim();
    if (textOutput.startsWith('```')) textOutput = textOutput.slice(3).trim();
    if (textOutput.endsWith('```')) textOutput = textOutput.slice(0, -3).trim();

    // ─── [3단계] 파일명 추출 ───
    const filenameMatch = textOutput.match(/FILENAME:\s*([^\s\n\r]+)/i);
    let fileName = filenameMatch ? filenameMatch[1].trim() : `${new Date().toISOString().split('T')[0]}-${targetHospital.id}`;
    if (!fileName.endsWith('.md')) fileName += '.md';

    // 본문에서 FILENAME 줄 제거
    let finalContent = textOutput.replace(/FILENAME:\s*[^\s\n\r]+/gi, '').trim();

    // ─── [4단계] 후처리 ───

    // 1. YAML 프론트매터 Title 따옴표 강제 보정
    let lines = finalContent.split('\n');
    let frontmatterCount = 0;
    let inFrontmatter = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '---') {
        frontmatterCount++;
        inFrontmatter = (frontmatterCount === 1);
        continue;
      }
      if (inFrontmatter && lines[i].startsWith('title:')) {
        let titleVal = lines[i].slice(6).trim();
        if (!titleVal.startsWith('"') || !titleVal.endsWith('"')) {
          if ((titleVal.startsWith('"') && titleVal.endsWith('"')) || (titleVal.startsWith("'") && titleVal.endsWith("'"))) {
            titleVal = titleVal.slice(1, -1);
          }
          titleVal = titleVal.replace(/"/g, '\\"');
          lines[i] = `title: "${titleVal}"`;
        }
        break;
      }
      if (frontmatterCount >= 2) break;
    }
    finalContent = lines.join('\n');

    // 2. 볼드체 안의 공백 정리 (핵심 버그 수정)
    //    전략: 볼드체 토큰을 임시 플레이스홀더로 바꾼 뒤 → 콜론 보정 → 볼드 복원
    //    이렇게 하면 **척추압박골절(Compression Fracture):** 처럼 볼드 안의 내용이
    //    콜론 보정 regex의 영향을 전혀 받지 않습니다.
    const boldPlaceholders = [];
    let tempContent = finalContent.replace(/\*\*[^*\n]+\*\*/g, (boldMatch) => {
      // 볼드 안의 앞뒤 공백 정리
      const inner = boldMatch.slice(2, -2).trim();
      boldPlaceholders.push(`**${inner}**`);
      return `%%BOLD_${boldPlaceholders.length - 1}%%`;
    });

    // 볼드 외부에서만 콜론 앞뒤 공백 보정
    tempContent = tempContent.replace(/([가-힣a-zA-Z\(\)]+)\s*:\s*(?!\s*%%BOLD_)([^\n*]|$)/g, '$1 : $2');

    // 볼드 토큰 복원
    finalContent = tempContent.replace(/%%BOLD_(\d+)%%/g, (_, idx) => boldPlaceholders[parseInt(idx)]);

    // 3. 본문 내 섹션 구분선(---) 자동 삽입
    let bodyLines = finalContent.split('\n');
    let newBodyLines = [];
    let passedFrontmatter = false;
    let separatorCount = 0;

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i];
      if (line.trim() === '---') {
        separatorCount++;
        if (separatorCount >= 2) passedFrontmatter = true;
        newBodyLines.push(line);
        continue;
      }
      if (passedFrontmatter && line.trim().startsWith('## ')) {
        let prevIdx = newBodyLines.length - 1;
        while (prevIdx >= 0 && newBodyLines[prevIdx].trim() === '') prevIdx--;
        if (prevIdx >= 0 && newBodyLines[prevIdx].trim() !== '---') {
          newBodyLines.push('');
          newBodyLines.push('---');
          newBodyLines.push('');
        }
      }
      newBodyLines.push(line);
    }
    finalContent = newBodyLines.join('\n');

    const savePath = path.join(POSTS_DIR, fileName);
    fs.writeFileSync(savePath, finalContent, 'utf8');
    console.log(`✅ 블로그 글 생성 성공! 저장된 파일: ${fileName}`);

    // 병원 상태 업데이트 (treated → true)
    targetHospital.treated = true;
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(hospitals, null, 2), 'utf8');
    console.log(`✏️ [${targetHospital.name}]의 상태를 작성 완료(treated: true)로 업데이트했습니다.`);

  } catch (error) {
    console.error('❌ 글 생성 도중 에러가 발생했습니다:');
    console.error(error.message);
  }
}

generatePost();
