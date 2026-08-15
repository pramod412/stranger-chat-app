import React from 'react';
import { User, Flag, Ban, MapPin, Calendar, Users } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { getTagTheme } from '../../utils/tagColors';

export const MatchHeader = ({ onOpenReport, onOpenBlock }) => {
  const { currentMatch, matchState } = useSocket();

  const isConnected = matchState === 'connected' && currentMatch;
  const peerProfile = currentMatch?.peerProfile;
  const locationStr = [peerProfile?.city, peerProfile?.country].filter(Boolean).join(', ');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '2px solid var(--border)',
        background: 'var(--bg-surface)',
        zIndex: 10,
        gap: '10px',
        flexWrap: 'wrap'
      }}
    >
      {/* Peer info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            background: isConnected ? 'var(--purple-bg)' : 'var(--bg-surface-muted)',
            color: isConnected ? 'var(--purple)' : 'var(--text-secondary)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}
        >
          <User size={18} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isConnected ? (currentMatch?.peerDisplayName || 'Stranger') : matchState === 'searching' ? 'Searching...' : 'Stranger'}
            </span>

            {isConnected && (
              <span className="live-status-pill" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <span className="live-dot-pulse" style={{ width: '6px', height: '6px' }} /> Live
              </span>
            )}

            {/* Sex / Gender Badge */}
            {isConnected && peerProfile?.gender && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  background: 'var(--pink-bg)',
                  color: 'var(--pink)',
                  border: '1px solid var(--pink)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Users size={11} /> {peerProfile.gender}
              </span>
            )}

            {/* Age Badge */}
            {isConnected && peerProfile?.age && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  background: 'var(--coral-bg)',
                  color: 'var(--coral)',
                  border: '1px solid var(--coral)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={11} /> {peerProfile.age} yrs
              </span>
            )}

            {/* Location Badge */}
            {isConnected && locationStr && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  background: 'var(--teal-bg)',
                  color: 'var(--teal)',
                  border: '1px solid var(--teal)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <MapPin size={11} /> {locationStr}
              </span>
            )}
          </div>

          {/* Shared Interests Tags */}
          {isConnected && currentMatch?.sharedTags?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-muted)' }}>Shared:</span>
              {currentMatch.sharedTags.map((tag, idx) => {
                const tagLabel = typeof tag === 'string' ? tag : String(tag?.name || tag || idx);
                const theme = getTagTheme(tagLabel);
                return (
                  <span
                    key={tagLabel + idx}
                    className="tag-pill"
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      background: theme.bg,
                      color: theme.color,
                      border: `1px solid ${theme.color}`,
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 700
                    }}
                  >
                    #{tagLabel}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons on header (Report & Block) */}
      {isConnected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={onOpenReport}
            className="btn btn-subtle"
            style={{
              padding: '8px 14px',
              minHeight: '44px',
              fontSize: '0.82rem',
              gap: '6px',
              borderRadius: 'var(--radius-md)'
            }}
            title="Report this user"
          >
            <Flag size={14} color="var(--text-secondary)" />
            <span>Report</span>
          </button>

          <button
            type="button"
            onClick={onOpenBlock}
            className="btn btn-danger"
            style={{
              padding: '8px 14px',
              minHeight: '44px',
              fontSize: '0.82rem',
              gap: '6px',
              borderRadius: 'var(--radius-md)'
            }}
            title="Block and disconnect"
          >
            <Ban size={14} />
            <span>Block</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default MatchHeader;
