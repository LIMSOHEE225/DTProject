import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Star, ArrowRight, Zap, Target, Users, Layout, Megaphone } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(
    localStorage.getItem('isLoggedIn') === 'true' || 
    localStorage.getItem('teacherSession') !== null || 
    localStorage.getItem('studentSession') !== null
  );
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    const teacherSession = localStorage.getItem('teacherSession');
    const studentSession = localStorage.getItem('studentSession');
    const generalUser = localStorage.getItem('user');
    
    if (teacherSession) setUserData(JSON.parse(teacherSession));
    else if (studentSession) setUserData(JSON.parse(studentSession));
    else if (generalUser) setUserData(JSON.parse(generalUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('teacherSession');
    localStorage.removeItem('studentSession');
    localStorage.removeItem('user-role');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-white selection:bg-aijoa-blue/10">
      <Navbar isLoggedIn={isLoggedIn} userData={userData} handleLogout={handleLogout} />

      <main>
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-3xl opacity-30"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/80 border border-blue-100 px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-aijoa-blue animate-pulse"></span>
                <span className="text-sm font-black text-aijoa-blue tracking-wider uppercase">Future Education Platform</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                아이들의 꿈이 자라는<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-aijoa-blue to-blue-400">디지털 놀이터</span>
              </h2>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                '아이좋아'는 아이들의 수준에 맞춘 AI 학습과 <br className="hidden md:block"/> 실시간 동기화 기술로 교실의 미래를 만들어갑니다.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={() => isLoggedIn ? navigate('/dt') : navigate('/login')}
                  className="w-full sm:w-auto px-10 py-5 bg-aijoa-blue text-white rounded-2xl text-lg font-black hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
                >
                  <BookOpen size={24} />
                  <span>학습 시작하기</span>
                  <ArrowRight size={20} />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
                  서비스 소개서 보기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 아이소개 (About) Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 mt-8">
                      <Zap className="text-aijoa-blue mb-4" size={32} />
                      <h4 className="font-black text-xl mb-2">실시간 혁신</h4>
                      <p className="text-slate-500 text-sm">끊김 없는 소통으로 교실의 경계를 허뭅니다.</p>
                    </div>
                    <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                      <Target className="text-orange-500 mb-4" size={32} />
                      <h4 className="font-black text-xl mb-2">맞춤형 경로</h4>
                      <p className="text-slate-500 text-sm">모든 아이에게 최적화된 학습을 제안합니다.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
                      <Users className="text-green-600 mb-4" size={32} />
                      <h4 className="font-black text-xl mb-2">함께 성장</h4>
                      <p className="text-slate-500 text-sm">교사, 학생, 학부모가 함께 소통합니다.</p>
                    </div>
                    <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100">
                      <Layout className="text-purple-600 mb-4" size={32} />
                      <h4 className="font-black text-xl mb-2">직관적 경험</h4>
                      <p className="text-slate-500 text-sm">사용자 중심의 쉽고 빠른 인터페이스.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <h3 className="text-sm font-black text-aijoa-blue uppercase tracking-[0.2em] mb-4">About 아이좋아</h3>
                <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">아이좋아가 꿈꾸는 <br/>디지털 교육의 가치</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  기술은 교육을 돕는 도구여야 합니다. 아이좋아는 단순한 디지털화를 넘어, 아이들이 즐겁게 몰입하고 교사들이 창의적으로 가르칠 수 있는 환경을 최우선으로 생각합니다. 2024년 첫 걸음을 내디딘 이후, 국내 최정상의 에듀테크 기술력을 바탕으로 성장하고 있습니다.
                </p>
                <ul className="space-y-4 mb-8 text-slate-700 font-semibold">
                  <li className="flex items-center space-x-3 text-green-600">
                    <Star size={18} fill="currentColor" />
                    <span>최첨단 AI 문제 생성 자동화 시스템</span>
                  </li>
                  <li className="flex items-center space-x-3 text-blue-600">
                    <Star size={18} fill="currentColor" />
                    <span>웹소켓 기반의 실시간 판서 동기화</span>
                  </li>
                  <li className="flex items-center space-x-3 text-orange-600">
                    <Star size={18} fill="currentColor" />
                    <span>데이터 기반 개별 학습 분석 리포트</span>
                  </li>
                </ul>
                <button className="text-aijoa-blue font-black flex items-center space-x-2 hover:space-x-4 transition-all">
                  <span>자세히 보기</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 아이학습 (Learning) Section */}
        <section className="py-24 bg-slate-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-sm font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Learning Experience</h3>
              <h2 className="text-4xl font-black text-slate-900 mb-4 text-center">최고의 학습 도구를 만나보세요</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">언제 어디서나 접근 가능한 스마트 교과서와 아이들의 창의력을 일깨우는 놀이 콘텐츠</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group bg-white p-2 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-200/50 transition-all transform hover:-translate-y-2">
                <div className="aspect-video bg-blue-600 rounded-[1.5rem] mb-6 flex items-center justify-center p-8 overflow-hidden relative">
                  <BookOpen size={80} className="text-white opacity-20 absolute -right-4 -bottom-4 rotate-12" />
                  <div className="relative text-center">
                    <BookOpen size={48} className="text-white mx-auto mb-4" />
                    <span className="text-white font-black text-xl">디지털 교과서</span>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <h4 className="text-xl font-black mb-3 text-slate-800">학년별 통합 교과서</h4>
                  <p className="text-slate-500 text-sm mb-6">표준 교육과정을 기반으로 재구성된 고품질 멀티미디어 교과서를 제공합니다.</p>
                  <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold group-hover:bg-aijoa-blue group-hover:text-white transition-colors">체험하기</button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group bg-white p-2 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-orange-200/50 transition-all transform hover:-translate-y-2">
                <div className="aspect-video bg-orange-500 rounded-[1.5rem] mb-6 flex items-center justify-center p-8 overflow-hidden relative">
                  <Star size={80} className="text-white opacity-20 absolute -right-4 -bottom-4 rotate-12" />
                  <div className="relative text-center">
                    <Star size={48} className="text-white mx-auto mb-4" />
                    <span className="text-white font-black text-xl">창의 놀이</span>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <h4 className="text-xl font-black mb-3 text-slate-800">체험형 활동 자료</h4>
                  <p className="text-slate-500 text-sm mb-6">집과 학교에서 손쉽게 시도해볼 수 있는 신체적, 정신적 창의 놀이 가이드를 담았습니다.</p>
                  <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold group-hover:bg-orange-500 group-hover:text-white transition-colors">보러가기</button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group bg-white p-2 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-purple-200/50 transition-all transform hover:-translate-y-2">
                <div className="aspect-video bg-purple-600 rounded-[1.5rem] mb-6 flex items-center justify-center p-8 overflow-hidden relative">
                  <Zap size={80} className="text-white opacity-20 absolute -right-4 -bottom-4 rotate-12" />
                  <div className="relative text-center">
                    <Zap size={48} className="text-white mx-auto mb-4" />
                    <span className="text-white font-black text-xl">AI 맞춤 학습</span>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <h4 className="text-xl font-black mb-3 text-slate-800">지능형 문제 분석</h4>
                  <p className="text-slate-500 text-sm mb-6">아이의 오답 패턴을 분석하여 부족한 개념을 채워주는 맞춤형 학습 경로를 생성합니다.</p>
                  <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">시작하기</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 아이소식 (News) Preview */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 text-aijoa-blue rounded-2xl">
                  <Megaphone size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">아이소식</h2>
              </div>
              <button onClick={() => navigate('/notice')} className="text-slate-400 font-bold text-sm hover:text-aijoa-blue transition-colors">공지사항 전체보기</button>
            </div>
            <div className="space-y-4">
              {[
                { tag: '공지', title: '아이좋아 2.0 업데이트 안내 (판서 기능 강화)', date: '2024.04.12' },
                { tag: '뉴스', title: '에듀테크 대상 "디지털 교육 혁신 부문" 수상', date: '2024.04.05' },
                { tag: '이벤트', title: '[이벤트] 4월 창의 놀이 챌린지 - 작품 응모하고 선물 받자!', date: '2024.03.28' },
              ].map((news, i) => (
                <div key={i} onClick={() => navigate('/notice')} className="flex items-center justify-between p-5 rounded-[1.5rem] border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      news.tag === '공지' ? 'bg-red-100 text-red-600' : 
                      news.tag === '뉴스' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                    }`}>{news.tag}</span>
                    <h4 className="font-bold text-slate-700 group-hover:text-aijoa-blue transition-colors">{news.title}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{news.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-aijoa-blue/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div className="col-span-1 md:col-span-1">
               <h1 className="text-2xl font-black text-white mb-6">아이좋아 <span className="text-aijoa-blue font-black">.</span></h1>
               <p className="text-slate-400 text-sm leading-relaxed">디지털로 여는 교육의 무한한 가능성. 오늘도 아이들과 함께 성장하는 아이좋아 프로젝트입니다.</p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-slate-200">사이트 맵</h5>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">아이소개</a></li>
                <li><a href="#" className="hover:text-white transition-colors">아이학습</a></li>
                <li><a href="#" className="hover:text-white transition-colors">아이소식</a></li>
                <li><a href="#" className="hover:text-white transition-colors">아이행복</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-slate-200">고객 지원</h5>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">공지사항</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Q&A</a></li>
                <li><a href="#" className="hover:text-white transition-colors">상담 신청</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-slate-200">Office</h5>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">서울특별시 중구 교육대로 123<br/>아이좋아 에듀테크 센터 5층</p>
              <p className="text-slate-400 text-sm">T. 02-1234-5678</p>
            </div>
          </div>
          <div className="flex flex-col md:row items-center justify-between space-y-4 md:space-y-0 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 DTProject Inc. All Rights Reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">이메일무단수집거부</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
