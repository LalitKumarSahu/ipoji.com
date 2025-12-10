const express = require('express');
const router = express.Router();
const ipoController = require('../controllers/ipoController');

// GET all IPOs (with subscription & GMP data)
router.get('/', ipoController.getAllIPOs);

// GET IPO by ID (with live data)
router.get('/:id', ipoController.getIPOById);

// GET live subscription status
router.get('/:id/subscription', ipoController.getSubscriptionStatus);

// POST - Add new IPO
router.post('/', ipoController.addIPO);

// PUT - Update IPO
router.put('/:id', ipoController.updateIPO);

// DELETE - Delete IPO
router.delete('/:id', ipoController.deleteIPO);

module.exports = router;