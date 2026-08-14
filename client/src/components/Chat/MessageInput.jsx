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
        padding: '12px 20px',
        borderTop: '2px solid var(--ink)',
        background: 'var(--parchment-card)',
        position: 'relative'
      }}
    >
      {/* Emoji Drawer */}
      {showEmojis && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '20px',
            background: 'var(--parchment)',
            border: '2px solid var(--ink)',
            padding: '8px 12px',
            display: 'flex',
            gap: '8px',
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
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '2px'
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
          className="btn"
          style={{
            padding: '8px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.45,
            background: 'var(--parchment)',
            border: '1px solid var(--ink)'
          }}
          title="Insert emoji"
        >
          <Smile size={18} />
        </button>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '2px solid var(--ink)',
            boxShadow: '2px 2px 0px var(--ink)',
            padding: '0 12px'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            placeholder={isConnected ? "Type a message... (Press Enter to send, Esc to Skip)" : "Waiting to connect..."}
            style={{
              flex: 1,
              height: '42px',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              color: 'var(--ink)',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!isConnected || !text.trim()}
          className="btn"
          style={{
            height: '44px',
            padding: '0 18px',
            background: isConnected && text.trim() ? 'var(--ink)' : 'var(--parchment)',
            color: isConnected && text.trim() ? 'var(--parchment)' : 'rgba(28, 26, 23, 0.4)',
            border: '2px solid var(--ink)',
            boxShadow: isConnected && text.trim() ? '2px 2px 0px var(--rust-clay)' : 'none',
            cursor: isConnected && text.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            gap: '6px'
          }}
        >
          <Send size={14} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
