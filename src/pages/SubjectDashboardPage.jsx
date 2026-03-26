import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { SUBJECTS } from '../data/questions';
import { getSubjectStrength } from '../services/analyticsService';
import { storage, KEYS } from '../utils/storage';
import ReactMarkdown from 'react-markdown';

// ── Helpers ──────────────────────────────────────────────────
function getNotes(userId, subjectId) {
  const all = storage.get(KEYS.NOTES) || {};
  return all[`${userId}_${subjectId}`] || [];
}
function saveNotes(userId, subjectId, notes) {
  const all = storage.get(KEYS.NOTES) || {};
  all[`${userId}_${subjectId}`] = notes;
  storage.set(KEYS.NOTES, all);
}

// ── NoteEditor ───────────────────────────────────────────────
function NoteEditor({ userId, subjectId }) {
  const [notes, setNotes] = useState(() => getNotes(userId, subjectId));
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null); // note id being edited

  const addNote = () => {
    if (!draft.trim()) return;
    const note = { id: Date.now(), text: draft.trim(), createdAt: new Date().toISOString() };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(userId, subjectId, updated);
    setDraft('');
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(userId, subjectId, updated);
  };

  const saveEdit = (id, newText) => {
    const updated = notes.map(n => n.id === id ? { ...n, text: newText } : n);
    setNotes(updated);
    saveNotes(userId, subjectId, updated);
    setEditing(null);
  };

  return (
    <div>
      {/* Add Note */}
      <div style={{
        background: 'white', border: '1.5px solid #F0EDE9', borderRadius: 'var(--radius-lg)',
        padding: '1rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)',
      }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Write a note, key concept, or formula..."
          rows={3}
          style={{
            width: '100%', border: '1.5px solid #F0EDE9', borderRadius: 'var(--radius-md)',
            padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)',
            resize: 'none', fontFamily: 'inherit', background: '#FAFAF9', outline: 'none',
            boxSizing: 'border-box', lineHeight: 1.6,
          }}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) addNote(); }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ctrl+Enter to save</span>
          <button onClick={addNote} disabled={!draft.trim()} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}>
            + Save Note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Write key concepts, formulas, or important points to remember.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {notes.map(note => (
            <NoteCard key={note.id} note={note} editing={editing} onEdit={setEditing} onSave={saveEdit} onDelete={deleteNote} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, editing, onEdit, onSave, onDelete }) {
  const [text, setText] = useState(note.text);
  const isEditing = editing === note.id;

  return (
    <div style={{
      background: 'white', border: '1.5px solid #F0EDE9', borderRadius: 'var(--radius-md)',
      padding: '1rem', boxShadow: 'var(--shadow-sm)',
      borderLeft: '4px solid var(--accent-primary)',
    }}>
      {isEditing ? (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          style={{
            width: '100%', border: '1.5px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)',
            padding: '0.5rem', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'none',
            outline: 'none', boxSizing: 'border-box',
          }}
          autoFocus
        />
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
          {note.text}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.625rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {isEditing ? (
            <>
              <button onClick={() => onSave(note.id, text)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Save</button>
              <button onClick={() => { setText(note.text); onEdit(null); }} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => onEdit(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', padding: '0.25rem', opacity: 0.6 }}>✏️</button>
              <button onClick={() => onDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', padding: '0.25rem', opacity: 0.6 }}>🗑️</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SubjectDashboardPage({ subjectId, onBack, onGoToQuiz }) {
  const { currentUser } = useAuth();
  const { analytics, quizzes, getChatsForUser } = useAppData();
  const [activeTab, setActiveTab] = useState('overview');
  const [chats, setChats] = useState([]);

  const subject = SUBJECTS.find(s => s.id === subjectId);
  const subjectQuizzes = quizzes.filter(q => q.subject === subjectId);
  const pendingQuizzes = subjectQuizzes.filter(q => q.status !== 'completed');
  const completedQuizzes = subjectQuizzes.filter(q => q.status === 'completed');
  const strengths = getSubjectStrength(analytics);
  const subjectStats = strengths.find(s => s.subject === subjectId);

  const avgScore = completedQuizzes.length > 0
    ? Math.round(completedQuizzes.reduce((s, q) => s + (q.score || 0), 0) / completedQuizzes.length) : 0;

  useEffect(() => {
    if (!currentUser) return;
    getChatsForUser(currentUser.id, subjectId)
      .then(msgs => setChats(Array.isArray(msgs) ? msgs : []));
  }, [subjectId, currentUser]);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'notes', label: '📝 Notes' },
    { id: 'quizzes', label: `📚 Quizzes${subjectQuizzes.length ? ` (${subjectQuizzes.length})` : ''}` },
    { id: 'chats', label: '💬 Chats' },
  ];

  return (
    <div className="subject-dashboard">
      {/* Header */}
      <div className="subject-dash-header">
        <button onClick={onBack} style={{
          width: '38px', height: '38px', background: 'white', border: '1.5px solid #E7E5E4',
          borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1.125rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: 'var(--shadow-sm)',
        }}>←</button>
        <div className="subject-dash-icon" style={{ background: subject?.color || 'var(--gradient-hero)' }}>
          {subject?.icon || '📚'}
        </div>
        <div className="subject-dash-title">
          <h2>{subject?.label || subjectId}</h2>
          <p>{subjectQuizzes.length} quizzes · {chats.filter(c => c.role === 'user').length} questions asked</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Accuracy', value: `${subjectStats?.accuracy || 0}%`, icon: '🎯', color: 'var(--accent-primary)' },
          { label: 'Completed', value: completedQuizzes.length, icon: '✅', color: 'var(--accent-green)' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: '⭐', color: 'var(--accent-blue)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white', border: '1.5px solid #F0EDE9', borderRadius: 'var(--radius-md)',
            padding: '0.875rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.125rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)', border: 'none',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', transition: 'all 0.2s',
              background: activeTab === t.id ? 'var(--gradient-hero)' : 'white',
              color: activeTab === t.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeTab === t.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              border: activeTab === t.id ? 'none' : '1.5px solid #F0EDE9',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Performance card */}
          <div style={{ background: 'white', border: '1.5px solid #F0EDE9', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>📈 Performance</h3>
            {subjectStats ? (
              [
                { label: 'Accuracy', value: subjectStats.accuracy },
                { label: 'Progress', value: Math.min(completedQuizzes.length * 10, 100) },
              ].map(bar => (
                <div key={bar.label} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{bar.label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{bar.value}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#F0EDE9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${bar.value}%`, height: '100%', background: 'var(--gradient-hero)', borderRadius: '99px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                🎯 Complete quizzes in this subject to see performance data.
              </p>
            )}
          </div>

          {/* Pending quizzes call-to-action */}
          {pendingQuizzes.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
              border: '1.5px solid rgba(249,115,22,0.25)', borderRadius: 'var(--radius-lg)',
              padding: '1.25rem', boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    🔔 {pendingQuizzes.length} Quiz{pendingQuizzes.length > 1 ? 'zes' : ''} Ready!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Auto-generated from your AI tutor sessions
                  </div>
                </div>
                <button onClick={() => setActiveTab('quizzes')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
                  Start →
                </button>
              </div>
            </div>
          )}

          {/* Study tips */}
          <div style={{ background: '#F0FDF4', border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>💡 Study Tips</h3>
            {[
              `Ask EduBot AI about ${subject?.label} concepts — quizzes auto-generate!`,
              'Take notes while studying for better retention',
              'Review past quiz mistakes in the Quizzes tab',
              'Aim for 3–5 topics a week for steady progress',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Notes Tab ── */}
      {activeTab === 'notes' && (
        <NoteEditor userId={currentUser?.id} subjectId={subjectId} />
      )}

      {/* ── Quizzes Tab ── */}
      {activeTab === 'quizzes' && (
        subjectQuizzes.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No quizzes yet</h3>
              <p>Ask the AI Tutor about {subject?.label} topics — quizzes are auto-generated from your questions!</p>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {subjectQuizzes.map(q => (
                <div key={q.id} style={{
                  background: 'white', border: '1.5px solid #F0EDE9', borderRadius: 'var(--radius-md)',
                  padding: '1rem', boxShadow: 'var(--shadow-sm)',
                  borderLeft: `4px solid ${q.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-primary)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {q.title || q.topic || 'Untitled Quiz'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                        <span>📅 {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span>❓ {q.questions?.length || 0} questions</span>
                      </div>
                    </div>
                    {q.status === 'completed' ? (
                      <div style={{
                        fontSize: '1rem', fontWeight: 900,
                        color: q.score >= 70 ? 'var(--accent-green)' : q.score >= 50 ? 'var(--accent-primary)' : '#EF4444',
                        background: q.score >= 70 ? '#ECFDF5' : q.score >= 50 ? '#FFF7ED' : '#FEF2F2',
                        border: `1.5px solid ${q.score >= 70 ? 'rgba(16,185,129,0.2)' : q.score >= 50 ? 'rgba(249,115,22,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: 'var(--radius-full)', padding: '0.25rem 0.625rem', whiteSpace: 'nowrap',
                      }}>
                        {q.score}%
                      </div>
                    ) : (
                      <button
                        onClick={() => onGoToQuiz && onGoToQuiz(q)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', whiteSpace: 'nowrap' }}
                      >
                        Take →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* ── Chats Tab ── */}
      {activeTab === 'chats' && (
        chats.filter(c => c.role === 'user').length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>No conversations yet</h3>
              <p>Ask the AI Tutor about {subject?.label} — conversations are saved here!</p>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {chats.slice(-30).map((msg, i) => (
                <div key={i} style={{
                  background: msg.role === 'user' ? 'white' : '#FFF7ED',
                  border: `1px solid ${msg.role === 'user' ? '#F0EDE9' : 'rgba(249,115,22,0.2)'}`,
                  borderRadius: 'var(--radius-md)', padding: '0.75rem',
                  borderLeft: `3px solid ${msg.role === 'user' ? '#D4CFC9' : 'var(--accent-primary)'}`,
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: msg.role === 'user' ? 'var(--text-muted)' : 'var(--accent-primary)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {msg.role === 'user' ? '👤 You' : '🤖 EduBot'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {msg.role === 'bot'
                      ? <ReactMarkdown>{msg.content?.substring(0, 400) + (msg.content?.length > 400 ? '…' : '')}</ReactMarkdown>
                      : msg.content}
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}
