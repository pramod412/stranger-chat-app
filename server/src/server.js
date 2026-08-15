/**
 * Random Stranger Chat Platform - Backend Server Entrypoint
 * Express API + Socket.IO Real-time Engine
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { MatchmakingQueue } from './matchmaking.js';
import { contentFilter } from './safety/filter.js';
import { rateLimiter } from './safety/rateLimiter.js';
import { reportManager } from './safety/reportManager.js';
import { feedbackManager } from './safety/feedbackManager.js';
import { setupWebRTCSignaling } from './signaling.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve production frontend assets if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

const PORT = process.env.PORT || 4000;

// Function to compute and broadcast real-time platform statistics
const getOnlineCount = () => {
  return io.sockets?.sockets?.size || 0;
};

const broadcastStats = () => {
  const stats = {
    onlineUsers: getOnlineCount(),
    ...matchmaking.getStats()
  };
  io.emit('stats:update', stats);
  return stats;
};

// Matchmaking Queue instance
const matchmaking = new MatchmakingQueue((match) => {
  // Callback when two users are matched
  const { user1, user2, room, sharedTags, id } = match;

  // Have both sockets join the unique match room
  const socket1 = io.sockets.sockets.get(user1.socketId);
  const socket2 = io.sockets.sockets.get(user2.socketId);

  if (socket1) socket1.join(room);
  if (socket2) socket2.join(room);

  const user2DisplayName = user2.profile?.name 
    ? user2.profile.name 
    : `Stranger #${user2.userId.slice(-4)}`;

  const user1DisplayName = user1.profile?.name 
    ? user1.profile.name 
    : `Stranger #${user1.userId.slice(-4)}`;

  // Notify User 1
  if (socket1) {
    socket1.emit('match:found', {
      matchId: id,
      room,
      peerId: user2.userId,
      peerDisplayName: user2DisplayName,
      peerProfile: user2.profile || null,
      sharedTags,
      isInitiator: true // Used for WebRTC offer initiation
    });
  }

  // Notify User 2
  if (socket2) {
    socket2.emit('match:found', {
      matchId: id,
      room,
      peerId: user1.userId,
      peerDisplayName: user1DisplayName,
      peerProfile: user1.profile || null,
      sharedTags,
      isInitiator: false
    });
  }

  // Real-time update for stats
  broadcastStats();
});

// Periodic heartbeat broadcast of platform stats
setInterval(() => {
  broadcastStats();
}, 3000);

// --- REST Endpoints ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/stats', (req, res) => {
  res.json({
    onlineUsers: getOnlineCount(),
    ...matchmaking.getStats()
  });
});

app.get('/api/admin/reports', (req, res) => {
  res.json({
    reports: reportManager.getAllReports()
  });
});

app.post('/api/admin/reports/:id/action', (req, res) => {
  const { id } = req.params;
  const { status, action, notes } = req.body;

  const report = reportManager.updateReportStatus(id, status, notes);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  if (action === 'ban' && report.reportedId) {
    rateLimiter.banUser(report.reportedId, notes || 'Banned by moderator');
  }

  res.json({ success: true, report });
});

// User Feedback Endpoints
app.post('/api/feedback', (req, res) => {
  const { userId, category, rating, comment, email, clientInfo } = req.body;

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ error: 'Please provide feedback comments before submitting.' });
  }

  try {
    const feedback = feedbackManager.addFeedback({
      userId,
      category,
      rating,
      comment,
      email,
      clientInfo
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback! Your submission helps improve Stranger Chat.',
      feedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to record feedback.' });
  }
});

app.get('/api/admin/feedback', (req, res) => {
  const { category } = req.query;
  res.json({
    feedbacks: feedbackManager.getAllFeedback(category),
    stats: feedbackManager.getFeedbackStats()
  });
});

app.post('/api/admin/feedback/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const feedback = feedbackManager.updateFeedbackStatus(id, status, notes);
  if (!feedback) {
    return res.status(404).json({ error: 'Feedback entry not found' });
  }

  res.json({ success: true, feedback });
});

// --- Socket.IO Event Handlers ---
io.on('connection', (socket) => {
  let userSessionId = socket.handshake.query.userId || socket.id;

  if (rateLimiter.isBanned(userSessionId)) {
    socket.emit('error:banned', { reason: 'Your access has been suspended due to community guidelines violations.' });
    socket.disconnect(true);
    return;
  }

  // WebRTC signaling setup
  setupWebRTCSignaling(io, socket, matchmaking);

  // Broadcast updated stats immediately on new connection
  broadcastStats();

  // 1. Join matchmaking queue
  socket.on('queue:join', ({ userId, tags, profile }) => {
    userSessionId = userId || socket.id;

    if (rateLimiter.isBanned(userSessionId)) {
      socket.emit('error:banned', { reason: 'Account suspended.' });
      return;
    }

    matchmaking.enqueueUser(socket.id, userSessionId, tags, profile);
    
    // Only inform client of 'searching' if they are actually waiting in queue (not immediately matched)
    if (matchmaking.isUserWaiting(socket.id)) {
      socket.emit('queue:status', { status: 'searching' });
    }
    broadcastStats();
  });

  // 2. Leave matchmaking queue (cancel search)
  socket.on('queue:leave', () => {
    matchmaking.dequeueUser(socket.id);
    socket.emit('queue:status', { status: 'idle' });
    broadcastStats();
  });

  // 3. Send text chat message
  socket.on('chat:message', ({ text, tempId }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) {
      return socket.emit('chat:error', { message: 'You are not in an active chat session.' });
    }

    // Rate limit check
    const rateCheck = rateLimiter.canSendMessage(socket.id);
    if (!rateCheck.allowed) {
      return socket.emit('chat:warning', { message: rateCheck.reason, tempId });
    }

    // Content filter analysis
    const filterResult = contentFilter.evaluate(text);
    if (!filterResult.isAllowed) {
      return socket.emit('chat:rejected', {
        violation: filterResult.violation,
        tempId
      });
    }

    const isUser1 = match.user1.socketId === socket.id;
    const senderId = isUser1 ? match.user1.userId : match.user2.userId;
    const recipientSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;

    const messagePayload = {
      id: tempId || `msg_${Date.now()}`,
      senderId,
      senderRole: isUser1 ? 'user1' : 'user2',
      text: filterResult.cleanedText,
      timestamp: Date.now(),
      warning: filterResult.violation || null
    };

    // Store in ephemeral rolling buffer for potential report auditing
    reportManager.recordMessage(match.id, senderId, messagePayload.senderRole, filterResult.cleanedText);

    // Relay to recipient via room broadcast
    socket.to(match.room).emit('chat:message', messagePayload);

    // Ack to sender
    socket.emit('chat:sent', messagePayload);
  });

  // 4. Typing indicator
  socket.on('chat:typing', ({ isTyping }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;

    socket.to(match.room).emit('chat:typing', { isTyping: Boolean(isTyping) });
  });

  // 5. Skip / Next Stranger
  socket.on('chat:skip', ({ tags, profile } = {}) => {
    const rateCheck = rateLimiter.canSkip(socket.id);
    if (!rateCheck.allowed) {
      return socket.emit('chat:warning', { message: rateCheck.reason });
    }

    const leaveInfo = matchmaking.leaveCurrentMatch(socket.id);
    if (leaveInfo) {
      const { partner } = leaveInfo;
      // Notify partner that stranger has skipped
      io.to(partner.socketId).emit('partner:left', { reason: 'Stranger has disconnected or skipped.' });
    }

    // Re-enqueue requesting user automatically
    matchmaking.enqueueUser(socket.id, userSessionId, tags || [], profile || {});
    if (matchmaking.isUserWaiting(socket.id)) {
      socket.emit('queue:status', { status: 'searching' });
    }
    broadcastStats();
  });

  // 6. Stop / Leave chat (back to idle landing)
  socket.on('chat:leave', () => {
    const leaveInfo = matchmaking.leaveCurrentMatch(socket.id);
    if (leaveInfo) {
      const { partner } = leaveInfo;
      io.to(partner.socketId).emit('partner:left', { reason: 'Stranger has left the conversation.' });
    }
    matchmaking.dequeueUser(socket.id);
    socket.emit('queue:status', { status: 'idle' });
    broadcastStats();
  });

  // 7. Safety: Report incident
  socket.on('safety:report', ({ category, details }) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) {
      return socket.emit('safety:report_ack', { success: false, error: 'No active session found.' });
    }

    const isUser1 = match.user1.socketId === socket.id;
    const reporterId = isUser1 ? match.user1.userId : match.user2.userId;
    const reportedId = isUser1 ? match.user2.userId : match.user1.userId;

    const report = reportManager.submitReport({
      reporterId,
      reportedId,
      matchId: match.id,
      category,
      details
    });

    socket.emit('safety:report_ack', {
      success: true,
      reportId: report.id,
      message: 'Report submitted. Our moderation team will review this incident.'
    });
  });

  // 8. Safety: Block user
  socket.on('safety:block', () => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (match) {
      const isUser1 = match.user1.socketId === socket.id;
      const reporterId = isUser1 ? match.user1.userId : match.user2.userId;
      const reportedId = isUser1 ? match.user2.userId : match.user1.userId;
      const partnerSocketId = isUser1 ? match.user2.socketId : match.user1.socketId;

      reportManager.addBlock(reporterId, reportedId);

      // Disconnect them
      matchmaking.leaveCurrentMatch(socket.id);
      io.to(partnerSocketId).emit('partner:left', { reason: 'Stranger has left.' });
      socket.emit('safety:blocked_ack', { success: true, message: 'User blocked. You will not be matched with them again.' });
      broadcastStats();
    }
  });

  // 9. Disconnect cleanup
  socket.on('disconnect', () => {
    const leaveInfo = matchmaking.leaveCurrentMatch(socket.id);
    if (leaveInfo) {
      const { partner } = leaveInfo;
      io.to(partner.socketId).emit('partner:left', { reason: 'Stranger has disconnected.' });
    }
    matchmaking.dequeueUser(socket.id);
    rateLimiter.cleanup(socket.id);
    broadcastStats();
  });
});

// SPA fallback for HTML5 client-side routing
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Stranger Chat Backend Server listening on port ${PORT}`);
});
