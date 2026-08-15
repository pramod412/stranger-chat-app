/**
 * User Feedback Manager
 * Manages user ratings, feature suggestions, bug reports, and UX feedback.
 */

import { v4 as uuidv4 } from 'uuid';

export class FeedbackManager {
  constructor() {
    // Array of feedback objects: { id, userId, category, rating, comment, email, clientInfo, status, createdAt }
    this.feedbacks = [];
  }

  /**
   * Submit a new feedback entry
   */
  addFeedback({ userId = 'anonymous', category = 'general', rating = 5, comment = '', email = '', clientInfo = {} }) {
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      throw new Error('Feedback comment cannot be empty.');
    }

    const validRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    const validCategory = ['feature', 'bug', 'chat', 'matchmaking', 'general'].includes(category) 
      ? category 
      : 'general';

    const feedbackEntry = {
      id: `fb_${uuidv4()}`,
      userId: String(userId).slice(0, 50),
      category: validCategory,
      rating: validRating,
      comment: String(comment).trim().slice(0, 1500),
      email: typeof email === 'string' ? email.trim().slice(0, 100) : '',
      clientInfo: typeof clientInfo === 'object' && clientInfo !== null ? clientInfo : {},
      status: 'new', // 'new' | 'reviewed' | 'resolved'
      createdAt: new Date().toISOString()
    };

    this.feedbacks.unshift(feedbackEntry);

    // Keep memory bounded to 500 items
    if (this.feedbacks.length > 500) {
      this.feedbacks.pop();
    }

    return feedbackEntry;
  }

  /**
   * Get all feedback entries for administrative review
   */
  getAllFeedback(filterCategory = null) {
    if (filterCategory && filterCategory !== 'all') {
      return this.feedbacks.filter(f => f.category === filterCategory);
    }
    return this.feedbacks;
  }

  /**
   * Update feedback status
   */
  updateFeedbackStatus(feedbackId, status, notes = '') {
    const feedback = this.feedbacks.find(f => f.id === feedbackId);
    if (feedback) {
      feedback.status = status;
      if (notes) feedback.adminNotes = notes;
      feedback.updatedAt = new Date().toISOString();
      return feedback;
    }
    return null;
  }

  /**
   * Get feedback analytics and summary stats
   */
  getFeedbackStats() {
    const total = this.feedbacks.length;
    if (total === 0) {
      return {
        total: 0,
        averageRating: 0,
        categoryCounts: { feature: 0, bug: 0, chat: 0, matchmaking: 0, general: 0 },
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const ratingSum = this.feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    const categoryCounts = { feature: 0, bug: 0, chat: 0, matchmaking: 0, general: 0 };
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const f of this.feedbacks) {
      if (categoryCounts[f.category] !== undefined) {
        categoryCounts[f.category]++;
      } else {
        categoryCounts.general++;
      }

      const r = f.rating || 5;
      if (ratingDistribution[r] !== undefined) {
        ratingDistribution[r]++;
      }
    }

    return {
      total,
      averageRating: parseFloat((ratingSum / total).toFixed(1)),
      categoryCounts,
      ratingDistribution
    };
  }
}

export const feedbackManager = new FeedbackManager();
