import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { BookOpen, Users } from 'lucide-react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TextbookViewer from './pages/TextbookViewer'
import StudentManagement from './pages/StudentManagement'
import AdminPage from './pages/AdminPage'
import TeacherLoginPage from './pages/TeacherLoginPage'
import AiProblemGenerator from './pages/AiProblemGenerator'
import DtLoginPage from './pages/DtLoginPage'
import DtDashboard from './pages/DtDashboard'
import DtIntroPage from './pages/DtIntroPage'
import GreetingsPage from './pages/GreetingsPage'
import HistoryPage from './pages/HistoryPage'
import DirectionsPage from './pages/DirectionsPage'
import CreativePlayPage from './pages/CreativePlayPage'
import AiLearningPage from './pages/AiLearningPage'
import MyPage from './pages/MyPage'
import NoticePage from './pages/NoticePage'
import ComingSoonPage from './pages/ComingSoonPage'

import { Navigate } from 'react-router-dom'

// 로그인 여부를 체크하는 가드 컴포넌트
const ProtectedRoute = ({ children }) => {
  const isTeacher = localStorage.getItem('teacherSession');
  const isStudent = localStorage.getItem('studentSession');
  
  if (!isTeacher && !isStudent) {
    // 세션이 없으면 로그인 페이지로 강제 이동
    return <Navigate to="/dt" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dt-intro" element={<DtIntroPage />} />
        <Route path="/about/greetings" element={<GreetingsPage />} />
        <Route path="/about/history" element={<HistoryPage />} />
        <Route path="/about/directions" element={<DirectionsPage />} />
        <Route path="/learning/creative" element={<CreativePlayPage />} />
        <Route path="/learning/ai" element={<AiLearningPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 공통 로그인 페이지는 누구나 접근 가능 */}
        <Route path="/dt" element={<DtLoginPage />} />
        
        {/* 보호된 라우트: 로그인 필수 */}
        <Route path="/dt/dashboard" element={<ProtectedRoute><DtDashboard /></ProtectedRoute>} />
        <Route path="/dt/viewer/:id" element={<ProtectedRoute><TextbookViewer /></ProtectedRoute>} />
        <Route path="/dt/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
        <Route path="/dt/ai-generator" element={<ProtectedRoute><AiProblemGenerator /></ProtectedRoute>} />
        <Route path="/dt/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/teacher-login" element={<TeacherLoginPage />} />
      </Routes>
    </div>
  )
}

export default App
