import React, { useState, useEffect, Component } from 'react';
import { Hero } from './components/Landing/Hero';
import { AgeGateModal } from './components/Landing/AgeGateModal';
import { CaptchaCheck } from './components/Landing/CaptchaCheck';
import { ChatContainer } from './components/Chat/ChatContainer';
import { ReportModal } from './components/Modals/ReportModal';
import { BlockModal } from './components/Modals/BlockModal';
import { AdminDashboard } from './components/Modals/AdminDashboard';
import { Toast } from './components/Common/Toast';
import { useSocket } from './contexts/SocketContext';
import { MessageSquare, Shield, Radio, Volume2, Sparkles, RefreshCw } from 'lucide-react';

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
          <div className="glass-panel" style={{ maxWidth: '480px', padding: '28px', textAlign: 'center', background: 'var(--parchment)', border: '2px solid var(--ink)', boxShadow: '6px 6px 0px var(--ink)' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--rust-clay)', marginBottom: '8px' }}>
              Connection Interface Recovery
            </h3>
            <p style={{ color: 'rgba(28, 26, 23, 0.8)', fontSize: '0.86rem', marginBottom: '18px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: 'var(--rust-clay)',
                color: '#FFFFFF',
                border: '2px solid var(--ink)',
                boxShadow: '3px 3px 0px var(--ink)',
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

  const [hasAgreedTerms, setHasAgreedTerms] = useState(() => {
    return localStorage.getItem('nexus_terms_accepted') === 'true';
  });
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

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
          borderBottom: '2px solid var(--ink)',
          background: 'var(--parchment)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 0px rgba(28, 26, 23, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.reload()}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--ink)',
              color: 'var(--parchment)',
              border: '1px solid var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}
          >
            <MessageSquare size={16} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', color: 'var(--ink)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              STRANGER CHAT
            </span>
          </div>
        </div>

        {/* Center Handwritten Aside Moment (auto-hidden on mobile screens) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="handwritten-aside" style={{ fontSize: '1.15rem' }}>
            talk to random strangers online
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowAdmin(true)}
            className="btn btn-subtle"
            style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
          >
            <Shield size={14} color="var(--rust-clay)" />
            <span>Admin</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
