import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Lock } from 'lucide-react';

const TeacherLoginPage = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // localStorage에서 현재 학교 정보 가져오기
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentSchool = savedUser.schoolName || '테스트 학교';

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (code.length !== 8) return;

        setIsVerifying(true);
        try {
            const response = await fetch('/api/v1/teachers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: code
                })
            });

            if (response.ok) {
                const teacher = await response.json();
                localStorage.setItem('teacherSession', JSON.stringify(teacher));
                localStorage.setItem('isTeacherLoggedIn', 'true');
                navigate('/dt'); // 대시보드로 이동
            } else {
                alert('유효하지 않은 비밀번호입니다. 다시 확인해주세요.');
                setCode('');
            }
        } catch (error) {
            alert('로그인 처리 중 오류 발생');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-6 shadow-2xl shadow-blue-500/20">
                        <Lock className="text-blue-400" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-3 tracking-tighter">Digital Textbook</h1>
                    <p className="text-slate-400 font-medium">관리자로부터 발급받은 비밀번호를 입력하세요.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 p-10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                                <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Secret Code</label>
                                <input 
                                    type="password"
                                    value={code}
                                    onChange={handleCodeChange}
                                    placeholder="Password"
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-3xl font-black text-white text-center tracking-[0.5em] focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 placeholder:tracking-normal placeholder:text-xl"
                                    autoFocus
                                />
                        </div>

                        <button 
                            disabled={!code || isVerifying}
                            className="group w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-xl shadow-blue-900/20"
                        >
                            <span>{isVerifying ? 'Verifying...' : 'Access Platform'}</span>
                            {!isVerifying && <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-center space-x-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center space-x-1">
                            <ShieldCheck size={14} className="text-blue-500/50" />
                            <span>End-to-End Encrypted</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>{currentSchool} Secure Login</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLoginPage;
