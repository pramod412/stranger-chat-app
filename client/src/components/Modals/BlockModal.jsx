import React from 'react';
import { Ban } from 'lucide-react';
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
            width: '52px',
            height: '52px',
            background: 'var(--pink-bg)',
            color: 'var(--pink)',
            border: '2px solid var(--pink)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}
        >
          <Ban size={26} color="var(--pink)" />
        </div>

        <h3 style={{ fontSize: '1.3rem', marginBottom: '6px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          Block {currentMatch?.peerDisplayName || 'Stranger'}?
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px', lineHeight: 1.5 }}>
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
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '0.88rem'
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
export default BlockModal;
