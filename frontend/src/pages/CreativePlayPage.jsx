import React from 'react';
import Navbar from '../components/Navbar';
import { Palette, Sparkles, Clock } from 'lucide-react';

const CreativePlayPage = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />
      <main className="py-32 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative inline-block mb-10">
              <div className="w-32 h-32 bg-yellow-100 rounded-[2.5rem] flex items-center justify-center text-yellow-600 animate-pulse">
                <Palette size={56} />
              </div>
              <Sparkles className="absolute -top-4 -right-4 text-orange-400 animate-bounce" size={32} />
            </div>
            
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">
              창의 놀이 마당 <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">열심히 준비 중입니다!</span>
            </h2>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
              아이들의 무궁무진한 상상력을 자극할 <br/>
              체험형 놀이 콘텐츠와 미술, 음악 활동 자료들이 곧 공개됩니다.
            </p>
            
            <div className="inline-flex items-center space-x-3 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 text-slate-400">
               <Clock size={20} />
               <span className="font-bold tracking-widest uppercase">Coming Soon: Summer 2026</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreativePlayPage;
