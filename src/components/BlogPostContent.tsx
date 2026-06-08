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

// ─── 스크롤 오프셋: header(64) + sticky banner(52) + 버퍼(20) = 136px ───
const SCROLL_OFFSET = 140;

// ─── 본문에서 제거할 섹션 패턴 ───
const SKIP_PATTERNS = [
  /목차/,
  /table\s+of\s+contents/i,
  /핵심\s*요약/,
  /key\s*point/i,
  /자가진단/,
  /체크리스트/,
  /faq/i,
  /자주\s*묻는\s*질문/,
  /카카오톡\s*무료\s*상담/,
  /call\s*to\s*action/i,
  /seo\s*요약/i,
];

function shouldSkipH2(title: string): boolean {
  return SKIP_PATTERNS.some(p => p.test(title));
}

// ─── 핵심 요약 추출 ───
function extractKeyPoints(content: string): string[] {
  const m = content.match(/##[^\n]*(?:핵심\s*요약|key\s*point)[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (!m) return [];
  return m[1]
    .split('\n')
    .filter(l => /^[-*]/.test(l.trim()))
    .map(l => l.replace(/^[-*]\s*/, '').replace(/^[🛡️💡✅☑️⭐]+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

// ─── 체크리스트 추출 ───
function extractChecklist(content: string): string[] {
  const m = content.match(/##[^\n]*(?:자가진단|체크리스트)[^\n]*\n([\s\S]*?)(?=\n##|$)/i);
  if (!m) return [];
  return m[1]
    .split('\n')
    .filter(l => /[☑️✅]/.test(l))
    .map(l => l.replace(/^[\s☑️✅]+/, '').trim())
    .filter(Boolean);
}

// ─── FAQ 추출 ───
function extractFAQ(content: string): { q: string; a: string }[] {
  const m = content.match(/##[^\n]*(?:faq|자주\s*묻는)[^\n]*\n([\s\S]*?)(?=\n##\s*\d+\.|\n\[👉|\[SEO_SUMMARY\]|$)/i);
  if (!m) return [];
  const qMatches = [...m[1].matchAll(/###\s*(.+)/g)];
  const answers = m[1].split(/###\s*.+/g).slice(1);
  return qMatches.map((q, i) => ({
    q: q[1].trim(),
    a: (answers[i] || '').trim(),
  }));
}

// ─── 본문 전처리: 특수 섹션 제거 ───
function preprocessBody(content: string): string {
  let skip = false;
  const lines = content.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s*/, '').trim();
      skip = shouldSkipH2(title);
      if (!skip) result.push(line);
      continue;
    }
    if (!skip) result.push(line);
  }

  return result
    .join('\n')
    .replace(/\[SEO_SUMMARY\]:.*/g, '')
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
        className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] mt-12 mb-5 pb-2.5 border-b-2 border-[#1A73E8]/20 flex items-center gap-2.5"
      >
        <span className="w-1.5 h-6 bg-[#1A73E8] rounded-full inline-block shrink-0" />
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id}
        style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
        className="text-[15px] font-bold text-[#1A73E8] dark:text-[#8ab4f8] mt-8 mb-3 flex items-center gap-1.5"
      >
        <span className="opacity-60">▸</span>{children}
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
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={components}
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
    <nav className="mb-10 px-5 py-6 bg-[#f8f9fa] dark:bg-[#303134]/30 rounded-2xl border border-[#e8eaed] dark:border-[#3c4043]">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-[#5f6368] dark:text-[#9aa0a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span className="text-[14px] font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-wide">
          이 글의 목차
        </span>
      </div>

      <div className="relative pl-2">
        {/* 수직 타임라인 선 */}
        <div className="absolute top-2 bottom-2 left-[11px] w-[2px] bg-[#e8eaed] dark:bg-[#3c4043]" />

        <ul className="space-y-4">
          {toc.map((item, i) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id} className="relative z-10 flex items-start">
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onItemClick(e, item.id)}
                  className={`group flex items-start gap-4 w-full transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* 타임라인 점 */}
                  <div className="relative mt-[5px] shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-[#f8f9fa] dark:ring-[#303134] transition-colors duration-200 ${
                      isActive 
                        ? 'bg-[#1A73E8] scale-125' 
                        : 'bg-[#dadce0] dark:bg-[#5f6368] group-hover:bg-[#1A73E8]/50'
                    }`} />
                  </div>
                  
                  {/* 텍스트 내용 */}
                  <div className={`flex-1 flex flex-col ${isActive ? 'translate-x-1' : ''} transition-transform duration-200`}>
                    <span className={`text-[15px] leading-snug break-keep ${
                      isActive 
                        ? 'font-bold text-[#1A73E8] dark:text-[#8ab4f8]' 
                        : 'font-medium text-[#3c4043] dark:text-[#bdc1c6] group-hover:text-[#1A73E8]'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
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
