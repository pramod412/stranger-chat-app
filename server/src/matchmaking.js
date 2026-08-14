/**
 * Matchmaking Engine
 * Dual-tier matchmaking: Shared interest preference with automatic FIFO random fallback & blocklist filtering.
 */

import { v4 as uuidv4 } from 'uuid';
import { reportManager } from './safety/reportManager.js';

export class MatchmakingQueue {
  constructor(onMatchFound) {
    // Array of waiting user objects: { socketId, userId, tags: string[], joinedAt: number, fallbackReady: boolean }
    this.waitingPool = [];
    
    // matchId -> { id: string, room: string, user1: object, user2: object, sharedTags: string[], startedAt: number }
    this.activeMatches = new Map();

    // socketId -> matchId
    this.userToMatch = new Map();

    // Callback when two peers are matched
    this.onMatchFound = onMatchFound || (() => {});

    // Metrics
    this.totalMatchesServed = 0;

    // Background interval to handle fallback timeouts (users waiting > 4.5s become eligible for general matching)
    this.sweepInterval = setInterval(() => this.processQueue(), 1000);
  }

  /**
   * Add a user to the matchmaking queue
   */
  enqueueUser(socketId, userId, rawTags = []) {
    // Ensure user is not already in queue or active match
    this.dequeueUser(socketId);
    this.leaveCurrentMatch(socketId);

    const tags = Array.isArray(rawTags) 
      ? rawTags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
      : [];

    const userEntry = {
      socketId,
      userId,
      tags,
      joinedAt: Date.now(),
      fallbackReady: tags.length === 0 // If no tags, ready for general pool immediately
    };

    this.waitingPool.push(userEntry);
    this.processQueue();
  }

  /**
   * Remove a user from waiting pool
   */
  dequeueUser(socketId) {
    const idx = this.waitingPool.findIndex(u => u.socketId === socketId);
    if (idx !== -1) {
      return this.waitingPool.splice(idx, 1)[0];
    }
    return null;
  }

  /**
   * Check if a user is currently waiting in pool
   */
  isUserWaiting(socketId) {
    return this.waitingPool.some(u => u.socketId === socketId);
  }

  /**
   * Process the waiting pool to find suitable matches
   */
  processQueue() {
    const now = Date.now();

    // Update fallbackReady flag for users who have waited > 2000ms
    for (const user of this.waitingPool) {
      if (!user.fallbackReady && now - user.joinedAt >= 2000) {
        user.fallbackReady = true;
      }
    }

    // Step 1: Match by shared interest tags first
    for (let i = 0; i < this.waitingPool.length; i++) {
      const userA = this.waitingPool[i];
      if (!userA || userA.tags.length === 0) continue;

      for (let j = i + 1; j < this.waitingPool.length; j++) {
        const userB = this.waitingPool[j];
        if (!userB) continue;

        // Never match a socket with itself or blocked users
        if (userA.socketId === userB.socketId || reportManager.isBlocked(userA.userId, userB.userId)) {
          continue;
        }

        // Check shared tags
        const sharedTags = userA.tags.filter(tag => userB.tags.includes(tag));
        if (sharedTags.length > 0) {
          // Pair userA and userB!
          this.waitingPool.splice(j, 1);
          this.waitingPool.splice(i, 1);
          this.createMatch(userA, userB, sharedTags);
          return this.processQueue(); // Re-run for remaining pool
        }
      }
    }

    // Step 2: Match users eligible for random fallback
    for (let i = 0; i < this.waitingPool.length; i++) {
      const userA = this.waitingPool[i];
      if (!userA || !userA.fallbackReady) continue;

      for (let j = i + 1; j < this.waitingPool.length; j++) {
        const userB = this.waitingPool[j];
        if (!userB || !userB.fallbackReady) continue;

        // Never match a socket with itself or blocked users
        if (userA.socketId === userB.socketId || reportManager.isBlocked(userA.userId, userB.userId)) {
          continue;
        }

        // Pair randomly
        this.waitingPool.splice(j, 1);
        this.waitingPool.splice(i, 1);
        this.createMatch(userA, userB, []);
        return this.processQueue();
      }
    }
  }

  /**
   * Instantiate an active match between two users
   */
  createMatch(user1, user2, sharedTags = []) {
    const matchId = `match_${uuidv4()}`;
    const room = `room_${matchId}`;

    const matchData = {
      id: matchId,
      room,
      user1,
      user2,
      sharedTags,
      startedAt: Date.now()
    };

    this.activeMatches.set(matchId, matchData);
    this.userToMatch.set(user1.socketId, matchId);
    this.userToMatch.set(user2.socketId, matchId);
    this.totalMatchesServed++;

    this.onMatchFound(matchData);
  }

  /**
   * Get match details for a socket
   */
  getMatchBySocket(socketId) {
    const matchId = this.userToMatch.get(socketId);
    if (matchId) {
      return this.activeMatches.get(matchId) || null;
    }
    return null;
  }

  /**
   * End or leave current match, returning the other peer's info
   */
  leaveCurrentMatch(socketId) {
    const matchId = this.userToMatch.get(socketId);
    if (!matchId) return null;

    const match = this.activeMatches.get(matchId);
    if (match) {
      const isUser1 = match.user1.socketId === socketId;
      const partner = isUser1 ? match.user2 : match.user1;
      const leavingUser = isUser1 ? match.user1 : match.user2;

      this.userToMatch.delete(match.user1.socketId);
      this.userToMatch.delete(match.user2.socketId);
      this.activeMatches.delete(matchId);

      // Trigger rolling buffer purge after safety buffer window
      reportManager.purgeMatchBuffer(matchId);

      return { match, leavingUser, partner };
    }

    return null;
  }

  /**
   * Status metrics
   */
  getStats() {
    return {
      waitingCount: this.waitingPool.length,
      activeMatchesCount: this.activeMatches.size,
      totalMatchesServed: this.totalMatchesServed
    };
  }

  destroy() {
    clearInterval(this.sweepInterval);
  }
}
