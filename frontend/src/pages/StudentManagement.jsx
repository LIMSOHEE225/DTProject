import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Search, GraduationCap, School, BrainCircuit, X, Check, Activity, Edit2, Lock, Eye, EyeOff, Users, RefreshCw, Star, Settings, LogOut } from 'lucide-react';

const StudentManagement = () => {
    const navigate = useNavigate();
    // 선생님 세션 정보 가져오기
    const teacherSession = JSON.parse(localStorage.getItem('teacherSession') || '{}');
    const institutionSession = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 세션 정보 상태 관리
    const [teacherName, setTeacherName] = useState(teacherSession.name || institutionSession.name || '선생님');
    const [schoolName, setSchoolName] = useState(teacherSession.schoolName || institutionSession.schoolName || '등록된 학교 없음');
    
    // 세션에서 학년과 반 정보 추출
    const studentGrade = Number(teacherSession.grade || institutionSession.grade || 1); 
    const studentClass = Number(teacherSession.classNum || institutionSession.classNum || 1);

    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({ studentNumber: '', name: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); // 학생 클릭 시 AI 리포트 확인을 위한 상태
    const [activeMenu, setActiveMenu] = useState('LIST'); // 현재 활성화된 메뉴 (LIST, REGISTER, ANALYSIS)
    const [searchQuery, setSearchQuery] = useState(''); // 학생 검색어
    const [reports, setReports] = useState([]); // 선택된 학생의 리포트 목록
    const [monthlyReport, setMonthlyReport] = useState(null); // 추가: 월간 AI 리포트 데이터
    const [isMonthlyLoading, setIsMonthlyLoading] = useState(false); // 추가: 로딩 상태
    const [selectedReport, setSelectedReport] = useState(null); // 현재 상세 보기 중인 리포트
    const [idDuplicate, setIdDuplicate] = useState(false); // ID 중복 상태
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', studentNumber: '', password: '', teacherPassword: '', status: '재학' });
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 보이기 상태
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // 비밀번호 수정 모달 상태
    const [newPassword, setNewPassword] = useState(''); // 새로운 학생 비밀번호

    // --- 마이계정관리 (My Account) ---
    const [accountData, setAccountData] = useState({
        grade: institutionSession.grade || teacherSession.grade || '',
        classNum: institutionSession.classNum || teacherSession.classNum || '',
        email: institutionSession.email || teacherSession.email || '',
        name: institutionSession.name || teacherSession.name || '',
        phoneNumber: institutionSession.phoneNumber || teacherSession.phoneNumber || '',
        currentPassword: '',
        password: ''
    });

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        const originalId = institutionSession.loginId || teacherSession.loginId;
        if (!originalId) return alert('계정 정보를 찾을 수 없습니다.');
        try {
            const res = await fetch(`/api/v1/auth/user/${originalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountData)
            });
            if (res.ok) {
                alert('계정 정보가 성공적으로 수정되었습니다. 보안을 위해 다시 로그인해 주세요.');
                localStorage.removeItem('user');
                localStorage.removeItem('teacherSession');
                window.location.href = '/dt/login';
            } else if (res.status === 401) {
                const errorData = await res.json();
                alert(errorData.message || '기존 비밀번호가 일치하지 않습니다.');
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Update account error', error);
        }
    };

    // 학교 정보 동기화 - teacherSession 우선 적용
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const teacher = JSON.parse(localStorage.getItem('teacherSession') || '{}');
        
        // teacherSession(DT 교사 로그인) 우선, 없으면 일반 user 사용
        if (teacher.schoolName) setSchoolName(teacher.schoolName);
        else if (user.schoolName) setSchoolName(user.schoolName);

        if (teacher.name) setTeacherName(teacher.name);
        else if (user.name) setTeacherName(user.name);
    }, []);

    // 학생 선택 시 리포트 목록 가져오기
    useEffect(() => {
        const fetchReports = async () => {
            if (!selectedStudent) {
                setReports([]);
                setSelectedReport(null);
                return;
            }
            try {
                const response = await fetch(`/api/v1/reports/student/${encodeURIComponent(selectedStudent.studentNumber)}`);
                if (response.ok) {
                    const data = await response.json();
                    setReports(data || []);
                    if (data && data.length > 0) {
                        setSelectedReport(data[0]);
                    } else {
                        setSelectedReport(null);
                    }
                }
            } catch (error) {
                console.error("Fetch Reports Error:", error);
            }
        };
        fetchReports();
    }, [selectedStudent]);

    // 날짜 포맷팅 함수 (YYYY-MM-DD)
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getFullYear().toString().slice(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
    };

    // DB에 저장된 JSON 형태의 solvedQuestions 파싱 함수
    const parseQuestions = (questionsStr) => {
        try {
            return JSON.parse(questionsStr || '[]');
        } catch (e) {
            return [];
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch(`/api/v1/students/filter?schoolName=${encodeURIComponent(schoolName)}&grade=${studentGrade}&classNum=${studentClass}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        // 번호 자동 생성 (현재 최대 번호 + 1)
        const nextNumber = students.length > 0 ? Math.max(...students.map(s => Number(s.studentNumber))) + 1 : 1;
        
        if (!newStudent.name) {
            alert('학생 이름을 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/v1/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentNumber: nextNumber,
                    name: newStudent.name,
                    password: newStudent.password,
                    grade: studentGrade,
                    classNum: studentClass,
                    schoolName: schoolName,
                    teacherName: teacherName
                })
            });

            if (response.ok) {
                alert(`학생이 성공적으로 등록되었습니다. (번호: ${nextNumber}번)`);
                setNewStudent({ studentNumber: '', name: '', password: '' });
                fetchStudents();
            } else {
                const err = await response.json();
                alert(err.message || '등록 중 오류 발생');
            }
        } catch (error) {
            alert('서버 통신 오류');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(`/api/v1/students/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchStudents();
            }
        } catch (error) {
            alert('삭제 오류');
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.includes(searchQuery) || String(s.studentNumber).includes(searchQuery)
    );

    const openEditModal = (student) => {
        setEditingStudent(student);
        setEditForm({
            name: student.name,
            studentNumber: student.studentNumber,
            teacherPassword: '',
            status: student.status || '재학'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editForm.teacherPassword) {
            alert('선생님 비밀번호를 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/v1/students/update/${editingStudent.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editForm,
                    teacherName: teacherName
                })
            });

            if (response.ok) {
                alert('학생 정보가 성공적으로 수정되었습니다.');
                setIsEditModalOpen(false);
                fetchStudents();
            } else {
                const err = await response.json();
                alert(err.message || '수정 중 오류 발생');
            }
        } catch (error) {
            alert('서버 통신 오류');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!editForm.teacherPassword) {
            alert('선생님 비밀번호를 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/v1/students/update/${editingStudent.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editForm,
                    password: newPassword, // 새로운 비밀번호 추가
                    teacherName: teacherName
                })
            });

            if (response.ok) {
                alert('비밀번호 변경이 완료되었습니다.');
                setIsPasswordModalOpen(false);
                setNewPassword('');
                // fetchStudents(); // 생략 가능 (비밀번호는 목록에 안나옴)
            } else {
                const err = await response.json();
                alert(err.message || '비밀번호 수정 중 오류 발생');
            }
        } catch (error) {
            alert('서버 통신 오류');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/dt');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Left Sidebar Menu */}
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-8 z-10 shadow-sm">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">학생 계정 관리</h2>
                    <div className="flex flex-col text-slate-400 font-bold text-[10px] uppercase tracking-widest space-y-1">
                        <span className="flex items-center space-x-1">
                            <School size={12} className="text-aijoa-blue" />
                            <span>{schoolName}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <GraduationCap size={12} className="text-green-500" />
                            <span>{studentGrade}학년 {studentClass}반</span>
                        </span>
                    </div>
                </div>

                <nav className="flex flex-col space-y-3">
                    <button 
                        onClick={() => { setActiveMenu('REGISTER'); setSelectedStudent(null); }}
                        className={`flex items-center space-x-4 p-5 rounded-3xl font-black transition-all ${activeMenu === 'REGISTER' ? 'bg-aijoa-blue text-white shadow-lg shadow-blue-100 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <UserPlus size={22} />
                        <span>학생 계정 등록</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMenu('LIST'); setSelectedStudent(null); }}
                        className={`flex items-center space-x-4 p-5 rounded-3xl font-black transition-all ${activeMenu === 'LIST' ? 'bg-aijoa-blue text-white shadow-lg shadow-blue-100 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Search size={22} />
                        <span>학생 목록 보기</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMenu('ANALYSIS'); setSelectedStudent(null); }}
                        className={`flex items-center space-x-4 p-5 rounded-3xl font-black transition-all ${activeMenu === 'ANALYSIS' ? 'bg-aijoa-blue text-white shadow-lg shadow-blue-100 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Activity size={22} />
                        <span>학생 개별 분석</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMenu('MONTHLY'); setSelectedStudent(null); setMonthlyReport(null); }}
                        className={`flex items-center space-x-4 p-5 rounded-3xl font-black transition-all ${activeMenu === 'MONTHLY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <BrainCircuit size={22} />
                        <span>월간 AI 리포트</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMenu('MY_ACCOUNT'); setSelectedStudent(null); }}
                        className={`flex items-center space-x-4 p-5 rounded-3xl font-black transition-all ${activeMenu === 'MY_ACCOUNT' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Settings size={22} />
                        <span>마이계정관리</span>
                    </button>
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="p-5 bg-slate-50 rounded-[30px] flex items-center space-x-3 flex-1 mr-2">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-black text-aijoa-blue shadow-sm">
                                {teacherName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-800">{teacherName} 님</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Teacher</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            title="로그아웃"
                            className="p-4 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-[25px] transition-all"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Right Content Area */}
            <main className="flex-1 overflow-y-auto p-12 relative bg-slate-50/50">
                {/* Header within Content */}
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-black text-aijoa-blue uppercase tracking-[0.3em] mb-2">
                            {activeMenu === 'REGISTER' ? 'Registration' : activeMenu === 'LIST' ? 'Student List' : activeMenu === 'MY_ACCOUNT' ? 'My Account' : 'AI Analytics'}
                        </h3>
                        <h2 className="text-4xl font-black text-slate-800">
                            {activeMenu === 'REGISTER' ? '신규 학생 등록' : activeMenu === 'LIST' ? '우리 반 학생 목록' : activeMenu === 'MY_ACCOUNT' ? '마이 계정 관리' : activeMenu === 'ANALYSIS' ? 'AI 개별 학습 분석' : 'AI 월간 종합 리포트'}
                        </h2>
                    </div>
                    {(activeMenu !== 'REGISTER' && activeMenu !== 'MY_ACCOUNT') && (
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-aijoa-blue transition-colors" size={20} />
                            <input 
                                className="pl-14 pr-8 py-4 bg-white border-2 border-transparent rounded-[25px] text-base outline-none focus:border-aijoa-blue font-bold w-80 shadow-sm transition-all shadow-slate-200/50" 
                                placeholder="이름 또는 학번 검색..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </header>

                {/* Content switching based on activeMenu */}
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                    {activeMenu === 'REGISTER' && (
                        <div className="max-w-2xl bg-white rounded-[50px] shadow-2xl shadow-slate-200 border border-white p-16">
                            <div className="flex items-center space-x-4 mb-10">
                                <div className="w-16 h-16 bg-aijoa-blue/10 rounded-3xl flex items-center justify-center text-aijoa-blue font-black">
                                    <UserPlus size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-800">새로운 학생 추가</h4>
                                    <p className="text-slate-400 font-bold">우리 반의 새로운 꿈나무를 등록해 주세요.</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddStudent} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">학생 이름</label>
                                    <input 
                                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[25px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black text-xl"
                                        placeholder="이름 입력 (예: 홍길동)"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">학생 PW 설정</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[25px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black text-xl pr-16"
                                            placeholder="비밀번호"
                                            value={newStudent.password}
                                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-aijoa-blue transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <button 
                                    disabled={isSubmitting}
                                    className="w-full py-6 bg-aijoa-blue text-white rounded-[25px] font-black text-2xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center space-x-3"
                                >
                                    {isSubmitting ? (
                                        <span>등록 중...</span>
                                    ) : (
                                        <>
                                            <Check size={28} />
                                            <span>학생 계정 저장하기</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                    {activeMenu === 'MY_ACCOUNT' && (
                        <div className="max-w-2xl bg-white rounded-[50px] shadow-2xl shadow-slate-200 border border-white p-16">
                            <div className="flex items-center space-x-4 mb-10">
                                <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 font-black">
                                    <Settings size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-800">내 계정 정보 수정</h4>
                                    <p className="text-slate-400 font-bold">비밀번호를 포함한 기본 가입정보를 변경할 수 있습니다.</p>
                                </div>
                            </div>
                            <form onSubmit={handleUpdateAccount} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">이름</label>
                                        <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black"
                                            value={accountData.name} onChange={e => setAccountData({...accountData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">연락처</label>
                                        <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black"
                                            value={accountData.phoneNumber} onChange={e => setAccountData({...accountData, phoneNumber: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">학년</label>
                                        <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black" type="number"
                                            value={accountData.grade} onChange={e => setAccountData({...accountData, grade: e.target.value})} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">반</label>
                                        <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black" type="number"
                                            value={accountData.classNum} onChange={e => setAccountData({...accountData, classNum: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">이메일</label>
                                    <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black" type="email"
                                        value={accountData.email} onChange={e => setAccountData({...accountData, email: e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">기존 비밀번호 (필수)</label>
                                    <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black" type="password" placeholder="현재 비밀번호 입력"
                                        value={accountData.currentPassword} onChange={e => setAccountData({...accountData, currentPassword: e.target.value})} required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">새 비밀번호 (변경 시에만 입력)</label>
                                    <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-aijoa-blue focus:bg-white outline-none transition-all font-black" type="password" placeholder="변경할 비밀번호 입력 (선택)"
                                        value={accountData.password} onChange={e => setAccountData({...accountData, password: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full py-6 bg-orange-500 text-white rounded-[25px] font-black text-xl hover:bg-orange-600 shadow-xl shadow-orange-200 transition-all active:scale-[0.98] mt-8 flex items-center justify-center space-x-3">
                                    <Check size={28} />
                                    <span>수정사항 저장하기</span>
                                </button>
                            </form>
                        </div>
                    )}
                    {activeMenu === 'LIST' && (
                        <div className="bg-white rounded-[50px] shadow-2xl shadow-slate-200 border border-white overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/30">
                                            <th className="px-12 py-8">학생 번호</th>
                                            <th className="px-12 py-8">학생 이름</th>
                                            <th className="px-12 py-8">상태</th>
                                            <th className="px-12 py-8 text-right">계정 관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.map((s) => (
                                            <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                                                <td className="px-12 py-8 font-mono font-black text-aijoa-blue tracking-wider text-lg">{s.studentNumber} 번</td>
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-aijoa-blue group-hover:text-white transition-colors shadow-inner">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <span className="font-black text-slate-800 text-xl">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-2 h-2 rounded-full ${s.status === '자퇴' ? 'bg-slate-400' : 'bg-green-500 animate-pulse'}`}></div>
                                                        <span className={`${s.status === '자퇴' ? 'text-slate-400' : 'text-green-600'} text-sm font-black`}>{s.status || '재학'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(s); }}
                                                            className="p-4 text-slate-300 hover:text-aijoa-blue hover:bg-blue-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                                            title="학생 정보 수정"
                                                        >
                                                            <Edit2 size={24} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                                                            className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                                            title="학생 계정 삭제"
                                                        >
                                                            <Trash2 size={24} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredStudents.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-10 py-48 text-center bg-slate-50/20">
                                                    <div className="flex flex-col items-center space-y-4">
                                                        <Search size={64} className="text-slate-200" />
                                                        <p className="text-slate-300 font-black italic text-2xl uppercase tracking-[0.2em]">No Matches Found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'ANALYSIS' && (
                        <div className="grid grid-cols-12 gap-10 h-[calc(100vh-250px)]">
                            {/* Student Picker for Analysis */}
                            <div className="col-span-4 bg-white rounded-[40px] shadow-xl border border-white flex flex-col overflow-hidden">
                                <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                                    <h4 className="font-black text-slate-800 flex items-center space-x-2 text-lg">
                                        <Activity size={20} className="text-aijoa-blue" />
                                        <span>분석 대상 학생 선택</span>
                                    </h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/10">
                                    {filteredStudents.map(s => (
                                        <button 
                                            key={`pick-${s.id}`}
                                            onClick={() => setSelectedStudent(s)}
                                            className={`w-full flex items-center space-x-4 p-4 rounded-3xl transition-all border-2 ${selectedStudent?.id === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${selectedStudent?.id === s.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 shadow-inner'}`}>
                                                {s.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-lg">{s.name}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedStudent?.id === s.id ? 'text-indigo-200' : 'text-slate-300'}`}>{s.studentNumber} 번</p>
                                            </div>
                                            {selectedStudent?.id === s.id && <Check size={20} className="animate-in zoom-in" />}
                                        </button>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <div className="py-20 text-center text-slate-300 font-bold italic">검색 결과 없음</div>
                                    )}
                                </div>
                            </div>

                            {/* Analysis Display */}
                            <div className="col-span-8 bg-white rounded-[50px] shadow-2xl border border-white overflow-hidden flex flex-col relative">
                                {selectedStudent ? (
                                    <div className="h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                                        <header className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-md">
                                                    {selectedStudent.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedStudent.name} <span className="text-lg font-bold text-slate-400">({selectedStudent.studentNumber} 번)</span></h3>
                                                    <p className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center">
                                                        <Activity size={12} className="mr-1" /> Cumulative Learning Report
                                                    </p>
                                                </div>
                                            </div>
                                            {reports.length > 0 && (
                                                <div className="flex items-center space-x-3">
                                                    {/* 통합 날짜 선택기 */}
                                                    <div className="bg-white px-5 py-3 rounded-2xl shadow-inner border border-slate-100 flex items-center space-x-3">
                                                        <Activity size={16} className="text-aijoa-blue" />
                                                        <select 
                                                            className="bg-transparent outline-none font-black text-slate-600 cursor-pointer text-base"
                                                            value={selectedReport?.id || ''}
                                                            onChange={(e) => setSelectedReport(reports.find(r => r.id === Number(e.target.value)))}
                                                        >
                                                            {reports.map(r => (
                                                                <option key={r.id} value={r.id}>
                                                                    [{r.subject?.includes('영어') ? '영어' : '수학'}] {formatDate(r.createdAt)} 분석 결과
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </header>

                                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                            {selectedReport ? (
                                                <>
                                                    <div className="grid grid-cols-3 gap-6 mb-10">
                                                        {/* 과목 카드 */}
                                                        <div className="bg-white p-8 border-2 border-slate-50 rounded-[35px] text-center shadow-sm">
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">과목</h5>
                                                            <div className={`text-4xl font-black ${selectedReport.subject?.includes('영어') ? 'text-pink-500' : 'text-aijoa-blue'} mt-2`}>
                                                                {selectedReport.subject?.includes('영어') ? '영어' : '수학'}
                                                            </div>
                                                        </div>
                                                        {/* 종합 성취도 카드 */}
                                                        <div className="bg-white p-8 border-2 border-slate-50 rounded-[35px] text-center shadow-sm">
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">종합 성취도</h5>
                                                            <div className="text-5xl font-black text-indigo-600">{selectedReport.score || 0}%</div>
                                                        </div>
                                                        {/* 학습 단원 카드 */}
                                                        <div className="bg-white p-8 border-2 border-slate-50 rounded-[35px] text-center shadow-sm">
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">학습 단원</h5>
                                                            <div className="text-xl font-black text-slate-700 mt-2 leading-tight">
                                                                {selectedReport.subject?.replace(/\[.*?\]/g, '').replace('AI 맞춤형 평가', '').replace('AI 맞춤 평가', '').trim() || '기본 단원'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Deep AI Analysis Blocks (similar to Monthly) */}
                                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                                        <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                                                <Activity size={80} />
                                                            </div>
                                                            <h5 className="text-aijoa-yellow font-black uppercase tracking-[0.2em] text-xs mb-4">AI Summary</h5>
                                                            <p className="text-xl font-bold leading-relaxed whitespace-pre-wrap italic">
                                                                "{selectedReport.aiFeedback || '문제 풀이 데이터를 바탕으로 계산력과 이해도를 분석하였습니다.'}"
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col space-y-6">
                                                            <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-[35px]">
                                                                <h5 className="text-rose-500 font-black uppercase tracking-widest text-xs mb-2">Focus Needed (취약점)</h5>
                                                                <p className="text-lg font-black text-slate-800">{selectedReport.weakness || '문장형 문제 독해 지연'}</p>
                                                            </div>
                                                            <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-[35px]">
                                                                <h5 className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-2">AI Expert Advice (조언)</h5>
                                                                <p className="text-lg font-black text-slate-800">{selectedReport.advice || '서술형 문제의 핵심 키워드를 찾는 연습을 권장합니다.'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-8 bg-slate-50 rounded-[40px] border-2 border-slate-100 mb-10">
                                                        <div className="flex items-center space-x-3 mb-6">
                                                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                                                                <Star size={20} fill="currentColor" />
                                                            </div>
                                                            <h4 className="text-xl font-black text-slate-800">핵심 학습 데이터 분석 </h4>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-6">
                                                            <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-slate-100">
                                                                <p className="text-xs font-black text-slate-400 mb-2 uppercase">페이지 체류 시간</p>
                                                                <p className="text-3xl font-black text-indigo-600">3분 45초</p>
                                                            </div>
                                                            <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-slate-100">
                                                                <p className="text-xs font-black text-slate-400 mb-2 uppercase">학습 집중도</p>
                                                                <p className="text-3xl font-black text-green-500">우수람</p>
                                                            </div>
                                                            <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-slate-100">
                                                                <p className="text-xs font-black text-slate-400 mb-2 uppercase">화면 전환(로그) 시간</p>
                                                                <p className="text-3xl font-black text-orange-500">1.2초 내외</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="font-black text-xl text-slate-800 mb-8 flex items-center space-x-3">
                                                        <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                                                        <span>세부 문항 분석 기록 ({formatDate(selectedReport.createdAt)})</span>
                                                    </h4>
                                                    
                                                    <div className="space-y-6">
                                                        {parseQuestions(selectedReport.solvedQuestions).map((prob, i) => (
                                                            <div key={`analysis-${i}`} className={`p-8 border-2 rounded-[40px] flex flex-col space-y-6 bg-white transition-all hover:translate-x-2 ${prob.isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                                                                <div className="flex items-start justify-between">
                                                                    <h5 className="font-black text-xl text-slate-700 flex-1 pr-6 leading-snug">
                                                                        <span className="text-slate-300 font-mono mr-2">{String(i+1).padStart(2, '0')}</span> {prob.question}
                                                                    </h5>
                                                                    <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-3xl font-black text-3xl text-white shadow-xl ${prob.isCorrect ? 'bg-gradient-to-tr from-green-500 to-emerald-400' : 'bg-gradient-to-tr from-red-500 to-orange-400'}`}>
                                                                        {prob.isCorrect ? 'O' : 'X'}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[30px] border border-slate-100/50 text-sm">
                                                                    <div className="space-y-2">
                                                                        <p className="text-slate-400 font-black uppercase tracking-[0.15em] text-[10px]">제출 답안</p>
                                                                        <p className={`font-black text-xl ${prob.isCorrect ? 'text-green-600' : 'text-red-500'}`}>{prob.userAnswer}</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <p className="text-slate-400 font-black uppercase tracking-[0.15em] text-[10px]">정답 확인</p>
                                                                        <p className="font-black text-xl text-slate-800">{prob.correctAnswer}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 text-base bg-indigo-50/30 p-6 rounded-[30px] text-slate-600 font-bold border border-indigo-100/30 relative overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                                                                    <strong className="block mb-2 text-indigo-600 uppercase tracking-widest text-[10px] flex items-center">
                                                                        <Activity size={12} className="mr-2" /> AI Analysis Feedback
                                                                    </strong>
                                                                    <p className="leading-relaxed text-slate-700">{prob.explanation || selectedReport.aiFeedback || '추가 피드백 준비 중입니다.'}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
                                                    <BrainCircuit size={80} className="text-slate-200 mb-6" />
                                                    <h4 className="text-2xl font-black text-slate-400 italic">풀이 기록이 없습니다.</h4>
                                                    <p className="text-slate-300 font-bold mt-2">학생이 문제를 풀고 채점을 완료하면 분석 결과가 나타납니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                        <div className="w-32 h-32 bg-slate-50 rounded-[45px] flex items-center justify-center text-slate-200 border-4 border-dashed border-slate-100">
                                            <UserPlus size={48} />
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black text-slate-300 uppercase tracking-tight">Select a Student</h4>
                                            <p className="text-slate-400 font-bold mt-2">좌측 목록에서 학생을 선택하여 상세 분석 결과를 확인하세요.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeMenu === 'MONTHLY' && (
                        <div className="grid grid-cols-12 gap-10 h-[calc(100vh-250px)]">
                            {/* Student Picker for Monthly Report */}
                            <div className="col-span-4 bg-white rounded-[40px] shadow-xl border border-white flex flex-col overflow-hidden">
                                <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                                    <h4 className="font-black text-slate-800 flex items-center space-x-2 text-lg">
                                        <Users size={20} className="text-indigo-600" />
                                        <span>리포트 대상 선택</span>
                                    </h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/10">
                                    {filteredStudents.map(s => (
                                        <button 
                                            key={`monthly-${s.id}`}
                                            onClick={async () => {
                                                setSelectedStudent(s);
                                                setIsMonthlyLoading(true);
                                                try {
                                                    const res = await fetch(`/api/v1/reports/monthly/${s.studentNumber}`);
                                                    if (res.ok) setMonthlyReport(await res.json());
                                                    else setMonthlyReport(null);
                                                } catch (e) { setMonthlyReport(null); }
                                                finally { setIsMonthlyLoading(false); }
                                            }}
                                            className={`w-full flex items-center space-x-4 p-4 rounded-3xl transition-all border-2 ${selectedStudent?.id === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${selectedStudent?.id === s.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 shadow-inner'}`}>
                                                {s.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-lg">{s.name}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedStudent?.id === s.id ? 'text-indigo-200' : 'text-slate-300'}`}>{s.studentNumber} 번</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Monthly Report View */}
                            <div className="col-span-8 bg-white rounded-[50px] shadow-2xl border border-white overflow-hidden flex flex-col">
                                {selectedStudent ? (
                                    <div className="h-full flex flex-col overflow-hidden p-12">
                                        {isMonthlyLoading ? (
                                            <div className="h-full flex flex-col items-center justify-center space-y-6">
                                                <RefreshCw size={48} className="text-indigo-600 animate-spin" />
                                                <p className="text-xl font-black text-slate-400">AI가 데이터를 분석 중입니다...</p>
                                            </div>
                                        ) : monthlyReport ? (
                                            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto pr-4 custom-scrollbar">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">Growth & Progress</span>
                                                        <h3 className="text-4xl font-black text-slate-800 mt-2">{selectedStudent.name} 학생의 월간 성장 리포트</h3>
                                                    </div>
                                                    <div className="w-24 h-24 bg-indigo-50 rounded-[35px] flex flex-col items-center justify-center border-2 border-indigo-100">
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase">Grade</span>
                                                        <span className="text-4xl font-black text-indigo-600">A</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="p-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[45px] text-white shadow-2xl relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                                            <Activity size={100} />
                                                        </div>
                                                        <h5 className="text-aijoa-yellow font-black uppercase tracking-[0.2em] text-xs mb-6">AI Summary</h5>
                                                        <p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap italic">"{monthlyReport.summary}"</p>
                                                    </div>
                                                    <div className="flex flex-col space-y-6">
                                                        <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[35px]">
                                                            <h5 className="text-rose-500 font-black uppercase tracking-widest text-xs mb-3">Focus Needed (취약점)</h5>
                                                            <p className="text-xl font-black text-slate-800">{monthlyReport.weakness}</p>
                                                        </div>
                                                        <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[35px]">
                                                            <h5 className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-3">AI Expert Advice (조언)</h5>
                                                            <p className="text-xl font-black text-slate-800">{monthlyReport.advice}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-10 bg-slate-50 rounded-[45px] border-2 border-slate-100">
                                                    <div className="flex items-center space-x-3 mb-8">
                                                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                                                            <Star size={20} fill="currentColor" />
                                                        </div>
                                                        <h4 className="text-xl font-black text-slate-800">핵심 학습 데이터 분석</h4>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-6">
                                                        <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                                                            <p className="text-xs font-black text-slate-400 mb-2 uppercase">평균 정답률</p>
                                                            <p className="text-3xl font-black text-indigo-600">88%</p>
                                                        </div>
                                                        <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                                                            <p className="text-xs font-black text-slate-400 mb-2 uppercase">학습 집중도</p>
                                                            <p className="text-3xl font-black text-green-500">매우 높음</p>
                                                        </div>
                                                        <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                                                            <p className="text-xs font-black text-slate-400 mb-2 uppercase">과제 완료율</p>
                                                            <p className="text-3xl font-black text-orange-500">100%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                                                <BrainCircuit size={100} />
                                                <h4 className="text-3xl font-black italic uppercase tracking-tighter">No Analysis Data Yet</h4>
                                                <p className="text-lg font-bold">학생이 이번 달 학습을 완료한 후 리포트가 생성됩니다.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30">
                                        <Users size={80} className="mb-6" />
                                        <h4 className="text-3xl font-black tracking-tight uppercase">Select a Student for Monthly AI Report</h4>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-[500px] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                        <header className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-aijoa-blue/10 rounded-2xl text-aijoa-blue">
                                    <Edit2 size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">학생 정보 수정</h3>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </header>
                        <form onSubmit={handleUpdate} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">학생 이름</label>
                                <input 
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-aijoa-blue focus:bg-white outline-none transition-all font-bold text-lg"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">학생 번호</label>
                                <input 
                                    className="w-full px-6 py-4 bg-slate-100 border-2 border-transparent rounded-2xl outline-none font-bold text-lg text-slate-400 cursor-not-allowed"
                                    value={editForm.studentNumber + " 번"}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">계정 상태</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-aijoa-blue focus:bg-white outline-none transition-all font-bold text-lg appearance-none cursor-pointer"
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                >
                                    <option value="재학">재학 (Enrollment)</option>
                                    <option value="자퇴">자퇴 (Dropout)</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordModalOpen(true);
                                        setNewPassword('');
                                    }}
                                    className="w-full py-4 bg-amber-100 text-amber-700 rounded-2xl font-black text-sm hover:bg-amber-200 transition-all flex items-center justify-center space-x-2"
                                >
                                    <Lock size={16} />
                                    <span>학생 비밀번호 수정</span>
                                </button>
                            </div>

                            
                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start space-x-3">
                                    <div className="mt-1 text-amber-500">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Authorization Required</p>
                                        <p className="text-[10px] font-bold text-amber-600 leading-relaxed">수정 사항을 적용하려면 선생님의 비밀번호를 입력해 주세요.</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-amber-400 outline-none transition-all font-bold text-lg pr-14"
                                        placeholder="선생님 비밀번호 입력"
                                        value={editForm.teacherPassword}
                                        onChange={(e) => setEditForm({...editForm, teacherPassword: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black text-lg hover:bg-slate-900 transition-all flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? <span>처리 중...</span> : <span>수정 완료</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Update Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-[450px] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                        <header className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-aijoa-yellow/10 rounded-2xl text-aijoa-yellow">
                                    <Lock size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">학생 비밀번호 변경</h3>
                            </div>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </header>
                        <form onSubmit={handleUpdatePassword} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">새로운 비밀번호 입력</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-aijoa-blue focus:bg-white outline-none transition-all font-bold text-lg pr-14"
                                            placeholder="새 비밀번호"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-aijoa-blue transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 space-y-4">
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start space-x-3">
                                        <div className="mt-1 text-amber-500">
                                            <Lock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Authorization</p>
                                            <p className="text-[10px] font-bold text-amber-600 leading-relaxed">변경을 완료하려면 선생님 비밀번호를 입력하세요.</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-amber-400 outline-none transition-all font-bold text-lg"
                                            placeholder="선생님 비밀번호 입력"
                                            value={editForm.teacherPassword}
                                            onChange={(e) => setEditForm({...editForm, teacherPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <button 
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-aijoa-yellow text-slate-800 rounded-2xl font-black text-lg hover:bg-yellow-400 transition-all flex items-center justify-center shadow-lg shadow-yellow-100/50"
                                    >
                                        {isSubmitting ? <span>처리 중...</span> : <span>비밀번호 수정하기</span>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
