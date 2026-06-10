"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import StickyBox from "react-sticky-box";

interface Props {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export default function SmartStickyLayout({ mainContent, sidebarContent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number>(0);

  useEffect(() => {
    // 폰트나 비동기 리소스가 로드된 후 StickyBox가 높이를 다시 계산하도록 강제 트리거
    if (document.fonts) {
      document.fonts.ready.then(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }

    // 사이드바 컨텐츠의 실제 높이를 추적하여, StickyBox가 absolute로 변환될 때 부모 레이아웃이 붕괴되는 현상을 원천 차단
    if (!sidebarContentRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === sidebarContentRef.current) {
          setMinHeight(entry.contentRect.height);
        }
      }
    });

    resizeObserver.observe(sidebarContentRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ minHeight: minHeight > 0 ? `${minHeight}px` : 'auto' }}
      className="mx-auto w-full sm:w-[92vw] xl:w-[85vw] max-w-7xl px-0 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8"
    >
      
      {/* 본문 영역 */}
      <main className="w-full lg:w-[73%] flex-1 min-w-0 transition-all duration-300">
        {mainContent}
      </main>

      {/* 사이드바 영역 */}
      <aside className="w-full lg:w-[27%] relative transition-all duration-300">
        <StickyBox offsetTop={80} offsetBottom={20} className="w-full">
          <div ref={sidebarContentRef}>
            {sidebarContent}
          </div>
        </StickyBox>
      </aside>

    </div>
  );
}
