import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

  // Initialize or stop user media when videoMode changes
  useEffect(() => {
    if (!videoMode) {
      cleanupMedia();
      return;
    }

    startUserMedia();

    return () => {
      cleanupMedia();
    };
  }, [videoMode]);

  const startUserMedia = async () => {
    try {
      setMediaError(null);
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });
      } catch (err) {
        console.warn('Real camera not available, creating virtual video stream for demonstration', err);
        // Fallback: virtual canvas stream for testing without camera device
        stream = createVirtualStream();
      }

      setLocalStream(stream);
      localStreamRef.current = stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      setMediaError('Could not access camera/microphone. Switching to virtual video mode.');
    }
  };

  const createVirtualStream = () => {
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
      ctx.fillText('⚡ Nexus Cyber Video Feed', canvas.width / 2, canvas.height / 2 - 20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('Live WebRTC Stream Active', canvas.width / 2, canvas.height / 2 + 20);

      requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    // Add silent audio track
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const dst = osc.connect(audioCtx.createMediaStreamDestination());
    osc.start();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    canvasStream.addTrack(track);

    return canvasStream;
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    closePeerConnection();
  };

  const closePeerConnection = () => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
  };

  // Manage WebRTC connection when match changes
  useEffect(() => {
    if (!socket || !videoMode || matchState !== 'connected' || !currentMatch) {
      closePeerConnection();
      return;
    }

    const initPeerConnection = async () => {
      closePeerConnection();

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice-candidate', { candidate: event.candidate });
        }
      };

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // If initiator, create and send SDP offer
      if (currentMatch.isInitiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc:offer', { offer });
        } catch (e) {
          console.error('Error creating WebRTC offer:', e);
        }
      }
    };

    initPeerConnection();

    // Listeners for signaling events
    const handleOffer = async ({ offer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit('webrtc:answer', { answer });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    const handleAnswer = async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    };

    const handleCandidate = async ({ candidate }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handlePeerMediaState = ({ videoEnabled, audioEnabled }) => {
      setPeerMediaState({ videoEnabled, audioEnabled });
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleCandidate);
    socket.on('webrtc:peer-media-state', handlePeerMediaState);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleCandidate);
      socket.off('webrtc:peer-media-state', handlePeerMediaState);
      closePeerConnection();
    };
  }, [socket, currentMatch, matchState, videoMode]);

  // Controls
  const toggleVideo = () => {
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
  };

  const toggleAudio = () => {
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
  };

  return (
    <WebRTCContext.Provider
      value={{
        videoMode,
        setVideoMode,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        peerMediaState,
        mediaError,
        toggleVideo,
        toggleAudio
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
