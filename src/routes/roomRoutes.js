const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const rateLimiter = require('../middleware/rateLimiter');

// Create new room
router.post('/create-room', rateLimiter, (req, res) => roomController.createRoom(req, res));

// Get room details
router.get('/room/:roomId', (req, res) => roomController.getRoomDetails(req, res));

// Join existing room
router.post('/join-room', rateLimiter, (req, res) => roomController.joinRoom(req, res));

// Legacy token endpoint (backward compatibility)
router.post('/get-token', rateLimiter, (req, res) => roomController.getToken(req, res));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
