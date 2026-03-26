import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateSignup }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
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
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <h1>EduBot AI</h1>
        </div>

        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Welcome back!</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign in to continue your learning journey</p>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" id="login-email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" id="login-password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-full btn-lg" id="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : ''}
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?&nbsp;
          <a id="goto-signup" onClick={onNavigateSignup}>Create one</a>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#FFF7ED', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249,115,22,0.2)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          🚀 <strong style={{ color: 'var(--accent-primary)' }}>New here?</strong> Create an account to get started with your personalized AI learning experience!
        </div>
      </div>
    </div>
  );
}
