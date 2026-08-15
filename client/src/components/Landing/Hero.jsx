import React, { useState } from 'react';
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
      <div style={{ marginBottom: '8px' }}>
        <span className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '6px' }}>
          ANONYMOUS 1-ON-1 MATCHMAKING
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            lineHeight: 1.08,
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}
        >
          TALK TO STRANGERS
        </h1>
      </div>

      <p
        style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.12rem)',
          color: 'var(--text-secondary)',
          maxWidth: '620px',
          marginBottom: '24px',
          lineHeight: 1.5,
          fontFamily: 'var(--font-sans)'
        }}
      >
        Chat with random people around the world. No login needed. Private and anonymous.
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

      {/* Safety & Features Grid - Trust Badges */}
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
            <h4 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)' }}>Private by Design</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
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
            <h4 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)' }}>Safe & Moderated</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
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
            <h4 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)' }}>Interest Matching</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Chat with people who share your hobbies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Hero;
