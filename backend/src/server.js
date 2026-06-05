require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const connectDB = require('./db');
const authController = require('./controllers/authController');
const complaintController = require('./controllers/complaintController');
const analyticsController = require('./controllers/analyticsController');
const { protect, optionalProtect, restrictTo } = require('./middlewares/authMiddleware');
const { startEscalator } = require('./services/escalationService');

// Initialize app
const app = express();
const server = http.createServer(app);

// CORS config
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store io in express settings to access inside controllers
app.set('io', io);

// Socket connections
io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO:', socket.id);

  // Authenticated users join a room matching their User ID for targeted notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room.`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
connectDB();

// AI Auto-Escalation scanning process
startEscalator(io);

// API Routes
// 1. Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/verify-email/:token', authController.verifyEmail);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/reset-password/:token', authController.resetPassword);
app.get('/api/auth/me', protect, authController.getMe);

// 2. Complaint routes
app.post('/api/complaints', protect, restrictTo('Citizen'), complaintController.createComplaint);
app.get('/api/complaints', optionalProtect, complaintController.getComplaints);
app.get('/api/complaints/:id', optionalProtect, complaintController.getComplaintById);
app.patch('/api/complaints/:id/status', protect, restrictTo('Ward Councillor', 'Zonal Officer', 'Mayor', 'Corporation Commissioner'), complaintController.updateComplaintStatus);
app.post('/api/complaints/:id/affected', protect, restrictTo('Citizen'), complaintController.affectedIncrement);
app.post('/api/complaints/:id/comments', protect, complaintController.addComment);

// 3. Analytics routes
app.get('/api/analytics/citizen', protect, restrictTo('Citizen'), analyticsController.getCitizenAnalytics);
app.get('/api/analytics/councillor', protect, restrictTo('Ward Councillor'), analyticsController.getCouncillorAnalytics);
app.get('/api/analytics/mla', protect, restrictTo('MLA'), analyticsController.getMlaAnalytics);
app.get('/api/analytics/zonal', protect, restrictTo('Zonal Officer'), analyticsController.getZonalAnalytics);
app.get('/api/analytics/mayor', protect, restrictTo('Mayor'), analyticsController.getMayorAnalytics);
app.get('/api/analytics/commissioner', protect, restrictTo('Corporation Commissioner'), analyticsController.getCommissionerSearch);
app.get('/api/analytics/scorecards', analyticsController.getPublicScorecards); // Publicly viewable

// Base router check
app.get('/', (req, res) => {
  res.send('Namma Chennai GovTech API is active.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Port binding
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
