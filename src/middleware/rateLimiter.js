const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute

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

module.exports = rateLimiter;
