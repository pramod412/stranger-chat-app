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
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'var(--parchment)'
      }}
    >
      {/* Session Start Banner */}
      {currentMatch && (() => {
        const peerProfile = currentMatch.peerProfile;
        const details = [
          peerProfile?.age ? `${peerProfile.age} yrs` : null,
          peerProfile?.city,
          peerProfile?.country
        ].filter(Boolean).join(' • ');

        return (
          <div
            style={{
              alignSelf: 'center',
              background: 'var(--parchment-card)',
              border: '1px solid var(--ink)',
              boxShadow: '1px 1px 0px var(--ink)',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '4px 0 8px 0',
              flexWrap: 'wrap',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={14} color="var(--sage)" />
            <span>
              Connected with <strong>{currentMatch.peerDisplayName || 'Stranger'}</strong>
              {details ? ` (${details})` : ''}. Say hi!
            </span>
          </div>
        );
      })()}

      {/* Empty State Prompt */}
      {messages.length === 0 && matchState === 'connected' && (
        <div
          style={{
            margin: 'auto',
            textAlign: 'center',
            padding: '24px 16px',
            maxWidth: '360px'
          }}
        >
          <h4 style={{ fontSize: '1.05rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            You are connected!
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'rgba(28, 26, 23, 0.75)', lineHeight: 1.4 }}>
            Say hello to start the conversation, or type a message below.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, index) => {
        const isMe = msg.fromMe;
        return (
          <div
            key={msg.id || index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: 'min(88%, 560px)'
            }}
          >
            {/* Sender Label */}
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: isMe ? 'var(--rust-clay)' : 'var(--ink)',
                marginBottom: '2px',
                alignSelf: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              {isMe ? 'You' : (currentMatch?.peerDisplayName || 'Stranger')}
            </span>

            {/* Bubble */}
            <div
              style={{
                padding: '10px 14px',
                background: isMe ? 'var(--ink)' : 'var(--parchment-card)',
                color: isMe ? 'var(--parchment)' : 'var(--ink)',
                border: '2px solid var(--ink)',
                boxShadow: isMe ? '3px 3px 0px var(--rust-clay)' : '3px 3px 0px var(--ink)',
                fontSize: '0.92rem',
                wordBreak: 'break-word',
                lineHeight: 1.45,
                fontFamily: 'var(--font-sans)'
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
                  gap: '4px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--rust-clay)',
                  marginTop: '3px',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <AlertCircle size={12} />
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
            background: 'var(--parchment-card)',
            border: '1px solid var(--ink)',
            boxShadow: '1px 1px 0px var(--ink)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
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
            background: '#FAF3F0',
            border: '2px solid var(--rust-clay)',
            boxShadow: '3px 3px 0px var(--rust-clay)',
            padding: '12px 18px',
            textAlign: 'center',
            margin: '14px 0',
            maxWidth: '400px'
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--rust-clay)', fontWeight: 700, marginBottom: '2px' }}>
            Stranger has left the chat.
          </p>
          <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
            Click Next or press [Esc] to find someone new.
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
