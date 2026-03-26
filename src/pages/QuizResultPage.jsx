import React from 'react';
import { SUBJECTS } from '../data/questions';

export default function QuizResultPage({ quiz, questions, onDone }) {
  const score = quiz.score ?? 0;
  const correct = quiz.correctCount ?? 0;
  const total = questions.length;
  const userAnswers = quiz.userAnswers || [];

  const getGrade = (s) => {
    if (s >= 90) return { label: 'Excellent! 🌟', cls: 'grade-excellent' };
    if (s >= 70) return { label: 'Good Job! 👍', cls: 'grade-good' };
    if (s >= 50) return { label: 'Keep Going! 💪', cls: 'grade-average' };
    return { label: 'Keep Practicing! 📚', cls: 'grade-poor' };
  };

  const grade = getGrade(score);
  const subjectInfo = SUBJECTS.find(s => s.id === quiz.subject);

  const circumference = 2 * Math.PI * 52;
  const strokeDash = circumference - (score / 100) * circumference;
  const strokeColor = score >= 70 ? '#10B981' : score >= 50 ? '#F97316' : '#EF4444';

  return (
    <div className="quiz-take-page">
      {/* Result Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className="result-hero">
          <div className="result-score-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor={strokeColor} />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#F0EDE9" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                strokeLinecap="round" transform="rotate(-90 60 60)"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="result-score-text">
              <span style={{ color: strokeColor }}>{score}%</span>
              <span className="result-score-label">Score</span>
            </div>
          </div>
          <div className={`result-grade ${grade.cls}`}>{grade.label}</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {subjectInfo?.icon} {subjectInfo?.label || quiz.subject} · {quiz.topic?.substring(0, 50)}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="result-stats">
        <div className="result-stat">
          <div className="result-stat-value" style={{ color: 'var(--accent-green)' }}>{correct}</div>
          <div className="result-stat-label">✅ Correct</div>
        </div>
        <div className="result-stat">
          <div className="result-stat-value" style={{ color: 'var(--accent-pink)' }}>{total - correct}</div>
          <div className="result-stat-label">❌ Wrong</div>
        </div>
        <div className="result-stat">
          <div className="result-stat-value" style={{ color: 'var(--accent-primary)' }}>{total}</div>
          <div className="result-stat-label">📝 Total</div>
        </div>
      </div>

      {/* Answer Review */}
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📋 Answer Review
      </h3>
      <div className="answer-review">
        {questions.map((q, i) => {
          const userAns = userAnswers[i];
          const isCorrect = userAns === q.correct;
          return (
            <div key={i} className={`answer-item ${isCorrect ? 'correct' : 'wrong'}`}>
              <div className="answer-q">
                {isCorrect ? '✅' : '❌'} Q{i + 1}: {q.question}
              </div>
              <div className="answer-detail">
                {!isCorrect && (
                  <span>Your answer: <span className="your-answer">{userAns >= 0 ? q.options[userAns] : 'No answer'}</span> · </span>
                )}
                Correct: <span className="correct-answer">{q.options[q.correct]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Done Button */}
      <button className="btn btn-primary w-full" onClick={onDone} style={{ marginTop: '0.5rem' }}>
        ← Back to Quizzes
      </button>
    </div>
  );
}
