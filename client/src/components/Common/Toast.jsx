import React from 'react';
import { useSocket } from '../../contexts/SocketContext';

export const Toast = () => {
  const { notification } = useSocket() || {};

  if (!notification || !notification.message) return null;

  const isError = notification.type === 'error';
  const messageStr = typeof notification.message === 'string'
    ? notification.message
    : String(notification.message?.message || notification.message || '');

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        background: isError ? 'var(--rust-clay)' : 'var(--parchment)',
        color: isError ? '#FFFFFF' : 'var(--ink)',
        border: '2px solid var(--ink)',
        boxShadow: '4px 4px 0px var(--ink)',
        padding: '8px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        fontWeight: 700,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span
        className="status-chip-dot live"
        style={{ background: isError ? '#FFFFFF' : 'var(--sage)' }}
      />
      <span>{messageStr}</span>
    </div>
  );
};
