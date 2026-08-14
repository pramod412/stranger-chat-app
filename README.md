# ⚡ NexusStrangers — Next-Gen Random Stranger Chat Platform

A modern, privacy-first, real-time anonymous random chat platform featuring instantaneous 1-on-1 text messaging, WebRTC video/audio streaming, interest-based affinity matchmaking, and a multi-layered safety & moderation toolkit.

---

## 🌟 Key Features

### 1. 🔀 Smart Matchmaking
- **Dual-tier matchmaking**:
  - **Shared Interest Match**: Pairs users based on common topic tags (`#gaming`, `#music`, `#tech`, etc.).
  - **Automatic Fallback Pool**: If no tag match is found within 4 seconds, gracefully matches with any active waiting stranger.
- **Skip & Next (Esc)**: One-click or `Esc` shortcut to immediately transition to a new stranger.
- **Graceful Disconnects**: If a peer closes their browser or leaves, the other user is notified and given 1-click access to re-queue.

### 2. 💬 Real-Time Live Chat & WebRTC Video
- **Low-latency WebSockets (Socket.IO)**: Real-time message relay, typing indicators, and delivery status.
- **P2P WebRTC Video & Audio**: Seamless camera/microphone calls with local camera toggle, audio mute, and picture-in-picture preview.
- **Ephemeral Privacy**: Chat logs are **never** stored permanently on disk. Rolling buffers are only retained in-memory during active matches and permanently purged once the session concludes.
- **Web Audio Sound Effects**: Zero-dependency synthesized auditory feedback for match connections, message chimes, and skips.

### 3. 🛡️ Built-in Safety & Moderation Suite
- **18+ Age Verification & Terms Gate**: Compulsory confirmation before joining the matching pool.
- **Anti-Bot Verification**: Interactive math/challenge gate before queue entry.
- **Pre-send Text Filter**: Detects severe hate speech, harassment patterns, phone numbers, and repetitious spam.
- **Incident Reporting with Rolling Snapshot**: Submitting a report attaches the ephemeral in-memory conversation buffer for moderator auditing.
- **1-Click Blocklist Matrix**: Blocks prevent users from ever being paired again.
- **Moderator Dashboard**: Live `/api/admin/reports` portal to review incident claims, inspect flagged chats, and ban malicious actors.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

2. **Run both Backend Server and Frontend simultaneously**:
   ```bash
   npm run dev
   ```

- **Frontend Client**: `http://localhost:3000`
- **Backend API & Socket.IO**: `http://localhost:4000`

---

## 🏗️ Project Architecture

```
 stranger-chat-app/
 ├── server/
 │   ├── src/
 │   │   ├── server.js              # Express + Socket.IO server entrypoint
 │   │   ├── matchmaking.js         # Matchmaking queue engine (interest & random pools)
 │   │   ├── signaling.js           # WebRTC signaling relay (offer, answer, ICE candidates)
 │   │   └── safety/
 │   │       ├── filter.js          # Profanity, harassment, and spam text filter
 │   │       ├── rateLimiter.js     # Rate limits for message flooding and rapid skipping
 │   │       └── reportManager.js   # Rolling chat buffers, reports & block matrix
 │   └── tests/
 │       └── matchmaking.test.js    # Backend test suite
 ├── client/
 │   ├── src/
 │   │   ├── App.jsx                # Application shell & modal orchestrator
 │   │   ├── index.css              # Cyber-dark glassmorphic design system
 │   │   ├── contexts/
 │   │   │   ├── SocketContext.jsx  # Real-time WebSocket connection state
 │   │   │   └── WebRTCContext.jsx  # P2P media streams & device toggles
 │   │   ├── components/
 │   │   │   ├── Landing/           # Hero, AgeGateModal, CaptchaCheck, InterestPicker
 │   │   │   ├── Chat/              # ChatContainer, MatchHeader, MessageList, VideoGrid, ControlsBar
 │   │   │   └── Modals/            # ReportModal, BlockModal, AdminDashboard
 │   │   └── utils/
 │   │       └── soundEffects.js    # Web Audio API synthesizer
 └── package.json                   # Root workspace scripts
```

---

## 🧪 Testing

To run the automated backend test suite:
```bash
npm --prefix server test
```
