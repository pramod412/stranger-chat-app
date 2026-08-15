/**
 * Random Stranger Chat Platform - Backend Server Entrypoint
 * Express API + Socket.IO Real-time Engine
 * Hardened for production deployment with security headers, payload boundaries,
 * rate limiting, and strict input validation.
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

// Production Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self)');
  next();
});

// Configure CORS and bounded payload parsing
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '64kb' }));

// Serve production frontend assets if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e5, // 100 KB max socket packet size to prevent buffer overflow attacks
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
const heartbeatInterval = setInterval(() => {
  broadcastStats();
}, 3000);

// In-Memory REST Rate Limiter for Feedback API
const feedbackRateMap = new Map();
const checkFeedbackRateLimit = (ip) => {
  const now = Date.now();
  const timestamps = (feedbackRateMap.get(ip) || []).filter(t => now - t < 60000); // 1 minute window
  if (timestamps.length >= 6) {
    return false;
  }
  timestamps.push(now);
  feedbackRateMap.set(ip, timestamps);
  return true;
};

// Admin authentication middleware (if ADMIN_TOKEN configured)
const requireAdminAuth = (req, res, next) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (!token || token !== adminToken) {
      return res.status(401).json({ error: 'Unauthorized: Valid admin credentials required.' });
    }
  }
  next();
};

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

app.get('/api/admin/reports', requireAdminAuth, (req, res) => {
  res.json({
    reports: reportManager.getAllReports()
  });
});

app.post('/api/admin/reports/:id/action', requireAdminAuth, (req, res) => {
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
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!checkFeedbackRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many feedback requests. Please wait a minute before trying again.' });
  }

  const { userId, category, rating, comment, email, clientInfo } = req.body;

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ error: 'Please provide feedback comments before submitting.' });
  }

  if (comment.length > 1500) {
    return res.status(400).json({ error: 'Feedback comment is too long (maximum 1500 characters).' });
  }

  try {
    const feedback = feedbackManager.addFeedback({
      userId: typeof userId === 'string' ? userId.slice(0, 64) : 'anonymous',
      category,
      rating,
      comment,
      email: typeof email === 'string' ? email.slice(0, 100) : '',
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

app.get('/api/admin/feedback', requireAdminAuth, (req, res) => {
  const { category } = req.query;
  res.json({
    feedbacks: feedbackManager.getAllFeedback(category),
    stats: feedbackManager.getFeedbackStats()
  });
});

app.post('/api/admin/feedback/:id/status', requireAdminAuth, (req, res) => {
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
  let userSessionId = typeof socket.handshake.query.userId === 'string' && socket.handshake.query.userId.length <= 64
    ? socket.handshake.query.userId
    : socket.id;

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
  socket.on('queue:join', (payload = {}) => {
    const { userId, tags, profile } = payload;
    const sanitizedUserId = typeof userId === 'string' && userId.length <= 64 ? userId : socket.id;
    userSessionId = sanitizedUserId;

    if (rateLimiter.isBanned(userSessionId)) {
      socket.emit('error:banned', { reason: 'Account suspended.' });
      return;
    }

    const safeTags = Array.isArray(tags) ? tags.slice(0, 15) : [];
    matchmaking.enqueueUser(socket.id, userSessionId, safeTags, profile || {});
    
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
  socket.on('chat:message', (payload = {}) => {
    const { text, tempId } = payload;
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) {
      return socket.emit('chat:error', { message: 'You are not in an active chat session.' });
    }

    if (typeof text !== 'string' || !text.trim() || text.length > 1000) {
      return socket.emit('chat:error', { message: 'Invalid message payload or message too long (max 1000 characters).' });
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

    const messagePayload = {
      id: typeof tempId === 'string' && tempId.length <= 64 ? tempId : `msg_${Date.now()}`,
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
  socket.on('chat:typing', (payload = {}) => {
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) return;

    socket.to(match.room).emit('chat:typing', { isTyping: Boolean(payload.isTyping) });
  });

  // 5. Skip / Next Stranger
  socket.on('chat:skip', (payload = {}) => {
    const { tags, profile } = payload;
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

    const safeTags = Array.isArray(tags) ? tags.slice(0, 15) : [];

    // Re-enqueue requesting user automatically
    matchmaking.enqueueUser(socket.id, userSessionId, safeTags, profile || {});
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
  socket.on('safety:report', (payload = {}) => {
    const { category, details } = payload;
    const match = matchmaking.getMatchBySocket(socket.id);
    if (!match) {
      return socket.emit('safety:report_ack', { success: false, error: 'No active session found.' });
    }

    const isUser1 = match.user1.socketId === socket.id;
    const reporterId = isUser1 ? match.user1.userId : match.user2.userId;
    const reportedId = isUser1 ? match.user2.userId : match.user1.userId;

    const safeCategory = typeof category === 'string' ? category.slice(0, 40) : 'general';
    const safeDetails = typeof details === 'string' ? details.slice(0, 500) : '';

    const report = reportManager.submitReport({
      reporterId,
      reportedId,
      matchId: match.id,
      category: safeCategory,
      details: safeDetails
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
