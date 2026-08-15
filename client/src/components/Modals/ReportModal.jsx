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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1.5px solid var(--border-soft)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flag size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Report {currentMatch?.peerDisplayName || 'Stranger'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
            aria-label="Close report modal"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'var(--teal-bg)',
                color: 'var(--teal)',
                border: '2px solid var(--teal)',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                fontSize: '1.4rem'
              }}
            >
              ✓
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
              Report Received
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Thank you for helping keep the community safe. A moderator will review recent messages.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Why are you reporting this person? Recent messages will be reviewed by moderators.
            </p>

            {/* Category selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '220px', overflowY: 'auto' }}>
              {REPORT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <label
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '8px 12px',
                      background: isSelected ? 'var(--bg-surface-muted)' : 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: isSelected ? '2px solid var(--accent)' : '1.5px solid var(--border-soft)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="report_cat"
                      value={cat.id}
                      checked={isSelected}
                      onChange={() => setSelectedCategory(cat.id)}
                      style={{ accentColor: 'var(--accent)', marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {cat.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Additional details */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Additional Details (Optional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-surface-muted)',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
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
                className="btn btn-primary"
                style={{
                  flex: 1.5,
                  padding: '10px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  gap: '6px'
                }}
              >
                <Send size={14} /> Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default ReportModal;
