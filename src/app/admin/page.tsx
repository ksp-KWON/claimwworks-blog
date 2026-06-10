"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';

const REPO_OWNER = 'ksp-KWON';
const REPO_NAME = 'claimworks-blog';
const POSTS_PATH = 'src/content/posts';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  
  // Settings
  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  
  // App State
  const [mode, setMode] = useState<'manual' | 'semi-auto' | 'edit'>('manual');
  const [inputText, setInputText] = useState('');
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [slug, setSlug] = useState('');
  
  // Edit State
  const [postList, setPostList] = useState<{name: string, sha: string, title: string}[]>([]);
  const [selectedPostSha, setSelectedPostSha] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const savedGemini = localStorage.getItem('GEMINI_API_KEY');
    const savedGithub = localStorage.getItem('GITHUB_TOKEN');
    if (savedGemini) setGeminiKey(savedGemini);
    if (savedGithub) setGithubToken(savedGithub);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '9913006') {
      setIsLoggedIn(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const saveKeys = () => {
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    localStorage.setItem('GITHUB_TOKEN', githubToken);
    setStatusMessage('🔑 인증 키가 브라우저에 안전하게 저장되었습니다.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const fetchPostList = async () => {
    if (!githubToken) return alert('GitHub 토큰이 필요합니다.');
    setIsLoading(true);
    try {
      // 1. GitHub API에서 최신 파일 목록과 SHA 추출
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}`, {
        headers: { 'Authorization': `Bearer ${githubToken}` }
      });
      if (!res.ok) throw new Error('목록을 불러오지 못했습니다. 토큰을 확인해주세요.');
      const githubFiles = await res.json();
      const mdFiles = githubFiles.filter((f: any) => f.name.endsWith('.md'));

      // 2. 빠르고 직관적인 제목 매핑을 위해 빌드된 posts-data.json 활용
      let titlesMap: Record<string, string> = {};
      try {
        const dataRes = await fetch('/data/posts-data.json');
        if (dataRes.ok) {
          const postsData = await dataRes.json();
          postsData.forEach((post: any) => {
            titlesMap[`${post.slug}.md`] = post.title;
          });
        }
      } catch (e) {
        console.warn('제목 매핑 데이터를 불러오지 못했습니다.', e);
      }

      // 3. 데이터 결합 (제목이 없으면 파일명 표시)
      const combined = mdFiles.map((file: any) => ({
        name: file.name,
        sha: file.sha,
        title: titlesMap[file.name] || file.name.replace('.md', '')
      }));

      setPostList(combined);
      setStatusMessage('📄 기존 글 목록을 성공적으로 불러왔습니다.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error: any) {
      setStatusMessage(`오류: ${error.message}`);
    }
    setIsLoading(false);
  };

  const loadPost = async (filename: string, sha: string) => {
    if (!githubToken) return;
    setIsLoading(true);
    setSelectedPostSha(sha);
    setSlug(filename.replace('.md', ''));
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`, {
        headers: { 'Authorization': `Bearer ${githubToken}` }
      });
      const data = await res.json();
      const content = decodeURIComponent(escape(window.atob(data.content)));
      setGeneratedMarkdown(content);
      setIsPreview(true);
      setStatusMessage(`📝 편집 모드: 수정을 완료한 뒤 우측 발행 버튼을 누르세요.`);
    } catch (error: any) {
      setStatusMessage(`오류: ${error.message}`);
    }
    setIsLoading(false);
  };

  const callGeminiAPI = async (prompt: string) => {
    if (!geminiKey) return alert('Gemini API 키가 필요합니다.');
    setIsLoading(true);
    setStatusMessage('✨ AI가 글을 작성하고 있습니다... (10~20초 소요)');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const text = data.candidates[0].content.parts[0].text;
      
      const slugMatch = text.match(/slug:\s*"?([^"\n]+)"?/);
      if (slugMatch) {
        setSlug(slugMatch[1].trim());
      } else {
        setSlug(`post-${Date.now()}`);
      }
      
      setGeneratedMarkdown(text);
      setIsPreview(true);
      setStatusMessage('🎉 작성이 완료되었습니다! 미리보기를 확인하고 발행하세요.');
    } catch (error: any) {
      setStatusMessage(`API 오류: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleGenerate = () => {
    if (!inputText.trim()) return alert('내용을 입력해주세요.');
    
    let prompt = "";
    if (mode === 'manual') {
      prompt = `
다음은 유튜브 영상 대본입니다. 이 내용을 절대 변형하거나 왜곡하지 말고, 10년 차 전문가(손해사정사)의 톤앤매너로 다듬어 주세요.
SEO 최적화를 위해 적절한 H2, H3 태그를 사용하고, 내용 사이사이에 가독성을 높일 수 있는 요약 박스, Q&A, 표 등을 마크다운 문법으로 예쁘게 삽입해 주세요.

반드시 다음 형식의 YAML Frontmatter를 최상단에 포함해야 합니다:
---
title: "알맞은 제목 생성"
date: "${new Date().toISOString().split('T')[0]}"
summary: "1~2줄 핵심 요약"
category: "보상가이드"
tags:
  - "태그1"
  - "태그2"
slug: "알맞은-영문-URL-슬러그"
published: true
---

대본 내용:
${inputText}
`;
    } else if (mode === 'semi-auto') {
      prompt = `
다음은 블로그 포스팅 작성을 위한 참고 자료(키워드, 개요, 또는 벤치마킹할 블로그/유튜브 링크)입니다.
만약 링크가 포함되어 있다면, 해당 링크의 콘텐츠나 영상을 분석하여 핵심 주제와 인사이트를 파악하세요. 
단, 원문을 절대 그대로 복사(카피)하지 말고, 10년 차 전문가(손해사정사)의 관점에서 완전히 새로운 구도와 독창적인 내용으로 벤치마킹하여 깊이 있는 블로그 포스팅을 작성해 주세요.
내용에는 전문가적 인사이트, 주의사항, 대처 방법 등이 풍부하게 포함되어야 합니다.
가독성을 위해 적절한 H2, H3 태그, 표, Q&A 등을 마크다운으로 삽입해 주세요.

반드시 다음 형식의 YAML Frontmatter를 최상단에 포함해야 합니다:
---
title: "매력적인 제목 생성"
date: "${new Date().toISOString().split('T')[0]}"
summary: "1~2줄 핵심 요약"
category: "보상가이드"
tags:
  - "태그1"
  - "태그2"
slug: "알맞은-영문-URL-슬러그"
published: true
---

주제/키워드/참고링크:
${inputText}
`;
    }
    
    callGeminiAPI(prompt);
  };

  const publishToGithub = async () => {
    if (!githubToken) return alert('GitHub 토큰이 필요합니다.');
    if (!slug) return alert('슬러그(파일명)가 없습니다.');
    if (!generatedMarkdown) return alert('발행할 글이 없습니다.');

    setIsLoading(true);
    setStatusMessage('🚀 GitHub에 안전하게 커밋하고 있습니다...');
    
    try {
      const contentBase64 = window.btoa(unescape(encodeURIComponent(generatedMarkdown)));
      const filename = `${slug}.md`;
      const path = `${POSTS_PATH}/${filename}`;
      
      const body: any = {
        message: `docs: 관리자 페이지에서 자동 작성된 포스팅 발행 (${filename})`,
        content: contentBase64,
        branch: 'main'
      };
      
      if (mode === 'edit' && selectedPostSha) {
        body.sha = selectedPostSha;
        body.message = `docs: 관리자 페이지에서 포스팅 수정 (${filename})`;
      }

      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      setStatusMessage('✅ 성공적으로 발행되었습니다! 2~3분 뒤 블로그에 반영됩니다.');
      setIsPreview(false);
      setGeneratedMarkdown('');
      setInputText('');
      setSelectedPostSha('');
    } catch (error: any) {
      setStatusMessage(`발행 실패: ${error.message}`);
    }
    setIsLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed] dark:from-[#202124] dark:to-[#171717]">
        {/* Straight aligned background blobs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-[400px] bg-blue-400/20 dark:bg-blue-600/10 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-full h-[400px] bg-purple-400/20 dark:bg-purple-600/10 blur-3xl"
        />

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onSubmit={handleLogin} 
          className="relative z-10 bg-white/60 dark:bg-[#303134]/60 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/10 w-[400px]"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2 tracking-tight">보안 관리자 접속</h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">안전한 글쓰기 환경을 위해 암호를 입력하세요</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-black/40 transition-all mb-6"
            placeholder="비밀번호 입력"
            autoFocus
          />
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
            잠금 해제
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] relative bg-[#f8f9fa] dark:bg-[#1e1e20] p-3 sm:p-4 font-sans overflow-hidden flex flex-col">
      {/* Dynamic Background - Aligned straight to avoid diagonal tilt perception */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex flex-col">
        <div className="w-full h-[50vh] bg-blue-100/40 dark:bg-blue-900/10 blur-[100px]" />
        <div className="w-full h-[50vh] bg-purple-100/40 dark:bg-purple-900/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1500px] w-full mx-auto flex flex-col flex-1 min-h-0 relative z-10 space-y-3"
      >
        
        {/* Header Bar - Slim & Professional */}
        <div className="bg-white/70 dark:bg-[#2a2a2c]/80 backdrop-blur-2xl px-5 py-3 rounded-2xl shadow-sm border border-white/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">AI 블로그 관리 센터</h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">v2.1</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">안전한 서버리스 보안 아키텍처</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-gray-400">Gemini:</span>
              <input 
                type="password" 
                value={geminiKey} 
                onChange={e => setGeminiKey(e.target.value)} 
                className="px-2 py-1 rounded bg-white dark:bg-[#1e1e20] border border-gray-255 dark:border-white/10 w-24 sm:w-32 text-[11px] focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-700 dark:text-gray-200"
                placeholder="AIzaSy..."
              />
            </div>
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 shrink-0 mx-1" />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-gray-400">GitHub:</span>
              <input 
                type="password" 
                value={githubToken} 
                onChange={e => setGithubToken(e.target.value)} 
                className="px-2 py-1 rounded bg-white dark:bg-[#1e1e20] border border-gray-255 dark:border-white/10 w-24 sm:w-32 text-[11px] focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-700 dark:text-gray-200"
                placeholder="ghp_..."
              />
            </div>
            <button onClick={saveKeys} className="ml-1 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-all text-xs font-bold shadow active:scale-95">
              키 저장
            </button>
          </div>
        </div>

        {/* Status Banner - Compact */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-150 dark:border-blue-800/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  {isLoading ? (
                     <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                  {statusMessage}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace - Adaptive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Left Column: Input Panel */}
          <div className="bg-white/70 dark:bg-[#2a2a2c]/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/50 dark:border-white/5 flex flex-col h-full min-h-0">
            
            {/* Mode Tab Switcher */}
            <div className="flex bg-gray-100/50 dark:bg-black/20 p-1 rounded-xl mb-4 flex-shrink-0">
              {[
                { id: 'manual', label: '수동 (대본 포장)' },
                { id: 'semi-auto', label: '반자동 (링크/개요)' },
                { id: 'edit', label: '기존 글 수정' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as any);
                    if (m.id === 'edit') fetchPostList();
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mode === m.id ? 'bg-white dark:bg-[#3f3f42] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'edit' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 flex-shrink-0">
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-950 dark:text-white text-xs font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => {
                      const post = postList.find(p => p.name === e.target.value);
                      if(post) loadPost(post.name, post.sha);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>수정할 글을 선택해 주세요</option>
                    {postList.map(post => (
                      <option key={post.name} value={post.name}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </motion.div>
            )}

            {(mode === 'manual' || mode === 'semi-auto') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 w-full p-4 rounded-xl border border-gray-250 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-950 dark:text-white placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all leading-relaxed custom-scrollbar"
                  placeholder={mode === 'manual' 
                    ? "✨ 이곳에 유튜브 대본 등 원문을 붙여넣으세요.\nAI가 원문을 보존하면서 가독성을 극대화한 UI(소제목, 표, Q&A)를 덧씌워 포장합니다." 
                    : "💡 이곳에 타겟 키워드, 뼈대(개요), 또는 참고할 블로그/유튜브 링크를 적어주세요.\nAI가 인사이트를 추출하여 완전히 새로운 전문적인 포스팅을 창작합니다."}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  AI 자율 작성 가동
                </button>
              </motion.div>
            )}

            {mode === 'edit' && isPreview && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0 relative">
                  <div className="absolute top-2.5 right-3 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] font-bold rounded">수동 마크다운 편집기</div>
                  <textarea
                    value={generatedMarkdown}
                    onChange={(e) => setGeneratedMarkdown(e.target.value)}
                    className="flex-1 w-full p-4 font-mono text-xs leading-relaxed rounded-xl border border-gray-250 dark:border-white/10 bg-gray-50/50 dark:bg-[#1e1e20]/80 text-gray-800 dark:text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all custom-scrollbar"
                  />
               </motion.div>
            )}
          </div>

          {/* Right Column: Preview Panel */}
          <div className="bg-white/70 dark:bg-[#2a2a2c]/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/50 dark:border-white/5 flex flex-col h-full min-h-0 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 z-10 flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </span>
                실시간 미리보기
              </h2>
              <AnimatePresence>
                {isPreview && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={publishToGithub}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    GitHub 즉시 발행
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-10 bg-white/40 dark:bg-black/10 rounded-xl p-4 sm:p-5 border border-white/40 dark:border-white/5 min-h-0">
              {generatedMarkdown ? (
                <article className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {generatedMarkdown}
                  </ReactMarkdown>
                </article>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">마법이 일어날 공간입니다</p>
                  <p className="text-[11px] mt-1 opacity-70">좌측에서 내용을 입력하고 AI 작성을 시작해 보세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer Info - Slim */}
        <div className="flex justify-between items-center px-2 opacity-50 flex-shrink-0">
           <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             종단간 브라우저 샌드박스 암호화
           </span>
           <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
             v2.1 (Glassmorphism UI)
           </span>
        </div>
      </motion.div>
    </div>
  );
}
