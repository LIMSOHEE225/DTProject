import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Plus, Search, Pencil, Trash2, ChevronRight, Megaphone, X, Save, AlertCircle } from 'lucide-react';

const NoticePage = () => {
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null); // 상세보기
    const [isEditing, setIsEditing] = useState(false); // 작성/수정 모달
    const [editData, setEditData] = useState({ title: '', content: '' });
    const [confirmDelete, setConfirmDelete] = useState(null); // 삭제 확인

    // 세션 정보
    const teacherSession = localStorage.getItem('teacherSession');
    const isTeacher = !!teacherSession;
    const teacherData = isTeacher ? JSON.parse(teacherSession) : null;

    // 로그인 상태 (Navbar용)
    const isLoggedIn = !!localStorage.getItem('teacherSession') || !!localStorage.getItem('studentSession') || localStorage.getItem('isLoggedIn') === 'true';
    const navUserData = teacherData || JSON.parse(localStorage.getItem('studentSession') || localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        ['teacherSession', 'studentSession', 'user', 'isLoggedIn', 'user-role'].forEach(k => localStorage.removeItem(k));
        navigate('/');
    };

    const fetchNotices = async () => {
        setIsLoading(true);
        const res = await fetch('/api/v1/notices');
        const data = await res.json();
        setNotices(data);
        setIsLoading(false);
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleSave = async () => {
        if (!editData.title.trim() || !editData.content.trim()) return;
        const payload = {
            ...editData,
            authorName: teacherData?.name || '관리자',
            authorId: teacherData?.teacherId || '',
        };
        if (editData.id) {
            await fetch(`/api/v1/notices/${editData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            await fetch('/api/v1/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }
        setIsEditing(false);
        setEditData({ title: '', content: '' });
        setSelected(null);
        fetchNotices();
    };

    const handleDelete = async (id) => {
        await fetch(`/api/v1/notices/${id}`, { method: 'DELETE' });
        setConfirmDelete(null);
        setSelected(null);
        fetchNotices();
    };

    const filtered = notices.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar isLoggedIn={isLoggedIn} userData={navUserData} handleLogout={handleLogout} />

            {/* 작성/수정 모달 */}
            {isEditing && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800">{editData.id ? '공지사항 수정' : '공지사항 작성'}</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">제목</label>
                                <input
                                    className="w-full mt-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                    placeholder="공지사항 제목을 입력하세요"
                                    value={editData.title}
                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">내용</label>
                                <textarea
                                    rows={8}
                                    className="w-full mt-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                                    placeholder="공지사항 내용을 입력하세요"
                                    value={editData.content}
                                    onChange={e => setEditData({ ...editData, content: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">취소</button>
                            <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2">
                                <Save size={18} /><span>저장하기</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">공지사항을 삭제하시겠습니까?</h3>
                        <p className="text-slate-500 text-sm font-semibold mb-6">삭제된 공지사항은 복구할 수 없습니다.</p>
                        <div className="flex space-x-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200">취소</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600">삭제</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 상세 보기 슬라이드 패널 */}
            {selected && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Megaphone size={20} /></div>
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">공지사항</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {isTeacher && (
                                    <>
                                        <button
                                            onClick={() => { setEditData({ id: selected.id, title: selected.title, content: selected.content }); setIsEditing(true); }}
                                            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl font-bold text-sm transition-all"
                                        >
                                            <Pencil size={14} /><span>수정</span>
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(selected.id)}
                                            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-xl font-bold text-sm transition-all"
                                        >
                                            <Trash2 size={14} /><span>삭제</span>
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="p-8 flex-1">
                            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-3">{selected.title}</h1>
                            <div className="flex items-center space-x-3 text-sm text-slate-400 font-semibold mb-8 pb-8 border-b border-slate-100">
                                <span>{selected.authorName}</span>
                                <span>·</span>
                                <span>{formatDate(selected.createdAt)}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{selected.content}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 메인 콘텐츠 */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* 헤더 */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">아이소식</p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">공지사항</h1>
                    </div>
                    {isTeacher && (
                        <button
                            onClick={() => { setEditData({ title: '', content: '' }); setIsEditing(true); }}
                            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            <Plus size={18} />
                            <span>공지 작성</span>
                        </button>
                    )}
                </div>

                {/* 검색 */}
                <div className="relative mb-8">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        className="w-full pl-14 pr-5 py-4 bg-white border-2 border-transparent rounded-2xl font-semibold text-slate-700 outline-none focus:border-indigo-500 shadow-sm transition-all"
                        placeholder="제목 또는 내용으로 검색…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* 목록 */}
                {isLoading ? (
                    <div className="text-center py-20 text-slate-400 font-bold">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                        <Megaphone className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold">공지사항이 없습니다.</p>
                        {isTeacher && <p className="text-slate-300 text-sm mt-1">위의 '공지 작성' 버튼으로 첫 공지를 등록해 보세요!</p>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((notice, i) => (
                            <div
                                key={notice.id}
                                onClick={() => setSelected(notice)}
                                className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {filtered.length - i}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{notice.title}</p>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{notice.authorName} · {formatDate(notice.createdAt)}</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-4" size={20} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default NoticePage;
