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

  // Test 3: Matchmaking by Interest Tags
  console.log('\n[Test 3] Matchmaking Queue by Shared Interests:');
  let matchResults = [];
  const queue = new MatchmakingQueue((match) => {
    matchResults.push(match);
  });

  // User 1 with tags: 'gaming', 'anime'
  queue.enqueueUser('sock_1', 'user_1', ['gaming', 'anime']);
  // User 2 with tags: 'music', 'coding'
  queue.enqueueUser('sock_2', 'user_2', ['music', 'coding']);
  console.assert(matchResults.length === 0, 'No match should happen yet without shared tags');

  // User 3 with tags: 'anime', 'art' -> should immediately match with User 1!
  queue.enqueueUser('sock_3', 'user_3', ['anime', 'art']);
  console.assert(matchResults.length === 1, 'User 1 and User 3 should match on shared tag "anime"');
  console.assert(matchResults[0].sharedTags.includes('anime'), 'Shared tag should be "anime"');
  console.log('✓ Shared Interest Matchmaking passed.');

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

  queue.destroy();
  console.log('\nAll backend test suites PASSED!\n');
}

runTests();
