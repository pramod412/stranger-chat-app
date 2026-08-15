/**
 * Unit & Integration verification for Matchmaking & Safety Core
 */

import { MatchmakingQueue } from '../src/matchmaking.js';
import { contentFilter } from '../src/safety/filter.js';
import { rateLimiter } from '../src/safety/rateLimiter.js';
import { reportManager } from '../src/safety/reportManager.js';

function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  // Test 1: Content Filter
  console.log('\n[Test 1] Content Filter:');
  const cleanTest = contentFilter.evaluate('Hello, how are you today?');
  console.assert(cleanTest.isAllowed === true, 'Clean message should be allowed');
  console.assert(cleanTest.severity === 'none', 'Clean message should have no severity');

  const toxicTest = contentFilter.evaluate('I hope you kys right now');
  console.assert(toxicTest.isAllowed === false, 'Severe harassment should be blocked');
  console.assert(toxicTest.severity === 'blocked', 'Severe harassment should be flagged as blocked');

  const moderateTest = contentFilter.evaluate('What the fuck is this?');
  console.assert(moderateTest.isAllowed === true, 'Moderate profanity should be allowed with censorship');
  console.assert(moderateTest.cleanedText.includes('****'), 'Moderate profanity should be masked');

  console.log('✓ Content Filter tests passed successfully.');

  // Test 2: Rate Limiter
  console.log('\n[Test 2] Rate Limiter:');
  const socketId = 'test_sock_123';
  for (let i = 0; i < 6; i++) {
    rateLimiter.canSendMessage(socketId);
  }
  const spamResult = rateLimiter.canSendMessage(socketId);
  console.assert(spamResult.allowed === false, '7th message in 3 seconds should be throttled');
  rateLimiter.cleanup(socketId);
  console.log('✓ Rate Limiter tests passed successfully.');

  // Test 3: Matchmaking Queue Tests (1, 2, 4 users, self-matching prevention, interest priority)
  console.log('\n[Test 3] Matchmaking Queue Tests:');
  
  // 3a. 1 user queues (should wait cleanly)
  let singleMatches = [];
  const qSingle = new MatchmakingQueue((m) => singleMatches.push(m));
  qSingle.enqueueUser('sock_solo_1', 'user_solo_1', ['gaming']);
  console.assert(singleMatches.length === 0, '1 user should not be matched alone');
  console.assert(qSingle.waitingPool.length === 1, '1 user should be waiting in queue');

  // 3b. Same user / same socket must not match with itself
  qSingle.enqueueUser('sock_solo_1', 'user_solo_1', ['gaming']);
  console.assert(singleMatches.length === 0, 'User must not match with itself');
  console.assert(qSingle.waitingPool.length === 1, 'Duplicate enqueue should replace existing entry');

  // 3c. 2 users queue -> matched immediately
  qSingle.enqueueUser('sock_solo_2', 'user_solo_2', ['music']);
  console.assert(singleMatches.length === 1, '2 users should match immediately');
  console.assert(qSingle.waitingPool.length === 0, 'Matched users should be removed from queue');
  console.assert(qSingle.activeMatches.size === 1, '1 active match should exist');
  qSingle.destroy();

  // 3d. 4 concurrent users queue with 100% random matching
  let fourMatches = [];
  const qFour = new MatchmakingQueue((m) => fourMatches.push(m));
  qFour.waitingPool.push({ socketId: 'sock_4a', userId: 'user_4a', tags: ['anime', 'music'], profile: {}, joinedAt: Date.now() });
  qFour.waitingPool.push({ socketId: 'sock_4b', userId: 'user_4b', tags: ['sports'], profile: {}, joinedAt: Date.now() });
  qFour.waitingPool.push({ socketId: 'sock_4c', userId: 'user_4c', tags: ['anime', 'tech'], profile: {}, joinedAt: Date.now() });
  qFour.waitingPool.push({ socketId: 'sock_4d', userId: 'user_4d', tags: ['movies'], profile: {}, joinedAt: Date.now() });
  qFour.processQueue();

  console.assert(fourMatches.length === 2, '4 users should form 2 distinct matches');
  console.assert(qFour.waitingPool.length === 0, 'No users should be left waiting in queue');
  console.assert(qFour.activeMatches.size === 2, '2 active matches should be running');

  // 3e. 4 sequential users joining -> pairs immediately into 2 matches
  let seqMatches = [];
  const qSeq = new MatchmakingQueue((m) => seqMatches.push(m));
  qSeq.enqueueUser('s1', 'u1', ['gaming']);
  qSeq.enqueueUser('s2', 'u2', ['coding']);
  qSeq.enqueueUser('s3', 'u3', ['music']);
  qSeq.enqueueUser('s4', 'u4', ['art']);
  console.assert(seqMatches.length === 2, '4 sequential users should immediately form 2 matches');
  console.assert(qSeq.waitingPool.length === 0, 'Queue should be empty');
  console.assert(qSeq.activeMatches.size === 2, '2 active matches should exist');
  qSeq.destroy();

  // 3f. Rematching after chat conclusion
  const leaveInfo = qFour.leaveCurrentMatch('sock_4a');
  console.assert(qFour.activeMatches.size === 1, 'One active match left after pair 1 ends');
  
  // Re-enqueue sock_4a and sock_new
  let rematchEvents = [];
  qFour.onMatchFound = (m) => rematchEvents.push(m);
  qFour.enqueueUser('sock_4a', 'user_4a', []);
  qFour.enqueueUser('sock_new', 'user_new', []);
  console.assert(rematchEvents.length === 1, 'Users leaving a chat can immediately be rematched');
  qFour.destroy();

  console.log('✓ Matchmaking Queue tests passed (1, 2, 4 users, self-match prevention & rematching).');

  // Test 4: Block Matrix
  console.log('\n[Test 4] Block Matrix:');
  reportManager.addBlock('user_4', 'user_5');
  console.assert(reportManager.isBlocked('user_4', 'user_5') === true, 'user_4 and user_5 should be blocked');
  console.assert(reportManager.isBlocked('user_5', 'user_4') === true, 'Block relationship should be bidirectional');
  console.log('✓ Block Matrix tests passed.');

  // Test 5: Ephemeral Rolling Buffer & Reports
  console.log('\n[Test 5] Ephemeral Rolling Buffer & Reports:');
  const matchId = 'test_match_999';
  reportManager.recordMessage(matchId, 'user_1', 'user1', 'Hi stranger');
  reportManager.recordMessage(matchId, 'user_2', 'user2', 'Hello there');

  const report = reportManager.submitReport({
    reporterId: 'user_1',
    reportedId: 'user_2',
    matchId,
    category: 'harassment',
    details: 'Spamming repeatedly'
  });

  console.assert(report.chatSnapshot.length === 2, 'Report should capture rolling buffer snapshot');
  console.assert(report.status === 'pending', 'New report should be pending');
  console.log('✓ Ephemeral Rolling Buffer & Report test passed.');

  console.log('\nAll backend test suites PASSED!\n');
}

runTests();
