import React, { useState, useEffect } from 'react';
import { X, Compass, Sparkles } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

export const SearchingRadar = () => {
  const { tags = [], cancelSearch } = useSocket() || {};
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Animated Blueprint Radar */}
      <div
        style={{
          position: 'relative',
          width: '130px',
          height: '130px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        <div className="radar-circle" />
        <div className="radar-circle radar-circle-delay" />
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--ink)',
            color: 'var(--parchment)',
            border: '2px solid var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 2
          }}
        >
          <Compass size={24} color="var(--parchment)" />
        </div>
      </div>

      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--ink)', marginBottom: '4px' }}>
        Looking for a stranger...
      </h3>
      <p style={{ color: 'rgba(28, 26, 23, 0.7)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '16px' }}>
        Waiting time: {seconds}s
      </p>

      {/* Selected Tags info */}
      {tags.length > 0 && (
        <div
          style={{
            background: 'var(--parchment-card)',
            border: '1px solid var(--ink)',
            boxShadow: '1px 1px 0px var(--ink)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '420px',
            marginBottom: '20px'
          }}
        >
          <Sparkles size={14} color="var(--rust-clay)" />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>Matching for:</span>
          {tags.map((t) => (
            <span key={t} className="tag-pill active" style={{ fontSize: '0.72rem', padding: '2px 6px', background: 'var(--ink)', color: 'var(--parchment)' }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Cancel button */}
      <button
        type="button"
        onClick={cancelSearch}
        className="btn btn-subtle"
        style={{ gap: '6px', fontSize: '0.82rem', padding: '8px 16px' }}
      >
        <X size={15} /> Cancel
      </button>
    </div>
  );
};
