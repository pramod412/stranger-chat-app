import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, User, Maximize2, Minimize2, VolumeX } from 'lucide-react';
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
  const [remoteMutedByBrowser, setRemoteMutedByBrowser] = useState(false);

  // Play helper with browser autoplay policy fallback
  const attemptPlay = useCallback(async (videoEl, isRemote = false) => {
    if (!videoEl || !videoEl.srcObject) return;
    try {
      await videoEl.play();
      if (isRemote) {
        setRemoteMutedByBrowser(false);
      }
    } catch (err) {
      console.warn(`Autoplay note for ${isRemote ? 'remote' : 'local'} video:`, err?.name);
      if (isRemote) {
        // Autoplay policy prevented unmuted sound: mute temporarily to allow visual video rendering
        videoEl.muted = true;
        try {
          await videoEl.play();
          setRemoteMutedByBrowser(true);
        } catch (e) {
          console.error('Muted autoplay fallback error:', e);
        }
      }
    }
  }, []);

  // Unmute remote video on user interaction if restricted by browser autoplay policy
  const handleUnmuteRemote = () => {
    const videoEl = remoteVideoRef.current;
    if (videoEl) {
      videoEl.muted = false;
      videoEl.play().then(() => setRemoteMutedByBrowser(false)).catch(() => {});
    }
  };

  // Bind local stream with continuous audio/video track persistence
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (videoEl) {
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('webkit-playsinline', 'true');
      videoEl.muted = true;

      if (localStream) {
        if (videoEl.srcObject !== localStream) {
          videoEl.srcObject = localStream;
        }
        attemptPlay(videoEl, false);
      } else {
        videoEl.srcObject = null;
      }
    }
  }, [localStream, attemptPlay]);

  // Bind remote stream: Keep video element ALWAYS attached in DOM so audio never cuts out when video toggles
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (videoEl) {
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('webkit-playsinline', 'true');

      if (remoteStream && matchState === 'connected') {
        if (videoEl.srcObject !== remoteStream) {
          videoEl.srcObject = remoteStream;
        }
        attemptPlay(videoEl, true);
      } else {
        videoEl.srcObject = null;
      }
    }
  }, [remoteStream, matchState, attemptPlay]);

  const strangerName = currentMatch?.peerDisplayName || 'Stranger';
  const hasRemoteVideoTracks = Boolean(remoteStream && remoteStream.getVideoTracks().length > 0);
  const isRemoteVideoActive = hasRemoteVideoTracks && peerMediaState?.videoEnabled !== false && matchState === 'connected';
  const isLocalVideoActive = Boolean(localStream && isVideoEnabled);

  return (
    <div
      className="video-stage"
      style={{
        maxHeight: isExpanded ? '55vh' : undefined,
        transition: 'max-height 0.25s ease',
        background: 'var(--parchment-card)',
        borderBottom: '2px solid var(--ink)'
      }}
    >
      {/* 1. Remote Stranger Video Feed */}
      <div
        className="video-frame"
        style={{
          flex: 1.2,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0px',
          border: '2px solid var(--ink)',
          boxShadow: '3px 3px 0px var(--ink)',
          background: '#1C1A17'
        }}
      >
        {/* Permanent Video Element: Always active in DOM to prevent voice desync/dropouts */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          onLoadedMetadata={(e) => attemptPlay(e.target, true)}
          onCanPlay={(e) => attemptPlay(e.target, true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Remote Camera-Off Overlay: Sits on top when peer disables camera, allowing sound to keep streaming */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            padding: '16px',
            background: 'rgba(28, 26, 23, 0.94)',
            opacity: isRemoteVideoActive ? 0 : 1,
            pointerEvents: isRemoteVideoActive ? 'none' : 'auto',
            transition: 'opacity 0.15s ease',
            zIndex: 2
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto'
            }}
          >
            <User size={26} color="#FFFFFF" />
          </div>
          <p style={{ fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-heading)', opacity: 0.9 }}>
            {currentMatch && matchState === 'connected'
              ? `${strangerName}'s Camera is Off`
              : 'Connecting to Stranger Video...'}
          </p>
        </div>

        {/* Unmute Prompt if browser blocked initial autoplay audio */}
        {remoteMutedByBrowser && (
          <button
            type="button"
            onClick={handleUnmuteRemote}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'var(--rust-clay)',
              color: '#FFFFFF',
              border: '1.5px solid var(--ink)',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              zIndex: 6,
              boxShadow: '2px 2px 0px var(--ink)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            <VolumeX size={13} />
            <span>Click to Unmute</span>
          </button>
        )}

        {/* Remote Identifier Badge */}
        <div className="video-badge-tag" style={{ zIndex: 5 }}>
          <span style={{ color: isRemoteVideoActive ? 'var(--sage)' : 'var(--rust-clay)', fontWeight: 900 }}>●</span>
          <span>{strangerName}</span>
          {peerMediaState?.audioEnabled === false ? (
            <MicOff size={12} color="var(--rust-clay)" style={{ marginLeft: '2px' }} title="Stranger Muted Microphone" />
          ) : (
            <span style={{ fontSize: '0.65rem', color: 'var(--sage)', fontWeight: 700, marginLeft: '2px' }}>🎙️</span>
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
            background: 'var(--parchment-card)',
            border: '1.5px solid var(--ink)',
            color: 'var(--ink)',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 6,
            boxShadow: '1px 1px 0px var(--ink)'
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
          borderRadius: '0px',
          border: '2px solid var(--ink)',
          boxShadow: '3px 3px 0px var(--ink)',
          background: '#1C1A17'
        }}
      >
        {/* Permanent Local Video Element */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={(e) => attemptPlay(e.target, false)}
          onCanPlay={(e) => attemptPlay(e.target, false)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror local view
            display: 'block'
          }}
        />

        {/* Local Camera-Off Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            padding: '16px',
            background: 'rgba(28, 26, 23, 0.94)',
            opacity: isLocalVideoActive ? 0 : 1,
            pointerEvents: isLocalVideoActive ? 'none' : 'auto',
            transition: 'opacity 0.15s ease',
            zIndex: 2
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto'
            }}
          >
            <User size={26} color="#FFFFFF" />
          </div>
          <p style={{ fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-heading)', opacity: 0.9 }}>
            Your Camera is Off
          </p>
        </div>

        {/* Local Identifier Badge */}
        <div className="video-badge-tag" style={{ zIndex: 5 }}>
          <span style={{ color: isLocalVideoActive ? 'var(--sage)' : 'var(--rust-clay)', fontWeight: 900 }}>●</span>
          <span>You</span>
          {!isAudioEnabled && (
            <MicOff size={12} color="var(--rust-clay)" style={{ marginLeft: '2px' }} title="You are Muted" />
          )}
        </div>

        {/* Local Controls Overlay */}
        <div className="video-controls-overlay" style={{ zIndex: 6 }}>
          <button
            type="button"
            onClick={toggleAudio}
            className={`video-action-btn ${!isAudioEnabled ? 'active-off' : ''}`}
            style={{
              background: isAudioEnabled ? 'var(--sage)' : 'var(--rust-clay)',
              color: '#FFFFFF',
              border: '1.5px solid var(--ink)',
              boxShadow: '1px 1px 0px var(--ink)',
              borderRadius: '0px'
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
              background: isVideoEnabled ? 'var(--rust-clay)' : 'var(--putty-bg)',
              color: '#FFFFFF',
              border: '1.5px solid var(--ink)',
              boxShadow: '1px 1px 0px var(--ink)',
              borderRadius: '0px'
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
