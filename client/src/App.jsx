import React, { useState, useEffect, Component } from 'react';
import { Hero } from './components/Landing/Hero';
import { AgeGateModal } from './components/Landing/AgeGateModal';
import { CaptchaCheck } from './components/Landing/CaptchaCheck';
import { ChatContainer } from './components/Chat/ChatContainer';
import { ReportModal } from './components/Modals/ReportModal';
import { BlockModal } from './components/Modals/BlockModal';
import { AdminDashboard } from './components/Modals/AdminDashboard';
import { FeedbackModal } from './components/Modals/FeedbackModal';
import { Toast } from './components/Common/Toast';
import { useSocket } from './contexts/SocketContext';
import { MessageSquare, Shield, MessageSquareHeart, RefreshCw, Sun, Moon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="glass-panel" style={{ maxWidth: '480px', padding: '28px', textAlign: 'center', background: 'var(--bg-surface)', border: '2px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--accent)', marginBottom: '8px' }}>
              Connection Interface Recovery
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                fontFamily: 'var(--font-heading)',
                padding: '10px 20px',
                gap: '8px'
              }}
            >
              <RefreshCw size={15} /> Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { matchState, startSearch, tags } = useSocket();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stranger_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stranger_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [hasAgreedTerms, setHasAgreedTerms] = useState(() => {
    return localStorage.getItem('nexus_terms_accepted') === 'true';
  });
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleStartChatClick = () => {
    if (!hasAgreedTerms) {
      setShowAgeGate(true);
      return;
    }
    // Present bot verification captcha
    setShowCaptcha(true);
  };

  const handleAgeGateAccept = () => {
    localStorage.setItem('nexus_terms_accepted', 'true');
    setHasAgreedTerms(true);
    setShowAgeGate(false);
    setShowCaptcha(true);
  };

  const handleCaptchaVerified = () => {
    setShowCaptcha(false);
    startSearch(tags);
  };

  const isInChatSession = matchState === 'searching' || matchState === 'connected' || matchState === 'partner_disconnected';

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header
        className="nav-header"
        style={{
          height: '60px',
          borderBottom: '2px solid var(--border)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 0px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: 0 }} onClick={() => window.location.reload()}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              color: 'var(--on-accent)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}
          >
            <MessageSquare size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.95rem, 3.5vw, 1.25rem)', color: 'var(--text-primary)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              STRANGER CHAT
            </span>
          </div>
        </div>

        {/* Center Tagline in Sans-serif */}
        <div className="tagline-container" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="tagline-text">
            talk to random strangers online
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-subtle"
            style={{ padding: '6px 9px', fontSize: '0.78rem', minHeight: '34px' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} color="var(--coral)" /> : <Moon size={15} color="var(--purple)" />}
          </button>

          {/* Feedback Trigger */}
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            className="btn btn-subtle header-action-btn"
            style={{ fontSize: '0.78rem', padding: '6px 10px', whiteSpace: 'nowrap', gap: '5px', minHeight: '34px' }}
            title="Share suggestions, bugs, or feedback"
          >
            <MessageSquareHeart size={14} color="var(--pink)" />
            <span className="header-action-label">Feedback</span>
          </button>

          {/* Admin Dashboard */}
          <button
            type="button"
            onClick={() => setShowAdmin(true)}
            className="btn btn-subtle header-action-btn"
            style={{ fontSize: '0.78rem', padding: '6px 10px', whiteSpace: 'nowrap', gap: '5px', minHeight: '34px' }}
          >
            <Shield size={14} color="var(--teal)" />
            <span className="header-action-label">Admin</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main
        className="main-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 0,
          overflowY: isInChatSession ? 'hidden' : 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <ErrorBoundary>
          {matchState === 'banned' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="glass-panel" style={{ maxWidth: '460px', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚫</div>
                <h2 style={{ fontSize: '1.5rem', color: '#ff4e50', marginBottom: '8px' }}>Access Suspended</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Your session has been banned by moderators for violating our community safety guidelines.
                </p>
              </div>
            </div>
          ) : isInChatSession ? (
            <ChatContainer
              onOpenReport={() => setShowReport(true)}
              onOpenBlock={() => setShowBlock(true)}
            />
          ) : (
            <Hero
              onStartChat={handleStartChatClick}
              onOpenAdmin={() => setShowAdmin(true)}
              onOpenFeedback={() => setShowFeedback(true)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <AgeGateModal
        isOpen={showAgeGate}
        onAccept={handleAgeGateAccept}
        onDecline={() => setShowAgeGate(false)}
      />

      <CaptchaCheck
        isOpen={showCaptcha}
        onVerified={handleCaptchaVerified}
        onCancel={() => setShowCaptcha(false)}
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />

      <BlockModal
        isOpen={showBlock}
        onClose={() => setShowBlock(false)}
      />

      <AdminDashboard
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
      />

      <Toast />
    </div>
  );
}
export default App;
