# Medisphere - Comprehensive Project Report

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution Approach](#solution-approach)
4. [Technology Stack](#technology-stack)
5. [System Architecture](#system-architecture)
6. [Database Design](#database-design)
7. [Core Features & Modules](#core-features--modules)
8. [AI/ML Algorithms & Concepts](#aiml-algorithms--concepts)
9. [Security Implementation](#security-implementation)
10. [Flow Diagrams](#flow-diagrams)
11. [API Endpoints](#api-endpoints)
12. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

**Medisphere** is a comprehensive telemedicine web application that bridges the gap between patients and healthcare providers through digital technology. It provides a complete healthcare ecosystem featuring video consultations, AI-powered health assistance, appointment management, medical report handling, and real-time communication.

### Key Highlights:
- **Multi-language Support**: English, Hindi, Kannada, Tamil, Gujarati, Marathi
- **Role-based Access**: Admin, Doctor, Patient
- **Real-time Communication**: WebRTC video calls + Socket.io chat
- **AI Integration**: Google Gemini for health assistance
- **Modern UI**: Responsive design with TailwindCSS

---

## 🚨 Problem Statement

### Healthcare Challenges Addressed:

1. **Accessibility**: Rural and remote areas lack access to quality healthcare specialists
2. **Time Constraints**: Long waiting times at hospitals for routine consultations
3. **Cost Barriers**: High costs of travel and consultation fees
4. **Record Management**: Difficulty in maintaining and sharing medical records
5. **Language Barriers**: Healthcare information not available in regional languages
6. **Emergency Response**: Delayed medical guidance during emergencies
7. **Doctor-Patient Communication**: Limited channels for follow-up consultations

---

## 💡 Solution Approach

Medisphere addresses these challenges through:

| Challenge | Solution |
|-----------|----------|
| Accessibility | Video consultations from anywhere |
| Time Constraints | Online appointment booking with instant confirmation |
| Cost Barriers | Reduced consultation fees, no travel costs |
| Record Management | Centralized encrypted medical report storage |
| Language Barriers | Multi-language AI assistant (6 Indian languages) |
| Emergency Response | AI health assistant for immediate guidance |
| Communication | Real-time chat during and after consultations |

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.3 | React framework with App Router, SSR, API routes |
| **React** | 19.1.1 | UI library with hooks and functional components |
| **TypeScript** | 5.9.2 | Type-safe JavaScript development |
| **TailwindCSS** | 4.1.13 | Utility-first CSS framework |
| **Framer Motion** | 12.23.16 | Animation library for UI interactions |
| **Radix UI** | Various | Accessible UI component primitives |
| **Lucide React** | 0.544.0 | Icon library |
| **React Markdown** | 10.1.0 | Markdown rendering with GFM support |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.5.3 | RESTful API endpoints |
| **Prisma ORM** | 6.16.2 | Database ORM with type safety |
| **MySQL** | - | Relational database |
| **NextAuth.js** | 4.24.11 | Authentication (Credentials + OAuth) |
| **Socket.io** | 4.8.1 | Real-time bidirectional communication |

### AI & Machine Learning

| Technology | Purpose |
|------------|---------|
| **Google Gemini AI** (gemini-2.5-pro) | Conversational AI, medical assistance |
| **LangChain** | AI orchestration, prompt engineering |
| **Pinecone** | Vector database for semantic search |
| **Google Cloud Speech-to-Text** | Voice transcription |
| **Google Cloud Text-to-Speech** | Voice synthesis |
| **Google Generative AI Embeddings** | Document embeddings for RAG |

### Real-time Communication

| Technology | Purpose |
|------------|---------|
| **WebRTC** | Peer-to-peer video/audio calls |
| **Socket.io** | Signaling, chat messages, presence |
| **STUN Server** | NAT traversal for WebRTC |

### Security & Utilities

| Technology | Purpose |
|------------|---------|
| **bcryptjs** | Password hashing |
| **jsonwebtoken / jose** | JWT token handling |
| **AES-256-GCM** | File encryption |
| **Zod** | Schema validation |
| **Helmet** | HTTP security headers |

### Signaling Server (Separate Service)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 5.1.0 | HTTP server |
| **Socket.io** | 4.8.1 | WebSocket server |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.1 | HTTP request logging |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │   Web Browser    │  │   Mobile Browser │  │   Progressive Web App     │   │
│  │   (React/Next)   │  │   (Responsive)   │  │   (Future Enhancement)    │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬─────────────┘   │
└───────────┴─────────────────────┴──────────────────────────┴────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     NEXT.JS APPLICATION (Port 3000)                  │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │    │
│  │  │  Server-Side  │  │  Client-Side  │  │      API Routes       │   │    │
│  │  │   Rendering   │  │  Components   │  │   (RESTful APIs)      │   │    │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘   │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │    │
│  │  │  Middleware   │  │  Auth (JWT)   │  │    Role Guards        │   │    │
│  │  │  (Route Prot) │  │  NextAuth.js  │  │    (RBAC)             │   │    │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              SIGNALING SERVER (Port 4000)                           │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │    │
│  │  │   Socket.io   │  │  Room Manager │  │   WebRTC Signaling    │   │    │
│  │  │   Server      │  │               │  │   (Offer/Answer/ICE)  │   │    │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Google Gemini │  │Google Cloud  │  │   Pinecone   │  │   SendGrid   │     │
│  │   AI API     │  │Speech/TTS API│  │   Vector DB  │  │   Email API  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                                         │
│  │Google OAuth  │  │  STUN/TURN   │                                         │
│  │  Provider    │  │   Servers    │                                         │
│  └──────────────┘  └──────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                        MySQL Database                               │     │
│  │  ┌────────┐ ┌────────┐ ┌───────────┐ ┌────────┐ ┌───────────────┐ │     │
│  │  │ Users  │ │Doctors │ │ Patients  │ │Appoint-│ │    Reports    │ │     │
│  │  │        │ │        │ │           │ │ ments  │ │  (Encrypted)  │ │     │
│  │  └────────┘ └────────┘ └───────────┘ └────────┘ └───────────────┘ │     │
│  │  ┌────────┐ ┌────────┐ ┌───────────┐ ┌────────┐ ┌───────────────┐ │     │
│  │  │Reviews │ │Prescrip│ │Medications│ │AIChats │ │  ChatMessages │ │     │
│  │  │        │ │ -tions │ │           │ │        │ │               │ │     │
│  │  └────────┘ └────────┘ └───────────┘ └────────┘ └───────────────┘ │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/                      # Next.js 15 App Router
│   ├── api/                  # API Routes (Backend)
│   │   ├── ai/               # AI endpoints (chat, TTS, STT, image analysis)
│   │   ├── appointments/     # CRUD appointments
│   │   ├── auth/             # NextAuth configuration
│   │   ├── doctors/          # Doctor management
│   │   ├── reports/          # Medical report handling
│   │   └── ...
│   ├── admin/                # Admin dashboard pages
│   ├── doctor/               # Doctor portal pages
│   ├── patient/              # Patient portal pages
│   └── ...
├── components/               # Reusable UI Components
│   ├── ai/                   # AI-related components
│   ├── video/                # Video conferencing components
│   ├── chat/                 # Real-time chat components
│   └── ...
├── hooks/                    # Custom React hooks
│   ├── use-webrtc.ts         # WebRTC functionality
│   ├── use-multi-peer.ts     # Multi-participant calls
│   ├── use-socket-client.ts  # Socket.io client
│   └── use-speech-recognition.ts
├── lib/                      # Utility libraries
│   ├── ai.ts                 # AI helper functions
│   ├── auth.ts               # Authentication helpers
│   ├── encryption.ts         # AES-256 encryption
│   ├── prisma.ts             # Database client
│   └── validation.ts         # Zod schemas
└── types/                    # TypeScript definitions
```

---

## 💾 Database Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │    Doctor    │       │   Patient    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ userId (FK)  │       │ userId (FK)  │────►│
│ email        │       │ licenseNumber│       │ dateOfBirth  │
│ name         │       │specialization│       │ gender       │
│ password     │       │ experience   │       │ phoneNumber  │
│ role (ENUM)  │       │ qualification│       │ medicalHistory│
│ image        │       │consultationFee│      │ allergies    │
│ createdAt    │       │ status (ENUM)│       │              │
└──────────────┘       │ rating       │       └──────┬───────┘
                       │ totalRatings │              │
                       └──────┬───────┘              │
                              │                      │
                              ▼                      ▼
                       ┌──────────────────────────────┐
                       │        Appointment           │
                       ├──────────────────────────────┤
                       │ id (PK)                      │
                       │ doctorId (FK)                │
                       │ patientId (FK)               │
                       │ scheduledAt                  │
                       │ duration                     │
                       │ status (ENUM)                │
                       │ meetingLink                  │
                       │ notes                        │
                       └──────────┬───────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   Prescription   │   │   ChatMessage    │   │   CallSession    │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │   │ id (PK)          │
│ appointmentId(FK)│   │ appointmentId(FK)│   │ appointmentId(FK)│
│ doctorId (FK)    │   │ senderId         │   │ callerId         │
│ medications(JSON)│   │ senderType(ENUM) │   │ calleeId         │
│ instructions     │   │ message          │   │ status           │
└──────────────────┘   │ messageType      │   │ startedAt        │
                       │ timestamp        │   │ endedAt          │
                       └──────────────────┘   └──────────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│     Report       │   │     Review       │   │   Medication     │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │   │ id (PK)          │
│ patientId (FK)   │   │ doctorId (FK)    │   │ patientId (FK)   │
│ fileName         │   │ patientId (FK)   │   │ name             │
│ fileType         │   │ rating           │   │ dosage           │
│ fileSize         │   │ comment          │   │ frequency        │
│ fileData (BLOB)  │   │ createdAt        │   │ reminders (JSON) │
│ aiAnalysis       │   └──────────────────┘   └──────────────────┘
└──────────────────┘

┌──────────────────┐   ┌──────────────────┐
│     AIChat       │   │   AuditLog       │
├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │
│ patientId (FK)   │   │ userId           │
│ messages (JSON)  │   │ action           │
│ language         │   │ resource         │
│ createdAt        │   │ details          │
└──────────────────┘   │ ipAddress        │
                       └──────────────────┘
```

### Enums Used

```
UserRole: ADMIN | DOCTOR | PATIENT
AppointmentStatus: PENDING | CONFIRMED | COMPLETED | CANCELLED | RESCHEDULED
DoctorStatus: PENDING | APPROVED | REJECTED
SenderType: DOCTOR | PATIENT
```

---

## 🎯 Core Features & Modules

### 1. Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌───────────┐    ┌───────────────────────┐ │
│  │  User    │───►│  NextAuth │───►│  JWT Token Generated  │ │
│  │  Login   │    │  Handler  │    │  (id, role, email)    │ │
│  └──────────┘    └───────────┘    └───────────┬───────────┘ │
│       │                                        │            │
│       ▼                                        ▼            │
│  ┌──────────────────────┐    ┌─────────────────────────────┐│
│  │ Credentials Provider │    │     Middleware Check        ││
│  │ (Email + Password)   │    │  /admin/* → ADMIN only      ││
│  └──────────────────────┘    │  /doctor/* → DOCTOR only    ││
│  ┌──────────────────────┐    │  /patient/* → PATIENT only  ││
│  │ Google OAuth Provider│    └─────────────────────────────┘│
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Email/Password authentication with bcrypt hashing
- Google OAuth 2.0 integration
- JWT-based session management
- Role-based route protection via middleware
- Automatic role assignment on signup

### 2. Video Consultation System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     WEBRTC VIDEO CALL ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    Patient's Browser                          Doctor's Browser           │
│  ┌─────────────────────┐                  ┌─────────────────────┐       │
│  │  getUserMedia()     │                  │  getUserMedia()     │       │
│  │  ┌───────────────┐  │                  │  ┌───────────────┐  │       │
│  │  │ Local Stream  │  │                  │  │ Local Stream  │  │       │
│  │  │ (Video+Audio) │  │                  │  │ (Video+Audio) │  │       │
│  │  └───────┬───────┘  │                  │  └───────┬───────┘  │       │
│  │          │          │                  │          │          │       │
│  │  ┌───────▼───────┐  │                  │  ┌───────▼───────┐  │       │
│  │  │RTCPeerConnect-│  │◄────────────────►│  │RTCPeerConnect-│  │       │
│  │  │    ion        │  │   Direct P2P     │  │    ion        │  │       │
│  │  └───────────────┘  │                  │  └───────────────┘  │       │
│  └──────────┬──────────┘                  └──────────┬──────────┘       │
│             │                                        │                  │
│             └────────────────┬───────────────────────┘                  │
│                              │                                          │
│                              ▼                                          │
│                   ┌─────────────────────┐                               │
│                   │  Signaling Server   │                               │
│                   │   (Socket.io)       │                               │
│                   │  ┌───────────────┐  │                               │
│                   │  │ offer/answer  │  │                               │
│                   │  │ ICE candidates│  │                               │
│                   │  │ Room mgmt     │  │                               │
│                   │  └───────────────┘  │                               │
│                   └─────────────────────┘                               │
│                              │                                          │
│                              ▼                                          │
│                   ┌─────────────────────┐                               │
│                   │   STUN Server       │                               │
│                   │ stun.l.google.com   │                               │
│                   └─────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Perfect Negotiation Pattern for WebRTC
- Multi-participant video rooms
- Screen sharing capability
- Audio/Video mute controls
- Real-time participant status updates
- In-call text chat
- Connection diagnostics

### 3. AI Health Assistant

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI CHAT ARCHITECTURE (RAG)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User Query: "What does my blood report say about cholesterol?"          │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    DOCUMENT PROCESSING                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │ PDF Parser  │  │DOCX Parser  │  │   Text Extractor        │   │  │
│  │  │ (pdf-parse) │  │ (mammoth)   │  │                         │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘   │  │
│  │         └────────────────┼─────────────────────┘                 │  │
│  │                          ▼                                       │  │
│  │            ┌─────────────────────────┐                           │  │
│  │            │  Extracted Text Context │                           │  │
│  │            └───────────┬─────────────┘                           │  │
│  └────────────────────────┼──────────────────────────────────────────┘  │
│                           ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                 VECTOR SEARCH (PINECONE)                          │  │
│  │  ┌─────────────────────────┐    ┌────────────────────────────┐   │  │
│  │  │ Google Embeddings API   │───►│   Similarity Search        │   │  │
│  │  │ (embedding-001 model)   │    │   (Top 3 matches)          │   │  │
│  │  └─────────────────────────┘    └────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                           │                                              │
│                           ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    GEMINI AI GENERATION                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │                    PROMPT TEMPLATE                          │ │  │
│  │  │  "You are a helpful medical assistant.                      │ │  │
│  │  │   Always suggest consulting a real doctor.                  │ │  │
│  │  │   Answer in {language}.                                     │ │  │
│  │  │   Context: {retrieved_documents}                            │ │  │
│  │  │   User: {question}"                                         │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                              │                                    │  │
│  │                              ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │            Google Gemini 2.5 Pro                            │ │  │
│  │  │            Temperature: 0.4                                 │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                           │                                              │
│                           ▼                                              │
│              AI Response with Disclaimer                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**AI Features:**
- **Conversational AI**: Multi-turn chat with context
- **Document Analysis**: PDF, DOCX, TXT parsing
- **Medical Image Analysis**: X-rays, scans, report photos
- **Voice Assistant**: Speech-to-Text and Text-to-Speech
- **Multi-language Support**: 6 Indian languages

### 4. Appointment Management

```
┌──────────────────────────────────────────────────────────────┐
│                 APPOINTMENT LIFECYCLE                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Patient                        System                        │
│    │                              │                           │
│    │  1. Browse Doctors           │                           │
│    │─────────────────────────────►│                           │
│    │                              │                           │
│    │  2. Select Doctor + Time     │                           │
│    │─────────────────────────────►│                           │
│    │                              │                           │
│    │                    ┌─────────▼─────────┐                 │
│    │                    │  Create Appointment│                │
│    │                    │  Status: PENDING   │                │
│    │                    └─────────┬─────────┘                 │
│    │                              │                           │
│    │  3. Confirmation             │                           │
│    │◄─────────────────────────────│                           │
│    │                              │                           │
│    │         ┌────────────────────┼───────────────────┐       │
│    │         │                    │                   │       │
│    │         ▼                    ▼                   ▼       │
│    │   ┌──────────┐        ┌──────────┐        ┌──────────┐  │
│    │   │CONFIRMED │        │CANCELLED │        │RESCHEDULED│  │
│    │   └────┬─────┘        └──────────┘        └──────────┘  │
│    │        │                                                 │
│    │        ▼                                                 │
│    │   ┌──────────────────────────────────┐                  │
│    │   │  Video Consultation Starts       │                  │
│    │   │  • Meeting Room Created          │                  │
│    │   │  • WebRTC Connection Established │                  │
│    │   │  • Chat Enabled                  │                  │
│    │   └────────────────┬─────────────────┘                  │
│    │                    │                                     │
│    │                    ▼                                     │
│    │   ┌──────────────────────────────────┐                  │
│    │   │           COMPLETED              │                  │
│    │   │  • Prescription Generated        │                  │
│    │   │  • Review Can Be Submitted       │                  │
│    │   └──────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### 5. Medical Reports Management

```
┌──────────────────────────────────────────────────────────────┐
│                    REPORT UPLOAD FLOW                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐                                                  │
│  │ Patient │                                                  │
│  │ Upload  │                                                  │
│  └────┬────┘                                                  │
│       │                                                       │
│       ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  VALIDATION LAYER                        │ │
│  │  • File Type Check (PDF, PNG, JPEG, WEBP)               │ │
│  │  • Size Limit (Max 10MB)                                │ │
│  │  • Malware Scan (Future)                                │ │
│  └─────────────────────────┬───────────────────────────────┘ │
│                            │                                  │
│                            ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  STORAGE LAYER                           │ │
│  │  • Binary Data → MySQL LONGBLOB                         │ │
│  │  • Metadata (fileName, fileType, fileSize)              │ │
│  │  • Linked to Patient Record                             │ │
│  └─────────────────────────┬───────────────────────────────┘ │
│                            │                                  │
│                            ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              AI ANALYSIS (Optional)                      │ │
│  │  • Image → Gemini Vision API                            │ │
│  │  • PDF → Text Extraction + AI Summary                   │ │
│  │  • Analysis stored in aiAnalysis field                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI/ML Algorithms & Concepts

### 1. Retrieval-Augmented Generation (RAG)

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG PIPELINE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INPUT: User Question                                        │
│            │                                                 │
│            ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           EMBEDDING GENERATION                        │   │
│  │   Google Generative AI Embeddings (embedding-001)     │   │
│  │   Query → 768-dimensional vector                      │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              VECTOR SIMILARITY SEARCH                 │   │
│  │   Pinecone Database                                   │   │
│  │   Algorithm: Approximate Nearest Neighbors (ANN)      │   │
│  │   Distance Metric: Cosine Similarity                  │   │
│  │   Top-K Results: 3 most similar documents             │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CONTEXT AUGMENTATION                     │   │
│  │   Retrieved documents appended to prompt              │   │
│  │   Creates grounded context for LLM                    │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  LLM GENERATION                       │   │
│  │   Model: Gemini 2.5 Pro                               │   │
│  │   Temperature: 0.4 (balanced creativity/accuracy)     │   │
│  │   Output: Contextually relevant response              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  OUTPUT: AI Response with Citations                          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Perfect Negotiation Pattern (WebRTC)

The application implements the **Perfect Negotiation** pattern for WebRTC, which handles:
- **Glare Resolution**: When both peers send offers simultaneously
- **Polite/Impolite Roles**: Determines which peer backs off during conflicts
- **Stable State Management**: Ensures connection stability

### 3. Document Processing Algorithms

| Format | Library | Algorithm |
|--------|---------|-----------|
| PDF | pdf-parse + pdfjs-dist | Stream-based text extraction with fallback |
| DOCX | mammoth | XML parsing with style preservation |
| Images | Gemini Vision | Multi-modal transformer analysis |

### 4. Voice Processing

```
┌───────────────────────────────────────────────────────────┐
│                VOICE ASSISTANT PIPELINE                    │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐     ┌───────────────┐     ┌──────────────┐  │
│  │  Audio   │────►│  Google Cloud │────►│  Transcript  │  │
│  │ Recording│     │    STT API    │     │   (Text)     │  │
│  │ (WebM)   │     │  (WEBM_OPUS)  │     │              │  │
│  └──────────┘     └───────────────┘     └──────┬───────┘  │
│                                                 │          │
│                                                 ▼          │
│                                         ┌──────────────┐  │
│                                         │   AI Chat    │  │
│                                         │  Processing  │  │
│                                         └──────┬───────┘  │
│                                                 │          │
│  ┌──────────┐     ┌───────────────┐             │          │
│  │  Audio   │◄────│  Google Cloud │◄────────────┘          │
│  │ Playback │     │    TTS API    │                        │
│  │  (MP3)   │     │  (Wavenet-D)  │                        │
│  └──────────┘     └───────────────┘                        │
└───────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Implementation

### 1. Authentication Security

| Layer | Implementation |
|-------|----------------|
| Password Storage | bcrypt with salt rounds |
| Session Management | JWT with NEXTAUTH_SECRET |
| OAuth | Google OAuth 2.0 with PKCE |
| Token Verification | jose library for JWT validation |

### 2. Data Encryption

```typescript
// AES-256-GCM Encryption (lib/encryption.ts)
Algorithm: aes-256-gcm
Key Size: 256 bits (32 bytes)
IV Size: 96 bits (12 bytes)
Auth Tag: 128 bits (16 bytes)
```

### 3. Route Protection

```
Middleware Protection:
├── /admin/*   → Requires ADMIN role
├── /doctor/*  → Requires DOCTOR role
└── /patient/* → Requires PATIENT role
```

### 4. API Security

- Input validation using Zod schemas
- Rate limiting (configurable)
- CORS configuration
- Helmet.js for HTTP headers
- File type/size validation

---

## 📊 Flow Diagrams

### User Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  USER REGISTRATION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────┐                                                  │
│  │  User  │                                                  │
│  └───┬────┘                                                  │
│      │                                                       │
│      │  1. Navigate to /auth/signup                          │
│      ▼                                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              SIGNUP OPTIONS                            │  │
│  │  ┌─────────────────┐    ┌─────────────────────────┐   │  │
│  │  │ Email/Password  │ OR │    Google OAuth         │   │  │
│  │  └────────┬────────┘    └───────────┬─────────────┘   │  │
│  └───────────┼─────────────────────────┼─────────────────┘  │
│              │                         │                     │
│              ▼                         ▼                     │
│  ┌─────────────────────┐    ┌─────────────────────────┐     │
│  │ Zod Validation      │    │ Google OAuth Flow       │     │
│  │ • Email format      │    │ • Redirect to Google    │     │
│  │ • Password min 6    │    │ • Get user info         │     │
│  └──────────┬──────────┘    └───────────┬─────────────┘     │
│             │                           │                    │
│             └──────────┬────────────────┘                    │
│                        ▼                                     │
│          ┌─────────────────────────────────┐                │
│          │      CREATE USER IN DATABASE    │                │
│          │   • Hash password (bcrypt)      │                │
│          │   • Assign default role PATIENT │                │
│          │   • Generate JWT token          │                │
│          └──────────────┬──────────────────┘                │
│                         │                                    │
│                         ▼                                    │
│          ┌─────────────────────────────────┐                │
│          │   Redirect to Patient Dashboard │                │
│          └─────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Doctor Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 DOCTOR APPLICATION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Existing Patient User                                       │
│         │                                                    │
│         │  Navigate to /doctors/apply                        │
│         ▼                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           DOCTOR APPLICATION FORM                      │  │
│  │  • License Number                                      │  │
│  │  • Specialization                                      │  │
│  │  • Experience (years)                                  │  │
│  │  • Qualification                                       │  │
│  │  • Hospital Name/Address                               │  │
│  │  • Consultation Fee                                    │  │
│  │  • Available Schedule (JSON)                           │  │
│  │  • Languages (JSON)                                    │  │
│  │  • Bio                                                 │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│           ┌──────────────────────────────────┐              │
│           │  Doctor Record Created           │              │
│           │  Status: PENDING                 │              │
│           └────────────────┬─────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    ADMIN REVIEW                          ││
│  │                                                          ││
│  │  ┌──────────┐     ┌──────────┐     ┌──────────────────┐ ││
│  │  │ APPROVED │     │ REJECTED │     │    PENDING       │ ││
│  │  │          │     │          │     │  (Awaiting)      │ ││
│  │  └────┬─────┘     └──────────┘     └──────────────────┘ ││
│  │       │                                                  ││
│  └───────┼──────────────────────────────────────────────────┘│
│          │                                                   │
│          ▼                                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  User Role Updated: PATIENT → DOCTOR                   │  │
│  │  Doctor can now:                                       │  │
│  │  • Appear in doctor listings                           │  │
│  │  • Accept appointments                                 │  │
│  │  • Conduct video consultations                         │  │
│  │  • Write prescriptions                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Video Consultation Flow

```
┌─────────────────────────────────────────────────────────────┐
│               VIDEO CONSULTATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Patient                    Signaling Server           Doctor│
│     │                            │                        │  │
│     │  1. Join Meeting Room      │                        │  │
│     │───────────────────────────►│                        │  │
│     │                            │                        │  │
│     │                            │  2. Notify Doctor      │  │
│     │                            │───────────────────────►│  │
│     │                            │                        │  │
│     │                            │  3. Doctor Joins       │  │
│     │                            │◄───────────────────────│  │
│     │                            │                        │  │
│     │  4. Room-Joined Event      │                        │  │
│     │◄───────────────────────────│                        │  │
│     │                            │                        │  │
│     │  5. Create SDP Offer       │                        │  │
│     │───────────────────────────►│                        │  │
│     │                            │───────────────────────►│  │
│     │                            │                        │  │
│     │                            │  6. Create SDP Answer  │  │
│     │                            │◄───────────────────────│  │
│     │◄───────────────────────────│                        │  │
│     │                            │                        │  │
│     │  7. Exchange ICE Candidates │                       │  │
│     │◄──────────────────────────►│◄─────────────────────►│  │
│     │                            │                        │  │
│     │  ═══════════════════════════════════════════════   │  │
│     │         8. P2P VIDEO/AUDIO STREAM ESTABLISHED       │  │
│     │  ═══════════════════════════════════════════════   │  │
│     │                            │                        │  │
│     │  9. Real-time Chat Messages│                        │  │
│     │◄──────────────────────────►│◄─────────────────────►│  │
│     │                            │                        │  │
│     │  10. End Call              │                        │  │
│     │───────────────────────────►│───────────────────────►│  │
│     │                            │                        │  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/[...nextauth]` | NextAuth.js handler |
| GET | `/api/auth/session` | Get current session |

### Doctor APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/[id]` | Get doctor details |
| POST | `/api/doctors/apply` | Submit doctor application |

### Appointment APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List user's appointments |
| POST | `/api/appointments` | Create new appointment |
| GET | `/api/appointments/[id]` | Get appointment details |
| PATCH | `/api/appointments/[id]` | Update appointment status |

### AI APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | AI conversational chat |
| POST | `/api/ai/analyze-image` | Medical image analysis |
| POST | `/api/ai/process-document` | Document text extraction |
| POST | `/api/ai/stt` | Speech-to-Text conversion |
| POST | `/api/ai/tts` | Text-to-Speech synthesis |

### Report APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List patient reports |
| POST | `/api/reports/upload` | Upload new report |
| GET | `/api/reports/[id]` | Download report file |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/doctors` | Pending doctor approvals |
| PATCH | `/api/admin/doctors/[id]` | Approve/Reject doctor |
| GET | `/api/admin/users` | User management |

---

## 🚀 Future Enhancements

### 1. Technical Improvements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **TURN Server Integration** | Better WebRTC connectivity behind strict NATs/firewalls | High |
| **Progressive Web App (PWA)** | Offline support, push notifications, home screen install | High |
| **End-to-End Encryption** | Encrypt video streams and chat messages | High |
| **Load Balancing** | Multiple signaling server instances | Medium |
| **CDN Integration** | Faster static asset delivery | Medium |
| **Database Read Replicas** | Improved read performance | Medium |

### 2. Feature Additions

| Feature | Description | Priority |
|---------|-------------|----------|
| **Payment Gateway** | Razorpay/Stripe for consultation fees | High |
| **E-Prescriptions** | Digital prescriptions with QR codes | High |
| **Appointment Reminders** | Email/SMS notifications | High |
| **Doctor Calendar Sync** | Google Calendar integration | Medium |
| **Health Metrics Tracking** | Blood pressure, sugar levels monitoring | Medium |
| **Wearable Device Integration** | Sync data from fitness bands | Low |
| **AI Symptom Checker** | Pre-consultation symptom analysis | Medium |
| **Medicine Reminders** | Push notifications for medication | High |

### 3. AI/ML Enhancements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **Fine-tuned Medical Model** | Custom model trained on medical data | High |
| **Voice-based Navigation** | Control app with voice commands | Medium |
| **Prescription OCR** | Auto-extract medicine info from images | High |
| **Predictive Health Analytics** | Risk assessment based on history | Low |
| **Multi-modal RAG** | Better image + text understanding | Medium |

### 4. Compliance & Security

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **HIPAA Compliance** | US healthcare data standards | High |
| **GDPR Compliance** | European data protection | High |
| **Audit Logging** | Comprehensive activity tracking | High |
| **2FA Authentication** | TOTP/SMS second factor | High |
| **Data Backup** | Automated encrypted backups | High |

### 5. Scalability Improvements

```
Current Architecture → Scalable Architecture

┌────────────────┐          ┌─────────────────────────────────────┐
│   Monolithic   │          │         Microservices               │
│   Application  │   ───►   │  ┌───────┐ ┌───────┐ ┌───────────┐ │
│                │          │  │ Auth  │ │ Video │ │ AI Service│ │
└────────────────┘          │  │Service│ │Service│ │           │ │
                            │  └───────┘ └───────┘ └───────────┘ │
                            │  ┌───────┐ ┌───────┐ ┌───────────┐ │
                            │  │ Appt  │ │Report │ │   Chat    │ │
                            │  │Service│ │Service│ │  Service  │ │
                            │  └───────┘ └───────┘ └───────────┘ │
                            └─────────────────────────────────────┘
```

### 6. Mobile Application

| Platform | Technology | Features |
|----------|------------|----------|
| **React Native** | Cross-platform | Native video calls, push notifications |
| **Flutter** | Alternative | Better performance, custom UI |

---

## 📚 Conclusion

**Medisphere** is a comprehensive telemedicine platform that leverages modern web technologies and AI to provide accessible healthcare solutions. The application demonstrates:

1. **Full-Stack Expertise**: Next.js 15 with App Router, TypeScript, Prisma ORM
2. **Real-Time Communication**: WebRTC implementation with Socket.io signaling
3. **AI Integration**: RAG architecture with Gemini AI for intelligent health assistance
4. **Security Focus**: JWT authentication, file encryption, role-based access
5. **Scalable Architecture**: Modular design ready for microservices migration
6. **Multi-language Support**: Internationalization for Indian languages

The project serves as an excellent example of how modern technology can be applied to solve real-world healthcare accessibility challenges while maintaining security, performance, and user experience standards.

---

## 📁 Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | ~150+ |
| Lines of Code | ~15,000+ |
| Database Tables | 14 |
| API Endpoints | 25+ |
| UI Components | 50+ |
| Custom Hooks | 8 |
| Languages Supported | 6 |

---

*Report Generated: February 2026*
*Version: 0.1.0*
