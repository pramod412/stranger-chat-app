import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, User, Maximize2, Minimize2 } from 'lucide-react';
import { useWebRTC } from '../../contexts/WebRTCContext';
import { useSocket } from '../../contexts/SocketContext';

export const VideoGrid = () => {
  const {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    peerMediaState,
    toggleVideo,
    toggleAudio
  } = useWebRTC();
  const { currentMatch, matchState } = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Bind local stream and ensure play() is executed
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (videoEl) {
      if (localStream) {
        if (videoEl.srcObject !== localStream) {
          videoEl.srcObject = localStream;
        }
        videoEl.play().catch((err) => {
          console.log('Local video play notice:', err?.name);
        });
      } else {
        videoEl.srcObject = null;
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
    }
  }, [localStream, isVideoEnabled]);

  // Bind remote stream with immediate termination and memory buffer purge
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (videoEl) {
      if (remoteStream && matchState === 'connected') {
        if (videoEl.srcObject !== remoteStream) {
          videoEl.srcObject = remoteStream;
        }
        videoEl.play().catch((err) => {
          console.log('Remote video play notice:', err?.name);
        });
      } else {
        // Immediate termination: drop srcObject, pause, and purge frame buffer
        videoEl.srcObject = null;
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
    }
  }, [remoteStream, peerMediaState?.videoEnabled, matchState]);

  const strangerName = currentMatch?.peerDisplayName || 'Stranger';
  const isRemoteVideoActive = remoteStream && peerMediaState?.videoEnabled !== false && matchState === 'connected';
  const isLocalVideoActive = localStream && isVideoEnabled;

  return (
    <div
      className="video-stage"
      style={{
        maxHeight: isExpanded ? '55vh' : undefined,
        transition: 'max-height 0.25s ease',
        background: 'var(--bg-surface-muted)',
        borderBottom: '2px solid var(--border)'
      }}
    >
      {/* 1. Remote Stranger Video Feed */}
      <div
        className="video-frame"
        style={{
          flex: 1.2,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '2.5px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Permanent Video Element */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isRemoteVideoActive ? 'block' : 'none'
          }}
        />

        {/* Remote Camera-Off / Placeholder Overlay */}
        {!isRemoteVideoActive && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              padding: '16px',
              background: 'rgba(20, 22, 26, 0.94)'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <User size={26} color="#FFFFFF" />
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-sans)', opacity: 0.9, fontWeight: 500 }}>
              {currentMatch && matchState === 'connected' ? `${strangerName}'s Camera is Off` : 'Waiting for Stranger Video...'}
            </p>
          </div>
        )}

        {/* Remote Identifier Badge */}
        <div className="video-badge-tag">
          <span style={{ color: 'var(--accent)', fontWeight: 900 }}>●</span>
          <span>{strangerName}</span>
          {peerMediaState?.audioEnabled === false && (
            <MicOff size={12} color="var(--accent)" style={{ marginLeft: '2px' }} />
          )}
        </div>

        {/* Quick expand/minimize toggle on video stage */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(20, 22, 26, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 'var(--radius-pill)',
            color: '#FFFFFF',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5
          }}
          title={isExpanded ? 'Compact video view' : 'Expand video view'}
          aria-label={isExpanded ? 'Compact video view' : 'Expand video view'}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* 2. Local User Video Feed */}
      <div
        className="video-frame"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '2.5px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Permanent Local Video Element */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror local view
            display: isLocalVideoActive ? 'block' : 'none'
          }}
        />

        {/* Local Camera-Off Overlay */}
        {!isLocalVideoActive && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              padding: '16px',
              background: 'rgba(20, 22, 26, 0.94)'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <User size={26} color="#FFFFFF" />
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-sans)', opacity: 0.9, fontWeight: 500 }}>
              Your Camera is Off
            </p>
          </div>
        )}

        {/* Local Identifier Badge */}
        <div className="video-badge-tag">
          <span style={{ color: 'var(--teal)', fontWeight: 900 }}>●</span>
          <span>You</span>
        </div>

        {/* Local Ergonomic Control Overlay */}
        <div className="video-controls-overlay">
          <button
            type="button"
            onClick={toggleAudio}
            className={`video-action-btn ${!isAudioEnabled ? 'active-off' : ''}`}
            style={{
              background: isAudioEnabled ? 'var(--teal)' : 'var(--text-muted)'
            }}
            title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            aria-label={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            className={`video-action-btn ${!isVideoEnabled ? 'active-off' : ''}`}
            style={{
              background: isVideoEnabled ? 'var(--purple)' : 'var(--text-muted)'
            }}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            aria-label={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoEnabled ? <VideoIcon size={16} /> : <VideoOff size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
export default VideoGrid;
