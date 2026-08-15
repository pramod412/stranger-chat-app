import React, { useState } from 'react';
import { FastForward, Square, Volume2, VolumeX, Video, MessageSquare } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';
import { sounds } from '../../utils/soundEffects';

export const ControlsBar = ({ onOpenReport, onOpenBlock }) => {
  const { matchState, skipMatch, leaveMatch } = useSocket();
  const { videoMode, setVideoMode } = useWebRTC();
  const [isMuted, setIsMuted] = useState(() => (typeof sounds?.isMuted === 'function' ? sounds.isMuted() : false));

  const isSearching = matchState === 'searching';

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      className="controls-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderTop: '2px solid var(--border)',
        background: 'var(--bg-surface)',
        gap: '6px',
        zIndex: 10,
        width: '100%'
      }}
    >
      {/* Left actions: Next / Leave */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={skipMatch}
          disabled={isSearching}
          className="btn btn-skip"
          style={{
            padding: '8px 14px',
            fontSize: '0.85rem',
            gap: '5px',
            opacity: isSearching ? 0.4 : 1,
            cursor: isSearching ? 'not-allowed' : 'pointer'
          }}
          title="Shortcut: Press [Escape]"
        >
          <FastForward size={15} />
          <span className="btn-label-desktop">Next (Esc)</span>
          <span className="btn-label-mobile">Next</span>
        </button>

        <button
          type="button"
          onClick={leaveMatch}
          disabled={isSearching}
          className="btn btn-subtle"
          style={{
            padding: '8px 10px',
            fontSize: '0.82rem',
            gap: '4px',
            opacity: isSearching ? 0.4 : 1,
            cursor: isSearching ? 'not-allowed' : 'pointer'
          }}
          title="Leave this chat"
        >
          <Square size={12} />
          <span>Leave</span>
        </button>
      </div>

      {/* Right actions: Mode toggle, Sound toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
        {/* Toggle Video/Text mode on the fly */}
        <button
          type="button"
          onClick={() => setVideoMode(!videoMode)}
          disabled={isSearching}
          className="btn btn-subtle"
          style={{
            padding: '8px 10px',
            fontSize: '0.82rem',
            gap: '5px',
            opacity: isSearching ? 0.4 : 1,
            cursor: isSearching ? 'not-allowed' : 'pointer'
          }}
          title={videoMode ? 'Switch to text chat' : 'Start video chat'}
        >
          {videoMode ? <MessageSquare size={14} color="var(--purple)" /> : <Video size={14} color="var(--teal)" />}
          <span className="btn-label-desktop">{videoMode ? 'Text Mode' : 'Video Mode'}</span>
          <span className="btn-label-mobile">{videoMode ? 'Text' : 'Video'}</span>
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="btn btn-subtle"
          style={{ padding: '8px 9px' }}
          title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
          {isMuted ? <VolumeX size={15} color="var(--accent)" /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
};
export default ControlsBar;
