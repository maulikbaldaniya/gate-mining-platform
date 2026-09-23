import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: { bg: 'var(--accent-blue-bg)', text: 'var(--accent-blue)', border: 'rgba(37, 99, 235, 0.25)' },
    gold: { bg: 'var(--accent-gold-bg)', text: 'var(--accent-gold)', border: 'rgba(217, 119, 6, 0.25)' },
    emerald: { bg: 'var(--accent-emerald-bg)', text: 'var(--accent-emerald)', border: 'rgba(5, 150, 105, 0.25)' },
    purple: { bg: 'rgba(139, 92, 246, 0.12)', text: '#7c3aed', border: 'rgba(139, 92, 246, 0.25)' },
    ruby: { bg: 'var(--accent-ruby-bg)', text: 'var(--accent-ruby)', border: 'rgba(220, 38, 38, 0.25)' },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: scheme.bg,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: scheme.text,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {value}
        </span>
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
