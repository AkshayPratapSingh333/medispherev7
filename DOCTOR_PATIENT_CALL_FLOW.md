# Doctor-Patient Call Flow Implementation

## Overview

The Medisphere video calling system now supports initiated calls from doctor to patient with incoming call notifications.

## Call Flow Sequence

```
1. Doctor navigates to Appointment Chat
   └─> Sees "📞 Start Video Call" button (DoctorCallInitiator)

2. Doctor clicks "Start Video Call" button
   └─> Emits "call:initiate" to signaling server
   └─> Automatically navigates to /appointments/[id]/video

3. Signaling Server receives "call:initiate"
   └─> Broadcasts "call:incoming" to appointment room
   └─> Alerts other participants in the room

4. Patient on Appointment Chat page
   └─> IncomingCallModal receives "call:incoming" event
   └─> Shows modal with doctor name and Accept/Decline buttons
   └─> Modal displays ringing animation and sound (optional)

5. Patient clicks "Accept"
   └─> Emits "call:accept" to signaling server
   └─> Emits "join-meeting" to join the appointment room
   └─> Both doctor and patient now in WebRTC exchange mode

6. WebRTC Negotiation
   └─> start-webrtc-exchange event triggers
   └─> Doctor (initiator) creates SDP offer
   └─> Patient (responder) creates SDP answer
   └─> ICE candidates exchanged
   └─> P2P video/audio stream established

7. Call Active
   └─> Both see video frames
   └─> Can toggle mute/camera
   └─> Call duration tracking available

8. End Call
   └─> Either party clicks "End Call"
   └─> Cleans up media tracks
   └─> Closes peer connection
   └─> Returns to appointment details page
```

## Files Modified/Created

### Signaling Server Changes
**File**: `medisphere-signaling-server/server.js`
- ✅ Added `call:initiate` handler - broadcasts incoming call notification
- ✅ Added `call:accept` handler - confirms patient acceptance
- ✅ Added `call:decline` handler - patient declined the call

### Frontend Components Created

#### 1. DoctorCallInitiator
**File**: `src/components/video/DoctorCallInitiator.tsx`
- Button component for doctors to start video calls
- Emits `call:initiate` event with doctor info
- Navigates to video call page
- Shows loading state while initiating

#### 2. IncomingCallModal
**File**: `src/components/video/IncomingCallModal.tsx`
- Modal that appears when patient receives incoming call
- Displays doctor name and appointment ID
- Animated ringing indication
- Accept/Decline buttons with proper event handling
- Auto-clears after 60 seconds (call timeout)

### Components Updated

#### ChatWindow
**File**: `src/components/chat/ChatWindow.tsx`
- ✅ Added role-based button display
- ✅ Doctors see "Start Video Call" (DoctorCallInitiator)
- ✅ Patients see "Video Call" button (manual join option)
- ✅ Imported and integrated DoctorCallInitiator

#### Patient Appointment Page
**File**: `src/app/patient/appointments/[id]/page.tsx`
- ✅ Added `"use client"` directive
- ✅ Integrated IncomingCallModal component
- ✅ Modal displays globally for incoming calls

## Socket Events Used

### Doctor → Signaling Server
```typescript
emit("call:initiate", {
  appointmentId: string,
  from: string,           // Doctor user ID
  doctorName: string
})
```

### Signaling Server → Patient
```typescript
emit("call:incoming", {
  appointmentId: string,
  from: string,          // Doctor user ID
  doctorName: string,
  timestamp: number
})
```

### Patient → Signaling Server
```typescript
// Accept the call
emit("call:accept", {
  appointmentId: string
})

// Decline the call
emit("call:decline", {
  appointmentId: string
})
```

### Signaling Server Events
```typescript
// Broadcast to appointment room
io.to(appointmentId).emit("call:incoming", {...})

// To specific sockets
io.to(socketId).emit("call:accepted", {...})
io.to(appointmentId).emit("call:declined", {...})
```

## Testing the Complete Flow

### Prerequisites
- Both frontend and signaling server running
- Doctor and patient accounts with an appointment scheduled
- Both opened in separate browsers/windows

### Test Steps

1. **Doctor Initiates Call**
   - Log in as doctor
   - Navigate to patient appointment chat
   - Click "Start Video Call" button
   - Should be redirected to `/appointments/[id]/video`
   - Should see local video (if permissions granted)

2. **Patient Receives Notification**
   - Log in as patient (in another browser/window)
   - Navigate to same appointment chat
   - Wait for IncomingCallModal to appear
   - Modal shows doctor name and ringing animation

3. **Patient Accepts Call**
   - Click "Accept" button on modal
   - Modal closes
   - Chat window now shows integrated video
   - Should trigger WebRTC exchange
   - Both participants should see each other's video

4. **Verify Video Connection**
   - Both should see video frames
   - Test mute/unmute buttons
   - Test camera on/off buttons
   - Check connection status indicators

5. **End Call**
   - Click "End Call" button
   - Should return to appointment details
   - Media tracks should be cleaned up

### Debugging

**Check Browser Console**
- Look for socket events: `📞 Incoming call received`, `✅ Accepting call`
- WebRTC logs: `✅ Local stream attached`, `✅ Remote stream attached`
- Connection status: `Connection state:`, `ICE connection state:`

**Check Signaling Server Logs**
- `Doctor ... initiated call for appointment ...`
- `Patient accepted call for appointment ...`

## Troubleshooting

### Patient doesn't receive incoming call notification
- Ensure both doctor and patient have same appointment ID
- Check that patient is on appointment chat page
- Verify socket is connected (check console logs)
- Check signaling server logs for "call:initiate" event

### Patient accepts but video doesn't appear
- Ensure both users emitted `join-meeting` event
- Check WebRTC peer connection state in console
- Verify ICE candidates are being exchanged
- Check browser camera/microphone permissions

### Call initiates but no answer button response
- Ensure patient socket is connected
- Check browser console for errors
- Verify IncomingCallModal is mounted

## Future Enhancements

1. **Ringing Sound**: Add audio notification when call incoming
2. **Call History**: Track call duration and logs
3. **Call Timeout**: Auto-decline call after 60 seconds
4. **Missed Calls**: Notify patient of missed calls
5. **Call Stats**: Show connection quality metrics
6. **Screen Sharing**: Add screenshare capability
7. **Call Recording**: Record appointment calls (with consent)
8. **Callbacks**: Implement callback feature if patient offline

## Security Considerations

- ✅ JWT verification on socket connection
- ✅ Role-based access control (doctor-initiated only)
- ✅ Appointment ID validation
- ✅ User ID verification

All WebRTC streams are encrypted end-to-end with DTLS-SRTP.
