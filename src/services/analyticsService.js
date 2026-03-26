import { storage, KEYS } from '../utils/storage';

// Analytics are stored flat (not nested by userId) in KEYS.ANALYTICS
export function getAnalyticsLocal() {
  return storage.get(KEYS.ANALYTICS) || { subjects: {}, totalQuizzes: 0, totalCorrect: 0, totalAnswered: 0 };
}

export function getSubjectStrength(analytics) {
  if (!analytics?.subjects) return [];
  return Object.entries(analytics.subjects)
    .map(([subject, data]) => ({
      subject,
      accuracy: data.answered > 0 ? Math.round((data.correct / data.answered) * 100) : 0,
      quizzes: data.quizzes || 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

export function getOverallProgress(analytics) {
  if (!analytics?.totalAnswered) return 0;
  return Math.round((analytics.totalCorrect / analytics.totalAnswered) * 100);
}

export function getRecommendations(analytics) {
  const strengths = getSubjectStrength(analytics);
  const weak = strengths.filter(s => s.accuracy < 60);
  const strong = strengths.filter(s => s.accuracy >= 80);
  const recs = [];
  if (weak.length > 0) recs.push(`You need to improve in **${weak.map(w => w.subject).join(', ')}**. Try more quizzes!`);
  if (strong.length > 0) recs.push(`Great work in **${strong.map(s => s.subject).join(', ')}**! Keep it up!`);
  if (!analytics?.totalQuizzes) recs.push('Start by taking your first quiz! Visit the **Quiz** tab to get started.');
  return recs;
}

// Legacy: kept for compatibility
export async function recordQuizResult() {}
