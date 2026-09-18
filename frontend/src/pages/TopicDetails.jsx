import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topicService } from '../services/topicService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function TopicDetails() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [activeLevel, setActiveLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [topicData, lessonData] = await Promise.all([
          topicService.getTopic(topicId),
          topicService.getLesson(topicId),
        ]);
        setTopic(topicData);
        setLesson(lessonData);
      } catch (err) {
        console.error('Failed to load topic details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [topicId]);

  if (loading) return <LoadingSpinner message="Loading topic modules & structured lessons..." />;
  if (!topic) return <div className="page-wrapper">Topic not found.</div>;

  const currentSection = lesson?.sections?.find((s) => s.level_number === activeLevel) || lesson?.sections?.[0];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/schedule">Roadmap</Link>
          <span>/</span>
          <span>{topic.subject ? topic.subject.name : 'Mining Engineering'}</span>
          <span>/</span>
          <span>{topic.chapter ? topic.chapter.name : 'Chapter'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem' }}>{topic.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span className={`badge ${topic.progress?.status === 'COMPLETED' ? 'badge-completed' : 'badge-learning'}`}>
                {topic.progress?.status || 'NOT_STARTED'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Est. {topic.estimated_minutes} mins
              </span>
              {topic.progress?.best_score > 0 && (
                <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                  Best Score: {topic.progress.best_score}%
                </span>
              )}
            </div>
          </div>

          <Link to={`/topic/${topic.id}/quiz`} className="btn btn-accent">
            <HelpCircle size={18} />
            <span>Start 10-MCQ Mastery Quiz</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 8-Level Tabs */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            8-Level Structured Learning Progression
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
            ગુજરાતી Concept + English Technical Precision
          </span>
        </div>

        <div className="level-tabs">
          {lesson?.sections?.map((sec) => (
            <button
              key={sec.level_number}
              onClick={() => setActiveLevel(sec.level_number)}
              className={`level-tab-btn ${activeLevel === sec.level_number ? 'active' : ''}`}
            >
              Level {sec.level_number}: {sec.title.split(':')[1] || sec.title}
            </button>
          ))}
        </div>

        {/* Section Content Display */}
        {currentSection ? (
          <div className="lesson-section-content">
            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-blue)', marginBottom: '16px', fontWeight: 700 }}>
              {currentSection.title}
            </h3>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.85, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
              {currentSection.content_text}
            </p>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No content available for this level.</p>
        )}
      </div>

      {/* Action Footer Callout */}
      <div className="glass-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-card)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Ready for Evaluation?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Score ≥ 80% on the 10-question quiz to mark this topic COMPLETED and trigger the 120-day progression.
          </p>
        </div>

        <Link to={`/topic/${topic.id}/quiz`} className="btn btn-primary">
          <span>Attempt 10 MCQs Now</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
