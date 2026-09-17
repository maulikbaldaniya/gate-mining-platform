import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Award,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function TopicQuiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const list = await quizService.getTopicQuiz(topicId);
        setQuestions(list);
      } catch (err) {
        console.error('Failed to load topic quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [topicId]);

  // Timer tick
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optionKey) => {
    const q = questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [q.id]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id] || '',
        timeSpentSeconds: 15,
      }));

      const res = await quizService.submitQuiz(topicId, answersPayload, secondsElapsed);
      setResult(res);

      // Trigger celebration if >= 80%
      if (res.accuracy >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert(err.response?.data?.message || 'Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating your 10-MCQ topic mastery quiz..." />;
  if (questions.length === 0) return <div className="page-wrapper">No questions available for this topic.</div>;

  const currentQ = questions[currentIndex];

  // -------------------------------------------------------------
  // RESULTS VIEW AFTER SUBMISSION
  // -------------------------------------------------------------
  if (result) {
    const isCompleted = result.topicStatus === 'COMPLETED';

    return (
      <div className="page-wrapper">
        <div className="glass-card" style={{ textAlign: 'center', padding: '36px', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isCompleted ? '#34d399' : '#f87171',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: isCompleted ? '0 0 25px rgba(16, 185, 129, 0.3)' : '0 0 25px rgba(239, 68, 68, 0.3)'
          }}>
            <Award size={36} />
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            {isCompleted ? 'Topic Mastery Achieved!' : 'Keep Practicing!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 24px' }}>
            {isCompleted
              ? 'Congratulations! You achieved the required mastery score (≥80%). This topic is now marked COMPLETED and scheduled for spaced revision.'
              : 'Accuracy is below 80%. Incorrect questions have been automatically logged to your Mistake Book for targeted revision.'}
          </p>

          {/* Result Metric Grid */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{result.score} / {result.totalQuestions}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isCompleted ? 'var(--accent-emerald)' : 'var(--accent-ruby)' }}>{result.accuracy}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{formatTimer(result.durationSeconds)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Taken</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{result.topicStatus}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Topic Status</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/mistakes" className="btn btn-secondary">
              <AlertTriangle size={16} />
              <span>Review in Mistake Book</span>
            </Link>
            <Link to="/dashboard" className="btn btn-primary">
              <span>Continue 120-Day Plan</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Question-by-Question Detailed Explanations */}
        <h2 style={{ fontSize: '1.35rem', marginBottom: '18px' }}>Detailed Answer Explanations</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result.reviewedQuestions.map((rq, idx) => (
            <div
              key={rq.id}
              className="glass-card"
              style={{
                borderLeft: rq.is_correct ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-ruby)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Question {idx + 1}
                </span>
                <span className={`badge ${rq.is_correct ? 'badge-completed' : 'badge-weak'}`}>
                  {rq.is_correct ? 'Correct' : rq.is_skipped ? 'Skipped' : 'Incorrect'}
                </span>
              </div>

              <p style={{ fontSize: '1.02rem', fontWeight: 600, marginBottom: '16px' }}>
                {rq.question_text}
              </p>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Your Answer: </span>
                  <span style={{ fontWeight: 700, color: rq.is_correct ? '#34d399' : '#f87171' }}>
                    Option {rq.user_answer}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Correct Answer: </span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>
                    Option {rq.correct_answer}
                  </span>
                </div>
              </div>

              {/* Comprehensive Structured Explanation Box */}
              {rq.explanation && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.9rem',
                }}>
                  {rq.explanation.concept && (
                    <div>
                      <strong style={{ color: 'var(--accent-gold)' }}>Concept Tested: </strong>
                      <span>{rq.explanation.concept}</span>
                    </div>
                  )}
                  {rq.explanation.why_correct && (
                    <div>
                      <strong style={{ color: '#34d399' }}>Why Correct: </strong>
                      <span>{rq.explanation.why_correct}</span>
                    </div>
                  )}
                  {rq.explanation.why_wrong && !rq.is_correct && (
                    <div>
                      <strong style={{ color: '#f87171' }}>Why Selected Option Was Wrong: </strong>
                      <span>{rq.explanation.why_wrong}</span>
                    </div>
                  )}
                  {rq.explanation.formula && (
                    <div className="formula-box" style={{ margin: '8px 0', fontSize: '0.92rem' }}>
                      <strong>Formula: </strong> {rq.explanation.formula}
                    </div>
                  )}
                  {rq.explanation.common_mistake && (
                    <div>
                      <strong style={{ color: '#fbbf24' }}>Common Mistake: </strong>
                      <span>{rq.explanation.common_mistake}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE QUIZ RUNNER VIEW
  // -------------------------------------------------------------
  const selectedForCurrent = selectedAnswers[currentQ.id];

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px' }}>
      {/* Top Controls: Timer & Question Index */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="badge badge-learning" style={{ fontSize: '0.7rem' }}>
            {currentQ.difficulty || 'MEDIUM'}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--accent-gold)',
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <Clock size={16} />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', lineHeight: 1.5, marginBottom: '24px' }}>
          {currentQ.question_text}
        </h2>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options?.map((opt) => {
            const isSelected = selectedForCurrent === opt.option_key;
            return (
              <button
                key={opt.id || opt.option_key}
                type="button"
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(opt.option_key)}
              >
                <div className="option-indicator">{opt.option_key}</div>
                <div style={{ flex: 1 }}>{opt.option_text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation & Submit Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="btn btn-primary"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-accent"
            >
              <CheckCircle2 size={18} />
              <span>{submitting ? 'Submitting & Evaluating...' : 'Submit 10 MCQs'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
