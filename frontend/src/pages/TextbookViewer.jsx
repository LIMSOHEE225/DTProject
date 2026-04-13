import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Square, Users, BookMarked, PenTool, Eraser, BrainCircuit, Trash2, X, Settings, LogOut, RotateCcw, RefreshCw, Tv, Star, BookOpen, Check, FileQuestion } from 'lucide-react';
import useStomp from '../hooks/useStomp';
import AiProblemGenerator from './AiProblemGenerator';

const TextbookViewer = () => {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();
  
  const isMath = subjectId === '1';
  const isEnglish = subjectId === '2';
  
  const theme = {
    color: isMath ? 'aijoa-blue' : 'pink-500',
    bg: isMath ? 'bg-aijoa-blue' : 'bg-pink-500',
    text: isMath ? 'text-aijoa-blue' : 'text-pink-500',
    border: isMath ? 'border-aijoa-blue' : 'border-pink-500',
    light: isMath ? 'bg-blue-50' : 'bg-pink-50',
    hover: isMath ? 'hover:bg-blue-700' : 'hover:bg-pink-600',
    title: isMath ? '수학 디지털 교과서' : '영어 디지털 교과서',
    gradient: isMath ? 'from-aijoa-blue to-blue-500' : 'from-pink-500 to-rose-400',
  };

  const [role, setRole] = useState(localStorage.getItem('user-role') || 'TEACHER'); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 목차 토글 기본값을 숨김(false)으로 설정
  const [expandedChapters, setExpandedChapters] = useState([1]);
  const totalPages = 12;

  // --- 동적인 세션 ID 생성 (학교-학년-반 기반 직관적 주소) ---
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherSession = JSON.parse(localStorage.getItem('teacherSession') || '{}');
  const studentSession = JSON.parse(localStorage.getItem('studentSession') || '{}');
  const userName = teacherSession.name || studentSession.name || user.name || '사용자';
  
  const getSessionId = () => {
    // 한글 학교명으로 인한 통신 오류를 피하기 위해 영문/숫자로만 구성된 세션 ID 생성
    // 학교명의 앞 2글자 + 학년 + 반 정보를 조합
    const school = teacherSession.schoolName || studentSession.schoolName || user.schoolName || 'DT';
    const grade = teacherSession.grade || studentSession.grade || user.grade || '0';
    const classNum = teacherSession.classNum || studentSession.classNum || user.classNum || '0';
    
    // 단순하지만 중복을 최소화하는 규칙 (예: room_동대_2_1)
    const schoolPrefix = school.substring(0, 2);
    return `room_${schoolPrefix}_${grade}_${classNum}`.replace(/[^a-zA-Z0-9_가-힣]/g, '');
  };

  const sessionId = getSessionId();
  const { connected, publish, subscribe } = useStomp(sessionId);

  const isDrawingRef = React.useRef(false);
  const canvasRef = React.useRef(null);
  const contextRef = React.useRef(null);
  const [penColor, setPenColor] = useState('#ef4444'); 
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [sharedAiProblems, setSharedAiProblems] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [isEvaluationStarted, setIsEvaluationStarted] = useState(false);
  const [submissionStats, setSubmissionStats] = useState([]);
  const [showTeacherStats, setShowTeacherStats] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [isEvalSubmitted, setIsEvalSubmitted] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showExplanationId, setShowExplanationId] = useState(null);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [awayAlerts, setAwayAlerts] = useState([]);

  // --- Restored Interactive States ---
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [correctStatus, setCorrectStatus] = useState({});
  
  // --- Student Attendance & Mirroring State ---
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [isMirroringMode, setIsMirroringMode] = useState(false);
  const [selectedMirrorStudent, setSelectedMirrorStudent] = useState(null);
  const [onlineStudentIds, setOnlineStudentIds] = useState(new Set()); // 접속 중인 학생 ID 집합

  // --- 학생: 교과서 진입 시 접속 알림 전송 (즉시 + 5초마다 재전송) ---
  useEffect(() => {
    if (role === 'STUDENT' && connected) {
      const studentId = studentSession.studentId || studentSession.id || mockStudentIdRef.current;
      const payload = { studentId: String(studentId), name: studentSession.name || '학생' };

      // 즉시 전송
      publish(`/app/class/${sessionId}/sync`, { type: 'STUDENT_ONLINE', sessionId, payload });

      // 5초마다 재전송 (선생님이 나중에 접속해도 감지 가능)
      const interval = setInterval(() => {
        publish(`/app/class/${sessionId}/sync`, { type: 'STUDENT_ONLINE', sessionId, payload });
      }, 5000);

      return () => {
        clearInterval(interval);
        publish(`/app/class/${sessionId}/sync`, { type: 'STUDENT_OFFLINE', sessionId, payload: { studentId: String(studentId) } });
      };
    }
  }, [role, connected]);

  const getInitialStudentId = () => {
    try {
      if (studentSession.studentId) return studentSession.studentId;
      return user.studentId || user.loginId || 'student-1';
    } catch (e) { return 'student-1'; }
  };
  const mockStudentIdRef = React.useRef(getInitialStudentId());

  // --- 학생 목록 조회 (선생님 성함 기준) ---
  useEffect(() => {
    if (role === 'TEACHER' && userName !== '사용자') {
      const fetchStudents = async () => {
        try {
          // 요청하신 대로 teacherName을 최우선으로 필터링
          const res = await fetch(`http://localhost:8080/api/v1/students/teacher/${encodeURIComponent(userName)}`);
          if (res.ok) {
            const data = await res.json();
            // 학교명까지 일치하는지 한 번 더 필터링 (보안)
            const filtered = data.filter(s => s.schoolName === (teacherSession.schoolName || user.schoolName));
            setTeacherStudents(filtered);
            console.log(`[${userName}] 선생님 학생 목록 조회 성공: ${filtered.length}명`);
          }
        } catch (e) {
          console.error("Failed to fetch students by teacher", e);
        }
      };
      fetchStudents();
    }
  }, [role, userName]);

  // --- 10분 비활동 자동 로그아웃 ---
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("10분 동안 활동이 없어 보안을 위해 자동 로그아웃됩니다.");
        localStorage.removeItem('user');
        localStorage.removeItem('teacherSession');
        localStorage.removeItem('studentSession');
        localStorage.removeItem('user-role');
        window.location.href = '/dt/login';
      }, 10 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => window.addEventListener(name, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach(name => window.removeEventListener(name, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const memoCanvasRef = React.useRef(null);
  const memoContextRef = React.useRef(null);
  const [memoPenColor, setMemoPenColor] = useState('#3b82f6');
  const [memoPenSize, setMemoPenSize] = useState(3);
  const [isMemoEraser, setIsMemoEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    // 부모 요소의 전체 스크롤 영역을 캔버스 크기로 지정 (잘림 방지)
    const w = parent.scrollWidth || parent.offsetWidth;
    const h = parent.scrollHeight || parent.offsetHeight;
    
    canvas.width = w * 2; canvas.height = h * 2;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    
    const context = canvas.getContext('2d');
    context.scale(2, 2); context.lineCap = 'round'; context.lineJoin = 'round';
    context.strokeStyle = penColor; context.lineWidth = penSize;
    contextRef.current = context;
    console.log(`[Canvas] Resized to ${w}x${h} (Full scroll area)`);
  }, [currentPage]);

  useEffect(() => {
    if (!isMemoOpen || !memoCanvasRef.current) return;
    const canvas = memoCanvasRef.current;
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width === 0) return;
      canvas.width = rect.width * 2; canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = memoPenColor; ctx.lineWidth = memoPenSize;
      memoContextRef.current = ctx;
    };
    resizeCanvas();
  }, [isMemoOpen]);

  const startDrawing = (e) => {
    if (role !== 'TEACHER' || !contextRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    isDrawingRef.current = true;
    contextRef.current.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    contextRef.current.strokeStyle = penColor;
    contextRef.current.lineWidth = isEraser ? penSize * 4 : penSize;
    contextRef.current.beginPath(); contextRef.current.moveTo(x, y);
    // 좌표를 비율(0~1)로 정규화하여 전송 (화면 크기 차이 보정)
    if (isSyncing) publish(`/app/class/${sessionId}/sync`, { type: 'DRAW', sessionId, payload: { x: x / rect.width, y: y / rect.height, drawType: 'START', color: penColor, size: penSize, isEraser } });
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !contextRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    contextRef.current.lineTo(x, y); contextRef.current.stroke();
    // 좌표를 비율(0~1)로 정규화하여 전송
    if (isSyncing && role === 'TEACHER') publish(`/app/class/${sessionId}/sync`, { type: 'DRAW', sessionId, payload: { x: x / rect.width, y: y / rect.height, drawType: 'MOVE', color: penColor, size: penSize, isEraser } });
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (isSyncing && role === 'TEACHER') publish(`/app/class/${sessionId}/sync`, { type: 'DRAW', sessionId, payload: { x: 0, y: 0, drawType: 'END', color: penColor, size: penSize, isEraser } });
  };

  const handleMessage = useCallback((event) => {
    if (!event) return;
    console.log(`[STOMP] Packet received:`, event.type, event);
    
    if (event.type === 'SYNC_START') {
      setIsSyncing(true);
      setCurrentPage(event.payload?.page || 1);
    } else if (event.type === 'SYNC_END') {
      setIsSyncing(false);
    } else if (event.type === 'PAGE_MOVE') {
      if (role === 'STUDENT') setCurrentPage(event.payload?.page || 1);
    } else if (event.type === 'AI_PROBLEM_SHARED') {
      setSharedAiProblems(event.payload);
      setStudentAnswers({});
      setIsEvalSubmitted(false);
      setShowExplanationId(null);
    } else if (event.type === 'AI_PROBLEM_SUBMITTED') {
      if (role === 'TEACHER') {
        setSubmissionStats(prev => {
          const idx = prev.findIndex(s => s.studentId === event.payload.studentId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = event.payload;
            return next;
          }
          return [...prev, event.payload];
        });
      }
    } else if (event.type === 'STUDENT_AWAY') {
      if (role === 'TEACHER') {
        const alert = { id: Date.now(), ...event.payload };
        setAwayAlerts(prev => [alert, ...prev].slice(0, 5));
        setTimeout(() => setAwayAlerts(prev => prev.filter(a => a.id !== alert.id)), 5000);
      }
    } else if (event.type === 'STUDENT_ONLINE') {
      if (role === 'TEACHER') {
        const { studentId } = event.payload;
        setOnlineStudentIds(prev => new Set([...prev, String(studentId)]));
      }
    } else if (event.type === 'STUDENT_OFFLINE') {
      if (role === 'TEACHER') {
        const { studentId } = event.payload;
        setOnlineStudentIds(prev => {
          const next = new Set(prev);
          next.delete(String(studentId));
          return next;
        });
      }
    } else if (event.type === 'TEACHER_PING') {
      if (role === 'STUDENT') {
        const studentSession = JSON.parse(localStorage.getItem('studentSession') || '{}');
        const studentId = studentSession.studentId || studentSession.id;
        if (studentId) {
          window.dispatchEvent(new CustomEvent('student-pong', { 
            detail: { studentId: String(studentId), name: studentSession.name || '학생' } 
          }));
        }
      }
    } else if (event.type === 'DRAW') {
      if (role === 'STUDENT') {
        const { x, y, drawType, color, size, isEraser } = event.payload;
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        
        const rx = x * canvas.width;
        const ry = y * canvas.height;
        
        ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = isEraser ? size * 4 : size;
        ctx.lineCap = 'round';
        
        if (drawType === 'START') { 
          ctx.beginPath(); 
          ctx.moveTo(rx, ry); 
        } else if (drawType === 'MOVE') { 
          ctx.lineTo(rx, ry); 
          ctx.stroke(); 
        } else if (drawType === 'END') { 
          ctx.closePath(); 
        }
      }
    } else if (event.type === 'DRAW_CLEAR') {
      if (role === 'STUDENT') {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [role]);

  useEffect(() => {
    if (connected && sessionId) {
      const sub = subscribe(`/topic/class/${sessionId}/sync`, (msg) => {
        handleMessage(msg);
      });
      return () => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      };
    }
  }, [connected, sessionId, handleMessage]);

  const goToPage = (num) => {
    setCurrentPage(num);
    if (isSyncing && role === 'TEACHER') publish(`/app/class/${sessionId}/sync`, { type: 'PAGE_MOVE', sessionId, payload: { page: num } });
  };

  const fetchMonthlyReport = async (studentId) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/reports/monthly/${studentId}`);
      if (res.ok) setMonthlyAnalysis(await res.json());
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  const tableOfContents = isMath ? [
    {
      id: 1,
      chapter: "01. 분수와 자연수",
      sections: [
        { page: 1, title: "기초 용어 정의" },
        { page: 2, title: "생각 열기" },
        { page: 3, title: "직접 해보기" },
        { page: 4, title: "스스로 확인하기" }
      ]
    },
    {
      id: 2,
      chapter: "02. 덧셈과 뺄셈",
      sections: [
        { page: 5, title: "기초 용어 정의" },
        { page: 6, title: "생각 열기" },
        { page: 7, title: "직접 해보기" },
        { page: 8, title: "스스로 확인하기" }
      ]
    },
    {
      id: 3,
      chapter: "03. 길이 재기",
      sections: [
        { page: 9, title: "기초 용어 정의" },
        { page: 10, title: "생각 열기" },
        { page: 11, title: "직접 해보기" },
        { page: 12, title: "스스로 확인하기" }
      ]
    }
  ] : [
    {
      id: 1,
      chapter: "01. 인사와 이름",
      sections: [
        { page: 1, title: "기초 표현 익히기" },
        { page: 2, title: "대화 듣고 따라하기" },
        { page: 3, title: "단어 연습하기" },
        { page: 4, title: "스스로 확인하기" }
      ]
    },
    {
      id: 2,
      chapter: "02. 색깔과 물건",
      sections: [
        { page: 5, title: "기초 표현 익히기" },
        { page: 6, title: "대화 듣고 따라하기" },
        { page: 7, title: "단어 연습하기" },
        { page: 8, title: "스스로 확인하기" }
      ]
    },
    {
      id: 3,
      chapter: "03. 숫자와 가족",
      sections: [
        { page: 9, title: "기초 표현 익히기" },
        { page: 10, title: "대화 듣고 따라하기" },
        { page: 11, title: "단어 연습하기" },
        { page: 12, title: "스스로 확인하기" }
      ]
    }
  ];

  const quizData = isMath ? {
    1: [
      { id: 1, question: "5/7 ÷ 3", ansNum: "5", ansDen: "21", explain: "분수를 자연수로 나눌 때는 분모에 자연수를 곱합니다. 5 / (7 × 3) = 5 / 21" },
      { id: 2, question: "2/5 ÷ 4", ansNum: "2", ansDen: "20", explain: "분모 5에 4를 곱하면 20이 됩니다. 따라서 2 / 20 (약분 시 1/10) 입니다." },
      { id: 3, question: "3/8 ÷ 2", ansNum: "3", ansDen: "16", explain: "3 / (8 × 2) = 3 / 16" },
      { id: 4, question: "4/9 ÷ 5", ansNum: "4", ansDen: "45", explain: "4 / (9 × 5) = 4 / 45" },
      { id: 5, question: "7/10 ÷ 3", ansNum: "7", ansDen: "30", explain: "7 / (10 × 3) = 7 / 30" }
    ],
    2: [
      { id: 1, question: "42 + 28", answer: "70", explain: "2+8=10이므로 0을 쓰고 1을 받아올립니다. 1+4+2=7이 되어 70입니다." },
      { id: 2, question: "85 - 37", answer: "48", explain: "5에서 7을 뺄 수 없으므로 십의 자리에서 빌려옵니다. 15-7=8, 7-3=4이므로 48입니다." },
      { id: 3, question: "126 + 45", answer: "171", explain: "6+5=11(1 올림), 1+2+4=7, 1 그대로 하여 171입니다." },
      { id: 4, question: "200 - 125", answer: "75", explain: "0에서 빌려와 10-5=5, 9-2=7, 1-1=0이 되어 75입니다." },
      { id: 5, question: "67 + 54", answer: "121", explain: "7+4=11(1 올림), 1+6+5=12가 되어 121입니다." }
    ],
    3: [
      { id: 1, question: "150 cm = ? m ? cm", m: "1", cm: "50", explain: "100cm는 1m와 같습니다. 따라서 150cm = 1m 50cm입니다." },
      { id: 2, question: "235 cm = ? m ? cm", m: "2", cm: "35", explain: "200cm는 2m이므로, 235cm = 2m 35cm입니다." },
      { id: 3, question: "1 m 20 cm + 80 cm = ? m", m: "2", cm: "0", explain: "20cm + 80cm = 100cm = 1m입니다. 기존 1m와 합쳐 2m가 됩니다." },
      { id: 4, question: "3 m 50 cm - 1 m 10 cm = ? m ? cm", m: "2", cm: "40", explain: "3m-1m=2m, 50cm-10cm=40cm이므로 2m 40cm입니다." },
      { id: 5, question: "500 cm = ? m", m: "5", cm: "0", explain: "100cm가 5번 있으면 500cm이며, 이는 5m입니다." }
    ]
  } : {
    1: [
      { id: 1, question: '"안녕!"의 올바른 표현은?', answer: "Hello", options: ["Hello", "Bye", "Thanks"], explain: "만났을 때 하는 인사는 Hello입니다." },
      { id: 2, question: "My name ___ Sumin.", answer: "is", explain: "My name은 3인칭 단수이므로 is를 사용합니다." },
      { id: 3, question: '"만나서 반가워" 영어로?', answer: "Nice to meet you", explain: "Nice to meet you는 처음 만났을 때 하는 인사입니다." }
    ],
    2: [
      { id: 1, question: "사과는 무슨 색인가요?", answer: "Red", explain: "Red는 빨간색을 의미합니다." },
      { id: 2, question: 'This is a ___ (바나나).', answer: "banana", explain: "바나나는 영어로 banana입니다." }
    ],
    3: [
      { id: 1, question: "One, Two, ___...", answer: "Three", explain: "숫자 1, 2 다음은 3(Three)입니다." },
      { id: 2, question: '"아빠" 영어로?', answer: "Father", explain: "아빠는 Father 또는 Dad라고 합니다." }
    ]
  };

  const checkAnswer = (unit, idx) => {
    const key = `${unit}-${idx}`;
    const targetProblem = quizData[unit][idx];
    const userAns = userAnswers[key] || {};
    let isCorrect = false;

    if (isMath) {
      if (unit === 1) {
        isCorrect = (userAns.num === targetProblem.ansNum && userAns.den === targetProblem.ansDen);
      } else if (unit === 2) {
        isCorrect = (userAns.val === targetProblem.answer);
      } else if (unit === 3) {
        isCorrect = (userAns.m === targetProblem.m && (userAns.cm || "0") === (targetProblem.cm || "0"));
      }
    } else {
      // English simple check
      isCorrect = (userAns.val?.toLowerCase().trim() === targetProblem.answer.toLowerCase().trim());
    }

    setCorrectStatus(prev => ({ ...prev, [key]: isCorrect }));
    setShowResults(prev => ({ ...prev, [key]: true }));
  };

  const toggleExplanation = (unit, idx) => {
    const key = `${unit}-${idx}`;
    setShowExplanations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetProblem = (unit, idx) => {
    const key = `${unit}-${idx}`;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setShowResults(prev => ({ ...prev, [key]: false }));
    setShowExplanations(prev => ({ ...prev, [key]: false }));
  };

  const handleInputChange = (unit, idx, field, value) => {
    const key = `${unit}-${idx}`;
    setUserAnswers(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const toggleChapter = (id) => {
    setExpandedChapters(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const renderMathPageContents = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-left-8 duration-700 max-w-full overflow-x-hidden">
            <span className="text-aijoa-blue font-black text-[10px] md:text-sm uppercase tracking-[0.3em] mb-4 block">Basic Concepts</span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 mb-8 md:mb-12 tracking-tighter leading-tight">본격적인 시작 전, <br /><span className="text-aijoa-blue">용어의 뜻</span>을 알아볼까요?</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-aijoa-blue group-hover:text-white transition-colors">
                  <span className="text-3xl font-black">1/2</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">분수 (Fraction)</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-6">전체에 대한 <span className="text-aijoa-blue font-bold">부분의 크기</span>를 나타내는 수입니다.</p>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 italic space-y-4">
                  <div className="flex flex-col items-center">
                    <span className="text-blue-500 font-bold text-xs uppercase mb-1">분자 (Numerator)</span>
                    <div className="w-12 h-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-bold text-xs uppercase mt-1">분모 (Denominator)</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <span className="text-3xl font-black">123</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">자연수 (Natural Number)</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-6">사물의 개수를 셀 때 사용하는 <span className="text-green-500 font-bold">1, 2, 3...</span> 과 같은 수입니다.</p>
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 text-center">
                  <p className="text-xl md:text-3xl font-black text-slate-200 tracking-widest">1, 2, 3...</p>
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-12 p-6 md:p-8 bg-yellow-50 rounded-[30px] border border-yellow-100 flex items-start space-x-4">
              <div className="text-lg md:text-2xl uppercase font-black text-yellow-600 shrink-0">Tip</div>
              <p className="text-sm md:text-base text-slate-600 font-medium">오늘은 이 두 가지가 만났을 때 생기는 나눗셈의 원리를 배울 거예요!</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-full">
            <span className="text-aijoa-blue font-black text-[10px] md:text-sm uppercase tracking-[0.3em] mb-4 block">Preparation</span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 mb-6 md:mb-8 leading-tight tracking-tighter">분수와 자연수의 <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-aijoa-blue to-blue-400">나눗셈 알아보기</span></h2>
            <div className="bg-blue-50/50 rounded-[40px] p-10 border-2 border-blue-100 mb-12">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-xl md:text-2xl">🍕</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-700">생각 열기</h3>
              </div>
              <p className="text-base md:text-xl font-medium text-slate-600 leading-relaxed mb-6">피자 <span className="font-black text-aijoa-blue">3/4 판</span>을 친구 <span className="font-black text-aijoa-blue">2명</span>이 똑같이 나누어 먹으려고 합니다. <br className="hidden md:block" />한 명이 먹게 되는 피자는 전체의 얼마인지 알아봅시다.</p>
              <div className="flex justify-center py-6">
                <div className="relative w-64 h-64 border-8 border-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-orange-100" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
                  <div className="absolute inset-0 border-4 border-white opacity-50" style={{ backgroundImage: 'linear-gradient(45deg, transparent 49%, #fff 49%, #fff 51%, transparent 51%), linear-gradient(-45deg, transparent 49%, #fff 49%, #fff 51%, transparent 51%)' }}></div>
                  <span className="relative font-black text-4xl text-orange-600 drop-shadow-sm">3/4</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700 w-full max-w-full overflow-hidden">
            <span className="text-green-500 font-black text-[10px] md:text-sm uppercase tracking-[0.3em] mb-4 block">Step-by-Step</span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-8 md:mb-10 tracking-tighter italic">직접 해보기</h2>
            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h4 className="text-lg font-black text-slate-700 mb-4">1단계: 그림으로 나타내기</h4>
                <div className="flex items-center justify-center space-x-12 py-10 scale-125">
                  <div className="text-center">
                    <div className="mb-2 font-black text-2xl">3 / 4</div>
                    <div className="w-20 h-10 border-2 border-slate-300 flex">
                      <div className="flex-[3] bg-orange-400"></div>
                      <div className="flex-[1] bg-slate-100"></div>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-slate-300">÷ 2</div>
                  <div className="text-center">
                    <div className="mb-2 font-black text-2xl">?</div>
                    <div className="w-20 h-10 border-2 border-slate-300 flex flex-col">
                      <div className="flex-1 border-b border-slate-200 flex">
                        <div className="flex-[3] bg-orange-200"></div>
                        <div className="flex-[1] bg-slate-50"></div>
                      </div>
                      <div className="flex-1 flex">
                        <div className="flex-[3] bg-orange-200"></div>
                        <div className="flex-[1] bg-slate-50"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-[40px] bg-aijoa-blue text-white shadow-2xl shadow-blue-200">
                <h4 className="text-xl font-black mb-4">💡 핵심 원리</h4>
                <p className="text-lg opacity-90 leading-relaxed font-medium">
                  "분수를 자연수로 나눌 때는 <span className="font-black text-white underline underline-offset-4 decoration-2">분모에 그 자연수를 곱해주는 것</span>과 같습니다."
                </p>
                <div className="mt-8 bg-white/10 rounded-2xl p-6 font-mono text-3xl font-black text-center flex items-center justify-center space-x-4">
                  <span>3 / 4</span>
                  <span>×</span>
                  <span>1 / 2</span>
                  <span>=</span>
                  <span className="bg-white text-aijoa-blue px-4 py-2 rounded-xl">3 / 8</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in zoom-in-95 duration-500 pb-20 w-full max-w-full">
            <div className="flex justify-between items-center mb-8 md:mb-12">
              <div>
                <span className="text-red-500 font-black text-[10px] md:text-sm uppercase tracking-[0.3em] mb-4 block">Self Check</span>
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter leading-tight">스스로 확인하기</h2>
              </div>
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <Check size={28} />
              </div>
            </div>
            <div className="space-y-16">
              {quizData[1].map((prob, idx) => (
                <div key={prob.id} className="bg-slate-50/50 p-6 md:p-10 rounded-[30px] md:rounded-[40px] border-2 border-slate-100">
                  <p className="text-lg md:text-2xl font-black text-slate-700 mb-6 md:mb-10 flex items-start md:items-center space-x-3 md:space-x-4">
                    <span className="w-8 h-8 md:w-10 md:h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center text-sm md:text-lg shrink-0 mt-1 md:mt-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span>{prob.question} <span className="text-aijoa-blue italic md:ml-4 block md:inline mt-2 md:mt-0">{prob.question}</span></span>
                  </p>
                  <div className="flex flex-col items-center space-y-8">
                    <div className="flex items-center space-x-4 md:space-x-6 text-2xl md:text-4xl font-black italic">
                      <div className="flex flex-col space-y-2">
                        <input 
                          type="number" 
                          value={userAnswers[`1-${idx}`]?.num || ""} 
                          onChange={(e) => handleInputChange(1, idx, 'num', e.target.value)}
                          placeholder="?" 
                          className="w-16 h-16 md:w-20 md:h-20 bg-white border-3 md:border-4 border-slate-100 rounded-2xl md:rounded-3xl text-center text-aijoa-blue outline-none focus:border-aijoa-blue transition-all shadow-inner text-xl md:text-2xl"
                        />
                        <div className="w-16 md:w-20 h-1 bg-slate-200"></div>
                        <input 
                          type="number" 
                          value={userAnswers[`1-${idx}`]?.den || ""} 
                          onChange={(e) => handleInputChange(1, idx, 'den', e.target.value)}
                          placeholder="?" 
                          className="w-16 h-16 md:w-20 md:h-20 bg-white border-3 md:border-4 border-slate-100 rounded-2xl md:rounded-3xl text-center text-aijoa-blue outline-none focus:border-aijoa-blue transition-all shadow-inner text-xl md:text-2xl"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                      <button 
                        type="button" 
                        onClick={() => checkAnswer(1, idx)}
                        className="px-5 md:px-8 py-3 md:py-4 bg-slate-800 text-white rounded-[15px] md:rounded-[20px] font-black text-sm md:text-lg hover:bg-slate-700 transition-all flex items-center space-x-2 md:space-x-3 active:scale-95"
                      >
                        <RefreshCw size={18} className="text-yellow-400" />
                        <span>정답 확인</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => toggleExplanation(1, idx)}
                        className={`px-5 md:px-8 py-3 md:py-4 rounded-[15px] md:rounded-[20px] font-black text-sm md:text-lg transition-all flex items-center space-x-2 md:space-x-3 border-2 active:scale-95 ${showExplanations[`1-${idx}`] ? 'bg-aijoa-blue text-white border-aijoa-blue' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <BrainCircuit size={18} className={showExplanations[`1-${idx}`] ? "text-white" : "text-aijoa-blue"} />
                        <span>풀이</span>
                      </button>
                    </div>
                  </div>
                  {showResults[`1-${idx}`] && (
                    <div className={`mt-10 p-8 rounded-[30px] border-4 animate-in slide-in-from-top-4 ${correctStatus[`1-${idx}`] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${correctStatus[`1-${idx}`] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {correctStatus[`1-${idx}`] ? <Check size={24} /> : <X size={24} />}
                        </div>
                        <div className="flex-grow">
                          <h4 className={`text-xl font-black ${correctStatus[`1-${idx}`] ? 'text-green-700' : 'text-red-700'}`}>
                            {correctStatus[`1-${idx}`] ? '잘했어요! 정답입니다.' : '다시 한번 풀어볼까요?'}
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                  {showExplanations[`1-${idx}`] && (
                    <div className="mt-6 p-8 rounded-[30px] bg-blue-50 border-2 border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                       <div className="flex items-center space-x-2 text-aijoa-blue mb-4">
                         <BrainCircuit size={18} />
                         <p className="font-black">AI 선생님의 문제 풀이 가이드</p>
                       </div>
                       <div className="bg-white/80 p-6 rounded-2xl border border-white shadow-sm">
                         <p className="text-slate-600 font-medium leading-relaxed">{prob.explain}</p>
                       </div>
                    </div>
                  )}
                  {(showResults[`1-${idx}`] || showExplanations[`1-${idx}`]) && (
                    <button onClick={() => resetProblem(1, idx)} className="mt-6 ml-4 flex items-center space-x-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                      <RotateCcw size={14} /> <span>다시 풀기</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEnglishPageContents = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <span className="text-pink-500 font-black text-sm uppercase tracking-[0.3em] mb-4 block">Unit 01: Greetings</span>
            <h2 className="text-5xl font-black text-slate-800 mb-12 tracking-tighter">처음 만났을 때, <br /><span className="text-pink-500">영어로 인사</span>해볼까요?</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-pink-50 rounded-[40px] p-10 border border-pink-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  <span className="text-3xl font-black">👋</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">"Hello!"</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-6">가장 기본이 되는 인사말이에요. <span className="text-pink-500 font-bold">낮이나 밤이나</span> 언제든 쓸 수 있어요.</p>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center font-black text-3xl text-pink-400">
                  A: Hello!<br/>B: Hello!
                </div>
              </div>
              <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <span className="text-3xl font-black">🤝</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">"Nice to meet you."</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-6">누군가를 <span className="text-indigo-500 font-bold">처음 만났을 때</span> 반갑다고 인사하는 표현이에요.</p>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center font-bold text-lg text-slate-400 italic">
                  "Nice to meet you, too!"
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-pink-500 font-black text-sm uppercase tracking-[0.3em] mb-4 block">Let's Talk</span>
            <h2 className="text-5xl font-black text-slate-800 mb-8 leading-tight tracking-tighter">내 이름을 <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">영어로 말해봐요</span></h2>
            <div className="bg-pink-50/50 rounded-[40px] p-10 border-2 border-pink-100 mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">🎤</div>
                <h3 className="text-2xl font-black text-slate-700">대화 따라하기</h3>
              </div>
              <div className="space-y-6">
                 <div className="flex items-start space-x-4 bg-white p-6 rounded-3xl shadow-sm">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600">A</div>
                    <p className="text-2xl font-black text-slate-800">"What is your name?"</p>
                 </div>
                 <div className="flex items-start space-x-4 bg-white p-6 rounded-3xl shadow-sm ml-12 border-2 border-pink-200">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center font-black text-pink-600">B</div>
                    <p className="text-2xl font-black text-slate-800 italic">"My name is <span className="text-pink-500">Sumin.</span>"</p>
                 </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in zoom-in-95 duration-500 pb-20">
            <div className="flex justify-between items-center mb-12">
              <div>
                <span className="text-pink-500 font-black text-sm uppercase tracking-[0.3em] mb-4 block">Review Time</span>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight">스스로 확인하기 (영어 기초)</h2>
              </div>
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                <Star size={28} fill="currentColor" />
              </div>
            </div>
            <div className="space-y-16">
              {quizData[1].map((prob, idx) => (
                <div key={prob.id} className="bg-slate-50/50 p-10 rounded-[40px] border-2 border-slate-100">
                  <p className="text-2xl font-black text-slate-700 mb-6 flex items-center space-x-4">
                    <span className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center text-lg">{String(idx + 1).padStart(2, '0')}</span>
                    <span>{prob.question}</span>
                  </p>
                  <div className="flex flex-col items-center space-y-6">
                    <input 
                      type="text" 
                      value={userAnswers[`1-${idx}`]?.val || ""} 
                      onChange={(e) => handleInputChange(1, idx, 'val', e.target.value)}
                      placeholder="정답을 입력하세요" 
                      className="w-full max-w-md px-8 py-5 bg-white border-4 border-slate-100 rounded-[30px] text-center text-pink-600 outline-none focus:border-pink-500 transition-all shadow-inner text-2xl font-black"
                    />
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => checkAnswer(1, idx)}
                        className="px-8 py-4 bg-slate-800 text-white rounded-[20px] font-black text-lg hover:bg-slate-700 transition-all flex items-center space-x-3"
                      >
                        <RefreshCw size={20} className="text-yellow-400" />
                        <span>정답 확인</span>
                      </button>
                      <button 
                        onClick={() => toggleExplanation(1, idx)}
                        className={`px-8 py-4 rounded-[20px] font-black text-lg transition-all flex items-center space-x-3 border-2 ${showExplanations[`1-${idx}`] ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <BrainCircuit size={20} />
                        <span>힌트</span>
                      </button>
                    </div>
                  </div>
                  {showResults[`1-${idx}`] && (
                    <div className={`mt-10 p-8 rounded-[30px] border-4 animate-in slide-in-from-top-4 ${correctStatus[`1-${idx}`] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <h4 className={`text-xl font-black ${correctStatus[`1-${idx}`] ? 'text-green-700' : 'text-red-700'}`}>
                        {correctStatus[`1-${idx}`] ? 'Great Job!' : 'Try Again!'}
                      </h4>
                    </div>
                  )}
                  {showExplanations[`1-${idx}`] && (
                    <div className="mt-6 p-8 rounded-[30px] bg-pink-50 border-2 border-pink-100">
                       <p className="font-bold text-pink-600 mb-2">💡 Hint</p>
                       <p className="text-slate-600 font-medium leading-relaxed">{prob.explain}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center py-40">
            <h2 className="text-3xl font-black mb-8">{currentPage}페이지</h2>
            <p className="text-slate-500">영어 교과서의 해당 페이지 내용을 준비 중입니다...</p>
          </div>
        );
    }
  };

  const renderPageContents = () => {
    return isMath ? renderMathPageContents() : renderEnglishPageContents();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      <header className="h-16 bg-slate-800 text-white flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-xl transition-all shadow-md active:scale-90 ${isSidebarOpen ? 'bg-aijoa-blue text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            title={isSidebarOpen ? "목차 숨기기" : "목차 열기"}
          >
            <BookOpen size={20} />
          </button>
          <div className="flex items-center space-x-3 ml-2">
            <div className={`w-8 h-8 ${theme.bg} rounded-lg flex items-center justify-center shadow-lg`}>
              <BookMarked className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tight flex items-center">
              <span className="text-white mr-2">AIJOA</span>
              <span className={`${theme.text} bg-white/10 px-3 py-1 rounded-full text-sm ml-2`}>{theme.title}</span>
            </h1>
          </div>
          <div className="h-4 w-[1px] bg-slate-600 hidden lg:block"></div>
          <p className="text-slate-400 text-sm font-bold hidden lg:block">
            환영합니다. <span className="text-white">{userName}</span>님
          </p>
        </div>
        <div className="flex items-center space-x-4 relative">
          {role === 'TEACHER' ? (
            <>
              <button 
                onClick={() => {
                  const newState = !isSyncing;
                  setIsSyncing(newState);
                  if (newState) {
                    publish(`/app/class/${sessionId}/sync`, { type: 'SYNC_START', sessionId, payload: { page: currentPage } });
                  } else {
                    publish(`/app/class/${sessionId}/sync`, { type: 'SYNC_END', sessionId });
                  }
                }}
                className={`px-6 py-2.5 rounded-xl font-black shadow-lg transition-all active:scale-95 flex items-center space-x-2 ${isSyncing ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {isSyncing ? <Square size={18} /> : <Play size={18} />}
                <span>{isSyncing ? '수업 종료' : '수업 시작'}</span>
              </button>
              <button onClick={() => setShowAiGenerator(true)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg transition-all active:scale-95 flex items-center space-x-2">
                <BrainCircuit size={18} />
                <span>AI 문제 생성</span>
              </button>
              <button 
                onClick={() => setIsStudentListOpen(!isStudentListOpen)} 
                className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${isStudentListOpen ? 'bg-white text-slate-800' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                title="학생 접속 현황"
              >
                <Users size={20} />
              </button>
              
              {/* Student Attendance Dropdown */}
              {isStudentListOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-[200] animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 flex items-center">
                      <Users size={16} className="text-indigo-600 mr-2" />
                      학생 접속 현황
                    </h3>
                    <div className="flex space-x-2 text-xs font-bold">
                       <span className="text-green-600">접속 중: {onlineStudentIds.size}명</span>
                       <span className="text-red-400">미접속: {teacherStudents.length - onlineStudentIds.size}명</span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2 space-y-1 bg-slate-100/50 flex-grow">
                   {teacherStudents.length > 0 ? teacherStudents.map((s, idx) => {
                      const isOnline = onlineStudentIds.has(String(s.id));
                      return (
                        <div key={s.id || idx} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                          <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                          <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                            {isOnline ? '● 접속 중' : '● 미접속'}
                          </div>
                        </div>
                      )
                    }) : (
                        <div className="p-8 flex flex-col items-center justify-center opacity-50 text-center">
                            <Users size={32} className="mb-2" />
                            <p className="font-black text-sm">등록된 학생이 없습니다.</p>
                            <p className="text-xs font-bold mt-1">학생 관리 메뉴에서 추가해주세요.</p>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {sharedAiProblems && <button onClick={() => setIsEvaluationStarted(true)} className={`px-6 py-2.5 rounded-xl font-black ${theme.bg} text-white shadow-lg animate-pulse transition-all active:scale-95`}>AI 문제 풀기</button>}
              <button onClick={() => setIsMemoOpen(!isMemoOpen)} className={`px-6 py-2.5 rounded-xl font-black shadow-lg transition-all active:scale-95 flex items-center space-x-2 ${isMemoOpen ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-white'}`}>
                <PenTool size={18} />
                <span>나만의 메모장</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => window.close()}
            className="ml-4 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-black shadow-lg transition-all active:scale-95 flex items-center space-x-2 border border-slate-700"
          >
            <LogOut size={18} className="text-red-400" />
            <span>나가기</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex bg-slate-100 overflow-hidden relative">
        {/* Syncing Indicator */}
        {isSyncing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[300] bg-red-600/95 text-white px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-sm flex items-center space-x-3 overflow-hidden animate-in slide-in-from-top-6 duration-300">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <span className="relative z-10 w-2.5 h-2.5 bg-red-100 rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.7)] animate-ping"></span>
            <span className="relative z-10 font-black text-sm tracking-widest drop-shadow-md">원격 수업 진행 중입니다</span>
          </div>
        )}
        
        {/* 숨김/나타냄이 자유로운 사이드바 목차 */}
        <aside 
          className={`bg-white border-r border-slate-200 flex flex-col shadow-inner shrink-0 z-40 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full overflow-hidden'}`}
        >
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Navigation</h3>
              <p className="text-sm font-black text-slate-800">전체 학습 목차</p>
            </div>
            {role === 'TEACHER' && (
              <button 
                onClick={() => { setIsMirroringMode(!isMirroringMode); setSelectedMirrorStudent(null); }}
                title="학생 화면 모니터링"
                className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl transition-all shadow-sm border ${isMirroringMode ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700 text-white shadow-inner animate-pulse' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'}`}
              >
                <div className="flex items-center">
                   <Tv size={18} className="mb-0.5" />
                </div>
                <span className="text-[10px] font-black tracking-wide mt-1">학생 모니터링</span>
              </button>
            )}
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {tableOfContents.map(chapter => (
              <div key={chapter.id} className="space-y-1">
                <button 
                   onClick={() => toggleChapter(chapter.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${expandedChapters.includes(chapter.id) ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  <h4 className="text-xs font-black">{chapter.chapter}</h4>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${expandedChapters.includes(chapter.id) ? 'rotate-90' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedChapters.includes(chapter.id) ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                   <div className="ml-2 border-l-2 border-slate-100 space-y-1">
                     {chapter.sections.map(section => (
                       <button 
                         key={section.page}
                         onClick={() => goToPage(section.page)}
                         className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex items-center space-x-3 ${currentPage === section.page ? 'bg-aijoa-blue/10 text-aijoa-blue' : 'hover:bg-slate-50 text-slate-500'}`}
                       >
                         <div className={`w-1.5 h-1.5 rounded-full ${currentPage === section.page ? 'bg-aijoa-blue animate-pulse' : 'bg-slate-200 group-hover:bg-aijoa-blue'}`} />
                         <span className={`text-[13px] font-bold ${currentPage === section.page ? 'font-black' : ''}`}>{section.title}</span>
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-slate-50/50 border-t border-slate-100">
             <div className="flex items-center justify-between text-slate-400 mb-2">
               <div className="flex items-center space-x-2">
                 <Check size={14} />
                 <span className="text-[10px] font-bold uppercase">Progress</span>
               </div>
               <span className="text-[10px] font-black">{Math.round((currentPage / (tableOfContents.length * 4)) * 100)}%</span>
             </div>
             <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-aijoa-blue transition-all duration-500" style={{ width: `${(currentPage / (tableOfContents.length * 4)) * 100}%` }}></div>
             </div>
          </div>
        </aside>
        
        {/* 교과서 메인 뷰어 영역 - 사이드바 상태에 따라 자동 전체 화면 확장 */}
        <div className={`flex-grow flex items-start justify-center p-4 md:p-8 lg:p-12 xl:p-16 bg-slate-200 relative overflow-y-auto transition-all duration-500`}>
          <div className="absolute top-4 left-4 z-[60] flex flex-col space-y-2 opacity-30 hover:opacity-100 transition-opacity lg:hidden">
             {/* 모바일/태블릿에서 목차가 닫혔을 때 띄우는 플로팅 버튼 */}
             {!isSidebarOpen && (
               <button onClick={() => setIsSidebarOpen(true)} className="p-4 bg-aijoa-blue text-white rounded-2xl shadow-xl active:scale-90">
                 <BookOpen size={24} />
               </button>
             )}
          </div>
          {isMirroringMode && role === 'TEACHER' ? (
            <div className="w-full h-full bg-slate-800 rounded-[40px] p-8 flex flex-col shadow-inner animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-8 px-4">
                 <h2 className="text-white text-2xl font-black flex items-center"><Tv className="mr-3 text-indigo-400"/> 학생 모니터링 모드</h2>
                 <button onClick={() => setIsMirroringMode(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all flex items-center space-x-2 active:scale-95"><X size={18}/><span>미러링 종료</span></button>
               </div>
               {!selectedMirrorStudent ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-20">
                     {teacherStudents.map((student, i) => (
                        <div key={student.id || i} onClick={() => setSelectedMirrorStudent(student)} className="bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-indigo-400 p-5 rounded-3xl cursor-pointer transition-all flex flex-col group min-h-[220px]">
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-white font-black text-lg drop-shadow-md">{student.name}</span>
                              <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg ${i % 2 === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800/50 text-slate-500'}`}>{i % 2 === 0 ? 'ON' : 'OFF'}</span>
                           </div>
                           <div className="bg-slate-800/50 border border-white/5 flex-grow rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-all">
                              <BookOpen size={32} className="text-slate-600 absolute group-hover:scale-150 group-hover:text-slate-500 transition-all duration-500"/>
                              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/20 transition-all z-10 flex items-center justify-center">
                                 <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50 px-3 py-1 rounded-full drop-shadow-lg text-sm">화면 보기</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="flex flex-col h-full bg-slate-200 rounded-[30px] overflow-hidden relative border-4 border-slate-700">
                     <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center text-white z-20 shrink-0">
                        <span className="font-bold flex items-center"><Users size={16} className="mr-2 text-indigo-400"/>{selectedMirrorStudent.name} 학생 실시간 미러링</span>
                        <button onClick={() => setSelectedMirrorStudent(null)} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-all flex items-center space-x-1 active:scale-95"><ChevronLeft size={16}/><span>목록으로</span></button>
                     </div>
                     <div className="flex-grow flex items-center justify-center relative pointer-events-none opacity-90 overflow-hidden bg-slate-300">
                         {/* Mock mirrored view of the current page */}
                         <div className="w-[1200px] h-[800px] transform scale-75 origin-center bg-white shadow-2xl rounded-2xl p-8">
                           {renderPageContents()}
                         </div>
                     </div>
                  </div>
               )}
            </div>
          ) : (
            <>
              <div className="w-full max-w-6xl mx-auto bg-white shadow-2xl rounded-[40px] relative overflow-visible mb-20 p-8 md:p-12 lg:p-16 ring-1 ring-slate-900/5">
                <canvas 
                  ref={canvasRef} 
                  onMouseDown={startDrawing} 
                  onMouseMove={draw} 
                  onMouseUp={stopDrawing} 
                  onMouseLeave={stopDrawing} 
                  onMouseOut={stopDrawing}
                  className={`absolute inset-0 z-[500] touch-none ${isEraser ? 'cursor-crosshair' : 'cursor-pencil'} rounded-[40px]`}
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="relative z-0 select-none overflow-x-hidden">
                  {renderPageContents()}
                </div>
              </div>

          {/* Floating Drawing Toolbar (Teacher Only) */}
          {role === 'TEACHER' && (
            <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl border border-white flex items-center space-x-3 md:space-x-6 animate-in slide-in-from-bottom-4 ring-1 ring-black/5 scale-90 md:scale-100 origin-bottom">
              <div className="flex items-center space-x-1.5 md:space-x-2">
               {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000'].map(color => (
                 <button 
                  key={color} 
                  onClick={() => { setPenColor(color); setIsEraser(false); }}
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-transform hover:scale-125 ${penColor === color && !isEraser ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                 />
               ))}
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="flex items-center space-x-2 md:space-x-4">
               <button 
                onClick={() => setIsEraser(false)}
                className={`p-2 md:p-2.5 rounded-xl transition-all ${!isEraser ? 'bg-slate-800 text-white rotate-12 scale-110 shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
               >
                 <PenTool size={18} />
               </button>
               <button 
                onClick={() => setIsEraser(true)}
                className={`p-2 md:p-2.5 rounded-xl transition-all ${isEraser ? 'bg-slate-800 text-white -rotate-12 scale-110 shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
               >
                 <Eraser size={18} />
               </button>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="items-center space-x-1 md:space-x-3 hidden sm:flex">
               {[1, 3, 5, 8].map(size => (
                 <button 
                  key={size}
                  onClick={() => setPenSize(size)}
                  className={`flex items-center justify-center transition-all ${penSize === size ? 'text-slate-800 scale-125' : 'text-slate-300 hover:text-slate-400'}`}
                 >
                   <div style={{ width: size+4, height: size+4 }} className={`rounded-full ${penSize === size ? 'bg-slate-800' : 'bg-current'}`} />
                 </button>
               ))}
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <button 
              onClick={() => {
                const ctx = contextRef.current;
                const canvas = canvasRef.current;
                if(ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
                if(isSyncing && role === 'TEACHER') publish(`/app/class/${sessionId}/sync`, { type: 'DRAW_CLEAR', sessionId });
              }}
              className="p-2 md:p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              title="전체 지우기"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex space-x-4 z-50 transition-opacity ${isMirroringMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button onClick={() => goToPage(Math.max(1, currentPage - 1))} className="p-4 bg-white hover:bg-slate-50 text-slate-600 rounded-full shadow-lg transition-all active:scale-95 border border-slate-100">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center px-6 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white font-black text-slate-800">
               {currentPage} / {totalPages}
            </div>
            <button onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} className="p-4 bg-white hover:bg-slate-50 text-slate-600 rounded-full shadow-lg transition-all active:scale-95 border border-slate-100">
              <ChevronRight size={24} />
            </button>
            </div>
            </>
          )}
        </div>

        {/* Student Memo Right Sidebar */}
        {isMemoOpen && role === 'STUDENT' && (
          <aside className="w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-2xl shrink-0 z-20 transition-all animate-in slide-in-from-right-8 duration-300">
            <div className="p-5 bg-slate-50 flex justify-between items-center border-b border-slate-200">
              <h3 className="font-black text-slate-800 flex items-center space-x-2">
                <PenTool size={18} className="text-aijoa-blue" />
                <span>나만의 메모장</span>
              </h3>
              <button onClick={() => setIsMemoOpen(false)} className="text-slate-400 hover:text-slate-700 active:scale-95 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow relative bg-white cursor-crosshair">
              {/* Note Grid Pattern (Subtle) */}
              <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <canvas 
                ref={memoCanvasRef} 
                className={`absolute inset-0 z-20 touch-none w-full h-full ${isMemoEraser ? 'cursor-crosshair' : 'cursor-pencil'}`}
                onMouseDown={(e) => {
                  const rect = memoCanvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                  memoContextRef.current.globalCompositeOperation = isMemoEraser ? 'destination-out' : 'source-over';
                  memoContextRef.current.strokeStyle = memoPenColor;
                  memoContextRef.current.lineWidth = isMemoEraser ? memoPenSize * 4 : memoPenSize;
                  memoContextRef.current.beginPath(); memoContextRef.current.moveTo(x, y);
                  isDrawingRef.current = true;
                }}
                onMouseMove={(e) => {
                  if(!isDrawingRef.current || !memoContextRef.current) return;
                  const rect = memoCanvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                  memoContextRef.current.lineTo(x, y); memoContextRef.current.stroke();
                }}
                onMouseUp={() => { isDrawingRef.current = false; }}
                onMouseLeave={() => { isDrawingRef.current = false; }}
              />
            </div>
            <div className="p-5 bg-slate-50 flex flex-col space-y-4 border-t border-slate-200 shrink-0">
               <div className="flex items-center justify-between space-x-2 bg-white border border-slate-200 p-2 rounded-2xl text-center shadow-sm">
                 {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(color => (
                   <button 
                    key={color} 
                    onClick={() => { setMemoPenColor(color); setIsMemoEraser(false); }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${memoPenColor === color && !isMemoEraser ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                   />
                 ))}
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setIsMemoEraser(false)} className={`flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-black text-sm ${!isMemoEraser ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                   <PenTool size={16} /> <span>펜</span>
                 </button>
                 <button onClick={() => setIsMemoEraser(true)} className={`flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-black text-sm ${isMemoEraser ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                   <Eraser size={16} /> <span>지우개</span>
                 </button>
               </div>
               <button 
                  onClick={() => {
                    const ctx = memoContextRef.current;
                    const canvas = memoCanvasRef.current;
                    if(ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-black text-sm border border-transparent hover:border-red-100"
                >
                  <Trash2 size={16} /> <span>전체 지우기</span>
                </button>
            </div>
          </aside>
        )}

        {/* Away Alerts */}
        {role === 'TEACHER' && awayAlerts.map(a => (
          <div key={a.id} className="fixed top-20 right-10 bg-red-600 text-white p-4 rounded-xl shadow-2xl animate-bounce">{a.studentName} 학생 이탈!</div>
        ))}
      </main>

      {/* Evaluation Modal */}
      {isEvaluationStarted && sharedAiProblems && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[40px] flex flex-col overflow-hidden shadow-2xl">
            <header className={`p-8 ${isEvalSubmitted ? 'bg-green-600' : 'bg-blue-600'} text-white flex justify-between items-center`}>
              <h2 className="text-2xl font-black">{sharedAiProblems.title}</h2>
              <button onClick={() => setIsEvaluationStarted(false)}><X size={32}/></button>
            </header>
            <main className="flex-grow overflow-y-auto p-10 space-y-8 bg-slate-50">
              {sharedAiProblems.problems.map((prob, i) => (
                <div key={prob.id} className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm transition-all hover:border-blue-200">
                  <h3 className="text-xl font-black mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">{i+1}</span>
                    {prob.question}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {prob.options.map(opt => (
                      <button 
                        key={opt} 
                        disabled={isEvalSubmitted}
                        onClick={() => setStudentAnswers(prev => ({...prev, [prob.id]: opt}))}
                        className={`p-4 rounded-2xl border-4 text-left font-bold transition-all ${studentAnswers[prob.id] === opt ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-600'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {isEvalSubmitted && (
                    <div className="mt-6 space-y-4">
                      <div className={`p-4 rounded-2xl font-black flex items-center space-x-3 ${studentAnswers[prob.id] === prob.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span>{studentAnswers[prob.id] === prob.answer ? '정답입니다! ✨' : `오답입니다. (정답: ${prob.answer})`}</span>
                      </div>
                      <button 
                        onClick={() => setShowExplanationId(showExplanationId === prob.id ? null : prob.id)}
                        className="flex items-center space-x-2 text-blue-600 font-bold px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <BrainCircuit size={18} />
                        <span>{showExplanationId === prob.id ? '풀이 닫기' : 'AI 상세 풀이 보기'}</span>
                      </button>
                      {showExplanationId === prob.id && (
                        <div className="p-6 bg-slate-900 text-slate-200 rounded-3xl border-l-8 border-yellow-400 animate-in slide-in-from-top-2 duration-300">
                           <p className="font-bold leading-relaxed">{prob.explanation}</p>
                           <p className="mt-4 text-yellow-400 text-sm font-black italic">"조금만 더 힘내면 이 유형도 정복할 수 있어요! 화이팅!"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!isEvalSubmitted && (
                <button 
                  onClick={() => {
                    const score = Math.round((sharedAiProblems.problems.filter(p => studentAnswers[p.id] === p.answer).length / sharedAiProblems.problems.length) * 100);
                    publish(`/app/class/${sessionId}/sync`, { type: 'AI_PROBLEM_SUBMITTED', sessionId, payload: { studentId: mockStudentIdRef.current, studentName: '학생', answers: studentAnswers, score } });
                    setIsEvalSubmitted(true);
                  }}
                  className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  채점하기
                </button>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Teacher Stats Modal (Simplified for restoration) */}
      {showTeacherStats && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-8 bg-black/60">
          <div className="bg-white w-full max-w-4xl h-[70vh] rounded-[40px] flex flex-col p-10 overflow-hidden">
            <header className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black">실시간 제출 분석</h2><button onClick={() => setShowTeacherStats(false)}><X/></button></header>
            <div className="flex-grow overflow-y-auto space-y-4">
              {sharedAiProblems.problems.map((p, i) => {
                const correctCount = submissionStats.filter(s => s.answers[p.id] === p.answer).length;
                const rate = Math.round((correctCount / (submissionStats.length || 1)) * 100);
                return (
                  <div key={p.id} className="p-6 border-2 rounded-2xl">
                    <p className="font-bold mb-4">{i+1}. {p.question}</p>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden"><div className="bg-blue-600 h-full" style={{width: `${rate}%`}}></div></div>
                    <p className="text-blue-600 font-black mt-2">정답률 {rate}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showAiGenerator && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-black/50">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[40px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <AiProblemGenerator 
              subjectId={subjectId}
              tableOfContents={tableOfContents}
              onClose={() => setShowAiGenerator(false)}
              onShare={(p) => { 
                publish(`/app/class/${sessionId}/sync`, { type: 'AI_PROBLEM_SHARED', sessionId, payload: p }); 
                setShowAiGenerator(false); 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TextbookViewer;
