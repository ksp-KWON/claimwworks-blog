import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 사이트로 빌드 (Cloudflare Pages 배포용)
  // API 라우트는 로컬에서만 사용하고, 배포 시에는 정적 HTML만 올라감
  output: 'export',
  images: {
    // 정적 export 시 이미지 최적화 비활성화 필요
    unoptimized: true,
  },
};

export default nextConfig;
