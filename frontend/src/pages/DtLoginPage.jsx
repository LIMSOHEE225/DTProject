import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, ChevronRight, School, User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const DtLoginPage = () => {
    const navigate = useNavigate();
    const [loginMode, setLoginMode] = useState('STUDENT');
    const [teacherId, setTeacherId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [studentGrade, setStudentGrade] = useState(''); // 학생 학년 입력
    const [studentClass, setStudentClass] = useState(''); // 학생 반 입력

    // --- 이미 로그인된 경우 자동 대시보드 이동 ---
    React.useEffect(() => {
        const teacher = localStorage.getItem('teacherSession');
        const student = localStorage.getItem('studentSession');
        if (teacher || student) {
            navigate('/dt/dashboard');
        }
    }, [navigate]);

    const [showSignup, setShowSignup] = useState(false);
    const [showFindId, setShowFindId] = useState(false);
    const [showFindPw, setShowFindPw] = useState(false);
    
    const [findIdData, setFindIdData] = useState({ name: '', phoneNumber: '' });
    const [findPwData, setFindPwData] = useState({ teacherId: '', name: '', phoneNumber: '', email: '' });
    const [findIdResult, setFindIdResult] = useState(''); // 아이디 찾기 결과 저장
    const [findPwResult, setFindPwResult] = useState(''); // 비밀번호 찾기 결과 메시지 저장

    const [showLoginPw, setShowLoginPw] = useState(false); // 로그인 비밀번호 보기 상태
    const [showSignupPw, setShowSignupPw] = useState(false); // 비밀번호 보기 상태
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [signupData, setSignupData] = useState({
        teacherId: '', password: '', name: '', gender: 'MALE', email: '', phoneNumber: '', grade: '', classNum: ''
    });

    const [sessionUser, setSessionUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [currentSchool, setCurrentSchool] = useState(sessionUser.schoolName || '테스트 학교');

    // --- 메인 홈페이지 세션 기반 학교 정보 동기화 ---
    React.useEffect(() => {
        const fetchLatestSchoolInfo = async () => {
            if (sessionUser?.loginId) {
                try {
                    const response = await fetch(`/api/v1/auth/user/${sessionUser.loginId}`);
                    if (response.ok) {
                        const latestData = await response.json();
                        setSessionUser(latestData);
                        if (latestData.schoolName) setCurrentSchool(latestData.schoolName);
                        
                        // --- 추가: 회원가입 폼 데이터 자동 채우기 ---
                        setSignupData(prev => ({
                            ...prev,
                            name: latestData.name || prev.name,
                            email: latestData.email || prev.email,
                            phoneNumber: latestData.phoneNumber || prev.phoneNumber
                        }));

                        // 최신 정보를 로컬스토리지에도 동기화
                        localStorage.setItem('user', JSON.stringify(latestData));
                    }
                } catch (e) {
                    console.error("School info sync error:", e);
                }
            }
        };
        fetchLatestSchoolInfo();
    }, []);

    const handleSignup = async (e) => {
        e.preventDefault();
        if(!isIdChecked) return alert('아이디 중복 확인이 필요합니다.');
        
        // 비밀번호 유효성 검사: 영문 + 숫자 + 특수문자 조합 (8~15자)
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
        if (!pwRegex.test(signupData.password)) {
            return alert('비밀번호는 영문, 숫자, 특수문자를 포함하여 8~15자 이내로 입력해 주세요.');
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...signupData,
                    schoolName: currentSchool,
                    neisSchoolCode: sessionUser.neisSchoolCode || sessionUser.loginId, // 실제 나이스 학교 코드를 전송
                    grade: parseInt(signupData.grade),
                    classNum: parseInt(signupData.classNum)
                })
            });
            if (response.ok) {
                alert('회원가입이 완료되었습니다! 로그인을 진행해 주세요.');
                setShowSignup(false);
                setSignupData({ teacherId: '', password: '', name: '', gender: 'MALE', email: '', phoneNumber: '', grade: '', classNum: '' });
                setIsIdChecked(false);
            } else {
                const err = await response.json();
                alert(err.message || '가입 중 오류 발생');
            }
        } catch (e) { alert('서버 오류'); }
        finally { setIsLoading(false); }
    };

    const checkTeacherId = async () => {
        if(!signupData.teacherId) return alert('아이디를 입력하세요.');
        try {
            const response = await fetch(`/api/v1/teachers/check-id/${signupData.teacherId}`);
            const data = await response.json();
            if(data.exists) {
                alert('이미 사용 중인 아이디입니다.');
                setIsIdChecked(false);
            } else {
                alert('사용 가능한 아이디입니다.');
                setIsIdChecked(true);
            }
        } catch (e) { alert('확인 오류'); }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = loginMode === 'TEACHER' ? '/api/v1/teachers/login' : '/api/v1/students/login';
            const body = loginMode === 'TEACHER' 
                ? { teacherId, password } 
                : { password: password }; // 학생은 비밀번호만으로 로그인

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                if (loginMode === 'TEACHER') {
                    localStorage.setItem('teacherSession', JSON.stringify(data));
                    localStorage.setItem('user-role', 'TEACHER');
                } else {
                    localStorage.setItem('studentSession', JSON.stringify(data));
                    localStorage.setItem('user-role', 'STUDENT');
                }
                navigate('/dt/dashboard');
            } else {
                const errData = await response.json();
                setError(errData.message || '인증 정보가 올바르지 않습니다.');
            }
        } catch (err) {
            setError('서버 연결을 확인해 주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindId = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/teachers/find-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(findIdData)
            });
            if (res.ok) {
                const data = await res.json();
                setFindIdResult(data.teacherId); // 결과 상태 업데이트
            } else {
                const err = await res.json();
                alert(err.message || '일치하는 정보가 없습니다.');
            }
        } catch (e) { alert('서버 오류'); }
    };

    const handleFindPw = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/v1/teachers/find-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(findPwData)
            });
            if (res.ok) {
                const data = await res.json();
                setFindPwResult(`본인 확인 완료! 가입하신 이메일(${findPwData.email})로 임시 비밀번호가 발송되었습니다.`);
                // 데모용으로 임시비번 살짝 표시 (실제 서비스에선 생략 가능)
                console.log("Temp Password:", data.tempPassword);
            } else {
                const err = await res.json();
                alert(err.message || '일치하는 정보가 없습니다.');
            }
        } catch (e) { alert('서버 오류'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-nanum overflow-hidden relative">
            
            {/* Signup Modal */}
            {showSignup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSignup(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowSignup(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
                            <ArrowRight className="rotate-180" size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center space-x-2">
                             <User className="text-indigo-600" />
                             <span>선생님 회원가입</span>
                        </h2>
                        
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">학교코드</label>
                                    <input className="w-full px-4 py-3.5 bg-slate-100 border-none rounded-2xl font-bold text-slate-400 cursor-not-allowed" value={sessionUser.neisSchoolCode || sessionUser.loginId || '0000000'} readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">학교명</label>
                                    <input className="w-full px-4 py-3.5 bg-slate-100 border-none rounded-2xl font-bold text-slate-400 cursor-not-allowed" value={currentSchool} readOnly />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">아이디 (ID)</label>
                                <div className="flex space-x-2">
                                    <input 
                                        className={`flex-grow px-4 py-3.5 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isIdChecked ? 'border-green-500 bg-green-50/20' : 'border-transparent focus:border-indigo-500'}`}
                                        placeholder="아이디를 입력하세요"
                                        value={signupData.teacherId}
                                        onChange={(e) => { setSignupData({...signupData, teacherId: e.target.value}); setIsIdChecked(false); }}
                                        required
                                    />
                                    <button type="button" onClick={checkTeacherId} className="px-4 py-3.5 bg-slate-800 text-white rounded-2xl text-xs font-bold hover:bg-slate-700 transition-colors">중복확인</button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">비밀번호</label>
                                <div className="relative group">
                                    <input 
                                        type={showSignupPw ? 'text' : 'password'} 
                                        placeholder="영문+숫자+특수문자 조합 (8~15자)" 
                                        className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all pr-12" 
                                        value={signupData.password} 
                                        onChange={(e) => setSignupData({...signupData, password: e.target.value.slice(0, 15)})} 
                                        required 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowSignupPw(!showSignupPw)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showSignupPw ? <Lock size={20} /> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-slate-300 rounded-full"></div></div>}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">성함</label>
                                <input placeholder="성함을 입력하세요" className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">학년</label>
                                    <input type="number" placeholder="예: 1" className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" value={signupData.grade} onChange={(e) => setSignupData({...signupData, grade: e.target.value})} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">반</label>
                                    <input type="number" placeholder="예: 3" className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" value={signupData.classNum} onChange={(e) => setSignupData({...signupData, classNum: e.target.value})} required />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">성별</label>
                                <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${signupData.gender === 'MALE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        onClick={() => setSignupData({...signupData, gender: 'MALE'})}
                                    > 남성 </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${signupData.gender === 'FEMALE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        onClick={() => setSignupData({...signupData, gender: 'FEMALE'})}
                                    > 여성 </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">이메일</label>
                                    <input type="email" placeholder="example@school.com" className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">연락처</label>
                                    <input placeholder="010-0000-0000" className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" value={signupData.phoneNumber} onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})} required />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:bg-slate-300 mt-4"
                            >
                                {isLoading ? '가입 처리 중...' : '회원가입 완료'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Find ID Modal */}
            {showFindId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowFindId(false); setFindIdResult(''); }}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <h2 className="text-xl font-black text-slate-800 mb-6 font-nanum">아이디 찾기</h2>
                        
                        {findIdResult ? (
                            <div className="text-center py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                                    <User size={32} />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold text-sm">찾으시는 아이디는</p>
                                    <p className="text-2xl font-black text-slate-800 mt-1">
                                        <span className="text-blue-600">"{findIdResult}"</span> 입니다.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setShowFindId(false); setFindIdResult(''); }}
                                    className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black mt-4 hover:bg-slate-700 transition-all"
                                >
                                    확인 후 돌아가기
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFindId} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">성함</label>
                                <input className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="가입하신 성함" value={findIdData.name} onChange={e => setFindIdData({...findIdData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">연락처</label>
                                <input className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="010-0000-0000" value={findIdData.phoneNumber} onChange={e => setFindIdData({...findIdData, phoneNumber: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black mt-2 hover:bg-slate-700">아이디 확인</button>
                        </form>
                        )}
                    </div>
                </div>
            )}

            {/* Find PW Modal */}
            {showFindPw && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowFindPw(false); setFindPwResult(''); }}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <h2 className="text-xl font-black text-slate-800 mb-6 font-nanum">비밀번호 찾기</h2>
                        
                        {findPwResult ? (
                            <div className="text-center py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="px-2">
                                    <p className="text-slate-700 font-bold leading-relaxed">{findPwResult}</p>
                                    <p className="text-xs text-slate-400 mt-2">메일이 오지 않았다면 스팸함도 확인해 주세요.</p>
                                </div>
                                <button 
                                    onClick={() => { setShowFindPw(false); setFindPwResult(''); }}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black mt-4 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                >
                                    메일 확인하러 가기
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFindPw} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">아이디 (ID)</label>
                                <input className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="가입하신 아이디" value={findPwData.teacherId} onChange={e => setFindPwData({...findPwData, teacherId: e.target.value})} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">성함</label>
                                <input className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="가입하신 성함" value={findPwData.name} onChange={e => setFindPwData({...findPwData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">연락처</label>
                                <input className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="010-0000-0000" value={findPwData.phoneNumber} onChange={e => setFindPwData({...findPwData, phoneNumber: e.target.value})} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">이메일</label>
                                <input type="email" className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="가입하신 이메일" value={findPwData.email} onChange={e => setFindPwData({...findPwData, email: e.target.value})} required />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black mt-2 hover:bg-indigo-700 disabled:bg-slate-300">
                                {isLoading ? '발송 중...' : '임시 비밀번호 발송'}
                            </button>
                        </form>
                        )}
                    </div>
                </div>
            )}
            
            {/* Background Decorative Blob */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl opacity-60"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo & Intro */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl border border-slate-100 mb-6 group hover:scale-110 transition-transform">
                        <School className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                        Digital <span className="text-blue-600">Textbook</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm">미래를 여는 맞춤형 학습 플랫폼</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-blue-900/10 border border-white p-10">
                    
                    {/* Role Selector Tabs */}
                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-10">
                        <button 
                            onClick={() => { setLoginMode('STUDENT'); setError(''); }}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${loginMode === 'STUDENT' ? 'bg-white shadow-lg text-blue-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <GraduationCap size={18} />
                            <span>학생</span>
                        </button>
                        <button 
                            onClick={() => { setLoginMode('TEACHER'); setError(''); }}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${loginMode === 'TEACHER' ? 'bg-white shadow-lg text-indigo-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Briefcase size={18} />
                            <span>선생님</span>
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Teacher ID or Student ID Field - 학생 모드에서는 숨김 */}
                        {loginMode === 'TEACHER' && (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Teacher ID
                                </label>
                                <div className="relative group">
                                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors`} size={20} />
                                    <input 
                                        type="text"
                                        placeholder="아이디를 입력하세요"
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all focus:border-indigo-500`}
                                        value={teacherId}
                                        onChange={(e) => setTeacherId(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-${loginMode === 'TEACHER' ? 'indigo' : 'blue'}-500 transition-colors`} size={20} />
                                <input 
                                    type={showLoginPw ? 'text' : 'password'}
                                    placeholder="비밀번호를 입력하세요"
                                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 outline-none focus:bg-white transition-all ${loginMode === 'TEACHER' ? 'focus:border-indigo-500' : 'focus:border-blue-500'}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowLoginPw(!showLoginPw)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-${loginMode === 'TEACHER' ? 'indigo' : 'blue'}-500 transition-colors`}
                                >
                                    {showLoginPw ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold leading-relaxed animate-in fade-in slide-in-from-top-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <button 
                            disabled={isLoading}
                            className={`w-full py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-95 ${loginMode === 'TEACHER' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                        >
                            <span>{isLoading ? '확인 중...' : loginMode === 'TEACHER' ? '선생님 로그인' : '학습 시작하기'}</span>
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                        <div className="mt-8 text-center bg-orange-50/50 py-3 rounded-2xl border border-orange-100/50">
                            <p className="text-[11px] font-bold text-red-500">
                                * 학생 비밀번호 문의는 <br />
                                담당 교사 및 학교에 문의해주세요
                            </p>
                        </div>

                    {/* Footer Links - 선생님 모드에서만 표시 */}
                    {loginMode === 'TEACHER' && (
                        <div className="mt-10 flex items-center justify-center space-x-4">
                            <button type="button" onClick={() => setShowSignup(true)} className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors">회원가입</button>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <button type="button" onClick={() => setShowFindId(true)} className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors">아이디 찾기</button>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <button type="button" onClick={() => setShowFindPw(true)} className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors">비밀번호 찾기</button>
                        </div>
                    )}
                </div>

                <div className="mt-10 text-center flex items-center justify-center space-x-2 text-slate-300">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Secure Connection</span>
                </div>
            </div>
        </div>
    );
};

export default DtLoginPage;
