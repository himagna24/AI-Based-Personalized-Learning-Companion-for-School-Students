import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { updateDailyQuizResult } from '../services/quizService';
import QuizResultPage from './QuizResultPage';

export default function QuizTakePage({ quiz, onBack, onComplete }) {
  const { currentUser } = useAuth();
  const { completeQuiz } = useAppData();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = quiz.questions || [];
  const total = questions.length;
  const question = questions[currentIdx];
  const progress = Math.round((currentIdx / total) * 100);

  const handleSelect = (optIdx) => { if (selected !== null) return; setSelected(optIdx); };

  const handleNext = async () => {
    const newAnswers = { ...answers, [currentIdx]: selected };
    setAnswers(newAnswers);

    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      // Quiz complete
      setSubmitting(true);
      try {
        let completedQuiz;
        if (quiz.isDaily) {
          completedQuiz = updateDailyQuizResult(quiz.id, newAnswers, questions);
        } else {
          // completeQuiz handles analytics and Firestore internally
          completedQuiz = await completeQuiz(quiz.id, newAnswers, questions);
          completedQuiz = { ...quiz, ...completedQuiz, questions };
        }
        setResult(completedQuiz || {
          ...quiz, questions,
          userAnswers: questions.map((_, i) => newAnswers[i] ?? -1),
          correctCount: 0, score: 0,
        });
        setShowResult(true);
      } catch (err) {
        console.error('Quiz error:', err.message);
        // Show result anyway with local calculation
        const answersArr = questions.map((_, i) => newAnswers[i] ?? -1);
        const correct = answersArr.filter((a, i) => a === questions[i].correct).length;
        setResult({
          ...quiz, questions, userAnswers: answersArr,
          correctCount: correct,
          score: Math.round((correct / questions.length) * 100),
          status: 'completed',
        });
        setShowResult(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (showResult && result) {
    return <QuizResultPage quiz={result} questions={questions} onDone={onComplete} />;
  }

  if (!question) return null;

  return (
    <div className="quiz-take-page">
      {/* Header */}
      <div className="quiz-header-bar">
        <button className="quiz-back-btn" onClick={onBack}>←</button>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-counter">{currentIdx + 1}/{total}</span>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{
          fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
        }}>
          {quiz.isDaily ? '📅 Daily Quiz' : '📝 AI-Generated Quiz'}
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{quiz.title || quiz.topic || 'Practice Quiz'}</h2>
      </div>

      <div className="question-card animate-in" key={currentIdx}>
        <div className="question-number">Question {currentIdx + 1} of {total}</div>
        <div className="question-text">{question.question}</div>
        <div className="options-list">
          {question.options.map((opt, i) => {
            let cls = '';
            if (selected !== null) {
              if (i === question.correct) cls = 'correct';
              else if (i === selected && selected !== question.correct) cls = 'wrong';
            }
            return (
              <button
                key={i}
                id={`quiz-opt-${i}`}
                className={`option-btn ${cls}`}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selected !== null && (
        <div className="animate-in" style={{
          background: selected === question.correct ? 'rgba(67,197,158,0.1)' : 'rgba(255,101,132,0.1)',
          border: `1px solid ${selected === question.correct ? 'rgba(67,197,158,0.3)' : 'rgba(255,101,132,0.3)'}`,
          borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
          marginBottom: '1rem', fontSize: '0.875rem',
          color: selected === question.correct ? 'var(--accent-green)' : 'var(--accent-pink)',
        }}>
          {selected === question.correct
            ? '✅ Correct! Well done!'
            : `❌ Incorrect. Correct answer: "${question.options[question.correct]}"`}
        </div>
      )}

      {selected !== null && (
        <button
          id="quiz-next-btn"
          className="btn btn-primary w-full animate-in"
          onClick={handleNext}
          disabled={submitting}
        >
          {submitting
            ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Saving...</>
            : currentIdx < total - 1 ? 'Next Question →' : 'See Results 🎉'}
        </button>
      )}
    </div>
  );
}
