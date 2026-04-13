import React from 'react';
import Navbar from '../components/Navbar';
import { MapPin, Hammer } from 'lucide-react';

const DirectionsPage = () => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />
      <main className="flex-grow flex items-center justify-center py-24">
        <div className="bg-white rounded-[3rem] p-20 shadow-2xl border border-slate-100 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-10">
            <Hammer size={48} className="animate-bounce" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">&lt;준비 중...&gt;</h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            더 정확하고 친절한 안내를 위해 <br/>
            지도를 준비하고 있습니다. 조금만 기다려주세요!
          </p>
          <div className="mt-12 flex items-center justify-center space-x-2 text-slate-300">
            <MapPin size={20} />
            <span className="font-bold tracking-widest uppercase text-sm">Location Services is coming soon</span>
          </div>
        </div>
      </main>
      <footer className="bg-white py-10 text-center opacity-30">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">© 2026 DTProject Location Service</p>
      </footer>
    </div>
  );
};

export default DirectionsPage;
