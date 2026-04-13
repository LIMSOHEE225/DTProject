import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, BookOpen } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);
  const [findIdData, setFindIdData] = useState({ name: '', phoneNumber: '' });
  const [findPwData, setFindPwData] = useState({ teacherId: '', name: '', phoneNumber: '', email: '' });
  const [findIdResult, setFindIdResult] = useState('');
  const [findPwResult, setFindPwResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: formData.userId,
          password: formData.password
        })
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        alert('로그인 성공!');
        navigate('/');
      } else {
        const errorText = await response.text();
        let message = "로그인 정보를 확인해주세요.";
        try {
          const errorData = JSON.parse(errorText);
          message = errorData.message || message;
        } catch (e) {
          console.warn("Error parsing login error response:", errorText);
        }
        alert(message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("서버와 통신하는 중 오류가 발생했습니다.");
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
        setFindIdResult(data.teacherId);
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
      } else {
        const err = await res.json();
        alert(err.message || '일치하는 정보가 없습니다.');
      }
    } catch (e) { alert('서버 오류'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 relative overflow-hidden font-nanum">
      
      {/* Find ID Modal */}
      {showFindId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowFindId(false); setFindIdResult(''); }}></div>
              <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                  <h2 className="text-xl font-black text-slate-800 mb-6">아이디 찾기</h2>
                  
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
                          <button onClick={() => { setShowFindId(false); setFindIdResult(''); }} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black mt-4 hover:bg-slate-700 transition-all">확인</button>
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
                  <h2 className="text-xl font-black text-slate-800 mb-6">비밀번호 찾기</h2>
                  
                  {findPwResult ? (
                      <div className="text-center py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                          <div className="px-2">
                              <p className="text-slate-700 font-bold leading-relaxed">{findPwResult}</p>
                          </div>
                          <button onClick={() => { setShowFindPw(false); setFindPwResult(''); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black mt-4 hover:bg-indigo-700 transition-all">확인</button>
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
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100 rounded-full blur-[100px] opacity-40 -ml-20 -mb-20"></div>

      <div className="max-w-md w-full z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 ring-4 ring-aijoa-blue/10">
            <h1 className="text-3xl font-black text-aijoa-blue tracking-tighter">아이좋아</h1>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">반갑습니다!</h2>
          <p className="text-slate-500 font-medium tracking-tight">학교에서 발급받은 아이디로 로그인해 주세요</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">아이디</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-aijoa-blue" size={20} />
              <input 
                type="text" 
                placeholder="ID 입력" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-aijoa-blue focus:bg-white outline-none transition-all placeholder:text-slate-300"
                required
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1 block">비밀번호</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-aijoa-blue" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-aijoa-blue focus:bg-white outline-none transition-all placeholder:text-slate-300"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <button type="button" onClick={() => setShowFindId(true)} className="text-slate-400 font-bold hover:text-aijoa-blue transition-colors">아이디 찾기</button>
            <button type="button" onClick={() => setShowFindPw(true)} className="text-aijoa-blue font-bold hover:underline transition-colors">비밀번호 찾기</button>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-aijoa-blue text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
          >
            로그인
          </button>
        </form>

        <div className="text-center space-y-4">
          <div className="text-sm text-slate-500">
            처음이신가요? 
            <Link to="/signup" className="ml-2 text-aijoa-blue font-bold hover:underline">회원가입 하기</Link>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-slate-300">
            <hr className="w-full border-slate-100" />
            <span className="whitespace-nowrap text-xs font-bold tracking-widest leading-none">OR</span>
            <hr className="w-full border-slate-100" />
          </div>
          
          <button className="flex items-center justify-center space-x-3 w-full py-3 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-4 h-4 ml-1" alt="google" />
            <span>구글 계정으로 로그인 (준비 중)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
