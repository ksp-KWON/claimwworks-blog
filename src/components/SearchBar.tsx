'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative flex items-center">
      {isOpen ? (
        <form onSubmit={handleSearch} className="absolute right-0 flex items-center bg-white dark:bg-[#303134] rounded-full border border-[var(--google-border)] overflow-hidden w-[200px] sm:w-[250px] shadow-sm animate-in slide-in-from-right-4 duration-200">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어 입력..."
            className="w-full pl-4 py-2 text-sm bg-transparent outline-none text-gray-900 dark:text-white"
            autoFocus
          />
          <button type="submit" className="p-2 text-gray-500 hover:text-blue-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="p-2 mr-1 text-gray-400 hover:text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] transition-colors focus:outline-none"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      )}
    </div>
  );
}
