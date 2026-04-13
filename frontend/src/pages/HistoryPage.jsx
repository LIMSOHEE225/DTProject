import React from 'react';
import Navbar from '../components/Navbar';
import { Calendar } from 'lucide-react';

const HistoryPage = () => {
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

  const developmentSteps = [
    { day: 'Day 1', title: '아키텍처 설계 및 환경 구축', desc: 'React와 Spring Boot 기반의 전용 아키텍처를 설계하고 개발 환경을 최적화했습니다.' },
    { day: 'Day 2', title: '보안 및 인증 시스템 구현', desc: 'Spring Security를 도입하여 실무 수준의 강력한 사용자 인증 및 보안 체계를 구축했습니다.' },
    { day: 'Day 3', title: '교과서 뷰어 엔진 개발', desc: '디지털 캔버스와 PDF 렌더링을 결합한 독자적인 학습 뷰어 프로토타입을 완성했습니다.' },
    { day: 'Day 4', title: '실시간 동기화 시스템 탑재', desc: 'WebSocket과 STOMP 프로토콜을 활용해 교사와 학생 간 1:N 실시간 화면 동기화를 구현했습니다.' },
    { day: 'Day 5', title: '생성형 AI(Gemini) 연동', desc: '구글 Gemini AI를 연동하여 맞춤형 문제 생성 및 자동 채점 로직을 성공적으로 도입했습니다.' },
    { day: 'Day 6', title: '관리 시스템 및 대시보드', desc: '학습 데이터를 시각화하는 대시보드와 체계적인 학생 관리 기능을 완성했습니다.' },
    { day: 'Day 7', title: '최종 Polishing 및 배포', desc: '전체 UI/UX의 디테일을 다듬고 통합 테스트를 거쳐 서비스 품질을 극대화했습니다.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />
      <main className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center space-x-3 mb-12">
            <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-200">
              <Calendar size={32} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">연혁 / 개발 일지</h2>
            <span className="ml-auto bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-black text-sm">1 Week Build</span>
          </div>

          <div className="relative border-l-4 border-purple-100 ml-6 pl-10 space-y-12">
            {developmentSteps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[3.4rem] top-0 w-8 h-8 bg-white border-4 border-purple-600 rounded-full group-hover:bg-purple-600 transition-colors duration-300 z-10 shadow-lg shadow-purple-200"></div>
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all">
                  <span className="text-purple-600 font-black text-lg uppercase tracking-tighter mb-2 block">{step.day}</span>
                  <h4 className="text-xl font-black text-slate-800 mb-2">{step.title}</h4>
                  <p className="text-slate-500 font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
