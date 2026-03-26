import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { sendMessage, detectSubject, generateQuizQuestions } from '../services/aiService';
import { createQuizObject } from '../services/quizService';
import { scheduleQuizNotification, requestPermission } from '../services/notificationService';
import { SUBJECTS } from '../data/questions';

function TypingIndicator() {
  return (
    <div className="chat-message">
      <div className="chat-avatar bot">🤖</div>
      <div className="chat-bubble bot">
        <div className="chat-typing">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    </div>
  );
}

export default function AITutorPage() {
  const { currentUser } = useAuth();
  const { saveChat, getChatsForUser, addQuiz } = useAppData();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedSubject, setDetectedSubject] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load chat history (async from Firestore or sync from localStorage)
  useEffect(() => {
    if (!currentUser) return;
    requestPermission();
    (async () => {
      setLoadingHistory(true);
      try {
        const history = await getChatsForUser(currentUser.id, 'general');
        setMessages(Array.isArray(history) ? history : []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    const userMsg = { role: 'user', content: userText, id: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    const subject = detectSubject(userText);
    setDetectedSubject(subject);

    try {
      const apiKey = currentUser?.apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
      const response = await sendMessage(messages, userText, apiKey);

      const botMsg = { role: 'bot', content: response, id: Date.now() + 1, subject };
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Persist chat messages
      await saveChat(currentUser.id, 'general', [userMsg]);
      await saveChat(currentUser.id, 'general', [botMsg]);
      if (subject !== 'general') {
        await saveChat(currentUser.id, subject, [userMsg]);
        await saveChat(currentUser.id, subject, [botMsg]);
      }

      // Generate quiz questions from the AI topic (non-blocking background task)
      (async () => {
        try {
          const questions = await generateQuizQuestions(userText, subject);
          const quiz = {
            id: `quiz_${Date.now()}`,
            title: userText.length > 60 ? userText.substring(0, 57) + '...' : userText,
            subject: subject === 'general' ? 'general' : subject,
            questions,
            difficulty: 'mixed',
            status: 'pending',
            createdAt: new Date().toISOString(),
            userId: currentUser.id,
            source: 'ai-tutor',
          };
          await addQuiz(quiz);
          console.log(`✅ Quiz created for "${userText.substring(0, 40)}" (${subject})`);
        } catch (err) {
          console.warn('Quiz generation failed silently:', err.message);
        }
      })();

      // Schedule push notification
      scheduleQuizNotification(userText.substring(0, 50), subject, () => {});

    } catch (err) {
      const errContent = err.message || '⚠️ Something went wrong. Please try again!';
      const errMsg = { role: 'bot', content: errContent, id: Date.now() + 2, isError: true };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, isTyping, currentUser, saveChat, addQuiz]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const msg = {
      role: 'user',
      content: `📎 I've uploaded a file: **${file.name}**\n\nPlease help me understand its content and any questions I should know about it.`,
      id: Date.now(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveChat(currentUser.id, 'general', [msg]);
    e.target.value = '';
  };

  const subjectInfo = SUBJECTS.find(s => s.id === detectedSubject);
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const hasGeminiKey = geminiKey.startsWith('AIza');
  const hasAnyKey = hasGeminiKey;

  return (
    <div className="ai-tutor-page">
      {/* Header */}
      <div style={{
        padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(17,18,35,0.8)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '36px', height: '36px', background: 'var(--gradient-hero)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.125rem',
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>EduBot AI Tutor</div>
            <div style={{ fontSize: '0.7rem', color: hasAnyKey ? 'var(--accent-green)' : 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', background: hasAnyKey ? 'var(--accent-green)' : 'var(--accent-yellow)', borderRadius: '50%', display: 'inline-block' }} />
              {hasAnyKey ? '✨ Gemini AI Connected' : 'Demo Mode — Add VITE_GEMINI_API_KEY to .env'}
            </div>
          </div>
        </div>
        {detectedSubject && detectedSubject !== 'general' && subjectInfo && (
          <div className="subject-detected-badge">{subjectInfo.icon} {subjectInfo.label}</div>
        )}
      </div>

      {/* API Key Notice */}
      {!hasAnyKey && (
        <div className="api-key-banner">
          ✨ Add <strong>VITE_GEMINI_API_KEY</strong> to your <code>.env</code> file · Get a <strong>free</strong> key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color:'var(--accent-secondary)', fontWeight:700}}>aistudio.google.com</a>
        </div>
      )}

      {/* Chat Area */}
      <div className="chat-area">
        {loadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-primary)' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">🤖</div>
            <h3>Hi! I'm EduBot 👋</h3>
            <p>Powered by GPT-4o. Ask me anything about your subjects — I explain concepts clearly and help you truly understand!</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              {[
                'Explain photosynthesis',
                "Newton's laws of motion",
                'How do I solve quadratic equations?',
                'What is DNA and RNA?',
                'Explain binary search algorithm',
              ].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{
                  padding: '0.5rem 0.875rem', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: '9999px',
                  color: 'var(--text-secondary)', fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                  textAlign: 'left',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >{q}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`chat-message ${msg.role === 'user' ? 'user' : ''}`}>
              <div className={`chat-avatar ${msg.role === 'user' ? 'user-av' : 'bot'}`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'bot'
                  ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                  : msg.content
                }
              </div>
            </div>
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-box">
          <textarea
            ref={textareaRef}
            id="chat-input"
            className="chat-textarea"
            placeholder="Ask any question about your subjects..."
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="chat-actions">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button className="chat-action-btn" title="Upload image"
              onClick={() => { fileInputRef.current.accept = 'image/*'; fileInputRef.current.click(); }}>🖼️</button>
            <button className="chat-action-btn" title="Upload file"
              onClick={() => { fileInputRef.current.accept = '.pdf,.doc,.docx,.txt'; fileInputRef.current.click(); }}>📎</button>
            <button
              id="send-btn"
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              {isTyping
                ? <span className="spinner" style={{ borderTopColor: 'white', width: '16px', height: '16px' }} />
                : '➤'}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
          EduBot may make mistakes. Verify important information with your textbook.
        </div>
      </div>
    </div>
  );
}
