const { AccessToken } = require('livekit-server-sdk');

class TokenGenerator {
  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY;
    this.apiSecret = process.env.LIVEKIT_API_SECRET;
  }

  generateToken(roomName, userName, options = {}) {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit credentials not configured');
    }

    const token = new AccessToken(
      this.apiKey,
      this.apiSecret,
      { identity: userName }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: options.canPublish !== false,
      canSubscribe: options.canSubscribe !== false
    });

    return token.toJwt();
  }
}

module.exports = new TokenGenerator();
