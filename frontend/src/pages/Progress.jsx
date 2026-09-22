import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../services/progressService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import StatsCard from '../components/common/StatsCard';
import {
  TrendingUp,
  BookOpen,
  AlertCircle,
  Award,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  CalendarDays,
  Check
} from 'lucide-react';

export default function Progress() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await progressService.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load comprehensive analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating syllabus completion & advanced analytics..." />;
  if (!analytics) return <div className="page-wrapper">Failed to load analytics data.</div>;

  const { overview, backlog, question_stats, mistake_breakdown, subjects, recent_activity } = analytics;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-completed">
            {overview.readiness_level}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
            {overview.projected_rank}
          </span>
        </div>
        <h1 style={{ fontSize: '1.95rem', marginBottom: '6px' }}>Syllabus Completion & Performance Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Detailed 120-Day progress tracking, backlog monitoring, MCQ accuracy curves, and subject mastery breakdown.
        </p>
      </div>

      {/* Top 4 Key Performance Indicators (KPIs) */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        <StatsCard
          title="Syllabus Completion"
          value={`${overview.syllabus_percent}%`}
          subtitle={`${overview.completed_topics} of ${overview.total_topics} topics completed`}
          icon={Target}
          color="emerald"
        />
        <StatsCard
          title="Total Study Time"
          value={`${overview.study_hours} Hours`}
          subtitle={`${overview.study_minutes} mins estimated study`}
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Average Accuracy"
          value={`${overview.average_accuracy}%`}
          subtitle={`${overview.mcqs_solved} questions attempted`}
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Exam Readiness Score"
          value={`${overview.exam_readiness_score} / 100`}
          subtitle={`${overview.streak?.current || 1}-Day Active Streak`}
          icon={Flame}
          color="gold"
        />
      </div>

      {/* 120-DAY SCHEDULE VELOCITY & BACKLOG TRACKER */}
      <div
        className="glass-card"
        style={{
          marginBottom: '28px',
          borderLeft: backlog.count > 0 ? '4px solid #f59e0b' : '4px solid var(--accent-emerald)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: backlog.count > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: backlog.count > 0 ? '#f59e0b' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {backlog.count > 0 ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                120-Day Schedule Velocity: {backlog.count > 0 ? 'Behind Schedule (Backlog Pending)' : 'On Track (પરફેક્ટ પ્રગતિ)'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                Active Target: Day {backlog.current_day} of 120 • {backlog.count} topic(s) pending from earlier days
              </p>
            </div>
          </div>

          <Link to="/schedule" className="btn btn-secondary btn-sm">
            <CalendarDays size={16} />
            <span>Open 120-Day Roadmap</span>
          </Link>
        </div>

        {/* If backlog exists, show the list with 1-click catchup */}
        {backlog.count > 0 ? (
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
              ⚠️ નીચેના ટોપિક્સ અગાઉના દિવસોના બાકી છે. સાતત્ય જાળવવા માટે વહેલી તકે પૂર્ણ કરો:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {backlog.topics.map((bt) => (
                <div
                  key={bt.topic_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>
                        DAY {bt.day_number}
                      </span>
                      <span className={`badge ${bt.status === 'LEARNING' ? 'badge-learning' : 'badge-not-started'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {bt.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '3px' }}>{bt.name}</h4>
                  </div>
                  <Link to={`/topic/${bt.topic_id}`} className="btn btn-primary btn-sm">
                    Catch Up
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            fontSize: '0.88rem'
          }}>
            ✓ No backlogs! All topics assigned to previous study days have been completed successfully. Keep up the momentum!
          </div>
        )}
      </div>

      {/* Two-Column Grid: Question Accuracy & Mistake Book Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Left: Question Accuracy Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Question Evaluation Breakdown</h3>
            <span className="badge badge-learning">
              {question_stats.accuracy}% Accuracy
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {question_stats.total}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Attempted</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                {question_stats.correct}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Correct</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>
                {question_stats.wrong}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Incorrect</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span>Target Accuracy Threshold: 80%</span>
              <span style={{ fontWeight: 600 }}>{question_stats.accuracy}%</span>
            </div>
            <ProgressBar percent={question_stats.accuracy} variant={question_stats.accuracy >= 80 ? 'emerald' : 'blue'} height={8} />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Note: GATE Mining negative marking is -0.33 for 1-mark and -0.66 for 2-mark questions. Maintain ≥80% accuracy to ensure top rank.
          </p>
        </div>

        {/* Right: Mistake Categorization */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Mistake Book Diagnostics</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {mistake_breakdown.unresolved} unresolved / {mistake_breakdown.total} total logged
              </span>
            </div>
            <Link to="/mistakes" className="btn btn-secondary btn-sm">
              Open Mistake Book
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>M1: Concept Gap</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mistake_breakdown.categories.M1}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>M2: Calculation Error</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mistake_breakdown.categories.M2}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>M3: Question Misread</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mistake_breakdown.categories.M3}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>M4: Formula Forgotten</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mistake_breakdown.categories.M4}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(236, 72, 153, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#f472b6', fontWeight: 600 }}>M5: Time Trap</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mistake_breakdown.categories.M5}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(20, 184, 166, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 600 }}>M6: Unit Conversion</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{mistake_breakdown.categories.M6}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Mastery Grid */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '18px' }}>Technical Subject Mastery Curves</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {subjects.map((s) => (
          <div key={s.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  SECTION {s.id} • {s.code}
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
                  Accuracy: {s.average_accuracy}%
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

      {/* Recent Activity Stream */}
      {recent_activity && recent_activity.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Recent Question Practice Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recent_activity.map((ra) => (
              <div
                key={ra.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {ra.is_correct ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#ef4444" />
                  )}
                  <span>{ra.type} Question Attempt #{ra.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <span>{ra.time_spent}s spent</span>
                  <span>{new Date(ra.date).toLocaleDateString()}</span>
                  <span className={`badge ${ra.is_correct ? 'badge-completed' : 'badge-weak'}`}>
                    {ra.is_correct ? 'Correct' : 'Wrong'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
