import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, User, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
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
  const [hasRemoteVideoFrames, setHasRemoteVideoFrames] = useState(false);

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
      if (isRemote && (err?.name === 'NotAllowedError' || err?.name === 'AbortError')) {
        // Autoplay policy prevented unmuted sound: mute temporarily to allow visual video rendering
        videoEl.muted = true;
        try {
          await videoEl.play();
          setRemoteMutedByBrowser(true);
        } catch (e) {
          console.error('Muted autoplay fallback failed:', e);
        }
      }
    }
  }, []);

  // Unmute remote video on user interaction if restricted by browser
  const handleUnmuteRemote = () => {
    const videoEl = remoteVideoRef.current;
    if (videoEl) {
      videoEl.muted = false;
      videoEl.play().then(() => setRemoteMutedByBrowser(false)).catch(() => {});
    }
  };

  // Bind local stream
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (videoEl) {
      if (localStream) {
        if (videoEl.srcObject !== localStream) {
          videoEl.srcObject = localStream;
        }
        attemptPlay(videoEl, false);
      } else {
        videoEl.srcObject = null;
      }
    }
  }, [localStream, isVideoEnabled, attemptPlay]);

  // Bind remote stream and monitor track availability
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (videoEl) {
      if (remoteStream && matchState === 'connected') {
        if (videoEl.srcObject !== remoteStream) {
          videoEl.srcObject = remoteStream;
        }
        attemptPlay(videoEl, true);

        const videoTracks = remoteStream.getVideoTracks();
        if (videoTracks.length > 0) {
          const vTrack = videoTracks[0];
          setHasRemoteVideoFrames(vTrack.enabled && vTrack.readyState === 'live');

          const handleTrackState = () => {
            setHasRemoteVideoFrames(vTrack.enabled && vTrack.readyState === 'live');
          };

          vTrack.addEventListener('unmute', handleTrackState);
          vTrack.addEventListener('mute', handleTrackState);
          vTrack.addEventListener('ended', handleTrackState);

          return () => {
            vTrack.removeEventListener('unmute', handleTrackState);
            vTrack.removeEventListener('mute', handleTrackState);
            vTrack.removeEventListener('ended', handleTrackState);
          };
        } else {
          setHasRemoteVideoFrames(false);
        }
      } else {
        videoEl.srcObject = null;
        setHasRemoteVideoFrames(false);
      }
    }
  }, [remoteStream, peerMediaState?.videoEnabled, matchState, attemptPlay]);

  const strangerName = currentMatch?.peerDisplayName || 'Stranger';
  const isRemoteVideoActive = (hasRemoteVideoFrames || (remoteStream && remoteStream.getVideoTracks().length > 0)) &&
    peerMediaState?.videoEnabled !== false &&
    matchState === 'connected';
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
          boxShadow: 'var(--shadow-sm)',
          background: '#0E1013'
        }}
      >
        {/* Permanent Video Element */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          onLoadedMetadata={(e) => attemptPlay(e.target, true)}
          onCanPlay={(e) => attemptPlay(e.target, true)}
          onPlaying={() => setHasRemoteVideoFrames(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Remote Camera-Off / Connecting Overlay */}
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
            background: 'rgba(20, 22, 26, 0.94)',
            opacity: isRemoteVideoActive ? 0 : 1,
            pointerEvents: isRemoteVideoActive ? 'none' : 'auto',
            transition: 'opacity 0.2s ease',
            zIndex: 2
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
            {currentMatch && matchState === 'connected'
              ? `${strangerName}'s Camera is Off`
              : 'Connecting to Stranger Video...'}
          </p>
        </div>

        {/* Unmute Prompt if browser blocked initial autoplay audio */}
        {remoteMutedByBrowser && isRemoteVideoActive && (
          <button
            type="button"
            onClick={handleUnmuteRemote}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'var(--accent)',
              color: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              zIndex: 6,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <VolumeX size={13} />
            <span>Click to Unmute</span>
          </button>
        )}

        {/* Remote Identifier Badge */}
        <div className="video-badge-tag" style={{ zIndex: 5 }}>
          <span style={{ color: isRemoteVideoActive ? 'var(--teal)' : 'var(--accent)', fontWeight: 900 }}>●</span>
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
            zIndex: 6
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
          boxShadow: 'var(--shadow-sm)',
          background: '#0E1013'
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
            background: 'rgba(20, 22, 26, 0.94)',
            opacity: isLocalVideoActive ? 0 : 1,
            pointerEvents: isLocalVideoActive ? 'none' : 'auto',
            transition: 'opacity 0.2s ease',
            zIndex: 2
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

        {/* Local Identifier Badge */}
        <div className="video-badge-tag" style={{ zIndex: 5 }}>
          <span style={{ color: isLocalVideoActive ? 'var(--teal)' : 'var(--accent)', fontWeight: 900 }}>●</span>
          <span>You</span>
        </div>

        {/* Local Ergonomic Control Overlay */}
        <div className="video-controls-overlay" style={{ zIndex: 6 }}>
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

