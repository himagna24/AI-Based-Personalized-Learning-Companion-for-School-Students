import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getDailyQuizObjects } from '../services/quizService';
import { SUBJECTS } from '../data/questions';
import QuizTakePage from './QuizTakePage';

export default function QuizPage({ pendingQuiz, onQuizStarted }) {
  const { currentUser } = useAuth();
  const { quizzes, loadingData } = useAppData();
  const [activeTab, setActiveTab] = useState('pending');
  const [dailyQuizzes, setDailyQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(pendingQuiz || null);

  useEffect(() => {
    if (currentUser) {
      setDailyQuizzes(getDailyQuizObjects(currentUser.id, currentUser.subjects || []));
    }
  }, [currentUser]);

  // When a pendingQuiz is passed in from outside, open it immediately
  useEffect(() => {
    if (pendingQuiz) {
      setSelectedQuiz(pendingQuiz);
      if (onQuizStarted) onQuizStarted();
    }
  }, [pendingQuiz]);

  if (selectedQuiz) {
    return (
      <QuizTakePage
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
        onComplete={() => setSelectedQuiz(null)}
      />
    );
  }

  const pending = quizzes.filter(q => q.status === 'pending' && !q.isDaily);
  const completed = quizzes.filter(q => q.status === 'completed' && !q.isDaily);
  const getSubjectInfo = (id) => SUBJECTS.find(s => s.id === id);

  const QuizCard = ({ quiz, category }) => {
    const subj = getSubjectInfo(quiz.subject);
    const displayTitle = quiz.title || quiz.topic || 'Practice Quiz';
    return (
      <div className="quiz-card" id={`quiz-${quiz.id}`} onClick={() => setSelectedQuiz(quiz)}>
        <div className="quiz-card-info">
          <div className="quiz-card-topic">{displayTitle}</div>
          <div className="quiz-card-meta">
            <span>{subj?.icon || '📝'}</span>
            <span>{subj?.label || quiz.subject}</span>
            {quiz.score !== null && quiz.score !== undefined && (
              <>
                <span>·</span>
                <span style={{ color: quiz.score >= 60 ? 'var(--accent-green)' : 'var(--accent-pink)', fontWeight: 700 }}>
                  {quiz.score}%
                </span>
              </>
            )}
            <span>·</span>
            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div>
          {category === 'pending' && <span className="quiz-badge badge-pending">⏳ Pending</span>}
          {category === 'completed' && <span className="quiz-badge badge-completed">✅ Done</span>}
          {category === 'daily' && (
            <span className={`quiz-badge ${quiz.status === 'completed' ? 'badge-completed' : 'badge-daily'}`}>
              {quiz.status === 'completed' ? '✅ Done' : '📅 Daily'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Quizzes</h2>
        <p style={{ fontSize: '0.875rem' }}>Test your knowledge and track your progress</p>
      </div>

      <div className="quiz-tabs">
        {[
          { id: 'pending', label: `Pending (${pending.length})` },
          { id: 'completed', label: `Done (${completed.length})` },
          { id: 'daily', label: `Daily (${dailyQuizzes.length})` },
        ].map(t => (
          <button key={t.id} id={`quiz-tab-${t.id}`}
            className={`quiz-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loadingData && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--accent-primary)' }} />
        </div>
      )}

      {!loadingData && activeTab === 'pending' && (
        pending.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <h3>No pending quizzes</h3>
              <p>Ask a question in AI Tutor to automatically generate a quiz!</p>
            </div>
          : pending.map(q => <QuizCard key={q.id} quiz={q} category="pending" />)
      )}

      {!loadingData && activeTab === 'completed' && (
        completed.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h3>No completed quizzes yet</h3>
              <p>Complete your pending quizzes to see results here.</p>
            </div>
          : completed.map(q => <QuizCard key={q.id} quiz={q} category="completed" />)
      )}

      {!loadingData && activeTab === 'daily' && (
        dailyQuizzes.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No daily quizzes</h3>
              <p>Select subjects during signup to unlock daily quizzes.</p>
            </div>
          : dailyQuizzes.map(q => <QuizCard key={q.id} quiz={q} category="daily" />)
      )}
    </div>
  );
}
