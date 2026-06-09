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
      {/* 부모 컨테이너가 flex이고 items-start가 없으므로 aside는 main과 동일한 높이로 늘어남 */}
      <aside className="w-full lg:w-[27%] transition-all duration-300">
        <StickyBox offsetTop={80} offsetBottom={20} className="w-full">
          {sidebarContent}
        </StickyBox>
      </aside>

    </div>
  );
}
