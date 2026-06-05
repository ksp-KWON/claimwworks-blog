"use client";

/**
 * CardTitleMarquee
 * 블로그 카드 제목이 한 줄을 넘칠 때만 우→좌 무한 슬라이드.
 * 넘치지 않으면 그냥 한 줄로 고정 표시.
 */

import { useRef, useEffect, useState } from "react";

interface CardTitleMarqueeProps {
  title: string;
  className?: string;
}

export default function CardTitleMarquee({ title, className = "" }: CardTitleMarqueeProps) {
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
  }, [title]);

  return (
    <div ref={containerRef} className="overflow-hidden">
      {overflow ? (
        <div className="animate-marquee">
          <span className={`whitespace-nowrap pr-12 shrink-0 ${className}`}>{title}</span>
          <span className={`whitespace-nowrap pr-12 shrink-0 ${className}`} aria-hidden="true">{title}</span>
        </div>
      ) : (
        <span ref={textRef} className={`block whitespace-nowrap ${className}`}>{title}</span>
      )}
    </div>
  );
}
