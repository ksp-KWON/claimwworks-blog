import React from 'react';
import YouTubeBriefingClient from './YouTubeBriefingClient';

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
}

export default async function YouTubeBriefing() {
  const channelId = 'UCvjJtHa7eS2G25Vwt4fzezA';
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  let videos: YouTubeVideo[] = [];

  try {
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
      }).filter(v => v.id).slice(0, 5); // 1 featured + 4 list items
    }
  } catch (error) {
    console.error('Failed to fetch YouTube RSS:', error);
  }

  if (videos.length === 0) return null;

  return <YouTubeBriefingClient videos={videos} />;
}
