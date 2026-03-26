import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storage, KEYS } from '../utils/storage';

const AppDataContext = createContext(null);

// ── localStorage helpers ──────────────────────────────────────

function getLocalQuizzes(userId) {
  const all = storage.get(KEYS.QUIZZES) || [];
  return all.filter(q => q.userId === userId);
}

function setLocalQuizzes(userId, quizzes) {
  const all = storage.get(KEYS.QUIZZES) || [];
  const others = all.filter(q => q.userId !== userId);
  storage.set(KEYS.QUIZZES, [...others, ...quizzes]);
}

function getLocalChats(userId, subject) {
  const all = storage.get(KEYS.CHATS) || {};
  const user = all[userId] || {};
  if (subject) return user[subject] || [];
  return user;
}

function setLocalChats(userId, subject, msgs) {
  const all = storage.get(KEYS.CHATS) || {};
  if (!all[userId]) all[userId] = {};
  all[userId][subject] = msgs;
  storage.set(KEYS.CHATS, all);
}

// ── Optional Firestore sync (best-effort, never crashes) ──────

async function tryFirestoreOp(fn) {
  try { return await fn(); } catch (e) {
    console.warn('[Firestore] Skipped (offline or not configured):', e.message?.substring(0, 80));
    return null;
  }
}

// ── Provider ──────────────────────────────────────────────────

export function AppDataProvider({ children }) {
  const { currentUser, useFirebase } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [chats, setChats] = useState({});

  // Load quizzes — always from localStorage first, optionally sync with Firestore
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      // Always load from localStorage immediately
      const localQ = getLocalQuizzes(currentUser.id);
      setQuizzes(localQ);

      // Best-effort Firestore sync
      if (useFirebase) {
        const result = await tryFirestoreOp(async () => {
          const { getUserQuizzesFromFirestore } = await import('../services/firestoreService');
          return await getUserQuizzesFromFirestore(currentUser.id);
        });
        if (result && result.length > 0) {
          // Merge Firestore quizzes with local (Firestore wins on conflicts)
          const fsIds = new Set(result.map(q => q.id));
          const localOnly = localQ.filter(q => !fsIds.has(q.id));
          const merged = [...result, ...localOnly];
          setQuizzes(merged);
          setLocalQuizzes(currentUser.id, merged);
        }

        const analyticsResult = await tryFirestoreOp(async () => {
          const { getAnalyticsFromFirestore } = await import('../services/firestoreService');
          return await getAnalyticsFromFirestore(currentUser.id);
        });
        if (analyticsResult) setAnalytics(analyticsResult);
      }
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser, useFirebase]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── CHATS ─────────────────────────────────────────────────────

  const saveChat = useCallback(async (userId, subject, messages) => {
    if (!messages?.length) return;
    const lastMsg = messages[messages.length - 1];

    // Save to localStorage
    const existing = getLocalChats(userId, subject);
    const updated = [...existing, lastMsg];
    setLocalChats(userId, subject, updated);
    setChats(prev => ({ ...prev, [subject]: updated }));

    // Best-effort Firestore
    if (useFirebase) {
      tryFirestoreOp(async () => {
        const { saveChatMessage } = await import('../services/firestoreService');
        await saveChatMessage(userId, subject, { role: lastMsg.role, content: lastMsg.content });
      });
    }
  }, [useFirebase]);

  const getChatsForUser = useCallback(async (userId, subject) => {
    // Always try Firestore first, fall back to localStorage
    if (useFirebase) {
      const result = await tryFirestoreOp(async () => {
        const { getChatMessages } = await import('../services/firestoreService');
        return await getChatMessages(userId, subject);
      });
      if (result && result.length > 0) {
        setLocalChats(userId, subject, result);
        return result;
      }
    }
    return getLocalChats(userId, subject);
  }, [useFirebase]);

  // ── QUIZZES ───────────────────────────────────────────────────

  const addQuiz = useCallback(async (quiz) => {
    // Always save to localStorage immediately
    const localQ = getLocalQuizzes(currentUser.id);
    const updated = [quiz, ...localQ.filter(q => q.id !== quiz.id)];
    setLocalQuizzes(currentUser.id, updated);
    setQuizzes(updated);

    // Best-effort Firestore
    if (useFirebase) {
      tryFirestoreOp(async () => {
        const { saveQuiz } = await import('../services/firestoreService');
        await saveQuiz(currentUser.id, quiz);
      });
    }
  }, [currentUser, useFirebase]);

  const completeQuiz = useCallback(async (quizId, answers, questions) => {
    let correct = 0;
    const answersArray = questions.map((q, i) => answers[i] ?? -1);
    answersArray.forEach((ans, i) => { if (ans === questions[i].correct) correct++; });

    const updates = {
      status: 'completed',
      completedAt: new Date().toISOString(),
      score: Math.round((correct / questions.length) * 100),
      userAnswers: answersArray,
      correctCount: correct,
    };

    // Update localStorage immediately
    const localQ = getLocalQuizzes(currentUser.id);
    const updated = localQ.map(q => q.id === quizId ? { ...q, ...updates } : q);
    setLocalQuizzes(currentUser.id, updated);
    setQuizzes(updated);

    // Update local analytics
    const quizObj = localQ.find(q => q.id === quizId);
    if (quizObj) {
      const existing = storage.get(KEYS.ANALYTICS) || { subjects: {}, totalQuizzes: 0, totalCorrect: 0, totalAnswered: 0 };
      const sub = existing.subjects?.[quizObj.subject] || { quizzes: 0, correct: 0, answered: 0 };
      const updatedAnalytics = {
        ...existing,
        subjects: {
          ...existing.subjects,
          [quizObj.subject]: {
            quizzes: sub.quizzes + 1,
            correct: sub.correct + correct,
            answered: sub.answered + questions.length,
          },
        },
        totalQuizzes: (existing.totalQuizzes || 0) + 1,
        totalCorrect: (existing.totalCorrect || 0) + correct,
        totalAnswered: (existing.totalAnswered || 0) + questions.length,
      };
      storage.set(KEYS.ANALYTICS, updatedAnalytics);
      setAnalytics(updatedAnalytics);
    }

    // Best-effort Firestore
    if (useFirebase && quizObj) {
      tryFirestoreOp(async () => {
        const { updateQuiz, updateAnalyticsInFirestore } = await import('../services/firestoreService');
        await Promise.all([
          updateQuiz(currentUser.id, quizId, updates),
          updateAnalyticsInFirestore(currentUser.id, quizObj.subject, correct, questions.length),
        ]);
      });
    }

    return { ...updates, questions };
  }, [currentUser, useFirebase]);

  const refreshQuizzes = useCallback(async () => {
    if (!currentUser) return;
    setQuizzes(getLocalQuizzes(currentUser.id));
  }, [currentUser]);

  const refreshAnalytics = useCallback(() => {
    setAnalytics(storage.get(KEYS.ANALYTICS) || null);
  }, []);

  return (
    <AppDataContext.Provider value={{
      chats, quizzes, analytics, loadingData,
      saveChat, getChatsForUser,
      addQuiz, completeQuiz, refreshQuizzes, refreshAnalytics,
      loadData,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
