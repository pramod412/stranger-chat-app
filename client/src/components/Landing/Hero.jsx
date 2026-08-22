import React, { useState } from 'react';
import { MessageSquare, Video, Lock, Shield, Zap, Play, ChevronDown, ChevronUp, Sparkles, Share2, Check, ArrowRight, Star, Globe, Users, ShieldCheck, EyeOff } from 'lucide-react';
import { InterestPicker } from './InterestPicker';
import { ProfileSetup } from './ProfileSetup';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';

const LANDING_FAQS = [
  {
    q: 'What makes Just Random Chat the best Omegle alternative?',
    a: 'Just Random Chat (JustRandomChat.com) is built from the ground up as a modern, safe, and lightning-fast alternative to Omegle. It offers instant 1-on-1 random text and video chat, topic interest matching, dark and light themes, zero registration or fees, and real-time automated moderation.'
  },
  {
    q: 'Is Just Random Chat completely free to use?',
    a: 'Yes, Just Random Chat is 100% free with no registration, subscription fees, coins, or hidden paywalls. Anyone 18+ can talk to strangers worldwide via text or video at any time on justrandomchat.com.'
  },
  {
    q: 'Is my chat private and anonymous?',
    a: 'Yes! Video and audio streams are directly transmitted peer-to-peer using WebRTC encryption. Chat messages are strictly ephemeral in memory and are never saved to databases or disk storage. They are auto-purged 5 seconds after a session ends.'
  },
  {
    q: 'Do I need a camera or webcam to chat?',
    a: 'No. You can chat in pure Text Mode if you do not have a camera or prefer not to show video. You can also toggle your camera and microphone on or off at any moment during a live conversation.'
  },
  {
    q: 'How does interest-based topic matching work?',
    a: 'You can select or type custom topic tags (such as #gaming, #music, #tech, #movies, or #travel). Our random matchmaking algorithm matches you with available strangers and highlights shared tags in common.'
  },
  {
    q: 'What are the age requirements for Just Random Chat?',
    a: 'Just Random Chat is strictly for adult users aged 18 years and older. Minors are strictly prohibited from using the platform, and we enforce a mandatory age verification gate.'
  },
  {
    q: 'How does moderation and reporting work on Just Random Chat?',
    a: 'We utilize automated real-time text safety filters to block slurs and severe harassment, rate limiters to prevent bot spam, and instant one-click Report and Block buttons. When a report is filed, an ephemeral snapshot of the conversation buffer is reviewed by moderators.'
  },
  {
    q: 'How do I start talking to strangers?',
    a: 'Select either Text Chat or Video Chat mode, optionally add any interest tags or stranger profile details, and click "Start Finding Strangers". You will be instantly connected with a random stranger in seconds!'
  }
];

const POPULAR_TAGS = ['gaming', 'music', 'anime', 'tech', 'deep-talks', 'movies', 'coding', 'travel', 'languages', 'art'];

export const Hero = ({ onStartChat, onOpenAdmin, onOpenFeedback, onOpenContentModal }) => {
  const { stats, tags, setTags, showNotification } = useSocket();
  const { videoMode, setVideoMode } = useWebRTC();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://justrandomchat.com/');
      setCopiedShare(true);
      showNotification?.('Link copied! Share JustRandomChat.com with friends.', 'success');
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      showNotification?.('Visit https://justrandomchat.com/ to chat!', 'info');
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent('Chat 1-on-1 with random strangers worldwide for free with zero signup on Just Random Chat (Omegle Alternative)!');
    const url = encodeURIComponent('https://justrandomchat.com/');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent('Chat 1-on-1 with strangers online on Just Random Chat: https://justrandomchat.com/');
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 40px 16px',
        maxWidth: '920px',
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
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--ink)',
            background: 'var(--parchment-card)',
            padding: '5px 14px',
            border: '1.5px solid var(--ink)',
            boxShadow: '2px 2px 0px var(--ink)'
          }}
        >
          {stats?.activeMatchesCount || 0} Active {(stats?.activeMatchesCount === 1) ? 'Chat' : 'Chats'}
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--rust-clay)',
            background: 'var(--parchment-card)',
            padding: '5px 14px',
            border: '1.5px solid var(--rust-clay)',
            boxShadow: '2px 2px 0px var(--rust-clay)'
          }}
        >
          ★ 100% FREE OMEGLE ALTERNATIVE
        </div>
      </div>

      {/* Hero Title & Subtitle */}
      <div style={{ marginBottom: '8px', width: '100%' }}>
        <span className="eyebrow" style={{ color: 'var(--rust-clay)', marginBottom: '6px', letterSpacing: '0.1em' }}>
          JUST RANDOM CHAT · #1 FREE OMEGLE ALTERNATIVE
        </span>
        <h1
          style={{
            fontSize: 'clamp(2rem, 7vw, 4rem)',
            lineHeight: 1.05,
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            wordBreak: 'break-word',
            margin: '6px 0 12px 0'
          }}
        >
          TALK TO STRANGERS ONLINE
        </h1>
      </div>

      <p
        style={{
          fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
          color: 'var(--ink)',
          maxWidth: '680px',
          marginBottom: '24px',
          lineHeight: 1.5,
          fontFamily: 'var(--font-sans)',
          padding: '0 8px',
          opacity: 0.88
        }}
      >
        The modern, privacy-first <strong>Omegle alternative</strong> for 1-on-1 random text and video chat with strangers around the globe. No login required. 100% free, private, and moderated.
      </p>

      {/* Main Setup Card */}
      <div
        className="hero-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--parchment-card)',
          border: '2px solid var(--ink)',
          boxShadow: '4px 4px 0px var(--ink)',
          textAlign: 'left'
        }}
      >
        {/* Card Header Eyebrow */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid var(--ink)', paddingBottom: '8px' }}>
          <span className="eyebrow" style={{ fontSize: '0.72rem', color: 'var(--ink)', fontWeight: 700 }}>
            ● SETUP · CHAT PREFERENCES
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--rust-clay)', fontWeight: 700 }}>
            INSTANT 1-CLICK MATCH
          </span>
        </div>

        {/* Mode Selector - Segmented Control */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
            background: 'var(--parchment)',
            padding: '4px',
            border: '1.5px solid var(--ink)'
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
              border: !videoMode ? '2px solid var(--ink)' : '2px solid transparent',
              background: !videoMode ? 'var(--rust-clay)' : 'transparent',
              color: !videoMode ? '#FFFFFF' : 'var(--ink)',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: !videoMode ? '2px 2px 0px var(--ink)' : 'none',
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
              border: videoMode ? '2px solid var(--ink)' : '2px solid transparent',
              background: videoMode ? 'var(--rust-clay)' : 'transparent',
              color: videoMode ? '#FFFFFF' : 'var(--ink)',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: videoMode ? '2px 2px 0px var(--ink)' : 'none',
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

        {/* Quick Popular Topics Cloud */}
        <div style={{ width: '100%', textAlign: 'left', marginTop: '-4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={13} color="var(--rust-clay)" />
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
              POPULAR TOPICS (CLICK TO ADD):
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {POPULAR_TAGS.map((t) => {
              const isSelected = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddTag(t)}
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
                    border: '1px solid var(--ink)',
                    background: isSelected ? 'var(--sage)' : 'var(--parchment)',
                    color: isSelected ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'none' : '1px 1px 0px var(--ink)',
                    fontWeight: 600
                  }}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Chat CTA Button */}
        <button
          type="button"
          onClick={onStartChat}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '1.05rem',
            fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: '4px 4px 0px var(--ink)',
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

      {/* Trust & Core Value Pillars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          width: '100%',
          maxWidth: '880px',
          marginTop: '28px'
        }}
      >
        <div
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: 'var(--parchment-card)',
            border: '1.5px solid var(--ink)',
            boxShadow: '3px 3px 0px var(--ink)'
          }}
        >
          <div
            style={{
              background: 'var(--sage)',
              color: '#FFFFFF',
              padding: '8px',
              border: '1.5px solid var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)', textTransform: 'none', margin: 0 }}>
              100% Anonymous & Ephemeral
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.45, margin: '4px 0 0 0', opacity: 0.85 }}>
              Zero chat logs stored. Encrypted peer-to-peer WebRTC video with auto-purge buffers.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: 'var(--parchment-card)',
            border: '1.5px solid var(--ink)',
            boxShadow: '3px 3px 0px var(--ink)'
          }}
        >
          <div
            style={{
              background: 'var(--rust-clay)',
              color: '#FFFFFF',
              padding: '8px',
              border: '1.5px solid var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)', textTransform: 'none', margin: 0 }}>
              Proactive Moderation
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.45, margin: '4px 0 0 0', opacity: 0.85 }}>
              1-click report & block. Automated real-time text filters block abusive behavior.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            background: 'var(--parchment-card)',
            border: '1.5px solid var(--ink)',
            boxShadow: '3px 3px 0px var(--ink)'
          }}
        >
          <div
            style={{
              background: 'var(--marker-pink)',
              color: '#FFFFFF',
              padding: '8px',
              border: '1.5px solid var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', marginBottom: '3px', fontFamily: 'var(--font-heading)', textTransform: 'none', margin: 0 }}>
              Interest Matching
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink)', lineHeight: 1.45, margin: '4px 0 0 0', opacity: 0.85 }}>
              Connect with strangers who share your favorite hobbies, games, and passions.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Section 1: Why Just Random Chat is the Best Free Omegle Alternative */}
      <section
        id="omegle-alternative"
        style={{
          width: '100%',
          maxWidth: '880px',
          marginTop: '40px',
          textAlign: 'left',
          background: 'var(--parchment-card)',
          border: '2px solid var(--ink)',
          boxShadow: '4px 4px 0px var(--ink)',
          padding: '24px'
        }}
        aria-labelledby="omegle-alternative-heading"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Globe size={18} color="var(--rust-clay)" />
          <span className="eyebrow" style={{ color: 'var(--rust-clay)' }}>
            THE NEW ERA OF STRANGER CHAT
          </span>
        </div>
        <h2 id="omegle-alternative-heading" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
          Why Just Random Chat is the #1 Free Omegle Alternative
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 16px 0', opacity: 0.9 }}>
          Following the shutdown of Omegle, online users worldwide have been looking for a safe, modern, and reliable platform to talk to strangers. <strong>JustRandomChat.com</strong> delivers an upgraded random stranger chat experience built with cutting-edge WebRTC technology, strict user privacy, and zero financial paywalls.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'var(--parchment)', padding: '12px', border: '1px solid var(--ink)' }}>
            <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.85rem', marginBottom: '4px' }}>⚡ INSTANT 1-CLICK CHAT</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.4 }}>No signup, emails, or phone numbers needed. Just open and connect.</div>
          </div>
          <div style={{ background: 'var(--parchment)', padding: '12px', border: '1px solid var(--ink)' }}>
            <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.85rem', marginBottom: '4px' }}>🔒 PEER-TO-PEER ENCRYPTION</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.4 }}>Direct WebRTC audio & video streaming with zero server recordings.</div>
          </div>
          <div style={{ background: 'var(--parchment)', padding: '12px', border: '1px solid var(--ink)' }}>
            <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.85rem', marginBottom: '4px' }}>🎯 TOPIC TAG MATCHING</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.4 }}>Find partners who share your exact interests and conversation styles.</div>
          </div>
          <div style={{ background: 'var(--parchment)', padding: '12px', border: '1px solid var(--ink)' }}>
            <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.85rem', marginBottom: '4px' }}>🛡️ ZERO TOLERANCE SAFETY</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.4 }}>Real-time text filtration and 1-click blocking keep you secure.</div>
          </div>
        </div>
      </section>

      {/* SEO Section 2: Comparison Matrix (Just Random Chat vs Legacy Omegle vs Others) */}
      <section
        id="comparison"
        style={{
          width: '100%',
          maxWidth: '880px',
          marginTop: '32px',
          textAlign: 'left'
        }}
        aria-labelledby="comparison-heading"
      >
        <div style={{ marginBottom: '12px' }}>
          <span className="eyebrow" style={{ color: 'var(--rust-clay)' }}>FEATURE COMPARISON</span>
          <h2 id="comparison-heading" style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
            Just Random Chat vs. Legacy Omegle & Other Sites
          </h2>
        </div>

        <div style={{ overflowX: 'auto', border: '2px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)', background: 'var(--parchment-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--ink)', color: '#FFFFFF' }}>
                <th style={{ padding: '12px', fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>FEATURE</th>
                <th style={{ padding: '12px', fontFamily: 'var(--font-heading)', color: '#F0ECDF', background: 'var(--rust-clay)' }}>JUST RANDOM CHAT</th>
                <th style={{ padding: '12px', fontFamily: 'var(--font-heading)' }}>LEGACY OMEGLE</th>
                <th style={{ padding: '12px', fontFamily: 'var(--font-heading)' }}>OTHER CHAT SITES</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>100% Free Forever</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--rust-clay)' }}>✓ Yes (No Paywalls)</td>
                <td style={{ padding: '10px 12px' }}>✓ Yes</td>
                <td style={{ padding: '10px 12px' }}>✗ Often Coin / Subscription Gated</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--ink)', background: 'var(--parchment)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Zero Registration / No Login</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--rust-clay)' }}>✓ Yes (Instant 1-Click)</td>
                <td style={{ padding: '10px 12px' }}>✓ Yes</td>
                <td style={{ padding: '10px 12px' }}>✗ Requires Email / Social / App</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Encrypted WebRTC P2P Video</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--rust-clay)' }}>✓ Modern High-Def</td>
                <td style={{ padding: '10px 12px' }}>✗ Legacy Flash / High Lag</td>
                <td style={{ padding: '10px 12px' }}>⚠ Variable Quality</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--ink)', background: 'var(--parchment)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Interest Topic Matching</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--rust-clay)' }}>✓ Dynamic Topic Tags</td>
                <td style={{ padding: '10px 12px' }}>⚠ Basic Text Tags</td>
                <td style={{ padding: '10px 12px' }}>✗ Paid / Premium Only</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ephemeral Privacy</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--rust-clay)' }}>✓ Zero DB Persistence</td>
                <td style={{ padding: '10px 12px' }}>✗ Logs Saved</td>
                <td style={{ padding: '10px 12px' }}>✗ Data Tracked & Sold</td>
              </tr>
              <tr style={{ background: 'var(--parchment)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Proactive Anti-Abuse Filter</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--rust-clay)' }}>✓ Real-Time Filtering & Block</td>
                <td style={{ padding: '10px 12px' }}>✗ Unmoderated Bot Spam</td>
                <td style={{ padding: '10px 12px' }}>⚠ Minimal Safety</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SEO Section 3: How It Works in 3 Steps */}
      <section
        id="how-it-works"
        style={{
          width: '100%',
          maxWidth: '880px',
          marginTop: '36px',
          textAlign: 'left'
        }}
        aria-labelledby="how-it-works-heading"
      >
        <div style={{ marginBottom: '14px' }}>
          <span className="eyebrow" style={{ color: 'var(--rust-clay)' }}>SIMPLE WORKFLOW</span>
          <h2 id="how-it-works-heading" style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
            How Random Stranger Chat Works in 3 Easy Steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--parchment-card)', border: '1.5px solid var(--ink)', padding: '16px', boxShadow: '3px 3px 0px var(--ink)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--ink)', color: '#FFFFFF', padding: '2px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem' }}>01</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem' }}>CHOOSE YOUR MODE</span>
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.45, opacity: 0.85 }}>
              Choose between <strong>Text Chat</strong> for instant keyboard messaging or <strong>Video Chat</strong> for crystal-clear face-to-face conversations.
            </p>
          </div>

          <div style={{ background: 'var(--parchment-card)', border: '1.5px solid var(--ink)', padding: '16px', boxShadow: '3px 3px 0px var(--ink)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--rust-clay)', color: '#FFFFFF', padding: '2px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem' }}>02</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem' }}>ADD YOUR INTERESTS</span>
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.45, opacity: 0.85 }}>
              Optionally enter topic tags (e.g. <em>#gaming, #music, #anime, #tech</em>) or stranger passport details to discover like-minded people.
            </p>
          </div>

          <div style={{ background: 'var(--parchment-card)', border: '1.5px solid var(--ink)', padding: '16px', boxShadow: '3px 3px 0px var(--ink)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--sage)', color: '#FFFFFF', padding: '2px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem' }}>03</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem' }}>CONNECT INSTANTLY</span>
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.45, opacity: 0.85 }}>
              Click <strong>Start Finding Strangers</strong>. Talk freely, make friends worldwide, and skip to the next person anytime with one keystroke (`Esc`).
            </p>
          </div>
        </div>
      </section>

      {/* Share & Social Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          marginTop: '28px',
          padding: '16px 20px',
          background: 'var(--parchment-card)',
          border: '1.5px solid var(--ink)',
          boxShadow: '3px 3px 0px var(--ink)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ textAlign: 'left', minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <Sparkles size={15} color="var(--rust-clay)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--ink)' }}>
              SHARE JUSTRANDOMCHAT.COM
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink)', margin: 0, opacity: 0.85 }}>
            Invite friends or your online community to talk anonymously on the web's best Omegle alternative.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px', border: '1px solid var(--ink)', boxShadow: '2px 2px 0px var(--ink)' }}
            title="Share on WhatsApp"
          >
            <span>💬 WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={shareOnTwitter}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px', border: '1px solid var(--ink)', boxShadow: '2px 2px 0px var(--ink)' }}
            title="Share on X / Twitter"
          >
            <span>🐦 X / Twitter</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px', border: '1px solid var(--ink)', boxShadow: '2px 2px 0px var(--ink)' }}
            title="Copy Website Link"
          >
            {copiedShare ? <Check size={14} color="var(--sage)" /> : <Share2 size={14} color="var(--rust-clay)" />}
            <span>{copiedShare ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <section
        id="faq"
        style={{
          width: '100%',
          maxWidth: '880px',
          marginTop: '36px',
          textAlign: 'left'
        }}
        aria-labelledby="faq-heading"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--rust-clay)', marginBottom: '2px' }}>DISCOVER JUSTRANDOMCHAT</span>
            <h2 id="faq-heading" style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
              Frequently Asked Questions (FAQ)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenContentModal?.('faq')}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '6px 12px', border: '1px solid var(--ink)', boxShadow: '2px 2px 0px var(--ink)' }}
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
                  background: 'var(--parchment-card)',
                  border: '1.5px solid var(--ink)',
                  boxShadow: '2px 2px 0px var(--ink)',
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
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    color: 'var(--ink)',
                    textAlign: 'left'
                  }}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} color="var(--rust-clay)" /> : <ChevronDown size={16} color="var(--ink)" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px 16px', fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.55, borderTop: '1px solid var(--parchment-border, #E5E0D2)', paddingTop: '10px', opacity: 0.9 }}>
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
          maxWidth: '880px',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '2px solid var(--ink)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--ink)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          <a
            href="#omegle-alternative"
            style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}
          >
            Omegle Alternative
          </a>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href="#how-it-works"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('how-it-works'); }}
            style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}
          >
            How It Works
          </a>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href="#comparison"
            style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}
          >
            Feature Comparison
          </a>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href="#safety"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('safety'); }}
            style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}
          >
            Safety Guidelines (18+)
          </a>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href="#faq"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('faq'); }}
            style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}
          >
            FAQ
          </a>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); onOpenContentModal?.('about'); }}
            style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}
          >
            About
          </a>
          <span style={{ opacity: 0.4 }}>•</span>
          <button
            type="button"
            onClick={onOpenFeedback}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
          >
            Feedback
          </button>
          <span style={{ opacity: 0.4 }}>•</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
          >
            Admin Panel
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.74rem', opacity: 0.75 }}>
          © {new Date().getFullYear()} Just Random Chat (<strong>https://justrandomchat.com/</strong>). Strictly 18+ adult communication platform. Instant anonymous 1-on-1 random text & video stranger chat.
        </p>
      </footer>
    </div>
  );
};

export default Hero;
