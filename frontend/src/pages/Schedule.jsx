import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scheduleService } from '../services/scheduleService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import { CalendarDays, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const data = await scheduleService.getSchedule();
        setSchedule(data);
      } catch (err) {
        console.error('Failed to load schedule:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  if (loading) return <LoadingSpinner message="Loading 120-Day curriculum roadmap..." />;

  // Group days by week (1 to 18)
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  const daysInWeek = schedule.filter((d) => d.week_number === selectedWeek);

  const totalDaysCompleted = schedule.filter((d) => d.is_completed).length;

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>120-Day Master Study Roadmap</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Official GATE Mining Engineering syllabus structured for total concept retention and exam mastery.
          </p>
        </div>

        <div style={{
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          color: '#60a5fa',
          fontWeight: 700
        }}>
          {totalDaysCompleted} / 120 Days Completed
        </div>
      </div>

      {/* Week Selector Pills */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '8px',
        paddingBottom: '14px',
        marginBottom: '24px',
        scrollbarWidth: 'thin'
      }}>
        {weeks.map((w) => {
          const weekDays = schedule.filter((d) => d.week_number === w);
          const isWeekDone = weekDays.length > 0 && weekDays.every((d) => d.is_completed);

          return (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: selectedWeek === w ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--bg-glass)',
                border: selectedWeek === w ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
                color: selectedWeek === w ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isWeekDone && <CheckCircle2 size={14} color="#34d399" />}
              <span>Week {w}</span>
            </button>
          );
        })}
      </div>

      {/* Days in Selected Week */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {daysInWeek.map((day) => {
          const percent = day.total_topics > 0 ? Math.round((day.completed_topics / day.total_topics) * 100) : 0;

          return (
            <div
              key={day.day_number}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: day.is_completed ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-blue)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      DAY {day.day_number}
                    </span>
                    <h3 style={{ fontSize: '1.2rem' }}>{day.title}</h3>
                    {day.is_completed && (
                      <span className="badge badge-completed">
                        Day Completed
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {day.description}
                  </p>
                </div>

                <Link to={`/day/${day.day_number}`} className="btn btn-secondary btn-sm">
                  <span>Open Day Plan</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Mini Topics List */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                {day.topics.map((t) => (
                  <Link
                    key={t.topic_id}
                    to={`/topic/${t.topic_id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: t.is_completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                      border: t.is_completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                      color: t.is_completed ? '#34d399' : 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {t.is_completed ? <CheckCircle2 size={14} color="#10b981" /> : <BookOpen size={14} color="#94a3b8" />}
                    <span>{t.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({t.estimated_minutes}m)</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
