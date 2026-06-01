const fs = require('fs');
const path = require('path');

// .env.local 파일에서 환경변수를 수동으로 읽어오는 함수 (초보자분들이 패키지 설치 없이 쉽게 쓸 수 있게 돕습니다)
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
        // 따옴표 제거
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

// 환경변수 로드
loadEnvLocal();

const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/medical-info.json');
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// [1단계] 기초 데이터 및 폴더 설정
function ensureDirectoriesAndFiles() {
  // 저장용 폴더가 없으면 생성
  const dataDir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  // 데이터 파일이 없으면 샘플 병원 데이터로 생성
  if (!fs.existsSync(DATA_FILE_PATH)) {
    const sampleHospitals = [
      {
        id: "hosp-001",
        name: "강남바른척추정형외과의원",
        region: "서울 강남구",
        specialty: "정형외과",
        address: "서울특별시 강남구 테헤란로 123",
        treated: false
      },
      {
        id: "hosp-002",
        name: "부산튼튼신경외과의원",
        region: "부산 해운대구",
        specialty: "신경외과",
        address: "부산광역시 해운대구 해운대로 456",
        treated: false
      },
      {
        id: "hosp-003",
        name: "대구탑연합정형외과",
        region: "대구 중구",
        specialty: "정형외과",
        address: "대구광역시 중구 달구벌대로 789",
        treated: false
      }
    ];
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(sampleHospitals, null, 2), 'utf8');
    console.log('💡 public/data/medical-info.json 파일이 없어서 샘플 데이터를 생성했습니다.');
  }
}

// 메인 실행 함수
async function generatePost() {
  ensureDirectoriesAndFiles();

  const apiKey = process.env.GEMINI_API_KEY;
  let isTestMode = false;
  
  if (!apiKey || apiKey === '여기에_입력') {
    console.log('⚠️ [테스트 모드] API Key가 입력되지 않아 규칙을 완벽 준수한 테스트용 글을 자동으로 생성합니다.');
    isTestMode = true;
  }

  // 병원 데이터 가져오기
  const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
  let hospitals = [];
  try {
    hospitals = JSON.parse(rawData);
  } catch (e) {
    console.error('❌ 병원 데이터 JSON 파싱 에러:', e);
    process.exit(1);
  }

  // 아직 글이 작성되지 않은(treated: false) 병원 선택
  const targetHospital = hospitals.find(h => h.treated === false || !h.treated);

  if (!targetHospital) {
    console.log('🎉 모든 병원의 블로그 글 작성이 완료되었습니다! (새로운 데이터를 추가해 주세요)');
    return;
  }

  console.log(`✍️ [${targetHospital.name}] 정보를 기반으로 블로그 글 작성을 시작합니다...`);

  // [2단계] Gemini AI 프롬프트 생성
  const prompt = `
너는 척추/관절 및 교통사고 보상을 전문으로 하는 10년 차 수석 독립손해사정사야. 
아래 병원 데이터를 바탕으로, 교통사고 피해자나 상해 환자들을 위한 '구글 애드센스 승인용 고품질 정보성 가이드 글'을 작성해 줘.

[병원 데이터]
- 병원 이름: ${targetHospital.name}
- 지역: ${targetHospital.region}
- 전문 과목: ${targetHospital.specialty}
- 주소: ${targetHospital.address}

[필수 작성 규칙 - 이것을 어기면 절대 안 됨]
1. 분량: 공백 제외 반드시 2,000자 ~ 2,500자 이상으로 매우 상세하게 작성할 것.
2. 계층 구조 (H태그): 마크다운 문법인 '##' (중제목), '###' (소제목)을 사용하여 논리적인 목차 구조를 갖출 것.
3. 시각적 요소: 본문 중간에 해당 병원의 진료 정보나, 교통사고 합의금 산정 기준 등을 요약한 **마크다운 표(Table)**를 최소 1개 이상 반드시 포함할 것. 숫자가 포함된 리스트(1. 2. 3.)와 글머리 기호(-)도 적극 활용할 것.
4. 전문성과 독창성: 공공데이터를 나열하는 것에 그치지 말고, 실제 보상 실무(자동차보험 지불보증 절차, 후유장해 진단서 발급 꿀팁, 합의 요령)를 환자 눈높이에서 전문가적 통찰을 담아 길게 풀어낼 것.
5. 문체: 환자에게 신뢰감을 주는 "~습니다", "~합니다" 체를 사용하고, 중요 키워드는 **볼드체**로 강조할 것.
6. YAML 프론트매터 Title 따옴표 필수: 제목에 콜론(:)이 포함되거나 어떠한 경우에도 빌드 에러를 방지하기 위해 YAML 상단의 title 값은 반드시 전체를 큰따옴표로 감싸서 출력할 것. (예: title: "인천 병원 : 합의금 꿀팁")
7. 볼드체 마크다운 문법 오류 방지: 볼드체를 사용할 때, 닫는 별표(**) 바로 앞에 절대 공백이 들어가지 않도록 할 것. 닫는 별표 안에는 절대 공백이 없어야 렌더링 에러가 안 생기므로, 반드시 **척추 질환 전문성:** 또는 **척추 질환 전문성**: 형태로 띄어쓰기를 철저히 준수할 것. (잘못된 예: **척추 질환 전문성 : **)
8. 본문 내 섹션 구분선(---) 삽입: 글의 가독성을 높이기 위해, 각 주요 섹션(## 중제목)이 끝나는 부분과 다음 섹션이 시작되는 사이(본문 중간중간 내용 전환 시)에 반드시 마크다운 수평 구분선(---)을 넣어 시각적으로 영역을 명확히 분리할 것.

[내용 구조]
- 도입부: 환자의 아픔에 공감하며 병원 소개 (${targetHospital.name})
- 본문 1: 해당 병원의 주요 진료 과목 및 특징
- 본문 2: (전문성) 교통사고 및 상해 발생 시 치료비 지불보증 등 초기 대응 매뉴얼
- 본문 3: (전문성) 척추/관절 상해 시 숨은 보상금 찾기 및 합의 꿀팁
- 결론 및 면책 조항: 요약 정리 및 '※ 본 포스팅은 공공데이터를 기반으로 한 일반적인 정보 제공 목적이며, 의학적 진단이나 법률적/보상적 확정 결과를 보장하지 않습니다. 개별 사건의 정확한 손해액 산정은 반드시 전문가와 상담하시기 바랍니다.'라는 문구 삽입.

아래 형식으로만 출력해줘 (마크다운 코드 블록 등으로 감싸지 말고 날것 그대로 출력해줘):
---
title: "(지역명+병원명과 합의금/지불보증 키워드를 섞은 제목)"
date: ${new Date().toISOString().split('T')[0]}
summary: "전체 글을 깔끔하게 정리 한 줄 요약"
category: 병원보상가이드
tags: [교통사고합의금, 지불보증, ${targetHospital.region.split(' ').join('')}, ${targetHospital.specialty}, 후유장해]
---
(여기에 지침에 따른 본문 내용 작성)

FILENAME: YYYY-MM-DD-영문키워드
`;

  try {
    let textOutput = '';

    if (isTestMode) {
      // 2,000자 이상의 초고품질 E-E-A-T 만족 포스팅 자동 생성 (오프라인 테스트용)
      textOutput = `---
title: "${targetHospital.region} ${targetHospital.name} 방문 전 꼭 알아야 할 교통사고 합의금 많이 받는 요령과 지불보증 절차"
date: ${new Date().toISOString().split('T')[0]}
summary: "${targetHospital.region}에 위치한 ${targetHospital.name}의 진료 정보와 함께 교통사고 발생 시 지불보증 신청 절차 및 후유장해 보험금 찾는 핵심 노하우를 정리해 드립니다."
category: 병원보상가이드
tags: [교통사고합의금, 지불보증, ${targetHospital.region.split(' ').join('')}, ${targetHospital.specialty}, 후유장해]
---
안녕하십니까. 척추, 관절 및 교통사고 보상을 전문으로 하며 환자의 아픔과 보상의 억울함을 꼼꼼히 해결해 드리는 10년 차 수석 독립손해사정사입니다. 

갑작스러운 교통사고나 상해로 인해 일상생활이 무너지고 극심한 통증에 시달릴 때, 환자분들은 육체적 고통뿐만 아니라 "치료비는 어떻게 해결해야 하는가?", "보험사와의 합의금 산정은 제대로 이루어지고 있는가?"에 대한 정신적 불안감까지 떠안게 됩니다. 

오늘 칼럼에서는 ${targetHospital.region}에 위치하여 환자들의 아픈 곳을 전문적으로 돌보고 있는 **${targetHospital.name}**을 중심으로, 교통사고 발생 초기 대처 방법부터 시작해 숨겨진 보상금인 후유장해 보험금을 온전히 수령하는 실무 팁까지 상세히 풀어드리겠습니다. 이 글을 정독하시는 것만으로도 수백만 원에 달하는 합의금 차이를 방지할 수 있습니다.

---

## 1. ${targetHospital.name}의 진료 과목 및 의료 환경 분석

${targetHospital.region}의 믿을 수 있는 의료기관인 **${targetHospital.name}**은 주로 **${targetHospital.specialty}** 진료를 특화하여 운영하고 있으며, 주소는 **${targetHospital.address}**에 위치하고 있습니다.

교통사고와 같은 상해 사고가 무서운 이유는 사고 직후의 외상보다 **후유증**에 있습니다. 사고 당시 척추나 관절에 가해진 강한 충격은 며칠 혹은 몇 주 뒤에 서서히 나타나 만성 통증으로 굳어지기 마련입니다. 그렇기에 사고 초기부터 ${targetHospital.specialty} 전문의의 정확한 진단과 물리치료, 약물치료 및 적극적인 비수술적 치료를 병행하는 것이 척추 관절 건강을 지키는 핵심입니다.

---

## 2. 교통사고 상해 초기 대응: 자동차보험 지불보증 매뉴얼

많은 환자분들께서 사고 직후 병원 창구에서 본인 돈으로 치료비를 수납해야 하는지 혼란스러워하십니다. 자동차보험 사고는 기본적으로 **지불보증(보증서 발행)** 제도를 통해 본인 부담금 없이 진행됩니다. 

다음은 치료비 걱정 없이 안정적으로 진료를 받기 위한 필수 초기 매뉴얼입니다.

1. **사고 접수번호 확인**: 사고 발생 후 상대방 보험사로부터 발급받은 '사고 접수번호'를 반드시 챙기셔야 합니다.
2. **지불보증서 발급 의뢰**: 병원 접수처에 상대 보험사 이름과 사고 접수번호를 전달하면, 병원이 보험사에 연락하여 **지불보증서**를 팩스로 전달받습니다.
3. **치료 시작**: 지불보증이 수락되면 환자는 본인 부담금 0원으로 치료에만 전념할 수 있습니다.

> 💡 **손해사정사 실무 꿀팁**
> "보험사 직원이 향후치료비(합의금 선지급) 명목으로 조기 합의를 종용하며 치료 중단을 유도할 수 있습니다. 하지만 척추나 관절 상해는 조기에 치료를 중단할 경우 후유증이 남을 확률이 매우 높고, 합의 이후 발생하는 치료비는 오롯이 본인 부담이 되므로 절대로 서둘러 합의하지 마시고 치료를 충분히 받으십시오."

아래 표는 교통사고 초기 대응 단계별 핵심 요점 정리표입니다.

| 단계 | 주요 업무 | 환자 준비 사항 | 주의 사항 |
| :--- | :--- | :--- | :--- |
| **1단계: 사고 접수** | 보험사에 사고 접수 및 접수번호 발급 | 상대 차량 번호, 블랙박스 | 과실 비율 섣부른 인정 금지 |
| **2단계: 병원 내원** | 접수처에 접수번호와 담당자 연락처 전달 | 신분증, 사고접수증 | 정밀 검사(MRI, CT) 요청 필요 |
| **3단계: 지불보증** | 보험사가 병원으로 지불보증서 전송 | 대기 후 본인부담금 확인 | 치료 보증 범위 및 기간 확인 |
| **4단계: 치료 유지** | 완치될 때까지 지속적인 통원/입원 | 진료기록부, 영상 CD | 중도 통원 누락 시 합의금 감액 |

---

## 3. 척추/관절 상해 시 숨은 보상금(후유장해) 및 합의금 많이 받는 꿀팁

교통사고 피해자가 가장 놓치기 쉬운 숨은 보상금이 바로 **맥브라이드식 후유장해 보험금**입니다. 보험사에서는 환자에게 먼저 후유장해 평가를 받으라고 말해주지 않습니다.

### 척추 골절 및 관절 파열의 장해 평가 기준
교통사고로 인해 척추에 미세한 압박골절(압박률)이 발생하거나, 무릎 관절의 인대(십자인대 등)가 파열되어 흔들림(동요)이 남는 경우 세밀한 평가가 필요합니다.
- **척추 골절**: 영구장해 또는 한시장해(3년, 5년) 평가를 통해 위자료와 **상실수익액**을 대폭 상향해 산정해야 합니다.
- **십자인대 파열**: 동요도 검사(스트레스 뷰)를 실시하여 무릎 관절에 흔들림이 남아있는지 확인하고 노동능력상실률을 평가받아야 합니다.

### 손해사정사가 제안하는 합의 성공 3원칙
1. **진료기록부 철저 분석**: 본인의 모든 상해 부위가 진료기록부에 누락 없이 기재되어 있는지 병원(${targetHospital.name}) 치료 단계에서 꼼꼼히 확인해야 합니다.
2. **섣부른 서명 금지**: 보험사가 제시하는 '의료자문 동의서'에 무심코 서명하면, 보험사 협력 자문의를 통해 장해율이 깎일 우려가 매우 큽니다.
3. **독립손해사정사 상담**: 장해 상태가 예상되는 중증 상해의 경우, 보험사의 일방적인 장해 평가 결과를 그대로 수용하기보다 직접 독립손해사정사의 조력을 구해야 객관적인 보상을 받을 수 있습니다.

---

## 4. 결론 및 법적 면책 조항

요약하자면, 교통사고나 상해를 입었을 때는 ${targetHospital.region} **${targetHospital.name}**과 같이 전문적인 치료 인프라를 갖춘 의료기관을 찾아 조기에 정밀 진단과 치료를 충분히 받아 건강을 회복하는 것이 최우선입니다. 이후 치료 과정 중 발생하는 지불보증 분쟁이나 중증 상해로 인한 합의금 및 장해 평가는 혼자 고민하기보다 실무 경험이 풍부한 손해사정사의 컨설팅을 받는 것이 정당한 권리를 지키는 가장 지혜로운 지름길입니다.

※ 본 포스팅은 공공데이터를 기반으로 한 일반적인 정보 제공 목적이며, 의학적 진단이나 법률적/보상적 확정 결과를 보장하지 않습니다. 개별 사건의 정확한 손해액 산정은 반드시 전문가와 직접 상담하시기 바랍니다.

FILENAME: 2026-05-29-seoul-gangnam-medical-compensation
`;
    } else {
      // Gemini API 호출 (외부 패키지 없이 내장 fetch 활용)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
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

    // 마크다운 양식 정화 (Gemini가 임의로 ```markdown ``` 으로 감싸서 출력한 경우 대응)
    textOutput = textOutput.trim();
    if (textOutput.startsWith('```markdown')) {
      textOutput = textOutput.slice(11).trim();
    }
    if (textOutput.endsWith('```')) {
      textOutput = textOutput.slice(0, -3).trim();
    }

    // [3단계] 파일명 추출 및 본문과 분리하여 저장
    const filenameMatch = textOutput.match(/FILENAME:\s*([^\s\n\r]+)/i);
    let fileName = '';
    if (filenameMatch) {
      fileName = filenameMatch[1].trim();
    } else {
      // 파일명이 추출되지 않았을 때의 예비 파일명 설정
      fileName = `${new Date().toISOString().split('T')[0]}-${targetHospital.id}`;
    }

    if (!fileName.endsWith('.md')) {
      fileName += '.md';
    }

    // 본문에서 FILENAME 줄 제거
    let finalContent = textOutput.replace(/FILENAME:\s*[^\s\n\r]+/gi, '').trim();

    // 1. YAML 프론트매터 Title 따옴표 강제 보정 (콜론 포함 시 빌드 실패 방지)
    let lines = finalContent.split('\n');
    let inFrontmatter = false;
    let frontmatterCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '---') {
        frontmatterCount++;
        inFrontmatter = (frontmatterCount === 1);
        continue;
      }
      if (inFrontmatter && lines[i].startsWith('title:')) {
        let titleVal = lines[i].slice(6).trim();
        // 앞뒤에 이미 큰따옴표가 있는지 확인하여 없으면 강제로 감싸줌
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

    // 2. 볼드체 마크다운 문법 오류 방지 및 한글/영문 괄호 포함 기호 정렬
    finalContent = finalContent.replace(/\*\*([^\*]+?)\*\*/g, (match, p1) => {
      if (p1.includes(':')) {
        const cleaned = p1.replace(/\s*:\s*$/, ':').trim();
        return `**${cleaned}**`;
      }
      return `**${p1.trim()}**`;
    });

    // 한글 및 영문 괄호 뒤의 콜론(:) 기호 앞뒤에 항상 공백이 오도록 보정 (단, 볼드체 문법 종료 기호 ** 직전은 제외)
    finalContent = finalContent.replace(/([가-힣a-zA-Z\(\)]+)\s*:\s*([^*]|$)/g, '$1 : $2');

    // 3. 본문 내 섹션 구분선(---) 삽입 보정 (## H2 태그 시작 전 --- 확인 및 자동 삽입)
    let bodyLines = finalContent.split('\n');
    let newBodyLines = [];
    let passedFrontmatter = false;
    let frontmatterSeparatorCount = 0;
    
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i];
      if (line.trim() === '---') {
        frontmatterSeparatorCount++;
        if (frontmatterSeparatorCount >= 2) {
          passedFrontmatter = true;
        }
        newBodyLines.push(line);
        continue;
      }
      
      if (passedFrontmatter && line.trim().startsWith('## ')) {
        let prevLineIndex = newBodyLines.length - 1;
        while (prevLineIndex >= 0 && newBodyLines[prevLineIndex].trim() === '') {
          prevLineIndex--;
        }
        
        if (prevLineIndex >= 0 && newBodyLines[prevLineIndex].trim() !== '---') {
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

    // 병원 데이터 상태 업데이트 (treated -> true)
    targetHospital.treated = true;
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(hospitals, null, 2), 'utf8');
    console.log(`✏️ [${targetHospital.name}]의 상태를 작성 완료(treated: true)로 업데이트했습니다.`);

  } catch (error) {
    console.error('❌ 글 생성 도중 에러가 발생했습니다:');
    console.error(error.message);
  }
}

generatePost();
