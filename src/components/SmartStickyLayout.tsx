"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import StickyBox from "react-sticky-box";

interface Props {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export default function SmartStickyLayout({ mainContent, sidebarContent }: Props) {
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
          // 높이가 변하면 StickyBox가 경계를 다시 계산하도록 이벤트를 발생시킵니다.
          window.dispatchEvent(new Event('resize'));
        }
      }
    });

    resizeObserver.observe(sidebarContentRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      className="mx-auto w-full sm:w-[92vw] xl:w-[85vw] max-w-7xl px-0 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8"
      style={{ minHeight: minHeight > 0 ? `${minHeight}px` : 'auto' }}
    >
      
      {/* 본문 영역 */}
      <main className="w-full lg:w-[73%] flex-1 min-w-0 transition-all duration-300">
        {mainContent}
      </main>

      {/* 사이드바 영역 */}
      {/* Flex 컨테이너의 min-height가 자식 요소로 제대로 전파되지 않는 버그(Safari 등)를 막기 위해 aside에도 직접 minHeight를 적용합니다. */}
      <aside 
        className="w-full lg:w-[27%] relative transition-all duration-300"
        style={{ minHeight: minHeight > 0 ? `${minHeight}px` : 'auto' }}
      >
        {/* key에 minHeight를 주어 컨텐츠 높이가 크게 변할 때마다 StickyBox를 아예 초기화시켜버림으로써 경계 계산 오류를 원천 차단합니다. */}
        <StickyBox key={`sticky-${minHeight}`} offsetTop={80} offsetBottom={20} className="w-full">
          <div ref={sidebarContentRef}>
            {sidebarContent}
          </div>
        </StickyBox>
      </aside>

    </div>
  );
}
