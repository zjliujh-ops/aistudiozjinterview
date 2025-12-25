
import React, { useState } from 'react';
import { UserRole } from './types';
import Login from './components/Login';
import Header from './components/Header';
import CandidateDashboard from './components/CandidateDashboard';
import InterviewRoom from './components/InterviewRoom';
import InterviewerDashboard from './components/InterviewerDashboard';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'interview'>('dashboard');
  const [activeInterviewPos, setActiveInterviewPos] = useState<string | null>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('dashboard');
    setActiveInterviewPos(null);
  };

  const startInterview = (posId: string) => {
    setActiveInterviewPos(posId);
    setCurrentView('interview');
  };

  const finishInterview = (history: any[]) => {
    // In a real app, send history to backend for Gemini to process
    console.log("Interview History:", history);
    setCurrentView('dashboard');
    setActiveInterviewPos(null);
    alert('面试已结束，系统正在为您生成评估报告，请稍后查看。');
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header onLogout={handleLogout} userType={userRole} />
      
      <main>
        {userRole === UserRole.CANDIDATE && (
          <>
            {currentView === 'dashboard' ? (
              <CandidateDashboard onStartInterview={startInterview} />
            ) : (
              activeInterviewPos && (
                <InterviewRoom 
                  posId={activeInterviewPos} 
                  onFinish={finishInterview} 
                />
              )
            )}
          </>
        )}

        {userRole === UserRole.INTERVIEWER && (
          <InterviewerDashboard />
        )}
      </main>

      {/* Persistent Mobile Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0070c0] via-[#00a0e9] to-[#0070c0]"></div>
    </div>
  );
};

export default App;
