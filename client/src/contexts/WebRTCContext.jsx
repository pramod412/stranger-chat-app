import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';

const WebRTCContext = createContext(null);

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
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
      ctx.fillText('⚡ Stranger Chat Video Stream', canvas.width / 2, canvas.height / 2 - 20);

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
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: true
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
    // 1. Explicitly stop and discard all tracks in remoteStream
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

    // 2. Teardown Peer Connection and remove sender/receiver tracks
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

  // Initialize WebRTC session for a newly matched stranger
  const initWebRTCSession = useCallback(async () => {
    if (!socket || !videoMode || matchState !== 'connected' || !currentMatch) {
      closePeerConnection();
      return;
    }

    const sessionMatchId = currentMatch.id;
    if (isSettingUpRef.current) return;
    isSettingUpRef.current = true;

    try {
      // 1. Cleanly terminate any prior connection
      closePeerConnection();

      // 2. Ensure local stream is ready
      const stream = await ensureLocalStream();
      if (!stream || matchState !== 'connected' || activeMatchIdRef.current !== sessionMatchId) {
        isSettingUpRef.current = false;
        return;
      }

      // 3. Instantiate fresh RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      // 4. Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 5. Handle ICE Candidates with matchId validation
      pc.onicecandidate = (event) => {
        if (event.candidate && activeMatchIdRef.current === sessionMatchId) {
          socket.emit('webrtc:ice-candidate', { candidate: event.candidate, matchId: sessionMatchId });
        }
      };

      // 6. Handle Incoming Remote Stream
      pc.ontrack = (event) => {
        if (activeMatchIdRef.current !== sessionMatchId) return; // Discard stale tracks

        let inboundStream;
        if (event.streams && event.streams[0]) {
          inboundStream = event.streams[0];
        } else if (event.track) {
          inboundStream = new MediaStream([event.track]);
        }

        if (inboundStream) {
          remoteStreamRef.current = inboundStream;
          setRemoteStream(inboundStream);
        }
      };

      // 7. Handle Connection State / Disconnection
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
          // Immediately terminate remote stream on disconnect/failure
          if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((t) => t.stop());
            remoteStreamRef.current = null;
          }
          setRemoteStream(null);
        }
      };

      // 8. If initiator, create and dispatch SDP offer
      if (currentMatch.isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        if (activeMatchIdRef.current !== sessionMatchId) return; // Abort if match changed
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { offer, matchId: sessionMatchId });
      }
    } catch (err) {
      console.error('Error initializing WebRTC session:', err);
    } finally {
      isSettingUpRef.current = false;
    }
  }, [socket, videoMode, matchState, currentMatch, ensureLocalStream, closePeerConnection]);

  // Clean termination whenever matchState changes or when currentMatch resets
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
      // Validate that offer belongs to current active session
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) {
        return; // Reject stale signaling from previous stranger
      }

      try {
        const stream = await ensureLocalStream();
        if (!pcRef.current) {
          const pc = new RTCPeerConnection(RTC_CONFIG);
          pcRef.current = pc;

          if (stream) {
            stream.getTracks().forEach((track) => {
              pc.addTrack(track, stream);
            });
          }

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('webrtc:ice-candidate', { candidate: event.candidate, matchId: activeMatchIdRef.current });
            }
          };

          pc.ontrack = (event) => {
            if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
            let inboundStream = event.streams?.[0] || (event.track ? new MediaStream([event.track]) : null);
            if (inboundStream) {
              remoteStreamRef.current = inboundStream;
              setRemoteStream(inboundStream);
            }
          };
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
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    const handleAnswer = async ({ answer, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));

        // Flush queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const cand = iceCandidatesQueue.current.shift();
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn('Queued ICE candidate note:', e);
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    };

    const handleCandidate = async ({ candidate, matchId }) => {
      if (matchId && activeMatchIdRef.current && matchId !== activeMatchIdRef.current) return;
      if (!candidate) return;
      const pc = pcRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
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
  }, [socket, videoMode, ensureLocalStream]);

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
        closePeerConnection
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
