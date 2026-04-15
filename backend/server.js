const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Grab-n-Go API is running 🚀' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Serve Static Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`📡 Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
