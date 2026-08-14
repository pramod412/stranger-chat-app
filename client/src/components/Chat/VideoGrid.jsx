import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, User } from 'lucide-react';
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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(10, 14, 23, 0.95)',
        borderBottom: '2px solid var(--ink)',
        maxHeight: '35vh',
        overflow: 'hidden'
      }}
    >
      {/* Remote Stranger Video View */}
      <div
        style={{
          position: 'relative',
          background: '#07090e',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
          aspectRatio: '4/3'
        }}
      >
        {remoteStream && peerMediaState.videoEnabled ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto'
              }}
            >
              <User size={30} />
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              {currentMatch ? `${currentMatch.peerDisplayName}'s Camera is Off` : 'Waiting for Video...'}
            </p>
          </div>
        )}

        {/* Remote Overlay Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>{currentMatch?.peerDisplayName || 'Stranger'}</span>
          {!peerMediaState.audioEnabled && <MicOff size={12} color="var(--accent-rose)" />}
        </div>
      </div>

      {/* Local User Video View */}
      <div
        style={{
          position: 'relative',
          background: '#07090e',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
          aspectRatio: '4/3'
        }}
      >
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto'
              }}
            >
              <User size={30} />
            </div>
            <p style={{ fontSize: '0.85rem' }}>Your Camera is Off</p>
          </div>
        )}

        {/* Local Media Controls Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#fff'
          }}
        >
          <span>You</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            display: 'flex',
            gap: '6px'
          }}
        >
          <button
            type="button"
            onClick={toggleAudio}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isAudioEnabled ? 'rgba(255, 255, 255, 0.2)' : 'var(--accent-rose)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isAudioEnabled ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isAudioEnabled ? <Mic size={15} /> : <MicOff size={15} />}
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isVideoEnabled ? 'rgba(255, 255, 255, 0.2)' : 'var(--accent-rose)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isVideoEnabled ? 'Turn Off Cam' : 'Turn On Cam'}
          >
            {isVideoEnabled ? <VideoIcon size={15} /> : <VideoOff size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
