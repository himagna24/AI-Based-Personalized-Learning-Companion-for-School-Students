import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AssessmentPage from './pages/AssessmentPage';
import AppLayout from './layout/AppLayout';
import './index.css';

function AppRouter() {
  const { currentUser, loading } = useAuth();
  const [authView, setAuthView] = useState('login');

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)',
      }}>
        <div style={{ fontSize: '3rem' }}>🎓</div>
        <div className="spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading EduBot AI...</p>
      </div>
    );
  }

  if (!currentUser) {
    return authView === 'login'
      ? <LoginPage onNavigateSignup={() => setAuthView('signup')} />
      : <SignupPage onNavigateLogin={() => setAuthView('login')} />;
  }

  // Skip assessment — go straight to app
  return (
    <AppDataProvider>
      <AppLayout />
    </AppDataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
