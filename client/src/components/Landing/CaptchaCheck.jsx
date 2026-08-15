import React, { useState, useEffect } from 'react';
import { Bot, RotateCw } from 'lucide-react';

export const CaptchaCheck = ({ isOpen, onVerified, onCancel }) => {
  const [num1, setNum1] = useState(3);
  const [num2, setNum2] = useState(4);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  const generateProblem = () => {
    const n1 = Math.floor(Math.random() * 7) + 2;
    const n2 = Math.floor(Math.random() * 6) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setError(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateProblem();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(userAnswer, 10) === num1 + num2) {
      onVerified();
    } else {
      setError(true);
      generateProblem();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--purple-bg)',
            color: 'var(--purple)',
            border: '2px solid var(--purple)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}
        >
          <Bot size={24} color="var(--purple)" />
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          Human Verification
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '16px' }}>
          Solve this simple math problem to prove you're human:
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--bg-surface-muted)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '14px'
            }}
          >
            <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {num1} + {num2} = ?
            </span>
            <button
              type="button"
              onClick={generateProblem}
              title="New problem"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
              aria-label="Generate new problem"
            >
              <RotateCw size={16} />
            </button>
          </div>

          <input
            type="number"
            autoFocus
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter answer..."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              border: error ? '2px solid var(--accent)' : '2px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '1.1rem',
              textAlign: 'center',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          />

          {error && (
            <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>
              Incorrect answer. Please try again!
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-subtle"
              style={{ flex: 1, padding: '10px' }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="btn btn-primary"
              style={{
                flex: 1.5,
                padding: '10px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CaptchaCheck;
