import React from 'react';
import YouTubeLoungeClient from './YouTubeLoungeClient';

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
}

// Server Component for fetching data
export default async function YouTubeLounge() {
  const channelId = 'UCvjJtHa7eS2G25Vwt4fzezA';
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  let videos: YouTubeVideo[] = [];

  try {
    // Revalidate every 1 hour
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const xml = await res.text();
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
      }).filter(v => v.id).slice(0, 10); // Get latest 10 videos for the lounge
    }
  } catch (error) {
    console.error('Failed to fetch YouTube RSS:', error);
  }

  // Render the Client Component which handles the modal and interactivity
  return <YouTubeLoungeClient videos={videos} />;
}
