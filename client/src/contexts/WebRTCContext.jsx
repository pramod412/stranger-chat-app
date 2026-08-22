import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';

const WebRTCContext = createContext(null);

// International Standard STUN server pool with multiple global providers
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.nextcloud.com:443' }
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

export const WebRTCProvider = ({ children }) => {
  const { socket, currentMatch, matchState } = useSocket();
  const [videoMode, setVideoMode] = useState(false); // Global toggle for Video/Audio mode
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [peerMediaState, setPeerMediaState] = useState({ videoEnabled: true, audioEnabled: true });
  const [mediaError, setMediaError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const activeMatchIdRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const isSettingUpRef = useRef(false);

  // Keep activeMatchIdRef synchronized
  useEffect(() => {
    activeMatchIdRef.current = currentMatch?.id || null;
  }, [currentMatch]);

  // Virtual canvas stream fallback for environments without physical camera
  const createVirtualStream = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let hue = 0;
    const draw = () => {
      hue = (hue + 1) % 360;
      ctx.fillStyle = `hsl(${hue}, 40%, 15%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00f2fe';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ Just Random Chat Video', canvas.width / 2, canvas.height / 2 - 20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('Live WebRTC Stream Active', canvas.width / 2, canvas.height / 2 + 20);

      requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = osc.connect(audioCtx.createMediaStreamDestination());
      osc.start();
      const track = dst.stream.getAudioTracks()[0];
      if (track) {
        track.enabled = false;
        canvasStream.addTrack(track);
      }
    } catch (e) {
      console.warn('AudioContext fallback note:', e);
    }

    return canvasStream;
  }, []);

  // Ensure local camera/audio stream is active
  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current && localStreamRef.current.active) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (videoTrack && videoTrack.readyState === 'live') {
        return localStreamRef.current;
      }
    }

    try {
      setMediaError(null);
      let stream;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
              facingMode: 'user',
              frameRate: { ideal: 30, max: 30 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
        } catch (err) {
          console.warn('Physical camera unavailable or permission denied, creating virtual fallback feed', err);
          stream = createVirtualStream();
        }
      } else {
        stream = createVirtualStream();
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      return stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      const fallback = createVirtualStream();
      localStreamRef.current = fallback;
      setLocalStream(fallback);
      return fallback;
    }
  }, [createVirtualStream]);

  // Teardown WebRTC peer connection and strictly terminate remote stream
  const closePeerConnection = useCallback(() => {
    if (remoteStreamRef.current) {
      try {
        remoteStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping remote tracks:', e);
      }
      remoteStreamRef.current = null;
    }
    setRemoteStream(null);

    if (pcRef.current) {
      try {
        pcRef.current.getSenders().forEach((s) => {
          try {
            pcRef.current.removeTrack(s);
          } catch (e) {}
        });
        pcRef.current.getReceivers().forEach((r) => {
          try {
            if (r.track) r.track.stop();
          } catch (e) {}
        });
      } catch (e) {}

      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    iceCandidatesQueue.current = [];
    setPeerMediaState({ videoEnabled: true, audioEnabled: true });
    isSettingUpRef.current = false;
  }, []);

  // Clean up media when exiting video mode
  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    closePeerConnection();
  }, [closePeerConnection]);

  // Setup PeerConnection with tracks, transceivers, and handlers
  const createConfiguredPeerConnection = useCallback((sessionMatchId, stream) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add local tracks if available
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    // Ensure transceivers exist with sendrecv direction for bidirectional media
    const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
    if (!videoSender) {
      try {
        pc.addTransceiver('video', { direction: 'sendrecv' });
      } catch (e) {}
    }

    const audioSender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
    if (!audioSender) {
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      } catch (e) {}
    }

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate && activeMatchIdRef.current === sessionMatchId) {
        socket?.emit('webrtc:ice-candidate', { candidate: event.candidate, matchId: sessionMatchId });
      }
    };

    // Track handler with live reactive stream reproduction for React state
    pc.ontrack = (event) => {
      if (activeMatchIdRef.current !== sessionMatchId) return;

      let currentRemote = remoteStreamRef.current;
      if (!currentRemote) {
        currentRemote = event.streams?.[0] || new MediaStream();
      }

      if (event.track && !currentRemote.getTracks().some((t) => t.id === event.track.id)) {
        currentRemote.addTrack(event.track);
      }

      const syncRemoteState = () => {
        if (activeMatchIdRef.current !== sessionMatchId) return;
        const freshStream = new MediaStream(currentRemote.getTracks());
        remoteStreamRef.current = freshStream;
        setRemoteStream(freshStream);
      };

      if (event.track) {
        event.track.onunmute = syncRemoteState;
        event.track.onmute = syncRemoteState;
        event.track.onended = syncRemoteState;
      }

      syncRemoteState();
    };

    // ICE connection state monitor
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        if (pc.iceConnectionState === 'failed') {
          try {
            pc.restartIce();
          } catch (e) {}
        }
      }
    };

    return pc;
  }, [socket]);

  // Initialize WebRTC session for newly matched stranger
  const initWebRTCSession = useCallback(async () => {
    if (!socket || !videoMode || matchState !== 'connected' || !currentMatch) {
      closePeerConnection();
      return;
    }

    const sessionMatchId = currentMatch.id;
    if (isSettingUpRef.current) return;
    isSettingUpRef.current = true;

    try {
      closePeerConnection();

      const stream = await ensureLocalStream();
      if (!stream || matchState !== 'connected' || activeMatchIdRef.current !== sessionMatchId) {
        isSettingUpRef.current = false;
        return;
      }

      const pc = createConfiguredPeerConnection(sessionMatchId, stream);
      pcRef.current = pc;

      // Broadcast local initial media state to peer
      socket.emit('webrtc:media-state', {
        videoEnabled: isVideoEnabled,
        audioEnabled: isAudioEnabled,
        matchId: sessionMatchId
      });

      // If initiator, dispatch SDP offer
      if (currentMatch.isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        if (activeMatchIdRef.current !== sessionMatchId) return;
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { offer, matchId: sessionMatchId });
      }
    } catch (err) {
      console.error('Error initializing WebRTC session:', err);
    } finally {
      isSettingUpRef.current = false;
    }
  }, [socket, videoMode, matchState, currentMatch, ensureLocalStream, closePeerConnection, createConfiguredPeerConnection, isVideoEnabled, isAudioEnabled]);

  // Clean termination or initialization on matchState/match change
  useEffect(() => {
    if (matchState !== 'connected' || !currentMatch) {
      closePeerConnection();
    } else if (videoMode && matchState === 'connected' && currentMatch) {
      initWebRTCSession();
    }
  }, [matchState, currentMatch?.id, videoMode, initWebRTCSession, closePeerConnection]);

  // Socket signaling event listeners with strict matchId validation
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ offer, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) {
        return;
      }

      try {
        const stream = await ensureLocalStream();
        if (!pcRef.current || pcRef.current.signalingState === 'closed') {
          pcRef.current = createConfiguredPeerConnection(activeMatchIdRef.current, stream);
        }

        const pc = pcRef.current;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Flush queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const cand = iceCandidatesQueue.current.shift();
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn('Queued ICE candidate note:', e);
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { answer, matchId: activeMatchIdRef.current });

        // Inform peer of our media states
        socket.emit('webrtc:media-state', {
          videoEnabled: isVideoEnabled,
          audioEnabled: isAudioEnabled,
          matchId: activeMatchIdRef.current
        });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    const handleAnswer = async ({ answer, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
      if (!pcRef.current || pcRef.current.signalingState === 'closed') return;
      try {
        const pc = pcRef.current;
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Flush queued ICE candidates
          while (iceCandidatesQueue.current.length > 0) {
            const cand = iceCandidatesQueue.current.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('Queued ICE candidate note:', e);
            }
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    };

    const handleCandidate = async ({ candidate, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
      if (!candidate || !candidate.candidate) return;
      const pc = pcRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type && pc.signalingState !== 'closed') {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
    };

    const handlePeerMediaState = ({ videoEnabled, audioEnabled, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
      setPeerMediaState({
        videoEnabled: videoEnabled !== false,
        audioEnabled: audioEnabled !== false
      });
    };

    const handlePeerVideoToggle = ({ enabled, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
      if (enabled && !videoMode) {
        setVideoMode(true);
      }
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleCandidate);
    socket.on('webrtc:peer-media-state', handlePeerMediaState);
    socket.on('video:peer-toggle', handlePeerVideoToggle);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleCandidate);
      socket.off('webrtc:peer-media-state', handlePeerMediaState);
      socket.off('video:peer-toggle', handlePeerVideoToggle);
    };
  }, [socket, videoMode, ensureLocalStream, createConfiguredPeerConnection, isVideoEnabled, isAudioEnabled]);

  // Toggle Video / Camera ON/OFF
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        socket?.emit('webrtc:media-state', {
          videoEnabled: videoTrack.enabled,
          audioEnabled: isAudioEnabled,
          matchId: activeMatchIdRef.current
        });
      }
    }
  }, [socket, isAudioEnabled]);

  // Toggle Audio / Microphone ON/OFF
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        socket?.emit('webrtc:media-state', {
          videoEnabled: isVideoEnabled,
          audioEnabled: audioTrack.enabled,
          matchId: activeMatchIdRef.current
        });
      }
    }
  }, [socket, isVideoEnabled]);

  // Switch video mode helper
  const handleSetVideoMode = useCallback((val) => {
    setVideoMode(val);
    if (socket && matchState === 'connected') {
      socket.emit('video:toggle', { enabled: Boolean(val), matchId: activeMatchIdRef.current });
    }
  }, [socket, matchState]);

  return (
    <WebRTCContext.Provider
      value={{
        videoMode,
        setVideoMode: handleSetVideoMode,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        peerMediaState,
        mediaError,
        toggleVideo,
        toggleAudio,
        ensureLocalStream,
        closePeerConnection,
        cleanupMedia
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
export default WebRTCContext;

