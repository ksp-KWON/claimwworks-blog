"use client";

/**
 * BannerMarquee
 * 텍스트가 컨테이너 너비를 넘칠 때만 무한 슬라이드(marquee) 실행.
 * 평소에는 고정 텍스트로 보이고, 넘칠 때만 우→좌 방향으로 흐릅니다.
 */

import { useRef, useEffect, useState } from "react";

interface BannerMarqueeProps {
  text: string;
  className?: string;
}

export default function BannerMarquee({ text, className = "" }: BannerMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const check = () => {
      if (containerRef.current && textRef.current) {
        setOverflow(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  return (
    <div ref={containerRef} className="min-w-0 overflow-hidden">
      {overflow ? (
        /* 넘칠 때: 무한 슬라이드 */
        <div className="animate-marquee-sm">
          <span className={`whitespace-nowrap pr-8 shrink-0 ${className}`}>{text}</span>
          <span className={`whitespace-nowrap pr-8 shrink-0 ${className}`} aria-hidden="true">{text}</span>
        </div>
      ) : (
        /* 평소: 고정 */
        <span ref={textRef} className={`block whitespace-nowrap truncate ${className}`}>{text}</span>
      )}
    </div>
  );
}
