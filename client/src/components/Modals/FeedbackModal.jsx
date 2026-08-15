import React, { useState } from 'react';
import { Star, MessageSquareHeart, X, Check, Send, Sparkles, Lightbulb, Bug, Zap, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const CATEGORIES = [
  { id: 'feature', label: 'Feature Idea', icon: Lightbulb, color: 'var(--rust-clay)' },
  { id: 'bug', label: 'Bug / Issue', icon: Bug, color: 'var(--rust-clay)' },
  { id: 'matchmaking', label: 'Matchmaking', icon: Zap, color: 'var(--sage)' },
  { id: 'chat', label: 'Chat Experience', icon: MessageSquare, color: 'var(--ink)' },
  { id: 'general', label: 'General Thoughts', icon: Sparkles, color: 'var(--ink)' }
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
      const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
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
          background: 'var(--parchment)',
          border: '2px solid var(--ink)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'left'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ink)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--ink)',
                color: 'var(--parchment)',
                border: '1px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0
              }}
            >
              <MessageSquareHeart size={18} color="var(--parchment)" />
            </div>
            <div>
              <span className="eyebrow" style={{ color: 'var(--rust-clay)', fontSize: '0.68rem', display: 'block', marginBottom: '2px' }}>
                COMMUNITY VOICE
              </span>
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--ink)' }}>
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
              color: 'var(--ink)',
              display: 'flex',
              padding: '4px'
            }}
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
                background: 'var(--sage)',
                color: '#FFFFFF',
                border: '2px solid var(--ink)',
                boxShadow: '3px 3px 0px var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <Check size={30} strokeWidth={3} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--ink)', marginBottom: '8px' }}>
              Thank You for Shaping Stranger Chat!
            </h3>
            <p style={{ color: 'rgba(28, 26, 23, 0.8)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Your feedback has been delivered to our engineering and product team. We carefully review all suggestions to craft a faster, safer, and more fun experience.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="btn"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--ink)',
                color: 'var(--parchment)',
                border: '2px solid var(--ink)',
                boxShadow: '3px 3px 0px var(--rust-clay)',
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
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  marginBottom: '8px'
                }}
              >
                <span>Overall Experience</span>
                <span style={{ color: 'var(--rust-clay)', textTransform: 'none', fontSize: '0.78rem' }}>
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--parchment-card)',
                  border: '1px solid var(--ink)',
                  boxShadow: '1px 1px 0px var(--ink)',
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
                        color="var(--ink)"
                        fill={isFilled ? 'var(--rust-clay)' : 'transparent'}
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
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
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
                        padding: '6px 10px',
                        fontSize: '0.76rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--ink)' : 'var(--parchment-card)',
                        color: isSelected ? 'var(--parchment)' : 'var(--ink)',
                        border: '1px solid var(--ink)',
                        boxShadow: isSelected ? '2px 2px 0px var(--rust-clay)' : '1px 1px 0px var(--ink)',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <Icon size={13} color={isSelected ? 'var(--parchment)' : cat.color} />
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
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--ink)'
                  }}
                >
                  Your Notes & Thoughts *
                </label>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'rgba(28, 26, 23, 0.55)' }}>
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
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  background: '#FFFFFF',
                  border: error ? '2px solid var(--rust-clay)' : '2px solid var(--ink)',
                  boxShadow: '2px 2px 0px var(--ink)',
                  color: 'var(--ink)',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '90px'
                }}
              />
              {error && (
                <p style={{ color: 'var(--rust-clay)', fontSize: '0.74rem', fontWeight: 600, margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
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
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '4px'
                }}
              >
                Contact Email or Telegram <span style={{ fontWeight: 400, color: 'rgba(28, 26, 23, 0.5)' }}>(Optional - for follow-ups)</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@example.com or @handle"
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  background: '#FFFFFF',
                  border: '1px solid var(--ink)',
                  boxShadow: '1px 1px 0px var(--ink)',
                  color: 'var(--ink)',
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
                style={{ flex: 1, padding: '11px', fontSize: '0.84rem' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="btn"
                style={{
                  flex: 2,
                  padding: '11px',
                  background: comment.trim() ? 'var(--rust-clay)' : 'rgba(28, 26, 23, 0.3)',
                  color: '#FFFFFF',
                  border: '2px solid var(--ink)',
                  boxShadow: comment.trim() ? '3px 3px 0px var(--ink)' : 'none',
                  cursor: comment.trim() && !loading ? 'pointer' : 'not-allowed',
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
