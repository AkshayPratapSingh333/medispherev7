# Medisphere - Quick Reference Guide

## 🚀 Quick Start

### Windows
```batch
# First time setup
setup.bat

# Start everything
start-medisphere.bat

# Stop everything
stop-medisphere.bat
```

### macOS/Linux
```bash
# Make scripts executable
chmod +x *.sh

# First time setup
./setup-dev.sh

# Start everything
./start-dev.sh

# Stop everything
./stop-dev.sh
```

---

## 🛠️ Common Tasks

### Generate Secret Key
```bash
# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)))

# macOS/Linux
openssl rand -base64 32
```

### Database Commands
```bash
# Initialize database
cd medisphere-app
npx prisma migrate dev --name init

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open database explorer
npx prisma studio

# View database schema
npx prisma db pull
```

### View Logs
```bash
# Frontend logs
tail -f /tmp/medisphere-frontend.log

# Signaling server logs
tail -f /tmp/medisphere-server.log

# Browser console
Open DevTools: F12 or Cmd+Option+I
```

### Kill Process on Port
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
sudo lsof -ti:3000 | xargs kill -9
```

### Install Specific Package
```bash
cd medisphere-app
npm install package-name

cd ../medisphere-signaling-server
npm install package-name
```

---

## 🧪 Testing

### Create Test Users
1. Go to http://localhost:3000
2. Sign up as Doctor
3. Complete doctor profile
4. Sign up as Patient
5. Complete patient profile

### Test Video Call
1. Create appointment (logged in as Doctor)
2. Open appointment as Doctor
3. Open same appointment in different browser/tab as Patient
4. Both should connect automatically
5. Test mute/camera buttons
6. Click "End Call" to disconnect

---

## 📊 Monitoring

### Check Server Status
```bash
# Frontend
curl http://localhost:3000

# Signaling server
curl http://localhost:4000/health
```

### View Active Connections
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill port
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :4000') DO taskkill /F /PID %%a

# macOS/Linux
sudo lsof -ti :4000 | xargs kill -9
```

### npm Dependencies Error
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# View schema
npx prisma db pull

# Validate schema
npx prisma validate
```

### WebRTC Connection Failed
- Check browser allows camera/microphone (click padlock in address bar)
- Verify NEXTAUTH_SECRET is set in .env.local
- Check signaling server is running (`curl http://localhost:4000/health`)
- Check firewall isn't blocking ports

---

## 📝 File Locations

| File | Purpose |
|------|---------|
| `medisphere-app/.env.local` | Frontend config (create from .env.example) |
| `medisphere-signaling-server/.env` | Signaling server config (create from .env.example) |
| `medisphere-app/prisma/schema.prisma` | Database schema |
| `medisphere-app/src/app/appointments/[id]/video/page.tsx` | Video call page |
| `medisphere-app/src/components/video/VideoCall.tsx` | Video component |
| `medisphere-app/src/hooks/use-webrtc-call.ts` | WebRTC hook |
| `medisphere-app/src/hooks/use-socket-client.ts` | Socket.io hook |
| `medisphere-signaling-server/server.js` | Signaling server |

---

## 🌐 URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Signaling Server | http://localhost:4000 | 4000 |
| Health Check | http://localhost:4000/health | 4000 |
| Prisma Studio | http://localhost:5555 | 5555 |

---

## 📚 Useful Docs

- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Docs](https://socket.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## 💡 Tips

1. **Use Prisma Studio** to view/edit database without SQL
   ```bash
   npx prisma studio
   ```

2. **Check network traffic** in DevTools Network tab
   - Look for WebSocket connections to signaling server
   - Check SDP offer/answer messages

3. **Enable detailed logging** by adding to use-webrtc-call.ts
   ```javascript
   console.log('[WebRTC]', event, data);
   ```

4. **Test on mobile** by accessing `http://<your-ip>:3000`
   - Replace localhost with your machine's IP
   - Make sure signaling server uses correct origin in .env

5. **Use different profiles** in Firefox to run two browsers
   - Helps test 1-on-1 calls locally

---

## 🚨 Emergency Stop

If everything is stuck:

### Windows
```batch
taskkill /F /IM node.exe
taskkill /F /IM npm.exe
```

### macOS/Linux
```bash
pkill -9 node
pkill -9 npm
```

Then wait 5 seconds and restart with `start-medisphere.bat` or `./start-dev.sh`

---

**Last Updated**: March 31, 2025
**For help**: See STARTUP_GUIDE.md for comprehensive documentation
