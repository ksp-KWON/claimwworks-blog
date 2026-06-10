'use client';
import { useState, useEffect } from 'react';
import type { YouTubeVideo } from './YouTubeLounge';

export default function YouTubeLoungeClient({ videos }: { videos: YouTubeVideo[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      // Reset selected video to the first one when closing
      if (videos.length > 0) setSelectedVideo(videos[0]);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, videos]);

  if (videos.length === 0) return null;

  return (
    <>
      {/* 둥근 형태의 프리미엄 버튼 */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-[#FF0000] dark:text-[#ff6b6b] transition-colors font-bold shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span className="hidden md:inline tracking-tight text-sm">보상 TV</span>
      </button>

      {/* 애플 라운지 스타일 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div className="w-full max-w-6xl px-4 sm:px-8 py-8 sm:py-12 flex flex-col h-full justify-between sm:justify-center overflow-y-auto hide-scrollbar">
             
             {/* Header */}
             <div className="text-center mb-6 sm:mb-10 mt-8 sm:mt-0">
               <h2 className="text-2xl sm:text-4xl font-extrabold text-white flex items-center justify-center gap-3 tracking-tight">
                 <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                 </svg>
                 보상스쿨 라운지
               </h2>
               <p className="text-gray-400 mt-3 text-sm sm:text-base">어렵고 복잡한 보상 상식, 전문가의 영상으로 가장 쉽게 확인하세요.</p>
             </div>

             {/* 메인 플레이어 (iFrame 재생) */}
             {selectedVideo && (
               <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 bg-zinc-900/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative aspect-video flex-shrink-0">
                 <iframe 
                   src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`} 
                   title={selectedVideo.title}
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                   className="w-full h-full"
                 />
               </div>
             )}

             {/* 하단 재생목록 (스크롤 가능) */}
             <div className="w-full max-w-6xl mx-auto flex-shrink-0">
               <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 pl-1">최신 영상 목록</p>
               <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                 {videos.map(video => (
                   <button
                     key={video.id}
                     onClick={() => setSelectedVideo(video)}
                     className={`snap-start shrink-0 w-[220px] sm:w-[260px] text-left group flex flex-col bg-zinc-800/30 hover:bg-zinc-800/80 rounded-2xl overflow-hidden border transition-all duration-300 ${selectedVideo?.id === video.id ? 'border-[#FF0000] bg-zinc-800/80 shadow-[0_0_20px_rgba(255,0,0,0.15)] ring-1 ring-[#FF0000]' : 'border-white/5'}`}
                   >
                     <div className="relative aspect-video w-full overflow-hidden">
                       <img 
                         src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                         alt={video.title} 
                         className={`w-full h-full object-cover transition-transform duration-500 ${selectedVideo?.id === video.id ? 'scale-105' : 'group-hover:scale-105'}`}
                       />
                       {selectedVideo?.id === video.id && (
                         <div className="absolute inset-0 bg-[#FF0000]/20 flex items-center justify-center backdrop-blur-[1px]">
                           <span className="bg-[#FF0000] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">재생 중</span>
                         </div>
                       )}
                       {selectedVideo?.id !== video.id && (
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                           <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                             <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                           </div>
                         </div>
                       )}
                     </div>
                     <div className="p-4 flex-1 flex flex-col justify-between">
                       <h3 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug mb-2 transition-colors ${selectedVideo?.id === video.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                         {video.title}
                       </h3>
                       <p className="text-[10px] sm:text-[11px] text-gray-500">{video.published}</p>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
             
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />
        </div>
      )}
    </>
  );
}
