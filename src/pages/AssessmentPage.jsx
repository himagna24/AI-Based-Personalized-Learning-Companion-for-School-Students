import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ASSESSMENT_QUESTIONS } from '../data/questions';

const LEVELS = {
  beginner: { icon: '🌱', label: 'Beginner', desc: 'Great start! We\'ll build your foundations step by step with simple, clear explanations.' },
  intermediate: { icon: '🔥', label: 'Intermediate', desc: 'Nice! You have a good base. Our AI tutor will challenge you with deeper concepts.' },
  advanced: { icon: '🚀', label: 'Advanced', desc: 'Impressive! You\'re ready for advanced content and complex problem-solving.' },
};

export default function AssessmentPage() {
  const { updateUser } = useAuth();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [level, setLevel] = useState(null);
  const [saving, setSaving] = useState(false);

  const q = ASSESSMENT_QUESTIONS[idx];
  const total = ASSESSMENT_QUESTIONS.length;
  const progress = Math.round((idx / total) * 100);

  const handleSelect = (opt) => { if (selected !== null) return; setSelected(opt); };
  const handleNext = () => {
    const updated = { ...answers, [idx]: selected };
    setAnswers(updated);

    if (idx < total - 1) {
      setIdx(i => i + 1);
      setSelected(null);
    } else {
      const correct = Object.entries(updated).filter(([i, ans]) => ans === ASSESSMENT_QUESTIONS[+i].correct).length;
      const pct = correct / total;
      const lvl = pct >= 0.8 ? 'advanced' : pct >= 0.5 ? 'intermediate' : 'beginner';
      setLevel(lvl);
      setCompleted(true);
    }
  };

  const handleStart = async () => {
    setSaving(true);
    try { await updateUser({ assessmentDone: true, level }); }
    finally { setSaving(false); }
  };

  if (completed && level) {
    const info = LEVELS[level];
    return (
      <div className="assessment-page">
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>Assessment Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>Here's your personalized learning profile</p>
          </div>
          <div className="level-result-card">
            <div className="level-icon">{info.icon}</div>
            <div className="level-name">{info.label}</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>{info.desc}</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {['Personalized AI Tutor ✓', 'Adaptive Quizzes ✓', 'Progress Tracking ✓'].map(tag => (
                <span key={tag} style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', color: 'var(--accent-secondary)', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <button className="btn btn-primary w-full btn-lg" onClick={handleStart} disabled={saving}>
              {saving ? <><span className="spinner" style={{ borderTopColor: 'white', width: '16px', height: '16px' }} /> Saving...</> : 'Start Learning! 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Header */}
        <div className="assessment-header">
          <div className="assessment-badge">🎯 Knowledge Assessment</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--text-primary)' }}>Let's find your level</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Answer {total} quick questions — takes under 2 minutes</p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Question {idx + 1} of {total}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{progress}%</span>
          </div>
          <div style={{ height: '8px', background: '#F0EDE9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gradient-hero)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            {ASSESSMENT_QUESTIONS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: '4px', borderRadius: '99px',
                background: i < idx ? 'var(--accent-green)' : i === idx ? 'var(--accent-primary)' : '#F0EDE9',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="question-card animate-in" key={idx}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
            {q.level === 'basic' ? '🟢 Basic' : '🟠 Intermediate'} · {q.subject}
          </div>
          <div className="question-text">{q.question}</div>
          <div className="options-list">
            {q.options.map((opt, i) => {
              let optStyle = {};
              if (selected !== null) {
                if (i === q.correct) { optStyle = { borderColor: 'rgba(16,185,129,0.5)', background: '#ECFDF5', color: '#065F46' }; }
                else if (i === selected && selected !== q.correct) { optStyle = { borderColor: 'rgba(239,68,68,0.5)', background: '#FEF2F2', color: '#991B1B' }; }
              }
              return (
                <button key={i} className="option-btn" style={optStyle}
                  onClick={() => handleSelect(i)} disabled={selected !== null}>
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {selected !== null && (
          <>
            <div className="animate-in" style={{
              background: selected === q.correct ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${selected === q.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
              marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600,
              color: selected === q.correct ? '#065F46' : '#991B1B',
            }}>
              {selected === q.correct ? '✅ Correct!' : `❌ Correct answer: "${q.options[q.correct]}"`}
            </div>
            <button className="btn btn-primary w-full animate-in" onClick={handleNext}>
              {idx < total - 1 ? 'Next Question →' : 'See My Results 🎉'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
