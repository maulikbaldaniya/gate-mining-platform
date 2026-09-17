import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { testService } from '../services/testService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, Award, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TestSession() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(1800); // 30 mins

  useEffect(() => {
    async function start() {
      try {
        const data = await testService.startWeeklyTest(testId);
        setSession(data);
        if (data.time_limit_minutes) {
          setRemainingSeconds(data.time_limit_minutes * 60);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error starting test');
        navigate('/tests/weekly');
      } finally {
        setLoading(false);
      }
    }
    start();
  }, [testId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (result || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result, remainingSeconds]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (optKey) => {
    const q = session.questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [q.id]: optKey,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answersPayload = session.questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] || '',
        timeSpentSeconds: 30,
      }));

      const res = await testService.submitWeeklyTest(testId, answersPayload);
      setResult(res);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Starting timed test session..." />;
  if (!session || !session.questions || session.questions.length === 0) {
    return <div className="page-wrapper">Test session not available.</div>;
  }

  // -------------------------------------------------------------
  // TEST RESULT VIEW
  // -------------------------------------------------------------
  if (result) {
    return (
      <div className="page-wrapper">
        <div className="glass-card" style={{ textAlign: 'center', padding: '36px', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Award size={36} />
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Weekly Test Results</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Authoritative evaluation based on official GATE evaluation keys.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{result.score} / {result.totalQuestions}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: result.accuracy >= 70 ? 'var(--accent-emerald)' : 'var(--accent-ruby)' }}>{result.accuracy}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{result.correctCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-ruby)' }}>{result.wrongCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wrong</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <Link to="/mistakes" className="btn btn-secondary">
              <AlertTriangle size={16} />
              <span>Review In Mistake Book</span>
            </Link>
            <Link to="/tests/weekly" className="btn btn-primary">
              <span>Return to Weekly Tests</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE TEST RUNNER
  // -------------------------------------------------------------
  const currentQ = session.questions[currentIndex];
  const selectedForCurrent = answers[currentQ.id];

  return (
    <div className="page-wrapper" style={{ maxWidth: '880px' }}>
      {/* Top Header with Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.15rem' }}>{session.title}</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {session.questions.length}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: remainingSeconds < 300 ? '#ef4444' : 'var(--accent-gold)',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-sm)',
          border: remainingSeconds < 300 ? '1px solid #ef4444' : '1px solid var(--border-subtle)'
        }}>
          <Clock size={18} />
          <span>{formatTimer(remainingSeconds)}</span>
        </div>
      </div>

      {/* Question Palette Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '20px',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '12px',
        borderRadius: 'var(--radius-md)'
      }}>
        {session.questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: isCurrent
                  ? 'var(--accent-blue)'
                  : isAnswered
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: isCurrent ? '#fff' : isAnswered ? '#34d399' : 'var(--text-muted)',
                border: isCurrent
                  ? '1px solid #60a5fa'
                  : isAnswered
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '24px' }}>
          {currentQ.question_text}
        </h3>

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
                <div>{opt.option_text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
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
          {currentIndex < session.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(session.questions.length - 1, prev + 1))}
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
              <span>{submitting ? 'Submitting...' : 'Submit Test'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
