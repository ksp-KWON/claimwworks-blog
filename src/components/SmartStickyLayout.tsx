'use client';

import React from 'react';
import StickyBox from 'react-sticky-box';

interface Props {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export default function SmartStickyLayout({ mainContent, sidebarContent }: Props) {
  return (
    <div className="mx-auto w-full sm:w-[92vw] xl:w-[85vw] max-w-7xl px-0 sm:px-5 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 transition-all duration-300 items-start">
      
      {/* 본문 영역 */}
      <main className="w-full lg:w-[73%] flex-1 min-w-0 transition-all duration-300">
        <StickyBox offsetTop={80} offsetBottom={40}>
          {mainContent}
        </StickyBox>
      </main>

      {/* 사이드바 영역 */}
      <aside className="w-full lg:w-[27%] transition-all duration-300">
        <StickyBox offsetTop={80} offsetBottom={40}>
          {sidebarContent}
        </StickyBox>
      </aside>

    </div>
  );
}
