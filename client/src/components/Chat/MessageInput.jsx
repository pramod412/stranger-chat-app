import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const QUICK_EMOJIS = ['👋', '😊', '😂', '🔥', '✨', '👾', '🚀', '❤️', '😎', '🎉'];

export const MessageInput = ({ onSkipTrigger }) => {
  const { sendMessage, sendTyping, matchState } = useSocket();
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const isConnected = matchState === 'connected';

  useEffect(() => {
    if (isConnected) {
      inputRef.current?.focus();
    }
  }, [isConnected]);

  const handleChange = (e) => {
    setText(e.target.value);

    // Notify backend of typing
    sendTyping?.(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping?.(false);
    }, 1500);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim() || !isConnected) return;

    sendMessage?.(text);
    setText('');
    sendTyping?.(false);
    setShowEmojis(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onSkipTrigger?.();
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '2px solid var(--border)',
        background: 'var(--bg-surface)',
        position: 'relative'
      }}
    >
      {/* Emoji Drawer */}
      {showEmojis && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '16px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--bg-surface)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 20
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                transition: 'transform 0.1s ease'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          disabled={!isConnected}
          className="btn btn-subtle"
          style={{
            padding: '8px 10px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.45,
            flexShrink: 0,
            borderRadius: 'var(--radius-md)'
          }}
          title="Insert emoji"
        >
          <Smile size={18} color={isConnected ? "var(--accent)" : "var(--text-muted)"} />
        </button>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-muted)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            padding: '0 12px',
            minWidth: 0
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            placeholder={isConnected ? "Type a message... (Enter to send)" : "Waiting to connect..."}
            style={{
              width: '100%',
              height: '42px',
              background: 'transparent !important',
              border: 'none !important',
              boxShadow: 'none !important',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!isConnected || !text.trim()}
          className="btn btn-primary"
          style={{
            height: '44px',
            padding: '0 18px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '0.88rem',
            gap: '6px',
            flexShrink: 0
          }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
