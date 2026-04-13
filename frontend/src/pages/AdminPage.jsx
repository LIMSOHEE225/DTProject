import React, { useState, useEffect } from 'react';
import { Shield, ClipboardList, Trash2, Edit2, Users, Search, ChevronRight } from 'lucide-react';

const AdminPage = () => {
    // localStorage에서 현재 학교 정보 가져오기
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentSchool = savedUser.schoolName || '테스트 학교';

    const [teachers, setTeachers] = useState([]);
    const [teacherData, setTeacherData] = useState({
        id: null,
        name: '',
        teacherId: '',
        password: '',
        email: '',
        phone: '',
        grade: '',
        classNum: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 선생님 목록 불러오기
    const fetchTeachers = async () => {
        try {
            const response = await fetch(`/api/v1/teachers/school/${encodeURIComponent(currentSchool)}`);
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!window.confirm("선생님 정보를 수정하시겠습니까?")) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/v1/teachers/${teacherData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...teacherData,
                    schoolName: currentSchool,
                    neisSchoolCode: savedUser.neisSchoolCode || '',
                    phoneNumber: teacherData.phone
                })
            });

            if (response.ok) {
                alert('수합된 정보로 수정되었습니다.');
                resetForm();
                fetchTeachers();
            } else {
                const err = await response.json();
                alert(err.message || '처리 중 오류 발생');
            }
        } catch (error) {
            alert('서버 통신 오류');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (t) => {
        setTeacherData({
            id: t.id,
            name: t.name,
            teacherId: t.teacherId,
            password: '',
            email: t.email,
            phone: t.phoneNumber,
            grade: t.grade || '',
            classNum: t.classNum || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('해당 선생님을 탈퇴(삭제)하시겠습니까?')) return;
        try {
            const response = await fetch(`/api/v1/teachers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('탈퇴 처리가 완료되었습니다.');
                fetchTeachers();
            }
        } catch (error) {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const resetForm = () => {
        setTeacherData({ id: null, name: '', teacherId: '', password: '', email: '', phone: '', grade: '', classNum: '' });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-20">
                <div className="p-8 border-b border-slate-800">
                    <h1 className="text-xl font-bold flex items-center space-x-2">
                        <Shield className="text-red-500" />
                        <span>관리자 패널</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{currentSchool}</p>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <button className="w-full flex items-center space-x-3 p-4 bg-red-500 rounded-2xl font-black shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-95 text-white">
                        <Users size={20} />
                        <span>교사 목록</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-4 hover:bg-slate-800 rounded-2xl font-bold text-slate-400 transition-all">
                        <ClipboardList size={20} />
                        <span>교사 현황</span>
                    </button>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Systems</p>
                        <button className="w-full flex items-center space-x-3 p-4 hover:bg-slate-800 rounded-2xl font-bold text-slate-400 transition-all">
                            <ChevronRight size={16} />
                            <span>환경 설정</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-12 flex justify-between items-end">
                        <div className="animate-in slide-in-from-left duration-500">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-200">
                                    <Users className="text-white" size={32} />
                                </div>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                                    선생님 목록
                                </h2>
                            </div>
                            <p className="text-slate-500 font-bold ml-1 text-lg">디지털 교과서 시스템에 가입된 모든 교직원 명단을 모니터링합니다.</p>
                        </div>
                        <div className="bg-white px-8 py-5 rounded-[28px] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center space-x-5 animate-in slide-in-from-right duration-500">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                <Users className="text-red-500" size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Verified Staff</p>
                                <p className="text-2xl font-black text-slate-800"><span className="text-red-500">{teachers.length}</span> 명</p>
                            </div>
                        </div>
                    </header>

                    {/* Teacher List Table Section */}
                    <div className="bg-white rounded-[45px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 flex items-center space-x-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span>교사 마스터 데이터베이스</span>
                            </h3>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                                <input className="pl-14 pr-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-base font-bold outline-none focus:border-red-500 focus:bg-white transition-all w-[450px] shadow-sm" placeholder="관리할 선생님 성함 또는 아이디 검색..." />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/40">
                                        <th className="px-10 py-6">ID 식별자</th>
                                        <th className="px-10 py-6">성함</th>
                                        <th className="px-10 py-6">담당 정보</th>
                                        <th className="px-10 py-6">연락처</th>
                                        <th className="px-10 py-6">이메일 계정</th>
                                        <th className="px-10 py-6 text-center">액션 제어</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {teachers.map((t, index) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-10 py-6">
                                                <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black tracking-widest uppercase border border-slate-200/50">{t.teacherId}</span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center font-black text-slate-400 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                                                        {t.name?.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-slate-900 text-xl tracking-tighter">{t.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-base font-black text-slate-600">
                                                {t.grade ? <span className="text-red-500">{t.grade}</span> : '-'}<span className="text-slate-400 text-sm font-bold ml-0.5">학년</span> {t.classNum ? <span className="text-red-500">{t.classNum}</span> : '-'}<span className="text-slate-400 text-sm font-bold ml-0.5">반</span>
                                            </td>
                                            <td className="px-10 py-6 font-bold text-slate-700 text-base font-mono">{t.phoneNumber || '-'}</td>
                                            <td className="px-10 py-6 font-bold text-slate-400 text-sm italic underline decoration-slate-200 underline-offset-4">{t.email || '-'}</td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <button onClick={() => handleEdit(t)} className="flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-sm shadow-sm active:scale-95 group/btn">
                                                        <Edit2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                                        <span>정보 수정</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id)} className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-black text-sm shadow-sm active:scale-95 group/btn">
                                                        <Trash2 size={16} className="group-hover/btn:shake" />
                                                        <span>교사 탈퇴</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {teachers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-10 py-48 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-6 opacity-40">
                                                    <Users size={80} />
                                                    <div className="space-y-1">
                                                        <p className="text-2xl font-black text-slate-800">등록된 데이터가 없습니다.</p>
                                                        <p className="font-bold">선생님들이 개별 가입을 완료하면 이곳에 표시됩니다.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit Modal Popup */}
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={resetForm}></div>
                        <div className="relative w-full max-w-2xl bg-white rounded-[60px] shadow-[0_40px_120px_rgba(0,0,0,0.4)] p-16 overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"></div>
                            <header className="mb-12">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Edit2 className="text-blue-600" size={32} />
                                    </div>
                                    <span>교사 정보 수정</span>
                                </h2>
                                <p className="text-slate-400 font-bold mt-5 text-xl ml-2 leading-relaxed italic">가입된 선생님의 정보를 정확히 업데이트 해주세요.</p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Master Name</label>
                                        <input className="w-full px-8 py-6 bg-slate-50 border-3 border-transparent rounded-[30px] focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-2xl text-slate-900 shadow-inner" value={teacherData.name} onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-3">Teacher ID (Fixed)</label>
                                        <input className="w-full px-8 py-6 bg-slate-100 border-none rounded-[30px] font-black text-2xl text-slate-300 cursor-not-allowed italic tracking-widest" value={teacherData.teacherId} readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-3">Private Contact</label>
                                        <input className="w-full px-8 py-6 bg-slate-50 border-3 border-transparent rounded-[30px] focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-2xl text-slate-900 shadow-inner" placeholder="010-0000-0000" value={teacherData.phone} onChange={(e) => setTeacherData({ ...teacherData, phone: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-3">E-mail Auth Address</label>
                                        <input type="email" className="w-full px-8 py-6 bg-slate-50 border-3 border-transparent rounded-[30px] focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-2xl text-slate-900 shadow-inner" placeholder="teacher@school.com" value={teacherData.email} onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-3">Current Grade</label>
                                        <input type="number" className="w-full px-8 py-6 bg-slate-50 border-3 border-transparent rounded-[30px] focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-2xl text-slate-900 shadow-inner" placeholder="학년" value={teacherData.grade} onChange={(e) => setTeacherData({ ...teacherData, grade: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[14px] font-black text-slate-400 uppercase tracking-widest ml-3">Class No.</label>
                                        <input type="number" className="w-full px-8 py-6 bg-slate-50 border-3 border-transparent rounded-[30px] focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-2xl text-slate-900 shadow-inner" placeholder="반" value={teacherData.classNum} onChange={(e) => setTeacherData({ ...teacherData, classNum: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex space-x-8 pt-6">
                                    <button type="button" onClick={resetForm} className="flex-1 py-7 bg-slate-100 text-slate-500 rounded-[35px] font-black text-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm">취소</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-7 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[35px] font-black text-2xl shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] hover:brightness-110 hover:-translate-y-1 transition-all active:scale-95 disabled:bg-slate-300">
                                        {isSubmitting ? '수정 중...' : '수정하기'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
