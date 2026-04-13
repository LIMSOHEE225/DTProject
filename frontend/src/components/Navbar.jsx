import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, LogOut, ChevronDown, Info, GraduationCap, Megaphone, Settings, HelpCircle, User } from 'lucide-react';

const Navbar = ({ isLoggedIn, userData, handleLogout }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (idx) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(idx);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 400);
  };

  const menuItems = [
    {
      title: '디지털교과서란?',
      icon: <HelpCircle size={16} />,
      path: '/dt-intro'
    },
    {
      title: '아이소개',
      icon: <Info size={16} />,
      subItems: [
        { name: '인사말', path: '/about/greetings' },
        { name: '연혁/소개', path: '/about/history' },
        { name: '<준비 중...>', path: '/about/directions' },
      ]
    },
    {
      title: '아이학습',
      icon: <GraduationCap size={16} />,
      subItems: [
        { name: '창의 놀이', path: '/learning/creative' },
        { name: 'AI 맞춤 학습', path: '/learning/ai' },
      ]
    },
    {
      title: '아이소식',
      icon: <Megaphone size={16} />,
      subItems: [
        { name: '공지사항', path: '/notice' },
        { name: '교육 뉴스', path: '/coming-soon' },
        { name: '이벤트', path: '/coming-soon' },
      ]
    }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-aijoa-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl font-bold">i</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
              아이좋아<span className="text-aijoa-blue">.</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 h-full">
            {menuItems.map((item, idx) => (
              <div 
                key={idx}
                className="relative group px-4 h-full flex items-center"
                onMouseEnter={() => item.subItems && handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              >
                {item.subItems ? (
                  <>
                    <button className="flex items-center space-x-1.5 text-[15px] font-bold text-slate-600 hover:text-aijoa-blue transition-colors">
                      <span>{item.title}</span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === idx ? 'rotate-180 text-aijoa-blue' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute top-full left-0 w-56 pt-4 -mt-4 transform transition-all duration-300 origin-top-left ${activeMenu === idx ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-3">
                        <div className="flex items-center space-x-2 px-3 py-2 mb-2 border-b border-slate-50">
                          <div className="p-1.5 bg-blue-50 text-aijoa-blue rounded-lg">
                            {item.icon}
                          </div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{item.title}</span>
                        </div>
                        {item.subItems.map((sub, sIdx) => (
                          <Link 
                            key={sIdx} 
                            to={sub.path}
                            className="block px-3 py-2.5 text-[14px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-aijoa-blue rounded-xl transition-all"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link 
                    to={item.path}
                    className="flex items-center space-x-1.5 text-[15px] font-bold text-slate-600 hover:text-aijoa-blue transition-colors"
                  >
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
            {isLoggedIn && (
              <button 
                onClick={() => window.open('/admin', '_blank')}
                className="ml-4 flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"
              >
                <Settings size={14} />
                <span>관리자 페이지</span>
              </button>
            )}
            <button 
              onClick={() => navigate('/dt')}
              className="ml-3 flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-100 active:scale-95"
            >
              <BookOpen size={14} />
              <span>디지털 교과서</span>
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          
          {!isLoggedIn ? (
            <div className="flex items-center space-x-3 text-sm font-bold">
              <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-aijoa-blue transition-colors">로그인</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-aijoa-blue text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">회원가입</Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Welcome back</span>
                <span className="text-[15px] font-bold text-slate-800">
                   {userData?.name || '홍길동'} <span className="text-aijoa-blue">선생님</span>
                </span>
              </div>
              <button 
                onClick={() => navigate('/dt/mypage')}
                className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-xs font-bold border border-slate-200 transition-all active:scale-95 group shadow-sm"
              >
                <User size={14} className="group-hover:text-aijoa-blue transition-colors" />
                <span>마이페이지</span>
              </button>
              <button 
                onClick={handleLogout} 
                className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all group"
                title="로그아웃"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
