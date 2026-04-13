import React from 'react';
import Navbar from '../components/Navbar';
import { BrainCircuit, Target, Zap, TrendingUp, Star, Award, MessageCircle, Play, ArrowRight } from 'lucide-react';

const AiLearningPage = () => {
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

  const dailyQuests = [
    { title: "초등 수학", subject: "분수의 덧셈", difficulty: "보통", xp: "+240 XP" },
    { title: "창의 논리", subject: "추론의 기술", difficulty: "어려움", xp: "+500 XP" },
    { title: "과학 탐구", subject: "빛의 굴절", difficulty: "쉬움", xp: "+150 XP" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />

      <main className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-6">
                <BrainCircuit className="text-blue-400" size={18} />
                <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Next-Gen AI Tutor</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight tracking-tighter">
                나보다 나를 <br/>
                더 잘 아는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI 친구</span>
              </h2>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                수억 개의 학습 데이터를 기반으로 당신의 취약점과 강점을 단 몇 초 만에 분석합니다. 오늘 당신에게 꼭 필요한 공부만 골라드려요.
              </p>
              <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/20 transition-all flex items-center space-x-3">
                <span>AI 학습 진단 시작</span>
                <Play size={20} fill="currentColor" />
              </button>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[4rem] border border-white/10 p-12 overflow-hidden backdrop-blur-3xl group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>
                
                {/* AI Visualization Graph Mockup */}
                <div className="relative h-full flex flex-col justify-center items-center">
                   <div className="w-full h-2/3 flex items-end justify-around gap-2 mb-8">
                     {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                       <div 
                        key={i} 
                        style={{ height: `${h}%` }} 
                        className={`w-6 rounded-t-lg bg-gradient-to-t ${i === 3 ? 'from-blue-400 to-cyan-300' : 'from-slate-700 to-slate-600'} transition-all duration-1000 group-hover:opacity-80`}
                       ></div>
                     ))}
                   </div>
                   <div className="text-center">
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Learning DNA Index</p>
                     <p className="text-5xl font-black text-white">98.5% <span className="text-blue-400 text-lg tracking-normal">Optimal</span></p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {/* Quest Card */}
            <div className="col-span-1 lg:col-span-2 bg-white/5 border border-white/10 rounded-[3rem] p-10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-8 text-center sm:text-left">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-500/20 rounded-2xl">
                    <Target className="text-blue-400" size={32} />
                  </div>
                  <h3 className="text-3xl font-black">오늘의 AI 퀘스트</h3>
                </div>
                <button className="hidden sm:flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
                  <span>모두보기</span>
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {dailyQuests.map((q, i) => (
                  <div key={i} className="flex flex-col sm:row items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${i === 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                        0{i+1}
                      </div>
                      <div>
                        <h4 className="font-black text-xl">{q.title}</h4>
                        <p className="text-slate-500 font-bold">{q.subject} • <span className="text-blue-400">{q.difficulty}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                      <span className="text-sm font-black text-white/50">{q.xp}</span>
                      <button className="px-6 py-2 bg-white text-slate-900 rounded-full font-black text-sm group-hover:bg-blue-400 transition-colors">Start</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Tutor Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-blue-900/40">
              <div className="absolute top-0 right-0 p-8 text-white/10 rotate-12">
                <MessageCircle size={150} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 leading-tight">지능형 튜터 <br/>24/7 가동 중</h3>
                <p className="text-blue-100 font-medium opacity-80 mb-8">모르는 문제가 생기면 언제든 질문하세요. AI 튜터가 친절하게 답해드려요.</p>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-xs text-blue-200 uppercase font-black tracking-widest mb-2">Recent Message</p>
                  <p className="text-sm font-bold text-white italic">"어제 공부한 '이차방정식' 복습 퀴즈를 준비했는데, 지금 같이 풀어볼까요?"</p>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-lg mt-8 relative z-10 hover:bg-blue-50 transition-colors">
                튜터와 대화하기
              </button>
            </div>
          </div>

          {/* Achievement Section */}
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 lg:p-20 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/20 blur-[100px]"></div>
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 blur-[120px]"></div>
             
             <h3 className="text-4xl font-black mb-12">당신을 기다리고 있는 업적들</h3>
             <div className="flex flex-wrap justify-center gap-8">
               {[
                 { icon: <Zap />, label: "7일 연속 도달", color: "orange" },
                 { icon: <TrendingUp />, label: "상승 곡선", color: "blue" },
                 { icon: <Award />, label: "마스터 클래스", color: "purple" },
                 { icon: <Star />, label: "완벽한 채점", color: "yellow" }
               ].map((a, i) => (
                 <div key={i} className="flex flex-col items-center">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-${a.color}-500/10 text-${a.color}-400 border border-${a.color}-500/20 mb-4 hover:scale-110 transition-transform cursor-pointer`}>
                     {a.icon}
                   </div>
                   <span className="text-slate-400 font-bold text-sm">{a.label}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </main>

      <footer className="py-20 text-center opacity-30 border-t border-white/5">
        <p className="text-xs font-black uppercase tracking-widest">AiJoa Adaptive Learning System v1.0</p>
      </footer>
    </div>
  );
};

export default AiLearningPage;
