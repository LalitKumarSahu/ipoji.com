const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const ipoRoutes = require('./routes/ipoRoutes');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/ipo', ipoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/user', userRoutes);

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IPO Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'IPO Tracker API',
    version: '2.0.0',
    endpoints: {
      ipo: {
        getAll: 'GET /api/ipo',
        getById: 'GET /api/ipo/:id',
        create: 'POST /api/ipo',
        update: 'PUT /api/ipo/:id',
        delete: 'DELETE /api/ipo/:id',
        subscription: 'GET /api/ipo/:id/subscription'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (requires token)',
        updateProfile: 'PUT /api/auth/profile (requires token)'
      },
      applications: {
        apply: 'POST /api/applications/apply (requires token)',
        myApplications: 'GET /api/applications/my-applications (requires token)',
        getById: 'GET /api/applications/:id (requires token)',
        checkAllotment: 'POST /api/applications/check-allotment'
      },
      user: {
        dashboard: 'GET /api/user/dashboard (requires token)',
        stats: 'GET /api/user/stats (requires token)',
        appliedIPOs: 'GET /api/user/applied-ipos (requires token)',
        notifications: 'GET /api/user/notifications (requires token)',
        addBankAccount: 'POST /api/user/bank-account (requires token)',
        addUPI: 'POST /api/user/upi (requires token)',
        addDemat: 'POST /api/user/demat-account (requires token)',
        deleteAccount: 'DELETE /api/user/account (requires token)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 IPO Tracker Server Started Successfully!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Server: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;