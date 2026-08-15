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
        background: isError ? 'var(--pink-bg)' : 'var(--bg-surface)',
        color: isError ? 'var(--pink)' : 'var(--text-primary)',
        border: isError ? '2px solid var(--pink)' : '2px solid var(--border)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-md)',
        padding: '10px 20px',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.86rem',
        fontWeight: 600,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isError ? 'var(--pink)' : 'var(--teal)',
          display: 'inline-block'
        }}
      />
      <span>{messageStr}</span>
    </div>
  );
};
export default Toast;
