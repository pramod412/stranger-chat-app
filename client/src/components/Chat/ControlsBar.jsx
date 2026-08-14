import React, { useState } from 'react';
import { FastForward, Square, Volume2, VolumeX, Video, MessageSquare } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';
import { sounds } from '../../utils/soundEffects';

export const ControlsBar = ({ onOpenReport, onOpenBlock }) => {
  const { matchState, skipMatch, leaveMatch } = useSocket();
  const { videoMode, setVideoMode } = useWebRTC();
  const [isMuted, setIsMuted] = useState(() => (typeof sounds?.isMuted === 'function' ? sounds.isMuted() : false));

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderTop: '2px solid var(--ink)',
        background: 'var(--parchment)',
        gap: '6px',
        flexWrap: 'wrap'
      }}
    >
      {/* Left actions: Next / Leave */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={skipMatch}
          className="btn btn-skip"
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            gap: '6px'
          }}
          title="Shortcut: Press [Escape]"
        >
          <FastForward size={15} />
          <span>Next (Esc)</span>
        </button>

        <button
          type="button"
          onClick={leaveMatch}
          className="btn btn-subtle"
          style={{ padding: '8px 10px', fontSize: '0.8rem', gap: '4px' }}
          title="Leave this chat"
        >
          <Square size={13} />
          <span>Leave</span>
        </button>
      </div>

      {/* Right actions: Mode toggle, Sound toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
        {/* Toggle Video/Text mode on the fly */}
        <button
          type="button"
          onClick={() => setVideoMode(!videoMode)}
          className="btn btn-subtle"
          style={{ padding: '8px 10px', fontSize: '0.78rem', gap: '5px' }}
          title={videoMode ? 'Switch to text chat' : 'Start video chat'}
        >
          {videoMode ? <MessageSquare size={14} /> : <Video size={14} />}
          <span>{videoMode ? 'Text Mode' : 'Video Mode'}</span>
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="btn btn-subtle"
          style={{ padding: '8px 10px' }}
          title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
          {isMuted ? <VolumeX size={15} color="var(--rust-clay)" /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
};
