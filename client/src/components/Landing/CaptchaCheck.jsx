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
            width: '44px',
            height: '44px',
            background: 'var(--ink)',
            color: 'var(--parchment)',
            border: '2px solid var(--ink)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}
        >
          <Bot size={22} color="var(--parchment)" />
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
          Quick Check
        </h3>
        <p style={{ color: 'rgba(28, 26, 23, 0.75)', fontSize: '0.82rem', marginBottom: '16px' }}>
          Solve this simple math problem to prove you're human:
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--parchment-card)',
              border: '2px solid var(--ink)',
              boxShadow: '2px 2px 0px var(--ink)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '14px'
            }}
          >
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
              {num1} + {num2} = ?
            </span>
            <button
              type="button"
              onClick={generateProblem}
              title="New problem"
              style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', display: 'flex' }}
            >
              <RotateCw size={15} />
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
              background: '#FFFFFF',
              border: error ? '2px solid var(--rust-clay)' : '2px solid var(--ink)',
              color: 'var(--ink)',
              fontSize: '1.05rem',
              textAlign: 'center',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              marginBottom: '14px',
              boxShadow: '2px 2px 0px var(--ink)'
            }}
          />

          {error && (
            <p style={{ color: 'var(--rust-clay)', fontSize: '0.78rem', marginBottom: '12px', fontWeight: 600 }}>
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
              className="btn"
              style={{
                flex: 1.5,
                padding: '10px',
                background: userAnswer.trim() ? 'var(--rust-clay)' : 'rgba(28, 26, 23, 0.2)',
                color: '#FFFFFF',
                border: '2px solid var(--ink)',
                boxShadow: userAnswer.trim() ? '3px 3px 0px var(--ink)' : 'none',
                cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                fontSize: '0.88rem'
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
