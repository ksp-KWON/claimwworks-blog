import React from 'react';
import Image from 'next/image';

// Next.js Server Component
export default async function YouTubeSection() {
  const channelId = 'UCvjJtHa7eS2G25Vwt4fzezA';
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  let videos: { id: string; title: string; published: string }[] = [];

  try {
    // Revalidate every 1 hour (3600 seconds)
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const xml = await res.text();
      
      // Parse XML using regex for simplicity and speed
      const entries = xml.split('<entry>').slice(1);
      videos = entries.map(entry => {
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
        
        return {
          id: videoIdMatch ? videoIdMatch[1] : '',
          title: titleMatch ? titleMatch[1] : '',
          published: publishedMatch ? new Date(publishedMatch[1]).toLocaleDateString('ko-KR') : ''
        };
      }).filter(v => v.id).slice(0, 4); // Get latest 4 videos to make it 2x2 grid ideally
    }
  } catch (error) {
    console.error('Failed to fetch YouTube RSS:', error);
  }

  if (videos.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-[var(--google-border)]">
      {/* 헤더 타이틀 및 소개멘트 */}
      <div className="border-b border-[var(--google-border)] pb-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          보상스쿨 TV 유튜브
        </h2>
        <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-1.5">
          어렵고 복잡한 보상 상식, 보상스쿨 전문가가 유튜브 영상으로 알기 쉽게 설명해 드립니다.
        </p>
      </div>
      
      {/* 한 칸에 2개씩 (Grid 배치) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {videos.map(video => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-white dark:bg-[#202124] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
              <Image 
                src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                alt={video.title} 
                width={480}
                height={360}
                unoptimized
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors flex items-center justify-center">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                   <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-[#202124] dark:text-[#e8eaed] line-clamp-2 mb-2 group-hover:text-[var(--google-blue)] transition-colors leading-snug">
                {video.title}
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-1.5">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {video.published}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
