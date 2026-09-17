import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/testService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FileCheck2,
  Clock,
  Award,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export default function WeeklyTests() {
  const [weekNumber, setWeekNumber] = useState(1);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const loadStatus = async (wk) => {
    setLoading(true);
    try {
      const data = await testService.getWeeklyTestStatus(wk);
      setStatus(data);
    } catch (err) {
      console.error('Failed to load weekly test status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus(weekNumber);
  }, [weekNumber]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const test = await testService.generateWeeklyTest(weekNumber);
      await loadStatus(weekNumber);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate weekly test');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTest = () => {
    if (status?.test?.id) {
      navigate(`/test/${status.test.id}`);
    }
  };

  if (loading) return <LoadingSpinner message="Checking weekly test eligibility..." />;

  const test = status?.test;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Automated Weekly Test Engine</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Weekly tests are automatically compiled exclusively from topics you have completed. Zero admin intervention.
        </p>
      </div>

      {/* Week Selector */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
          <button
            key={w}
            onClick={() => setWeekNumber(w)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: weekNumber === w ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--bg-glass)',
              border: weekNumber === w ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
              color: weekNumber === w ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Week {w} Test
          </button>
        ))}
      </div>

      {/* Test Overview Card */}
      <div className="glass-card" style={{ maxWidth: '720px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <FileCheck2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Week {weekNumber} Comprehensive Test</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Targeted simulation for Week {weekNumber} curriculum
            </span>
          </div>
        </div>

        {/* Existing Test State */}
        {test ? (
          <div>
            {test.is_submitted ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, marginBottom: '12px' }}>
                  <CheckCircle2 size={20} />
                  <span>Test Completed & Evaluated</span>
                </div>
                <div style={{ display: 'flex', gap: '28px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Score: </span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{test.score} / {test.total_questions}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Accuracy: </span>
                    <strong style={{ fontSize: '1.2rem', color: test.accuracy >= 70 ? 'var(--accent-emerald)' : 'var(--accent-ruby)' }}>
                      {test.accuracy}%
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                  This test has been generated with <strong>{test.total_questions} questions</strong> based on your completed topics.
                  Time limit is <strong>{test.time_limit_minutes} minutes</strong>.
                </p>
                <button onClick={handleStartTest} className="btn btn-primary" style={{ width: '100%' }}>
                  <Play size={18} />
                  <span>Begin Week {weekNumber} Test</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Not Yet Generated */
          <div>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>Eligibility Criteria</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                The algorithm pulls questions strictly from topics you have marked <strong>COMPLETED</strong> in Week {weekNumber}.
                Incomplete topics are never included.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                • Eligible completed topics for this week: <strong>{status.completedTopicsCount}</strong>
              </div>
            </div>

            {status.available ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn btn-accent"
                style={{ width: '100%' }}
              >
                <FileCheck2 size={18} />
                <span>{generating ? 'Generating Test Algorithm...' : `Generate Week ${weekNumber} Test`}</span>
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.88rem'
              }}>
                <AlertCircle size={18} />
                <span>Please complete at least one topic in Week {weekNumber} before generating this test.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
