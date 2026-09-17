import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../services/progressService';
import StatsCard from '../components/common/StatsCard';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  CalendarDays,
  Target,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  RotateCw,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const summary = await progressService.getDashboard();
        setData(summary);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating your 120-Day progress..." />;
  if (!data) return <div className="page-wrapper">Failed to load dashboard data.</div>;

  const { today, overall, user } = data;

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>
            Welcome back, <span style={{ color: 'var(--accent-gold)' }}>{user.name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Target: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.target_exam}</span> • Consistent daily progress builds rank!
          </p>
        </div>

        <Link to={`/day/${today.day_number}`} className="btn btn-primary">
          <CalendarDays size={18} />
          Go to Day {today.day_number} Plan
        </Link>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        <StatsCard
          title="Current Schedule"
          value={`Day ${today.day_number} / 120`}
          subtitle={`Week ${Math.ceil(today.day_number / 7)} Active`}
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="Overall Syllabus"
          value={`${overall.syllabus_percent}%`}
          subtitle={`${overall.completed_topics} of ${overall.total_topics} topics completed`}
          icon={Target}
          color="emerald"
        />
        <StatsCard
          title="Average Accuracy"
          value={`${overall.average_accuracy}%`}
          subtitle={`${overall.mcqs_solved} MCQs & PYQs evaluated`}
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Current Streak"
          value={`${overall.streak.current} Days`}
          subtitle={`Best: ${overall.streak.longest} consecutive days`}
          icon={Flame}
          color="gold"
        />
      </div>

      {/* Main Grid: Today's Tasks vs Status Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Left: Today's Curriculum Progress */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <span className="badge badge-learning" style={{ marginBottom: '8px' }}>
                Today's Curriculum
              </span>
              <h2 style={{ fontSize: '1.35rem' }}>{today.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                {today.description}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {today.completed_count} / {today.total_count}
              </span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Topics Done</div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <ProgressBar percent={today.progress_percent} variant={today.is_day_completed ? 'emerald' : 'blue'} height={10} />
          </div>

          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Today's Scheduled Topics:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {today.topics.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {t.is_completed ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <Clock size={20} color="#94a3b8" />
                  )}
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{t.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Est. {t.estimated_minutes} mins • 10 MCQs
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${t.is_completed ? 'badge-completed' : 'badge-not-started'}`}>
                    {t.status}
                  </span>
                  <Link to={`/topic/${t.id}`} className="btn btn-secondary btn-sm">
                    Study
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Spaced Revision Alert Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <RotateCw size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem' }}>Today's Spaced Revision</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              {overall.revision_due_count > 0
                ? `You have ${overall.revision_due_count} topics due for spaced retention review today.`
                : 'All caught up on revision! Great consistency.'}
            </p>
            <Link to="/revision" className="btn btn-accent btn-sm" style={{ width: '100%' }}>
              Open Revision Queue ({overall.revision_due_count})
            </Link>
          </div>

          {/* Weekly Test Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <FileCheck size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.1rem' }}>Weekly Test Engine</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Automated test for Week {overall.weekly_test.week_number} composed exclusively of your completed topics.
            </p>
            <Link to="/tests/weekly" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              {overall.weekly_test.is_submitted ? 'View Test Result' : 'Take Weekly Test'}
            </Link>
          </div>

          {/* Weak Topics Card */}
          {overall.weak_topics_count > 0 && (
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-ruby)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <AlertCircle size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.1rem' }}>Weak Topic Alert</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '12px' }}>
                {overall.weak_topics_count} topics scored below 60% accuracy.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {overall.weak_topics.map((wt) => (
                  <Link
                    key={wt.id}
                    to={`/topic/${wt.id}`}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#f87171',
                      fontSize: '0.82rem',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{wt.name}</span>
                    <span>{wt.best_score}%</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
