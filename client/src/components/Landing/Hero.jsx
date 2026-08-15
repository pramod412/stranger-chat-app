import React, { useState } from 'react';
import { MessageSquare, Video, Lock, Shield, Zap, Play, HelpCircle, ChevronDown, ChevronUp, Sparkles, Heart } from 'lucide-react';
import { InterestPicker } from './InterestPicker';
import { ProfileSetup } from './ProfileSetup';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';

const LANDING_FAQS = [
  {
    q: 'Is Stranger Chat an alternative to Omegle?',
    a: 'Yes! Stranger Chat is built as a fast, modern, and safe Omegle alternative for anonymous 1-on-1 random text and video chat with shared topic matching and zero registration.'
  },
  {
    q: 'Is Stranger Chat completely free to use?',
    a: 'Yes, Stranger Chat is 100% free with no registration, subscription fees, or hidden paywalls. You can connect via text or video anytime.'
  },
  {
    q: 'Is my chat private and anonymous?',
    a: 'Yes. Video and audio streams are directly transmitted peer-to-peer using WebRTC encryption. Text messages are ephemeral and never permanently stored on our servers unless a safety incident is reported.'
  },
  {
    q: 'What age do I need to be to use Stranger Chat?',
    a: 'Stranger Chat is strictly for adult users aged 18 years and older. Minors are strictly prohibited from using the platform.'
  },
  {
    q: 'How does interest-based topic matching work?',
    a: 'You can optionally type or select topic tags (like #music, #gaming, #movies, or #travel). Our matchmaking system pairs you randomly with available strangers and highlights any shared interests you have in common.'
  }
];

export const Hero = ({ onStartChat, onOpenAdmin, onOpenFeedback, onOpenContentModal }) => {
  const { stats, tags, setTags } = useSocket();
  const { videoMode, setVideoMode } = useWebRTC();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 40px 16px',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        minHeight: 'auto'
      }}
    >
      {/* Live status chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="live-status-pill">
          <span className="live-dot-pulse" />
          <span>{stats?.onlineUsers ?? 0} {(stats?.onlineUsers === 1) ? 'Person' : 'People'} Online</span>
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface-muted)',
            padding: '5px 14px',
            border: '1.5px solid var(--border-soft)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {stats?.activeMatchesCount || 0} Active {(stats?.activeMatchesCount === 1) ? 'Chat' : 'Chats'}
        </div>
      </div>

      {/* Hero Title */}
      <div style={{ marginBottom: '8px', width: '100%' }}>
        <span className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '6px' }}>
          ANONYMOUS 1-ON-1 MATCHMAKING
        </span>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 6.5vw, 3.8rem)',
            lineHeight: 1.1,
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            wordBreak: 'break-word'
          }}
        >
          TALK TO STRANGERS
        </h1>
      </div>

      <p
        style={{
          fontSize: 'clamp(0.9rem, 2.8vw, 1.1rem)',
          color: 'var(--text-secondary)',
          maxWidth: '620px',
          marginBottom: '20px',
          lineHeight: 1.45,
          fontFamily: 'var(--font-sans)',
          padding: '0 8px'
        }}
      >
        Chat with random people around the world. No login needed. Private, free, and moderated.
      </p>

      {/* Main Setup Card */}
      <div
        className="glass-panel hero-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-hard)',
          textAlign: 'left'
        }}
      >
        {/* Card Header Eyebrow */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border-soft)', paddingBottom: '8px' }}>
          <span className="eyebrow" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            ● SETUP · CHAT MODE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            INSTANT MATCH
          </span>
        </div>

        {/* Mode Selector - Segmented Control */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
            background: 'var(--bg-surface-muted)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-soft)'
          }}
        >
          <button
            type="button"
            onClick={() => setVideoMode(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: !videoMode ? '2px solid var(--border)' : '2px solid transparent',
              borderRadius: 'var(--radius-md)',
              background: !videoMode ? 'var(--accent)' : 'transparent',
              color: !videoMode ? 'var(--on-accent)' : 'var(--text-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: !videoMode ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={16} />
            <span>Text Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setVideoMode(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: videoMode ? '2px solid var(--border)' : '2px solid transparent',
              borderRadius: 'var(--radius-md)',
              background: videoMode ? 'var(--accent)' : 'transparent',
              color: videoMode ? 'var(--on-accent)' : 'var(--text-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: videoMode ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Video size={16} />
            <span>Video Chat</span>
          </button>
        </div>

        {/* Optional Stranger Passport / Profile */}
        <ProfileSetup />

        {/* Interest Picker */}
        <InterestPicker tags={tags} setTags={setTags} />

        {/* Start Chat CTA Button */}
        <button
          type="button"
          onClick={onStartChat}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '1.02rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-hard)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <Play size={18} fill="#FFFFFF" />
          <span>Start Finding Strangers</span>
        </button>
      </div>

      {/* Trust & Safety Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          width: '100%',
          maxWidth: '850px',
          marginTop: '28px'
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              background: 'var(--purple-bg)',
              color: 'var(--purple)',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)', textTransform: 'none' }}>Private by Design</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Messages aren't stored after you leave. Encrypted P2P video.
            </p>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              background: 'var(--teal-bg)',
              color: 'var(--teal)',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)', textTransform: 'none' }}>Safe & Moderated</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              1-click report and block. Active automated filters prevent abuse.
            </p>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              background: 'var(--coral-bg)',
              color: 'var(--coral)',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)', textTransform: 'none' }}>Interest Matching</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Chat with people who share your favorite hobbies.
            </p>
          </div>
        </div>
      </div>

      {/* Search Engine & User FAQ Section */}
      <section
        style={{
          width: '100%',
          maxWidth: '850px',
          marginTop: '36px',
          textAlign: 'left'
        }}
        aria-labelledby="faq-heading"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '2px' }}>DISCOVER STRANGER CHAT</span>
            <h2 id="faq-heading" style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Frequently Asked Questions
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenContentModal?.('faq')}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            View All FAQs
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {LANDING_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    textAlign: 'left'
                  }}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-soft)', paddingTop: '10px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Semantic Footer with Crawlable Links */}
      <footer
        style={{
          width: '100%',
          maxWidth: '850px',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1.5px solid var(--border-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          <a
            href="#how-it-works"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('how-it-works'); }}
            style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            How It Works
          </a>
          <span style={{ color: 'var(--border-soft)' }}>•</span>
          <a
            href="#safety"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('safety'); }}
            style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Safety Guidelines (18+)
          </a>
          <span style={{ color: 'var(--border-soft)' }}>•</span>
          <a
            href="#faq"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('faq'); }}
            style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            FAQ
          </a>
          <span style={{ color: 'var(--border-soft)' }}>•</span>
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('about'); }}
            style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            About
          </a>
          <span style={{ color: 'var(--border-soft)' }}>•</span>
          <button
            type="button"
            onClick={onOpenFeedback}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
          >
            Feedback
          </button>
          <span style={{ color: 'var(--border-soft)' }}>•</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
          >
            Admin Panel
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Stranger Chat. Strictly 18+ adult communication platform. Instant anonymous 1-on-1 text & video matching.
        </p>
      </footer>
    </div>
  );
};
export default Hero;
