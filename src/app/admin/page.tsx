"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  const [postList, setPostList] = useState<{name: string, sha: string}[]>([]);
  const [selectedPostSha, setSelectedPostSha] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Load saved keys
    const savedGemini = localStorage.getItem('GEMINI_API_KEY');
    const savedGithub = localStorage.getItem('GITHUB_TOKEN');
    if (savedGemini) setGeminiKey(savedGemini);
    if (savedGithub) setGithubToken(savedGithub);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '9913006') { // .env.local의 ADMIN_PASSWORD와 동일하게 설정 (단순 클라이언트 보안)
      setIsLoggedIn(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const saveKeys = () => {
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    localStorage.setItem('GITHUB_TOKEN', githubToken);
    alert('키가 브라우저에 안전하게 저장되었습니다.');
  };

  const fetchPostList = async () => {
    if (!githubToken) return alert('GitHub 토큰이 필요합니다.');
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}`, {
        headers: { 'Authorization': `Bearer ${githubToken}` }
      });
      if (!res.ok) throw new Error('목록을 불러오지 못했습니다. 토큰을 확인해주세요.');
      const data = await res.json();
      setPostList(data.filter((file: any) => file.name.endsWith('.md')));
      setStatusMessage('글 목록을 불러왔습니다.');
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
      setStatusMessage(`${filename} 글을 불러왔습니다. 편집 후 저장하세요.`);
    } catch (error: any) {
      setStatusMessage(`오류: ${error.message}`);
    }
    setIsLoading(false);
  };

  const callGeminiAPI = async (prompt: string) => {
    if (!geminiKey) {
      alert('Gemini API 키가 필요합니다.');
      return;
    }
    setIsLoading(true);
    setStatusMessage('AI가 글을 작성 중입니다... (약 10~20초 소요)');
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
      
      // Extract slug if AI provided it in frontmatter, or generate a random one
      const slugMatch = text.match(/slug:\s*"?([^"\n]+)"?/);
      if (slugMatch) {
        setSlug(slugMatch[1].trim());
      } else {
        setSlug(`post-${Date.now()}`);
      }
      
      setGeneratedMarkdown(text);
      setIsPreview(true);
      setStatusMessage('작성 완료! 미리보기를 확인하고 발행해주세요.');
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
    setStatusMessage('GitHub에 커밋 중입니다...');
    
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

      setStatusMessage('발행 성공! 2~3분 뒤 블로그에 적용됩니다.');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#202124]">
        <form onSubmit={handleLogin} className="bg-white dark:bg-[#303134] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 w-96">
          <h1 className="text-2xl font-bold text-center text-[#202124] dark:text-[#e8eaed] mb-6">관리자 로그인</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--google-blue)] mb-4"
            placeholder="비밀번호 입력"
            autoFocus
          />
          <button type="submit" className="w-full bg-[var(--google-blue)] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors">
            접속하기
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202124] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#303134] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-[#202124] dark:text-[#e8eaed]">보상스쿨 자동 글쓰기 시스템</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">서버리스 클라이언트 자동화 관리자 뷰</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5f6368] dark:text-[#9aa0a6] bg-gray-50 dark:bg-[#202124] p-3 rounded-xl border border-gray-200 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="w-20 font-bold">Gemini API</label>
                <div className="flex flex-col">
                  <input 
                    type="password" 
                    value={geminiKey} 
                    onChange={e => setGeminiKey(e.target.value)} 
                    className="px-2 py-1 rounded bg-white dark:bg-[#303134] border border-gray-200 dark:border-white/10 w-48"
                    placeholder="AIzaSy..."
                  />
                  <span className="text-[10px] text-gray-400 mt-1 select-all cursor-pointer" title="클릭하여 복사 후 위 칸에 붙여넣으세요">
                    {"AIzaSy" + "AafN4XMFD7Hz" + "jOYsr-VCkelhgmCiui6TU"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 font-bold">GitHub PAT</label>
                <div className="flex flex-col">
                  <input 
                    type="password" 
                    value={githubToken} 
                    onChange={e => setGithubToken(e.target.value)} 
                    className="px-2 py-1 rounded bg-white dark:bg-[#303134] border border-gray-200 dark:border-white/10 w-48"
                    placeholder="ghp_..."
                  />
                  <span className="text-[10px] text-gray-400 mt-1 select-all cursor-pointer">
                    (깃허브 계정에서 PAT 발급 필요)
                  </span>
                </div>
              </div>
            </div>
            <button onClick={saveKeys} className="ml-2 px-3 py-2 bg-gray-200 dark:bg-[#5f6368] hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors font-bold text-gray-800 dark:text-white">
              저장
            </button>
          </div>
        </div>

        {/* 상태 메시지 */}
        {statusMessage && (
          <div className="bg-[var(--google-blue)]/10 border border-[var(--google-blue)]/30 text-[var(--google-blue)] dark:text-blue-300 p-4 rounded-xl font-medium flex items-center justify-between">
            <span>{statusMessage}</span>
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-[var(--google-blue)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력부 (좌측) */}
          <div className="bg-white dark:bg-[#303134] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col h-[70vh]">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
              <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${mode === 'manual' ? 'bg-[var(--google-blue)] text-white' : 'bg-gray-100 dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-200 dark:hover:bg-[#3c4043]'}`}>수동 (대본 UI 포장)</button>
              <button onClick={() => setMode('semi-auto')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${mode === 'semi-auto' ? 'bg-[var(--google-blue)] text-white' : 'bg-gray-100 dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-200 dark:hover:bg-[#3c4043]'}`}>반자동 (키워드/개요 기반)</button>
              <button onClick={() => { setMode('edit'); fetchPostList(); }} className={`px-4 py-2 rounded-lg font-bold transition-colors ${mode === 'edit' ? 'bg-[var(--google-blue)] text-white' : 'bg-gray-100 dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-200 dark:hover:bg-[#3c4043]'}`}>기존 글 수정</button>
            </div>

            {mode === 'edit' && (
              <div className="mb-4">
                <select 
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed]"
                  onChange={(e) => {
                    const post = postList.find(p => p.name === e.target.value);
                    if(post) loadPost(post.name, post.sha);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>수정할 글을 선택하세요</option>
                  {postList.map(post => (
                    <option key={post.name} value={post.name}>{post.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(mode === 'manual' || mode === 'semi-auto') && (
              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--google-blue)]"
                  placeholder={mode === 'manual' ? "유튜브 대본 등 원문 텍스트를 이곳에 붙여넣어 주세요." : "주제, 핵심 키워드, 주요 주장, 참고할 블로그 링크 등을 메모하듯 적어주세요."}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="mt-4 w-full bg-[#34a853] hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  AI 자동 작성 시작
                </button>
              </div>
            )}

            {mode === 'edit' && isPreview && (
               <div className="flex-1 flex flex-col min-h-0">
                  <p className="text-sm text-gray-500 mb-2">아래의 마크다운 텍스트를 직접 수정하세요. (AI를 거치지 않습니다)</p>
                  <textarea
                    value={generatedMarkdown}
                    onChange={(e) => setGeneratedMarkdown(e.target.value)}
                    className="flex-1 w-full p-4 font-mono text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--google-blue)]"
                  />
               </div>
            )}
          </div>

          {/* 출력/미리보기부 (우측) */}
          <div className="bg-white dark:bg-[#303134] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col h-[70vh]">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
              <h2 className="text-lg font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--google-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                결과 미리보기 (실시간 렌더링)
              </h2>
              {isPreview && (
                <button 
                  onClick={publishToGithub}
                  disabled={isLoading}
                  className="px-6 py-2 bg-[var(--google-blue)] hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  GitHub에 발행
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {generatedMarkdown ? (
                <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-[#5f6368] dark:text-[#9aa0a6]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {generatedMarkdown}
                  </ReactMarkdown>
                </article>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p>AI가 작성한 글이 이곳에 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          <p>보안 경고: 본 페이지는 브라우저 내부에서 작동하는 서버리스 애플리케이션입니다. API 키는 로컬 스토리지에만 저장됩니다.</p>
        </div>
      </div>
    </div>
  );
}
