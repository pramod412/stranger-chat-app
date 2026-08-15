import React from 'react';
import { MessageSquare, Video, Lock, Shield, Zap, Play } from 'lucide-react';
import { InterestPicker } from './InterestPicker';
import { ProfileSetup } from './ProfileSetup';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';

export const Hero = ({ onStartChat, onOpenAdmin }) => {
  const { stats, tags, setTags } = useSocket();
  const { videoMode, setVideoMode } = useWebRTC();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 14px 48px 14px',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        minHeight: 'auto'
      }}
    >
      {/* Live status chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div
          className="badge-live"
          style={{
            background: 'var(--parchment)',
            border: '1px solid var(--ink)',
            boxShadow: 'var(--shadow-sm)',
            padding: '4px 12px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span className="live-dot" />
          <span>{stats?.onlineUsers ?? 0} {(stats?.onlineUsers === 1) ? 'Person' : 'People'} Online</span>
        </div>

        <div
          style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--ink)',
            background: 'var(--parchment-card)',
            padding: '4px 12px',
            border: '1px solid var(--ink)',
            boxShadow: 'var(--shadow-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {stats?.activeMatchesCount || 0} Active {(stats?.activeMatchesCount === 1) ? 'Chat' : 'Chats'}
        </div>
      </div>

      {/* Hero Title */}
      <div style={{ marginBottom: '8px' }}>
        <span className="eyebrow" style={{ color: 'var(--rust-clay)', marginBottom: '6px' }}>
          ANONYMOUS 1-ON-1 MATCHMAKING
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            lineHeight: 1.05,
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}
        >
          TALK TO STRANGERS
        </h1>
      </div>

      <p
        style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: 'rgba(28, 26, 23, 0.8)',
          maxWidth: '640px',
          marginBottom: '28px',
          lineHeight: 1.5,
          fontFamily: 'var(--font-sans)'
        }}
      >
        Chat with random people around the world. No login needed. Private and anonymous.
      </p>

      {/* Main Setup Card - Signature Field Guide Box */}
      <div
        className="glass-panel hero-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--parchment)',
          border: '2px solid var(--ink)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'left'
        }}
      >
        {/* Card Eyebrow */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ink)', paddingBottom: '8px' }}>
          <span className="eyebrow" style={{ fontSize: '0.72rem' }}>
            ● SETUP · CHAT MODE
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(28, 26, 23, 0.6)' }}>
            INSTANT MATCH
          </span>
        </div>

        {/* Mode Selector - Blueprint Segmented Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%'
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
              border: !videoMode ? '2px solid var(--ink)' : '1px solid var(--ink)',
              background: !videoMode ? 'var(--ink)' : 'var(--parchment-card)',
              color: !videoMode ? 'var(--parchment)' : 'var(--ink)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: !videoMode ? '2px 2px 0px var(--rust-clay)' : 'none',
              transition: 'all 0.1s ease'
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
              border: videoMode ? '2px solid var(--ink)' : '1px solid var(--ink)',
              background: videoMode ? 'var(--ink)' : 'var(--parchment-card)',
              color: videoMode ? 'var(--parchment)' : 'var(--ink)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: videoMode ? '2px 2px 0px var(--rust-clay)' : 'none',
              transition: 'all 0.1s ease'
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

        {/* Start Chat CTA Button - Signature Rust-Clay Action */}
        <button
          type="button"
          onClick={onStartChat}
          className="btn"
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '1.05rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: 'var(--rust-clay)',
            color: '#FFFFFF',
            border: '2px solid var(--ink)',
            boxShadow: '4px 4px 0px var(--ink)',
            marginTop: '8px',
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

      {/* Safety & Features Grid - 3 Blueprint Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          width: '100%',
          maxWidth: '850px',
          marginTop: '40px'
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
            background: 'var(--parchment)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              background: 'var(--ink)',
              color: 'var(--parchment)',
              padding: '8px',
              border: '1px solid var(--ink)'
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '2px', fontFamily: 'var(--font-heading)' }}>Private by Design</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(28, 26, 23, 0.75)', lineHeight: 1.4 }}>
              Messages aren't stored after you leave.
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
            background: 'var(--parchment)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              background: 'var(--ink)',
              color: 'var(--parchment)',
              padding: '8px',
              border: '1px solid var(--ink)'
            }}
          >
            <Shield size={18} color="var(--sage)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '2px', fontFamily: 'var(--font-heading)' }}>Safe & Moderated</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(28, 26, 23, 0.75)', lineHeight: 1.4 }}>
              1-click report and block. Active filters prevent abuse.
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
            background: 'var(--parchment)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              background: 'var(--ink)',
              color: 'var(--parchment)',
              padding: '8px',
              border: '1px solid var(--ink)'
            }}
          >
            <Zap size={18} color="var(--rust-clay)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '2px', fontFamily: 'var(--font-heading)' }}>Interest Matching</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(28, 26, 23, 0.75)', lineHeight: 1.4 }}>
              Chat with people who share your hobbies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
