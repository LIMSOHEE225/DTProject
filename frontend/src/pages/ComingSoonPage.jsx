import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Construction, ArrowLeft } from 'lucide-react';

const ComingSoonPage = ({ title = '준비 중입니다' }) => {
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('teacherSession') || !!localStorage.getItem('studentSession') || localStorage.getItem('isLoggedIn') === 'true';
    const navUserData = JSON.parse(localStorage.getItem('teacherSession') || localStorage.getItem('studentSession') || localStorage.getItem('user') || 'null');
    const handleLogout = () => {
        ['teacherSession', 'studentSession', 'user', 'isLoggedIn', 'user-role'].forEach(k => localStorage.removeItem(k));
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar isLoggedIn={isLoggedIn} userData={navUserData} handleLogout={handleLogout} />
            <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-400 shadow-xl shadow-amber-50 mb-8">
                    <Construction size={48} />
                </div>
                <h1 className="text-4xl font-black text-slate-800 mb-3">준비 중입니다</h1>
                <p className="text-slate-400 font-semibold text-lg mb-10">더 좋은 서비스로 곧 찾아뵙겠습니다. 조금만 기다려 주세요! 🙏</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                >
                    <ArrowLeft size={18} />
                    <span>이전 페이지로</span>
                </button>
            </main>
        </div>
    );
};

export default ComingSoonPage;
