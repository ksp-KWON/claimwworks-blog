import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import medicalInfo from '../../../../../public/data/medical-info.json';

// 세션 토큰 확인 함수
const verifyAuth = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const password = process.env.ADMIN_PASSWORD || '1234';
  const expectedToken = `session_hira_${Buffer.from(password).toString('base64')}`;
  return sessionCookie && sessionCookie.value === expectedToken;
};

// 클라우드플레어 환경 대응: 파일 시스템 쓰기가 불가능하므로 메모리 내 가상 DB 역할을 수행합니다.
// (실제 저장하려면 로컬에서 파일을 수정하고 git push해야 합니다.)
let hospitalsData = [...medicalInfo];

// 1. 전체 병원 목록 가져오기
export async function GET() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  return NextResponse.json(hospitalsData);
}

// 2. 새로운 병원 등록하기
export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const newHosp = await request.json();

    // 필수값 검증
    if (!newHosp.name || !newHosp.region || !newHosp.specialty) {
      return NextResponse.json({ success: false, message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const item = {
      id: newHosp.id || `hosp-${Date.now()}`,
      name: newHosp.name,
      region: newHosp.region,
      specialty: newHosp.specialty,
      address: newHosp.address || '',
      treated: false
    };

    hospitalsData.push(item);
    console.warn("Cloudflare 환경: 병원이 메모리에 임시 등록되었습니다. 영구 저장을 원하시면 public/data/medical-info.json 파일을 로컬에서 수정하고 git push 하십시오.");

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '병원 등록 중 에러가 발생했습니다.' }, { status: 500 });
  }
}

// 3. 병원 정보 수정하기 (예: treated 상태 변경 또는 전체 데이터 수정)
export async function PUT(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const updatedHosp = await request.json();

    const index = hospitalsData.findIndex((h: any) => h.id === updatedHosp.id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: '해당 병원을 찾을 수 없습니다.' }, { status: 404 });
    }

    hospitalsData[index] = {
      ...hospitalsData[index],
      ...updatedHosp
    };

    console.warn("Cloudflare 환경: 병원 정보가 메모리에 임시 수정되었습니다.");
    return NextResponse.json({ success: true, data: hospitalsData[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '병원 수정 중 에러가 발생했습니다.' }, { status: 500 });
  }
}

// 4. 병원 정보 삭제하기
export async function DELETE(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID가 누락되었습니다.' }, { status: 400 });
    }

    const initialLen = hospitalsData.length;
    hospitalsData = hospitalsData.filter((h: any) => h.id !== id);

    if (hospitalsData.length === initialLen) {
      return NextResponse.json({ success: false, message: '해당 병원을 찾을 수 없습니다.' }, { status: 404 });
    }

    console.warn("Cloudflare 환경: 병원이 메모리에서 임시 삭제되었습니다.");
    return NextResponse.json({ success: true, message: '성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '병원 삭제 중 에러가 발생했습니다.' }, { status: 500 });
  }
}
