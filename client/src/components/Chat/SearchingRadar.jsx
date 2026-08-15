import React, { useState, useEffect } from 'react';
import { X, Compass, Sparkles, Shield, Lightbulb, Zap, Lock } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { getTagTheme } from '../../utils/tagColors';

const SAFETY_TIPS = [
  { icon: Shield, text: 'Keep chats safe: Never share real passwords, addresses, or phone numbers.', color: 'var(--teal)' },
  { icon: Sparkles, text: 'Interest matching is pairing you with strangers who share your tags.', color: 'var(--purple)' },
  { icon: Zap, text: 'Quick tip: Press [Escape] or click Next anytime to skip to another partner.', color: 'var(--accent)' },
  { icon: Lock, text: 'Private by design: No chat logs or media are saved after your session ends.', color: 'var(--coral)' },
  { icon: Lightbulb, text: 'Say something friendly or ask a fun question when you connect!', color: 'var(--pink)' }
];

export const SearchingRadar = () => {
  const { tags = [], cancelSearch } = useSocket() || {};
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const timerInterval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
    }, 4000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(tipInterval);
    };
  }, []);

  const currentTip = SAFETY_TIPS[tipIndex];
  const TipIcon = currentTip.icon;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '36px 20px',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      {/* Animated Glowing Dual Radar */}
      <div
        style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        <div className="radar-circle-accent" />
        <div className="radar-circle-teal" />
        <div
          style={{
            width: '54px',
            height: '54px',
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            border: '2.5px solid var(--border)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-hard)',
            zIndex: 2
          }}
        >
          <Compass size={28} color="#FFFFFF" />
        </div>
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>
        Looking for a stranger...
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '16px' }}>
        Searching pool · {seconds}s elapsed
      </p>

      {/* Selected Tags Info */}
      {tags.length > 0 && (
        <div
          style={{
            background: 'var(--bg-surface-muted)',
            border: '1.5px solid var(--border-soft)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '440px',
            marginBottom: '20px'
          }}
        >
          <Sparkles size={14} color="var(--accent)" />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)' }}>Matching for:</span>
          {tags.map((t) => {
            const theme = getTagTheme(t);
            return (
              <span
                key={t}
                className="tag-pill"
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  background: theme.bg,
                  color: theme.color,
                  border: `1px solid ${theme.color}`,
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700
                }}
              >
                #{t}
              </span>
            );
          })}
        </div>
      )}

      {/* Rotating Safety / Tip Message Box */}
      <div
        key={tipIndex}
        className="tip-animated"
        style={{
          background: 'var(--bg-surface-muted)',
          border: '1.5px solid var(--border-soft)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          maxWidth: '460px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'left'
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '6px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <TipIcon size={16} color={currentTip.color} />
        </div>
        <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {currentTip.text}
        </span>
      </div>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={cancelSearch}
        className="btn btn-subtle"
        style={{ gap: '6px', fontSize: '0.85rem', padding: '8px 18px', borderRadius: 'var(--radius-md)' }}
      >
        <X size={15} /> Cancel Search
      </button>
    </div>
  );
};
export default SearchingRadar;
