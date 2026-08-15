import React, { useEffect, useRef } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

export const MessageList = () => {
  const { messages = [], isPeerTyping = false, matchState = 'idle', currentMatch = null } = useSocket() || {};
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--bg-page)'
      }}
    >
      {/* Session Connection Banner (Single definitive source with peer info) */}
      {currentMatch && (() => {
        const peerProfile = currentMatch.peerProfile;
        const details = [
          peerProfile?.gender || null,
          peerProfile?.age ? `${peerProfile.age} yrs` : null,
          peerProfile?.city,
          peerProfile?.country
        ].filter(Boolean).join(' • ');

        return (
          <div
            style={{
              alignSelf: 'center',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-soft)',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-sm)',
              padding: '6px 16px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '4px 0 10px 0',
              flexWrap: 'wrap',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={16} color="var(--teal)" />
            <span>
              Connected with <strong>{currentMatch.peerDisplayName || 'Stranger'}</strong>
              {details ? ` (${details})` : ''}. Say hi!
            </span>
          </div>
        );
      })()}

      {/* Messages Feed */}
      {messages.map((msg, index) => {
        const isMe = msg.fromMe;
        return (
          <div
            key={msg.id || index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: 'min(85%, 540px)'
            }}
          >
            {/* Sender Label */}
            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                color: isMe ? 'var(--accent)' : 'var(--text-secondary)',
                marginBottom: '3px',
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                padding: '0 2px'
              }}
            >
              {isMe ? 'You' : (currentMatch?.peerDisplayName || 'Stranger')}
            </span>

            {/* Bubble */}
            <div
              style={{
                padding: '10px 15px',
                background: isMe ? 'var(--accent)' : 'var(--bg-surface)',
                color: isMe ? 'var(--on-accent)' : 'var(--text-primary)',
                border: '2px solid var(--border)',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.94rem',
                wordBreak: 'break-word',
                lineHeight: 1.48,
                fontFamily: 'var(--font-sans)',
                fontWeight: 450
              }}
            >
              {typeof msg.text === 'string' ? msg.text : String(msg.text || '')}
            </div>

            {/* Warning if sensitive info detected */}
            {msg.warning && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--accent)',
                  marginTop: '4px',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <AlertCircle size={13} />
                <span>{typeof msg.warning === 'string' ? msg.warning : String(msg.warning?.message || msg.warning || '')}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isPeerTyping && (
        <div
          style={{
            alignSelf: 'flex-start',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-soft)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
            {currentMatch?.peerDisplayName || 'Stranger'} is typing
          </span>
          <div className="typing-dots">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}

      {/* Partner Disconnected State */}
      {matchState === 'partner_disconnected' && (
        <div
          style={{
            alignSelf: 'center',
            background: 'var(--pink-bg)',
            border: '2px solid var(--pink)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            padding: '14px 20px',
            textAlign: 'center',
            margin: '14px 0',
            maxWidth: '420px'
          }}
        >
          <p style={{ fontSize: '0.94rem', color: 'var(--pink)', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
            Stranger has left the chat.
          </p>
          <p style={{ fontSize: '0.82rem', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
            Click Next or press [Esc] to find someone new.
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
export default MessageList;
