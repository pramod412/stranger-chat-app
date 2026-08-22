import React from 'react';
import { X, Shield, HelpCircle, Info, Sparkles, CheckCircle2, Lock, Users, AlertTriangle } from 'lucide-react';

export const ContentModal = ({ type, isOpen, onClose }) => {
  if (!isOpen || !type) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '88dvh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'left'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {type === 'how-it-works' && (
              <div style={{ width: '36px', height: '36px', background: 'var(--purple-bg)', color: 'var(--purple)', border: '2px solid var(--purple)', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
            )}
            {type === 'safety' && (
              <div style={{ width: '36px', height: '36px', background: 'var(--teal-bg)', color: 'var(--teal)', border: '2px solid var(--teal)', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} />
              </div>
            )}
            {type === 'faq' && (
              <div style={{ width: '36px', height: '36px', background: 'var(--coral-bg)', color: 'var(--coral)', border: '2px solid var(--coral)', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={18} />
              </div>
            )}
            {type === 'about' && (
              <div style={{ width: '36px', height: '36px', background: 'var(--pink-bg)', color: 'var(--pink)', border: '2px solid var(--pink)', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={18} />
              </div>
            )}

            <div>
              <span className="eyebrow" style={{ color: 'var(--accent)', fontSize: '0.68rem', marginBottom: '2px' }}>
                JUST RANDOM CHAT GUIDE
              </span>
              <h2 style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {type === 'how-it-works' && 'How Just Random Chat Works'}
                {type === 'safety' && 'Safety & Community Guidelines'}
                {type === 'faq' && 'Frequently Asked Questions'}
                {type === 'about' && 'About Just Random Chat'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {/* HOW IT WORKS */}
          {type === 'how-it-works' && (
            <>
              <p>
                <strong>Just Random Chat</strong> (justrandomchat.com) is a free, instant 1-on-1 discovery app that connects you to random strangers worldwide without requiring logins, accounts, or email verification.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
                <div style={{ padding: '14px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '0.98rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--purple)" /> 1. Choose Text or Video Mode
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Select between lightweight anonymous text messaging or real-time encrypted peer-to-peer WebRTC video and audio chat. You can switch modes at any time.
                  </p>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '0.98rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--teal)" /> 2. Add Your Interests (Optional)
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Add topic tags like <code>#music</code>, <code>#gaming</code>, <code>#coding</code>, or <code>#movies</code>. When matched, our engine pairs you randomly with a stranger and highlights any shared interests you have in common.
                  </p>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '0.98rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--accent)" /> 3. Instant Next & Safety Controls
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                    If a conversation isn't clicking, press <strong>Next (Esc)</strong> to immediately find a new partner. Use <strong>Report</strong> or <strong>Block</strong> if anyone violates community standards.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* SAFETY GUIDELINES */}
          {type === 'safety' && (
            <>
              <div style={{ padding: '12px 14px', background: 'var(--coral-bg)', border: '1.5px solid var(--coral)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                <strong>⚠️ Strictly 18+ Platform:</strong> Just Random Chat is an adult communication platform for individuals aged 18 and older. Minors are strictly prohibited.
              </div>

              <h3 style={{ fontSize: '1rem', marginTop: '8px', color: 'var(--text-primary)' }}>Our Core Safety Standards</h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                <li><strong>Zero Tolerance for Harassment & Hate Speech:</strong> Slurs, threats, bullying, hate speech, and non-consensual sexually explicit content are strictly forbidden.</li>
                <li><strong>Automated Real-Time Filtering:</strong> Messages are screened by intelligent filters to censor profanity and block abusive content before delivery.</li>
                <li><strong>Privacy & Anti-Doxxing:</strong> Never share sensitive personal data (e.g. physical home addresses, banking details, passwords, or personal phone numbers).</li>
                <li><strong>Instant User Blocking:</strong> Blocking a user permanently prevents matching with them across future sessions.</li>
                <li><strong>Active Moderation Review:</strong> Reported incidents capture an ephemeral rolling snapshot for swift moderation and IP suspension.</li>
              </ul>
            </>
          )}

          {/* FAQ */}
          {type === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Is Just Random Chat an alternative to Omegle?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>Yes! Just Random Chat is a modern, fast, and safe alternative to Omegle for 1-on-1 random video and text chat. It features interest topic tags, zero registration, and active automated moderation.</p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Is Just Random Chat really free?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>Yes. Just Random Chat is 100% free with no subscriptions, premium tiers, or registration fees.</p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Is my chat anonymous and private?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>Yes. Video and audio streams are directly transmitted peer-to-peer using WebRTC encryption. We do not permanently store text chat logs.</p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-primary)' }}>How do I change from Text to Video?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>You can select Video Chat before clicking start, or click the Video Mode toggle on the bottom controls bar during an active conversation.</p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface-muted)', border: '1.5px solid var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-primary)' }}>What should I do if someone is rude?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>Click the <strong>Report</strong> button to submit an incident report to our moderation team, or click <strong>Block</strong> and <strong>Next</strong> to leave immediately.</p>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {type === 'about' && (
            <>
              <p>
                <strong>Just Random Chat</strong> (justrandomchat.com) is a free Omegle alternative designed to bring back the excitement of spontaneous, authentic online conversation. In an era dominated by algorithmic social feeds and curated profiles, Just Random Chat provides a clean, modern space to meet real human beings worldwide.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Built with modern WebRTC peer-to-peer technology, real-time WebSocket matchmaking, responsive design for desktop and mobile, and a privacy-first approach.
              </p>
            </>
          )}

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContentModal;
