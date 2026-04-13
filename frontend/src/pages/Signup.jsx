import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Users, School, Mail, Phone, Lock, Hash, Search, X, MapPin, UserCheck, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: 'TEACHER',
    neisSchoolCode: '',
    schoolName: '',
    representativeName: '',
    schoolAddress: '',
    password: '',
    email: '',
    phone: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // 나이스 API 연동: 학교명/코드로 검색
  const searchSchool = async () => {
    if (!searchKeyword.trim()) return;
    setIsLoading(true);
    try {
      // 숫자인지 확인하여 코드 검색 또는 명칭 검색 결정
      const isCode = /^\d+$/.test(searchKeyword.trim());
      const param = isCode ? `SD_SCHUL_CODE=${searchKeyword.trim()}` : `SCHUL_NM=${encodeURIComponent(searchKeyword)}`;

      const API_URL = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=15&${param}`;
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.schoolInfo) {
        setSearchResults(data.schoolInfo[1].row);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("NEIS API Error:", error);
      alert("학교 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectSchool = (school) => {
    setFormData({
      ...formData,
      schoolName: school.SCHUL_NM,
      neisSchoolCode: school.SD_SCHUL_CODE,
      schoolAddress: school.ORG_RDNMA
    });
    setIsVerified(true);
    setIsSearchOpen(false);
    setSearchResults([]);
    setSearchKeyword('');
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.role === 'TEACHER' && !isVerified) {
      alert("학교 검색을 통해 기관 인증을 먼저 완료해주세요.");
      return;
    }

    // 비밀번호 정규식 (영문, 숫자, 특수문자 조합 8~20자)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      alert("비밀번호는 영문, 숫자, 특수문자 조합으로 8~20자 이내로 설정해주세요.");
      return;
    }

    try {
      const signupData = {
        loginId: formData.role === 'TEACHER' ? formData.neisSchoolCode : formData.email,
        password: formData.password,
        role: formData.role,
        schoolName: formData.schoolName,
        neisSchoolCode: formData.neisSchoolCode,
        representativeName: formData.representativeName,
        schoolAddress: formData.schoolAddress,
        phoneNumber: formData.phone,
        email: formData.email
      };

      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      if (response.ok) {
        alert(`${formData.role === 'TEACHER' ? '기관코드(' + formData.neisSchoolCode + ')' : '이메일'} 가 ID로 등록되었습니다. 회원가입 완료!`);
        navigate('/login');
      } else {
        const errorText = await response.text();
        let message = "회원가입 중 오류가 발생했습니다.";
        try {
          const errorData = JSON.parse(errorText);
          message = errorData.message || message;
        } catch (e) {
          // JSON 파싱 실패 시 원본 텍스트 사용 (401 에러 등의 HTML 응답 대비)
          console.warn("Error parsing response as JSON:", errorText);
        }
        alert(message);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("서버와 통신하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 font-['Pretendard']">
      <div className="max-w-4xl w-full bg-white rounded-[50px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[700px]">

        {/* Left Side Info */}
        <div className="md:w-[35%] bg-aijoa-blue p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-16 tracking-tighter">아이좋아</h1>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'bg-white w-16' : 'bg-white/30'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>Role</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'bg-white w-16' : 'bg-white/30'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'opacity-100' : 'opacity-30'}`}>Profile</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-blue-100/60 text-xs font-black uppercase tracking-[0.2em] mb-3">Login Policy</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight">기관 코드가 곧<br />접속 아이디가 됩니다</h2>
            <div className="mt-8 p-6 bg-white/10 rounded-[32px] text-xs leading-relaxed font-medium backdrop-blur-sm border border-white/10">
              별도의 아이디 생성 없이 기관 검색을 통해 발급된 나이스 표준학교코드로 바로 로그인하세요.
            </div>
          </div>

          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Right Side Form */}
        <div className="flex-grow p-14 relative">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">회원 유형 선택</h3>
                <p className="text-slate-400 mt-2 font-medium">본인에게 해당하는 역할을 선택해주세요.</p>
              </header>

              <div className="grid grid-cols-1 gap-6">
                <button
                  onClick={() => setFormData({ ...formData, role: 'TEACHER' })}
                  className={`p-8 rounded-[40px] border-2 flex items-center space-x-6 transition-all group relative overflow-hidden ${formData.role === 'TEACHER' ? 'border-aijoa-blue bg-blue-50/50 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all ${formData.role === 'TEACHER' ? 'bg-aijoa-blue text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <Users size={32} />
                  </div>
                  <div className="text-left">
                    <span className={`block font-black text-xl mb-1 ${formData.role === 'TEACHER' ? 'text-aijoa-blue' : 'text-slate-600'}`}>교사/기관 회원</span>
                    <span className="text-sm text-slate-400 font-medium">학교별 기관 코드로 로그인합니다.</span>
                  </div>
                  {formData.role === 'TEACHER' && <CheckCircle className="absolute right-8 top-1/2 -translate-y-1/2 text-aijoa-blue" size={24} />}
                </button>

                <button
                  onClick={() => setFormData({ ...formData, role: 'GENERAL' })}
                  className={`p-8 rounded-[40px] border-2 flex items-center space-x-6 transition-all group relative overflow-hidden ${formData.role === 'GENERAL' ? 'border-aijoa-blue bg-blue-50/50 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all ${formData.role === 'GENERAL' ? 'bg-aijoa-blue text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <User size={32} />
                  </div>
                  <div className="text-left">
                    <span className={`block font-black text-xl mb-1 ${formData.role === 'GENERAL' ? 'text-aijoa-blue' : 'text-slate-600'}`}>일반 회원</span>
                    <span className="text-sm text-slate-400 font-medium">개별 계정 정보가 발급됩니다.</span>
                  </div>
                  {formData.role === 'GENERAL' && <CheckCircle className="absolute right-8 top-1/2 -translate-y-1/2 text-aijoa-blue" size={24} />}
                </button>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-6 bg-aijoa-blue text-white rounded-[24px] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 mt-12"
              >
                상세 정보 입력
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSignup} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto md:mx-0">
              <header>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">프로필 등록</h3>
                <p className="text-slate-400 mt-2 font-medium">기관 코드가 자동으로 로그인 ID가 됩니다.</p>
              </header>

              <div className="space-y-6">
                {formData.role === 'TEACHER' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">기관(학교) 코드</label>
                      <div className="flex space-x-3">
                        <div className="relative flex-grow">
                          <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input
                            type="text"
                            className={`w-full pl-14 pr-4 py-5 bg-slate-50 border-2 rounded-[24px] outline-none font-black tracking-widest text-lg ${isVerified ? 'border-aijoa-blue bg-blue-50/30 text-aijoa-blue' : 'border-slate-100'}`}
                            placeholder="학교명 및 코드검색"
                            readOnly
                            required
                            value={formData.neisSchoolCode}
                          />
                          {isVerified && <CheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-aijoa-blue" size={20} />}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(true)}
                          className="px-8 bg-slate-800 text-white rounded-[24px] hover:bg-slate-700 transition-all flex items-center justify-center shadow-lg shadow-slate-100 group"
                        >
                          <Search size={22} className="group-hover:scale-110 transition-transform" />
                          <span className="ml-3 font-bold hidden md:inline">검색</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">소속 학교명</label>
                      <div className="relative">
                        <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                          type="text"
                          className="w-full pl-14 pr-4 py-5 bg-slate-100 border-2 border-slate-100 rounded-[24px] outline-none font-bold text-slate-700 text-lg"
                          readOnly
                          required
                          placeholder="학교명 자동 입력"
                          value={formData.schoolName}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">학교 주소</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                          type="text"
                          className="w-full pl-14 pr-4 py-5 bg-slate-100 border-2 border-slate-100 rounded-[24px] outline-none font-medium text-slate-500"
                          readOnly
                          required
                          value={formData.schoolAddress}
                        />
                      </div>
                    </div>


                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">대표자(담당자) 성함</label>
                      <div className="relative">
                        <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                          type="text"
                          placeholder="담당자의 실명을 입력해주세요"
                          className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-aijoa-blue outline-none transition-all font-bold text-lg"
                          required
                          value={formData.representativeName}
                          onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">성함</label>
                    <input
                      type="text"
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-aijoa-blue outline-none transition-all font-bold text-lg"
                      required
                      placeholder="성함을 입력하세요"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">연락처</label>
                    <input
                      type="tel"
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-aijoa-blue outline-none transition-all font-bold text-lg"
                      required
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">이메일 주소</label>
                    <input
                      type="email"
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-aijoa-blue outline-none transition-all font-bold text-lg"
                      required
                      placeholder="example@school.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">비밀번호 설정</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-aijoa-blue outline-none transition-all font-bold text-lg pr-16"
                        required
                        placeholder="영문, 숫자, 특수문자 조합 (8~20자)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-aijoa-blue transition-colors p-2"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-grow py-6 bg-slate-50 text-slate-400 rounded-[24px] font-black text-xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  이전으로
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-6 bg-aijoa-blue text-white rounded-[24px] font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all active:scale-95"
                >
                  가입 신청하기
                </button>
              </div>
            </form>
          )}

          {/* NEIS School Search Modal */}
          {isSearchOpen && (
            <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                <header className="p-12 pb-6 flex justify-between items-center">
                  <div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">학교 검색</h4>
                    <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-widest">NEIS DATABASE</p>
                  </div>
                  <button onClick={() => setIsSearchOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-300">
                    <X size={32} />
                  </button>
                </header>
                <div className="px-12 pb-6">
                  <div className="flex space-x-3 bg-slate-50 p-2 rounded-[32px] border-2 border-slate-100 focus-within:border-aijoa-blue transition-all">
                    <input
                      type="text"
                      className="flex-grow bg-transparent px-6 py-4 outline-none font-black text-xl placeholder:text-slate-300"
                      placeholder="학교명 및 코드검색"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchSchool()}
                    />
                    <button
                      onClick={searchSchool}
                      className="w-16 h-16 bg-aijoa-blue text-white rounded-[24px] font-black hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-100"
                    >
                      <Search size={28} />
                    </button>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto px-12 pb-12 pt-4 space-y-4">
                  {isLoading ? (
                    <div className="py-24 text-center">
                      <div className="w-12 h-12 border-4 border-aijoa-blue/20 border-t-aijoa-blue rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-400 font-black">로딩 중...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((school, i) => (
                      <button
                        key={i}
                        onClick={() => selectSchool(school)}
                        className="w-full p-8 text-left border-2 border-slate-50 rounded-[40px] hover:border-aijoa-blue hover:bg-blue-50/50 transition-all group flex items-start justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-black text-2xl text-slate-800 group-hover:text-aijoa-blue transition-colors">{school.SCHUL_NM}</span>
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 underline underline-offset-2">코드: {school.SD_SCHUL_CODE}</span>
                          </div>
                          <p className="text-slate-400 font-bold text-sm tracking-tight">{school.ORG_RDNMA}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 group-hover:bg-aijoa-blue group-hover:text-white transition-all">
                          <CheckCircle size={24} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-24 text-center text-slate-300 font-black">검색 결과가 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 text-center text-sm">
            <span className="text-slate-400 font-bold">이미 계정이 있으신가요? </span>
            <Link to="/login" className="text-aijoa-blue font-black hover:underline underline-offset-4 decoration-2">로그인하기</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
