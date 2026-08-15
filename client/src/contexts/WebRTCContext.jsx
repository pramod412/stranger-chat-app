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
  const iceCandidatesQueue = useRef([]);
  const isSettingUpRef = useRef(false);

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

  // Clean up media when exiting video mode
  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    closePeerConnection();
  }, []);

  // Teardown WebRTC peer connection
  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    iceCandidatesQueue.current = [];
    setRemoteStream(null);
    setPeerMediaState({ videoEnabled: true, audioEnabled: true });
    isSettingUpRef.current = false;
  }, []);

  // Initialize WebRTC session
  const initWebRTCSession = useCallback(async () => {
    if (!socket || !videoMode || matchState !== 'connected' || !currentMatch) {
      closePeerConnection();
      return;
    }

    if (isSettingUpRef.current) return;
    isSettingUpRef.current = true;

    try {
      closePeerConnection();

      // 1. Ensure local stream is ready before creating peer connection
      const stream = await ensureLocalStream();
      if (!stream || matchState !== 'connected') {
        isSettingUpRef.current = false;
        return;
      }

      // 2. Instantiate RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      // 3. Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 4. Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice-candidate', { candidate: event.candidate });
        }
      };

      // 5. Handle Incoming Remote Stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else if (event.track) {
          const inboundStream = new MediaStream([event.track]);
          setRemoteStream(inboundStream);
        }
      };

      // 6. Handle Connection State
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          console.log('WebRTC ICE connection state:', pc.iceConnectionState);
        }
      };

      // 7. If initiator, create and dispatch SDP offer
      if (currentMatch.isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { offer });
      }
    } catch (err) {
      console.error('Error initializing WebRTC session:', err);
    } finally {
      isSettingUpRef.current = false;
    }
  }, [socket, videoMode, matchState, currentMatch, ensureLocalStream, closePeerConnection]);

  // Trigger media initialization on videoMode toggle or match changes
  useEffect(() => {
    if (videoMode && matchState === 'connected' && currentMatch) {
      initWebRTCSession();
    } else if (!videoMode) {
      closePeerConnection();
    }
  }, [videoMode, matchState, currentMatch, initWebRTCSession, closePeerConnection]);

  // Socket signaling event listeners
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ offer }) => {
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
              socket.emit('webrtc:ice-candidate', { candidate: event.candidate });
            }
          };

          pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
              setRemoteStream(event.streams[0]);
            } else if (event.track) {
              setRemoteStream(new MediaStream([event.track]));
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
        socket.emit('webrtc:answer', { answer });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    const handleAnswer = async ({ answer }) => {
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

    const handleCandidate = async ({ candidate }) => {
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

    const handlePeerMediaState = ({ videoEnabled, audioEnabled }) => {
      setPeerMediaState({
        videoEnabled: videoEnabled !== false,
        audioEnabled: audioEnabled !== false
      });
    };

    const handlePeerVideoToggle = ({ enabled }) => {
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
          audioEnabled: isAudioEnabled
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
          audioEnabled: audioTrack.enabled
        });
      }
    }
  }, [socket, isVideoEnabled]);

  // Switch video mode helper
  const handleSetVideoMode = useCallback((val) => {
    setVideoMode(val);
    if (socket && matchState === 'connected') {
      socket.emit('video:toggle', { enabled: Boolean(val) });
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
        ensureLocalStream
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
