import React, { useState } from 'react';
import { Flag, X, Send } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const REPORT_CATEGORIES = [
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Threats, abusive language, or persistent unwanted attention.' },
  { id: 'explicit', label: 'Inappropriate or Explicit Behavior', desc: 'Sexual harassment, unsolicited nudity, or explicit content.' },
  { id: 'hate_speech', label: 'Hate Speech or Discrimination', desc: 'Racism, homophobia, religious hatred, or slurs.' },
  { id: 'spam_bot', label: 'Spam, Phishing, or Bot', desc: 'Promoting scams, shady links, or automated repetitive messages.' },
  { id: 'underage', label: 'Suspected Underage User', desc: 'User appears or claims to be under 18.' },
  { id: 'other', label: 'Other Guidelines Violation', desc: 'Any other serious misconduct.' }
];

export const ReportModal = ({ isOpen, onClose }) => {
  const { reportStranger, currentMatch } = useSocket();
  const [selectedCategory, setSelectedCategory] = useState('harassment');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    reportStranger?.(selectedCategory, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose?.();
    }, 1500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--ink)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flag size={18} color="var(--rust-clay)" />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
              Report {currentMatch?.peerDisplayName || 'Stranger'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
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
                margin: '0 auto 12px auto',
                fontSize: '1.3rem'
              }}
            >
              ✓
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
              Report Received
            </h4>
            <p style={{ color: 'rgba(28, 26, 23, 0.75)', fontSize: '0.84rem' }}>
              Thank you for helping keep the community safe. A moderator will review recent messages.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.82rem', color: 'rgba(28, 26, 23, 0.75)', marginBottom: '12px' }}>
              Why are you reporting this person? Recent messages will be reviewed by moderators.
            </p>

            {/* Category selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
              {REPORT_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '8px 10px',
                    background: selectedCategory === cat.id ? 'var(--ink)' : 'var(--parchment-card)',
                    color: selectedCategory === cat.id ? 'var(--parchment)' : 'var(--ink)',
                    border: '1px solid var(--ink)',
                    boxShadow: selectedCategory === cat.id ? '2px 2px 0px var(--rust-clay)' : '1px 1px 0px var(--ink)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="report_cat"
                    value={cat.id}
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(cat.id)}
                    style={{ accentColor: 'var(--rust-clay)', marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: '0.74rem', opacity: 0.8 }}>
                      {cat.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Additional details */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                Additional Details (Optional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#FFFFFF',
                  border: '2px solid var(--ink)',
                  boxShadow: '2px 2px 0px var(--ink)',
                  color: 'var(--ink)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-subtle" style={{ flex: 1, padding: '10px' }} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                style={{
                  flex: 1.5,
                  padding: '10px',
                  background: 'var(--rust-clay)',
                  color: '#FFFFFF',
                  border: '2px solid var(--ink)',
                  boxShadow: '3px 3px 0px var(--ink)',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  fontSize: '0.86rem',
                  gap: '6px'
                }}
              >
                <Send size={13} /> Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
