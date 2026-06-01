import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exec } from 'child_process';
import path from 'path';

// 로카에서만 사용하는 관리자 API - Cloudflare 배포 시 사용 불가
export const dynamic = 'force-static';

// 세션 토큰 확인 함수
const verifyAuth = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const password = process.env.ADMIN_PASSWORD || '1234';
  const expectedToken = `session_hira_${Buffer.from(password).toString('base64')}`;
  return sessionCookie && sessionCookie.value === expectedToken;
};

export async function POST(): Promise<Response> {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  return new Promise<Response>((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts/generate-blog-post.js');
    
    // 환경에 따라 node 실행 명령 실행
    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('자동 게시글 생성 오류:', error);
        resolve(
          NextResponse.json({ 
            success: false, 
            message: '자동 생성 스크립트 실행 중 에러가 발생했습니다.', 
            error: error.message 
          }, { status: 500 })
        );
        return;
      }
      
      console.log('자동 게시글 생성 출력:', stdout);
      resolve(
        NextResponse.json({ 
          success: true, 
          message: '자동 게시글 생성이 완료되었습니다.',
          output: stdout 
        })
      );
    });
  });
}
