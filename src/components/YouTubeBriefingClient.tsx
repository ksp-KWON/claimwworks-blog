'use client';
import { useState } from 'react';
import type { YouTubeVideo } from './YouTubeBriefing';

export default function YouTubeBriefingClient({ videos }: { videos: YouTubeVideo[] }) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo>(videos[0]);

  return (
    <section className="mb-10 bg-white dark:bg-[#202124] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      
      {/* 프리미엄 헤더 (다크 테마 + 레드 포인트 라인) */}
      <div className="px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between bg-zinc-900 border-t-4 border-[#FF0000]">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight">
            보상스쿨 미디어 센터
          </h2>
        </div>
        <a 
          href="https://www.youtube.com/@bosangschool" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-bold text-gray-300 hover:text-white hidden sm:block transition-colors"
        >
          채널 바로가기 →
        </a>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* 좌측: 메인 비디오 플레이어 및 구독 배너 */}
        <div className="flex-1 lg:border-r border-[var(--google-border)] flex flex-col justify-between">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 bg-black mb-5 group relative">
              <iframe 
                key={selectedVideo.id}
                src={`https://www.youtube.com/embed/${selectedVideo.id}`} 
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full relative z-10"
              />
              {/* 로딩용 플레이스홀더 배경 */}
              <div className="absolute inset-0 z-0 bg-zinc-800 animate-pulse flex items-center justify-center">
                <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#202124] dark:text-[#e8eaed] leading-snug">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-2 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {selectedVideo.published} 업로드
                </p>
              </div>
            </div>
          </div>

          {/* 고급스러운 채널 구독 유도 배너 (여백 채우기용) */}
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-6 mt-auto rounded-2xl bg-gradient-to-r from-red-50/80 to-red-100/40 dark:from-red-900/20 dark:to-red-900/5 border border-red-100 dark:border-red-900/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#202124] dark:text-[#e8eaed] text-sm sm:text-base">어려운 보상 문제, 영상으로 쉽게 푸세요!</h4>
                <p className="text-[11px] sm:text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 break-keep">보상스쿨 유튜브를 구독하시면 핵심 노하우를 가장 먼저 받아보실 수 있습니다.</p>
              </div>
            </div>
            <a 
              href="https://www.youtube.com/@bosangschool?sub_confirmation=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="shrink-0 w-full sm:w-auto text-center px-6 py-2.5 bg-[#FF0000] hover:bg-[#d93025] text-white text-sm font-bold rounded-full shadow-[0_4px_14px_rgba(255,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,0,0,0.4)] transition-all duration-200"
            >
              구독하기
            </a>
          </div>
        </div>

        {/* 우측: 재생목록 (리스트 형태) */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-[#f8f9fa] dark:bg-[#303134]">
          <div className="px-5 py-4 border-t lg:border-t-0 border-b border-[var(--google-border)] flex items-center justify-between">
            <span className="text-xs font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              최신 영상 목록
            </span>
            <span className="text-[10px] font-bold text-[#5f6368] dark:text-[#9aa0a6] bg-[#e8eaed] dark:bg-[#3c4043] px-2 py-0.5 rounded-md">
              {videos.length} Videos
            </span>
          </div>
          <div className="flex flex-col overflow-y-auto max-h-[420px] lg:max-h-full scrollbar-hide">
            {videos.map(video => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left p-4 sm:p-5 flex gap-4 transition-all duration-200 border-b border-[var(--google-border)] last:border-b-0 hover:bg-white dark:hover:bg-[#3c4043] ${selectedVideo.id === video.id ? 'bg-white dark:bg-[#3c4043] shadow-[inset_4px_0_0_#FF0000]' : ''}`}
              >
                <div className="relative w-28 sm:w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 shadow-sm">
                  <img 
                    src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                    alt={video.title} 
                    className={`w-full h-full object-cover transition-transform duration-300 ${selectedVideo.id === video.id ? 'scale-105' : 'group-hover:scale-105'}`}
                  />
                  {selectedVideo.id === video.id ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF0000] shadow-sm flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        재생 중
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0 py-0.5">
                  <h4 className={`text-sm font-bold line-clamp-2 leading-snug transition-colors ${selectedVideo.id === video.id ? 'text-[#FF0000]' : 'text-[#202124] dark:text-[#e8eaed] group-hover:text-[var(--google-blue)]'}`}>
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {video.published}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
