import React from 'react';

export default function LoadingSpinner({ message = 'Loading syllabus data...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '260px',
      gap: '16px'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(59, 130, 246, 0.2)',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{message}</p>
    </div>
  );
}
