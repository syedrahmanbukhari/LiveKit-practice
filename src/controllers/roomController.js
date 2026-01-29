const RoomModel = require('../models/Room');
const tokenGenerator = require('../utils/tokenGenerator');
const validator = require('../utils/validator');
const roomIdGenerator = require('../utils/roomIdGenerator');

class RoomController {
  // Create a new room
  async createRoom(req, res) {
    try {
      const { roomName, hostName } = req.body;

      // Validate input
      const errors = validator.validateInput(roomName, hostName);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      // Generate unique room ID
      const roomId = roomIdGenerator.generateShortId();

      // Create room in database
      const room = RoomModel.createRoom({
        id: roomId,
        name: roomName.trim(),
        hostName: hostName.trim()
      });

      // Generate token for host
      const token = await tokenGenerator.generateToken(roomId, hostName.trim());

      // Generate shareable link
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const joinLink = `${baseUrl}/join/${roomId}`;

      res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name,
          hostName: room.hostName,
          createdAt: room.createdAt
        },
        token,
        joinLink
      });

    } catch (error) {
      console.error('Error creating room:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to create room. Please try again.' });
    }
  }

  // Get room details
  async getRoomDetails(req, res) {
    try {
      const { roomId } = req.params;

      const room = RoomModel.getRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name,
          hostName: room.hostName,
          participantCount: room.participants.length,
          isActive: room.isActive
        }
      });

    } catch (error) {
      console.error('Error getting room details:', error.message);
      res.status(500).json({ error: 'Failed to get room details' });
    }
  }

  // Join existing room
  async joinRoom(req, res) {
    try {
      const { roomId, userName } = req.body;

      // Validate input
      const userErrors = validator.validateUserName(userName);
      if (userErrors.length > 0) {
        return res.status(400).json({ error: userErrors.join(', ') });
      }

      // Check if room exists
      const room = RoomModel.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found or expired' });
      }

      // Add participant to room
      RoomModel.addParticipant(roomId, userName.trim());

      // Generate token for participant
      const token = await tokenGenerator.generateToken(roomId, userName.trim());

      res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name
        },
        token
      });

    } catch (error) {
      console.error('Error joining room:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to join room. Please try again.' });
    }
  }

  // Legacy endpoint for backward compatibility
  async getToken(req, res) {
    try {
      const { roomName, userName } = req.body;

      // Validate input
      const errors = validator.validateInput(roomName, userName);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      // Generate token
      const token = await tokenGenerator.generateToken(roomName.trim(), userName.trim());

      res.json({ token });

    } catch (error) {
      console.error('Error generating token:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to generate token. Please try again.' });
    }
  }
}

module.exports = new RoomController();
