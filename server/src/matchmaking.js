/**
 * Matchmaking Engine
 * 100% Completely Random Matching: Unbiased uniform random selection among all eligible waiting users.
 * Optional profile details, tags, age, location, and metadata have zero impact on partner selection.
 */

import { v4 as uuidv4 } from 'uuid';
import { reportManager } from './safety/reportManager.js';

export class MatchmakingQueue {
  constructor(onMatchFound) {
    // Array of waiting user objects: { socketId, userId, tags: string[], profile: object, joinedAt: number }
    this.waitingPool = [];
    
    // matchId -> { id: string, room: string, user1: object, user2: object, sharedTags: string[], startedAt: number }
    this.activeMatches = new Map();

    // socketId -> matchId
    this.userToMatch = new Map();

    // Callback when two peers are matched
    this.onMatchFound = onMatchFound || (() => {});

    // Metrics
    this.totalMatchesServed = 0;

    // Background interval to process queue periodically
    this.sweepInterval = setInterval(() => this.processQueue(), 1000);
  }

  /**
   * Helper to check if two queue entries can be matched
   */
  canPair(userA, userB) {
    if (!userA || !userB) return false;
    // Cannot match a socket with itself
    if (userA.socketId === userB.socketId) return false;
    // Cannot match a user with themselves (same userId across tabs/sessions)
    if (userA.userId && userB.userId && userA.userId === userB.userId) return false;
    // Cannot match blocked users
    if (reportManager.isBlocked(userA.userId, userB.userId)) return false;
    return true;
  }

  /**
   * Add a user to the matchmaking queue
   */
  enqueueUser(socketId, userId, rawTags = [], rawProfile = {}) {
    // Ensure user is not already in queue or active match
    this.dequeueUser(socketId);
    this.leaveCurrentMatch(socketId);

    // Also remove any duplicate entry by userId to avoid stale/duplicate user records
    if (userId) {
      this.waitingPool = this.waitingPool.filter(u => u.userId !== userId);
    }

    const tags = Array.isArray(rawTags) 
      ? rawTags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
      : [];

    const profile = typeof rawProfile === 'object' && rawProfile !== null ? {
      name: typeof rawProfile.name === 'string' ? rawProfile.name.trim().slice(0, 30) : '',
      age: rawProfile.age ? String(rawProfile.age).trim().slice(0, 3) : '',
      gender: typeof (rawProfile.gender || rawProfile.sex) === 'string' ? (rawProfile.gender || rawProfile.sex).trim().slice(0, 20) : '',
      city: typeof rawProfile.city === 'string' ? rawProfile.city.trim().slice(0, 40) : '',
      country: typeof rawProfile.country === 'string' ? rawProfile.country.trim().slice(0, 40) : ''
    } : { name: '', age: '', gender: '', city: '', country: '' };

    const userEntry = {
      socketId,
      userId,
      tags,
      profile,
      joinedAt: Date.now()
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
   * Process the waiting pool to find 100% random matches
   * Completely random selection among all eligible waiting users.
   * Zero bias, zero influence from profile, tags, age, location, gender, or metadata.
   */
  processQueue() {
    if (this.waitingPool.length < 2) return;

    // Iterate and randomly pair eligible waiting users
    while (this.waitingPool.length >= 2) {
      // Pick a random user index from the waiting pool
      const indexA = Math.floor(Math.random() * this.waitingPool.length);
      const userA = this.waitingPool[indexA];
      if (!userA) break;

      // Find all eligible partner candidates (preventing self-match, cross-tab self-match, blocked users)
      const eligibleIndices = [];
      for (let j = 0; j < this.waitingPool.length; j++) {
        if (j !== indexA && this.canPair(userA, this.waitingPool[j])) {
          eligibleIndices.push(j);
        }
      }

      // If no eligible partner available for userA, break loop
      if (eligibleIndices.length === 0) {
        break;
      }

      // Pick one eligible partner uniformly at random
      const randomCandidateIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
      const userB = this.waitingPool[randomCandidateIndex];

      // Remove both users atomically (highest index first to maintain correct array indices)
      const firstRemove = Math.max(indexA, randomCandidateIndex);
      const secondRemove = Math.min(indexA, randomCandidateIndex);

      this.waitingPool.splice(firstRemove, 1);
      this.waitingPool.splice(secondRemove, 1);

      // Compute shared tags purely for informational display in chat if both users specified matching topics
      const sharedTags = (Array.isArray(userA.tags) && Array.isArray(userB.tags))
        ? userA.tags.filter(tag => userB.tags.includes(tag))
        : [];

      // Create and dispatch the active match
      this.createMatch(userA, userB, sharedTags);
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

