import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, ArrowLeft, Save, AlertCircle, CheckCircle2, Phone, School, GraduationCap } from 'lucide-react';
import Navbar from '../components/Navbar';

const MyPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });

    // 수정용 상태
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const teacherSession = localStorage.getItem('teacherSession');
        const generalUser = localStorage.getItem('user');
        
        let sessionData = null;
        if (teacherSession) sessionData = JSON.parse(teacherSession);
        else if (generalUser) sessionData = JSON.parse(generalUser);

        if (!sessionData) {
            navigate('/dt');
            return;
        }
        setUserData(sessionData);
        setEmail(sessionData.email || '');
        setIsLoading(false);
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: null, text: '' });

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        if (password && password.length < 8) {
            setMessage({ type: 'error', text: '비밀번호는 최소 8자 이상이어야 합니다.' });
            return;
        }

        setIsSaving(true);
        try {
            const updates = { email };
            if (password) updates.password = password;

            const res = await fetch(`/api/v1/teachers/${userData.id}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('teacherSession', JSON.stringify(updatedUser));
                setUserData(updatedUser);
                setMessage({ type: 'success', text: '회원 정보가 성공적으로 수정되었습니다.' });
                setPassword('');
                setConfirmPassword('');
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.message || '수정 중 오류가 발생했습니다.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '서버 연결 오류가 발생했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">로딩 중...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar isLoggedIn={true} userData={userData} handleLogout={() => {
                localStorage.removeItem('teacherSession');
                localStorage.removeItem('user-role');
                navigate('/dt');
            }} />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-bold group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>뒤로가기</span>
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">마이페이지</h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">내 정보를 확인하고 관리하세요</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden p-8 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100 mb-6">
                                <User size={48} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">{userData.name} 선생님</h2>
                            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-1">Teacher Account</p>
                            
                            <div className="mt-8 space-y-4 text-left">
                                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <School className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">소속 학교</p>
                                        <p className="text-sm font-bold text-slate-700">{userData.schoolName || '미지정'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <GraduationCap className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">담당 학급</p>
                                        <p className="text-sm font-bold text-slate-700">{userData.grade}학년 {userData.classNum}반</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <Phone className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">연락처</p>
                                        <p className="text-sm font-bold text-slate-700">{userData.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white p-10">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">보안 및 프로필 설정</h3>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
                                        <Mail size={14} />
                                        <span>이메일 주소</span>
                                    </label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                        placeholder="이메일을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
                                            <Lock size={14} />
                                            <span>새 비밀번호</span>
                                        </label>
                                        <input 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            placeholder="변경 시에만 입력"
                                        />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
                                            <ShieldCheck size={14} />
                                            <span>비밀번호 확인</span>
                                        </label>
                                        <input 
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                            placeholder="한 번 더 입력하세요"
                                        />
                                    </div>
                                </div>

                                {message.text && (
                                    <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                        <span className="text-sm font-bold">{message.text}</span>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:bg-slate-300"
                                    >
                                        <Save size={20} />
                                        <span>{isSaving ? '저장 중...' : '설정 저장하기'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Tip */}
                        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start space-x-4">
                            <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-amber-800 font-bold text-sm">보안 알림</h4>
                                <p className="text-amber-700/70 text-xs font-semibold mt-1 leading-relaxed">
                                    비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상으로 설정하는 것이 안전합니다. 주기적인 비밀번호 변경으로 소중한 정보를 보호하세요.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyPage;
