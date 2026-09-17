import React, { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import { TrendingUp, BookOpen, AlertCircle, Award } from 'lucide-react';

export default function Progress() {
  const [overview, setOverview] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ovData, subjData] = await Promise.all([
          progressService.getOverview(),
          progressService.getSubjectProgress(),
        ]);
        setOverview(ovData);
        setSubjects(subjData);
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating subject mastery curves..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Syllabus Completion & Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Detailed performance breakdown by technical subject section as per the master GATE MN syllabus.
        </p>
      </div>

      {/* Overall Metric Card */}
      {overview && (
        <div className="glass-card" style={{ marginBottom: '28px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Total Syllabus Completion</h2>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {overview.completed_topics} of {overview.total_topics} Topics Completed
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {overview.syllabus_percent}%
              </span>
            </div>
          </div>
          <ProgressBar percent={overview.syllabus_percent} height={12} />
        </div>
      )}

      {/* Subject-by-Subject Breakdown Grid */}
      <h2 style={{ fontSize: '1.35rem', marginBottom: '18px' }}>Subject-Wise Mastery</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {subjects.map((s) => (
          <div key={s.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  SECTION {s.id}
                </span>
                <h3 style={{ fontSize: '1.15rem', marginTop: '2px' }}>{s.name}</h3>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>
                {s.completion_percent}%
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '16px', minHeight: '38px' }}>
              {s.description}
            </p>

            <ProgressBar percent={s.completion_percent} height={8} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-dim)'
            }}>
              <span>{s.completed_topics} / {s.total_topics} Topics Done</span>
              {s.average_accuracy > 0 && (
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  Avg Accuracy: {s.average_accuracy}%
                </span>
              )}
              {s.weak_topics > 0 && (
                <span style={{ color: '#f87171', fontWeight: 600 }}>
                  {s.weak_topics} Weak
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
