const express = require('express');
const {AccessToken} = require('livekit-server-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// Rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (requests.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  requests.push(now);
  requestCounts.set(ip, requests);
  next();
}

// Cleanup old rate limit data every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, requests] of requestCounts.entries()) {
    const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (validRequests.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, validRequests);
    }
  }
}, 300000);

// CORS configuration - restrict to your domain
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check allowed origins
    if (allowedOrigins.length === 0 || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Temporarily allow all for debugging
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limit payload size

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Input validation
function validateInput(roomName, userName) {
  const errors = [];
  
  // Check if values exist
  if (!roomName || !userName) {
    errors.push('roomName and userName are required');
  }
  
  // Length validation
  if (userName && (userName.length < 2 || userName.length > 50)) {
    errors.push('userName must be between 2 and 50 characters');
  }
  
  if (roomName && (roomName.length < 2 || roomName.length > 50)) {
    errors.push('roomName must be between 2 and 50 characters');
  }
  
  // Character validation - only alphanumeric, spaces, hyphens, underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  
  if (userName && !validPattern.test(userName)) {
    errors.push('userName contains invalid characters');
  }
  
  if (roomName && !validPattern.test(roomName)) {
    errors.push('roomName contains invalid characters');
  }
  
  return errors;
}

app.post('/get-token', rateLimiter, async (req, res) => {
  try {
    const { roomName, userName } = req.body;

    // Validate input
    const validationErrors = validateInput(roomName, userName);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }

    // Check if environment variables are set
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.error('LiveKit credentials not configured. API_KEY:', !!apiKey, 'API_SECRET:', !!apiSecret);
      return res.status(500).json({ error: 'Server configuration error. Please contact administrator.' });
    }

    // Create token
    const token = new AccessToken(
      apiKey,
      apiSecret,
      { identity: userName.trim() }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName.trim(),
      canPublish: true,
      canSubscribe: true
    });

    const jwt = await token.toJwt();
    res.json({ token: jwt });

  } catch (error) {
    console.error('Error generating token:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to generate token. Please try again.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});