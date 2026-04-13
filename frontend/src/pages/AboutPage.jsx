import React from 'react';
import Navbar from '../components/Navbar';
import { HelpCircle, Star, Calendar, MapPin, CheckCircle2, Award, Zap, Users } from 'lucide-react';

const AboutPage = () => {
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

      <main className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Section 1: 디지털교과서란? */}
          <section id="what-is-dt" className="mb-32">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                <HelpCircle size={32} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">디지털교과서란?</h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col md:row gap-12 items-center">
              <div className="md:w-1/2">
                <p className="text-xl text-slate-600 leading-relaxed mb-6">
                  단순히 종이 책을 화면으로 옮긴 것이 아닙니다. <br/>
                  <span className="text-blue-600 font-black">멀티미디어 콘텐츠, 인터랙티브 도구, 그리고 AI 분석</span>이 결합된 지능형 학습 플랫폼입니다.
                </p>
                <div className="space-y-4">
                  {[
                    { t: '상호작용성', d: '교사와 학생이 실시간으로 자료를 공유하고 피드백을 주고받습니다.' },
                    { t: '개인별 맞춤화', d: 'AI가 학생의 실력을 분석해 수준에 맞는 문제를 자동으로 제공합니다.' },
                    { t: '풍부한 리소스', d: '3D 모델링, 동영상, 가상 실험 등을 통해 직관적인 이해를 돕습니다.' },
                    { t: '접근 편의성', d: '언제 어디서든 다양한 기기로 학습을 이어갈 수 있습니다.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <CheckCircle2 size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800">{item.t}</h4>
                        <p className="text-slate-500 text-sm">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 w-full aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-1 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="text-white text-center p-8">
                  <Star size={64} className="mx-auto mb-6 text-yellow-300 animate-pulse" />
                  <h3 className="text-3xl font-black mb-4 uppercase">Advanced<br/>Learning</h3>
                  <p className="text-blue-100 font-medium italic">"The Future of Education is Digital"</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: 인사말 */}
          <section id="greetings" className="mb-32">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-200">
                <Award size={32} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">인사말</h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-12 shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-slate-50">
                <Users size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-slate-800 mb-8">"어제보다 행복한 아이, 오늘보다 밝은 미래"</h3>
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
                  <p>반갑습니다. 아이좋아 프로젝트 팀입니다.</p>
                  <p>
                    우리는 교육 기술(Edutech)이 차갑고 기계적인 것이 아니라, 아이들의 호기심을 자극하고 선생님의 교육 열정을 북돋는 <strong>'가장 따뜻한 도구'</strong>가 되어야 한다고 믿습니다. 
                  </p>
                  <p>
                    '아이좋아'는 모든 아이가 자신만의 속도로 세상을 배우고, 그 과정에서 성취감과 즐거움을 느낄 수 있도록 설계되었습니다. 우리는 복잡한 교육의 과제를 최첨단 기술로 해결하며, 대한민국 교육 혁신의 든든한 파트너가 되겠습니다.
                  </p>
                  <p className="text-slate-400 mt-12">– 아이좋아 개발팀 및 임직원 일동</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: 연혁/소개 (1주일 개발기) */}
          <section id="history" className="mb-32">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-200">
                  <Calendar size={32} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">연혁 / 개발 일지</h2>
              </div>
              <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-black text-sm">Project Timeline: 1 Week</span>
            </div>

            <div className="relative border-l-4 border-purple-100 ml-6 pl-10 space-y-12 py-4">
              {developmentSteps.map((step, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[3.4rem] top-0 w-8 h-8 bg-white border-4 border-purple-600 rounded-full group-hover:bg-purple-600 transition-colors duration-300 z-10 shadow-lg shadow-purple-200"></div>
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:border-purple-200 transition-all transform hover:-translate-x-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-purple-600 font-black text-lg uppercase tracking-tighter">{step.day}</span>
                      <div className="h-px bg-slate-100 flex-grow"></div>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-2">{step.title}</h4>
                    <p className="text-slate-500 font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: 오시는 길 */}
          <section id="directions">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-200">
                <MapPin size={32} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">오시는 길</h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200 border border-slate-100">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 mb-2">아이좋아 에듀테크 센터</h3>
                <p className="text-slate-500 font-bold flex items-center space-x-2">
                  <MapPin size={18} className="text-red-500" />
                  <span>대전 서구 둔산로 52 미라클빌딩 3층 301호</span>
                </p>
              </div>

              <div className="aspect-[21/9] bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-50 flex items-center justify-center relative group">
                {/* Mock Map View */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=36.3504,127.3845&zoom=16&size=1000x500&scale=2')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60"></div>
                <div className="relative z-10 text-center">
                   <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-2xl animate-bounce">
                     <MapPin size={32} />
                   </div>
                   <button className="px-6 py-3 bg-white text-slate-800 rounded-xl font-bold shadow-xl hover:bg-slate-50 transition-colors">
                     네이버 지도로 보기
                   </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-3 flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs">P</span>
                    <span>주차 안내</span>
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">건물 내 지하 주차장 이용 시 최대 2시간 무료 주차를 지원합니다. (미라클빌딩 전용 주차장)</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-3 flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs">🚆</span>
                    <span>대중교통</span>
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">대전 지하철 1호선 시청역 7번 출구에서 도보 약 5분 거리에 위치해 있습니다.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 py-10 text-white text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 DTProject Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
