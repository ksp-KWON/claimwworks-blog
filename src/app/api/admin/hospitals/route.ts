import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/medical-info.json');

// 세션 토큰 확인 함수
const verifyAuth = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const password = process.env.ADMIN_PASSWORD || '1234';
  const expectedToken = `session_hira_${Buffer.from(password).toString('base64')}`;
  return sessionCookie && sessionCookie.value === expectedToken;
};

// JSON 파일 읽기 헬퍼
function readData() {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// JSON 파일 쓰기 헬퍼
function writeData(data: any) {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// 1. 전체 병원 목록 가져오기
export async function GET() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  const data = readData();
  return NextResponse.json(data);
}

// 2. 새로운 병원 등록하기
export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const newHosp = await request.json();
    const data = readData();

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

    data.push(item);
    writeData(data);

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
    const data = readData();

    const index = data.findIndex((h: any) => h.id === updatedHosp.id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: '해당 병원을 찾을 수 없습니다.' }, { status: 404 });
    }

    data[index] = {
      ...data[index],
      ...updatedHosp
    };

    writeData(data);
    return NextResponse.json({ success: true, data: data[index] });
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

    let data = readData();
    const initialLen = data.length;
    data = data.filter((h: any) => h.id !== id);

    if (data.length === initialLen) {
      return NextResponse.json({ success: false, message: '해당 병원을 찾을 수 없습니다.' }, { status: 404 });
    }

    writeData(data);
    return NextResponse.json({ success: true, message: '성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '병원 삭제 중 에러가 발생했습니다.' }, { status: 500 });
  }
}
