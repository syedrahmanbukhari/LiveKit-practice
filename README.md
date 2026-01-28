# LiveKit Video Conferencing App

Production-ready video conferencing application built with LiveKit.

## Features

- ✅ Real-time video and audio
- ✅ Multiple participants support
- ✅ Mute/unmute controls
- ✅ Camera on/off toggle
- ✅ Automatic reconnection
- ✅ Mobile responsive
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Production-ready security

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your LiveKit credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
ALLOWED_ORIGINS=https://your-domain.vercel.app
NODE_ENV=production
```

### 3. Run Locally

```bash
npm start
```

Visit `http://localhost:3000`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push
```

### 2. Configure Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`
- `ALLOWED_ORIGINS` (your Vercel domain)
- `NODE_ENV=production`

### 3. Deploy

Vercel will automatically deploy on push.

## Security Features

- ✅ No hardcoded credentials
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Input validation and sanitization
- ✅ CORS restricted to allowed origins
- ✅ Request payload size limits
- ✅ Error handling without exposing internals
- ✅ Production logs disabled

## Rate Limits

- Token generation: 10 requests per minute per IP
- Automatic cleanup of rate limit data

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## License

ISC
