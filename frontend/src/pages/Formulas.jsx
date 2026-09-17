import React, { useState, useEffect } from 'react';
import { formulaService } from '../services/formulaService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, Bookmark, Search, AlertOctagon, HelpCircle } from 'lucide-react';

export default function Formulas() {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadFormulas = async () => {
    setLoading(true);
    try {
      const data = await formulaService.getFormulas({ search });
      setFormulas(data);
    } catch (err) {
      console.error('Failed to load formulas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadFormulas();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleToggleBookmark = async (formula) => {
    try {
      await formulaService.toggleBookmark(formula);
      await loadFormulas();
    } catch (err) {
      alert('Error toggling bookmark');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>GATE Mining Formula Book</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Curated mathematical relations, variable meanings, SI units, and common exam traps.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '42px' }}
            placeholder="Search formulas or variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading mining formulas..." />
      ) : formulas.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No formulas matched your search query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
          {formulas.map((f) => (
            <div
              key={f.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--accent-gold)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>{f.title}</h3>
                  <button
                    onClick={() => handleToggleBookmark(f)}
                    style={{
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      color: f.is_bookmarked ? 'var(--accent-gold)' : 'var(--text-muted)',
                      background: f.is_bookmarked ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    }}
                    title={f.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Formula'}
                  >
                    <Bookmark size={18} fill={f.is_bookmarked ? '#f59e0b' : 'none'} />
                  </button>
                </div>

                {/* Formula Display Box */}
                <div className="formula-box" style={{ fontSize: '1.15rem', textAlign: 'center', margin: '0 0 16px' }}>
                  {f.formula_latex}
                </div>

                {/* Units & Variables */}
                <div style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {f.units && (
                    <div>
                      <strong style={{ color: 'var(--accent-cyan)' }}>Units: </strong>
                      <span style={{ color: '#fff' }}>{f.units}</span>
                    </div>
                  )}
                  {f.variable_meanings && (
                    <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--text-main)' }}>Variables: </strong>
                      {f.variable_meanings}
                    </div>
                  )}
                </div>

                {/* Common Trap Alert */}
                {f.common_traps && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.82rem',
                    color: '#f87171',
                    marginBottom: '12px'
                  }}>
                    <AlertOctagon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Common Trap: </strong>{f.common_traps}
                    </div>
                  </div>
                )}

                {/* Example Problem */}
                {f.example_problem && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.82rem',
                    color: '#94a3b8'
                  }}>
                    <strong style={{ color: 'var(--text-main)' }}>Example: </strong>
                    {f.example_problem}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
