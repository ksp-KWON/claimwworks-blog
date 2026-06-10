"use client";

import React, { ReactNode } from "react";

interface Props {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export default function SmartStickyLayout({ mainContent, sidebarContent }: Props) {
  return (
    <div className="mx-auto w-full sm:w-[92vw] xl:w-[85vw] max-w-7xl px-0 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8 flex-1">
      
      {/* 본문 영역 */}
      <main className="w-full lg:w-[73%] flex-1 min-w-0 transition-all duration-300">
        {mainContent}
      </main>

      {/* 사이드바 영역 */}
      <aside className="w-full lg:w-[27%] lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto custom-scrollbar transition-all duration-300">
        {sidebarContent}
      </aside>

    </div>
  );
}
