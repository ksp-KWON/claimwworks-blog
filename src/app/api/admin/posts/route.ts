import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// 세션 토큰 확인 함수
const verifyAuth = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const password = process.env.ADMIN_PASSWORD || '1234';
  const expectedToken = `session_hira_${Buffer.from(password).toString('base64')}`;
  return sessionCookie && sessionCookie.value === expectedToken;
};

// 1. 블로그 포스트 조회 (전체 목록 or 단일 상세)
export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    if (slug) {
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ success: false, message: '포스트를 찾을 수 없습니다.' }, { status: 404 });
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return NextResponse.json({
        slug,
        title: data.title || '',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        summary: data.summary || '',
        category: data.category || '',
        tags: data.tags || [],
        content,
        published: data.published !== false,
      });
    }

    // 전체 리스트
    const fileNames = fs.readdirSync(POSTS_DIR);
    const posts = fileNames
      .filter((file) => file.endsWith('.md'))
      .map((fileName) => {
        const fileSlug = fileName.replace(/\.md$/, '');
        const filePath = path.join(POSTS_DIR, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        return {
          slug: fileSlug,
          title: data.title || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          summary: data.summary || '',
          category: data.category || '',
          published: data.published !== false,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '포스트 조회 중 에러가 발생했습니다.' }, { status: 500 });
  }
}

// 2. 블로그 포스트 등록
export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { slug, title, date, summary, category, tags, content, published } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ success: false, message: '필수 항목(Slug, 제목, 내용)이 누락되었습니다.' }, { status: 400 });
    }

    // 슬러그 포맷팅 (소문자, 하이픈 등)
    slug = slug.toLowerCase().replace(/[^a-z0-9가-힣-]/g, '-');
    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: '이미 존재하는 슬러그(파일명)입니다. 다른 슬러그를 지정해 주세요.' }, { status: 400 });
    }

    // [이식 규칙] 한글 기호 정렬 적용 (요약 : 서, 대응 : 자 등)
    content = content.replace(/([가-힣]+)\s*:\s*/g, '$1 : ');

    const frontmatter = {
      title,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary || '',
      category: category || '일반',
      tags: Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published: published !== false,
    };

    const fileContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    return NextResponse.json({ success: true, slug });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '포스트 등록 중 에러가 발생했습니다.' }, { status: 500 });
  }
}

// 3. 블로그 포스트 수정
export async function PUT(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { originalSlug, slug, title, date, summary, category, tags, content, published } = body;

    if (!originalSlug || !slug || !title || !content) {
      return NextResponse.json({ success: false, message: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    slug = slug.toLowerCase().replace(/[^a-z0-9가-힣-]/g, '-');
    const oldPath = path.join(POSTS_DIR, `${originalSlug}.md`);
    const newPath = path.join(POSTS_DIR, `${slug}.md`);

    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ success: false, message: '기존 포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (originalSlug !== slug && fs.existsSync(newPath)) {
      return NextResponse.json({ success: false, message: '수정하려는 슬러그명이 이미 존재합니다.' }, { status: 400 });
    }

    // [이식 규칙] 한글 기호 정렬 적용 (요약 : 서, 대응 : 자 등)
    content = content.replace(/([가-힣]+)\s*:\s*/g, '$1 : ');

    const frontmatter = {
      title,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary || '',
      category: category || '일반',
      tags: Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published: published !== false,
    };

    const fileContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(oldPath, fileContent, 'utf8');

    // 슬러그가 달라진 경우 파일 이름 변경
    if (originalSlug !== slug) {
      fs.renameSync(oldPath, newPath);
    }

    return NextResponse.json({ success: true, slug });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '포스트 수정 중 에러가 발생했습니다.' }, { status: 500 });
  }
}

// 4. 블로그 포스트 삭제
export async function DELETE(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, message: '슬러그가 누락되었습니다.' }, { status: 400 });
    }

    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: '해당 포스트가 존재하지 않습니다.' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true, message: '성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '포스트 삭제 중 에러가 발생했습니다.' }, { status: 500 });
  }
}
