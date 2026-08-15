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
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--border)',
          background: 'var(--bg-surface)'
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--bg-surface-muted)',
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
                width: '34px',
                height: '34px',
                background: 'var(--teal-bg)',
                color: 'var(--teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--teal)',
                borderRadius: 'var(--radius-pill)',
                flexShrink: 0
              }}
            >
              <Shield size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Admin & Community Center
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-sans)' }}>
                {reports.length} Incidents • {feedbacks.length} User Feedbacks
              </p>
            </div>
          </div>

          {/* Tab switchers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('reports'); setMobileDetailView(false); }}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                border: activeTab === 'reports' ? '2px solid var(--accent)' : '1.5px solid var(--border-soft)',
                background: activeTab === 'reports' ? 'var(--accent)' : 'var(--bg-surface)',
                color: activeTab === 'reports' ? 'var(--on-accent)' : 'var(--text-primary)',
                boxShadow: activeTab === 'reports' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Shield size={14} />
              <span>Reports ({reports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('feedback'); setMobileDetailView(false); }}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                border: activeTab === 'feedback' ? '2px solid var(--accent)' : '1.5px solid var(--border-soft)',
                background: activeTab === 'feedback' ? 'var(--accent)' : 'var(--bg-surface)',
                color: activeTab === 'feedback' ? 'var(--on-accent)' : 'var(--text-primary)',
                boxShadow: activeTab === 'feedback' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <MessageSquareHeart size={14} />
              <span>Feedback ({feedbacks.length})</span>
            </button>

            <button
              type="button"
              onClick={refreshAll}
              disabled={loading}
              className="btn btn-subtle"
              style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)' }}
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '6px' }}
              aria-label="Close admin dashboard"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Incident Reports */}
        {activeTab === 'reports' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
            {/* Reports Sidebar */}
            <div
              style={{
                width: '320px',
                maxWidth: '100%',
                borderRight: '2px solid var(--border)',
                background: 'var(--bg-surface-muted)',
                overflowY: 'auto',
                padding: '10px',
                display: mobileDetailView ? 'none' : 'flex',
                flexDirection: 'column',
                flex: mobileDetailView ? 'none' : 1
              }}
            >
              <div style={{ fontSize: '0.76rem', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Incidents Queue ({reports.length})
              </div>

              {reports.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                          padding: '10px',
                          background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--bg-surface)' : 'var(--text-primary)',
                          border: isSelected ? '2px solid var(--text-primary)' : '1.5px solid var(--border-soft)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-sans)',
                              textTransform: 'uppercase',
                              color: isSelected ? '#FFFFFF' : 'var(--accent)'
                            }}
                          >
                            {rep.category?.replace('_', ' ')}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-pill)',
                              background: rep.status === 'pending' ? 'var(--pink-bg)' : 'var(--teal-bg)',
                              color: rep.status === 'pending' ? 'var(--pink)' : 'var(--teal)',
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 700
                            }}
                          >
                            {rep.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-secondary)' }}>
                          Target: <span style={{ fontFamily: 'var(--font-mono)' }}>{rep.reportedId?.slice(0, 10)}...</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
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
                background: 'var(--bg-surface)'
              }}
            >
              {selectedReport ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span className="eyebrow" style={{ color: 'var(--accent)' }}>INCIDENT AUDIT</span>
                      <h4 style={{ fontSize: '1.15rem', margin: '2px 0 4px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                        Category: {selectedReport.category?.toUpperCase()}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                        Report ID: {selectedReport.id} • {new Date(selectedReport.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                        className="btn btn-subtle"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                      >
                        <Check size={14} /> Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReportAction(selectedReport.id, 'ban')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                      >
                        <Ban size={14} /> Ban Offender
                      </button>
                    </div>
                  </div>

                  {/* Incident Snapshot */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      <MessageSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Ephemeral Chat Buffer Snapshot ({selectedReport.chatSnapshot?.length || 0} messages)
                    </div>

                    <div
                      style={{
                        background: 'var(--bg-surface-muted)',
                        border: '2px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        padding: '12px',
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {selectedReport.chatSnapshot?.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontFamily: 'var(--font-sans)' }}>No messages in buffer.</p>
                      ) : (
                        selectedReport.chatSnapshot.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '8px 12px',
                              background: msg.senderId === selectedReport.reportedId ? 'var(--pink-bg)' : 'var(--bg-surface)',
                              borderLeft: msg.senderId === selectedReport.reportedId ? '3px solid var(--pink)' : '3px solid var(--teal)',
                              borderTop: '1px solid var(--border-soft)',
                              borderRight: '1px solid var(--border-soft)',
                              borderBottom: '1px solid var(--border-soft)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.88rem',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '2px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
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
                background: 'var(--bg-surface-muted)',
                borderBottom: '1.5px solid var(--border-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text-primary)' }}>Avg Rating:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: '2px 10px', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    <Star size={13} fill="var(--accent)" color="var(--accent)" />
                    <span>{feedbackStats?.averageRating || '0.0'} / 5.0</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
                  Total Submissions: <strong>{feedbackStats?.total || 0}</strong>
                </div>
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
                {['all', 'feature', 'bug', 'matchmaking', 'chat', 'general'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeedbackCategoryFilter(cat)}
                    style={{
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: feedbackCategoryFilter === cat ? 700 : 500,
                      border: feedbackCategoryFilter === cat ? '1.5px solid var(--accent)' : '1px solid var(--border-soft)',
                      borderRadius: 'var(--radius-pill)',
                      background: feedbackCategoryFilter === cat ? 'var(--accent)' : 'var(--bg-surface)',
                      color: feedbackCategoryFilter === cat ? 'var(--on-accent)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.1s ease'
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
                  borderRight: '2px solid var(--border)',
                  background: 'var(--bg-surface-muted)',
                  overflowY: 'auto',
                  padding: '10px',
                  display: mobileDetailView ? 'none' : 'flex',
                  flexDirection: 'column',
                  flex: mobileDetailView ? 'none' : 1
                }}
              >
                {filteredFeedbacks.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                            background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--bg-surface)' : 'var(--text-primary)',
                            border: isSelected ? '2px solid var(--text-primary)' : '1.5px solid var(--border-soft)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={12}
                                  color={isSelected ? '#FFFFFF' : 'var(--accent)'}
                                  fill={s <= (fb.rating || 5) ? 'var(--accent)' : 'transparent'}
                                />
                              ))}
                            </div>

                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-pill)',
                                background: fb.status === 'new' ? 'var(--pink-bg)' : fb.status === 'resolved' ? 'var(--teal-bg)' : 'var(--bg-surface-muted)',
                                color: fb.status === 'new' ? 'var(--pink)' : fb.status === 'resolved' ? 'var(--teal)' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}
                            >
                              {fb.status}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '0.74rem',
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: isSelected ? '#FFFFFF' : 'var(--accent)',
                              marginBottom: '2px'
                            }}
                          >
                            [{fb.category}]
                          </div>

                          <p
                            style={{
                              fontSize: '0.82rem',
                              margin: 0,
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-primary)'
                            }}
                          >
                            {fb.comment}
                          </p>

                          <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
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
                  background: 'var(--bg-surface)',
                  padding: '16px 20px'
                }}
              >
                {selectedFeedback ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Header Detail */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1.5px solid var(--border-soft)', paddingBottom: '12px' }}>
                      <div>
                        <span className="eyebrow" style={{ color: 'var(--accent)' }}>USER INSIGHT</span>
                        <h4 style={{ fontSize: '1.25rem', margin: '2px 0 4px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                          Category: {selectedFeedback.category?.toUpperCase()}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={16}
                                color="var(--accent)"
                                fill={s <= (selectedFeedback.rating || 5) ? 'var(--accent)' : 'transparent'}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.84rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                          style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px' }}
                        >
                          <Check size={14} /> Mark Reviewed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedbackStatus(selectedFeedback.id, 'resolved')}
                          className="btn btn-subtle"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px', background: 'var(--teal-bg)', color: 'var(--teal)', border: '1.5px solid var(--teal)' }}
                        >
                          <CheckCircle2 size={14} /> Mark Resolved
                        </button>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div
                      style={{
                        background: 'var(--bg-surface-muted)',
                        border: '2px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        padding: '16px'
                      }}
                    >
                      <h5 style={{ fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0', fontWeight: 700 }}>
                        Feedback Notes:
                      </h5>
                      <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {selectedFeedback.comment}
                      </p>
                    </div>

                    {/* Metadata Card */}
                    <div
                      style={{
                        background: 'var(--bg-surface-muted)',
                        border: '1.5px solid var(--border-soft)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div><strong style={{ color: 'var(--text-primary)' }}>Feedback ID:</strong> {selectedFeedback.id}</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Submitter User ID:</strong> {selectedFeedback.userId}</div>
                      {selectedFeedback.email && <div><strong style={{ color: 'var(--text-primary)' }}>Contact / Email:</strong> {selectedFeedback.email}</div>}
                      <div><strong style={{ color: 'var(--text-primary)' }}>Timestamp:</strong> {new Date(selectedFeedback.createdAt).toLocaleString()}</div>
                      {selectedFeedback.clientInfo?.screen && <div><strong style={{ color: 'var(--text-primary)' }}>Screen Size:</strong> {selectedFeedback.clientInfo.screen}</div>}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
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
export default AdminDashboard;
