const crypto = require('crypto');

class RoomIdGenerator {
  generateRoomId() {
    // Generate a unique 10-character room ID
    return crypto.randomBytes(5).toString('hex');
  }

  generateShortId() {
    // Generate a shorter 6-character ID for user-friendly URLs
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(randomBytes[i] % chars.length);
    }
    return result;
  }
}

module.exports = new RoomIdGenerator();
