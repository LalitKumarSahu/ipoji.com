const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

// Dashboard & Statistics
router.get('/dashboard', userController.getDashboard);
router.get('/stats', userController.getUserStats);
router.get('/applied-ipos', userController.getAppliedIPOs);
router.get('/notifications', userController.getNotifications);

// Payment & Account Details
router.post('/bank-account', userController.addBankAccount);
router.post('/upi', userController.addUPIId);
router.post('/demat-account', userController.addDematAccount);

// Account Management
router.delete('/account', userController.deleteAccount);

module.exports = router;