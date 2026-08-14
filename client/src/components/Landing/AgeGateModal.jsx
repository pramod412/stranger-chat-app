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
              width: '48px',
              height: '48px',
              background: 'var(--ink)',
              color: 'var(--parchment)',
              border: '2px solid var(--ink)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <ShieldCheck size={24} color="var(--parchment)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            Welcome! Please confirm your age
          </h2>
          <p style={{ color: 'rgba(28, 26, 23, 0.75)', fontSize: '0.86rem' }}>
            To keep our community safe, please confirm you are an adult before chatting.
          </p>
        </div>

        <div
          style={{
            background: 'var(--parchment-card)',
            padding: '14px',
            border: '1px solid var(--ink)',
            boxShadow: '1px 1px 0px var(--ink)',
            marginBottom: '18px',
            fontSize: '0.82rem',
            color: 'var(--ink)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--rust-clay)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Zero tolerance:</strong> Hate speech, harassment, or illicit activities result in immediate permanent bans.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <CheckCircle size={16} color="var(--sage)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Privacy first:</strong> Chat logs are not kept after a chat ends.
            </span>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>
            <input
              type="checkbox"
              checked={is18Plus}
              onChange={(e) => setIs18Plus(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--rust-clay)', cursor: 'pointer' }}
            />
            <span>I confirm that I am <strong>18 years of age or older</strong>.</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--rust-clay)', cursor: 'pointer' }}
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
            className="btn"
            style={{
              flex: 2,
              padding: '10px',
              background: canProceed ? 'var(--rust-clay)' : 'rgba(28, 26, 23, 0.2)',
              color: '#FFFFFF',
              border: '2px solid var(--ink)',
              boxShadow: canProceed ? '3px 3px 0px var(--ink)' : 'none',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              fontSize: '0.9rem'
            }}
            onClick={onAccept}
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
