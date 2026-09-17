import React from 'react';

export default function ProgressBar({ percent = 0, variant = 'blue', height = 8 }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const variantClass =
    variant === 'gold'
      ? 'progress-fill-gold'
      : variant === 'emerald'
      ? 'progress-fill-emerald'
      : 'progress-fill';

  return (
    <div className="progress-container" style={{ height: `${height}px` }}>
      <div
        className={`progress-fill ${variantClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
