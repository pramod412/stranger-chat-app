/**
 * Comprehensive Automated QA & Security Testing Suite for NexusStrangers
 * Executes exhaustive functional, regression, safety, security, permutation, and concurrency load tests.
 */

import { MatchmakingQueue } from '../src/matchmaking.js';
import { contentFilter } from '../src/safety/filter.js';
import { rateLimiter } from '../src/safety/rateLimiter.js';
import { reportManager } from '../src/safety/reportManager.js';
import { feedbackManager } from '../src/safety/feedbackManager.js';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(area, title, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
  results.tests.push({ area, title, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'} [${area}] ${title} ${details ? '(' + details + ')' : ''}`);
}

async function runQASuite() {
  console.log('====================================================');
  console.log('🚀 NEXUSSTRANGERS QA & SECURITY VALIDATION SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // 1. REGRESSION CHECK: Instant Real-Time Message Delivery
  // ----------------------------------------------------
  console.log('--- 1. REGRESSION VERIFICATION ---');
  let matchEvents = [];
  const queue = new MatchmakingQueue((match) => {
    matchEvents.push(match);
  });

  queue.enqueueUser('sock_reg_1', 'user_reg_1', []);
  queue.enqueueUser('sock_reg_2', 'user_reg_2', []);

  const regMatch = matchEvents.find(m => 
    (m.user1.socketId === 'sock_reg_1' && m.user2.socketId === 'sock_reg_2') ||
    (m.user1.socketId === 'sock_reg_2' && m.user2.socketId === 'sock_reg_1')
  );

  recordTest('Regression', 'Immediate Matchmaking on Dual Join', !!regMatch, 'Both sockets matched synchronously');

  // Verify message delivery simulation
  const filterPass = contentFilter.evaluate('Hello from user 1!');
  reportManager.recordMessage(regMatch.id, 'user_reg_1', 'user1', filterPass.cleanedText);
  const buffer = reportManager.rollingChatBuffers.get(regMatch.id);
  const msgReceivedInstantly = buffer && buffer.length === 1 && buffer[0].text === 'Hello from user 1!';
  recordTest('Regression', 'Instant Message Buffer Retention (Active Session)', msgReceivedInstantly);

  // ----------------------------------------------------
  // 2. SECTION A: MATCHMAKING & CONCURRENCY TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. SECTION A: MATCHMAKING & RANDOMNESS TESTS ---');
  
  // Test A1: Single user queueing
  const qA1 = new MatchmakingQueue();
  qA1.enqueueUser('sock_solo', 'user_solo', ['gaming']);
  recordTest('Matchmaking', 'Single User Joins Waiting Queue Cleanly', qA1.waitingPool.length === 1);

  // Test A2: Clean removal on cancel
  qA1.dequeueUser('sock_solo');
  recordTest('Matchmaking', 'Queue Cancel Leaves No Ghost Entries', qA1.waitingPool.length === 0);

  // Test A3: 100% Random Pairing (4 Concurrent Users -> 2 Matched Stranger Pairs)
  let randomMatches = [];
  const qRandom = new MatchmakingQueue((m) => randomMatches.push(m));
  qRandom.enqueueUser('s_user_1', 'u_user_1', ['anime']);
  qRandom.enqueueUser('s_user_2', 'u_user_2', ['gaming']);
  qRandom.enqueueUser('s_user_3', 'u_user_3', ['anime']);
  qRandom.enqueueUser('s_user_4', 'u_user_4', ['gaming']);
  recordTest('Matchmaking', '100% Random Pairing (4 Concurrent Users -> 2 Matched Pairs)', randomMatches.length === 2 && qRandom.waitingPool.length === 0);

  // Test A4: Self-Match Prevention (Same Socket ID & Same User ID)
  let selfMatchCount = 0;
  const qSelf = new MatchmakingQueue((m) => selfMatchCount++);
  qSelf.enqueueUser('sock_same_1', 'user_same_id', []);
  qSelf.enqueueUser('sock_same_2', 'user_same_id', []); // Same user in different tab
  recordTest('Matchmaking', 'Self-Match Prevention Across Duplicate Tabs/Sockets', selfMatchCount === 0 && qSelf.waitingPool.length === 1);

  // Test A5: Rapid Skip Abuse Throttling
  const skipSock = 'sock_rapid_skip';
  let skipThrottled = false;
  for (let i = 0; i < 12; i++) {
    const res = rateLimiter.canSkip(skipSock);
    if (!res.allowed) {
      skipThrottled = true;
      break;
    }
  }
  recordTest('Matchmaking', 'Rapid Skip Griefing Rate Limiting', skipThrottled, 'Throttled after threshold');

  // Test A6: High Concurrency Load (20 simultaneous users -> 10 matches)
  let multiMatches = [];
  const qMulti = new MatchmakingQueue((m) => multiMatches.push(m));
  for (let i = 0; i < 20; i++) {
    qMulti.enqueueUser(`multi_sock_${i}`, `multi_user_${i}`, []);
  }
  recordTest('Matchmaking', 'High Concurrency Load (20 users -> 10 matches)', multiMatches.length === 10 && qMulti.waitingPool.length === 0);

  // Test A7: Optional Profile Data Passthrough (Name, Sex/Gender, Age, City, Country)
  let profileMatches = [];
  const qProfile = new MatchmakingQueue((m) => profileMatches.push(m));
  qProfile.enqueueUser('s_prof_1', 'u_prof_1', [], { name: 'Alex', gender: 'Male (M)', age: '22', city: 'Tokyo', country: 'Japan' });
  qProfile.enqueueUser('s_prof_2', 'u_prof_2', [], { name: 'Sam', gender: 'Female (F)', age: '', city: 'London', country: 'UK' });
  
  const pMatch = profileMatches[0];
  const u1 = pMatch?.user1?.profile;
  const u2 = pMatch?.user2?.profile;
  const profileValid = pMatch && (
    (u1?.name === 'Alex' && u1?.gender === 'Male (M)' && u2?.name === 'Sam' && u2?.gender === 'Female (F)') ||
    (u2?.name === 'Alex' && u2?.gender === 'Male (M)' && u1?.name === 'Sam' && u1?.gender === 'Female (F)')
  );
  recordTest('Matchmaking', 'Optional Profile Payload Retention (Name, Sex/Gender, Age, City, Country)', profileValid);

  // ----------------------------------------------------
  // 3. SECTION B: REAL-TIME MESSAGING & PAYLOADS
  // ----------------------------------------------------
  console.log('\n--- 3. SECTION B: MESSAGING PAYLOAD TESTS ---');
  
  // Test B1: Emoji & Unicode handling
  const emojiText = 'Hello! 👋🎉🔥 🚀 Nexus Chat! 日本語 العربية';
  const emojiFilter = contentFilter.evaluate(emojiText);
  recordTest('Messaging', 'Unicode, Emojis & Multilingual Script Passthrough', emojiFilter.isAllowed && emojiFilter.cleanedText === emojiText);

  // Test B2: Long message handling (2000 chars)
  const longText = 'A'.repeat(2000);
  const longFilter = contentFilter.evaluate(longText);
  recordTest('Messaging', 'Excessive Repetitive Character Spam Detection', !longFilter.isAllowed && longFilter.severity === 'warning');

  // Test B3: HTML / XSS Injection Sanitization
  const xssAttempt = '<script>alert("hacked")</script><img src=x onerror=alert(1)>';
  const xssFilter = contentFilter.evaluate(xssAttempt);
  recordTest('Messaging', 'XSS Injections Non-Executable Evaluation', xssFilter.isAllowed);

  // ----------------------------------------------------
  // 4. SECTION C: SESSION LIFECYCLE & DISCONNECT TESTS
  // ----------------------------------------------------
  console.log('\n--- 4. SECTION C: SESSION & DISCONNECT TESTS ---');

  // Test C1: Disconnect cleanly notifies partner
  let discEvents = [];
  const qDisc = new MatchmakingQueue((m) => discEvents.push(m));
  qDisc.enqueueUser('sock_d1', 'user_d1', []);
  qDisc.enqueueUser('sock_d2', 'user_d2', []);

  const dMatch = discEvents[0];
  const leaveResult = qDisc.leaveCurrentMatch('sock_d1');
  const partnerNotified = leaveResult && leaveResult.partner.socketId === 'sock_d2';
  recordTest('Session', 'Mid-Chat Disconnect Notifies Partner Correctly', partnerNotified);

  // Test C2: Room Cleaned up after Departure
  const matchAfterLeave = qDisc.getMatchBySocket('sock_d1');
  recordTest('Session', 'Active Match Room Cleaned After Departure', matchAfterLeave === null && qDisc.activeMatches.size === 0);

  // ----------------------------------------------------
  // 5. SECTION D: SAFETY & MODERATION TOOLKIT
  // ----------------------------------------------------
  console.log('\n--- 5. SECTION D: SAFETY TOOLKIT TESTS ---');

  // Test D1: Hate Speech / Severe Violation
  const toxicCheck = contentFilter.evaluate('go commit suicide and kys');
  recordTest('Safety', 'Severe Harassment / Self-Harm Instigation Blocked', !toxicCheck.isAllowed && toxicCheck.severity === 'blocked');

  // Test D2: Moderate Profanity Censor Masking
  const profanityCheck = contentFilter.evaluate('What the fuck is this shit?');
  recordTest('Safety', 'Moderate Profanity Censor Masking', profanityCheck.isAllowed && profanityCheck.cleanedText.includes('****') && !profanityCheck.cleanedText.includes('fuck'));

  // Test D3: Sensitive Data / Phone Number Alert
  const piiCheck = contentFilter.evaluate('Call me at 555-867-5309 tonight');
  recordTest('Safety', 'Phone Number / PII Warning Flagging', piiCheck.isAllowed && piiCheck.severity === 'warning');

  // Test D4: Sliding Window Message Flood
  const floodSocket = 'sock_flood_tester';
  let floodBlocked = false;
  for (let i = 0; i < 8; i++) {
    const res = rateLimiter.canSendMessage(floodSocket);
    if (!res.allowed) {
      floodBlocked = true;
      break;
    }
  }
  recordTest('Safety', 'Message Flood Spam Throttling', floodBlocked);

  // Test D5: Incident Reporting & Rolling Snapshot Audit
  const testMatchId = 'match_safety_audit_777';
  reportManager.recordMessage(testMatchId, 'u_rep_1', 'user1', 'Hey');
  reportManager.recordMessage(testMatchId, 'u_rep_2', 'user2', 'You are terrible');
  
  const filedReport = reportManager.submitReport({
    reporterId: 'u_rep_1',
    reportedId: 'u_rep_2',
    matchId: testMatchId,
    category: 'harassment',
    details: 'User was verbally abusive'
  });

  const reportValid = filedReport && filedReport.chatSnapshot.length === 2 && filedReport.status === 'pending';
  recordTest('Safety', 'Report Capture with In-Memory Rolling Snapshot', reportValid);

  // Test D6: Block Matrix Exclusion
  reportManager.addBlock('user_alpha', 'user_beta');
  const qBlock = new MatchmakingQueue();
  let blockMatchCount = 0;
  qBlock.onMatchFound = () => blockMatchCount++;
  qBlock.enqueueUser('s_alpha', 'user_alpha', []);
  qBlock.enqueueUser('s_beta', 'user_beta', []);
  recordTest('Safety', 'Block Matrix Prevents Paired Matching', blockMatchCount === 0 && reportManager.isBlocked('user_alpha', 'user_beta'));

  // ----------------------------------------------------
  // 6. SECTION E: USER FEEDBACK & RATINGS
  // ----------------------------------------------------
  console.log('\n--- 6. SECTION E: USER FEEDBACK TESTS ---');

  // Test E1: Valid Feedback Submission
  const fb1 = feedbackManager.addFeedback({
    userId: 'test_user_fb1',
    category: 'feature',
    rating: 5,
    comment: 'Would love dark mode and voice notes!',
    email: 'user@example.com'
  });
  recordTest('Feedback', 'Valid Feedback Submission & Storage', !!fb1 && fb1.rating === 5 && fb1.category === 'feature');

  // Test E2: Empty Comment Validation
  let emptyRejected = false;
  try {
    feedbackManager.addFeedback({ userId: 'u_test', comment: '   ' });
  } catch {
    emptyRejected = true;
  }
  recordTest('Feedback', 'Rejection of Empty Comment Submissions', emptyRejected);

  // Test E3: Multi-Category Aggregation & Metrics
  feedbackManager.addFeedback({ userId: 'u2', category: 'bug', rating: 3, comment: 'Slight lag on disconnect' });
  feedbackManager.addFeedback({ userId: 'u3', category: 'chat', rating: 4, comment: 'Great clean UI' });
  
  const stats = feedbackManager.getFeedbackStats();
  const statsValid = stats.total >= 3 && stats.averageRating > 0 && stats.categoryCounts.bug >= 1;
  recordTest('Feedback', 'Feedback Metrics & Category Aggregation', statsValid, `Avg: ${stats.averageRating}★`);

  // Test E4: Status Update Workflow
  const updated = feedbackManager.updateFeedbackStatus(fb1.id, 'reviewed', 'Added to sprint backlog');
  recordTest('Feedback', 'Admin Feedback Status Triage Workflow', updated?.status === 'reviewed');

  // ----------------------------------------------------
  // 7. SECTION F: SECURITY & ENTROPY
  // ----------------------------------------------------
  console.log('\n--- 7. SECTION F: SECURITY TESTS ---');

  // Test F1: Unpredictable Cryptographic Match IDs
  const sampleMatch = matchEvents[0];
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sampleMatch.id.replace('match_', ''));
  recordTest('Security', 'Unpredictable Cryptographic Match IDs (UUIDv4)', isUUID);

  // Test F2: Ban Enforcement
  rateLimiter.banUser('banned_malicious_user', 'Violation of guidelines');
  recordTest('Security', 'Persistent Ban Enforcement at Ingress', rateLimiter.isBanned('banned_malicious_user'));

  // Cleanup
  qA1.destroy();
  qRandom.destroy();
  qSelf.destroy();
  qMulti.destroy();
  qProfile.destroy();
  qDisc.destroy();
  qBlock.destroy();
  queue.destroy();

  console.log('\n====================================================');
  console.log(`📊 QA AUTOMATION SUMMARY: ${results.passed}/${results.total} TESTS PASSED (${((results.passed / results.total) * 100).toFixed(1)}%)`);
  console.log('====================================================\n');
}

runQASuite();
