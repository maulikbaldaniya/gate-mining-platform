import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scheduleService } from '../services/scheduleService';
import { topicService } from '../services/topicService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import confetti from 'canvas-confetti';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';

export default function DayDetails() {
  const { dayNumber } = useParams();
  const { user, refreshUser } = useAuth();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [settingDay, setSettingDay] = useState(false);

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

  useEffect(() => {
    setLoading(true);
    loadDay();
  }, [dayNumber]);

  const handleSetCurrentDay = async () => {
    setSettingDay(true);
    try {
      await scheduleService.setCurrentDay(day.day_number);
      await refreshUser();
      await loadDay();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update current day');
    } finally {
      setSettingDay(false);
    }
  };

  const handleMarkTopicCompleted = async (topicId) => {
    setUpdatingTopicId(topicId);
    try {
      await topicService.markCompleted(topicId);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      await loadDay();
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark topic as completed');
    } finally {
      setUpdatingTopicId(null);
    }
  };

  if (loading) return <LoadingSpinner message={`Loading Day ${dayNumber} topics & backlog check...`} />;
  if (!day) return <div className="page-wrapper">Day {dayNumber} not found.</div>;

  const percent = day.total_topics > 0 ? Math.round((day.completed_topics / day.total_topics) * 100) : 0;
  const isCurrentDay = (user?.current_day || 1) === Number(day.day_number);

  return (
    <div className="page-wrapper">
      {/* Header Navigation & Title */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/schedule" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          ← Back to 120-Day Roadmap
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: isCurrentDay ? 'var(--accent-gold)' : 'rgba(59, 130, 246, 0.2)',
                color: isCurrentDay ? '#000' : '#60a5fa',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)'
              }}>
                DAY {day.day_number} {isCurrentDay ? '(Active Today)' : ''}
              </span>
              {day.is_completed && (
                <span className="badge badge-completed">
                  <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                  Day Completed
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.85rem', marginTop: '6px' }}>{day.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              {day.description}
            </p>
          </div>

          {!isCurrentDay && (
            <button
              onClick={handleSetCurrentDay}
              disabled={settingDay}
              className="btn btn-secondary"
              title="Set this day as your current active study target"
            >
              <CalendarDays size={16} />
              <span>{settingDay ? 'Updating...' : `Set as My Active Day`}</span>
            </button>
          )}
        </div>
      </div>

      {/* BACKLOG ALERT SECTION: If earlier days have incomplete topics */}
      {day.backlog && day.backlog.length > 0 && (
        <div
          className="glass-card"
          style={{
            marginBottom: '28px',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.04))',
            padding: '22px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#f59e0b', fontWeight: 700 }}>
                Pending Backlog from Previous Days ({day.backlog.length} Topics Incomplete)
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                તમારા Day 1 થી અગાઉના દિવસોના અમુક ટોપિક્સ હજુ બાકી છે. સાતત્ય જાળવવા માટે પહેલા આ ટોપિક્સ પૂર્ણ કરો:
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {day.backlog.map((bt) => (
              <div
                key={bt.topic_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24'
                  }}>
                    DAY {bt.day_number}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{bt.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {bt.subject} • Est. {bt.estimated_minutes} mins
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${bt.status === 'LEARNING' ? 'badge-learning' : 'badge-not-started'}`}>
                    {bt.status === 'LEARNING' ? 'In Progress' : 'Pending'}
                  </span>
                  <button
                    onClick={() => handleMarkTopicCompleted(bt.topic_id)}
                    disabled={updatingTopicId === bt.topic_id}
                    className="btn btn-secondary btn-sm"
                    title="Mark as completed directly"
                  >
                    <Check size={14} />
                    <span>Done</span>
                  </button>
                  <Link to={`/topic/${bt.topic_id}`} className="btn btn-primary btn-sm">
                    <span>Study Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              gap: '16px',
              borderLeft: topic.status === 'COMPLETED' ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-blue)'
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
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Best Score: {topic.best_score}%</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {topic.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleMarkTopicCompleted(topic.id)}
                  disabled={updatingTopicId === topic.id}
                  className="btn btn-secondary btn-sm"
                  title="Mark topic as completed without quiz"
                >
                  <Check size={14} />
                  <span>{updatingTopicId === topic.id ? 'Marking...' : 'Mark Completed'}</span>
                </button>
              )}
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
