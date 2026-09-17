import React, { useState, useEffect } from 'react';
import { pyqService } from '../services/pyqService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { History, CheckCircle2, Eye, EyeOff, Award, HelpCircle } from 'lucide-react';

export default function PYQs() {
  const [pyqs, setPYQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [revealedIds, setRevealedIds] = useState(new Set());

  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

  const loadPYQs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedYear) params.year = selectedYear;

      const res = await pyqService.getPYQs(params);
      setPYQs(res.data.pyqs || []);
    } catch (err) {
      console.error('Failed to load PYQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPYQs();
  }, [selectedYear]);

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Official GATE Mining PYQ Bank</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Authentic past year questions classified strictly by topic and year with official answer keys and step-by-step proofs.
        </p>
      </div>

      {/* Year Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={() => setSelectedYear('')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: selectedYear === '' ? 'var(--accent-blue)' : 'var(--bg-glass)',
            color: selectedYear === '' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          All Years (2018–2024)
        </button>

        {years.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: selectedYear === y ? 'var(--accent-blue)' : 'var(--bg-glass)',
              color: selectedYear === y ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            GATE {y}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving official GATE Mining PYQ database..." />
      ) : pyqs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No PYQs found for the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pyqs.map((q, idx) => {
            const isRevealed = revealedIds.has(q.id);

            return (
              <div
                key={q.id}
                className="glass-card"
                style={{ borderLeft: '4px solid var(--accent-blue)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      GATE {q.pyq_year || 'MN'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      • {q.topic ? q.topic.name : 'Mining Engineering'}
                    </span>
                  </div>

                  <span className="badge badge-learning">
                    {q.type} • {q.difficulty}
                  </span>
                </div>

                <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '18px' }}>
                  {q.question_text}
                </p>

                {/* Options List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {q.options?.map((opt) => (
                    <div
                      key={opt.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: isRevealed && opt.option_key === q.correct_answer
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isRevealed && opt.option_key === q.correct_answer
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid var(--border-subtle)',
                        fontSize: '0.92rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <strong style={{ color: isRevealed && opt.option_key === q.correct_answer ? '#34d399' : 'var(--text-muted)' }}>
                        {opt.option_key}
                      </strong>
                      <span>{opt.option_text}</span>
                    </div>
                  ))}
                </div>

                {/* Toggle Solution Button */}
                <button
                  onClick={() => toggleReveal(q.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ marginBottom: isRevealed ? '14px' : '0' }}
                >
                  {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{isRevealed ? 'Hide Official Solution' : 'Reveal Official Solution & Key'}</span>
                </button>

                {/* Revealed Explanation */}
                {isRevealed && q.explanation_json && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px 18px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6
                  }}>
                    <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '6px' }}>
                      Official Correct Answer: Option {q.correct_answer}
                    </div>
                    {q.explanation_json.why_correct && (
                      <p style={{ color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.7 }}>
                        {q.explanation_json.why_correct}
                      </p>
                    )}
                    {q.explanation_json.formula && (
                      <div className="formula-box" style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                        <strong>Formula: </strong>{q.explanation_json.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
