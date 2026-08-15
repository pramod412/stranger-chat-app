import React, { useState } from 'react';
import { Star, MessageSquareHeart, X, Check, Send, Sparkles, Lightbulb, Bug, Zap, MessageSquare } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { getServerUrl } from '../../utils/config';

const CATEGORIES = [
  { id: 'feature', label: 'Feature Idea', icon: Lightbulb, color: 'var(--purple)', bg: 'var(--purple-bg)' },
  { id: 'bug', label: 'Bug / Issue', icon: Bug, color: 'var(--pink)', bg: 'var(--pink-bg)' },
  { id: 'matchmaking', label: 'Matchmaking', icon: Zap, color: 'var(--teal)', bg: 'var(--teal-bg)' },
  { id: 'chat', label: 'Chat Experience', icon: MessageSquare, color: 'var(--coral)', bg: 'var(--coral-bg)' },
  { id: 'general', label: 'General Thoughts', icon: Sparkles, color: 'var(--accent)', bg: 'var(--coral-bg)' }
];

const RATING_LABELS = {
  1: 'Needs Work 🙁',
  2: 'Fair 😐',
  3: 'Good 🙂',
  4: 'Great 😊',
  5: 'Outstanding! 🤩'
};

export const FeedbackModal = ({ isOpen, onClose }) => {
  const { userId, showNotification } = useSocket();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('feature');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief note before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const serverUrl = getServerUrl();
      const response = await fetch(`${serverUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          rating,
          category,
          comment: comment.trim(),
          email: email.trim(),
          clientInfo: {
            userAgent: navigator.userAgent,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            submittedAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSubmitted(true);
      showNotification?.('Feedback received! Thank you for helping us improve.', 'success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setComment('');
    setEmail('');
    setRating(5);
    setCategory('feature');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '520px',
          width: '94%',
          maxHeight: '90dvh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'left'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                background: 'var(--pink-bg)',
                color: 'var(--pink)',
                border: '2px solid var(--pink)',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0
              }}
            >
              <MessageSquareHeart size={20} />
            </div>
            <div>
              <span className="eyebrow" style={{ color: 'var(--accent)', fontSize: '0.68rem', display: 'block', marginBottom: '2px' }}>
                COMMUNITY VOICE
              </span>
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Share Your Feedback
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              padding: '4px'
            }}
            aria-label="Close feedback modal"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* Thank You Confirmation State */
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                background: 'var(--teal-bg)',
                color: 'var(--teal)',
                border: '2px solid var(--teal)',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <Check size={30} strokeWidth={3} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Thank You for Helping Us Improve!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Your feedback has been delivered to our engineering and product team. We carefully review all suggestions to craft a faster, safer, and more fun experience.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.92rem',
                textTransform: 'uppercase'
              }}
            >
              Done & Return
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Rating Stars */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}
              >
                <span>Overall Experience</span>
                <span style={{ color: 'var(--accent)', textTransform: 'none', fontSize: '0.82rem' }}>
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-surface-muted)',
                  border: '1.5px solid var(--border-soft)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '10px 14px',
                  justifyContent: 'center'
                }}
              >
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= (hoverRating || rating);
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        transition: 'transform 0.1s ease',
                        transform: (hoverRating || rating) === starVal ? 'scale(1.2)' : 'scale(1)'
                      }}
                      title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={28}
                        color={isFilled ? 'var(--accent)' : 'var(--text-muted)'}
                        fill={isFilled ? 'var(--accent)' : 'transparent'}
                        strokeWidth={1.75}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}
              >
                Feedback Category
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className="tag-pill"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        background: isSelected ? cat.color : cat.bg,
                        color: isSelected ? '#FFFFFF' : cat.color,
                        border: `1.5px solid ${cat.color}`,
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        fontWeight: isSelected ? 700 : 600,
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <Icon size={14} color={isSelected ? '#FFFFFF' : cat.color} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  Your Notes & Thoughts *
                </label>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {comment.length}/1000
                </span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="What's working well? What can be improved? Any new feature ideas or bugs you noticed?..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-sans)',
                  background: 'var(--bg-surface-muted)',
                  border: error ? '2px solid var(--accent)' : '2px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '90px'
                }}
              />
              {error && (
                <p style={{ color: 'var(--accent)', fontSize: '0.76rem', fontWeight: 600, margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Optional Email */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}
              >
                Contact Email or Telegram <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional - for follow-ups)</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@example.com or @handle"
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  background: 'var(--bg-surface-muted)',
                  border: '1.5px solid var(--border-soft)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-subtle"
                style={{ flex: 1, padding: '11px', fontSize: '0.88rem' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="btn btn-primary"
                style={{
                  flex: 2,
                  padding: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={14} />
                <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default FeedbackModal;
