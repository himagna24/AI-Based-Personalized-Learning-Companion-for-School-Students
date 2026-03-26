import { storage, KEYS } from '../utils/storage';
import { DAILY_QUIZ_BANK } from '../data/questions';

export function createQuizObject(topic, subject, userId) {
  const questions = generateQuestionsForTopic(subject);
  return {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    subject,
    topic: topic.substring(0, 80),
    questions,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    score: null,
    isDaily: false,
  };
}

export function getDailyQuizObjects(userId, subjects) {
  const today = new Date().toDateString();
  const savedDate = storage.get(KEYS.DAILY_QUIZ_DATE);
  const existing = storage.get(KEYS.DAILY_QUIZZES) || [];

  if (savedDate === today && existing.filter(q => q.userId === userId).length > 0) {
    return existing.filter(q => q.userId === userId);
  }

  const dailyQuizzes = subjects.slice(0, 3).map(subject => {
    const bank = DAILY_QUIZ_BANK[subject] || DAILY_QUIZ_BANK.math;
    return {
      id: `daily_${subject}_${today.replace(/\s/g, '_')}`,
      userId,
      subject,
      topic: `Daily ${subject.charAt(0).toUpperCase() + subject.slice(1)} Practice`,
      questions: bank.map((q, i) => ({ ...q, id: i })),
      status: 'pending',
      isDaily: true,
      createdAt: new Date().toISOString(),
      completedAt: null,
      score: null,
    };
  });

  const updated = existing.filter(q => q.userId !== userId || !q.isDaily);
  updated.push(...dailyQuizzes);
  storage.set(KEYS.DAILY_QUIZZES, updated);
  storage.set(KEYS.DAILY_QUIZ_DATE, today);
  return dailyQuizzes;
}

export function updateDailyQuizResult(quizId, answers, questions) {
  const all = storage.get(KEYS.DAILY_QUIZZES) || [];
  const idx = all.findIndex(q => q.id === quizId);
  if (idx === -1) return null;

  let correct = 0;
  const answersArray = questions.map((q, i) => answers[i] ?? -1);
  answersArray.forEach((ans, i) => { if (ans === questions[i].correct) correct++; });

  all[idx] = {
    ...all[idx],
    status: 'completed',
    completedAt: new Date().toISOString(),
    score: Math.round((correct / questions.length) * 100),
    userAnswers: answersArray,
    correctCount: correct,
  };
  storage.set(KEYS.DAILY_QUIZZES, all);
  return all[idx];
}

function generateQuestionsForTopic(subject) {
  const bank = DAILY_QUIZ_BANK[subject] || DAILY_QUIZ_BANK.math;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map((q, i) => ({ ...q, id: i }));
}
