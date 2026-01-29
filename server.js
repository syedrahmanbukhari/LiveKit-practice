const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/* =========================
   CORS CONFIG (REAL ONE)
========================= */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or same-origin requests
      if (!origin) return callback(null, true);

      // Dev mode = open
      if (NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Production = strict
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);

/* =========================
   MIDDLEWARES
========================= */

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* =========================
   API ROUTES
========================= */

const roomRoutes = require('./src/routes/roomRoutes');
app.use('/api', roomRoutes);

/* =========================
   VIEW HELPERS
========================= */

const serveView = (fileName) => (req, res) => {
  res.sendFile(path.join(__dirname, 'views', fileName), (err) => {
    if (err) {
      console.error(`View error (${fileName}):`, err.message);
      res.status(500).send('Page loading error');
    }
  });
};

/* =========================
   VIEW ROUTES
========================= */

app.get('/', serveView('home.html'));
app.get('/join/:roomId', serveView('join.html'));
app.get('/room/:roomId', serveView('meeting.html'));

/* =========================
   API TEST
========================= */

app.get('/test', (req, res) => {
  res.json({ status: 'OK', env: NODE_ENV });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  res.status(404).send('Page not found');
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);

  res.status(500).json({
    error: 'Internal Server Error',
    details: NODE_ENV === 'production' ? undefined : err.message,
  });
});

/* =========================
   SERVER START
========================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

module.exports = app;
