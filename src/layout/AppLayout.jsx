import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import HomePage from '../pages/HomePage';
import AITutorPage from '../pages/AITutorPage';
import QuizPage from '../pages/QuizPage';

export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState(null);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try { await logout(); } finally { setLogoutLoading(false); }
  };

  const handleGoToQuiz = (quiz) => {
    setPendingQuiz(quiz);
    setActiveTab('quizzes');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'quizzes') setPendingQuiz(null);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':    return <HomePage onGoToQuiz={handleGoToQuiz} />;
      case 'tutor':   return <AITutorPage />;
      case 'quizzes': return <QuizPage pendingQuiz={pendingQuiz} onQuizStarted={() => setPendingQuiz(null)} />;
      default:        return <HomePage onGoToQuiz={handleGoToQuiz} />;
    }
  };

  const tabColors = { home: '#F97316', tutor: '#8B5CF6', quizzes: '#10B981' };

  return (
    <div className="app-layout">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-logo">
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          EduBot AI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#FFF7ED', borderRadius: 'var(--radius-full)',
            padding: '0.375rem 0.75rem',
            border: '1px solid rgba(249,115,22,0.15)',
          }}>
            <div style={{
              width: '28px', height: '28px', background: 'var(--gradient-hero)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white',
            }}>
              {currentUser?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name?.split(' ')[0] || 'Student'}
            </span>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            disabled={logoutLoading}
            style={{
              width: '36px', height: '36px', background: 'white',
              border: '1.5px solid #E7E5E4', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-pink)'; e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7E5E4'; e.currentTarget.style.background = 'white'; }}
            title="Logout"
          >
            {logoutLoading ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : '⏻'}
          </button>
        </div>
      </header>

      {/* Tab Indicator Bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${tabColors[activeTab]}, transparent)`, opacity: 0.5, transition: 'background 0.3s' }} />

      {/* Main Content */}
      <main className="app-content">
        {renderTab()}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
