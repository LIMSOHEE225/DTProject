import React from 'react';
import Navbar from '../components/Navbar';
import { Zap, ShieldAlert, Target, MessagesSquare, MonitorPlay, FileBarChart, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const DtIntroPage = () => {
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

  const features = [
    {
      id: 1,
      title: "실시간 교사-학생 화면 동기화",
      problem: "학생이 교과서 화면을 띄워놓고 몰래 게임을 하거나 유튜브를 봐도 파악하기 힘들고, 기기 조작이 미숙한 학생들을 돕느라 정작 수업 흐름이 끊깁니다.",
      solution: "교사 모드 클릭 시 모든 학생의 탭이 교사와 실시간 연결됩니다. 교사가 페이지를 넘기면 전체 학생 화면이 동시에 전환되며, 메모장 대시보드가 활성화되어 실시간 판서 교육이 가능합니다.",
      icon: <MonitorPlay className="text-blue-500" size={40} />,
      color: "blue"
    },
    {
      id: 2,
      title: "AI 월간 학습 분석 및 자동 발송",
      problem: "수준 차이가 많이 나는 학급에서 모든 학생을 동시에 이끌고 가기가 더 어려워졌고, 학습 부진 학생이 어디서 막혔는지 실시간으로 알기 어렵습니다.",
      solution: "한 달간의 모든 학습 및 문제풀이 데이터를 AI가 분석합니다. 부족한 개념과 부진 요인을 파악하여 선생님의 탭으로 월 1회 자동 발송함으로써 개별 학생의 기술적 케어를 돕습니다.",
      icon: <FileBarChart className="text-purple-500" size={40} />,
      color: "purple"
    },
    {
      id: 3,
      title: "수업 집중 전용 잠금(Lock) 모드",
      problem: "수업 시간 중 아이들이 다른 화면이나 외부 사이트로 이동하여 집중력이 분산되는 현상이 빈번합니다.",
      solution: "'수업 시작' 버튼 클릭 시 학생들의 화면 잠금모드가 활성화되어 다른 화면 이동을 방지합니다. 단, 태블릿 내 필기나 노트 기능은 유지하여 학습 연속성을 보장합니다.",
      icon: <Lock className="text-orange-500" size={40} />,
      color: "orange"
    },
    {
      id: 4,
      title: "지능형 채점 및 개별 맞춤 피드백",
      problem: "다수의 학생에게 개별화된 상세한 오답 분석과 격려의 메시지를 일일이 전달하기에는 물리적인 한계가 있습니다.",
      solution: "자동 채점은 물론, 아이들의 문제 풀이 패턴을 분석하여 부족한 개념을 화면에 즉시 출력합니다. 응원과 함께 구체적인 취약점(응용력 등)을 짚어주는 맞춤 메시지를 제공합니다.",
      icon: <MessagesSquare className="text-green-500" size={40} />,
      color: "green"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />

      <main className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <span className="inline-block bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-6">Competition Entry</span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter">
              왜 <span className="text-aijoa-blue underline decoration-wavy underline-offset-8">아이좋아</span> 디지털 교과서인가?
            </h2>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
              기존 디지털 교육의 한계를 넘어서는 4가지 혁신적 솔루션. <br/>
              우리는 선생님의 고민을 기술로 해결합니다.
            </p>
          </div>

          <div className="space-y-12">
            {features.map((f, idx) => (
              <div key={f.id} className={`flex flex-col lg:flex-row items-stretch gap-0 rounded-[3rem] overflow-hidden border-2 border-slate-100 shadow-2xl hover:border-${f.color}-200 transition-all group`}>
                {/* Left Side: The Problem */}
                <div className="lg:w-2/5 bg-slate-50 p-12 flex flex-col justify-center border-r border-slate-100">
                  <div className="flex items-center space-x-2 text-red-500 mb-6 font-black uppercase text-sm tracking-widest">
                    <ShieldAlert size={18} />
                    <span>Current Shortcoming</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-400 mb-4 italic leading-snug">"{f.problem}"</h3>
                  <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
                </div>

                {/* Right Side: The Solution */}
                <div className="lg:w-3/5 p-12 bg-white flex flex-col justify-center relative overflow-hidden">
                   <div className={`absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:scale-110 transition-transform duration-700`}>
                     {f.icon}
                   </div>
                   <div className="mb-8 p-4 bg-slate-50 rounded-2xl w-fit">
                     {f.icon}
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 mb-6">{f.title}</h3>
                   <div className="flex items-start space-x-4">
                     <div className="mt-1.5">
                       <CheckCircle2 size={24} className="text-green-500" />
                     </div>
                     <p className="text-xl text-slate-600 leading-relaxed font-bold">
                       {f.solution}
                     </p>
                   </div>
                   
                   {/* Specific Examples for Competition (Mock Data Visualization) */}
                   {f.id === 4 && (
                     <div className="mt-8 p-6 bg-green-50 border-2 border-green-100 rounded-3xl">
                       <p className="text-green-800 font-bold mb-2 flex items-center space-x-2">
                         <Zap size={16} />
                         <span>AI 피드백 예시</span>
                       </p>
                       <p className="text-green-700 italic font-medium leading-relaxed">
                         "<strong>20/20</strong> : 응용력이 부족합니다. 3+2=5와 같은 기초적인 것은 가능하지만, 3+(5-2)+3과 같은 중간에 (5-2)의 응용이 들어가면 틀립니다. 이 부분만 하신다면 만점! 가능합니다! 부족한 개념을 체크해서 공부할 수 있도록 응원을 담은 문제 한 마디!"
                       </p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>

          <section className="mt-32 text-center bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <h2 className="text-4xl font-black mb-8 relative z-10">교육 현장의 문제를 해결하는 실질적인 기술</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto relative z-10 font-medium">
              아이좋아는 단순한 기능 나열이 아닌, 현직 선생님들과 학생들의 목소리를 담아 <br/>
              가장 필요로 하는 솔루션을 구현했습니다.
            </p>
            <button className="bg-aijoa-blue hover:bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/20 transition-all flex items-center space-x-3 mx-auto relative z-10">
              <span>서비스 시연 예약하기</span>
              <ArrowRight size={24} />
            </button>
          </section>
        </div>
      </main>

      <footer className="bg-white py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-black tracking-widest uppercase">© 2026 AiJoa Project - Competition Submission Edition</p>
      </footer>
    </div>
  );
};

export default DtIntroPage;
