"use client";

import React, { ReactNode } from "react";
import StickyBox from "react-sticky-box";

interface Props {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export default function SmartStickyLayout({ mainContent, sidebarContent }: Props) {
  return (
    <div className="mx-auto w-full sm:w-[92vw] xl:w-[85vw] max-w-7xl px-0 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
      
      {/* 본문 영역 */}
      <main className="w-full lg:w-[73%] flex-1 min-w-0 transition-all duration-300">
        {mainContent}
      </main>

      {/* 사이드바 영역 */}
      {/* react-sticky-box가 트랙의 하단에 도달했을 때 absolute 속성으로 고정되는데, 이때 부모에 relative가 없으면 문서 전체를 기준으로 튕겨나가 푸터를 침범합니다. 반드시 relative가 필요합니다. */}
      <aside className="w-full lg:w-[27%] relative transition-all duration-300">
        <StickyBox offsetTop={80} offsetBottom={20} className="w-full">
          {sidebarContent}
        </StickyBox>
      </aside>

    </div>
  );
}
