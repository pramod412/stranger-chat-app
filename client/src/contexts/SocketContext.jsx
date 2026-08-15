import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { sounds } from '../utils/soundEffects';
import { getServerUrl } from '../utils/config';

const SocketContext = createContext(null);

// Anonymous user ID generated per browser session
function getOrCreateUserId() {
  let id = sessionStorage.getItem('nexus_user_id');
  if (!id) {
    id = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('nexus_user_id', id);
  }
  return id;
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [matchState, setMatchState] = useState('idle'); // 'idle' | 'searching' | 'connected' | 'partner_disconnected' | 'banned'
  const [currentMatch, setCurrentMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [stats, setStats] = useState({ onlineUsers: 0, waitingCount: 0, activeMatchesCount: 0 });
  const [notification, setNotification] = useState(null);
  const [tags, setTags] = useState([]);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_profile');
      return saved ? JSON.parse(saved) : { name: '', age: '', gender: '', city: '', country: '' };
    } catch {
      return { name: '', age: '', gender: '', city: '', country: '' };
    }
  });

  const typingTimeoutRef = useRef(null);
  const userId = useRef(getOrCreateUserId()).current;

  const updateUserProfile = (newFields) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...newFields };
      localStorage.setItem('nexus_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  useEffect(() => {
    // Connect to backend server
    const serverUrl = getServerUrl();
    const s = io(serverUrl || window.location.origin, {
      query: { userId },
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('stats:update', (data) => {
      setStats(data);
    });

    s.on('queue:status', ({ status }) => {
      if (status === 'searching') setMatchState('searching');
      if (status === 'idle') {
        setMatchState('idle');
        setCurrentMatch(null);
      }
    });

    s.on('match:found', (match) => {
      const normalizedMatch = {
        ...match,
        id: match.matchId || match.id,
        matchId: match.matchId || match.id
      };
      setCurrentMatch(normalizedMatch);
      setMatchState('connected');
      setMessages([]);
      setIsPeerTyping(false);
      sounds.playMatchFound();
      showNotification(`Connected with ${match.peerDisplayName}!`, 'success');
    });

    s.on('chat:message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, fromMe: false }];
      });
      sounds.playMessageReceived();
    });

    s.on('chat:sent', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, fromMe: true }];
      });
      sounds.playMessageSent();
    });

    s.on('chat:typing', ({ isTyping }) => {
      setIsPeerTyping(isTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => setIsPeerTyping(false), 3000);
      }
    });

    s.on('chat:warning', ({ message }) => {
      showNotification(message, 'warning');
    });

    s.on('chat:rejected', ({ violation }) => {
      showNotification(`Message blocked: ${violation}`, 'error');
    });

    s.on('partner:left', ({ reason }) => {
      setMatchState('partner_disconnected');
      setIsPeerTyping(false);
      showNotification(reason || 'Stranger has disconnected.', 'info');
      sounds.playSkip();
    });

    s.on('safety:report_ack', ({ success, message }) => {
      showNotification(message, success ? 'success' : 'error');
    });

    s.on('safety:blocked_ack', ({ message }) => {
      setMatchState('idle');
      setCurrentMatch(null);
      showNotification(message, 'info');
    });

    s.on('error:banned', ({ reason }) => {
      setMatchState('banned');
      showNotification(reason, 'error');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Actions
  const startSearch = (customTags = tags, customProfile = userProfile) => {
    setTags(customTags);
    setMessages([]);
    setMatchState('searching');
    sounds.playSearchStart();
    if (socket) {
      socket.emit('queue:join', { userId, tags: customTags, profile: customProfile });
    }
  };

  const cancelSearch = () => {
    if (!socket) return;
    socket.emit('queue:leave');
    setMatchState('idle');
  };

  const skipMatch = () => {
    if (!socket) return;
    sounds.playSkip();
    setMatchState('searching');
    setMessages([]);
    socket.emit('chat:skip', { tags, profile: userProfile });
  };

  const leaveMatch = () => {
    if (!socket) return;
    sounds.playSkip();
    socket.emit('chat:leave');
    setMatchState('idle');
    setCurrentMatch(null);
    setMessages([]);
  };

  const sendMessage = (text) => {
    if (!socket || !text.trim() || matchState !== 'connected') return;
    socket.emit('chat:message', { text: text.trim(), tempId: `msg_${Date.now()}` });
  };

  const sendTyping = (isTyping) => {
    if (!socket || matchState !== 'connected') return;
    socket.emit('chat:typing', { isTyping });
  };

  const reportStranger = (category, details) => {
    if (!socket) return;
    socket.emit('safety:report', { category, details });
  };

  const blockStranger = () => {
    if (!socket) return;
    socket.emit('safety:block');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        userId,
        matchState,
        currentMatch,
        messages,
        isPeerTyping,
        stats,
        notification,
        tags,
        setTags,
        userProfile,
        updateUserProfile,
        startSearch,
        cancelSearch,
        skipMatch,
        leaveMatch,
        sendMessage,
        sendTyping,
        reportStranger,
        blockStranger,
        showNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
