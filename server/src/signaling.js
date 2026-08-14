/**
 * WebRTC Signaling Handler
 * Relays peer-to-peer connection metadata (SDP offers, answers, and ICE candidates) between matched strangers.
 */

export function setupWebRTCSignaling(io, socket, matchmaking) {
  // Relay WebRTC Offer
  socket.on('webrtc:offer', ({ offer }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;
    socket.to(match.room).emit('webrtc:offer', { offer });
  });

  // Relay WebRTC Answer
  socket.on('webrtc:answer', ({ answer }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;
    socket.to(match.room).emit('webrtc:answer', { answer });
  });

  // Relay ICE Candidate
  socket.on('webrtc:ice-candidate', ({ candidate }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;
    socket.to(match.room).emit('webrtc:ice-candidate', { candidate });
  });

  // Relay Media State changes (e.g. video muted, audio muted)
  socket.on('webrtc:media-state', ({ videoEnabled, audioEnabled }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;
    socket.to(match.room).emit('webrtc:peer-media-state', { videoEnabled, audioEnabled });
  });

  // Relay Video Mode switch (switching between text and video chat mid-session)
  socket.on('video:toggle', ({ enabled }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;
    socket.to(match.room).emit('video:peer-toggle', { enabled });
  });
}
