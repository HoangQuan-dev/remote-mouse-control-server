const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const os = require('os');
const MouseController = require('./mouseController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3000;
const localIP = getLocalIP();

// Generate unique room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

let currentRoom = null;
let connectedClients = new Set();

// Initialize mouse controller
const mouseController = new MouseController();

// Mouse movement batching to improve smoothness and performance
// - Accumulates deltas from clients and applies at a fixed rate
// - Reduces the number of PowerShell invocations on Windows
const MOUSE_SENSITIVITY = Number(process.env.MOUSE_SENSITIVITY || 1.4);
const APPLY_INTERVAL_MS = Number(process.env.MOUSE_APPLY_INTERVAL_MS || 80); // ~60Hz
let pendingDeltaX = 0;
let pendingDeltaY = 0;

setInterval(async () => {
  try {
    // Round what we can apply now but keep fractional remainder for next frame
    const dx = Math.round(pendingDeltaX);
    const dy = Math.round(pendingDeltaY);
    if (dx !== 0 || dy !== 0) {
      pendingDeltaX -= dx;
      pendingDeltaY -= dy;
      await mouseController.moveMouse(dx, dy);
    }
  } catch (error) {
    console.error('Error applying batched mouse move:', error);
  }
}, APPLY_INTERVAL_MS);

// Generate QR code data
async function generateQRData() {
  const roomId = generateRoomId();
  currentRoom = roomId;
  
  const connectionData = {
    ip: localIP,
    port: PORT,
    roomId: roomId,
    protocol: 'ws'
  };
  
  const qrString = JSON.stringify(connectionData);
  const qrCodeDataURL = await QRCode.toDataURL(qrString);
  
  return {
    qrCode: qrCodeDataURL,
    roomId: roomId,
    ip: localIP,
    port: PORT
  };
}

// API endpoint to get QR code
app.get('/api/qr', async (req, res) => {
  try {
    const qrData = await generateQRData();
    res.json(qrData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Auto-join web clients to current room (they're on the same server)
  if (currentRoom) {
    socket.join(currentRoom);
    console.log(`Client ${socket.id} auto-joined room ${currentRoom}`);
  }
  
  socket.on('join-room', (roomId) => {
    if (roomId === currentRoom) {
      socket.join(roomId);
      connectedClients.add(socket.id);
      
      // Notify ALL clients in the room that mobile connected
      io.to(roomId).emit('mobile-connected', {
        clientId: socket.id,
        totalClients: connectedClients.size
      });
      
      socket.emit('room-joined', { success: true, roomId });
      console.log(`Mobile client ${socket.id} joined room ${roomId}`);
    } else {
      socket.emit('room-joined', { success: false, error: 'Invalid room ID' });
    }
  });
  
  // Handle mouse movements from mobile
  socket.on('mouse-move', (data) => {
    try {
      const { deltaX, deltaY } = data || {};
      if (typeof deltaX !== 'number' || typeof deltaY !== 'number') return;
      // Accumulate with sensitivity for smoother/faster pointer motion
      pendingDeltaX += deltaX * MOUSE_SENSITIVITY;
      pendingDeltaY += deltaY * MOUSE_SENSITIVITY;
    } catch (error) {
      console.error('Error queuing mouse move:', error);
    }
  });
  
  // Handle mouse clicks from mobile
  socket.on('mouse-click', async (data) => {
    try {
      const { button } = data;
      await mouseController.mouseClick(button);
      console.log(`${button} click executed`); // Keep this for feedback
    } catch (error) {
      console.error('Error handling mouse click:', error);
    }
  });
  
  // Handle scroll events from mobile
  socket.on('scroll', async (data) => {
    try {
      const { deltaX, deltaY } = data;
      await mouseController.scroll(deltaX, deltaY);
      console.log(`Scrolled: ${deltaX}, ${deltaY}`);
    } catch (error) {
      console.error('Error handling scroll:', error);
    }
  });
  
  // Handle keyboard input from mobile
  socket.on('key-press', async (data) => {
    try {
      const { key, text } = data || {};
      if (text) {
        await mouseController.typeText(text);
        console.log(`Text typed: ${text}`);
      } else if (key) {
        // Normalize common special keys to improve cross-client compatibility
        const normalized = String(key).toLowerCase();
        const aliases = { 'esc': 'escape', 'return': 'enter' };
        const finalKey = aliases[normalized] || normalized;
        await mouseController.sendKey(finalKey);
        console.log(`Key pressed: ${finalKey}`);
      }
    } catch (error) {
      console.error('Error handling key press:', error);
    }
  });
  
  // Handle media controls from mobile
  socket.on('media-control', async (data) => {
    try {
      const { action } = data || {};
      if (!action) return;
      
      switch (action.toLowerCase()) {
        case 'play':
        case 'pause':
        case 'playpause':
        case 'play-pause':
          await mouseController.playPause();
          console.log(`Media ${action} executed`);
          break;
        case 'volumeup':
        case 'volume_up':
        case 'volume-up':
          await mouseController.volumeUp();
          console.log('Volume up executed');
          break;
        case 'volumedown':
        case 'volume_down':
        case 'volume-down':
          await mouseController.volumeDown();
          console.log('Volume down executed');
          break;
        case 'mute':
          await mouseController.volumeMute();
          console.log('Volume mute executed');
          break;
        case 'next':
          await mouseController.nextTrack();
          console.log('Next track executed');
          break;
        case 'previous':
        case 'prev':
          await mouseController.previousTrack();
          console.log('Previous track executed');
          break;
        default:
          console.warn(`Unknown media control action: ${action}`);
      }
    } catch (error) {
      console.error('Error handling media control:', error);
    }
  });
  
  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    console.log('Client disconnected:', socket.id);
    
    // Notify all clients in the current room
    if (currentRoom) {
      io.to(currentRoom).emit('client-disconnected', {
        clientId: socket.id,
        totalClients: connectedClients.size
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`
🚀 Remote Mouse Control Server Started!
🖥️  Platform: ${os.platform()} (${os.arch()})
📱 Web Interface: http://localhost:${PORT}
🌐 Network URL: http://${localIP}:${PORT}
📡 Socket.io Server Ready
💡 Cross-platform support: Windows, macOS, Linux
⚙️  Mouse sensitivity: ${MOUSE_SENSITIVITY}x
🔄 Update interval: ${APPLY_INTERVAL_MS}ms
  `);
});