import { ImageResponse } from 'next/og';
import { getPostData, getSortedPostsData } from '@/lib/posts';

export function generateStaticParams() {
  const posts = getSortedPostsData(false);
  return posts.map((post) => ({ slug: post.slug }));
}

export const alt = '보상스쿨 블로그';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostData(params.slug);
  const title = post ? post.title : '보상스쿨 헬스케어 & 손해사정 보상가이드';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#202124', // Google Dark
          backgroundImage: 'radial-gradient(circle at 25px 25px, #303134 2%, transparent 0%), radial-gradient(circle at 75px 75px, #303134 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '60px 80px',
            borderRadius: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxWidth: '1000px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#1a73e8', marginLeft: 16 }}>보상스쿨</span>
          </div>
          
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: '#202124',
              lineHeight: 1.3,
              marginTop: 0,
              marginBottom: 0,
              wordBreak: 'keep-all',
            }}
          >
            {title}
          </h1>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
