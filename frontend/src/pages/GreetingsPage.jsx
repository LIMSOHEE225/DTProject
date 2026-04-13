import React from 'react';
import Navbar from '../components/Navbar';
import { Award, Users } from 'lucide-react';

const GreetingsPage = () => {
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
    <div className="min-h-screen bg-slate-50">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />
      <main className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="bg-white rounded-[3rem] p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-blue-50/50">
                <Users size={200} />
              </div>
              <div className="relative z-10">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-3xl w-fit mb-8">
                  <Award size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">"어제보다 행복한 아이, 오늘보다 밝은 미래"</h2>
                <div className="space-y-8 text-xl text-slate-600 leading-relaxed font-medium">
                  <p>반갑습니다. 아이좋아 프로젝트 팀입니다.</p>
                  <p>
                    우리는 교육 기술(Edutech)이 차갑고 기계적인 것이 아니라, 아이들의 호기심을 자극하고 선생님의 교육 열정을 북돋는 <strong>'가장 따뜻한 도구'</strong>가 되어야 한다고 믿습니다. 
                  </p>
                  <p>
                    '아이좋아'는 모든 아이가 자신만의 속도로 세상을 배우고, 그 과정에서 성취감과 즐거움을 느낄 수 있도록 설계되었습니다. 우리는 복잡한 교육의 과제를 최첨단 기술로 해결하며, 대한민국 교육 혁신의 든든한 파트너가 되겠습니다.
                  </p>
                  <div className="pt-12 border-t border-slate-100">
                    <p className="text-slate-900 font-black">아이좋아 개발팀 및 임직원 일동</p>
                    <p className="text-slate-400 text-sm mt-1 tracking-widest font-bold">DTProject Founders & Developers</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default GreetingsPage;
