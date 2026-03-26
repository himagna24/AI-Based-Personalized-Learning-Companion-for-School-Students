import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { SUBJECTS } from '../data/questions';
import SubjectDashboardPage from './SubjectDashboardPage';
import { getOverallProgress, getRecommendations, getSubjectStrength } from '../services/analyticsService';

export default function HomePage({ onGoToQuiz }) {
  const { currentUser } = useAuth();
  const { analytics, quizzes, loadingData } = useAppData();
  const [selectedSubject, setSelectedSubject] = useState(null);

  if (selectedSubject) {
    return <SubjectDashboardPage subjectId={selectedSubject} onBack={() => setSelectedSubject(null)} onGoToQuiz={onGoToQuiz} />;
  }

  const name = currentUser?.name?.split(' ')[0] || 'Student';
  const progress = getOverallProgress(analytics);
  const strengths = getSubjectStrength(analytics);
  const recommendations = getRecommendations(analytics);
  const pendingQuizzes = quizzes.filter(q => q.status === 'pending').length;
  const completedQuizzes = quizzes.filter(q => q.status === 'completed').length;
  const userSubjects = currentUser?.subjects?.length > 0 ? currentUser.subjects : ['math', 'physics', 'chemistry'];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '0.125rem' }}>{greeting}</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{name}! 👋</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>Ready to learn something amazing today?</p>
      </div>

      {/* Hero Card */}
      <div className="hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.85)', marginBottom: '0.375rem' }}>Overall Progress</p>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
              {progress}<span style={{ fontSize: '1.5rem', opacity: 0.8 }}>%</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.375rem' }}>Average quiz accuracy</p>
          </div>
          <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', padding: '0.375rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>
              ✅ {completedQuizzes} Done
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', padding: '0.375rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
              ⏳ {pendingQuizzes} Pending
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.25)', height: '8px', borderRadius: '99px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'white', borderRadius: '99px', transition: 'width 1s ease-out' }} />
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 1 }}>
          Level: <strong style={{ color: 'white' }}>{currentUser?.level || 'Beginner'}</strong>
        </div>
      </div>

      {/* Loading */}
      {loadingData && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
          <div className="spinner" />
        </div>
      )}

      {/* Pending Alert */}
      {pendingQuizzes > 0 && (
        <div style={{
          background: '#FFFBEB', border: '1.5px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem',
          marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(245,158,11,0.1)',
        }}>
          <div style={{ fontSize: '1.5rem' }}>⏳</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400E' }}>
              {pendingQuizzes} quiz{pendingQuizzes > 1 ? 'zes' : ''} waiting!
            </div>
            <div style={{ fontSize: '0.75rem', color: '#B45309' }}>Head to the Quizzes tab to test your knowledge</div>
          </div>
        </div>
      )}

      {/* Subjects */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Your Subjects</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{userSubjects.length} subjects</span>
        </div>
        <div className="subjects-grid">
          {userSubjects.map(subjId => {
            const subject = SUBJECTS.find(s => s.id === subjId);
            const stats = strengths.find(s => s.subject === subjId);
            return (
              <button key={subjId} className="subject-tile" onClick={() => setSelectedSubject(subjId)}>
                <div className="subject-tile-icon">{subject?.icon || '📚'}</div>
                <div className="subject-tile-name">{subject?.label || subjId}</div>
                {stats && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 700, marginTop: '0.125rem' }}>
                    {stats.accuracy}%
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      {strengths.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Performance Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {strengths.slice(0, 4).map(s => {
              const subject = SUBJECTS.find(sub => sub.id === s.subject);
              const color = s.accuracy >= 80 ? 'var(--accent-green)' : s.accuracy >= 60 ? 'var(--accent-primary)' : 'var(--accent-pink)';
              return (
                <div key={s.subject} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', border: '1px solid #F0EDE9', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {subject?.icon} {subject?.label || s.subject}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color }}>{s.accuracy}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F0EDE9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.accuracy}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🤖 AI Recommendations
        </h2>
        {recommendations.length > 0 ? recommendations.map((rec, i) => (
          <div key={i} className="recommendation-card animate-in" style={{ animationDelay: `${i * 100}ms`, borderLeft: '3px solid var(--accent-primary)' }}>
            <div style={{ fontSize: '1.25rem' }}>💡</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-primary)">$1</strong>') }} />
          </div>
        )) : (
          <div className="recommendation-card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
            <div style={{ fontSize: '1.25rem' }}>💡</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Take some quizzes to unlock personalized AI learning recommendations!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
