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
    <div className="chat-shell">
      <div className="glass-panel chat-panel">
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
