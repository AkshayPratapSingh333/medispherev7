# Medisphere: Integrated Telemedicine Platform

> A comprehensive digital healthcare solution enabling seamless doctor-patient collaboration through real-time communication, AI-powered medical insights, and intelligent appointment management.

## 📚 Documentation Structure

This monorepo contains comprehensive documentation organized by service:

- **[Main README](./README.md)** - You are here (High-level overview)
- **[Frontend Service README](./medisphere-app/README.md)** - Next.js app, components, hooks
- **[Signaling Service README](./medisphere-signaling-server/README.md)** - Express + Socket.io, WebRTC signaling
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Deep dive into system design patterns
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed development environment setup
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Fast command reference

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Purpose](#purpose)
3. [Problem Statement & Objectives](#problem-statement--objectives)
4. [Proposed System & Methodology](#proposed-system--methodology)
5. [System Architecture (HLD & LLD)](#system-architecture-hld--lld)
6. [Tools & Technologies](#tools--technologies)
7. [Quick Start](#quick-start)
8. [Command Reference](#command-reference)
9. [Architecture Decisions](#architecture-decisions)

---

## Introduction

Medisphere is designed as a multi-role healthcare system for patients, doctors, and administrators. The platform combines:

- Clinical workflow support (appointments, reports, prescriptions, reviews)
- Real-time communication (chat + WebRTC calls via Socket.io signaling)
- AI-assisted interactions (chat, document/image understanding, speech support)
- Role-governed operations and secure data handling
- Multilingual user experience for broader accessibility

This repository contains two deployable services:

- `medisphere-app` (Next.js 15 app with UI + API routes)
- `medisphere-signaling-server` (Express + Socket.io signaling service)

## 2. Project Purpose

The project purpose is to digitize end-to-end outpatient consultation workflows while improving accessibility, reducing waiting/travel overhead, and making healthcare interactions more continuous and data-driven.

## 3. Problem Statement & Objectives

### Problem Statement

Traditional healthcare access suffers from fragmented patient experience: in-person dependency, poor continuity, delayed follow-up communication, and weak digital record handling. Existing solutions often lack integrated real-time consultation, AI support, and role-specific operational workflows in one system.

### Objectives

1. Provide role-aware digital healthcare journeys for patients, doctors, and admins.
2. Support remote consultation through secure real-time video and messaging.
3. Enable operational continuity through appointments, records, prescriptions, and follow-up communication.
4. Improve decision support and patient literacy with AI and curated health knowledge APIs.
5. Maintain secure, scalable architecture with strong data modeling and modular services.

---

### Problem Statement
The current healthcare ecosystem suffers from:
- **Fragmentation**: Doctors and patients use separate apps for calls, messages, records, payments
- **Accessibility**: Rural/remote patients face barriers to specialist consultations
- **Inefficiency**: Manual appointment scheduling, paper records, duplicate information entry
- **Data Loss**: No centralized patient history across consultations
- **Poor Decision Support**: Doctors lack quick access to drug/disease information

### Objectives
1. **Unified System**: Single platform for consultations, messaging, appointments, payments
2. **Accessibility**: Enable consultations from any location with internet
3. **Efficiency**: Automate scheduling, maintain centralized records
4. **Data Continuity**: Retain full consultation history with prescriptions
5. **Clinical Support**: Integrate real-time medical knowledge

---

## 4. Proposed System & Methodology

### System Architecture

The system is implemented as a modular, service-oriented web architecture:

- **Frontend Service**: Next.js 15 application provides UI and integrated API routes
- **Signaling Service**: Dedicated Express + Socket.io server for real-time events and WebRTC orchestration
- **Data Layer**: MySQL with Prisma ORM for type-safe database access
- **External Integrations**: AI (Gemini), Knowledge APIs (openFDA, MedlinePlus), Payments (Razorpay), Auth (OAuth)

### Engineering Methodology

1. **Domain Decomposition**: Split into auth, appointments, reports, chat, video, AI, admin modules
2. **Contract-First APIs**: Define API schemas before implementation
3. **Type Safety**: TypeScript across frontend + backend with Prisma auto-generated types
4. **Progressive Hardening**: Start MVP, then add security, validation, error handling
5. **Cross-Platform**: Windows and Unix scripts for reproducible local development

---

## 5. System Architecture (HLD & LLD)

### High-Level Design (HLD)

```mermaid
graph TB
    subgraph Clients["Client Layer"]
        Doctor["🩺 Doctor Portal"]
        Patient["👤 Patient Portal"]
        Admin["⚙️ Admin Portal"]
    end

    subgraph Frontend["Frontend Service<br/>(Next.js 15)"]
        Pages["Pages & Routes"]
        Components["React Components"]
        Hooks["Custom Hooks"]
        Store["Client State"]
    end

    subgraph RealTime["Real-Time Service<br/>(Express + Socket.io)"]
        Signaling["WebRTC Signaling"]
        ChatEvents["Chat Events"]
        RoomMgmt["Room Management"]
    end

    subgraph API["Backend API<br/>(Next.js Routes)"]
        Routes["API Routes"]
        Services["Business Logic"]
        Auth["Authentication"]
    end

    subgraph AI["AI/Knowledge Layer"]
        Gemini["Google Gemini"]
        Pinecone["Pinecone Vector DB"]
        LangChain["LangChain"]
        openFDA["openFDA API"]
        MedlinePlus["MedlinePlus API"]
    end

    subgraph Data["Data Layer"]
        MySQL["MySQL Database"]
        Prisma["Prisma ORM"]
    end

    subgraph External["External Services"]
        Razorpay["Razorpay<br/>(Payments)"]
        OAuth["OAuth Providers"]
        STUN["STUN/TURN<br/>(NAT)"]
    end

    Doctor --> Frontend
    Patient --> Frontend
    Admin --> Frontend

    Frontend -->|WebSocket| RealTime
    Frontend -->|HTTP/REST| API
    Frontend -->|Streaming| Gemini

    RealTime -->|Coordinates| STUN
    RealTime -->|Query| MySQL
    
    API --> Auth
    API --> Gemini
    API --> openFDA
    API --> MedlinePlus
    API --> Razorpay
    
    Auth --> MySQL
    Services --> MySQL
    Prisma -.->|Type Generation| Services
    Prisma --> MySQL

    OAuth -.->|Login Flow| Auth
```

### Service Landscape - All Components

```mermaid
graph TB
    User["Users<br/>(Doctor, Patient, Admin)"]
    
    subgraph Presentation["Presentation Tier"]
        NextApp["Next.js App Router<br/>(Pages, Components)"]
        UI["UI Libraries<br/>(TailwindCSS, Radix)"]
        Hooks["Custom Hooks<br/>(useSocket, useWebRTC)"]
    end
    
    subgraph API["API Tier"]
        APIRoutes["API Routes<br/>(auth, appointments, chat)"]
        AuthService["Auth Service<br/>(NextAuth, JWT)"]
        BizLogic["Business Logic<br/>(CRUD, validation)"]
    end
    
    subgraph RealTime["Real-Time Tier"]
        SocketServer["Socket.io Server<br/>(signaling, events)"]
        Handlers["Event Handlers<br/>(room mgmt, relay)"]
    end
    
    subgraph Data["Data Layer"]
        Prisma["Prisma ORM"]
        MySQL["MySQL Database"]
    end
    
    subgraph External["External Services"]
        Gemini["Gemini API"]
        OpenFDA["openFDA API"]
        Razorpay["Razorpay"]
    end
    
    User --> Presentation
    Presentation --> APIRoutes
    Presentation --> SocketServer
    
    APIRoutes --> AuthService
    APIRoutes --> BizLogic
    AuthService --> MySQL
    BizLogic --> Prisma
    Prisma --> MySQL
    
    SocketServer --> Handlers
    Handlers --> MySQL
    
    APIRoutes --> Gemini
    APIRoutes --> OpenFDA
    APIRoutes --> Razorpay
```

### Next.js Service - Low-Level Design

```mermaid
graph TD
    subgraph Pages["Pages Layer (App Router)"]
        HomePage["page.tsx<br/>(Home)"]
        DoctorPage["page.tsx<br/>(Doctor Portal)"]
        PatientPage["page.tsx<br/>(Patient Portal)"]
        Appointments["page.tsx<br/>(Appointments)"]
        Chat["page.tsx<br/>(Chat)"]
        Medicines["page.tsx<br/>(Medicines Search)"]
    end

    subgraph API["API Routes Layer"]
        AuthAPI["/api/auth<br/>(NextAuth)"]
        AppointmentAPI["/api/appointments<br/>(CRUD)"]
        ChatAPI["/api/chat<br/>(Message Events)"]
        MedicineAPI["/api/medicines/search<br/>(Aggregation)"]
        UserAPI["/api/users<br/>(Profile)"]
    end

    subgraph Components["Components Layer"]
        CommonComp["common/<br/>(Header, Footer, Nav)"]
        DoctorComp["doctors/<br/>(List, Profile)"]
        PatientComp["patients/<br/>(Dashboard)"]
        ApptComp["appointments/<br/>(BookingForm)"]
        ChatComp["chat/<br/>(ChatUI, MessageList)"]
        MedComp["medicines/<br/>(SearchUI, ResultCard)"]
    end

    subgraph Hooks["Hooks Layer"]
        SocketHook["use-socket.ts<br/>(Socket.io init)"]
        WebRTCHook["use-webrtc.ts<br/>(Peer connection)"]
        AsyncHook["use-async.ts<br/>(Fetch wrapper)"]
        StorageHook["use-local-storage.ts<br/>(Persistence)"]
    end

    subgraph Services["Services Layer"]
        AuthLib["lib/auth.ts<br/>(Session, Creds)"]
        SocketLib["lib/socket.ts<br/>(Socket config)"]
        ChatLib["lib/chat-unread.ts<br/>(Message count)"]
        ValidationLib["lib/validation.ts<br/>(Input schemas)"]
    end

    subgraph Data["Data Layer"]
        PrismaClient["Prisma Client<br/>(ORM instance)"]
        MySQLDB["MySQL Database<br/>(Persistent)"]
        EnvConfig["Environment Config<br/>(.env.local)"]
    end

    HomePage --> CommonComp
    DoctorPage --> DoctorComp
    PatientPage --> PatientComp
    AppointmentAPI --> Services
    ChatAPI --> SocketHook
    MedicineAPI --> Services

    DoctorComp --> Hooks
    ChatComp --> SocketHook
    ApptComp --> AsyncHook
    MedComp --> AsyncHook

    AuthAPI --> AuthLib
    ChatAPI --> ChatLib
    MedicineAPI --> ValidationLib

    SocketLib --> EnvConfig
    AuthLib --> PrismaClient
    PrismaClient --> MySQLDB
```

### Signaling Service - Low-Level Design

```mermaid
graph TD
    subgraph Entry["Entry Point"]
        ServerJS["server.js<br/>(Express + Socket.io)"]
    end

    subgraph Routes["Route Handlers"]
        AuthMW["verifyToken<br/>(Middleware)"]
        RoomRoutes["Room Routes<br/>(/join, /leave)"]
        ChatRoutes["Chat Routes<br/>(/message, /typing)"]
    end

    subgraph Controllers["Controllers"]
        RoomCtrl["roomController.js<br/>(Join, Leave, List)"]
        ChatCtrl["chatController.js<br/>(Message Events)"]
    end

    subgraph Handlers["WebRTC Handlers"]
        SignalHandler["webrtc-handler.js<br/>(Offer, Answer, ICE)"]
    end

    subgraph Services["Services"]
        SocketService["socketService.js<br/>(Room State, Users)"]
    end

    subgraph Utils["Utilities"]
        Logger["logger.js<br/>(Logging)"]
        JWTVerify["JWT Verify<br/>(Token Validation)"]
    end

    subgraph State["State Management"]
        RoomState["In-Memory Rooms<br/>(Map<roomId, users>)"]
        UserMap["User Mapping<br/>(userId -> socketId)"]
    end

    subgraph Events["Socket.io Events"]
        ConnectionEv["connection<br/>(New client)"]
        OfferEv["offer<br/>(SDP)"]
        AnswerEv["answer<br/>(SDP)"]
        ICEEv["icecandidate<br/>(Candidate)"]
        MessageEv["message<br/>(Chat)"]
        DisconnectEv["disconnect<br/>(Cleanup)"]
    end

    ServerJS --> Routes
    Routes --> AuthMW
    AuthMW --> Controllers

    RoomCtrl --> SocketService
    ChatCtrl --> SocketService
    SignalHandler --> SocketService

    SocketService --> RoomState
    SocketService --> UserMap

    ConnectionEv --> Controllers
    OfferEv --> SignalHandler
    AnswerEv --> SignalHandler
    ICEEv --> SignalHandler
    MessageEv --> ChatCtrl
    DisconnectEv --> SocketService

    JWTVerify --> AuthMW
    Logger --> ServerJS
```

### Doctor-Patient Call Sequence Diagram

```mermaid
sequenceDiagram
    participant Patient as 👤 Patient<br/>Browser
    participant Frontend as 🌐 Frontend<br/>(Next.js)
    participant Signaling as 🔌 Signaling<br/>(Express+Socket.io)
    participant Doctor as 🩺 Doctor<br/>Browser
    participant STUN as 🌍 STUN/TURN<br/>Servers

    Patient->>Frontend: Initiate call
    Frontend->>Signaling: Socket.emit('offer_call', roomId)
    Signaling->>Doctor: Socket.emit('incoming_call', roomId)
    
    Doctor->>Doctor: Accept call
    
    Note over Patient,Doctor: WebRTC Peer Connection Setup
    
    Patient->>Patient: Create RTCPeerConnection
    Patient->>STUN: Get ICE candidates
    
    Patient->>Signaling: Socket.emit('offer', {sdp, roomId})
    Signaling->>Doctor: Socket.emit('offer', {sdp})
    
    Doctor->>Doctor: Create RTCPeerConnection + setRemoteDescription
    Doctor->>STUN: Get ICE candidates
    
    Doctor->>Signaling: Socket.emit('answer', {sdp, roomId})
    Signaling->>Patient: Socket.emit('answer', {sdp})
    
    Patient->>Patient: setRemoteDescription(answer)
    
    loop ICE Candidates Exchange
        Patient->>Signaling: Socket.emit('icecandidate', {candidate})
        Signaling->>Doctor: Socket.emit('icecandidate', {candidate})
        Doctor->>Signaling: Socket.emit('icecandidate', {candidate})
        Signaling->>Patient: Socket.emit('icecandidate', {candidate})
    end
    
    Note over Patient,Doctor: WebRTC Connected
    
    Patient->>Patient: addTrack(audio, video)
    Doctor->>Doctor: addTrack(audio, video)
    
    Patient->>Patient: ontrack event
    Doctor->>Doctor: ontrack event
    
    rect rgb(200, 220, 255)
        Note over Patient,Doctor: Call Active - Media Flowing P2P
        Patient->>Doctor: Audio/Video Stream (P2P)
        Doctor->>Patient: Audio/Video Stream (P2P)
    end
    
    Doctor->>Frontend: End call
    Frontend->>Signaling: Socket.emit('end_call', roomId)
    Signaling->>Patient: Socket.emit('end_call')
    
    Patient->>Patient: Close RTCPeerConnection
    Doctor->>Doctor: Close RTCPeerConnection
```

### Database Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : "books"
    USER ||--o{ CHAT_MESSAGE : "sends"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ CHAT_UPLOAD : "uploads"
    USER ||--o{ DOCTOR : "has"
    USER ||--o{ PATIENT : "has"

    DOCTOR ||--o{ APPOINTMENT : "schedules"
    DOCTOR ||--o{ PRESCRIPTION : "issues"
    DOCTOR ||--o{ REVIEW : "receives"

    PATIENT ||--o{ APPOINTMENT : "attends"
    PATIENT ||--o{ PRESCRIPTION : "receives"
    PATIENT ||--o{ REVIEW : "reads"

    APPOINTMENT ||--o| PRESCRIPTION : "generates"
    APPOINTMENT ||--o{ CHAT_MESSAGE : "contains"
    
    REVIEW ||--o{ USER : "written_by"

    USER {
        string id PK "User ID"
        string email UK "Email Address"
        string password "Hashed Password"
        string role "doctor, patient, admin"
        string full_name "Full Name"
        string phone "Phone Number"
        string avatar_url "Avatar URL"
        string status "active, inactive"
        datetime created_at "Creation Date"
        datetime updated_at "Last Updated"
    }

    DOCTOR {
        string user_id FK "User Reference"
        string specialization "Medical Specialization"
        string license_number UK "License Number"
        float rating "Star Rating"
        int total_consultations "Total Consultations"
        string bio "Doctor Bio"
        int consultation_fee "Fee Amount"
        string availability "Schedule"
    }

    PATIENT {
        string user_id FK "User Reference"
        int age "Age"
        string gender "Male, Female, Other"
        string blood_group "Blood Type"
        string medical_history "History"
        string allergies "Known Allergies"
        string address "Address"
    }

    APPOINTMENT {
        string id PK "Appointment ID"
        string doctor_id FK "Doctor Reference"
        string patient_id FK "Patient Reference"
        string booking_user_id FK "Booked By User"
        datetime scheduled_at "Scheduled Time"
        datetime started_at "Start Time"
        datetime ended_at "End Time"
        string status "scheduled, completed, cancelled"
        string notes "Doctor Notes"
        int amount "Fee Amount"
        string payment_status "paid, pending"
        datetime created_at "Created Date"
    }

    CHAT_MESSAGE {
        string id PK "Message ID"
        string sender_id FK "Sender User"
        string receiver_id FK "Receiver User"
        string content "Message Content"
        boolean is_read "Read Status"
        string message_type "text, file, image"
        string attachment_url "Attachment URL"
        datetime created_at "Sent Time"
    }

    CHAT_UPLOAD {
        string id PK "Upload ID"
        string uploader_id FK "Uploader User"
        string file_url "File Location"
        string file_type "MIME Type"
        string file_name "File Name"
        datetime created_at "Upload Time"
    }

    PRESCRIPTION {
        string id PK "Prescription ID"
        string appointment_id FK "Appointment"
        string doctor_id FK "Doctor"
        string patient_id FK "Patient"
        string medicines "JSON Medicines"
        string instructions "Usage Instructions"
        string duration "Duration"
        datetime created_at "Issued Date"
        datetime expires_at "Expiry Date"
    }

    REVIEW {
        string id PK "Review ID"
        string appointment_id FK "Appointment"
        string reviewer_id FK "Reviewer User"
        string doctor_id FK "Doctor Being Reviewed"
        int rating "1-5 Stars"
        string comment "Review Text"
        datetime created_at "Review Date"
    }
```

---

## 6. Tools & Technologies

The implementation follows an iterative, module-driven methodology:

1. Domain decomposition: split into auth, appointments, reports, chat, video, AI, admin modules.
2. Contract-first APIs: route-level handlers encapsulate validation, auth checks, and response schemas.
3. Shared abstractions: hooks (`use-webrtc*`, `use-socket*`) and utility libs (`lib/*`) reduce duplication.
4. Progressive hardening: role guards, secure headers, JWT/session checks, encryption for sensitive blobs.
5. Cross-platform operability: Windows and Unix setup/start scripts for reproducible local environments.

### 5.3 Functional Method Flow (Example: Knowledge Search)

1. User submits disease/medicine query from the medicines knowledge UI.
2. Backend route calls openFDA drug labels and MedlinePlus health topics.
3. Response data is sanitized/normalized for readability.
4. UI renders article-style content with follow-up suggestions and typo assistance.

## 6. System Architecture / Design (HLD and LLD)

### 6.1 High-Level Design (HLD)

```mermaid
graph TD
   U[Users: Patient / Doctor / Admin] --> WEB[Web Browser / Mobile Browser]
   WEB --> APP[medisphere-app - Next.js 15]
   APP --> DB[(MySQL via Prisma)]
   APP --> SIG[medisphere-signaling-server - Express + Socket.io]
   APP --> AUTH[NextAuth + OAuth Providers]
   APP --> PAY[Razorpay]
   APP --> AI[Google Gemini + LangChain + Pinecone]
   APP --> KNOW[openFDA + MedlinePlus]
   SIG --> RTC[WebRTC Peer-to-Peer Media]
```

### 6.2 Service Landscape (All Services)

```mermaid
graph TB
   subgraph ClientLayer["Client Layer"]
      C1["Patient UI"]
      C2["Doctor UI"]
      C3["Admin UI"]
   end

   subgraph AppLayer["Application Layer"]
      N1["Next.js Pages"]
      N2["API Routes"]
      N3["Auth & RBAC"]
   end

   subgraph RealtimeLayer["Real-time Layer"]
      R1["Socket.io Server"]
      R2["Room State"]
      R3["Signal Relay"]
   end

   subgraph DataLayer["Data Layer"]
      D1["MySQL"]
      D2["Prisma ORM"]
   end

   subgraph IntegrationLayer["External APIs"]
      I1["Gemini"]
      I2["LangChain"]
      I3["Razorpay"]
      I4["openFDA"]
      I5["MedlinePlus"]
      I6["OAuth"]
   end

   C1 --> N1
   C2 --> N1
   C3 --> N1
   N1 --> N2
   N2 --> N3
   N2 --> D2
   D2 --> D1
   N2 --> R1
   R1 --> R2
   R1 --> R3
   N2 --> I1
   N2 --> I2
   N2 --> I3
   N2 --> I4
   N2 --> I5
   N2 --> I6
```

### 6.3 Layered Architecture

- Presentation Layer: Next.js App Router pages and reusable React components.
- Application Layer: API routes for auth, appointments, reports, payments, AI, medicines knowledge.
- Real-time Layer: Socket.io signaling service + room orchestration + event relays.
- Data Layer: MySQL schema managed through Prisma models and relations.
- Integration Layer: AI, payment, OAuth, and public health APIs.

### 6.4 Low-Level Design (LLD)

#### A. LLD - Next.js Service Internal Design

```mermaid
flowchart TD
   PAGES[App Router Pages] --> UI[Domain Components]
   UI --> HOOKS[Custom Hooks]
   HOOKS --> SOCKET[Socket Client Hooks]
   UI --> APIREQ[Fetch API Routes]

   APIREQ --> AUTHZ[Auth Guard + Session Check]
   APIREQ --> VALID[Validation / Parsing]
   APIREQ --> DOMAIN[Domain Service Logic]
   DOMAIN --> PRISMA[Prisma ORM]
   PRISMA --> MYSQL[(MySQL)]

   DOMAIN --> EXT1[Gemini / LangChain / Pinecone]
   DOMAIN --> EXT2[Razorpay]
   DOMAIN --> EXT3[openFDA + MedlinePlus]
```

#### B. LLD - Signaling Service Internal Design

```mermaid
flowchart TD
   CONN[Socket Connection] --> AUTHN[Token Verification / Guest Fallback]
   AUTHN --> PART[Participant Registry]
   PART --> ROOM[Room Join and Leave]
   ROOM --> STATE[Meeting State Manager]
   STATE --> EVENTS[Call Events: initiate/accept/decline]
   STATE --> WEBRTCSIG[WebRTC Signaling: offer/answer/ICE]
   WEBRTCSIG --> PEERS[Peer Connection Establishment]
   EVENTS --> CHAT[Room Chat Broadcast]
```

#### C. LLD - Doctor to Patient Call Sequence

```mermaid
sequenceDiagram
   participant D as Doctor Client
   participant S as Signaling Server
   participant P as Patient Client

   D->>S: call:initiate(appointmentId, doctorName)
   S-->>P: call:incoming
   P->>S: call:accept
   S-->>D: call:accepted
   D->>S: webrtc:offer
   S-->>P: webrtc:offer
   P->>S: webrtc:answer
   S-->>D: webrtc:answer
   D->>S: webrtc:ice-candidate
   S-->>P: webrtc:ice-candidate
   P->>S: webrtc:ice-candidate
   S-->>D: webrtc:ice-candidate
```

#### D. LLD - Data Model View

```mermaid
erDiagram
   USER ||--o| DOCTOR : has
   USER ||--o| PATIENT : has
   DOCTOR ||--o{ APPOINTMENT : attends
   PATIENT ||--o{ APPOINTMENT : books
   APPOINTMENT ||--o{ CHATMESSAGE : contains
   APPOINTMENT ||--o{ CHATUPLOAD : contains
   APPOINTMENT ||--o{ CALLSESSION : tracks
   PATIENT ||--o{ REPORT : uploads
   DOCTOR ||--o{ PRESCRIPTION : writes
   PATIENT ||--o{ MEDICATION : tracks
   PATIENT ||--o{ AICHAT : owns
```

#### E. Core Services and Responsibilities

| Module | Primary Responsibility |
|---|---|
| `src/app/api/auth` | Authentication + session management integration |
| `src/app/api/appointments` | Appointment lifecycle APIs |
| `src/app/api/reports` | Report upload/download and metadata management |
| `src/app/api/ai` | AI chat, document/image processing endpoints |
| `src/app/api/medicines/search` | openFDA + MedlinePlus aggregation and normalization |
| `medisphere-signaling-server/server.js` | Socket server bootstrap, room events, call signaling |
| `medisphere-signaling-server/src/webrtc-handler.js` | Offer/answer/ICE relay and meeting participant state |

#### F. Data Model Essentials

Important entities in `prisma/schema.prisma` include:

- `User`, `Doctor`, `Patient` (identity and role context)
- `Appointment` (doctor-patient interaction anchor)
- `Report`, `ChatUpload` (clinical artifact storage)
- `Prescription`, `Medication` (treatment continuity)
- `ChatMessage`, `CallSession` (communication tracking)
- `AIChat`, `Review`, `AuditLog` (assistant history, quality, observability)

#### G. Real-Time Call Flow (Simplified LLD)

1. Doctor emits call initiation event for an appointment.
2. Signaling server notifies room participants with incoming call event.
3. Patient accepts and joins meeting context.
4. WebRTC exchange begins with offer/answer and ICE candidate relays.
5. Peer connection establishes media streams.
6. Leave/end events clean up meeting state.

#### H. Security Design Notes

- Session/JWT-aware route protection and role checks.
- Helmet-based secure headers in signaling service.
- Password hashing (`bcryptjs`) and token validation (`jose`/`jsonwebtoken`).
- Sensitive binary data support with encrypted storage patterns.

## 7. Tools & Technologies Used

### 7.1 Frontend and Full-Stack Framework

| Technology | Usage |
|---|---|
| Next.js 15 | App Router UI, server rendering, API routes |
| React 19 | Component model and client interactions |
| TypeScript | Type safety and maintainable contracts |
| Tailwind CSS | Utility-first styling and responsive layouts |
| Framer Motion + Radix UI | Interaction and accessible primitives |

### 7.2 Backend and Data

| Technology | Usage |
|---|---|
| Next.js Route Handlers | Domain APIs inside app service |
| Prisma ORM | DB access, model typing, migrations |
| MySQL | Primary relational datastore |
| NextAuth | Credentials/OAuth authentication integration |

### 7.3 Real-Time and Communication

| Technology | Usage |
|---|---|
| Socket.io | Real-time signaling and event transport |
| WebRTC | Peer-to-peer audio/video communication |
| Express | Signaling server runtime |
| STUN infrastructure | NAT traversal support |

### 7.4 AI and External Integrations

| Technology | Usage |
|---|---|
| Google Gemini | Medical assistant chat and reasoning support |
| LangChain + Pinecone | Orchestration and retrieval-oriented AI workflows |
| Razorpay | Appointment/payment workflows |
| openFDA + MedlinePlus | Drug label and disease/topic knowledge retrieval |

## 8. Repository Structure

```text
medispherev7/
├── medisphere-app/                 # Next.js monolith app (UI + APIs)
│   ├── src/app/                    # Routes/pages/API handlers
│   ├── src/components/             # UI modules by domain
│   ├── src/hooks/                  # Reusable client hooks
│   ├── src/lib/                    # Utilities/services
│   ├── src/types/                  # Shared TS types
│   └── prisma/schema.prisma        # Database schema
├── medisphere-signaling-server/    # Express + Socket.io signaling service
│   ├── server.js
│   └── src/webrtc-handler.js
├── SETUP_GUIDE.md
├── STARTUP_GUIDE.md
├── WEBRTC_SETUP.md
└── PROJECT_REPORT.md
```

## 9. Setup and Run

### Quick Setup

1. Run initial setup script once:
   - Windows: `setup.bat`
   - macOS/Linux: `./setup-dev.sh`
2. Configure environment files:
   - `medisphere-app/.env.local`
   - `medisphere-signaling-server/.env`
3. Run database migration/generation from `medisphere-app`:
   - `npx prisma migrate dev --name init`
   - `npx prisma generate`
4. Start both services:
   - Windows: `start-medisphere.bat` or `start-dev.bat`
   - macOS/Linux: `./start-dev.sh`

### Local Endpoints

- Frontend: `http://localhost:3000`
- Signaling Health: `http://localhost:4000/health`

## 10. Command Reference

### 10.1 Setup Commands

```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup-dev.sh start-dev.sh stop-dev.sh
./setup-dev.sh
```

### 10.2 Start Commands

```bash
# Windows (all services)
start-medisphere.bat

# Alternative Windows starter
start-dev.bat

# macOS/Linux (all services)
./start-dev.sh
```

### 10.3 Manual Service Start

```bash
# Terminal 1
cd medisphere-signaling-server
npm run dev

# Terminal 2
cd medisphere-app
npm run dev
```

### 10.4 Database Commands

```bash
cd medisphere-app
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

### 10.5 Build and Production Commands

```bash
cd medisphere-app
npm run build
npm run start

cd ../medisphere-signaling-server
npm run start
```

### 10.6 Health and Verification Commands

```bash
# App health check (HTML response expected)
curl http://localhost:3000

# Signaling service health check (JSON expected)
curl http://localhost:4000/health
```

## 11. Documentation Map

- `PROJECT_REPORT.md`: Full project report and domain context.
- `DOCTOR_PATIENT_CALL_FLOW.md`: Doctor-initiated incoming-call flow.
- `SETUP_GUIDE.md`: Detailed setup and testing path.
- `STARTUP_GUIDE.md`: Startup, configuration, and deployment notes.
- `WEBRTC_SETUP.md`: WebRTC-oriented setup and troubleshooting.
- `QUICK_REFERENCE.md`: Fast operational command reference.
