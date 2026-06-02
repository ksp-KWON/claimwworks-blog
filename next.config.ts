import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 사이트로 빌드 (Cloudflare Pages 배포용)
  // API 라우트는 로컬(개발)에서만 관리자용으로 사용하므로, 개발 모드에서는 동적 API가 작동하도록 export 비활성화
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  images: {
    // 정적 export 시 이미지 최적화 비활성화 필요
    unoptimized: true,
  },
};

export default nextConfig;
