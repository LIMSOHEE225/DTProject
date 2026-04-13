import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, LogOut, Star, LayoutDashboard, ChevronRight, GraduationCap, LibraryBig } from 'lucide-react';

const DtDashboard = () => {
    const navigate = useNavigate();
    const [showSubjectModal, setShowSubjectModal] = React.useState(false);
    
    const role = localStorage.getItem('user-role') || 'STUDENT';
    const teacherSession = JSON.parse(localStorage.getItem('teacherSession') || '{}');
    const studentSession = JSON.parse(localStorage.getItem('studentSession') || '{}');
    
    const userName = role === 'TEACHER' ? (teacherSession.name || '선생님') : (studentSession.name || '학생');

    // --- 인증 보호: 세션이 없으면 로그인 페이지로 튕겨내기 ---
    React.useEffect(() => {
        const teacher = localStorage.getItem('teacherSession');
        const student = localStorage.getItem('studentSession');
        if (!teacher && !student) {
            navigate('/dt');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/dt');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-nanum overflow-hidden relative">
            
            {/* Subject Selection Modal Overlay */}
            {showSubjectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setShowSubjectModal(false)}
                    ></div>
                    <div className="bg-white w-full max-w-2xl rounded-[60px] p-12 shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300">
                        <header className="text-center mb-12">
                            <div className="w-16 h-1 bg-slate-100 mx-auto mb-8 rounded-full"></div>
                            <h3 className="text-4xl font-black text-slate-800 mb-3">학습 과목 선택</h3>
                            <p className="text-slate-400 font-bold">공부하고 싶은 과목을 선택해 주세요!</p>
                        </header>

                        <div className="grid grid-cols-2 gap-8">
                            <button 
                                onClick={() => window.open('/dt/viewer/1', '_blank')}
                                className="group relative p-8 bg-blue-50 rounded-[40px] border-4 border-transparent hover:border-aijoa-blue transition-all duration-300 flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-aijoa-blue shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    <LibraryBig size={36} />
                                </div>
                                <span className="text-2xl font-black text-slate-800">수학</span>
                                <span className="text-aijoa-blue text-xs font-bold mt-2 uppercase tracking-widest">Active</span>
                            </button>

                            <button 
                                onClick={() => window.open('/dt/viewer/2', '_blank')}
                                className="group relative p-8 bg-pink-50 rounded-[40px] border-4 border-transparent hover:border-pink-400 transition-all duration-300 flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-pink-400 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    <Star size={36} fill="currentColor" />
                                </div>
                                <span className="text-2xl font-black text-slate-800">영어</span>
                                <span className="text-pink-400 text-xs font-bold mt-2 uppercase tracking-widest">Active</span>
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setShowSubjectModal(false)}
                            className="mt-12 w-full py-5 bg-slate-100 text-slate-500 rounded-3xl font-black hover:bg-slate-200 transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
            
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Top Navigation Bar */}
            <nav className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 relative z-20">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-aijoa-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <LayoutDashboard size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">학습 대시보드</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Learning Management System</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3 bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role === 'TEACHER' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {role === 'TEACHER' ? <Star size={16} fill="currentColor" /> : <GraduationCap size={18} />}
                        </div>
                        <span className="font-bold text-slate-700">
                            {role === 'TEACHER' ? <span className="text-orange-500 mr-1 italic">Teacher</span> : <span className="text-blue-500 mr-1 italic">Student</span>}
                            <span className="font-black">{userName}</span> 님
                        </span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-100"
                    >
                        로그아웃
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col items-center justify-center p-10 relative z-10">
                
                <header className="text-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-4 leading-tight">
                        반가워요! <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-aijoa-blue to-indigo-600">오늘의 학습을 시작해볼까요?</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-medium">참여하고 싶은 메뉴를 선택해 주세요.</p>
                </header>

                <div className={`grid gap-10 w-full max-w-5xl ${role === 'TEACHER' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
                    
                    {/* Course Button */}
                    <button 
                        onClick={() => setShowSubjectModal(true)}
                        className="group relative bg-white border border-slate-100 p-1 bg-gradient-to-br from-white to-slate-50 rounded-[50px] shadow-[0_20px_50px_rgba(37,99,235,0.08)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)] transition-all duration-500 hover:-translate-y-3"
                    >
                        <div className="p-12 flex flex-col items-center">
                            <div className="w-24 h-24 bg-blue-100/50 rounded-[35px] flex items-center justify-center text-aijoa-blue mb-8 group-hover:bg-aijoa-blue group-hover:text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-inner">
                                <LibraryBig size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-2">교과목 목록</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mb-10">Subject Selection</p>
                            
                            <div className="w-full bg-slate-900 text-white flex items-center justify-center py-6 rounded-[30px] font-black text-xl gap-3 group-hover:bg-aijoa-blue transition-colors shadow-2xl">
                                <span>과목 선택하기</span>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </button>

                    {/* Student List Button - Only for Teachers */}
                    {role === 'TEACHER' && (
                        <button 
                            onClick={() => navigate('/dt/students')}
                            className="group relative bg-white border border-slate-100 p-1 bg-gradient-to-br from-white to-slate-50 rounded-[50px] shadow-[0_20px_50px_rgba(16,185,129,0.08)] hover:shadow-[0_40px_80px_rgba(16,185,129,0.15)] transition-all duration-500 hover:-translate-y-3"
                        >
                            <div className="p-12 flex flex-col items-center">
                                <div className="w-24 h-24 bg-emerald-100/50 rounded-[35px] flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 shadow-inner">
                                    <Users size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 mb-2">학생 목록</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mb-10">Attendance Management</p>
                                
                                <div className="w-full bg-slate-100 text-slate-500 flex items-center justify-center py-6 rounded-[30px] font-black text-xl gap-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <span>관리 페이지로 이동</span>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </button>
                    )}

                </div>

                {/* Footer Info */}
                <footer className="mt-20 flex items-center space-x-4 opacity-30 select-none">
                    <div className="w-12 h-0.5 bg-slate-300"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Digital Education OS Edition</span>
                    <div className="w-12 h-0.5 bg-slate-300"></div>
                </footer>

            </main>
        </div>
    );
};

export default DtDashboard;
