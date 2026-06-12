import React from 'react';
import YouTubeBriefingClient from './YouTubeBriefingClient';

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
}

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: '9zmUJIeKGWo',
    title: '내과실 높은 교통사고 치료비 공제 문제 해결 : 자상 담보 선지급 처리 방법',
    published: '2026. 6. 12.'
  },
  {
    id: 'T04PI99YjNA',
    title: '병원에서 대장점막내암(D01)코드를 받았는데, 이거 일반암으로 받을 수 있나요?',
    published: '2026. 6. 4.'
  },
  {
    id: 'ur-2qcXQEKA',
    title: '보험사가 티눈 시술은 수술이 아니라고 지급을 거절할 때 객관적으로 대응하는 방법',
    published: '2026. 6. 1.'
  },
  {
    id: 'RiBX0eA_Dv8',
    title: '업무 중 교통사고 났을 때, 산재보험과 자동차보험 중 무엇을 먼저 처리해야 하나요?',
    published: '2026. 5. 29.'
  },
  {
    id: '8cenLJ13he4',
    title: '십자인대파열 후유장해 장해율 낮게 산정됐다면? 텔로스(Telos) 측정과 재감정 신청 절차',
    published: '2026. 5. 27.'
  },
  {
    id: 's1t1jczxTxg',
    title: '⚖️보험사 의료자문 동의서, 무조건 서명하면 안 되는 이유와 올바른 대처법',
    published: '2026. 5. 25.'
  }
];

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
      }).filter(v => v.id).slice(0, 10); // 가로 슬라이더를 위해 10개 로드
    }
  } catch (error) {
    console.error('Failed to fetch YouTube RSS:', error);
  }

  // RSS 피드 조회 실패 또는 데이터가 비어있을 경우 실시간 실제 유튜브 영상 목록을 폴백으로 제공
  if (videos.length === 0) {
    videos = FALLBACK_VIDEOS;
  }

  return <YouTubeBriefingClient videos={videos} />;
}
