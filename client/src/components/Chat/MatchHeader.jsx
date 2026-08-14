import React from 'react';
import { User, Flag, Ban, Video, MessageSquare } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';

export const MatchHeader = ({ onOpenReport, onOpenBlock }) => {
  const { currentMatch, matchState } = useSocket();
  const { videoMode, setVideoMode } = useWebRTC();

  const isConnected = matchState === 'connected' && currentMatch;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: '2px solid var(--ink)',
        background: 'var(--parchment-card)',
        zIndex: 10,
        gap: '8px',
        flexWrap: 'wrap'
      }}
    >
      {/* Peer info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            background: isConnected ? 'var(--ink)' : 'var(--parchment)',
            color: isConnected ? 'var(--parchment)' : 'var(--ink)',
            border: '1px solid var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}
        >
          <User size={16} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isConnected ? (currentMatch?.peerDisplayName || 'Stranger') : matchState === 'searching' ? 'Searching...' : 'Stranger'}
            </span>

            {isConnected && (
              <span className="badge-live" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                <span className="live-dot" /> Live
              </span>
            )}
          </div>

          {/* Shared Interests tags */}
          {isConnected && currentMatch?.sharedTags?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'rgba(28, 26, 23, 0.65)' }}>Shared:</span>
              {currentMatch.sharedTags.map((tag, idx) => {
                const tagLabel = typeof tag === 'string' ? tag : String(tag?.name || tag || idx);
                return (
                  <span
                    key={tagLabel + idx}
                    className="tag-pill active"
                    style={{
                      fontSize: '0.66rem',
                      padding: '1px 5px',
                      background: 'var(--ink)',
                      color: 'var(--parchment)',
                      boxShadow: '1px 1px 0px var(--rust-clay)'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={onOpenReport}
            className="btn btn-subtle"
            style={{ padding: '5px 8px', fontSize: '0.74rem', gap: '4px' }}
            title="Report this user"
          >
            <Flag size={13} color="var(--rust-clay)" />
            <span>Report</span>
          </button>

          <button
            type="button"
            onClick={onOpenBlock}
            className="btn btn-danger"
            style={{ padding: '5px 8px', fontSize: '0.74rem', gap: '4px' }}
            title="Block and disconnect"
          >
            <Ban size={13} />
            <span>Block</span>
          </button>
        </div>
      )}
    </div>
  );
};
