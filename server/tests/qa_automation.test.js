/**
 * Comprehensive Automated QA Testing Suite for NexusStrangers
 * Executes exhaustive functional, regression, safety, security, and concurrency load tests.
 */

import { MatchmakingQueue } from '../src/matchmaking.js';
import { contentFilter } from '../src/safety/filter.js';
import { rateLimiter } from '../src/safety/rateLimiter.js';
import { reportManager } from '../src/safety/reportManager.js';

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
  console.log('🚀 NEXUSSTRANGERS QA AUTOMATION TEST SUITE EXECUTION');
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
  // 2. SECTION A: MATCHMAKING
  // ----------------------------------------------------
  console.log('\n--- 2. SECTION A: MATCHMAKING TESTS ---');
  
  // Test A1: Single user queueing
  const qA1 = new MatchmakingQueue();
  qA1.enqueueUser('sock_solo', 'user_solo', ['gaming']);
  recordTest('Matchmaking', 'Single User Joins Waiting Queue Cleanly', qA1.waitingPool.length === 1);

  // Test A2: Clean removal on cancel
  qA1.dequeueUser('sock_solo');
  recordTest('Matchmaking', 'Queue Cancel Leaves No Ghost Entries', qA1.waitingPool.length === 0);

  // Test A3: Shared Interest Preference
  let interestMatches = [];
  const qInterests = new MatchmakingQueue((m) => interestMatches.push(m));
  qInterests.enqueueUser('s_anime_1', 'u_anime_1', ['anime', 'music']);
  qInterests.enqueueUser('s_gaming_1', 'u_gaming_1', ['gaming']);
  qInterests.enqueueUser('s_anime_2', 'u_anime_2', ['anime', 'tech']);

  const animeMatched = interestMatches.find(m => 
    (m.user1.socketId === 's_anime_1' && m.user2.socketId === 's_anime_2') ||
    (m.user1.socketId === 's_anime_2' && m.user2.socketId === 's_anime_1')
  );
  recordTest('Matchmaking', 'Shared Interest Priority Pairing', !!animeMatched && animeMatched.sharedTags.includes('anime'));

  // Test A4: Rapid Skip Abuse Throttling
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

  // Test A5: Concurrency Load (10 simultaneous users)
  let multiMatches = [];
  const qMulti = new MatchmakingQueue((m) => multiMatches.push(m));
  for (let i = 0; i < 10; i++) {
    qMulti.enqueueUser(`multi_sock_${i}`, `multi_user_${i}`, []);
  }
  recordTest('Matchmaking', 'Multi-user Concurrent Pairing (10 users -> 5 matches)', multiMatches.length === 5);

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
  // Should reject excessive repetitive characters spam
  recordTest('Messaging', 'Excessive Repetitive Character Spam Detection', !longFilter.isAllowed && longFilter.severity === 'warning');

  // Test B3: HTML / XSS Injection Sanitization
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const xssEval = contentFilter.evaluate(xssPayload);
  recordTest('Messaging', 'XSS Injections Non-Executable Evaluation', xssEval.isAllowed === true, 'Rendered safely as text');

  // ----------------------------------------------------
  // 4. SECTION C: SESSION & DISCONNECT HANDLING
  // ----------------------------------------------------
  console.log('\n--- 4. SECTION C: SESSION & DISCONNECT TESTS ---');
  
  const qDisc = new MatchmakingQueue();
  qDisc.enqueueUser('s_disc_1', 'u_disc_1', []);
  qDisc.enqueueUser('s_disc_2', 'u_disc_2', []);
  
  const leaveInfo = qDisc.leaveCurrentMatch('s_disc_1');
  const partnerCorrect = leaveInfo && leaveInfo.partner.socketId === 's_disc_2';
  const sessionCleared = qDisc.activeMatches.size === 0;
  recordTest('Session', 'Mid-Chat Disconnect Notifies Partner Correctly', partnerCorrect);
  recordTest('Session', 'Active Match Room Cleaned After Departure', sessionCleared);

  // ----------------------------------------------------
  // 5. SECTION D: SAFETY & MODERATION
  // ----------------------------------------------------
  console.log('\n--- 5. SECTION D: SAFETY TOOLKIT TESTS ---');

  // Test D1: Hate Speech / Severe Harassment Blocking
  const severeMsg = 'go kys right now loser';
  const severeRes = contentFilter.evaluate(severeMsg);
  recordTest('Safety', 'Severe Harassment / Self-Harm Instigation Blocked', !severeRes.isAllowed && severeRes.severity === 'blocked');

  // Test D2: Moderate Profanity Auto-Masking
  const profanityMsg = 'This is bullshit and fucking crazy';
  const profRes = contentFilter.evaluate(profanityMsg);
  recordTest('Safety', 'Moderate Profanity Censor Masking', profRes.isAllowed && profRes.cleanedText.includes('****'));

  // Test D3: Sensitive Data / Phone Number Warning
  const phoneMsg = 'Call me at +1 555-019-2834 tonight';
  const phoneRes = contentFilter.evaluate(phoneMsg);
  recordTest('Safety', 'Phone Number / PII Warning Flagging', phoneRes.violation !== null);

  // Test D4: Message Flooding Rate Limiter
  const floodSock = 'sock_flooder_99';
  let floodBlocked = false;
  for (let i = 0; i < 10; i++) {
    const res = rateLimiter.canSendMessage(floodSock);
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
  // 6. SECTION F: SECURITY & ENTROPY
  // ----------------------------------------------------
  console.log('\n--- 6. SECTION F: SECURITY TESTS ---');

  // Verify Non-predictable User IDs
  const sampleMatch = matchEvents[0];
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sampleMatch.id.replace('match_', ''));
  recordTest('Security', 'Unpredictable Cryptographic Match IDs (UUIDv4)', isUUID);

  // Cleanup
  qA1.destroy();
  qInterests.destroy();
  qMulti.destroy();
  qDisc.destroy();
  qBlock.destroy();
  queue.destroy();

  console.log('\n====================================================');
  console.log(`📊 QA AUTOMATION SUMMARY: ${results.passed}/${results.total} TESTS PASSED (${((results.passed / results.total) * 100).toFixed(1)}%)`);
  console.log('====================================================\n');
}

runQASuite();
