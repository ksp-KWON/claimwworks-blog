import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 로그인 세션 단순 고정 토큰 (보안성을 위해 환경변수 패스워드로 검증)
const getSessionToken = () => {
  const password = process.env.ADMIN_PASSWORD || '1234';
  // 간단한 해시처럼 보이게 패스워드와 고정 문자열 조합
  return `session_hira_${Buffer.from(password).toString('base64')}`;
};

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD || '1234';

    if (password === correctPassword) {
      const cookieStore = await cookies();
      const token = getSessionToken();
      
      // 세션 쿠키 설정 (하루 유지)
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1일
        path: '/',
      });

      return NextResponse.json({ success: true, message: '로그인에 성공했습니다.' });
    }

    return NextResponse.json({ success: false, message: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    const expectedToken = getSessionToken();

    if (sessionCookie && sessionCookie.value === expectedToken) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true, message: '로그아웃 되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '로그아웃 실패' }, { status: 500 });
  }
}
