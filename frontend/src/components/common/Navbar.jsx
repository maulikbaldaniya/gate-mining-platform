import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Flame, LogOut, Compass, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
            flexShrink: 0
          }}>
            <Compass size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            GATE MN <span style={{ color: 'var(--accent-gold)' }}>120</span>
          </span>
        </Link>
        <span className="navbar-brand-badge" style={{ display: 'inline-block' }}>2027</span>
      </div>

      <div className="navbar-actions">
        {/* Theme Toggle Button (Paper Light <-> Soft Slate Dark) */}
        <button 
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'reader-light' ? 'Soft Night' : 'Paper Cream'} theme`}
          aria-label="Toggle reader theme"
        >
          {theme === 'reader-light' ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} color="#f59e0b" />
          )}
        </button>

        {user && (
          <>
            {/* Day Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gold-bg)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              color: 'var(--accent-gold)',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}>
              <Flame size={15} fill="currentColor" />
              <span>Day {user.current_day || 1}</span>
            </div>

            {/* User Profile Info (Hidden on tiny screens) */}
            <div 
              className="navbar-user-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '8px',
                borderLeft: '1px solid var(--border-subtle)'
              }}
            >
              <div className="navbar-user-text" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-main)' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MN Aspirant</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-glass-active)'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
