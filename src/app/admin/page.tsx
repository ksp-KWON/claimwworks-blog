'use strict';
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Hospital {
  id: string;
  name: string;
  region: string;
  specialty: string;
  address: string;
  treated: boolean;
}

interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  published: boolean;
}

interface PostDetail extends Post {
  tags: string[];
  content: string;
  originalSlug?: string;
}

// 날짜 포맷팅을 위한 헬퍼 함수
const formatDateString = (dateVal?: string) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'hospitals' | 'posts'>('hospitals');

  // 데이터 상태
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // 로딩 및 알림
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 병원 편집/등록 폼 모달 상태
  const [hospModalOpen, setHospModalOpen] = useState(false);
  const [hospForm, setHospForm] = useState<Partial<Hospital>>({
    id: '',
    name: '',
    region: '',
    specialty: '',
    address: '',
    treated: false,
  });

  // 블로그 편집/등록 폼 모달 상태
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postForm, setPostForm] = useState<Partial<PostDetail>>({
    slug: '',
    originalSlug: '', // 슬러그 수정용
    title: '',
    date: '',
    summary: '',
    category: '병원보상가이드',
    tags: [],
    content: '',
    published: true,
  });

  // 인증 여부 체크
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          setAuthChecking(false);
          loadAllData();
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [hRes, pRes] = await Promise.all([
        fetch('/api/admin/hospitals'),
        fetch('/api/admin/posts')
      ]);

      if (hRes.ok) setHospitals(await hRes.json());
      if (pRes.ok) setPosts(await pRes.json());
    } catch (err) {
      showMsg('데이터를 불러오는 데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // --- 병원 관리 기능들 ---
  const handleOpenHospModal = (hosp?: Hospital) => {
    if (hosp) {
      setHospForm(hosp);
    } else {
      setHospForm({
        id: '',
        name: '',
        region: '',
        specialty: '',
        address: '',
        treated: false,
      });
    }
    setHospModalOpen(true);
  };

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!hospForm.id;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/hospitals', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospForm),
      });

      if (res.ok) {
        showMsg(isEdit ? '병원 정보가 수정되었습니다.' : '새로운 병원이 추가되었습니다.');
        setHospModalOpen(false);
        loadAllData();
      } else {
        const d = await res.json();
        showMsg(d.message || '저장에 실패했습니다.', 'error');
      }
    } catch (err) {
      showMsg('네트워크 통신 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm('정말 이 병원 정보를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/hospitals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMsg('병원 정보가 성공적으로 삭제되었습니다.');
        loadAllData();
      } else {
        showMsg('삭제에 실패했습니다.', 'error');
      }
    } catch (err) {
      showMsg('네트워크 통신 오류가 발생했습니다.', 'error');
    }
  };

  const handleToggleTreated = async (hosp: Hospital) => {
    try {
      const res = await fetch('/api/admin/hospitals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hosp, treated: !hosp.treated }),
      });
      if (res.ok) {
        showMsg(`[${hosp.name}] 상태가 변경되었습니다.`);
        loadAllData();
      } else {
        showMsg('상태 변경에 실패했습니다.', 'error');
      }
    } catch (err) {
      showMsg('네트워크 통신 오류가 발생했습니다.', 'error');
    }
  };

  // --- 블로그 관리 기능들 ---
  const handleOpenPostModal = async (slug?: string) => {
    if (slug) {
      setIsEditingPost(true);
      try {
        const res = await fetch(`/api/admin/posts?slug=${slug}`);
        if (res.ok) {
          const detail: PostDetail = await res.json();
          setPostForm({
            slug: detail.slug,
            originalSlug: detail.slug,
            title: detail.title,
            date: formatDateString(detail.date),
            summary: detail.summary,
            category: detail.category,
            tags: detail.tags,
            content: detail.content,
            published: detail.published !== false,
          });
          setPostModalOpen(true);
        } else {
          showMsg('글 세부 내용을 불러올 수 없습니다.', 'error');
        }
      } catch (err) {
        showMsg('글 로드 중 오류 발생', 'error');
      }
    } else {
      setIsEditingPost(false);
      setPostForm({
        slug: '',
        originalSlug: '',
        title: '',
        date: formatDateString(new Date().toISOString()),
        summary: '',
        category: '병원보상가이드',
        tags: [],
        content: '',
        published: true,
      });
      setPostModalOpen(true);
    }
  };

  // 저장 API 실행 (두 번째 매개변수로 새창 열기 옵션 지원)
  const handleSavePost = async (e: React.FormEvent, openNewTab = false) => {
    e.preventDefault();
    const method = isEditingPost ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });

      if (res.ok) {
        showMsg(isEditingPost ? '블로그 포스트가 수정되었습니다.' : '새 블로그 포스트가 등록되었습니다.');
        setPostModalOpen(false);
        loadAllData();

        // 저장 후 즉시 새 창으로 미리보기 실행
        if (openNewTab) {
          setTimeout(() => {
            window.open(`/blog/${postForm.slug}`, '_blank');
          }, 300);
        }
      } else {
        const d = await res.json();
        showMsg(d.message || '포스트 저장에 실패했습니다.', 'error');
      }
    } catch (err) {
      showMsg('네트워크 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm('정말 이 포스트를 삭제하시겠습니까? (마크다운 파일이 영구 삭제됩니다)')) return;

    try {
      const res = await fetch(`/api/admin/posts?slug=${slug}`, { method: 'DELETE' });
      if (res.ok) {
        showMsg('포스트가 성공적으로 삭제되었습니다.');
        loadAllData();
      } else {
        showMsg('포스트 삭제에 실패했습니다.', 'error');
      }
    } catch (err) {
      showMsg('네트워크 오류가 발생했습니다.', 'error');
    }
  };

  // AI 자동 포스트 생성 기능 작동
  const handleAutoGeneratePost = async () => {
    if (generating) return;
    setGenerating(true);
    showMsg('Gemini AI가 고품질 블로그 글을 생성 중입니다. 잠시만 기다려 주세요 (약 5~15초 소요)...', 'success');

    try {
      const res = await fetch('/api/admin/generate', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showMsg('🎉 AI 포스트 자동 생성 완료! 목록을 새로고침합니다.');
        loadAllData();
      } else {
        showMsg(data.message || 'AI 생성에 실패했습니다.', 'error');
      }
    } catch (err) {
      showMsg('스크립트 실행 중 시간 초과 또는 네트워크 오류가 발생했습니다.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 font-medium">관리자 권한 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* 1. 상단 정보 바 */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-150 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            ⚙️ 관리자 제어 패널
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            의료 통계 및 교통사고 합의 가이드 콘텐츠와 병원 목록 데이터를 손쉽게 제어합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
          >
            🔓 로그아웃
          </button>
        </div>
      </div>

      {/* 2. 상태 알림 메시지 배너 */}
      {message.text && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center gap-2 transition-all ${
          message.type === 'error' 
            ? 'bg-rose-50 border-rose-150 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400' 
            : 'bg-emerald-50 border-emerald-150 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
        }`}>
          <span>🔔</span>
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* 3. 인프라 대시보드 탭 네비게이션 및 생성 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'hospitals'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600'
            }`}
          >
            🏥 대상 병원 DB ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600'
            }`}
          >
            ✍️ 포스트 관리 ({posts.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === 'hospitals' ? (
            <button
              onClick={() => handleOpenHospModal()}
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              ➕ 새 병원 등록
            </button>
          ) : (
            <>
              <button
                onClick={handleAutoGeneratePost}
                disabled={generating}
                className="px-4.5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
              >
                🪄 {generating ? 'AI 작성 중...' : 'Gemini AI로 글 자동생성'}
              </button>
              <button
                onClick={() => handleOpenPostModal()}
                className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                ➕ 수동 포스트 작성
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. 데이터 본문 뷰어 */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">데이터 로드 중...</div>
        ) : activeTab === 'hospitals' ? (
          /* 병원 목록 리스트 */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-100 dark:border-zinc-800">
                  <th className="p-4 w-[100px]">ID</th>
                  <th className="p-4">병원명</th>
                  <th className="p-4">지역</th>
                  <th className="p-4">과목</th>
                  <th className="p-4">작성 여부</th>
                  <th className="p-4 text-center w-[180px]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {hospitals.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 text-slate-400 font-mono">{hosp.id}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{hosp.name}</td>
                    <td className="p-4 text-slate-600 dark:text-zinc-400">{hosp.region}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 font-medium rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                        {hosp.specialty}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleTreated(hosp)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                          hosp.treated
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/50'
                        }`}
                      >
                        {hosp.treated ? '✅ 작성 완료' : '⏳ 미작성'}
                      </button>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleOpenHospModal(hosp)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(hosp.id)}
                        className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
                {hospitals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">등록된 병원이 존재하지 않습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* 블로그 목록 리스트 */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-100 dark:border-zinc-800">
                  <th className="p-4">날짜/시간</th>
                  <th className="p-4">공개상태</th>
                  <th className="p-4">제목</th>
                  <th className="p-4">슬러그</th>
                  <th className="p-4">카테고리</th>
                  <th className="p-4 text-center w-[180px]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 text-slate-550 whitespace-nowrap font-medium">{post.date.replace('T', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        post.published !== false 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50' 
                          : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50'
                      }`}>
                        {post.published !== false ? '🌐 공개' : '🔒 비공개'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{post.title}</td>
                    <td className="p-4 text-slate-400 font-mono">{post.slug}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleOpenPostModal(post.slug)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.slug)}
                        className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">등록된 마크다운 포스트가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- 병원 모달 창 --- */}
      {hospModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-6">
              {hospForm.id ? '🏥 병원 정보 수정' : '🏥 새 병원 정보 추가'}
            </h3>
            <form onSubmit={(e) => handleSaveHospital(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">병원명</label>
                <input
                  type="text"
                  required
                  value={hospForm.name || ''}
                  onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                  placeholder="예: 서울바른척추의원"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">지역</label>
                  <input
                    type="text"
                    required
                    value={hospForm.region || ''}
                    onChange={(e) => setHospForm({ ...hospForm, region: e.target.value })}
                    placeholder="예: 서울 강남구"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">과목</label>
                  <input
                    type="text"
                    required
                    value={hospForm.specialty || ''}
                    onChange={(e) => setHospForm({ ...hospForm, specialty: e.target.value })}
                    placeholder="예: 정형외과"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">상세 주소</label>
                <input
                  type="text"
                  value={hospForm.address || ''}
                  onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
                  placeholder="예: 서울특별시 강남구 테헤란로 123"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setHospModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md shadow-blue-500/10"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 포스트 작성/편집 모달 창 --- */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl h-[90vh] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4 flex-shrink-0">
              {isEditingPost ? '✍️ 포스트 수정' : '✍️ 새 블로그 포스트 작성'}
            </h3>
            
            <form onSubmit={(e) => handleSavePost(e, false)} className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">파일명</label>
                    <input
                      type="text"
                      required
                      value={postForm.slug || ''}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      placeholder="예: 2026-05-29-seoul-info"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">카테고리</label>
                    <input
                      type="text"
                      required
                      value={postForm.category || ''}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      placeholder="예: 병원보상가이드"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">작성일</label>
                    <input
                      type="date"
                      required
                      value={postForm.date || ''}
                      onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">공개 상태</label>
                    <select
                      value={postForm.published ? 'true' : 'false'}
                      onChange={(e) => setPostForm({ ...postForm, published: e.target.value === 'true' })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 font-bold"
                    >
                      <option value="true" className="text-emerald-600 font-bold">🌐 공개로 발행</option>
                      <option value="false" className="text-rose-600 font-bold">🔒 비공개로 보관</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">블로그 제목</label>
                  <input
                    type="text"
                    required
                    value={postForm.title || ''}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="제목 입력"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">요약 설명 (Subtitle)</label>
                  <input
                    type="text"
                    value={postForm.summary || ''}
                    onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                    placeholder="메인 페이지 및 목록에 노출될 설명글"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={Array.isArray(postForm.tags) ? postForm.tags.join(', ') : postForm.tags || ''}
                    onChange={(e) => setPostForm({ ...postForm, tags: e.target.value.split(',').map((t: string) => t.trim()) } as any)}
                    placeholder="예: 교통사고, 지불보증, 후유장해"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-[250px]">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">본문 마크다운 (Markdown)</label>
                  <textarea
                    required
                    value={postForm.content || ''}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    placeholder="마크다운 문법으로 내용을 입력하세요..."
                    className="w-full flex-1 p-3.5 rounded-xl border border-slate-250 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none dark:bg-zinc-800 dark:text-zinc-100 font-mono text-[13px] leading-relaxed"
                  />
                </div>

              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-5 h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  취소
                </button>
                
                {/* 저장 후 새창 미리보기 기능 버튼 */}
                <button
                  type="button"
                  onClick={(e) => handleSavePost(e, true)}
                  className="px-5 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                >
                  💾 수정 (새창)
                </button>

                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md shadow-blue-500/10"
                >
                  수정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
