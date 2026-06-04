"""
generate-blog-post.py - 보상스쿨 자동글쓰기
실패해도 exit(1)하지 않고 오류 내용을 파일에 기록합니다.
"""

import urllib.request
import urllib.error
import json
import os
import sys
import traceback
from datetime import datetime, timezone, timedelta
from pathlib import Path

POSTS_DIR = Path("src/content/posts")
DEBUG_LOG  = Path("scripts/debug-output.txt")

TOPIC_POOL = [
    {"slug": "rotator-cuff-tear-insurance-guide",            "title": "회전근개 파열 보험금 청구 가이드: 수술 후 후유장해 보상 핵심 전략",         "category": "병원 보상 가이드",        "specialtyCategory": "정형외과 (OS)",            "tags": ["회전근개파열","어깨수술","후유장해","실손보험","손해사정"],       "keywords": "회전근개 파열, 어깨 MRI, 실손보험, 후유장해 보험금"},
    {"slug": "herniated-disc-compensation-guide",            "title": "목·허리디스크(추간판탈출증) 교통사고 보상 완벽 가이드",                       "category": "교통사고 보상 가이드",    "specialtyCategory": "신경외과 (NS)",            "tags": ["목디스크","허리디스크","추간판탈출증","교통사고합의금","손해사정"],"keywords": "디스크 교통사고, 추간판탈출증, 신경외과, 후유장해"},
    {"slug": "cataract-multifocal-lens-insurance-dispute",   "title": "백내장 다초점렌즈 실손보험 분쟁: 보험금 받는 방법과 주의사항",                "category": "실손보험 분쟁 가이드",    "specialtyCategory": "안과 (OPH)",               "tags": ["백내장","다초점렌즈","실손보험","비급여","보험분쟁"],             "keywords": "백내장 실손보험, 다초점렌즈 보험금, 안과 비급여"},
    {"slug": "uterine-fibroid-hifu-insurance",               "title": "자궁근종 하이푸(HIFU) 시술 실손보험 청구 가이드",                             "category": "실손보험 분쟁 가이드",    "specialtyCategory": "산부인과 (OBGY)",          "tags": ["자궁근종","하이푸","HIFU","실손보험","비급여청구"],               "keywords": "자궁근종 하이푸 보험, 실손보험 청구, 산부인과 비급여"},
    {"slug": "meniscus-tear-compensation-guide",             "title": "반월상연골판 파열 보험금: 수술 여부에 따른 후유장해 보상 전략",                 "category": "병원 보상 가이드",        "specialtyCategory": "정형외과 (OS)",            "tags": ["반월상연골판","무릎수술","관절경","후유장해","손해사정"],         "keywords": "반월상연골판 파열, 무릎 MRI, 관절경 수술, 보험금"},
    {"slug": "spinal-stenosis-insurance-guide",              "title": "척추관협착증 비수술·수술 보상 비교: 실손보험 & 후유장해 완벽 정리",           "category": "병원 보상 가이드",        "specialtyCategory": "신경외과 (NS)",            "tags": ["척추관협착증","비수술치료","후유장해","실손보험","손해사정"],     "keywords": "척추관협착증 실손보험, 비수술 치료, 후유장해 보험금"},
    {"slug": "acute-myocardial-infarction-insurance",        "title": "급성 심근경색증 보험금: 진단비·수술비·후유장해 한번에 정리",                   "category": "병원 보상 가이드",        "specialtyCategory": "내과 (IM)",                "tags": ["심근경색","진단비","수술비","보험금청구","손해사정"],             "keywords": "심근경색 보험금, 진단비 청구, 심장수술 후유장해"},
    {"slug": "traffic-accident-settlement-amount-guide",     "title": "교통사고 합의금 계산법: 손해사정사가 알려주는 정당한 금액 산정 기준",          "category": "교통사고 보상 가이드",    "specialtyCategory": "신경외과 (NS)",            "tags": ["교통사고합의금","합의금계산","손해사정","보험사협상","치료비"],   "keywords": "교통사고 합의금 계산, 손해배상, 보험금 산정"},
    {"slug": "achilles-tendon-rupture-guide",                "title": "아킬레스건 파열 후 보험금 청구: 수술·재활 후 후유장해 보상 핵심",              "category": "병원 보상 가이드",        "specialtyCategory": "정형외과 (OS)",            "tags": ["아킬레스건파열","발목수술","후유장해","실손보험","손해사정"],     "keywords": "아킬레스건 파열, 수술 후 재활, 후유장해 보험금"},
    {"slug": "do-su-therapy-insurance-dispute",              "title": "도수치료 실손보험 분쟁 완벽 가이드: 거절 이유와 대응 전략",                    "category": "실손보험 분쟁 가이드",    "specialtyCategory": "피부과 (DER) / 성형외과 (PS)", "tags": ["도수치료","실손보험","비급여","보험분쟁","보험거절"],           "keywords": "도수치료 실손보험, 비급여 치료, 보험금 거절 대응"},
    {"slug": "prior-disease-contribution-ratio-guide",       "title": "기왕증(사고 전 질병) 기여도 분쟁: 보험사에 맞서는 대응 전략",                 "category": "보험 분쟁 가이드",        "specialtyCategory": "내과 (IM)",                "tags": ["기왕증","기여도","보험분쟁","손해사정","교통사고"],               "keywords": "기왕증 기여도, 보험금 삭감, 분쟁 해결"},
    {"slug": "traffic-accident-medical-cost-guide",          "title": "교통사고 치료비 전액 받는 방법: 자동차보험 지불보증 완전 정복",                 "category": "교통사고 보상 가이드",    "specialtyCategory": "정형외과 (OS)",            "tags": ["지불보증","자동차보험","교통사고치료비","손해사정","보험처리"],   "keywords": "교통사고 지불보증, 치료비 청구, 자동차보험"},
    {"slug": "loss-adjuster-role-guide",                     "title": "손해사정사가 하는 일: 보험금을 제대로 받기 위한 전문가 활용법",                "category": "손해사정 가이드",         "specialtyCategory": "정형외과 (OS)",            "tags": ["손해사정사","보험전문가","보험금청구","독립손해사정","보상가이드"],"keywords": "손해사정사 역할, 독립 손해사정사, 보험금 청구 도움"},
]


def get_kst_date():
    kst = datetime.now(timezone(timedelta(hours=9)))
    return kst.strftime("%Y-%m-%d")


def write_debug(lines):
    """오류 내용을 debug-output.txt에 기록 (커밋되면 내용 확인 가능)"""
    DEBUG_LOG.parent.mkdir(parents=True, exist_ok=True)
    text = "\n".join(str(l) for l in lines)
    DEBUG_LOG.write_text(text, encoding="utf-8")
    print(text)


def select_topic():
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    existing = {f.stem for f in POSTS_DIR.glob("*.md")}
    available = [t for t in TOPIC_POOL if t["slug"] not in existing]
    return available[0] if available else TOPIC_POOL[0]


def call_gemini(api_key, topic):
    prompt = (
        '당신은 "보상스쿨"의 현직 신체손해사정사입니다. '
        '다음 주제로 E-E-A-T 기준의 전문 블로그 포스팅을 작성해주세요.\n\n'
        f'주제: {topic["title"]}\n'
        f'핵심 키워드: {topic["keywords"]}\n\n'
        '## 규칙\n'
        '1. 1,500자 이상\n'
        '2. "안녕하세요! 보상스쿨 손해사정사입니다."로 시작\n'
        '3. 구조: 도입부 > H2 질환설명 > H2 청구전략 > H2 실전조언 > 마무리\n'
        '4. 순수 마크다운만 사용 (HTML/JSX 절대 금지)\n'
        '5. 마지막: "본 가이드는 보상스쿨 손해사정사의 실무 경험을 기반으로 작성되었습니다."\n\n'
        '출력: 마크다운 본문만 (H1, 프론트매터 제외)'
    )

    url = (
        "https://generativelanguage.googleapis.com"
        "/v1beta/models/gemini-1.5-flash:generateContent"
        f"?key={api_key}"
    )
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.75, "maxOutputTokens": 8192}
    }).encode("utf-8")

    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read().decode("utf-8"))

    return data["candidates"][0]["content"]["parts"][0]["text"]


def save_post(topic, content):
    today = get_kst_date()
    tags  = ",".join(f'"{t}"' for t in topic["tags"])
    lines = [l.strip() for l in content.split("\n")]
    summ  = next((l for l in lines if len(l) > 20
                  and not l.startswith("#")
                  and not l.startswith(">")
                  and not l.startswith("-")), topic["title"])
    summary = summ[:150].replace('"', "'")

    md = (
        f'---\n'
        f'title: "{topic["title"]}"\n'
        f'date: "{today}"\n'
        f'summary: "{summary}"\n'
        f'category: "{topic["category"]}"\n'
        f'specialtyCategory: "{topic["specialtyCategory"]}"\n'
        f'tags: [{tags}]\n'
        f'published: true\n'
        f'---\n\n'
        f'{content.strip()}\n'
    )
    fp = POSTS_DIR / f'{topic["slug"]}.md'
    fp.write_text(md, encoding="utf-8")
    print(f"저장 완료: {fp}")


def main():
    now = datetime.now(timezone.utc).isoformat()
    print(f"=== 자동글쓰기 시작 {now} ===")

    # ── API 키 확인 ──
    api_key = os.environ.get("GEMINI_API_KEY", "")
    key_len = len(api_key)
    print(f"GEMINI_API_KEY 길이: {key_len}자")

    if key_len < 10:
        write_debug([
            f"실행시각: {now}",
            f"오류 원인: GEMINI_API_KEY가 비어있거나 너무 짧습니다 ({key_len}자)",
            "해결: GitHub Settings > Secrets > GEMINI_API_KEY 등록 필요",
        ])
        sys.exit(1)

    # ── 토픽 선택 ──
    topic = select_topic()
    print(f"토픽: {topic['slug']}")

    # ── API 호출 ──
    print("Gemini API 호출 중...")
    try:
        content = call_gemini(api_key, topic)
        print(f"생성 완료: {len(content)}자")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        write_debug([
            f"실행시각: {now}",
            f"오류 원인: Gemini API HTTP {e.code}",
            f"API 키 길이: {key_len}자",
            f"응답 내용: {body[:2000]}",
        ])
        sys.exit(1)
    except Exception as e:
        write_debug([
            f"실행시각: {now}",
            f"오류 종류: {type(e).__name__}",
            f"오류 메시지: {e}",
            f"스택:\n{traceback.format_exc()}",
        ])
        sys.exit(1)

    # ── 파일 저장 ──
    save_post(topic, content)

    # 성공 시 기존 디버그 파일 삭제
    if DEBUG_LOG.exists():
        DEBUG_LOG.unlink()

    print("=== 완료 ===")


if __name__ == "__main__":
    main()
