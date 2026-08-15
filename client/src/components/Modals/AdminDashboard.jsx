import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, X, Check, Ban, AlertTriangle, MessageSquare, Clock, ArrowLeft, MessageSquareHeart, Star, Lightbulb, Bug, Zap, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { getServerUrl } from '../../utils/config';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'feedback'
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [mobileDetailView, setMobileDetailView] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const serverUrl = getServerUrl();
      const res = await fetch(`${serverUrl}/api/admin/reports`);
      const data = await res.json();
      setReports(data.reports || []);
      if (data.reports?.length > 0 && !selectedReport) {
        setSelectedReport(data.reports[0]);
      }
    } catch (err) {
      console.error('Failed to fetch moderation reports', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const serverUrl = getServerUrl();
      const res = await fetch(`${serverUrl}/api/admin/feedback`);
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      setFeedbackStats(data.stats || null);
      if (data.feedbacks?.length > 0 && !selectedFeedback) {
        setSelectedFeedback(data.feedbacks[0]);
      }
    } catch (err) {
      console.error('Failed to fetch user feedbacks', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = () => {
    fetchReports();
    fetchFeedbacks();
  };

  useEffect(() => {
    if (isOpen) {
      refreshAll();
      setMobileDetailView(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectReport = (rep) => {
    setSelectedReport(rep);
    setMobileDetailView(true);
  };

  const handleSelectFeedback = (fb) => {
    setSelectedFeedback(fb);
    setMobileDetailView(true);
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const serverUrl = getServerUrl();
      await fetch(`${serverUrl}/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'ban' ? 'action_taken' : 'dismissed',
          action,
          notes: action === 'ban' ? 'User permanently banned for guideline breach' : 'Report reviewed and dismissed'
        })
      });
      fetchReports();
    } catch (err) {
      console.error('Error applying moderation action:', err);
    }
  };

  const handleFeedbackStatus = async (feedbackId, status) => {
    try {
      const serverUrl = getServerUrl();
      await fetch(`${serverUrl}/api/admin/feedback/${feedbackId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchFeedbacks();
    } catch (err) {
      console.error('Error updating feedback status:', err);
    }
  };

  const filteredFeedbacks = feedbackCategoryFilter === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.category === feedbackCategoryFilter);

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '960px',
          width: '96%',
          height: '85vh',
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '2px solid var(--ink)',
            background: 'var(--parchment-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {mobileDetailView && (
              <button
                type="button"
                onClick={() => setMobileDetailView(false)}
                className="btn btn-subtle"
                style={{ padding: '6px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--parchment)',
                border: '1px solid var(--ink)',
                flexShrink: 0
              }}
            >
              <Shield size={16} color="var(--parchment)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin & Community Center
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'rgba(28, 26, 23, 0.7)', margin: 0 }}>
                {reports.length} Incidents • {feedbacks.length} User Feedbacks
              </p>
            </div>
          </div>

          {/* Tab switchers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('reports'); setMobileDetailView(false); }}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: activeTab === 'reports' ? '2px solid var(--ink)' : '1px solid var(--ink)',
                background: activeTab === 'reports' ? 'var(--ink)' : 'var(--parchment)',
                color: activeTab === 'reports' ? 'var(--parchment)' : 'var(--ink)',
                boxShadow: activeTab === 'reports' ? '2px 2px 0px var(--rust-clay)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Shield size={13} />
              <span>Reports ({reports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('feedback'); setMobileDetailView(false); }}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: activeTab === 'feedback' ? '2px solid var(--ink)' : '1px solid var(--ink)',
                background: activeTab === 'feedback' ? 'var(--ink)' : 'var(--parchment)',
                color: activeTab === 'feedback' ? 'var(--parchment)' : 'var(--ink)',
                boxShadow: activeTab === 'feedback' ? '2px 2px 0px var(--rust-clay)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <MessageSquareHeart size={13} />
              <span>Feedback ({feedbacks.length})</span>
            </button>

            <button
              type="button"
              onClick={refreshAll}
              disabled={loading}
              className="btn btn-subtle"
              style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              title="Refresh data"
            >
              <RefreshCw size={13} className={loading ? 'spin-slow' : ''} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: '6px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Moderation Reports */}
        {activeTab === 'reports' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
            {/* Reports Sidebar */}
            <div
              style={{
                width: '320px',
                maxWidth: '100%',
                borderRight: '2px solid var(--ink)',
                background: 'var(--parchment-card)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '10px',
                display: mobileDetailView ? 'none' : 'flex',
                flexDirection: 'column',
                flex: mobileDetailView ? 'none' : 1
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Incidents Queue ({reports.length})
              </div>

              {reports.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'rgba(28, 26, 23, 0.65)', fontSize: '0.85rem' }}>
                  No active incident reports. Platform running cleanly!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {reports.map((rep) => {
                    const isSelected = selectedReport?.id === rep.id;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => handleSelectReport(rep)}
                        style={{
                          padding: '8px 10px',
                          background: isSelected ? 'var(--ink)' : 'var(--parchment)',
                          color: isSelected ? 'var(--parchment)' : 'var(--ink)',
                          border: '1px solid var(--ink)',
                          boxShadow: isSelected ? '2px 2px 0px var(--rust-clay)' : '1px 1px 0px var(--ink)',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              textTransform: 'uppercase',
                              color: isSelected ? '#FFFFFF' : 'var(--rust-clay)'
                            }}
                          >
                            {rep.category?.replace('_', ' ')}
                          </span>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              padding: '1px 5px',
                              border: '1px solid var(--ink)',
                              background: rep.status === 'pending' ? '#FAF3F0' : 'var(--sage)',
                              color: rep.status === 'pending' ? 'var(--rust-clay)' : '#FFFFFF',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700
                            }}
                          >
                            {rep.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'rgba(28, 26, 23, 0.8)' }}>
                          Target: <span style={{ fontFamily: 'var(--font-mono)' }}>{rep.reportedId?.slice(0, 10)}...</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                          {new Date(rep.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Report Detail View */}
            <div
              style={{
                flex: 2,
                display: !mobileDetailView && window.innerWidth < 768 ? 'none' : 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                background: 'var(--parchment)'
              }}
            >
              {selectedReport ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 18px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span className="eyebrow" style={{ color: 'var(--rust-clay)' }}>INCIDENT AUDIT</span>
                      <h4 style={{ fontSize: '1.1rem', margin: '2px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                        Category: {selectedReport.category?.toUpperCase()}
                      </h4>
                      <p style={{ fontSize: '0.76rem', color: 'rgba(28, 26, 23, 0.65)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                        Report ID: {selectedReport.id} • {new Date(selectedReport.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                        className="btn btn-subtle"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px' }}
                      >
                        <Check size={14} /> Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReportAction(selectedReport.id, 'ban')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px' }}
                      >
                        <Ban size={14} /> Ban Offender
                      </button>
                    </div>
                  </div>

                  {/* Incident Snapshot */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      <MessageSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Ephemeral Chat Buffer Snapshot ({selectedReport.chatSnapshot?.length || 0} messages)
                    </div>

                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid var(--ink)',
                        boxShadow: '2px 2px 0px var(--ink)',
                        padding: '10px',
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      {selectedReport.chatSnapshot?.length === 0 ? (
                        <p style={{ color: 'rgba(28, 26, 23, 0.6)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>No messages in buffer.</p>
                      ) : (
                        selectedReport.chatSnapshot.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '6px 10px',
                              background: msg.senderId === selectedReport.reportedId ? '#FAF3F0' : 'var(--parchment)',
                              borderLeft: msg.senderId === selectedReport.reportedId ? '3px solid var(--rust-clay)' : '3px solid var(--ink)',
                              borderTop: '1px solid var(--ink)',
                              borderRight: '1px solid var(--ink)',
                              borderBottom: '1px solid var(--ink)',
                              fontSize: '0.84rem'
                            }}
                          >
                            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'rgba(28, 26, 23, 0.65)', marginBottom: '2px' }}>
                              {msg.senderId === selectedReport.reportedId ? '⚠️ Reported User' : 'Reporter'} • {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                            <div>{msg.text}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(28, 26, 23, 0.6)', fontSize: '0.85rem' }}>
                  Select an incident report from the queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: User Feedback */}
        {activeTab === 'feedback' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Feedback Stats Cards Header */}
            <div
              style={{
                padding: '10px 18px',
                background: 'var(--parchment-dark)',
                borderBottom: '1px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>Avg Rating:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--ink)', color: 'var(--parchment)', padding: '2px 8px', fontSize: '0.82rem', fontWeight: 800 }}>
                    <Star size={13} fill="var(--rust-clay)" color="var(--rust-clay)" />
                    <span>{feedbackStats?.averageRating || '0.0'} / 5.0</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'rgba(28, 26, 23, 0.75)' }}>
                  Total Submissions: <strong>{feedbackStats?.total || 0}</strong>
                </div>
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'rgba(28, 26, 23, 0.6)' }}>Filter:</span>
                {['all', 'feature', 'bug', 'matchmaking', 'chat', 'general'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeedbackCategoryFilter(cat)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: feedbackCategoryFilter === cat ? 700 : 500,
                      border: '1px solid var(--ink)',
                      background: feedbackCategoryFilter === cat ? 'var(--ink)' : 'var(--parchment-card)',
                      color: feedbackCategoryFilter === cat ? 'var(--parchment)' : 'var(--ink)',
                      boxShadow: feedbackCategoryFilter === cat ? '1px 1px 0px var(--rust-clay)' : 'none',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Split layout: Feedback List & Detail */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
              {/* Left feedback list */}
              <div
                style={{
                  width: '340px',
                  maxWidth: '100%',
                  borderRight: '2px solid var(--ink)',
                  background: 'var(--parchment-card)',
                  overflowY: 'auto',
                  padding: '10px',
                  display: mobileDetailView ? 'none' : 'flex',
                  flexDirection: 'column',
                  flex: mobileDetailView ? 'none' : 1
                }}
              >
                {filteredFeedbacks.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'rgba(28, 26, 23, 0.65)', fontSize: '0.85rem' }}>
                    No feedback entries found in this category.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredFeedbacks.map((fb) => {
                      const isSelected = selectedFeedback?.id === fb.id;
                      return (
                        <div
                          key={fb.id}
                          onClick={() => handleSelectFeedback(fb)}
                          style={{
                            padding: '10px',
                            background: isSelected ? 'var(--ink)' : 'var(--parchment)',
                            color: isSelected ? 'var(--parchment)' : 'var(--ink)',
                            border: '1px solid var(--ink)',
                            boxShadow: isSelected ? '2px 2px 0px var(--rust-clay)' : '1px 1px 0px var(--ink)',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  color={isSelected ? '#FFFFFF' : 'var(--ink)'}
                                  fill={s <= (fb.rating || 5) ? 'var(--rust-clay)' : 'transparent'}
                                />
                              ))}
                            </div>

                            <span
                              style={{
                                fontSize: '0.66rem',
                                padding: '1px 5px',
                                border: '1px solid var(--ink)',
                                background: fb.status === 'new' ? '#FAF3F0' : fb.status === 'resolved' ? 'var(--sage)' : 'var(--parchment-dark)',
                                color: fb.status === 'new' ? 'var(--rust-clay)' : fb.status === 'resolved' ? '#FFFFFF' : 'var(--ink)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}
                            >
                              {fb.status}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: isSelected ? '#FFFFFF' : 'var(--rust-clay)',
                              marginBottom: '2px'
                            }}
                          >
                            [{fb.category}]
                          </div>

                          <p
                            style={{
                              fontSize: '0.8rem',
                              margin: 0,
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(28, 26, 23, 0.85)'
                            }}
                          >
                            {fb.comment}
                          </p>

                          <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                            {new Date(fb.createdAt).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right feedback detail */}
              <div
                style={{
                  flex: 2,
                  display: !mobileDetailView && window.innerWidth < 768 ? 'none' : 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflowY: 'auto',
                  background: 'var(--parchment)',
                  padding: '16px 20px'
                }}
              >
                {selectedFeedback ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Header Detail */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--ink)', paddingBottom: '12px' }}>
                      <div>
                        <span className="eyebrow" style={{ color: 'var(--rust-clay)' }}>USER INSIGHT</span>
                        <h4 style={{ fontSize: '1.2rem', margin: '2px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                          Category: {selectedFeedback.category?.toUpperCase()}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={15}
                                color="var(--ink)"
                                fill={s <= (selectedFeedback.rating || 5) ? 'var(--rust-clay)' : 'transparent'}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                            {selectedFeedback.rating} / 5 Stars
                          </span>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleFeedbackStatus(selectedFeedback.id, 'reviewed')}
                          className="btn btn-subtle"
                          style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px' }}
                        >
                          <Check size={13} /> Mark Reviewed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedbackStatus(selectedFeedback.id, 'resolved')}
                          className="btn btn-subtle"
                          style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', background: 'var(--sage)', color: '#FFFFFF' }}
                        >
                          <CheckCircle2 size={13} /> Mark Resolved
                        </button>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid var(--ink)',
                        boxShadow: '3px 3px 0px var(--ink)',
                        padding: '16px'
                      }}
                    >
                      <h5 style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'rgba(28, 26, 23, 0.65)', margin: '0 0 8px 0' }}>
                        Feedback Notes:
                      </h5>
                      <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {selectedFeedback.comment}
                      </p>
                    </div>

                    {/* Metadata Card */}
                    <div
                      style={{
                        background: 'var(--parchment-card)',
                        border: '1px solid var(--ink)',
                        padding: '12px',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div><strong>Feedback ID:</strong> {selectedFeedback.id}</div>
                      <div><strong>Submitter User ID:</strong> {selectedFeedback.userId}</div>
                      {selectedFeedback.email && <div><strong>Contact / Email:</strong> {selectedFeedback.email}</div>}
                      <div><strong>Timestamp:</strong> {new Date(selectedFeedback.createdAt).toLocaleString()}</div>
                      {selectedFeedback.clientInfo?.screen && <div><strong>Screen Size:</strong> {selectedFeedback.clientInfo.screen}</div>}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(28, 26, 23, 0.6)', fontSize: '0.85rem' }}>
                    Select a feedback submission from the sidebar.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
