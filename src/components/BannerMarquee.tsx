"use client";

/**
 * BannerMarquee
 *
 * 배너 카드 내 제목을 위한 마퀴(흘러가는 텍스트) 컴포넌트.
 * - 항상 마퀴 애니메이션 실행 (overflow 감지 없음)
 * - 다크모드에서 가독성 좋은 흰색 텍스트 적용
 */

interface BannerMarqueeProps {
  /** 배너에 표시할 텍스트 */
  text: string;
  /** 호버 시 적용할 색상 Tailwind 클래스 */
  hoverColorClass?: string;
}

export default function BannerMarquee({
  text,
  hoverColorClass = "group-hover:text-[var(--google-blue)]",
}: BannerMarqueeProps) {
  return (
    <div className="min-w-0 overflow-hidden">
      <div className="animate-marquee-sm">
        {/* 원본 텍스트 */}
        <span
          className={`text-sm font-bold text-[#202124] dark:text-[#e8eaed] ${hoverColorClass} transition-colors whitespace-nowrap pr-8 shrink-0`}
        >
          {text}
        </span>
        {/* 끊김 없는 루프를 위한 복사본 (스크린리더에서 숨김) */}
        <span
          className={`text-sm font-bold text-[#202124] dark:text-[#e8eaed] ${hoverColorClass} transition-colors whitespace-nowrap pr-8 shrink-0`}
          aria-hidden="true"
        >
          {text}
        </span>
      </div>
    </div>
  );
}
