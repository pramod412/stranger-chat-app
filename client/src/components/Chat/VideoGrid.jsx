import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, User, Sparkles, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
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
  const { currentMatch } = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const strangerName = currentMatch?.peerDisplayName || 'Stranger';

  return (
    <div
      className="video-stage"
      style={{
        maxHeight: isExpanded ? '55vh' : undefined,
        transition: 'max-height 0.25s ease'
      }}
    >
      {/* 1. Remote Stranger Video Feed */}
      <div className="video-frame" style={{ flex: 1.2 }}>
        {remoteStream && peerMediaState?.videoEnabled !== false ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--parchment)', padding: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(240, 236, 223, 0.1)',
                border: '1px solid rgba(240, 236, 223, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                boxShadow: '1px 1px 0px rgba(0,0,0,0.5)'
              }}
            >
              <User size={24} color="var(--parchment)" />
            </div>
            <p style={{ fontSize: '0.78rem', margin: 0, fontFamily: 'var(--font-mono)', opacity: 0.85 }}>
              {currentMatch ? `${strangerName}'s Camera is Off` : 'Waiting for Stranger Video...'}
            </p>
          </div>
        )}

        {/* Remote Identifier Badge */}
        <div className="video-badge-tag">
          <span style={{ color: 'var(--rust-clay)', fontWeight: 800 }}>●</span>
          <span>{strangerName}</span>
          {peerMediaState?.audioEnabled === false && (
            <MicOff size={11} color="var(--rust-clay)" style={{ marginLeft: '2px' }} />
          )}
        </div>

        {/* Quick expand/minimize toggle on video stage */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(28, 26, 23, 0.8)',
            border: '1px solid rgba(240, 236, 223, 0.4)',
            color: 'var(--parchment)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5
          }}
          title={isExpanded ? 'Compact video view' : 'Expand video view'}
        >
          {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>

      {/* 2. Local User Video Feed */}
      <div className="video-frame" style={{ flex: 1 }}>
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror local view
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--parchment)', padding: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(240, 236, 223, 0.1)',
                border: '1px solid rgba(240, 236, 223, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                boxShadow: '1px 1px 0px rgba(0,0,0,0.5)'
              }}
            >
              <User size={24} color="var(--parchment)" />
            </div>
            <p style={{ fontSize: '0.78rem', margin: 0, fontFamily: 'var(--font-mono)', opacity: 0.85 }}>
              Your Camera is Off
            </p>
          </div>
        )}

        {/* Local Identifier Badge */}
        <div className="video-badge-tag">
          <span style={{ color: 'var(--sage)', fontWeight: 800 }}>●</span>
          <span>You</span>
        </div>

        {/* Local Ergonomic Control Overlay */}
        <div className="video-controls-overlay">
          <button
            type="button"
            onClick={toggleAudio}
            className={`video-action-btn ${!isAudioEnabled ? 'active-off' : ''}`}
            title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isAudioEnabled ? <Mic size={15} /> : <MicOff size={15} />}
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            className={`video-action-btn ${!isVideoEnabled ? 'active-off' : ''}`}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoEnabled ? <VideoIcon size={15} /> : <VideoOff size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
