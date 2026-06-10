'use client';
import { useState } from 'react';
import type { YouTubeVideo } from './YouTubeBriefing';

export default function YouTubeBriefingClient({ videos }: { videos: YouTubeVideo[] }) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo>(videos[0]);

  return (
    <section className="mb-10 bg-white dark:bg-[#202124] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      
      {/* 프리미엄 헤더 */}
      <div className="px-6 sm:px-8 py-5 border-b border-[var(--google-border)] flex items-center justify-between bg-[#f8f9fa] dark:bg-[#303134]">
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight">
            전문가 영상 브리핑
          </h2>
        </div>
        <a 
          href="https://www.youtube.com/@bosangschool" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-bold text-[var(--google-blue)] hover:underline hidden sm:block"
        >
          채널 바로가기 →
        </a>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* 좌측: 메인 비디오 플레이어 */}
        <div className="flex-1 lg:border-r border-[var(--google-border)] p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-[var(--google-border)] bg-black">
            <iframe 
              key={selectedVideo.id} // 키를 변경하여 iframe 리로드 유도
              src={`https://www.youtube.com/embed/${selectedVideo.id}`} 
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="mt-5">
            <h3 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] leading-snug">
              {selectedVideo.title}
            </h3>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {selectedVideo.published} 업데이트
            </p>
          </div>
        </div>

        {/* 우측: 재생목록 (리스트 형태) */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col">
          <div className="px-6 py-4 border-t lg:border-t-0 border-b border-[var(--google-border)] bg-[#f8f9fa] dark:bg-[#303134]">
            <span className="text-xs font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest">
              최신 영상 목록
            </span>
          </div>
          <div className="flex flex-col overflow-y-auto max-h-[400px] lg:max-h-full scrollbar-hide">
            {videos.map(video => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left p-4 flex gap-4 transition-colors border-b border-[var(--google-border)] last:border-b-0 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] ${selectedVideo.id === video.id ? 'bg-[#e8f0fe] dark:bg-[#174ea6]/20' : ''}`}
              >
                <div className="relative w-28 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <img 
                    src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                  {selectedVideo.id === video.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF0000]">재생 중</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h4 className={`text-sm font-bold line-clamp-2 leading-snug ${selectedVideo.id === video.id ? 'text-[var(--google-blue)]' : 'text-[#202124] dark:text-[#e8eaed]'}`}>
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-1">
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
