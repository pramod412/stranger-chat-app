/**
 * Report & Block Management + Ephemeral Rolling Buffer
 * Ensures privacy-first architecture: no long-term chat logs stored unless an active report is filed.
 */

import { v4 as uuidv4 } from 'uuid';

export class ReportManager {
  constructor() {
    // matchId -> Array<{ senderId: string, senderRole: string, text: string, timestamp: number }>
    this.rollingChatBuffers = new Map();
    
    // userId -> Set<blockedUserId>
    this.blocks = new Map();

    // In-memory reports store for moderator review
    this.reports = [];
  }

  /**
   * Record a message in the rolling buffer for the active match
   */
  recordMessage(matchId, senderId, senderRole, text) {
    if (!this.rollingChatBuffers.has(matchId)) {
      this.rollingChatBuffers.set(matchId, []);
    }
    const buffer = this.rollingChatBuffers.get(matchId);
    buffer.push({
      senderId,
      senderRole,
      text,
      timestamp: Date.now()
    });

    // Limit buffer to last 25 messages
    if (buffer.length > 25) {
      buffer.shift();
    }
  }

  /**
   * Purge chat buffer once a session concludes normally without incident
   */
  purgeMatchBuffer(matchId) {
    // Delay slightly in case a report is being submitted at the moment of skip/disconnect
    setTimeout(() => {
      this.rollingChatBuffers.delete(matchId);
    }, 5000);
  }

  /**
   * Submit an incident report with the captured rolling buffer
   */
  submitReport({ reporterId, reportedId, matchId, category, details = '' }) {
    const chatSnapshot = this.rollingChatBuffers.get(matchId) || [];
    const report = {
      id: uuidv4(),
      reporterId,
      reportedId,
      matchId,
      category,
      details,
      chatSnapshot: [...chatSnapshot],
      createdAt: new Date().toISOString(),
      status: 'pending' // 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
    };

    this.reports.unshift(report);

    // Keep reports memory bounded to 200 items in memory
    if (this.reports.length > 200) {
      this.reports.pop();
    }

    return report;
  }

  /**
   * Block a user
   */
  addBlock(userId, blockedUserId) {
    if (!this.blocks.has(userId)) {
      this.blocks.set(userId, new Set());
    }
    this.blocks.get(userId).add(blockedUserId);
  }

  /**
   * Check if userA has blocked userB, or userB has blocked userA
   */
  isBlocked(userA, userB) {
    if (this.blocks.get(userA)?.has(userB)) return true;
    if (this.blocks.get(userB)?.has(userA)) return true;
    return false;
  }

  /**
   * Get all reports for the admin dashboard
   */
  getAllReports() {
    return this.reports;
  }

  /**
   * Update report status (e.g., dismiss or ban)
   */
  updateReportStatus(reportId, status, moderatorNotes = '') {
    const report = this.reports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      report.moderatorNotes = moderatorNotes;
      report.reviewedAt = new Date().toISOString();
      return report;
    }
    return null;
  }
}

export const reportManager = new ReportManager();
