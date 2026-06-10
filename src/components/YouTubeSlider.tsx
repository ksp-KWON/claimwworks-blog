import React from 'react';

// Next.js Server Component
export default async function YouTubeSlider() {
  const channelId = 'UCvjJtHa7eS2G25Vwt4fzezA';
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    // Revalidate every 1 hour (3600 seconds)
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    
    const xml = await res.text();
    
    // Parse XML using regex for simplicity and speed
    const entries = xml.split('<entry>').slice(1);
    const videos = entries.map(entry => {
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      
      return {
        id: videoIdMatch ? videoIdMatch[1] : '',
        title: titleMatch ? titleMatch[1] : '',
        published: publishedMatch ? new Date(publishedMatch[1]).toLocaleDateString('ko-KR') : ''
      };
    }).filter(v => v.id).slice(0, 5); // Get latest 5 videos

    if (videos.length === 0) return null;

    return (
      <div className="mb-10 w-full overflow-hidden">
        <div className="flex items-center gap-2 mb-5 px-1">
          <svg className="w-7 h-7 text-[#FF0000] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight">
            보상스쿨 최신 영상
          </h2>
        </div>
        
        {/* Horizontal Slider */}
        <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {videos.map(video => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[260px] sm:w-[280px] group flex flex-col bg-white dark:bg-[#202124] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img 
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors flex items-center justify-center">
                   <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                     <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-[#202124] dark:text-[#e8eaed] line-clamp-2 mb-2 group-hover:text-[var(--google-blue)] transition-colors leading-snug">
                  {video.title}
                </h3>
                <p className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {video.published}
                </p>
              </div>
            </a>
          ))}
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
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch YouTube RSS:', error);
    return null;
  }
}
