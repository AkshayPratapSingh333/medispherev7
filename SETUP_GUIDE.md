# Medisphere - Complete Setup Guide (1-to-1 WebRTC Video Calls)

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Manual Setup Steps](#manual-setup-steps)
4. [Automated Setup (Batch/Shell Files)](#automated-setup)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have:

```
✅ Node.js 16+ (npm or yarn)
✅ Git
✅ MySQL running locally or remote connection string
✅ A code editor (VS Code recommended)
✅ 2 browsers for testing 1-to-1 calls
```

### Check Node.js installation
```bash
node --version  # Should be v16.0.0 or higher
npm --version
```

---

## 📁 Project Structure

```
medispherev7/
├── medisphere-app/              # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                 # Pages & API routes
│   │   ├── components/          # React components
│   │   │   └── video/           # Video call components
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── use-webrtc-peer.ts      # WebRTC peer connection
│   │   │   ├── use-socket-client.ts    # Socket.io client
│   │   │   └── use-socket.ts           # Socket event hooks
│   │   ├── lib/                 # Utilities, auth, types
│   │   └── types/               # TypeScript definitions
│   ├── package.json
│   ├── .env.local               # Environment variables
│   └── tsconfig.json
│
├── medisphere-signaling-server/  # Backend signaling (Express + Socket.io)
│   ├── server.js                # Main server
│   ├── src/
│   │   └── webrtc-handler.js    # WebRTC signaling logic
│   ├── package.json
│   ├── .env                     # Environment variables
│   └── start.bat / start.sh     # Start scripts
│
└── SETUP_GUIDE.md               # This file
```

---

## 🪜 Manual Setup Steps

### Step 1: Clone the Repository (if not already done)

```bash
git clone https://github.com/AkshayPratapSingh333/medispherev7.git
cd medispherev7
```

---

### Step 2: Setup Signaling Server (Express + Socket.io)

#### 2.1 Navigate to the signaling server directory

```bash
cd medisphere-signaling-server
```

#### 2.2 Install dependencies

```bash
npm install
```

#### 2.3 Create `.env` file

```bash
# medisphere-signaling-server/.env

# Server Configuration
PORT=4000
NODE_ENV=development

# NextAuth Secret (same as frontend)
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters

# Optional: CORS Origins (for production)
# CORS_ORIGIN=https://medisphere.app
```

#### 2.4 Verify WebRTC handler exists

Check that `src/webrtc-handler.js` exists. This file handles:
- Meeting room management (join/leave)
- WebRTC offer/answer relay
- ICE candidate relay
- Participant state management

#### 2.5 Start the signaling server

```bash
npm run dev
# or
npm start
```

Expected output:
```
🚀 Signaling server running on port 4000 (WebRTC 1-to-1 calls)
   Health check: http://localhost:4000/health
```

✅ **Signaling server is ready! Keep this terminal open.**

---

### Step 3: Setup Frontend (Next.js 15)

#### 3.1 In a NEW terminal, navigate to frontend

```bash
cd medisphere-app
```

#### 3.2 Install dependencies

```bash
npm install
```

#### 3.3 Create `.env.local` file

```bash
# medisphere-app/.env.local

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters

# Signaling Server URL
NEXT_PUBLIC_SIGNALING_SERVER=http://localhost:4000

# Database (existing)
DATABASE_URL=your-database-url

# Other existing environment variables
# (copy from your .env.local)
```

#### 3.4 Setup Database (Prisma)

If this is your first time:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or create database from scratch
npx prisma db push
```

#### 3.5 Start the frontend development server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 15.5.3
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

✅ **Frontend is ready!**

---

## 🚀 Automated Setup (Using Batch/Shell Files)

### Option A: Windows Users (.bat files)

#### 3-Step Automated Startup

```bash
# In medispherev7 directory, run:
start-all.bat
```

This will:
1. ✅ Open 2 terminal windows
2. ✅ Start signaling server on port 4000
3. ✅ Start frontend on port 3000
4. ✅ Open browser to http://localhost:3000

### Option B: macOS/Linux Users (.sh files)

#### Automated Startup

```bash
# In medispherev7 directory
chmod +x start-all.sh
./start-all.sh
```

This will:
1. ✅ Start signaling server in background
2. ✅ Start frontend in new terminal window
3. ✅ Display port information

---

## 🧪 Testing the System

### Step 1: Open Two Browser Windows

```
Browser 1 (Doctor):    http://localhost:3000
Browser 2 (Patient):   http://localhost:3000
```

### Step 2: Create/Login to Appointments

**Browser 1 (Doctor):**
1. Sign in as doctor
2. Go to `/appointments` → Create appointment or click existing appointment
3. Click "Join Meeting" or "Start Video Call"
4. Grant camera/microphone permissions
5. Wait for patient to join

**Browser 2 (Patient):**
1. Sign in as patient
2. Open same appointment
3. Click "Join Meeting"
4. Grant camera/microphone permissions
5. Should see doctor's video within 5-10 seconds

### Step 3: Test Features

Once connected:

```
✅ Video displaying on both sides
✅ Audio working (say something)
✅ Mute button (🎤 → 🔇)
✅ Camera toggle (📹 → off)
✅ End call button (❌ hangs up)
✅ Chat messages (if implemented)
```

### Step 4: Check Console for Debugging

```
Browser Console (F12 → Console):
✅ WebRTC connection state changes
✅ ICE candidates being gathered
✅ Remote stream received
✅ No major errors

Backend Console:
✅ Socket connection logs
✅ Offer/Answer relay logs
✅ ICE candidate logs
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot GET /health" when visiting http://localhost:4000

**Solution:**
```bash
cd medisphere-signaling-server
npm run dev
# Check if port 4000 is already in use
# If so, kill the process or change PORT in .env
```

### Issue 2: "Connection refused localhost:4000" in browser

**Solution:**
```bash
# Check signaling server is running
curl http://localhost:4000/health

# If not running, start it:
cd medisphere-signaling-server
npm run dev
```

### Issue 3: "Camera/Microphone permission denied"

**Solution:**
```
1. Click browser address bar lock icon
2. Go to Permissions → Camera/Microphone
3. Change from "Block" to "Allow"
4. Refresh page
5. Grant permissions again
```

### Issue 4: "No video feed from other person"

**Solution:**
```
1. Check both users are in same appointment
2. Both users granted camera permissions
3. Both users' internet connection is stable
4. Check browser console for errors
5. Restart both connections (end call + rejoin)

Debug steps:
- F12 → Console → Check for connection errors
- Both shows "Connected" status
- Check Network tab for WebSocket (socket.io) connections
```

### Issue 5: "Audio works but video doesn't"

**Solution:**
```
1. Check cameras are not blocked in Windows/Mac
2. Check if another app is using the camera
3. Verify both users granted permissions
4. Check browser camera settings:
   - Chrome: Settings → Privacy → Camera → Allow localhost:3000
5. Restart browser
```

### Issue 6: "Socket.io connection timeout"

**Solution:**
```
1. Verify NEXT_PUBLIC_SIGNALING_SERVER is correct
2. Check firewall is not blocking port 4000
3. If using macOS, check System Preferences → Security & Privacy
4. Restart signaling server with DEBUG=* npm run dev
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ MEDISPHERE 1-TO-1 VIDEO CALLING SYSTEM          │
├─────────────────────────────────────────────────┤
│                                                 │
│  FRONTEND (Port 3000)                           │
│  ├─ Next.js 15 application                      │
│  ├─ React components (video call UI)            │
│  ├─ Custom hooks (WebRTC, Socket.io)            │
│  └─ NextAuth.js (authentication)                │
│           ↓                                      │
│  SOCKET.IO CLIENT                               │
│  ├─ WebSocket connection to signaling server    │
│  ├─ Emit/Listen for WebRTC signals              │
│  └─ Real-time communication                     │
│           ↓                                      │
│  SIGNALING SERVER (Port 4000)                   │
│  ├─ Express + Node.js                           │
│  ├─ Socket.io WebSocket server                  │
│  ├─ Room management (meetings)                  │
│  ├─ Relay WebRTC SDP offers/answers             │
│  ├─ Relay ICE candidates                        │
│  └─ Participant state tracking                  │
│           ↓                                      │
│  WEBRTC PEER CONNECTIONS (P2P)                  │
│  ├─ Browser 1 ← → Browser 2                     │
│  ├─ Direct encrypted connection (DTLS)          │
│  ├─ Audio/video streaming                       │
│  └─ Uses STUN (NAT traversal)                   │
│           ↓                                      │
│  STUN SERVERS (Public)                          │
│  ├─ stun.l.google.com:19302                     │
│  ├─ stun1-4.l.google.com                        │
│  └─ For NAT hole-punching                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Key Features Explained

### 1. WebRTC Peer Connection
- **What**: Direct encrypted connection between two browsers
- **How**: Uses DTLS encryption, audio/video codecs
- **Why**: Lowest latency, most private

### 2. Signaling Server (Express + Socket.io)
- **Purpose**: Exchange connection setup info (offers, answers, ICE)
- **Not used for**: Audio/video streaming (peer-to-peer)
- **Benefit**: Simple, no extra cost, you control it

### 3. STUN Servers
- **Purpose**: Discover your public IP for NAT traversal
- **Used by**: WebRTC to establish connection if behind firewall
- **Cost**: Free (Google provides), built into browser

### 4. Meeting Room Management
- **Join**: User joins meeting → signaling server tracks them
- **Start WebRTC**: When 2 users present, initiator creates offer
- **Leave**: User leaves → others notified

---

## 📈 Scaling Considerations

### Current Setup (1-to-1 calls)
```
✅ Works perfectly for doctor-patient calls
✅ Zero cost (using free STUN servers)
✅ Uses peer-to-peer (lowest latency)
✅ Scales to 100+ simultaneous calls
   (each call is independent 1-to-1)
```

### Future Scaling (Group calls > 2 people)
```
If you need group calls (3+ people), you'd need:
- Mediasoup SFU (Selective Forwarding Unit)
- More complex signaling
- More server resources

But for doctor-patient (2 users max), current setup is perfect!
```

---

## 🚀 Deployment

### Option 1: Vercel (Frontend) + Railway (Signaling)

```bash
# Frontend deployment
# 1. Push to GitHub
# 2. Connect to Vercel
# 3. Vercel auto-deploys on push

# Backend deployment
# 1. Push to GitHub
# 2. Connect to Railway.app
# 3. Set environment variables
# 4. Railway auto-deploys

Cost: Frontend FREE (Vercel) + Backend FREE (Railway free tier)
```

### Option 2: Self-Hosted VPS

```bash
# DigitalOcean / AWS / Hetzner
# Deploy both frontend and backend
# Cost: $5-20/month depending on traffic
```

---

## 📚 Additional Resources

- **WebRTC Documentation**: https://webrtc.org/
- **Socket.io Documentation**: https://socket.io/docs/
- **Next.js Documentation**: https://nextjs.org/docs
- **MDN WebRTC Guide**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

## ✅ Checklist (Before Going Live)

- [ ] Signaling server running on port 4000
- [ ] Frontend running on port 3000
- [ ] Both users can see each other's video
- [ ] Audio working on both sides
- [ ] Mute/unmute working
- [ ] Camera on/off working
- [ ] End call working
- [ ] Can test on different networks (mobile hotspot)
- [ ] No errors in browser console
- [ ] No errors in signaling server logs

---

## 🎉 You're All Set!

Your Medisphere 1-to-1 video calling system is ready to use!

For questions or issues:
1. Check browser console (F12)
2. Check signaling server terminal for logs
3. Verify all ports are correct
4. Check firewall is not blocking ports

Happy video calling! 🎥

