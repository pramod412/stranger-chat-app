import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export const AgeGateModal = ({ isOpen, onAccept, onDecline }) => {
  const [is18Plus, setIs18Plus] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);

  if (!isOpen) return null;

  const canProceed = is18Plus && agreedToRules;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'var(--accent)',
              color: 'var(--on-accent)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <ShieldCheck size={26} color="var(--on-accent)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            Confirm Your Age
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            To keep our community safe, please confirm you are an adult before chatting.
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-surface-muted)',
            padding: '14px',
            border: '1.5px solid var(--border-soft)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '18px',
            fontSize: '0.84rem',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Zero tolerance:</strong> Hate speech, harassment, or illicit activities result in immediate permanent bans.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <CheckCircle size={16} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Privacy first:</strong> Chat logs are not kept after a chat ends.
            </span>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={is18Plus}
              onChange={(e) => setIs18Plus(e.target.checked)}
            />
            <span>I confirm that I am <strong>18 years of age or older</strong>.</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
            />
            <span>I agree to the Community Guidelines & Terms of Service.</span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-subtle"
            style={{ flex: 1, padding: '10px' }}
            onClick={onDecline}
          >
            Leave
          </button>
          <button
            type="button"
            disabled={!canProceed}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '10px',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              gap: '6px'
            }}
            onClick={onAccept}
          >
            <span>Continue</span> <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default AgeGateModal;
