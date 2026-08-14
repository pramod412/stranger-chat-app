/**
 * In-Memory Sliding Window Rate Limiter
 * Guards against message flooding, automated script abuse, and rapid-skipping griefing.
 */

export class RateLimiter {
  constructor() {
    this.messageTimestamps = new Map(); // socketId -> number[]
    this.skipTimestamps = new Map();    // socketId -> number[]
    this.bannedIps = new Set();
    this.bannedUsers = new Set();
  }

  /**
   * Check if a message action is permitted
   * Limit: Max 6 messages per 3 seconds, or max 20 per 10 seconds
   */
  canSendMessage(socketId) {
    const now = Date.now();
    const timestamps = this.messageTimestamps.get(socketId) || [];
    
    // Purge timestamps older than 10s
    const valid = timestamps.filter(t => now - t < 10000);
    valid.push(now);
    this.messageTimestamps.set(socketId, valid);

    // Check last 3 seconds
    const last3Sec = valid.filter(t => now - t < 3000).length;
    if (last3Sec > 6) {
      return { allowed: false, retryAfterMs: 2000, reason: 'You are sending messages too quickly.' };
    }

    if (valid.length > 20) {
      return { allowed: false, retryAfterMs: 5000, reason: 'Slow down! Rate limit exceeded.' };
    }

    return { allowed: true };
  }

  /**
   * Check if skip/next match action is permitted
   * Limit: Max 8 skips per 10 seconds to prevent matchmaking pool starvation
   */
  canSkip(socketId) {
    const now = Date.now();
    const timestamps = this.skipTimestamps.get(socketId) || [];
    const valid = timestamps.filter(t => now - t < 10000);
    valid.push(now);
    this.skipTimestamps.set(socketId, valid);

    if (valid.length > 8) {
      return { allowed: false, retryAfterMs: 3000, reason: 'Please wait a moment before searching for another stranger.' };
    }

    return { allowed: true };
  }

  cleanup(socketId) {
    this.messageTimestamps.delete(socketId);
    this.skipTimestamps.delete(socketId);
  }

  banUser(userId, reason = 'Violated community guidelines') {
    this.bannedUsers.add(userId);
  }

  isBanned(userId) {
    return this.bannedUsers.has(userId);
  }
}

export const rateLimiter = new RateLimiter();
