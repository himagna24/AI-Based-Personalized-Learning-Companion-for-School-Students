import React from 'react';

const NAV_ITEMS = [
  { id: 'home',    icon: '🏠', label: 'Home'     },
  { id: 'tutor',   icon: '🤖', label: 'AI Tutor' },
  { id: 'quizzes', icon: '📝', label: 'Quizzes'  },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <div className="nav-icon">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
          {activeTab === item.id && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              width: '20px',
              height: '3px',
              background: 'var(--gradient-hero)',
              borderRadius: '2px 2px 0 0',
            }} />
          )}
        </button>
      ))}
    </nav>
  );
}
