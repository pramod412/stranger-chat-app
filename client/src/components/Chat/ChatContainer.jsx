import React from 'react';
import { MatchHeader } from './MatchHeader';
import { VideoGrid } from './VideoGrid';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ControlsBar } from './ControlsBar';
import { SearchingRadar } from './SearchingRadar';
import { useSocket } from '../../contexts/SocketContext';
import { useWebRTC } from '../../contexts/WebRTCContext';

export const ChatContainer = ({ onOpenReport, onOpenBlock }) => {
  const { matchState, skipMatch } = useSocket();
  const { videoMode } = useWebRTC();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        width: '100%',
        maxWidth: '1100px',
        height: 'calc(100vh - 40px)',
        margin: '0 auto'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Top Header */}
        <MatchHeader onOpenReport={onOpenReport} onOpenBlock={onOpenBlock} />

        {/* Dynamic Center area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {matchState === 'searching' ? (
            <SearchingRadar />
          ) : (
            <>
              {/* If Video Mode is active, show video grid at top */}
              {videoMode && <VideoGrid />}

              {/* Messages feed */}
              <MessageList />

              {/* Text Input */}
              <MessageInput onSkipTrigger={skipMatch} />
            </>
          )}
        </div>

        {/* Bottom Action Controls */}
        <ControlsBar onOpenReport={onOpenReport} onOpenBlock={onOpenBlock} />
      </div>
    </div>
  );
};
