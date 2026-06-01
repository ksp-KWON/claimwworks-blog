import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import matter from 'gray-matter';
import postsDataInitial from '../../../../../src/lib/posts-data.json';

// 세션 토큰 확인 함수
const verifyAuth = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const password = process.env.ADMIN_PASSWORD || '1234';
  const expectedToken = `session_hira_${Buffer.from(password).toString('base64')}`;
  return sessionCookie && sessionCookie.value === expectedToken;
};

// 클라우드플레어 환경 대응: 메모리상에 가상의 포스트 DB를 유지합니다.
// (실제 저장하려면 로컬에서 마크다운 파일을 만들고 git push 해야 합니다.)
let posts: any[] = [...postsDataInitial];

// 1. 블로그 포스트 조회 (전체 목록 or 단일 상세)
export async function GET(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const post = posts.find((p) => p.slug === slug);
      if (!post) {
        return NextResponse.json({ success: false, message: '포스트를 찾을 수 없습니다.' }, { status: 404 });
      }

      return NextResponse.json({
        slug: post.slug,
        title: post.title || '',
        date: post.date ? new Date(post.date).toISOString().split('T')[0] : '',
        summary: post.summary || '',
        category: post.category || '',
        tags: post.tags || [],
        content: post.content || '',
        published: post.published !== false,
      });
    }

    // 전체 리스트 (최신순)
    const list = posts
      .map((p) => ({
        slug: p.slug,
        title: p.title || '',
        date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
        summary: p.summary || '',
        category: p.category || '',
        published: p.published !== false,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json(list);
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

    slug = slug.toLowerCase().replace(/[^a-z0-9가-힣-]/g, '-');

    if (posts.some((p) => p.slug === slug)) {
      return NextResponse.json({ success: false, message: '이미 존재하는 슬러그(파일명)입니다. 다른 슬러그를 지정해 주세요.' }, { status: 400 });
    }

    // 한글 기호 정렬 적용 (요약 : 서, 대응 : 자 등)
    content = content.replace(/([가-힣]+)\s*:\s*/g, '$1 : ');

    const newPost = {
      slug,
      title,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary || '',
      category: category || '일반',
      tags: Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published: published !== false,
      content,
    };

    posts.push(newPost);
    console.warn("Cloudflare 환경: 포스트가 메모리에 임시 등록되었습니다. 영구 저장을 원하시면 src/content/posts 폴더 내에 마크다운 파일을 생성하고 git push 하십시오.");

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
    const index = posts.findIndex((p) => p.slug === originalSlug);

    if (index === -1) {
      return NextResponse.json({ success: false, message: '기존 포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (originalSlug !== slug && posts.some((p) => p.slug === slug)) {
      return NextResponse.json({ success: false, message: '수정하려는 슬러그명이 이미 존재합니다.' }, { status: 400 });
    }

    // 한글 기호 정렬 적용 (요약 : 서, 대응 : 자 등)
    content = content.replace(/([가-힣]+)\s*:\s*/g, '$1 : ');

    posts[index] = {
      slug,
      title,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary || '',
      category: category || '일반',
      tags: Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published: published !== false,
      content,
    };

    console.warn("Cloudflare 환경: 포스트가 메모리에 임시 수정되었습니다.");
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

    const initialLen = posts.length;
    posts = posts.filter((p) => p.slug !== slug);

    if (posts.length === initialLen) {
      return NextResponse.json({ success: false, message: '해당 포스트가 존재하지 않습니다.' }, { status: 404 });
    }

    console.warn("Cloudflare 환경: 포스트가 메모리에서 임시 삭제되었습니다.");
    return NextResponse.json({ success: true, message: '성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '포스트 삭제 중 에러가 발생했습니다.' }, { status: 500 });
  }
}
