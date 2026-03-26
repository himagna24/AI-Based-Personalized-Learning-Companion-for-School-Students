import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS } from '../data/questions';

const STEPS = ['Account Info', 'Your Profile'];
const CLASSES = ['8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College', 'Other'];

export default function SignupPage({ onNavigateLogin }) {
  const { signup } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', dob: '', age: '', classYear: '', college: '', subjects: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const toggleSubject = (id) => {
    set('subjects', formData.subjects.includes(id)
      ? formData.subjects.filter(s => s !== id)
      : [...formData.subjects, id]);
  };

  const handleContinue = (e) => {
    e.preventDefault(); setError('');
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setStep(1);
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setError('');
    if (!formData.dob || !formData.classYear || !formData.college) { setError('Please fill in all profile fields'); return; }
    if (formData.subjects.length === 0) { setError('Please select at least one subject'); return; }
    setLoading(true);
    try {
      await signup(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb-1" />
      <div className="auth-bg-orb orb-2" />
      <div className="auth-card" style={{ maxWidth: '480px', overflowY: 'auto', maxHeight: '95vh' }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <h1>EduBot AI</h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800,
                  background: i <= step ? 'var(--gradient-hero)' : '#F0EDE9',
                  color: i <= step ? 'white' : 'var(--text-muted)',
                  flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: i === step ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{s}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '99px', background: i <= step ? 'var(--gradient-hero)' : '#F0EDE9', transition: 'background 0.3s' }} />
            </div>
          ))}
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>⚠️ {error}</span>
            {error.toLowerCase().includes('already exists') && (
              <a onClick={onNavigateLogin} style={{ color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8125rem', textDecoration: 'underline' }}>Sign in →</a>
            )}
          </div>
        )}

        {step === 0 ? (
          <form className="auth-form" onSubmit={handleContinue}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" id="signup-name" placeholder="John Doe" value={formData.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" id="signup-email" type="email" placeholder="you@example.com" value={formData.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" id="signup-password" type="password" placeholder="Min. 6 characters" value={formData.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <button className="btn btn-primary w-full btn-lg" type="submit">Continue →</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" id="signup-dob" type="date" value={formData.dob} onChange={e => { set('dob', e.target.value); const y = new Date().getFullYear() - new Date(e.target.value).getFullYear(); set('age', y > 0 ? y : ''); }} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" id="signup-age" type="number" placeholder="18" value={formData.age} onChange={e => set('age', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Class / Year</label>
              <select className="form-input" id="signup-class" value={formData.classYear} onChange={e => set('classYear', e.target.value)} required>
                <option value="">Select class...</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">School / College</label>
              <input className="form-input" id="signup-college" placeholder="e.g. Harvard University" value={formData.college} onChange={e => set('college', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Subjects (select all that apply)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                {SUBJECTS.map(s => (
                  <button key={s.id} type="button"
                    className={`checkbox-item ${formData.subjects.includes(s.id) ? 'checked' : ''}`}
                    onClick={() => toggleSubject(s.id)}>
                    <span>{s.icon}</span>
                    <span style={{ fontSize: '0.8125rem' }}>{s.label}</span>
                    {formData.subjects.includes(s.id) && <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontWeight: 800 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setStep(0); setError(''); }} style={{ flex: 1 }}>← Back</button>
              <button type="submit" id="signup-btn" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: 'white', width: '16px', height: '16px' }} /> Creating...</> : '🚀 Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-switch">
          Already have an account?&nbsp;<a onClick={onNavigateLogin}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
