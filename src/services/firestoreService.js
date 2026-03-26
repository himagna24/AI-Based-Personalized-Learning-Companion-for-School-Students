// Firestore service — all functions get a fresh db reference dynamically
// so they work even when Firebase is initialized lazily in AuthContext.

async function getDb() {
  const { getFirestore } = await import('firebase/firestore');
  const { getApp, getApps } = await import('firebase/app');
  if (getApps().length === 0) throw new Error('Firebase not initialized');
  return getFirestore(getApp());
}

/* ─── USER PROFILE ──────────────────────────────────────────── */

export async function saveUserProfile(userId, data) {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = await getDb();
  await setDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getUserProfile(userId) {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getDb();
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(userId, updates) {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const db = await getDb();
  await updateDoc(doc(db, 'users', userId), { ...updates, updatedAt: serverTimestamp() });
}

/* ─── CHAT MESSAGES ─────────────────────────────────────────── */

export async function saveChatMessage(userId, subject, message) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const db = await getDb();
  const ref = collection(db, 'users', userId, 'chats', subject, 'messages');
  await addDoc(ref, { ...message, createdAt: serverTimestamp() });
}

export async function getChatMessages(userId, subject) {
  const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
  const db = await getDb();
  const ref = collection(db, 'users', userId, 'chats', subject, 'messages');
  const q = query(ref, orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─── QUIZZES ───────────────────────────────────────────────── */

export async function saveQuiz(userId, quiz) {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = await getDb();
  const ref = doc(db, 'users', userId, 'quizzes', quiz.id);
  await setDoc(ref, { ...quiz, createdAt: serverTimestamp() });
}

export async function updateQuiz(userId, quizId, updates) {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const db = await getDb();
  const ref = doc(db, 'users', userId, 'quizzes', quizId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function getUserQuizzesFromFirestore(userId) {
  const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
  const db = await getDb();
  const ref = collection(db, 'users', userId, 'quizzes');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─── ANALYTICS ─────────────────────────────────────────────── */

export async function getAnalyticsFromFirestore(userId) {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getDb();
  const snap = await getDoc(doc(db, 'users', userId, 'analytics', 'summary'));
  return snap.exists()
    ? snap.data()
    : { subjects: {}, totalQuizzes: 0, totalCorrect: 0, totalAnswered: 0 };
}

export async function updateAnalyticsInFirestore(userId, subject, correct, total) {
  const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const db = await getDb();
  const ref = doc(db, 'users', userId, 'analytics', 'summary');
  const snap = await getDoc(ref);
  const existing = snap.exists()
    ? snap.data()
    : { subjects: {}, totalQuizzes: 0, totalCorrect: 0, totalAnswered: 0 };

  const subjectData = existing.subjects?.[subject] || { quizzes: 0, correct: 0, answered: 0 };
  const updated = {
    ...existing,
    subjects: {
      ...existing.subjects,
      [subject]: {
        quizzes: subjectData.quizzes + 1,
        correct: subjectData.correct + correct,
        answered: subjectData.answered + total,
      },
    },
    totalQuizzes: (existing.totalQuizzes || 0) + 1,
    totalCorrect: (existing.totalCorrect || 0) + correct,
    totalAnswered: (existing.totalAnswered || 0) + total,
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, updated, { merge: true });
  return updated;
}
