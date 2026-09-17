import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Sigma, 
  RotateCcw, 
  AlertOctagon, 
  MoreHorizontal, 
  X, 
  FileText, 
  BookOpen, 
  TrendingUp,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setShowMore(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Slide-up "More" Menu for Remaining Links */}
      {showMore && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowMore(false)}
        >
          <div 
            style={{
              background: 'var(--bg-card)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              borderTop: '1px solid var(--border-card)',
              padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 12px))',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>Study Menu</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.name || 'Aspirant'} • Day {user?.current_day || 1}</p>
              </div>
              <button 
                onClick={() => setShowMore(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-glass-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <NavLink 
                to="/tests/weekly" 
                onClick={() => setShowMore(false)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <FileText size={22} color="var(--accent-blue)" />
                <span>Weekly Tests</span>
              </NavLink>

              <NavLink 
                to="/mistakes" 
                onClick={() => setShowMore(false)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <AlertOctagon size={22} color="var(--accent-ruby)" />
                <span>Mistakes</span>
              </NavLink>

              <NavLink 
                to="/pyqs" 
                onClick={() => setShowMore(false)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <BookOpen size={22} color="var(--accent-gold)" />
                <span>PYQs Bank</span>
              </NavLink>

              <NavLink 
                to="/progress" 
                onClick={() => setShowMore(false)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <TrendingUp size={22} color="var(--accent-emerald)" />
                <span>Analytics</span>
              </NavLink>

              <button 
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {theme === 'reader-dark' ? (
                  <Sun size={22} color="#f59e0b" />
                ) : (
                  <Moon size={22} color="#6366f1" />
                )}
                <span>{theme === 'reader-dark' ? 'Paper Light' : 'Eye-care Dark'}</span>
              </button>

              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-ruby-bg)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  color: 'var(--accent-ruby)',
                  textAlign: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <LogOut size={22} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 5-Item Bottom App Bar for Mobile */}
      <nav className="mobile-bottom-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/schedule" 
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <CalendarDays size={20} />
          <span>120 Days</span>
        </NavLink>

        <NavLink 
          to="/formulas" 
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Sigma size={20} />
          <span>Formulas</span>
        </NavLink>

        <NavLink 
          to="/revision" 
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <RotateCcw size={20} />
          <span>Revision</span>
        </NavLink>

        <button 
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`mobile-nav-item ${showMore ? 'active' : ''}`}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
