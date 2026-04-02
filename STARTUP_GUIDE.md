# Medisphere WebRTC Video Calling - Complete Startup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Starting the Application](#starting-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Architecture Overview](#architecture-overview)
9. [Features Overview](#features-overview)

---

## Prerequisites

Before starting, ensure you have installed:

- **Node.js** >= 18.x (Download from [nodejs.org](https://nodejs.org))
- **npm** >= 9.x (comes with Node.js)
- **Git** (Download from [git-scm.com](https://git-scm.com))
- **MySQL** >= 5.7 (Download from [mysql.com](https://www.mysql.com/downloads/))
  - OR use a cloud MySQL service (PlanetScale, AWS RDS, etc.)

### System Requirements
- Windows, macOS, or Linux
- Minimum 4GB RAM
- Modern browser (Chrome, Firefox, Edge, Safari)
- Webcam and microphone (for testing video calls)

---

## Project Structure

```
medispherev7/
├── medisphere-app/                   # Main Next.js application (Frontend)
│   ├── src/
│   │   ├── app/                      # Next.js 15 App Router
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── api/                  # API routes
│   │   │   └── appointments/
│   │   │       └── [id]/
│   │   │           └── video/        # Video call page ✨ NEW
│   │   ├── components/
│   │   │   └── video/
│   │   │       └── VideoCall.tsx     # Video call component ✨ NEW
│   │   ├── hooks/
│   │   │   ├── use-socket-client.ts  # Socket.io connection hook ✨ UPDATED
│   │   │   └── use-webrtc-call.ts    # WebRTC peer connection hook ✨ NEW
│   │   ├── lib/
│   │   ├── types/
│   │   └── middleware.ts             # Route protection
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example                  # Environment variables template ✨ NEW
│   └── prisma/
│       └── schema.prisma             # Database schema
│
├── medisphere-signaling-server/      # Socket.io Signaling Server
│   ├── server.js                     # Main server file ✨ UPDATED
│   ├── package.json
│   ├── .env.example                  # Environment variables template ✨ NEW
│   └── src/                          # Optional: organize into modules
│
└── PROJECT_REPORT.md                 # Project documentation
```

### ✨ What's New
- `VideoCall.tsx` - Professional video call component with controls
- `use-webrtc-call.ts` - WebRTC peer connection hook
- `use-socket-client.ts` - Enhanced Socket.io connection management
- Updated signaling server with WebRTC event handlers
- Video call page at `/appointments/[id]/video`

---

## Installation Steps

### Step 1: Clone the Repository (if needed)

```bash
git clone https://github.com/AkshayPratapSingh333/medispherev7.git
cd medispherev7
```

### Step 2: Install Frontend Dependencies

```bash
cd medisphere-app
npm install
```

This installs all required packages including:
- Next.js 15
- React 19
- Socket.io-client
- WebRTC libraries
- TailwindCSS
- NextAuth.js
- Prisma ORM

### Step 3: Install Signaling Server Dependencies

```bash
cd ../medisphere-signaling-server
npm install
```

This installs:
- Express.js
- Socket.io
- CORS
- JWT (jsonwebtoken)
- Morgan (logging)
- Helmet (security)

### Step 4: Setup MySQL Database

#### Option A: Local MySQL Installation

```bash
# Windows - if MySQL is installed
mysql -u root -p

# Create database
CREATE DATABASE medisphere;
CREATE USER 'medisphere_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON medisphere.* TO 'medisphere_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Option B: Docker (if you have Docker installed)

```bash
# Start MySQL container
docker run --name medisphere-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=medisphere \
  -e MYSQL_USER=medisphere_user \
  -e MYSQL_PASSWORD=userpassword \
  -p 3306:3306 \
  -d mysql:8.0
```

#### Option C: Cloud MySQL (Recommended for Production)

Use PlanetScale, AWS RDS, or DigitalOcean managed MySQL. Follow their setup instructions.

### Step 5: Setup Prisma

```bash
cd medisphere-app

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

---

## Configuration

### Step 1: Frontend Environment Variables

```bash
cd medisphere-app

# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
# Windows: notepad .env.local
# macOS/Linux: nano .env.local
```

**Edit these values in `.env.local`:**

```env
# Must match your signaling server URL
NEXT_PUBLIC_SIGNALING_SERVER=http://localhost:4000

# Secret for NextAuth (generate a random string, e.g., openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-key-here

# Database connection string
DATABASE_URL=mysql://medisphere_user:userpassword@localhost:3306/medisphere

# Optional: Add your actual credentials here for production
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

### Step 2: Signaling Server Environment Variables

```bash
cd medisphere-signaling-server

# Copy example env file
cp .env.example .env

# Edit .env
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Edit these values in `.env`:**

```env
PORT=4000
NODE_ENV=development

# Must match your frontend NEXTAUTH_SECRET
NEXTAUTH_SECRET=your-random-secret-key-here

# Allowed origins (adjust if running on different ports)
CORS_ORIGIN=http://localhost:3000
```

---

## Starting the Application

### Quick Start (All-in-One)

#### Windows - Use Batch Files (see below)

#### macOS/Linux - Use Shell Scripts

```bash
# Make scripts executable
chmod +x start-dev.sh
chmod +x setup-dev.sh

# First time: Run setup
./setup-dev.sh

# Then: Start everything
./start-dev.sh
```

### Manual Start

#### Terminal 1: Start Signaling Server

```bash
cd medisphere-signaling-server
npm run dev
# Output: "Signaling server running on port 4000"
```

#### Terminal 2: Start Frontend Application

```bash
cd medisphere-app
npm run dev
# Output: "ready - started server on 0.0.0.0:3000, url: http://localhost:3000"
```

### Expected Startup Output

**Signaling Server (Terminal 1):**
```
> nodemon server.js

[nodemon] 3.1.0
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
Signaling server running on port 4000
```

**Frontend (Terminal 2):**
```
> next dev --turbopack

  ▲ Next.js 15.5.3
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.1s
```

Once both are running:
1. Open http://localhost:3000 in your browser
2. You should see the Medisphere home page
3. Sign up or log in with test credentials

---

## Testing

### Prerequisites for Testing
- Two browsers or two separate windows/tabs
- Webcam and microphone enabled
- Allow browser permissions for camera/microphone

### Test Flow

#### 1. Create a Test Appointment

```
Doctor Account:
├─ Sign up as doctor
├─ Complete doctor registration
├─ Verify account

Patient Account:
├─ Sign up as patient
├─ Complete patient registration
├─ Verify account

Create Appointment:
├─ Log in as doctor
├─ Create appointment with patient
└─ Copy appointment ID (you'll need it)
```

#### 2. Connect for Video Call

```
Doctor:
├─ Go to /appointments/[appointmentId]/video
├─ Browser asks for camera/mic permission → Allow
└─ Waiting for patient to connect

Patient:
├─ Go to /appointments/[appointmentId]/video
├─ Browser asks for camera/mic permission → Allow
└─ Video call connects automatically ✅

Both:
├─ Your video should appear on left
├─ Remote video should appear on right
├─ Audio/video controls should work
└─ Click "End Call" to disconnect
```

#### 3. Verify Features

- **Audio Control**: Buttons should mute/unmute your mic
- **Video Control**: Buttons should turn camera on/off
- **Remote Feed**: See other person's video in real-time
- **Connection Status**: Should show "Connected" in header
- **Call Duration**: Should continue until you click "End Call"

### Manual Testing Checklist

```
[ ] Signaling server starts without errors
[ ] Frontend loads without errors
[ ] Can create appointment
[ ] Doctor can join video call
[ ] Patient can join video call
[ ] Video feeds display
[ ] Audio/video controls work
[ ] ICE candidates exchange successfully
[ ] Connection state shows "connected"
[ ] Can unmute/mute audio
[ ] Can turn camera on/off
[ ] Can end call
[ ] Call history is recorded (optional)
```

---

## Troubleshooting

### Problem: Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**
```bash
# Windows - Find and kill process using port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
sudo lsof -ti:4000 | xargs kill -9

# Alternative: Use different port
PORT=5000 npm run dev
```

### Problem: WebRTC Connection Failed

```
Error: Failed to get UserMedia or WebRTC connection timeout
```

**Solutions:**
1. Check browser allows camera/microphone permissions
   - Click the padlock icon in address bar
   - Allow Camera and Microphone
   
2. Check STUN servers are reachable
   - STUN is used for NAT traversal
   - Our config uses Google's free STUN: `stun.l.google.com:19302`
   
3. Check firewall/network
   - Ensure UDP ports 10000-10100 are open
   - Some corporate firewalls block WebRTC

### Problem: Socket.io Connection Failed

```
Error: WebSocket connection failed
OR
ERR_NAME_NOT_RESOLVED
```

**Solutions:**
1. Verify signaling server is running
   ```bash
   curl http://localhost:4000/health
   # Should return: {"ok":true}
   ```

2. Check NEXT_PUBLIC_SIGNALING_SERVER is correct in `.env.local`
   ```
   NEXT_PUBLIC_SIGNALING_SERVER=http://localhost:4000
   ```

3. Check firewall allows port 4000

### Problem: Database Connection Failed

```
Error: ECONNREFUSED 127.0.0.1:3306
OR Database connection error
```

**Solutions:**
1. Verify MySQL is running
   ```bash
   # Windows
   mysql -u root -p
   
   # macOS
   mysql.server status
   ```

2. Check DATABASE_URL is correct in `.env.local`
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/medisphere
   ```

3. Run Prisma migrations
   ```bash
   npx prisma migrate dev
   ```

### Problem: Permission Denied on Linux/macOS

```
Error: permission denied
```

**Solution:**
```bash
chmod +x start-dev.sh
chmod +x setup-dev.sh
```

### Problem: npm install Fails

```
Error: npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Force legacy dependency resolution
npm install --legacy-peer-deps
```

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Browser)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Medisphere Frontend (Next.js 15, React 19)          │   │
│  │  ├─ VideoCall Component                              │   │
│  │  ├─ useWebRTCCall hook (WebRTC peer connection)      │   │
│  │  └─ useSocketClient hook (Socket.io connection)      │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│        WebSocket      │          WebRTC UDP/TCP              │
│        (signaling)    │          (media)                      │
└───────────┬───────────┴──────────────────────────────────────┘
            │
┌───────────┼─────────────────────────────────────────────────┐
│           │        SIGNALING SERVER (Port 4000)              │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │  Node.js + Express + Socket.io                       │   │
│  │  ├─ /health endpoint                                 │   │
│  │  ├─ join-meeting event handler                       │   │
│  │  ├─ webrtc:offer event handler                       │   │
│  │  ├─ webrtc:answer event handler                      │   │
│  │  ├─ webrtc:ice-candidate event handler               │   │
│  │  └─ leave-meeting event handler                      │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │
            │ (REST API calls)
            │
┌───────────│─────────────────────────────────────────────────┐
│           │      APPLICATION SERVER (Port 3000)              │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │  Next.js API Routes (/api/*)                        │   │
│  │  ├─ /api/auth/* (NextAuth.js)                       │   │
│  │  ├─ /api/appointments/*                             │   │
│  │  └─ ... other routes                                │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │
            │ (SQL queries)
            │
┌───────────│─────────────────────────────────────────────────┐
│           │    DATABASE LAYER (MySQL)                        │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │  MySQL Database (via Prisma ORM)                    │   │
│  │  ├─ Users, Doctors, Patients                        │   │
│  │  ├─ Appointments                                     │   │
│  │  ├─ Chat Messages (optional)                        │   │
│  │  └─ Call History (optional)                         │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow for 1:1 Video Call

```
1. Doctor visits /appointments/[appointmentId]/video
   └─ Frontend loads VideoCall component

2. VideoCall component initializes WebRTC
   ├─ Gets camera/microphone (localStream)
   └─ Creates RTCPeerConnection

3. Frontend sends "join-meeting" via Socket.io
   └─ Signaling server stores room state

4. Patient visits same /appointments/[appointmentId]/video
   └─ Signaling server notifies doctor "participant-joined"

5. Frontend creates offer (doctor is initiator)
   ├─ Creates RTCSessionDescription (SDP)
   └─ Sends via Socket.io to patient

6. Patient receives offer
   ├─ Creates answer (RTCSessionDescription)
   └─ Sends via Socket.io to doctor

7. ICE Candidate Exchange
   ├─ Both browsers gather ICE candidates
   ├─ Send via Socket.io to other party
   └─ Establish direct peer connection (UDP)

8. WebRTC Connection Established
   ├─ Audio/video streams flowing
   ├─ Connection state = "connected"
   └─ Users can see and hear each other

9. Call ends when either party clicks "End Call"
   ├─ Frontend sends "leave-meeting" via Socket.io
   ├─ Close WebRTC connection
   └─ Clear resources (stop camera, close connection)
```

---

## Features Overview

### ✨ Implemented Features

#### 1. **Video & Audio Calling**
- ✅ Camera capture (HD quality: 1280x720)
- ✅ Microphone capture
- ✅ Real-time video/audio streaming
- ✅ Automatic gain control
- ✅ Echo cancellation
- ✅ Noise suppression

#### 2. **Call Controls**
- ✅ Mute/Unmute (audio)
- ✅ Camera on/off (video)
- ✅ End call button
- ✅ Visual indicators for mute/video states

#### 3. **Connection Management**
- ✅ Automatic connection establishment
- ✅ Connection state monitoring
- ✅ STUN servers for NAT traversal
- ✅ ICE candidate gathering
- ✅ Peer-to-peer (P2P) connection

#### 4. **User Experience**
- ✅ Professional UI with dark theme
- ✅ Local and remote video display
- ✅ Connection status indicator
- ✅ Loading spinner while connecting
- ✅ Call duration tracking
- ✅ Responsive design (mobile-friendly)

#### 5. **Security**
- ✅ DTLS encryption (WebRTC native)
- ✅ TLS for signaling (HTTPS)
- ✅ Authentication via NextAuth.js
- ✅ Role-based access control (doctor/patient)
- ✅ JWT token verification

#### 6. **Reliability**
- ✅ Automatic reconnection
- ✅ Connection state monitoring
- ✅ Error handling
- ✅ Graceful degradation

### 🚀 Future Features (Not Yet Implemented)

- [ ] Screen sharing
- [ ] Recording
- [ ] Chat during call
- [ ] Prescription creation during call
- [ ] Medical report attachment
- [ ] Call history
- [ ] Group calls (requires SFU upgrade)
- [ ] Virtual backgrounds
- [ ] Live captions (Speech-to-Text)
- [ ] Call quality metrics
- [ ] Call logs for compliance

---

## Common Tasks

### How to Create a Test Appointment

```bash
# Option 1: Use the web interface
1. Sign up as Doctor
2. Complete doctor profile
3. Sign up as Patient
4. Log in as Doctor
5. Go to Create Appointment
6. Select patient and time
7. Confirm

# Option 2: Use Prisma Studio (interactive database editor)
npx prisma studio
```

### How to View Logs

```bash
# Signaling server logs (see connection status)
# Terminal 1 - already visible while server running

# Frontend logs
# Open browser DevTools: F12 or Right-click → Inspect
# Go to Console tab
# Search for "[Socket.io]" or "[WebRTC]" logs

# Database logs (if using docker)
docker logs medisphere-mysql
```

### How to Reset the Database

```bash
cd medisphere-app

# WARNING: This deletes all data!
npx prisma migrate reset

# Or manually
npx prisma db push --skip-generate

# Or reset in MySQL directly
mysql -u medisphere_user -p medisphere
DROP DATABASE medisphere;
CREATE DATABASE medisphere;
EXIT;

# Then run migrations
npx prisma migrate dev
```

---

## Production Deployment

### Important: Before Going Live

1. **Change all secrets**
   ```bash
   openssl rand -base64 32  # Generate new NEXTAUTH_SECRET
   ```

2. **Use HTTPS**
   - Use a reverse proxy (Nginx, Caddy)
   - Install SSL certificate (Let's Encrypt)
   - Update NEXT_PUBLIC_SIGNALING_SERVER to use wss:// (secure WebSocket)

3. **Use production database**
   - Use managed MySQL (AWS RDS, PlanetScale, DigitalOcean)
   - Enable backups
   - Enable monitoring

4. **Set environment to production**
   ```env
   NODE_ENV=production
   NEXTAUTH_URL=https://yourdomain.com
   ```

5. **Monitor**
   - Set up error tracking (Sentry)
   - Set up performance monitoring
   - Monitor database connections
   - Monitor signaling server load

### Deployment Platforms

- **Frontend**: Vercel, Netlify, AWS Amplify
- **Signaling Server**: Railway, Render, Heroku, DigitalOcean, AWS
- **Database**: PlanetScale, AWS RDS, DigitalOcean Managed

---

## Getting Help

### Resources

- [WebRTC Documentation](https://webrtc.org/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

### Common Issues

1. **WebRTC not connecting**: Check STUN server access, firewall rules
2. **Socket.io errors**: Verify signaling server is running, check ports
3. **Database errors**: Verify MySQL is running, connection string is correct
4. **Permission errors**: Check browser allows camera/microphone

---

## Version Information

- **Node.js**: >= 18.x
- **Next.js**: 15.5.3
- **React**: 19.1.1
- **Express**: 5.1.0
- **Socket.io**: 4.8.1
- **Prisma**: 6.16.2
- **PostgreSQL/MySQL**: <= 8.0

---

## License

Medisphere is an open-source project. See LICENSE file for details.

---

**Last Updated**: March 31, 2026
**Maintained By**: Medisphere Team

For questions or issues, please open a GitHub issue or contact the development team.
