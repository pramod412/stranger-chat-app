import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, X, Check, Ban, AlertTriangle, MessageSquare, Clock, ArrowLeft } from 'lucide-react';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [mobileDetailView, setMobileDetailView] = useState(false);

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
      setMobileDetailView(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectReport = (rep) => {
    setSelectedReport(rep);
    setMobileDetailView(true);
  };

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
            gap: '8px'
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
                Moderation Center
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'rgba(28, 26, 23, 0.7)', margin: 0 }}>
                {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} in Buffer
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="btn btn-subtle"
              style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={loading ? 'spin-slow' : ''} />
              <span className="desktop-only">Refresh</span>
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

        {/* Content Layout - Fluid Desktop / Mobile Stack */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
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
                No active incident reports. The platform is running cleanly!
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
                          {rep.category.replace('_', ' ')}
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
                {/* Header detail */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '2px' }}>
                      Report #{selectedReport.id.slice(0, 8)}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(28, 26, 23, 0.75)', fontFamily: 'var(--font-mono)' }}>
                      Category: <strong>{selectedReport.category}</strong> • {new Date(selectedReport.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {selectedReport.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleAction(selectedReport.id, 'dismiss')}
                        className="btn btn-subtle"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      >
                        <Check size={13} /> Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(selectedReport.id, 'ban')}
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      >
                        <Ban size={13} /> Ban User
                      </button>
                    </div>
                  )}
                </div>

                {selectedReport.details && (
                  <div
                    style={{
                      background: 'var(--parchment-card)',
                      border: '1px solid var(--ink)',
                      boxShadow: '1px 1px 0px var(--ink)',
                      padding: '10px 12px',
                      marginBottom: '12px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <strong>Reporter's Note:</strong> {selectedReport.details}
                  </div>
                )}

                {/* Rolling Buffer Chat Snapshot */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--rust-clay)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} /> Ephemeral Chat Snapshot ({selectedReport.chatSnapshot?.length || 0} messages)
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid var(--ink)',
                      boxShadow: '2px 2px 0px var(--ink)',
                      padding: '10px',
                      flex: 1,
                      overflowY: 'auto',
                      WebkitOverflowScrolling: 'touch',
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
                Select a report from the queue to review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
