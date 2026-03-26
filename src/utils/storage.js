export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove: (key) => localStorage.removeItem(key),
};

export const KEYS = {
  USERS: 'ai_learn_users',
  CURRENT_USER: 'ai_learn_current_user',
  CHATS: 'ai_learn_chats',
  QUIZZES: 'ai_learn_quizzes',
  ANALYTICS: 'ai_learn_analytics',
  DAILY_QUIZZES: 'ai_learn_daily_quizzes',
  DAILY_QUIZ_DATE: 'ai_learn_daily_quiz_date',
  NOTES: 'ai_learn_notes',
};
