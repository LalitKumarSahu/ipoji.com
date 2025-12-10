const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');

// All application routes require authentication
router.post('/apply', authenticateToken, applicationController.applyForIPO);
router.get('/my-applications', authenticateToken, applicationController.getUserApplications);
router.get('/:id', authenticateToken, applicationController.getApplicationById);
router.put('/:id/payment', authenticateToken, applicationController.updatePaymentStatus);

// Public route for allotment status check
router.post('/check-allotment', applicationController.checkAllotmentStatus);

module.exports = router;