'use strict';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.message || '비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('서버와 통신하는 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100 dark:border-zinc-800/80 transition-all duration-300">
        
        {/* 로고 및 소개 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-2xl mb-4">
            🩺
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            관리자 로그인
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            심평원 건강·보상 정보 포털의 관리자 패널입니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label 
              htmlFor="password" 
              className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2"
            >
              관리자 비밀번호
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-300 dark:placeholder-zinc-600"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs sm:text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-blue-500/10 cursor-pointer active:scale-[0.98] flex items-center justify-center"
          >
            {loading ? '인증 확인 중...' : '접속하기'}
          </button>
        </form>

        {/* 하단 보조 링크 */}
        <div className="mt-8 text-center border-t border-slate-100 dark:border-zinc-800/80 pt-6">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>

      </div>
    </div>
  );
}
