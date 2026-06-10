'use client';

/**
 * BlogPostContent.tsx
 * 블로그 포스팅 본문 렌더링 클라이언트 컴포넌트
 * - Key Points 박스 (최상단, Google Blue 톤)
 * - 클린 TOC (DOM에서 직접 읽어 ID 100% 일치 보장)
 * - 본문에서 중복 섹션(목차/요약/체크리스트/FAQ/CTA) 자동 제거
 * - 자가진단 인터랙티브 체크리스트
 * - FAQ 아코디언
 * - CTA 배너 (헤더 배너 스타일 + 그림자)
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Components } from 'react-markdown';
import AutoCalculatorContainer from './calculator/auto/AutoCalculatorContainer';
import MedicalCalculator from './calculator/MedicalCalculator';

// ─── 스크롤 오프셋: header(64) + sticky banner(52) + 버퍼(20) = 136px ───
const SCROLL_OFFSET = 140;

// ─── 본문에서 식별할 섹션 패턴 ───
const KEY_POINT_PATTERNS = /(?:핵심\s*요약|key\s*point)/i;
const CHECKLIST_PATTERNS = /(?:자가진단|체크리스트)/i;
const FAQ_PATTERNS = /(?:faq|자주\s*묻는)/i;
const CTA_PATTERNS = /(?:카카오톡|call\s*to\s*action|상담\s*신청)/i;

// ─── 핵심 요약 추출 ───
function extractKeyPoints(content: string): string[] {
  const lines = content.split('\n');
  const points: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed) && KEY_POINT_PATTERNS.test(trimmed)) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (/^#{1,2}\s/.test(trimmed)) break; // Stop at next H1/H2
      if (/\[SEO_SUMMARY\]/.test(trimmed)) break;
      
      if (/^[-*]/.test(trimmed) && !/---/.test(trimmed)) {
        points.push(trimmed.replace(/^[-*]\s*/, '').replace(/^[🛡️💡✅☑️⭐]+\s*/, '').trim());
      }
    }
  }
  return points.slice(0, 3);
}

// ─── 체크리스트 추출 ───
function extractChecklist(content: string): string[] {
  const lines = content.split('\n');
  const items: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed) && CHECKLIST_PATTERNS.test(trimmed)) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (/^#{1,2}\s/.test(trimmed)) break; // Stop at next H1/H2
      if (/\[SEO_SUMMARY\]/.test(trimmed)) break;
      
      if (/^[-*]/.test(trimmed) || /^[☑️✅]/.test(trimmed)) {
        const text = trimmed.replace(/^[-*]\s*/, '').replace(/^\[[ x]\]\s*/i, '').replace(/^[☑️✅]\s*/, '').trim();
        if (text && !/---/.test(text)) items.push(text);
      }
    }
  }
  return items;
}

// ─── FAQ 추출 ───
function extractFAQ(content: string): { q: string; a: string }[] {
  const lines = content.split('\n');
  const faqs: { q: string; a: string }[] = [];
  let inSection = false;
  let currentQ = '';
  let currentA = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed) && FAQ_PATTERNS.test(trimmed)) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (/^#{1,2}\s/.test(trimmed)) break; // Stop at H1 or H2
      if (/\[SEO_SUMMARY\]/.test(trimmed)) break;

      if (/^###\s+/.test(trimmed)) {
        if (currentQ) faqs.push({ q: currentQ, a: currentA.trim() });
        currentQ = trimmed.replace(/^###\s*/, '').trim();
        currentA = '';
      } else if (currentQ) {
        if (trimmed === '---') continue; // 마크다운 구분선(---)은 답변 내용에서 제외
        currentA += line + '\n';
      }
    }
  }
  if (currentQ) faqs.push({ q: currentQ, a: currentA.trim() });
  return faqs;
}

// ─── 본문 전처리: 특수 섹션 완벽 제거 ───
function preprocessBody(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let skipType: 'NONE' | 'KEY_POINTS' | 'CHECKLIST' | 'FAQ' | 'CTA' = 'NONE';

  for (const line of lines) {
    const trimmed = line.trim();

    // 1. Check if heading starts a skip section
    if (/^##\s+/.test(trimmed)) {
      if (KEY_POINT_PATTERNS.test(trimmed)) { skipType = 'KEY_POINTS'; continue; }
      if (CHECKLIST_PATTERNS.test(trimmed)) { skipType = 'CHECKLIST'; continue; }
      if (FAQ_PATTERNS.test(trimmed)) { skipType = 'FAQ'; continue; }
      if (CTA_PATTERNS.test(trimmed)) { skipType = 'CTA'; continue; }
    }

    // 2. Check if we should STOP skipping
    if (skipType === 'KEY_POINTS') {
      if (trimmed !== '' && !/^[-*]/.test(trimmed) && !/^#/.test(trimmed)) skipType = 'NONE';
      else if (/^#/.test(trimmed)) skipType = 'NONE';
    } else if (skipType === 'CHECKLIST') {
      if (trimmed !== '' && !/^[-*]/.test(trimmed) && !/^[☑️✅]/.test(trimmed) && !/^#/.test(trimmed)) skipType = 'NONE';
      else if (/^#/.test(trimmed)) skipType = 'NONE';
    } else if (skipType === 'FAQ') {
      if (/^#{1,2}\s/.test(trimmed)) skipType = 'NONE';
    } else if (skipType === 'CTA') {
      if (/^#{1,2}\s/.test(trimmed)) skipType = 'NONE';
    }

    // 3. Process line
    if (skipType === 'NONE') {
      result.push(line);
    }
  }

  return result
    .join('\n')
    .replace(/\[SEO_SUMMARY\]:.*/gi, '')
    .replace(/\[[^\]]*(?:카카오|상담)[^\]]*\]\([^)]*\)/g, '')
    .trim();
}

// ─── 인터페이스 ───
interface TOCItem { id: string; text: string; }
interface BlogPostContentProps { content: string; }

// ════════════════════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ════════════════════════════════════════════════════════════════════════════
export default function BlogPostContent({ content }: BlogPostContentProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState('');

  const keyPoints    = extractKeyPoints(content);
  const checklistItems = extractChecklist(content);
  const faqItems     = extractFAQ(content);
  const bodyContent  = preprocessBody(content);

  // ── DOM에서 실제 h2[id] 읽어 TOC 생성 (ID 100% 일치 보장) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll<HTMLHeadingElement>('[data-blog-body] h2[id]');
      const items = Array.from(headings).map(h => ({
        id: h.id,
        text: (h.textContent || '')
          .trim()
          .replace(/^\d+\.\s*/, '')
          .replace(/[💡🛡️✅☑️]/g, '')
          .trim(),
      }));
      setToc(items);
    }, 150);
    return () => clearTimeout(timer);
  }, [bodyContent]);

  // ── 스크롤 위치 추적 ──
  useEffect(() => {
    const onScroll = () => {
      const headings = document.querySelectorAll('[data-blog-body] h2[id]');
      let current = '';
      headings.forEach(h => {
        if (h.getBoundingClientRect().top < SCROLL_OFFSET + 10) current = h.id;
      });
      setActiveId(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTOCClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: 'smooth',
      });
    }
  };

  // ── 마크다운 커스텀 컴포넌트 ──
  const components: Components = {
    h2: ({ children, id }) => (
      <h2
        id={id}
        style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
        className="text-[20px] sm:text-[22px] font-bold text-gray-900 dark:text-[#e8eaed] mt-14 mb-6 px-5 py-4 sm:px-6 bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3.5 tracking-tight break-keep"
      >
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#fce8e6] dark:bg-[#d93025]/20 flex items-center justify-center shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d93025]" />
        </span>
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id}
        style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
        className="inline-flex items-center text-[16px] font-bold text-gray-800 dark:text-[#e8eaed] mt-8 mb-4 px-4 py-2 bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-full tracking-tight break-keep shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      >
        <span className="text-[#d93025] mr-2 opacity-80 text-[15px] font-extrabold">#</span>
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <div className="my-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-start gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#34A853]" />
        <div className="text-[15px] text-gray-800 dark:text-[#e8eaed] leading-[1.8] [&>p]:m-0 flex-1">{children}</div>
      </div>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-8 rounded-xl border border-[#e0e0e0] dark:border-[#5f6368] shadow-sm">
        <table className="w-full text-[14px] border-collapse">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="bg-[#E8F0FE] dark:bg-[#1A73E8]/20 p-3.5 text-left font-bold text-[#1A73E8] dark:text-[#8ab4f8] border-b border-[#dadce0]">{children}</th>
    ),
    td: ({ children }) => (
      <td className="p-3.5 border-b border-[#f1f3f4] dark:border-[#3c4043] align-top text-[#202124] dark:text-[#e8eaed]">{children}</td>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-[#f8f9fa] dark:hover:bg-[#303134]/50 transition-colors">{children}</tr>
    ),
    a: ({ href = '', children }) => (
      <a
        href={href}
        className="inline-flex items-center gap-2 px-3 py-1.5 mx-1 my-1 align-middle bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(26,115,232,0.18)] hover:border-[#1A73E8]/40 dark:hover:border-[#8ab4f8]/40 transition-all duration-300 hover:-translate-y-[2px] text-[#1A73E8] dark:text-[#8ab4f8] font-bold text-[14.5px] group no-underline break-keep"
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-[#1A73E8] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </span>
        <span className="leading-[1.4] mt-[1px]">{children}</span>
        <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" /></svg>
      </a>
    ),
    p: ({ children }) => (
      <p className="mb-5 leading-[1.85] text-[#202124] dark:text-[#e8eaed]">{children}</p>
    ),
    li: ({ children }) => <li className="my-1.5 leading-[1.8]">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-bold text-[#1A73E8] dark:text-[#8ab4f8]">{children}</strong>
    ),
    hr: () => (
      <div className="my-16 flex items-center justify-center gap-4">
        <div className="w-24 h-px bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#d93025]" />
        <div className="w-24 h-px bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600" />
      </div>
    ),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalComponents: any = {
    ...components,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calculator: ({ ...props }: any) => {
      const isAuto = props.type === 'auto';
      const isMedical = props.type === 'medical';
      
      if (!isAuto && !isMedical) return null;

      return (
        <div className="my-12 relative w-full mx-auto">
          {/* 가상의 기기/스마트폰(태블릿 가로모드) 프레임 */}
          <div className="bg-[#f0f0f0] dark:bg-[#2c2d30] rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#e0e0e0] dark:border-[#3a3b3e]">
            {/* 내부 스크린 */}
            <div className="bg-white dark:bg-[#202124] rounded-[16px] sm:rounded-[24px] overflow-hidden flex flex-col h-full border border-gray-200 dark:border-[#424346] shadow-inner">
              
              {/* 상단 앱 상태바 / 맥OS 스타일 버튼 */}
              <div className="bg-[#f8f9fa] dark:bg-[#303134] px-4 py-3 border-b border-gray-200 dark:border-[#424346] flex items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
                </div>
                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                  BOSANG SCHOOL PRO
                </div>
                <div className="w-10"></div> {/* 우측 여백 맞춤용 */}
              </div>

              {/* 실제 계산기 렌더링 컨테이너 (세로폭 제한, 가로모드 느낌) */}
              <div className="p-1 sm:p-2 overflow-y-auto h-[450px] sm:h-[500px] custom-scrollbar bg-gray-50 dark:bg-black/20">
                {isAuto ? <AutoCalculatorContainer /> : <MedicalCalculator />}
              </div>

            </div>
          </div>
        </div>
      );
    },
    red: ({ children }: { children: React.ReactNode }) => <strong className="text-[#d93025] dark:text-[#f28b82] font-bold">{children}</strong>,
    orange: ({ children }: { children: React.ReactNode }) => <strong className="text-[#f29900] dark:text-[#fde293] font-bold">{children}</strong>,
    green: ({ children }: { children: React.ReactNode }) => <strong className="text-[#34A853] dark:text-[#81c995] font-bold">{children}</strong>,
    blue: ({ children }: { children: React.ReactNode }) => <strong className="text-[#1A73E8] dark:text-[#8ab4f8] font-bold">{children}</strong>,
    purple: ({ children }: { children: React.ReactNode }) => <strong className="text-[#9333ea] dark:text-[#c084fc] font-bold">{children}</strong>,
    hr1: () => (
      <div className="my-16 flex items-center justify-center gap-4">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
      </div>
    ),
    hr2: () => (
      <div className="my-16 flex justify-center">
        <div className="w-24 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>
    ),
    hr3: () => (
      <div className="my-16 flex items-center justify-center gap-4">
        <div className="w-24 h-px bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#d93025]" />
        <div className="w-24 h-px bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600" />
      </div>
    ),
  };

  return (
    <div>
      {/* 1. Key Points (최상단) */}
      {keyPoints.length > 0 && <KeyPointsBox points={keyPoints} />}

      {/* 2. 목차 */}
      {toc.length > 0 && (
        <TOCNav toc={toc} activeId={activeId} onItemClick={handleTOCClick} />
      )}

      {/* 3. 본문 */}
      <div data-blog-body>
        <ReactMarkdown
          remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={finalComponents}
        >
          {bodyContent}
        </ReactMarkdown>
      </div>

      {/* 4. 자가진단 체크리스트 */}
      {checklistItems.length > 0 && <ChecklistBox items={checklistItems} />}

      {/* 5. FAQ */}
      {faqItems.length > 0 && <FAQBox items={faqItems} />}

      {/* 6. CTA 배너 */}
      <CTABanner />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Key Points 박스 — Google Blue 톤
// ════════════════════════════════════════════════════════════════════════════
function KeyPointsBox({ points }: { points: string[] }) {
  return (
    <div className="mb-10 rounded-2xl overflow-hidden bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A73E8]" />
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#1A73E8] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-[13px] font-extrabold text-gray-900 dark:text-white uppercase tracking-[0.1em]">Key Points</span>
      </div>
      <ul className="px-6 py-5 space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-[#e8f0fe] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#8ab4f8] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span
              className="text-[15px] text-gray-800 dark:text-[#e8eaed] leading-[1.7]"
              dangerouslySetInnerHTML={{
                __html: point.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#1A73E8">$1</strong>'),
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOC — 박스 없는 클린 라인 스타일
// ════════════════════════════════════════════════════════════════════════════
function TOCNav({
  toc,
  activeId,
  onItemClick,
}: {
  toc: TOCItem[];
  activeId: string;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  if (!toc.length) return null;
  return (
    <nav className="mb-14 rounded-2xl overflow-hidden bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#d93025]" />
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#fce8e6] dark:bg-[#d93025]/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#d93025] dark:text-[#f28b82]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <span className="text-[13px] font-extrabold text-gray-900 dark:text-white uppercase tracking-[0.1em]">이 글의 목차</span>
      </div>

      <ul className="px-6 py-5 space-y-3">
        {toc.map((item, i) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => onItemClick(e, item.id)}
                className="group flex items-start gap-3.5 w-full"
              >
                <span className={`w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0 mt-[2px] transition-colors ${
                  isActive
                    ? 'bg-[#d93025] text-white shadow-sm'
                    : 'bg-[#fce8e6] dark:bg-[#d93025]/20 text-[#d93025] dark:text-[#f28b82] group-hover:bg-[#d93025] group-hover:text-white'
                }`}>
                  {i + 1}
                </span>
                
                <span className={`text-[15px] leading-[1.7] break-keep transition-colors ${
                  isActive 
                    ? 'font-bold text-[#d93025] dark:text-[#f28b82]' 
                    : 'font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#d93025] dark:group-hover:text-[#f28b82]'
                }`}>
                  {item.text}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 자가진단 체크리스트
// ════════════════════════════════════════════════════════════════════════════
function ChecklistBox({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
  const count = checked.filter(Boolean).length;
  const pct = Math.round((count / items.length) * 100);

  return (
    <div className="my-12 rounded-2xl overflow-hidden bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#34A853]" />
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#e6f4ea] dark:bg-[#34A853]/20 flex items-center justify-center shrink-0">
            <span className="text-xl">🛡️</span>
          </div>
          <div>
            <p className="font-extrabold text-gray-900 dark:text-white text-[16px] tracking-tight">
              내 보험금 자가진단
            </p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              해당 항목을 클릭해 체크해 보세요
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#34A853] dark:text-[#81c995]">
            {count}<span className="text-sm font-bold text-gray-400 dark:text-gray-500">/{items.length}</span>
          </p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-gray-100 dark:bg-white/5">
        <div
          className="h-full bg-[#34A853] transition-all duration-500 rounded-r-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 항목들 */}
      <div className="bg-white dark:bg-[#202124] divide-y divide-gray-100 dark:divide-white/5">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              const next = [...checked];
              next[i] = !next[i];
              setChecked(next);
            }}
            className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${
              checked[i]
                ? 'bg-gray-50 dark:bg-white/[0.02]'
                : 'hover:bg-gray-50 dark:hover:bg-[#303134]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                checked[i]
                  ? 'bg-[#34A853] border-[#34A853]'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {checked[i] && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className={`text-[15px] leading-relaxed break-keep transition-colors ${
                checked[i]
                  ? 'text-[#34A853] dark:text-[#81c995] font-bold line-through opacity-80'
                  : 'text-gray-800 dark:text-[#e8eaed] font-medium'
              }`}
            >
              {item}
            </span>
          </button>
        ))}
      </div>

      {/* 결과 메시지 */}
      {count >= 3 && (
        <div className="bg-[#e6f4ea] dark:bg-[#34A853]/10 border-t border-[#34A853]/20 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-[#137333] dark:text-[#81c995] text-[14px] font-semibold leading-relaxed">
            <strong className="font-extrabold">{count}개 이상 해당</strong>됩니다. 청구 가능한 보험금이 남아있을 가능성이 높으니 전문가 무료 진단을 받아보세요.
          </p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAQ 아코디언
// ════════════════════════════════════════════════════════════════════════════
function FAQBox({ items }: { items: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="my-12 rounded-2xl overflow-hidden bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#7C4DFF]" />
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-[#EDE7F6] dark:bg-[#7C4DFF]/20 flex items-center justify-center shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <p className="font-extrabold text-gray-900 dark:text-white text-[16px] tracking-tight">
            자주 묻는 질문 FAQ TOP {items.length}
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            항목을 클릭하면 답변을 확인할 수 있습니다
          </p>
        </div>
      </div>

      {/* 항목들 */}
      <div className="bg-white dark:bg-[#202124] divide-y divide-gray-100 dark:divide-white/5">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center gap-4 px-6 py-4.5 text-left hover:bg-gray-50 dark:hover:bg-[#303134] transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[13px] font-bold flex items-center justify-center shrink-0 transition-colors">
                Q{i + 1}
              </span>
              <span className={`flex-1 text-[15px] transition-colors break-keep ${openIdx === i ? 'font-extrabold text-[#7C4DFF] dark:text-[#ce93d8]' : 'font-semibold text-gray-800 dark:text-[#e8eaed]'}`}>
                {item.q}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openIdx === i ? 'rotate-180 text-[#7C4DFF]' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openIdx === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 pb-6 pt-2">
                <div className="flex gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                  <span className="w-8 h-8 rounded-full bg-[#7C4DFF] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                    A
                  </span>
                  <div
                    className="text-[14.5px] text-gray-700 dark:text-gray-300 leading-[1.8] flex-1 break-keep"
                    dangerouslySetInnerHTML={{
                      __html: item.a.replace(
                        /\*\*(.+?)\*\*/g,
                        '<strong style="font-weight:800;color:#202124" class="dark:text-white">$1</strong>'
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CTA 배너 — 헤더 배너 스타일 그대로 + 그림자 입체감
// ════════════════════════════════════════════════════════════════════════════
function CTABanner() {
  return (
    <div className="mt-12 mb-4">
      {/* 캐치 문구 */}
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-[#d93025] dark:text-[#f28b82]">
          ⚠️ 혼자 고민하면 수백만 원 손해 봅니다
        </p>
        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1">
          지금 바로 보상스쿨 전문가에게 무료로 진단받아 보세요
        </p>
      </div>

      {/* 헤더 배너 4카드 그대로 복사 + 그림자 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 카드 1: 카카오톡 상담 */}
        <a
          href="https://open.kakao.com/o/sWeszp7"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(242,153,0,0.2)] hover:border-[#f29900] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#fef7e0] dark:bg-[#e37400] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#f29900] dark:text-[#fde293]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[#d93025] transition-colors">카카오톡 상담</span>
            <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">실시간 채팅상담</span>
          </div>
        </a>

        {/* 카드 2: 상담신청 양식 */}
        <a
          href="https://forms.gle/E9vj7iqAHeJGhJ549"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(52,168,83,0.2)] hover:border-[#34A853] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#e6f4ea] dark:bg-[#0d652d] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[var(--google-green)] dark:text-[#81c995]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[var(--google-green)] transition-colors">상담신청 양식</span>
            <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">예약상담 신청서</span>
          </div>
        </a>

        {/* 카드 3: 보상스쿨 소개 */}
        <Link
          href="/about"
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(26,115,232,0.2)] hover:border-[#1A73E8] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] dark:bg-[#174ea6] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[var(--google-blue)] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[var(--google-blue)] transition-colors">보상스쿨 소개</span>
            <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">자격 및 경력사항</span>
          </div>
        </Link>

        {/* 카드 4: 보상스쿨 TV */}
        <a
          href="https://www.youtube.com/@bosangschool"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#202124] border border-gray-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(217,48,37,0.2)] hover:border-[#d93025] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#fce8e6] dark:bg-[#c5221f] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[var(--google-red)] dark:text-[#f28b82]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[var(--google-red)] transition-colors">보상스쿨 TV</span>
            <span className="block text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">유튜브 바로가기</span>
          </div>
        </a>
      </div>
    </div>
  );
}
