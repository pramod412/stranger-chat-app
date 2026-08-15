# ⚡ Stranger Chat — Free Anonymous 1-on-1 Chat Platform (Omegle Alternative)

[![Live Demo](https://img.shields.io/badge/Live_App-Visit_Stranger_Chat-E85D3E?style=for-the-badge&logo=vercel&logoColor=white)](https://stranger-chat-app-omega.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Live Website**: [https://stranger-chat-app-omega.vercel.app/](https://stranger-chat-app-omega.vercel.app/)  
> Free, instant, and anonymous 1-on-1 random text and video chat with shared topic matching, dark mode, mobile responsiveness, and zero registration.

---

## 🌟 Key Features

### 1. 🔀 Instant 1-on-1 Matchmaking
- **100% Unbiased Random Matching**: Instant pairing with active strangers worldwide.
- **Shared Interest Topics**: Optionally add tags (`#gaming`, `#music`, `#coding`, `#movies`, `#travel`) to connect with people who share common passions.
- **Next & Skip (`Esc`)**: Jump to the next stranger instantly with one click or the `Escape` key shortcut.
- **Graceful Disconnects**: Real-time notifications when a stranger departs with 1-click re-queueing.

### 2. 💬 Text & WebRTC Video Chat
- **Dual Mode**: Switch seamlessly between lightweight text messaging and encrypted peer-to-peer WebRTC video/audio chat.
- **Privacy by Design**: Ephemeral in-memory rolling buffers; conversations are never permanently stored on disk.
- **Responsive & Modern UI**: Built with high-contrast neo-brutalist & glassmorphic aesthetics, fluid mobile layouts, and a persistent dark mode toggle.
- **Web Audio Chimes**: Synthesized auditory chimes for incoming messages, matches, and skips.

### 3. 🛡️ Safety & Community Moderation
- **Strictly 18+ Adult Platform**: Clear community safety guidelines and age verification.
- **Automated Text Filter**: Real-time screening for profanity, slurs, harassment, phone numbers, and spam floods.
- **1-Click Report & Block**: Instant incident reporting capturing an ephemeral rolling snapshot for moderation review, and blocking prevents future pairing.
- **Moderator Dashboard**: In-app moderation portal to review reports and ban guideline violators.

---

## 🌐 Live Deployment

Try the app in your browser:
👉 **[https://stranger-chat-app-omega.vercel.app/](https://stranger-chat-app-omega.vercel.app/)**

---

## 🚀 Quick Start for Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pramod412/stranger-chat-app.git
   cd stranger-chat-app
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

3. **Run development servers**:
   ```bash
   npm run dev
   ```

- **Frontend Client**: `http://localhost:3000`
- **Backend Server & Socket.IO**: `http://localhost:4000`

---

## 🏗️ Project Architecture

```
 stranger-chat-app/
 ├── server/
 │   ├── src/
 │   │   ├── server.js              # Express + Socket.IO server & security headers
 │   │   ├── matchmaking.js         # Matchmaking queue engine
 │   │   ├── signaling.js           # WebRTC signaling relay (offer, answer, ICE)
 │   │   └── safety/
 │   │       ├── filter.js          # Profanity, harassment, and spam text filter
 │   │       ├── rateLimiter.js     # Sliding-window rate limiters & ban management
 │   │       ├── reportManager.js   # Ephemeral rolling buffers & block matrix
 │   │       └── feedbackManager.js # Community feedback management & analytics
 │   └── tests/
 │       ├── matchmaking.test.js    # Backend unit tests
 │       └── qa_automation.test.js  # 26-suite automated QA and security test suite
 ├── client/
 │   ├── public/
 │   │   ├── robots.txt             # AI & search engine crawler directives
 │   │   └── sitemap.xml            # Canonical XML sitemap
 │   ├── index.html                 # SEO metadata, OpenGraph, JSON-LD structured data
 │   └── src/
 │       ├── App.jsx                # Application shell, header, modal orchestrator
 │       ├── index.css              # Design system tokens, dark mode, responsive styling
 │       ├── components/
 │       │   ├── Landing/           # Hero, InterestPicker, ProfileSetup, AgeGateModal
 │       │   ├── Chat/              # ChatContainer, MatchHeader, MessageList, VideoGrid, ControlsBar
 │       │   └── Modals/            # ReportModal, BlockModal, FeedbackModal, AdminDashboard, ContentModal
 │       └── utils/
 │           ├── soundEffects.js    # Web Audio API synthesizer
 │           └── tagColors.js       # Deterministic tag color mapper
 └── package.json                   # Root workspace scripts
```

---

## 🧪 Testing & Verification

Run the test suite:
```bash
npm --prefix server test
node server/tests/qa_automation.test.js
npm --prefix client run build
```

---

## 📄 License
MIT License.
