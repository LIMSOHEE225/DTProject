import React, { useState } from 'react';
import { BrainCircuit, ChevronRight, Check, Play, Send, LayoutDashboard, Settings2, BookOpen, Layers, X } from 'lucide-react';

import useStomp from '../hooks/useStomp';

const AiProblemGenerator = ({ isModal = false, onClose, onShare, subjectId = '1', tableOfContents = [] }) => {
    const isEnglish = subjectId === '2';
    const sessionId = 1004; // 교과서 세션과 동일하게 설정
    const { publish } = useStomp(sessionId);
    const [step, setStep] = useState(1); // 1: 단원, 2: 문항수/난이도, 3: 생성/확인
    
    // DB에서 불러와 로그인 시 저장된 선생님 본인의 '학년' 정보 파싱
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherGrade = parseInt(savedUser.grade) || 1; // 기본값 1학년

    const mathChapters = [
        "1. 덧셈과 뺄셈 (저학년)",
        "2. 여러 가지 모양 (저학년)",
        "3. 분수와 자연수의 나눗셈 (고학년)",
        "4. 여러 가지 그래프 (고학년)"
    ];

    const englishChapters = [
        "Lesson 1. Nice to meet you",
        "Lesson 2. How's the Weather?",
        "Lesson 3. My Family",
        "Lesson 4. What time is it?",
        "Lesson 5. I'm thirsty"
    ];

    // 전달받은 tableOfContents가 있으면 맵핑해서 활용, 없으면 기본 배열 사용
    const chapters = tableOfContents.length > 0 
        ? tableOfContents.map(toc => toc.chapter) 
        : (isEnglish ? englishChapters : mathChapters);

    const [config, setConfig] = useState({
        chapter: chapters[0],
        count: 5,
        level: 'normal'
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedProblems, setGeneratedProblems] = useState([]);

    const generateRealisticProblems = (chapter, count, level) => {
        let min = 1, max = 5;
        if (level === 'normal') { min = 5; max = 15; }
        else if (level === 'hard') { min = 12; max = 30; }

        const generated = [];

        for (let i = 0; i < count; i++) {
            let q = "", a = "", exp = "", opts = [];
            let r1 = Math.floor(Math.random() * (max - min + 1)) + min;
            let r2 = Math.floor(Math.random() * (max - min + 1)) + min;

            if (isEnglish) {
                // 영어 단원별 문제 세트
                const englishQuizSets = {
                    '인사와 이름': [
                        { q: '"Hello"와 같은 의미를 가진 단어는?', a: 'Hi', opts: ['Hi', 'Bye', 'Sorry', 'Thanks'], exp: 'Hello와 Hi는 둘 다 인사말입니다.' },
                        { q: '"Nice to meet you"에 대한 응답으로 알맞은 것은?', a: 'Nice to meet you, too', opts: ['Nice to meet you, too', 'Good morning', 'How are you', 'See you later'], exp: '처음 만날 때 too를 덧붙여 응답합니다.' },
                        { q: '"My name ___ Jimin."에 들어갈 말은?', a: 'is', opts: ['is', 'am', 'are', 'be'], exp: 'My name은 3인칭 단수이므로 is를 사용합니다.' },
                        { q: '"What is your name?"을 한국어로 하면?', a: '당신의 이름은 무엇인가요?', opts: ['당신의 이름은 무엇인가요?', '당신은 어떻게 지내나요?', '만나서 반갑습니다', '안녕히 가세요'], exp: 'What is your name?은 이름을 묻는 표현입니다.' },
                        { q: '"안녕히 가세요"를 영어로 하면?', a: 'Goodbye', opts: ['Goodbye', 'Hello', 'Thanks', 'Sorry'], exp: 'Goodbye는 작별 인사입니다.' },
                    ],
                    'Nice to meet you': [
                        { q: '"Nice to meet you"의 뜻은?', a: '만나서 반갑습니다', opts: ['만나서 반갑습니다', '잘 지내요?', '안녕히 가세요', '고마워요'], exp: 'Nice to meet you는 처음 만날 때 하는 인사입니다.' },
                        { q: '"My name ___ Jimin."에 들어갈 말은?', a: 'is', opts: ['is', 'am', 'are', 'be'], exp: 'My name은 3인칭 단수이므로 is를 씁니다.' },
                        { q: '"Hello"에 대한 응답으로 알맞은 것은?', a: 'Hi', opts: ['Hi', 'Bye', 'No', 'Yes'], exp: 'Hello와 Hi는 둘 다 인사말입니다.' },
                        { q: '"What is your name?"을 한국어로 하면?', a: '이름이 뭐예요?', opts: ['이름이 뭐예요?', '나이가 몇 살이에요?', '어디 사세요?', '취미가 뭐예요?'], exp: 'name은 이름을 의미합니다.' },
                        { q: '"I am Somi."에서 "am"의 역할은?', a: '주어와 서술어를 연결', opts: ['주어와 서술어를 연결', '동작을 나타냄', '장소를 나타냄', '시간을 나타냄'], exp: 'be동사(am)는 주어와 보어를 연결합니다.' },
                    ],
                    'Weather': [
                        { q: '맑고 화창한 날씨를 영어로 나타내면?', a: 'Sunny', opts: ['Sunny', 'Rainy', 'Cloudy', 'Snowy'], exp: 'Sunny는 해가 나는 맑은 날씨를 의미합니다.' },
                        { q: '"How\'s the weather today?" 한국어로 하면?', a: '오늘 날씨가 어때?', opts: ['오늘 날씨가 어때?', '오늘 기분이 어때?', '오늘 어디 가니?', '오늘 몇 시야?'], exp: 'weather는 날씨를 의미합니다.' },
                        { q: '"It\'s raining."의 뜻은?', a: '비가 오고 있어요', opts: ['비가 오고 있어요', '눈이 오고 있어요', '바람이 불어요', '밖이 뜨거워요'], exp: 'raining은 비가 내리는 것을 표현합니다.' },
                    ],
                    'My Family': [
                        { q: '"Father"의 맞는 한국어 의미는?', a: '아버지', opts: ['아버지', '어머니', '형제', '누나'], exp: 'Father와 Dad 둘 다 아버지를 뜻합니다.' },
                        { q: '"어머니"를 영어로 하면?', a: 'Mother', opts: ['Mother', 'Sister', 'Brother', 'Father'], exp: 'Mother는 어머니를 의미합니다.' },
                        { q: '"I have two brothers."의 뜻은?', a: '나는 남자형제가 둘 있다', opts: ['나는 남자형제가 둘 있다', '나는 여동생이 둘 있다', '나는 누나가 둘 있다', '나는 사촌이 두 있다'], exp: 'brother는 남자형제 또는 남동생을 의미합니다.' },
                    ],
                };
                // 단원 이름으로 매칭
                const matchedKey = Object.keys(englishQuizSets).find(k => chapter.includes(k));
                const quizPool = matchedKey ? englishQuizSets[matchedKey] : englishQuizSets['Nice to meet you'];
                const picked = quizPool[i % quizPool.length];
                q = picked.q; a = picked.a; exp = picked.exp; opts = picked.opts;
            } else if (teacherGrade <= 3) {
                if (Math.random() > 0.5) {
                    q = `동물원에 사자가 ${r1}마리, 호랑이가 ${r2}마리 있습니다. 모두 몇 마리일까요?`;
                    a = `${r1 + r2}마리`;
                    exp = `${r1} + ${r2} = ${r1 + r2}`;
                    opts = [`${r1 + r2}마리`, `${r1 + r2 + 1}마리`, `${Math.abs(r1 - r2)}마리`, `${r1 + r2 + 2}마리`];
                } else {
                    if (r1 < r2) { let temp = r1; r1 = r2; r2 = temp; }
                    q = `쿠키 ${r1}개 중에서 ${r2}개를 친구에게 주었어요. 남은 쿠키는 몇 개일까요?`;
                    a = `${r1 - r2}개`;
                    exp = `${r1} - ${r2} = ${r1 - r2}`;
                    opts = [`${r1 - r2}개`, `${r1 - r2 + 1}개`, `${r1 + r2}개`, `${r1 - r2 + 2}개`];
                }
            } else {
                if (Math.random() > 0.5) {
                    q = `주스 ${r1}/10 리터를 ${r2}명이 똑같이 나누어 마시려고 합니다. 1명이 마실 양은?`;
                    a = `${r1}/${r2 * 10} 리터`;
                    exp = `(${r1}/10) / ${r2} = ${r1}/${r2 * 10}`;
                    opts = [`${r1}/${r2 * 10} 리터`, `${r2}/${r1 * 10} 리터`, `${r1}/10 리터`, `${r1 + r2}/10 리터`];
                } else {
                    let total = (Math.floor(Math.random() * 5) + 2) * 10;
                    let part = Math.floor(Math.random() * (total / 2)) + 1;
                    let correctPct = Math.round((part / total) * 100);
                    q = `전체 ${total}평 중에서 사과나무가 ${part}평을 차지합니다. 전체의 몇 %일까요?`;
                    a = `${correctPct}%`;
                    exp = `(${part} / ${total}) x 100 = ${correctPct}%`;
                    opts = [`${correctPct}%`, `${correctPct + 10}%`, `${correctPct - 5}%`, `${correctPct + 20}%`];
                }
            }

            let shuffledOpts = [...new Set(opts)].sort(() => 0.5 - Math.random());
            if (shuffledOpts.length < 4) shuffledOpts = opts.sort(() => 0.5 - Math.random());

            generated.push({
                id: `ai-${Date.now()}-${i}`,
                question: q, options: shuffledOpts, answer: a, explanation: exp,
                svg: null, type: 'choice'
            });
        }
        return generated;
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // 영어 교과서는 백엔드 AI(수학 전용)를 호출하지 않고 바로 로컬 문제 생성
            if (isEnglish) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // 생성 중 효과
                const problems = generateRealisticProblems(config.chapter, config.count, config.level);
                setGeneratedProblems(problems);
                setStep(3);
                return;
            }

            // 수학 교과서: 백엔드 AI 호출
            const subject = 'math';
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            const response = await fetch(`${apiBaseUrl}/api/v1/ai/generate-problems?grade=${teacherGrade}&subject=${subject}&chapter=${encodeURIComponent(config.chapter)}&level=${config.level}&count=${config.count}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const formatted = data.map((p, i) => ({
                    ...p,
                    id: `ai-${Date.now()}-${i}`,
                    type: 'choice'
                }));
                setGeneratedProblems(formatted);
                setStep(3);
            } else {
                // 백엔드 오류 시 로컬 폴백 실행
                const fallback = generateRealisticProblems(config.chapter, config.count, config.level);
                setGeneratedProblems(fallback);
                setStep(3);
            }
        } catch (error) {
            console.error("AI 생성 중 에러:", error);
            const fallback = generateRealisticProblems(config.chapter, config.count, config.level);
            setGeneratedProblems(fallback);
            setStep(3);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = () => {
        const payload = {
            title: `${config.chapter} AI 맞춤형 평가`,
            problems: generatedProblems,
            timestamp: new Date().toLocaleTimeString()
        };

        if (onShare) {
            onShare(payload);
        } else {
            // 기존 페이지 모드일 경우 자체 전송
            publish(`/app/class/${sessionId}/sync`, {
                type: 'AI_PROBLEM_SHARED',
                sessionId: sessionId,
                payload: payload
            });
            alert('생성된 문제가 학생 30명의 교과서로 실시간 전송되었습니다!');
            if (onClose) onClose();
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
                        <div className="grid grid-cols-2 gap-4">
                            {chapters.map(ch => (
                                <button 
                                    key={ch}
                                    onClick={() => { setConfig({...config, chapter: ch}); setStep(2); }}
                                    className={`p-10 rounded-[40px] border-4 transition-all text-left group ${config.chapter === ch ? 'border-aijoa-blue bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                >
                                    <h4 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-aijoa-blue transition-colors">{ch}</h4>
                                    <p className="text-slate-400 font-bold">이 단원의 문제를 생성할까요?</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-100 space-y-12">
                            <div className="space-y-6">
                                <label className="flex items-center space-x-3 text-2xl font-black text-slate-800">
                                    <Settings2 className="text-aijoa-blue" />
                                    <span>문항 개수 설정</span>
                                </label>
                                <div className="flex items-center space-x-4">
                                    {[3, 5, 10, 15].map(n => (
                                        <button 
                                            key={n}
                                            onClick={() => setConfig({...config, count: n})}
                                            className={`flex-1 py-8 rounded-[30px] text-2xl font-black transition-all ${config.count === n ? 'bg-aijoa-blue text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {n}개
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-center space-x-3 text-2xl font-black text-slate-800">
                                    <Layers className="text-orange-500" />
                                    <span>난이도 단계 설정</span>
                                </label>
                                <div className="flex items-center space-x-4">
                                    {[
                                        {id: 'easy', label: '기초', color: 'bg-green-500'},
                                        {id: 'normal', label: '보통', color: 'bg-aijoa-blue'},
                                        {id: 'hard', label: '심화', color: 'bg-red-500'}
                                    ].map(lv => (
                                        <button 
                                            key={lv.id}
                                            onClick={() => setConfig({...config, level: lv.id})}
                                            className={`flex-1 py-8 rounded-[30px] text-2xl font-black transition-all ${config.level === lv.id ? `${lv.color} text-white shadow-xl scale-105` : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {lv.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleGenerate}
                                className="w-full py-8 bg-slate-900 text-white rounded-[35px] font-black text-3xl hover:bg-black transition-all shadow-2xl flex items-center justify-center space-x-4 active:scale-95"
                            >
                                <BrainCircuit size={32} />
                                <span>AI 맞춤 문제 만들기 시작</span>
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <header className="flex justify-between items-end">
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 mb-2">AI가 생성한 문제를 확인해 보세요</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{config.chapter} | {config.count}문항 | {config.level} 난이도</p>
                            </div>
                            <button 
                                onClick={handleShare}
                                className="px-10 py-5 bg-aijoa-blue text-white rounded-[25px] font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center space-x-3 animate-bounce"
                            >
                                <Send size={24} />
                                <span>전체 학생에게 수업 배포하기</span>
                            </button>
                        </header>

                        <div className="grid grid-cols-1 gap-6 pb-20">
                            {generatedProblems.map((p, idx) => (
                                <div key={p.id} className="bg-white p-10 rounded-[45px] border-4 border-slate-100 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-aijoa-blue"></div>
                                    <span className="text-aijoa-blue font-black mb-4 block">Problem {idx + 1}</span>
                                    <h4 className="text-2xl font-bold text-slate-800 mb-8">{p.question}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {p.options.map(opt => (
                                            <div key={opt} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-bold">
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={`bg-slate-50 font-nanum flex flex-col ${isModal ? 'w-full h-full' : 'min-h-screen'}`}>
            {/* Header */}
            {!isModal && (
            <nav className="h-24 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/80 shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-aijoa-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <BrainCircuit size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">AI 맞춤 문제 위저드</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">AI-Powered Problem Distribution</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-aijoa-blue text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-300'}`}>
                                    {step > s ? <Check size={20} /> : s}
                                </div>
                                {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-aijoa-blue' : 'bg-slate-100'}`} />}
                            </div>
                        ))}
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-3 bg-slate-100/50 hover:bg-slate-200 rounded-full transition-all text-slate-500 hover:text-slate-800 active:scale-95 ml-4">
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </nav>
            )}
            
            {/* Modal Header (Only when isModal) */}
            {isModal && (
               <header className="px-10 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-aijoa-blue rounded-xl flex items-center justify-center text-white shadow-sm">
                            <BrainCircuit size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">AI 문제 통합 빌더</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center space-x-2">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${step >= s ? 'bg-aijoa-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {step > s ? <Check size={14} /> : s}
                                </div>
                                {s < 3 && <div className={`w-6 h-[2px] ${step > s ? 'bg-aijoa-blue' : 'bg-slate-100'}`}></div>}
                            </div>
                        ))}
                    </div>
               </header>
            )}

            <main className={`p-10 relative flex-grow overflow-y-auto ${isModal ? 'pt-10' : 'pt-16'}`}>
                {isGenerating ? (
                    <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center">
                        <div className="relative w-40 h-40 mb-10">
                            <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-8 border-aijoa-blue rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-aijoa-blue">
                                <BrainCircuit size={48} className="animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 animate-bounce">
                            {teacherGrade}학년 맞춤 문제를 생성하고 있어요!
                        </h2>
                        <p className="text-slate-400 font-bold text-xl">선생님의 학급 수준({teacherGrade}학년)과 난이도에 딱 맞는 문제를 추출 중입니다...</p>
                        
                        <div className="mt-20 w-full max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-aijoa-blue animate-progress shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                        </div>
                    </div>
                ) : (
                    renderStep()
                )}
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 3s ease-in-out infinite;
                }
            `}} />
        </div>
    );
};

export default AiProblemGenerator;
