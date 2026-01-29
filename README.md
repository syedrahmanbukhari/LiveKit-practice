# LiveKit Video Conferencing App

Production-ready video conferencing application with room creation and link sharing (Zoom-style).

## Features

- ✅ Create meeting rooms with unique links
- ✅ Share meeting links with participants
- ✅ Real-time video and audio
- ✅ Multiple participants support
- ✅ Mute/unmute controls
- ✅ Camera on/off toggle
- ✅ Automatic reconnection
- ✅ Mobile responsive
- ✅ MVC architecture
- ✅ Production-ready security

## Project Structure

```
├── server.js                 # Main server file
├── src/
│   ├── controllers/          # Business logic
│   │   └── roomController.js
│   ├── models/              # Data models
│   │   └── Room.js
│   ├── routes/              # API routes
│   │   └── roomRoutes.js
│   ├── middleware/          # Express middleware
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   └── utils/               # Utility functions
│       ├── tokenGenerator.js
│       ├── validator.js
│       └── roomIdGenerator.js
├── views/                   # HTML pages
│   ├── home.html           # Create room page
│   ├── join.html           # Join room page
│   └── meeting.html        # Meeting room page
├── public/                  # Static assets
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── home.js
│       ├── join.js
│       └── meeting.js
└── .env                     # Environment variables
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run Locally

```bash
npm start
```

Visit `http://localhost:3000`

## How It Works

### 1. Create Meeting
- Go to home page
- Enter meeting name and your name
- Click "Create Meeting"
- Get shareable link

### 2. Share Link
- Copy the generated link
- Share with participants via email, chat, etc.

### 3. Join Meeting
- Participants click the link
- Enter their name
- Join the meeting

## API Endpoints

### POST /api/create-room
Create a new meeting room
```json
{
  "roomName": "Team Meeting",
  "hostName": "John Doe"
}
```

### POST /api/join-room
Join an existing room
```json
{
  "roomId": "abc123",
  "userName": "Jane Smith"
}
```

### GET /api/room/:roomId
Get room details

### GET /api/health
Health check endpoint

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "MVC structure with room creation"
git push
```

### 2. Configure Vercel Environment Variables

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`
- `BASE_URL` (your Vercel domain)
- `NODE_ENV=production`

### 3. Deploy

Vercel will automatically deploy on push.

## Security Features

- ✅ Rate limiting (20 requests/minute per IP)
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ No hardcoded credentials
- ✅ Request payload size limits
- ✅ Error handling without exposing internals

## License

ISC

