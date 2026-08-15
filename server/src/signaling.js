/**
 * WebRTC Signaling Handler with Match-ID Isolation
 * Relays peer-to-peer connection metadata (SDP offers, answers, ICE candidates)
 * strictly within the authenticated active match room, rejecting stale packets from ended chats.
 */

export function setupWebRTCSignaling(io, socket, matchmaking) {
  // Relay WebRTC Offer
  socket.on('webrtc:offer', ({ offer, matchId }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match || (matchId && match.id !== matchId)) return;
    socket.to(match.room).emit('webrtc:offer', { offer, matchId: match.id });
  });

  // Relay WebRTC Answer
  socket.on('webrtc:answer', ({ answer, matchId }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match || (matchId && match.id !== matchId)) return;
    socket.to(match.room).emit('webrtc:answer', { answer, matchId: match.id });
  });

  // Relay ICE Candidate
  socket.on('webrtc:ice-candidate', ({ candidate, matchId }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match || (matchId && match.id !== matchId)) return;
    socket.to(match.room).emit('webrtc:ice-candidate', { candidate, matchId: match.id });
  });

  // Relay Media State changes (e.g. video muted, audio muted)
  socket.on('webrtc:media-state', ({ videoEnabled, audioEnabled, matchId }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match || (matchId && match.id !== matchId)) return;
    socket.to(match.room).emit('webrtc:peer-media-state', { videoEnabled, audioEnabled, matchId: match.id });
  });

  // Relay Video Mode switch (switching between text and video chat mid-session)
  socket.on('video:toggle', ({ enabled, matchId }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match || (matchId && match.id !== matchId)) return;
    socket.to(match.room).emit('video:peer-toggle', { enabled, matchId: match.id });
  });
}
