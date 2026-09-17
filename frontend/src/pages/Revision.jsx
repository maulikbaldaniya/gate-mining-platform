import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { revisionService } from '../services/revisionService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  RotateCw,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function Revision() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  const loadRevisions = async () => {
    try {
      const list = await revisionService.getTodayRevisions();
      setRevisions(list);
    } catch (err) {
      console.error('Failed to load revisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevisions();
  }, []);

  const handleComplete = async (id) => {
    setCompletingId(id);
    try {
      await revisionService.completeRevision(id);
      await loadRevisions();
    } catch (err) {
      alert('Error completing revision');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Checking spaced revision queue..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Spaced Repetition Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Active recall based on the Hermann Ebbinghaus forgetting curve. Revision cycle: +1, +3, +7, +15, +30 Days.
        </p>
      </div>

      {revisions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Revisions Due Today!</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
            All completed topics have been reviewed up to date. Keep moving ahead on your 120-Day syllabus roadmap!
          </p>
          <Link to="/schedule" className="btn btn-primary">
            <span>Explore 120-Day Roadmap</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="glass-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: '4px solid var(--accent-gold)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    CYCLE {rev.revision_cycle} (+{rev.interval_days} DAYS)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>• {rev.subject_name}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem' }}>{rev.topic_name}</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Calendar size={14} /> Scheduled for: {rev.scheduled_date}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to={`/topic/${rev.topic_id}`} className="btn btn-secondary btn-sm">
                  <BookOpen size={15} />
                  <span>Recall Formulas & Notes</span>
                </Link>

                <button
                  onClick={() => handleComplete(rev.id)}
                  disabled={completingId === rev.id}
                  className="btn btn-success btn-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>{completingId === rev.id ? 'Updating...' : 'Mark Revised'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
