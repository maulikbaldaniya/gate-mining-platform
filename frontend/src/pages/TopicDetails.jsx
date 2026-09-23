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
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import MiningDiagram from '../components/common/MiningDiagram';

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

  const [markingCompleted, setMarkingCompleted] = useState(false);

  const handleMarkCompleted = async () => {
    setMarkingCompleted(true);
    try {
      await topicService.markCompleted(topic.id);
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
      setTopic((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          status: 'COMPLETED',
          best_score: Math.max(prev.progress?.best_score || 0, 85),
        },
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark topic as completed');
    } finally {
      setMarkingCompleted(false);
    }
  };

function resolveDiagram(topic, section) {
  if (!topic || !section) return null;

  if (section.diagram_type) {
    return {
      type: section.diagram_type,
      caption: section.diagram_caption || `${topic.name} Engineering Diagram`,
    };
  }

  const raw = section.content_text || '';
  const match = raw.match(/\[DIAGRAM:\s*([A-Z_]+)(?:\|([^\]]+))?\]/);
  if (match) {
    return {
      type: match[1],
      caption: match[2] || `${topic.name} Engineering Diagram`,
    };
  }

  const name = (topic.name || '').toLowerCase();
  const lvl = section.level_number;

  // 1. Blast Design, Burden, Spacing, Flyrock, Underwater
  if (name.includes('blast') || name.includes('drilling') || name.includes('explosive')) {
    if (name.includes('underwater')) {
      if (lvl >= 3) return { type: 'UNDERWATER_BLASTING_TREE', caption: 'Underwater Rock Blasting: Explosive & Non-Electric Detonator Decision Tree (GATE 2026 Q47)' };
    }
    if (lvl === 3 || lvl === 4 || lvl === 5) {
      return { type: 'BLAST_GEOMETRY', caption: 'Bench Blast Hole Geometry: Burden (B), Spacing (S), Stemming (T), Subgrade (J), Bench Height (H)' };
    }
  }

  // 2. Cut Patterns, Drivage, Heading, Tunnels
  if (name.includes('cut') || name.includes('drivage') || name.includes('tunneling') || name.includes('heading')) {
    if (lvl === 3 || lvl === 4 || lvl === 6) {
      return { type: 'CUT_PATTERNS', caption: 'Underground Cut Patterns: Pyramid Cut (GATE 2023) vs Burn Cut (GATE 2016)' };
    }
  }

  // 3. Mohr-Coulomb, Triaxial, Pore pressure
  if (name.includes('mohr') || name.includes('triaxial') || name.includes('failure criteria') || name.includes('shear strength')) {
    if (lvl === 3 || lvl === 4 || lvl === 5) {
      return { type: 'MOHR_CIRCLE', caption: "Mohr's Circle of Stress & Saturated Pore Pressure (p) Shift to Failure Envelope (GATE 2022 Q24)" };
    }
  }

  // 4. Kirsch Stresses, In-situ stress ratio k, Circular Tunnel
  if (name.includes('kirsch') || name.includes('in-situ') || name.includes('tangential stress') || (name.includes('stress') && name.includes('tunnel'))) {
    if (lvl === 3 || lvl === 4 || lvl === 6) {
      return { type: 'KIRSCH_STRESS', caption: 'Kirsch Tangential Stress Distribution around Circular Tunnel in Biaxial Stress Field (GATE 2022-2024)' };
    }
  }

  // 5. Slope Stability, Planar failure, Bench geometry
  if (name.includes('slope') || name.includes('bench') || name.includes('pit') || name.includes('rock bolt')) {
    if (name.includes('overall') || name.includes('pit slope')) {
      if (lvl >= 3) return { type: 'BENCH_PIT_GEOMETRY', caption: 'Multilevel Pit Slope Geometry & Overall Angle α Calculation (GATE 2025 Q24)' };
    }
    if (lvl === 3 || lvl === 4 || lvl === 5) {
      return { type: 'SLOPE_PLANAR_FAILURE', caption: 'Opencast Bench Planar Sliding Failure with Water-Filled Tension Crack & Rock Bolt (GATE 2012-2019)' };
    }
  }

  // 6. Hydraulic prop, Support, Strata
  if (name.includes('support') || name.includes('hydraulic prop') || name.includes('strata') || name.includes('ground control')) {
    if (lvl === 3 || lvl === 4 || lvl === 7) {
      return { type: 'HYDRAULIC_PROP_CURVE', caption: 'Hydraulic Prop Load-Deformation Yield Curve vs Friction / Brittle Props (GATE 2026 Q99)' };
    }
  }

  // 7. Evasee duct, Ventilation exhaust fan
  if (name.includes('evasee') || name.includes('exhaust') || name.includes('fan pressure')) {
    if (lvl === 3 || lvl === 4 || lvl === 5) {
      return { type: 'EVASEE_DUCT', caption: 'Diverging Evasee Duct fitted to Exhaust Fan: Velocity Head to Static Pressure Regain (GATE 2023 & 2026)' };
    }
  }

  // 8. Ventilation split, Booster fan, Airflow network
  if (name.includes('ventilation') || name.includes('split') || name.includes('airflow') || name.includes('atkinson')) {
    if (lvl === 3 || lvl === 4 || lvl === 6) {
      return { type: 'VENTILATION_SPLIT', caption: 'Parallel Mine Ventilation Network: District A & B with Booster Fan Equalization (GATE 2023 & 2026)' };
    }
  }

  // 9. Semi-variogram, Geostatistics, Kriging
  if (name.includes('variogram') || name.includes('geostat') || name.includes('kriging')) {
    if (lvl === 3 || lvl === 4 || lvl === 5) {
      return { type: 'VARIOGRAM_MODELS', caption: 'Semi-Variogram Models: Spherical, Exponential, Gaussian, Pure Nugget (Nugget C0, Sill C, Range a)' };
    }
  }

  // 10. Mineral Sampling, Borehole, Polygon Voronoi area
  if (name.includes('sampling') || name.includes('grade') || name.includes('reserve') || name.includes('polygon') || name.includes('borehole')) {
    if (lvl === 3 || lvl === 4 || lvl === 6) {
      return { type: 'POLYGON_AREA', caption: 'Area-of-Influence Polygon Method for Borehole Core Grade Weighting (GATE 2026 Q47)' };
    }
  }

  return null;
}

  if (loading) return <LoadingSpinner message="Loading topic modules & structured lessons..." />;
  if (!topic) return <div className="page-wrapper">Topic not found.</div>;

  const currentSection = lesson?.sections?.find((s) => s.level_number === activeLevel) || lesson?.sections?.[0];
  const isCompleted = topic.progress?.status === 'COMPLETED';

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
              <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-learning'}`}>
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!isCompleted ? (
              <button
                onClick={handleMarkCompleted}
                disabled={markingCompleted}
                className="btn btn-secondary"
                title="Mark this lesson completed and update schedule progress"
              >
                <CheckCircle2 size={18} color="#10b981" />
                <span>{markingCompleted ? 'Updating...' : 'Mark as Completed'}</span>
              </button>
            ) : (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#10b981',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <CheckCircle2 size={16} /> Completed ✓
              </span>
            )}

            <Link to={`/topic/${topic.id}/quiz`} className="btn btn-accent">
              <HelpCircle size={18} />
              <span>Start 10-MCQ Mastery Quiz</span>
              <ArrowRight size={16} />
            </Link>
          </div>
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
          {lesson?.sections?.map((sec) => {
            const hasDiag = resolveDiagram(topic, sec);
            return (
              <button
                key={sec.level_number}
                onClick={() => setActiveLevel(sec.level_number)}
                className={`level-tab-btn ${activeLevel === sec.level_number ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Level {sec.level_number}: {sec.title.split(':')[1] || sec.title}</span>
                {hasDiag && (
                  <span title="આ સ્તરમાં ઈજનેરી આકૃતિ છે" style={{ fontSize: '0.75rem' }}>📐</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section Content Display */}
        {currentSection ? (
          <div className="lesson-section-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-blue)', margin: 0, fontWeight: 700 }}>
                {currentSection.title}
              </h3>
              {resolveDiagram(topic, currentSection) && (
                <span className="badge badge-completed" style={{ fontSize: '0.76rem', gap: '5px' }}>
                  <ImageIcon size={13} />
                  ઈજનેરી આકૃતિ (Engineering Diagram Active)
                </span>
              )}
            </div>

            {/* Display Diagram if resolved */}
            {resolveDiagram(topic, currentSection) && (
              <MiningDiagram
                type={resolveDiagram(topic, currentSection).type}
                caption={resolveDiagram(topic, currentSection).caption}
              />
            )}

            <p style={{ color: 'var(--text-main)', lineHeight: 1.85, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
              {(currentSection.content_text || '').replace(/\[DIAGRAM:[^\]]+\]/g, '').trim()}
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isCompleted && (
            <button
              onClick={handleMarkCompleted}
              disabled={markingCompleted}
              className="btn btn-secondary"
            >
              <CheckCircle2 size={18} color="#10b981" />
              <span>{markingCompleted ? 'Updating...' : 'Mark as Completed'}</span>
            </button>
          )}
          <Link to={`/topic/${topic.id}/quiz`} className="btn btn-primary">
            <span>Attempt 10 MCQs Now</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
