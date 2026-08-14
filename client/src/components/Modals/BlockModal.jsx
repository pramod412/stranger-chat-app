import React from 'react';
import { Ban, X } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

export const BlockModal = ({ isOpen, onClose }) => {
  const { blockStranger, currentMatch } = useSocket();

  if (!isOpen) return null;

  const handleConfirmBlock = () => {
    blockStranger?.();
    onClose?.();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            background: 'var(--ink)',
            color: 'var(--rust-clay)',
            border: '2px solid var(--ink)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}
        >
          <Ban size={22} color="var(--rust-clay)" />
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
          Block {currentMatch?.peerDisplayName || 'Stranger'}?
        </h3>

        <p style={{ color: 'rgba(28, 26, 23, 0.75)', fontSize: '0.84rem', marginBottom: '18px', lineHeight: 1.45 }}>
          You will leave this chat immediately, and you will never be matched with this person again.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-subtle" style={{ flex: 1, padding: '10px' }} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{
              flex: 1.4,
              padding: '10px',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              fontSize: '0.84rem'
            }}
            onClick={handleConfirmBlock}
          >
            Block & Leave
          </button>
        </div>
      </div>
    </div>
  );
};
