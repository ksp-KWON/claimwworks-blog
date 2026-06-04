"""
generate-blog-post.py
보상스쿨 자동글쓰기 - Python 버전
Python 내장 라이브러리만 사용 (pip install 불필요)
"""

import urllib.request
import urllib.error
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── 토픽 풀 ──
TOPIC_POOL = [
    {"slug": "rotator-cuff-tear-insurance-guide", "title": "회전근개 파열 보험금 청구 가이드: 수술 후 후유장해 보상 핵심 전략", "category": "병원 보상 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["회전근개파열","어깨수술","후유장해","실손보험","손해사정"], "keywords": "회전근개 파열, 어깨 MRI, 실손보험, 후유장해 보험금"},
    {"slug": "herniated-disc-compensation-guide", "title": "목·허리디스크(추간판탈출증) 교통사고 보상 완벽 가이드", "category": "교통사고 보상 가이드", "specialtyCategory": "신경외과 (NS)", "tags": ["목디스크","허리디스크","추간판탈출증","교통사고합의금","손해사정"], "keywords": "디스크 교통사고, 추간판탈출증, 신경외과, 후유장해"},
    {"slug": "cataract-multifocal-lens-insurance-dispute", "title": "백내장 다초점렌즈 실손보험 분쟁: 보험금 받는 방법과 주의사항", "category": "실손보험 분쟁 가이드", "specialtyCategory": "안과 (OPH)", "tags": ["백내장","다초점렌즈","실손보험","비급여","보험분쟁"], "keywords": "백내장 실손보험, 다초점렌즈 보험금, 안과 비급여"},
    {"slug": "uterine-fibroid-hifu-insurance", "title": "자궁근종 하이푸(HIFU) 시술 실손보험 청구 가이드", "category": "실손보험 분쟁 가이드", "specialtyCategory": "산부인과 (OBGY)", "tags": ["자궁근종","하이푸","HIFU","실손보험","비급여청구"], "keywords": "자궁근종 하이푸 보험, 실손보험 청구, 산부인과 비급여"},
    {"slug": "meniscus-tear-compensation-guide", "title": "반월상연골판 파열 보험금: 수술 여부에 따른 후유장해 보상 전략", "category": "병원 보상 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["반월상연골판","무릎수술","관절경","후유장해","손해사정"], "keywords": "반월상연골판 파열, 무릎 MRI, 관절경 수술, 보험금"},
    {"slug": "spinal-stenosis-insurance-guide", "title": "척추관협착증 비수술·수술 보상 비교: 실손보험 & 후유장해 완벽 정리", "category": "병원 보상 가이드", "specialtyCategory": "신경외과 (NS)", "tags": ["척추관협착증","비수술치료","후유장해","실손보험","손해사정"], "keywords": "척추관협착증 실손보험, 비수술 치료, 후유장해 보험금"},
    {"slug": "acute-myocardial-infarction-insurance", "title": "급성 심근경색증 보험금: 진단비·수술비·후유장해 한번에 정리", "category": "병원 보상 가이드", "specialtyCategory": "내과 (IM)", "tags": ["심근경색","진단비","수술비","보험금청구","손해사정"], "keywords": "심근경색 보험금, 진단비 청구, 심장수술 후유장해"},
    {"slug": "traffic-accident-settlement-amount-guide", "title": "교통사고 합의금 계산법: 손해사정사가 알려주는 정당한 금액 산정 기준", "category": "교통사고 보상 가이드", "specialtyCategory": "신경외과 (NS)", "tags": ["교통사고합의금","합의금계산","손해사정","보험사협상","치료비"], "keywords": "교통사고 합의금 계산, 손해배상, 보험금 산정"},
    {"slug": "achilles-tendon-rupture-guide", "title": "아킬레스건 파열 후 보험금 청구: 수술·재활 후 후유장해 보상 핵심", "category": "병원 보상 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["아킬레스건파열","발목수술","후유장해","실손보험","손해사정"], "keywords": "아킬레스건 파열, 수술 후 재활, 후유장해 보험금"},
    {"slug": "do-su-therapy-insurance-dispute", "title": "도수치료 실손보험 분쟁 완벽 가이드: 거절 이유와 대응 전략", "category": "실손보험 분쟁 가이드", "specialtyCategory": "피부과 (DER) / 성형외과 (PS)", "tags": ["도수치료","실손보험","비급여","보험분쟁","보험거절"], "keywords": "도수치료 실손보험, 비급여 치료, 보험금 거절 대응"},
    {"slug": "prior-disease-contribution-ratio-guide", "title": "기왕증(사고 전 질병) 기여도 분쟁: 보험사에 맞서는 대응 전략", "category": "보험 분쟁 가이드", "specialtyCategory": "내과 (IM)", "tags": ["기왕증","기여도","보험분쟁","손해사정","교통사고"], "keywords": "기왕증 기여도, 보험금 삭감, 분쟁 해결"},
    {"slug": "implant-dental-insurance-guide", "title": "임플란트 치조골 이식술 실손보험 청구 가이드", "category": "실손보험 분쟁 가이드", "specialtyCategory": "치과 (DEN)", "tags": ["임플란트","치조골이식","실손보험","치과비급여","보험청구"], "keywords": "임플란트 보험금, 치조골 이식 실손, 치과 비급여"},
    {"slug": "prostate-hyperplasia-urolift-insurance", "title": "전립선비대증 유로리프트(결찰술) 실손보험 청구 방법", "category": "실손보험 분쟁 가이드", "specialtyCategory": "비뇨의학과 (URO)", "tags": ["전립선비대증","유로리프트","결찰술","실손보험","비급여"], "keywords": "전립선 유로리프트 보험금, 비뇨기과 실손"},
    {"slug": "acl-tear-injury-compensation", "title": "전방십자인대(ACL) 파열 교통사고 후유장해 보상 가이드", "category": "교통사고 보상 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["전방십자인대","무릎인대","후유장해","교통사고","손해사정"], "keywords": "십자인대 파열 보험금, 무릎 교통사고, 후유장해 청구"},
    {"slug": "traumatic-brain-hemorrhage-guide", "title": "외상성 뇌출혈 보험금 청구: 후유장해 등급과 보상 핵심 포인트", "category": "병원 보상 가이드", "specialtyCategory": "신경외과 (NS)", "tags": ["뇌출혈","외상성뇌손상","후유장해","교통사고","손해사정"], "keywords": "외상성 뇌출혈 보험금, 뇌손상 후유장해, 신경외과"},
    {"slug": "varicose-veins-insurance-dispute", "title": "하지정맥류 수술 실손보험 분쟁: 급여·비급여 구분과 청구 전략", "category": "실손보험 분쟁 가이드", "specialtyCategory": "외과 (GS)", "tags": ["하지정맥류","정맥류수술","실손보험","비급여","보험분쟁"], "keywords": "하지정맥류 실손보험, 수술비 청구, 급여 비급여"},
    {"slug": "thyroid-cancer-minor-insurance", "title": "갑상선암 소액암 분쟁: 일반암 vs 소액암 보험금 차이와 대응법", "category": "보험 분쟁 가이드", "specialtyCategory": "외과 (GS)", "tags": ["갑상선암","소액암","암보험분쟁","보험금","손해사정"], "keywords": "갑상선암 보험금, 소액암 분쟁, 암보험 청구"},
    {"slug": "macular-degeneration-injection-insurance", "title": "황반변성 주사치료(아일리아·루센티스) 실손보험 청구 가이드", "category": "실손보험 분쟁 가이드", "specialtyCategory": "안과 (OPH)", "tags": ["황반변성","아일리아","루센티스","실손보험","비급여주사"], "keywords": "황반변성 주사 보험금, 안과 비급여, 실손 청구"},
    {"slug": "traffic-accident-medical-cost-guide", "title": "교통사고 치료비 전액 받는 방법: 자동차보험 지불보증 완전 정복", "category": "교통사고 보상 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["지불보증","자동차보험","교통사고치료비","손해사정","보험처리"], "keywords": "교통사고 지불보증, 치료비 청구, 자동차보험"},
    {"slug": "hanok-medicine-chuna-therapy-insurance", "title": "한방 추나요법·첩약 실손보험 청구: 인정 기준과 분쟁 대응법", "category": "실손보험 분쟁 가이드", "specialtyCategory": "한방의학과 (KM)", "tags": ["추나요법","첩약","한방실손","교통사고한방","보험분쟁"], "keywords": "추나요법 실손보험, 한방 첩약 보험금, 교통사고 한방 치료"},
    {"slug": "loss-adjuster-role-guide", "title": "손해사정사가 하는 일: 보험금을 제대로 받기 위한 전문가 활용법", "category": "손해사정 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["손해사정사","보험전문가","보험금청구","독립손해사정","보상가이드"], "keywords": "손해사정사 역할, 독립 손해사정사, 보험금 청구 도움"},
    {"slug": "disability-rating-mcbride-ama-guide", "title": "맥브라이드 vs AMA 장해평가: 후유장해 등급 결정 방식 완벽 비교", "category": "손해사정 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["맥브라이드","AMA장해평가","후유장해등급","손해사정","장해진단서"], "keywords": "맥브라이드 장해평가, AMA 방식, 후유장해 등급 산정"},
    {"slug": "car-accident-uninsured-victim-guide", "title": "무보험·뺑소니 교통사고 피해자 보상 가이드: 정부보장사업 활용법", "category": "교통사고 보상 가이드", "specialtyCategory": "신경외과 (NS)", "tags": ["무보험사고","뺑소니","정부보장사업","피해자보상","손해사정"], "keywords": "무보험 교통사고, 뺑소니 보상, 정부보장사업"},
    {"slug": "incontinence-surgery-insurance-guide", "title": "요실금 수술 실손보험 청구: 급여·비급여 구분과 분쟁 대응 전략", "category": "실손보험 분쟁 가이드", "specialtyCategory": "산부인과 (OBGY)", "tags": ["요실금","요실금수술","실손보험","비급여","보험분쟁"], "keywords": "요실금 수술 보험금, 실손 청구, 산부인과 비급여"},
    {"slug": "wrist-fracture-colles-guide", "title": "손목 골절(콜레스 골절) 교통사고 후유장해 보상 핵심 가이드", "category": "교통사고 보상 가이드", "specialtyCategory": "정형외과 (OS)", "tags": ["손목골절","콜레스골절","후유장해","교통사고","손해사정"], "keywords": "손목 골절 후유장해, 교통사고 골절 보험금"},
    {"slug": "angina-pectoris-insurance-dispute", "title": "협심증 진단비 분쟁: 보험사 지급 거절 이유와 승소 전략", "category": "보험 분쟁 가이드", "specialtyCategory": "내과 (IM)", "tags": ["협심증","진단비","보험거절","보험분쟁","손해사정"], "keywords": "협심증 진단비 분쟁, 보험금 거절, 심장질환 보험"},
    {"slug": "fibromyoma-mammotome-insurance", "title": "유방 섬유선종 맘모톰 절제술 실손보험 청구 완벽 가이드", "category": "실손보험 분쟁 가이드", "specialtyCategory": "산부인과 (OBGY)", "tags": ["유방섬유선종","맘모톰","실손보험","비급여","유방수술"], "keywords": "맘모톰 절제술 실손보험, 유방 비급여 보험금"},
    {"slug": "scar-laser-pinhole-insurance", "title": "흉터 레이저·핀홀 시술 실손보험 청구: 인정 기준과 거절 대응법", "category": "실손보험 분쟁 가이드", "specialtyCategory": "피부과 (DER) / 성형외과 (PS)", "tags": ["흉터레이저","핀홀시술","실손보험","비급여","피부과"], "keywords": "흉터 레이저 실손보험, 피부과 비급여 청구"},
    {"slug": "urinary-stone-lithotripsy-guide", "title": "요로결석 쇄석술 실손보험 청구: 입원·외래 구분과 청구 전략", "category": "실손보험 분쟁 가이드", "specialtyCategory": "비뇨의학과 (URO)", "tags": ["요로결석","쇄석술","실손보험","비급여","비뇨기과"], "keywords": "요로결석 쇄석술 보험금, 비뇨기과 실손 청구"},
    {"slug": "glaucoma-insurance-guide", "title": "녹내장 레이저·수술 실손보험: 급여 전환 후 달라진 청구 방법", "category": "실손보험 분쟁 가이드", "specialtyCategory": "안과 (OPH)", "tags": ["녹내장","안과레이저","실손보험","급여전환","보험청구"], "keywords": "녹내장 수술 보험금, 안과 실손 청구, 급여 전환"},
]

POSTS_DIR = Path("src/content/posts")


def get_kst_date():
    """KST(UTC+9) 기준 오늘 날짜 반환"""
    kst = datetime.now(timezone(timedelta(hours=9)))
    return kst.strftime("%Y-%m-%d")


def select_topic():
    """아직 작성되지 않은 토픽 선택"""
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    existing = {f.stem for f in POSTS_DIR.glob("*.md")}
    print(f"  기존 포스트: {len(existing)}개")

    available = [t for t in TOPIC_POOL if t["slug"] not in existing]
    if not available:
        idx = int(datetime.now().timestamp() / 86400) % len(TOPIC_POOL)
        return TOPIC_POOL[idx]
    return available[0]


def call_gemini(api_key: str, topic: dict) -> str:
    """Gemini API 호출"""
    prompt = f"""당신은 "보상스쿨"의 현직 신체손해사정사입니다. 10년 이상 보험금 청구 실무 경험을 보유한 전문가입니다.

다음 주제로 구글 E-E-A-T 기준을 충족하는 전문 블로그 포스팅을 작성해주세요.

주제: {topic['title']}
핵심 키워드: {topic['keywords']}
작성일: {get_kst_date()}

## 작성 규칙
1. 길이: 최소 1,500자 이상
2. "안녕하세요! 보상스쿨 손해사정사입니다."로 시작
3. 구조: 도입부 → H2 질환/상황 설명 → H2 보험금 청구 전략 → H2 실전 조언 → 마무리
4. 형식: 순수 마크다운만 사용 (HTML, JSX 금지)
   - 강조: **굵은 글씨**
   - 팁/경고: > 인용구
   - 비교: 마크다운 표
5. 마지막 문단: "본 가이드는 보상스쿨 손해사정사의 실무 경험을 기반으로 작성되었습니다. 개별 사례에 따라 결과가 다를 수 있으므로 정확한 상담은 전문가와 진행하시기 바랍니다."

출력: 마크다운 본문만 출력 (H1 제목 및 프론트매터 제외)"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.75, "maxOutputTokens": 8192}
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    print(f"  API 요청 전송 중... (모델: gemini-2.0-flash)")
    with urllib.request.urlopen(req, timeout=120) as resp:
        status = resp.status
        print(f"  HTTP 상태: {status}")
        data = json.loads(resp.read().decode("utf-8"))

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return text


def save_post(topic: dict, content: str):
    """마크다운 파일로 저장"""
    today = get_kst_date()
    tags_yaml = ",".join(f'"{t}"' for t in topic["tags"])

    # 첫 번째 의미있는 문단을 summary로 사용
    lines = [l.strip() for l in content.split("\n")]
    summary_line = next(
        (l for l in lines if len(l) > 20 and not l.startswith("#") and not l.startswith(">") and not l.startswith("-")),
        topic["title"]
    )
    summary = summary_line[:150].replace('"', "'")

    frontmatter = f"""---
title: "{topic['title']}"
date: "{today}"
summary: "{summary}"
category: "{topic['category']}"
specialtyCategory: "{topic['specialtyCategory']}"
tags: [{tags_yaml}]
published: true
---

{content.strip()}
"""

    file_path = POSTS_DIR / f"{topic['slug']}.md"
    file_path.write_text(frontmatter, encoding="utf-8")
    print(f"  저장 완료: {file_path}")
    return file_path


def main():
    print("=" * 50)
    print("  보상스쿨 자동글쓰기 (Python)")
    print(f"  시각: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 50)

    # [1] API 키 확인
    print("\n[1] GEMINI_API_KEY 확인...")
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or len(api_key) < 10:
        print("  ERROR: GEMINI_API_KEY가 설정되지 않았습니다!")
        print("  GitHub Settings → Secrets → GEMINI_API_KEY 를 확인하세요.")
        sys.exit(1)
    print(f"  OK: {len(api_key)}자 확인됨")

    # [2] 토픽 선택
    print("\n[2] 오늘의 토픽 선택...")
    topic = select_topic()
    print(f"  OK: {topic['slug']}")
    print(f"  제목: {topic['title']}")

    # [3] Gemini API 호출
    print("\n[3] Gemini API 호출 중...")
    try:
        content = call_gemini(api_key, topic)
        print(f"  OK: {len(content)}자 생성됨")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ERROR: HTTP {e.code}")
        print(f"  응답: {body[:500]}")
        sys.exit(1)
    except Exception as e:
        print(f"  ERROR: {type(e).__name__}: {e}")
        sys.exit(1)

    # [4] 파일 저장
    print("\n[4] 마크다운 파일 저장...")
    save_post(topic, content)

    print("\n" + "=" * 50)
    print(f"  완료! {topic['title']}")
    print("=" * 50)


if __name__ == "__main__":
    main()
