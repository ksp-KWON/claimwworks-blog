'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsMobileOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="flex items-center">
      {/* Desktop Search Bar (Google Drive / Material Style) */}
      <form 
        onSubmit={handleSearch} 
        className="hidden md:flex items-center bg-[#f1f3f4] dark:bg-[#3c4043] rounded-full px-4 py-2 w-[240px] lg:w-[320px] focus-within:bg-white dark:focus-within:bg-[#303134] focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] transition-all duration-200 border border-transparent focus-within:border-transparent mr-2"
      >
        <button type="submit" className="text-[#5f6368] dark:text-[#9aa0a6] hover:text-[var(--google-blue)] transition-colors">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full bg-transparent outline-none pl-3 text-sm text-[#202124] dark:text-[#e8eaed] placeholder-[#5f6368] dark:placeholder-[#9aa0a6]"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="text-[#5f6368] hover:text-[#202124] dark:hover:text-white">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </form>

      {/* Mobile Search Button */}
      <div className="md:hidden flex items-center">
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] transition-colors focus:outline-none mr-1"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#202124] animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center p-3 sm:p-4 border-b border-[var(--google-border)] shadow-sm">
            <button 
              onClick={() => setIsMobileOpen(false)} 
              className="p-2 text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <form onSubmit={handleSearch} className="flex-1 mx-3 relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full bg-[#f1f3f4] dark:bg-[#303134] rounded-full px-5 py-2.5 outline-none text-base text-[#202124] dark:text-[#e8eaed] placeholder-[#5f6368] dark:placeholder-[#9aa0a6]"
                autoFocus
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-4 text-[#5f6368]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </form>
            <button 
              onClick={handleSearch} 
              className="px-3 py-2 text-[var(--google-blue)] font-bold whitespace-nowrap"
            >
              검색
            </button>
          </div>
          {/* Recent Searches or Hints could go here */}
          <div className="p-5">
            <p className="text-xs font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-3">인기 검색어</p>
            <div className="flex flex-wrap gap-2">
              {['후유장해', '교통사고합의금', '십자인대파열', '디스크'].map(keyword => (
                <button 
                  key={keyword}
                  onClick={() => {
                    setQuery(keyword);
                    router.push(`/search?q=${encodeURIComponent(keyword)}`);
                    setIsMobileOpen(false);
                  }}
                  className="px-4 py-2 bg-[#f1f3f4] dark:bg-[#303134] text-[#202124] dark:text-[#e8eaed] rounded-full text-sm hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
