import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, X, Check, Ban, AlertTriangle, MessageSquare, Clock } from 'lucide-react';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
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

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = async (reportId, action) => {
    try {
      const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
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

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '900px',
          width: '95%',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-card)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(0, 242, 254, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Moderation & Safety Center</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Live Incident Queue & Ephemeral Buffer Auditing
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="btn btn-subtle"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin-slow' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
          {/* Reports Sidebar */}
          <div
            style={{
              borderRight: '1px solid var(--border-card)',
              background: 'rgba(0, 0, 0, 0.2)',
              overflowY: 'auto',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              REPORTS QUEUE ({reports.length})
            </div>

            {reports.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active incident reports. The platform is running cleanly!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reports.map((rep) => {
                  const isSelected = selectedReport?.id === rep.id;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: rep.category === 'harassment' ? 'var(--accent-rose)' : 'var(--accent-amber)'
                          }}
                        >
                          {rep.category.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: rep.status === 'pending' ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 230, 118, 0.2)',
                            color: rep.status === 'pending' ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                          }}
                        >
                          {rep.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Target: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{rep.reportedId?.slice(0, 12)}...</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(rep.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Report Detail View */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {selectedReport ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto' }}>
                {/* Header detail */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Report #{selectedReport.id.slice(0, 8)}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Category: <strong>{selectedReport.category}</strong> • Submitted: {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {selectedReport.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleAction(selectedReport.id, 'dismiss')}
                        className="btn btn-subtle"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Check size={14} /> Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(selectedReport.id, 'ban')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Ban size={14} /> Ban User
                      </button>
                    </div>
                  )}
                </div>

                {selectedReport.details && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <strong>Reporter's Note:</strong> {selectedReport.details}
                  </div>
                )}

                {/* Rolling Buffer Chat Snapshot */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={16} /> Attached Rolling Chat Snapshot ({selectedReport.chatSnapshot?.length || 0} messages)
                  </div>

                  <div
                    style={{
                      background: '#090b10',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      flex: 1,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {selectedReport.chatSnapshot?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No messages in buffer.</p>
                    ) : (
                      selectedReport.chatSnapshot.map((msg, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: msg.senderId === selectedReport.reportedId ? 'rgba(255, 51, 102, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            borderLeft: msg.senderId === selectedReport.reportedId ? '3px solid var(--accent-rose)' : '3px solid var(--accent-cyan)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Select a report from the queue to review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
