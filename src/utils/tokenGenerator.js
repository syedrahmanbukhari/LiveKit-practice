const { AccessToken } = require('livekit-server-sdk');

class TokenGenerator {
  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY;
    this.apiSecret = process.env.LIVEKIT_API_SECRET;
  }

  generateToken(roomName, userName, options = {}) {
    console.log('Generating token for:', { roomName, userName });
    console.log('API Key exists:', !!this.apiKey);
    console.log('API Secret exists:', !!this.apiSecret);

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit credentials not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.');
    }

    try {
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
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate access token: ' + error.message);
    }
  }
}

module.exports = new TokenGenerator();
