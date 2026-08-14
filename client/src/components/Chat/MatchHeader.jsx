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
        padding: '10px 20px',
        borderBottom: '2px solid var(--ink)',
        background: 'var(--parchment-card)',
        zIndex: 10,
        gap: '10px',
        flexWrap: 'wrap'
      }}
    >
      {/* Peer info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <User size={16} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
              {isConnected ? (currentMatch?.peerDisplayName || 'Stranger') : matchState === 'searching' ? 'Searching...' : 'Stranger'}
            </span>

            {isConnected && (
              <span className="badge-live" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                <span className="live-dot" /> Live
              </span>
            )}
          </div>

          {/* Shared Interests tags */}
          {isConnected && currentMatch?.sharedTags?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'rgba(28, 26, 23, 0.65)' }}>Shared:</span>
              {currentMatch.sharedTags.map((tag, idx) => {
                const tagLabel = typeof tag === 'string' ? tag : String(tag?.name || tag || idx);
                return (
                  <span
                    key={tagLabel + idx}
                    className="tag-pill active"
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onOpenReport}
            className="btn btn-subtle"
            style={{ padding: '5px 10px', fontSize: '0.76rem', gap: '5px' }}
            title="Report this user"
          >
            <Flag size={13} color="var(--rust-clay)" />
            <span>Report</span>
          </button>

          <button
            type="button"
            onClick={onOpenBlock}
            className="btn btn-danger"
            style={{ padding: '5px 10px', fontSize: '0.76rem', gap: '5px' }}
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
