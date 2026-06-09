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
      if (trimmed !== '' && !/^[-*]/.test(trimmed) && !/^#/.test(trimmed)) break; // Stop at normal text
      if (/^#/.test(trimmed)) break; // Stop at new heading
      
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
      if (trimmed !== '' && !/^[-*]/.test(trimmed) && !/^[☑️✅]/.test(trimmed) && !/^#/.test(trimmed)) break;
      if (/^#/.test(trimmed)) break;
      
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
    .replace(/\n\[👉[^\]]*\]\([^)]*\)/g, '')
    .replace(/\n\[[^\]]*카카오[^\]]*\]\([^)]*\)/g, '')
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
        className="text-[20px] sm:text-[22px] font-bold text-gray-900 dark:text-[#e8eaed] mt-14 mb-6 px-5 py-4 sm:px-6 bg-white dark:bg-[#202124] border border-gray-100 dark:border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-3.5 tracking-tight break-keep"
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
        className="inline-flex items-center text-[16px] font-bold text-gray-800 dark:text-[#e8eaed] mt-8 mb-4 px-4 py-2 bg-gray-50/80 dark:bg-white/[0.04] border border-gray-100/50 dark:border-white/5 rounded-full tracking-tight break-keep shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
      >
        <span className="text-[#d93025] mr-2 opacity-80 text-[15px] font-extrabold">#</span>
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <div className="my-6 p-4 sm:p-5 rounded-xl border-l-4 border-[#34A853] bg-[#E6F4EA] dark:bg-[#0d652d]/20">
        <div className="text-[15px] text-[#137333] dark:text-[#81c995] leading-relaxed [&>p]:m-0">{children}</div>
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
        className="text-[#1A73E8] dark:text-[#8ab4f8] font-semibold hover:underline"
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
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
      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#dadce0] dark:via-[#5f6368] to-transparent" />
        <span className="text-[#dadce0] dark:text-[#5f6368] text-xs">✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#dadce0] dark:via-[#5f6368] to-transparent" />
      </div>
    ),
  };

  const finalComponents: any = {
    ...components,
    calculator: ({ ...props }: any) => {
      if (props.type === 'auto') {
        return <div className="my-8"><AutoCalculatorContainer /></div>;
      }
      if (props.type === 'medical') {
        return <div className="my-8"><MedicalCalculator /></div>;
      }
      return null;
    },
    red: ({ children }: any) => <strong className="text-[#d93025] dark:text-[#f28b82] font-bold">{children}</strong>,
    orange: ({ children }: any) => <strong className="text-[#f29900] dark:text-[#fde293] font-bold">{children}</strong>,
    green: ({ children }: any) => <strong className="text-[#34A853] dark:text-[#81c995] font-bold">{children}</strong>,
    blue: ({ children }: any) => <strong className="text-[#1A73E8] dark:text-[#8ab4f8] font-bold">{children}</strong>,
    purple: ({ children }: any) => <strong className="text-[#9333ea] dark:text-[#c084fc] font-bold">{children}</strong>,
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
    <div className="mb-8 rounded-2xl overflow-hidden border border-[#1A73E8]/25 bg-[#E8F0FE] dark:bg-[#1A73E8]/10">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#1A73E8]/20 bg-[#1A73E8]/8 dark:bg-[#1A73E8]/15">
        <div className="w-5 h-5 rounded bg-[#1A73E8] flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-[11px] font-extrabold text-[#1A73E8] uppercase tracking-[0.1em]">Key Points</span>
      </div>
      <ul className="px-5 py-4 space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-[#1A73E8]/20 dark:bg-[#1A73E8]/30 text-[#1A73E8] dark:text-[#8ab4f8] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span
              className="text-[14.5px] text-[#202124] dark:text-[#e8eaed] leading-relaxed"
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
    <nav className="mb-12 rounded-2xl overflow-hidden border border-[#d93025]/25 bg-[#fce8e6]/50 dark:bg-[#d93025]/10">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#d93025]/20 bg-[#d93025]/10 dark:bg-[#d93025]/15">
        <div className="w-5 h-5 rounded bg-[#d93025] flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <span className="text-[11px] font-extrabold text-[#d93025] uppercase tracking-[0.1em]">이 글의 목차</span>
      </div>

      <ul className="px-5 py-4 space-y-3">
        {toc.map((item, i) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => onItemClick(e, item.id)}
                className="group flex items-start gap-3 w-full"
              >
                <span className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 mt-[2px] transition-colors ${
                  isActive
                    ? 'bg-[#d93025] text-white shadow-sm'
                    : 'bg-[#d93025]/20 dark:bg-[#d93025]/30 text-[#d93025] dark:text-[#f28b82] group-hover:bg-[#d93025] group-hover:text-white'
                }`}>
                  {i + 1}
                </span>
                
                <span className={`text-[14.5px] leading-relaxed break-keep transition-colors ${
                  isActive 
                    ? 'font-bold text-[#d93025] dark:text-[#f28b82]' 
                    : 'font-medium text-[#d93025]/80 dark:text-[#f28b82]/80 group-hover:text-[#d93025] dark:group-hover:text-[#f28b82]'
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
    <div className="my-10 rounded-2xl overflow-hidden border border-[#34A853]/30 shadow-sm">
      {/* 헤더 */}
      <div className="px-5 py-4 bg-[#E6F4EA] dark:bg-[#0d652d]/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="font-bold text-[#137333] dark:text-[#81c995] text-[15px]">
              내 보험금·보상금 1분 자가진단
            </p>
            <p className="text-xs text-[#34A853]/80 mt-0.5">
              해당 항목을 클릭해 체크해 보세요
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#137333] dark:text-[#81c995]">
            {count}<span className="text-sm font-normal text-[#34A853]/70">/{items.length}</span>
          </p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-[#e0f0e4] dark:bg-[#0d652d]/20">
        <div
          className="h-full bg-[#34A853] transition-all duration-500 rounded-r-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 항목들 */}
      <div className="bg-white dark:bg-[#202124] divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              const next = [...checked];
              next[i] = !next[i];
              setChecked(next);
            }}
            className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
              checked[i]
                ? 'bg-[#E6F4EA] dark:bg-[#0d652d]/15'
                : 'hover:bg-[#f8f9fa] dark:hover:bg-[#303134]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                checked[i]
                  ? 'bg-[#34A853] border-[#34A853]'
                  : 'border-[#dadce0] dark:border-[#5f6368]'
              }`}
            >
              {checked[i] && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className={`text-[14px] leading-relaxed ${
                checked[i]
                  ? 'text-[#137333] dark:text-[#81c995] line-through opacity-70'
                  : 'text-[#202124] dark:text-[#e8eaed]'
              }`}
            >
              {item}
            </span>
          </button>
        ))}
      </div>

      {/* 결과 메시지 */}
      {count >= 3 && (
        <div className="bg-[#34A853] px-5 py-3.5 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-white text-[13px] font-medium leading-relaxed">
            <strong>{count}개 이상 해당</strong>됩니다. 청구 가능한 보험금이 남아있을 가능성이 높으니 무료 진단을 받아보세요.
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
    <div className="my-10 rounded-2xl overflow-hidden border border-[#7C4DFF]/20 shadow-sm">
      {/* 헤더 */}
      <div className="px-5 py-4 bg-[#EDE7F6] dark:bg-[#4a148c]/20 flex items-center gap-2.5">
        <span className="text-xl">💡</span>
        <div>
          <p className="font-bold text-[#4a148c] dark:text-[#ce93d8] text-[15px]">
            자주 묻는 질문 FAQ TOP {items.length}
          </p>
          <p className="text-xs text-[#7C4DFF]/70 mt-0.5">클릭하면 답변을 확인할 수 있습니다</p>
        </div>
      </div>

      {/* 항목들 */}
      <div className="bg-white dark:bg-[#202124] divide-y divide-[#f3e5f5] dark:divide-[#4a148c]/20">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-[#f3e5f5]/50 dark:hover:bg-[#4a148c]/10 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-[#EDE7F6] dark:bg-[#4a148c]/30 text-[#7C4DFF] dark:text-[#ce93d8] text-[12px] font-bold flex items-center justify-center shrink-0">
                Q{i + 1}
              </span>
              <span className="flex-1 font-semibold text-[15px] text-[#202124] dark:text-[#e8eaed]">
                {item.q}
              </span>
              <svg
                className={`w-4 h-4 text-[#7C4DFF] shrink-0 transition-transform duration-200 ${openIdx === i ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openIdx === i && (
              <div className="px-5 pb-5 pt-1 bg-[#faf5ff] dark:bg-[#4a148c]/5">
                <div className="flex gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#7C4DFF] text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </span>
                  <p
                    className="text-[14.5px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed flex-1"
                    dangerouslySetInnerHTML={{
                      __html: item.a.replace(
                        /\*\*(.+?)\*\*/g,
                        '<strong style="font-weight:700;color:#202124">$1</strong>'
                      ),
                    }}
                  />
                </div>
              </div>
            )}
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
          className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 rounded-2xl bg-white dark:bg-[#202124] border border-[var(--google-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(242,153,0,0.15)] hover:border-[#f29900] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#fef7e0] dark:bg-[#e37400]/20 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <svg className="w-6 h-6 text-[#f29900] dark:text-[#fde293]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.7 1.7 5.1 4.2 6.5l-1.1 4.1c-.1.3.2.5.4.4l4.8-3.2c.5.1 1.1.1 1.7.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 mt-1 sm:mt-0">
            <span className="block text-[15px] font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[#d93025] transition-colors">
              카카오톡 상담
            </span>
            <span className="block text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">
              실시간 채팅상담
            </span>
          </div>
        </a>

        {/* 카드 2: 상담신청 양식 */}
        <a
          href="https://forms.gle/E9vj7iqAHeJGhJ549"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 rounded-2xl bg-white dark:bg-[#202124] border border-[var(--google-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(52,168,83,0.15)] hover:border-[#34A853] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#e6f4ea] dark:bg-[#0d652d]/30 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <svg className="w-6 h-6 text-[#34A853] dark:text-[#81c995]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 mt-1 sm:mt-0">
            <span className="block text-[15px] font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[#34A853] transition-colors">
              상담신청 양식
            </span>
            <span className="block text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">
              예약상담 신청서
            </span>
          </div>
        </a>

        {/* 카드 3: 보상스쿨 소개 */}
        <Link
          href="/about"
          className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 rounded-2xl bg-white dark:bg-[#202124] border border-[var(--google-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] hover:border-[#1A73E8] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#e8f0fe] dark:bg-[#174ea6]/30 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <svg className="w-6 h-6 text-[#1A73E8] dark:text-[#8ab4f8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 mt-1 sm:mt-0">
            <span className="block text-[15px] font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[#1A73E8] transition-colors">
              보상스쿨 소개
            </span>
            <span className="block text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">
              자격 및 경력사항
            </span>
          </div>
        </Link>

        {/* 카드 4: 보상스쿨 TV */}
        <a
          href="https://www.youtube.com/@bosangschool"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 rounded-2xl bg-white dark:bg-[#202124] border border-[var(--google-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(217,48,37,0.15)] hover:border-[#d93025] hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#fce8e6] dark:bg-[#c5221f]/30 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <svg className="w-6 h-6 text-[#d93025] dark:text-[#f28b82]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 mt-1 sm:mt-0">
            <span className="block text-[15px] font-bold text-[#202124] dark:text-[#e8eaed] truncate group-hover:text-[#d93025] transition-colors">
              보상스쿨 TV
            </span>
            <span className="block text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">
              유튜브 바로가기
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
