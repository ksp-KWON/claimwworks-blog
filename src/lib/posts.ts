import matter from 'gray-matter';
import postsData from './posts-data.json';

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  published?: boolean;
}

// 안전하게 날짜를 문자열(YYYY-MM-DD)로 변환하는 함수
function formatDate(dateVal: unknown): string {
  if (!dateVal) return '';
  try {
    let d: Date;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else {
      d = new Date(String(dateVal));
    }
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // 날짜 변환 실패 시 원본 문자열 반환
  }
  return String(dateVal);
}

// 전체 블로그 목록을 날짜 최신순으로 가져오는 함수 (관리자용은 비공개 글 포함 가능)
export function getSortedPostsData(includeUnpublished = false): Omit<PostData, 'content'>[] {
  const allPostsData = postsData
    .map((post) => {
      return {
        slug: post.slug,
        title: post.title || '',
        date: formatDate(post.date),
        summary: post.summary || '',
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags : [],
        published: post.published !== false, // 기본값 true
      };
    })
    // 관리자가 아닐 때는 비공개(published: false) 글 필터링
    .filter((post) => includeUnpublished || post.published);

  // 날짜 최신순 정렬
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 특정 블로그 글 하나를 가져오는 함수 (비공개 글은 관리자 권한 없이 조회 불가)
export function getPostData(slug: string, includeUnpublished = false): PostData | null {
  try {
    const post = postsData.find((p) => p.slug === slug);
    if (!post) {
      return null;
    }

    const published = post.published !== false;

    // 비공개 글이고 비공개 비포함 옵션일 때 차단
    if (!published && !includeUnpublished) {
      return null;
    }

    return {
      slug,
      title: post.title || '',
      date: formatDate(post.date),
      summary: post.summary || '',
      category: post.category || '',
      tags: Array.isArray(post.tags) ? post.tags : [],
      content: post.content || '',
      published,
    };
  } catch (error) {
    console.error(`Error loading post: ${slug}`, error);
    return null;
  }
}
