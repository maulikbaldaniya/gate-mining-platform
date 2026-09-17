import React, { useState, useEffect } from 'react';
import { mistakeService } from '../services/mistakeService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AlertTriangle, CheckCircle2, RotateCcw, Filter, HelpCircle } from 'lucide-react';

export default function Mistakes() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');

  const categories = [
    { code: 'M1', label: 'M1: Concept Not Understood' },
    { code: 'M2', label: 'M2: Formula Forgotten' },
    { code: 'M3', label: 'M3: Calculation Error' },
    { code: 'M4', label: 'M4: Question Misread' },
    { code: 'M5', label: 'M5: Time-Management Error' },
    { code: 'M6', label: 'M6: Careless / Silly Mistake' },
  ];

  const loadMistakes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (resolvedFilter !== '') params.is_resolved = resolvedFilter;

      const res = await mistakeService.getMistakes(params);
      setMistakes(res.data.mistakes || []);
    } catch (err) {
      console.error('Failed to load mistakes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMistakes();
  }, [selectedCategory, resolvedFilter]);

  const handleUpdateCategory = async (mistakeId, newCategory) => {
    try {
      await mistakeService.updateMistake(mistakeId, { category: newCategory });
      await loadMistakes();
    } catch (err) {
      alert('Failed to update category');
    }
  };

  const handleToggleResolved = async (mistakeId, currentStatus) => {
    try {
      await mistakeService.updateMistake(mistakeId, { is_resolved: !currentStatus });
      await loadMistakes();
    } catch (err) {
      alert('Failed to update resolution status');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Personal Mistake Book</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Every incorrect attempt is automatically captured. Categorize errors into M1–M6 to eradicate weak patterns.
        </p>
      </div>

      {/* Filter Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Filter size={16} /> Filter by Category:
        </div>

        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: selectedCategory === '' ? 'var(--accent-blue)' : 'var(--bg-glass)',
            color: selectedCategory === '' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          All Categories
        </button>

        {categories.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCategory(c.code)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: selectedCategory === c.code ? 'var(--accent-blue)' : 'var(--bg-glass)',
              color: selectedCategory === c.code ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {c.code}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading mistake logs..." />
      ) : mistakes.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No Mistakes Recorded Here!</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Your answer log is clean in this category. Keep solving MCQs with high precision.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mistakes.map((m) => (
            <div
              key={m.id}
              className="glass-card"
              style={{
                borderLeft: m.is_resolved ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-ruby)',
                opacity: m.is_resolved ? 0.75 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    {m.topic ? m.topic.name : 'Mining Topic'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span className="badge badge-weak">
                      Category {m.category}
                    </span>
                    {m.is_resolved && (
                      <span className="badge badge-completed">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Category Selector Dropdown */}
                  <select
                    value={m.category}
                    onChange={(e) => handleUpdateCategory(m.id, e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-main)',
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleToggleResolved(m.id, m.is_resolved)}
                    className={`btn btn-sm ${m.is_resolved ? 'btn-secondary' : 'btn-success'}`}
                  >
                    {m.is_resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '1.02rem', fontWeight: 600, marginBottom: '14px' }}>
                {m.question ? m.question.question_text : 'Question text'}
              </p>

              <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', marginBottom: '14px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Your Recorded Answer: </span>
                  <strong style={{ color: '#f87171' }}>Option {m.user_answer}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Correct Official Answer: </span>
                  <strong style={{ color: '#34d399' }}>Option {m.correct_answer}</strong>
                </div>
              </div>

              {m.question?.explanation_json && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  border: '1px solid var(--border-subtle)',
                  color: '#e2e8f0'
                }}>
                  <strong style={{ color: 'var(--accent-gold)' }}>Why Correct: </strong>
                  {m.question.explanation_json.why_correct}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
