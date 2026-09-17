import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scheduleService } from '../services/scheduleService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';

export default function DayDetails() {
  const { dayNumber } = useParams();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDay() {
      try {
        const data = await scheduleService.getDayDetails(dayNumber);
        setDay(data);
      } catch (err) {
        console.error('Failed to load day details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDay();
  }, [dayNumber]);

  if (loading) return <LoadingSpinner message={`Loading Day ${dayNumber} topics...`} />;
  if (!day) return <div className="page-wrapper">Day {dayNumber} not found.</div>;

  const percent = day.total_topics > 0 ? Math.round((day.completed_topics / day.total_topics) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/schedule" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          ← Back to 120-Day Roadmap
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <span style={{
            background: 'var(--accent-gold)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)'
          }}>
            DAY {day.day_number}
          </span>
          <h1 style={{ fontSize: '1.85rem' }}>{day.title}</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
          {day.description}
        </p>
      </div>

      {/* Progress Header Card */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Day Progress</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {day.completed_topics} of {day.total_topics} topics completed
            </span>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: day.is_completed ? '#34d399' : '#60a5fa' }}>
            {percent}%
          </span>
        </div>
        <ProgressBar percent={percent} variant={day.is_completed ? 'emerald' : 'blue'} height={10} />
      </div>

      {/* Topic Cards List */}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Topics for Today</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {day.topics.map((topic, index) => (
          <div
            key={topic.id}
            className="glass-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--accent-gold)'
              }}>
                {index + 1}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    {topic.subject}
                  </span>
                  <span className={`badge ${topic.status === 'COMPLETED' ? 'badge-completed' : 'badge-not-started'}`}>
                    {topic.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem' }}>{topic.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Est. {topic.estimated_minutes} mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={14} /> 10-MCQ Mastery Quiz
                  </span>
                  {topic.best_score > 0 && (
                    <span>Best Score: {topic.best_score}%</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/topic/${topic.id}`} className="btn btn-primary">
                <BookOpen size={16} />
                <span>Open Topic</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
