const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check handler for uptime monitoring (e.g. UptimeRobot)
const healthCheckHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    message: 'DevConnect API is healthy and operational',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: isDbConnected ? 'connected' : 'disconnected'
  });
};

// Basic route & health endpoints for uptime monitoring
app.get('/', (req, res) => {
  res.status(200).send('DevConnect API is running...');
});
app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const referralRoutes = require('./routes/referral');
const messageRoutes = require('./routes/message');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notification');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

module.exports = app;
