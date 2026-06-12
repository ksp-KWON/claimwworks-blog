import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = '보상스쿨 공식 블로그';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d93025" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#d93025', marginLeft: 16 }}>보상스쿨</span>
          </div>
          
          <h1
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: '#202124',
              lineHeight: 1.3,
              marginTop: 0,
              marginBottom: 10,
              wordBreak: 'keep-all',
            }}
          >
            보상스쿨 공식 블로그
          </h1>
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#5f6368',
              margin: 0,
              wordBreak: 'keep-all',
            }}
          >
            교통사고 · 후유장해 · 실손의료비 · 보험금 청구 전문 가이드
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
