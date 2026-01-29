function errorHandler(err, req, res, next) {
  console.error('Server error:', err.message, err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

module.exports = { errorHandler, notFoundHandler };
