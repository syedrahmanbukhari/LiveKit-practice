# Vercel Deployment Fix Guide

## Issue: 500 Internal Server Error

### Step 1: Check Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```
LIVEKIT_API_KEY=API4dsCuLM7s2ML
LIVEKIT_API_SECRET=dB4k6wdI7NWpk6EqaHxhCTZenYvsSMeLmjJOYtann5a
LIVEKIT_URL=wss://practice-am64s12w.livekit.cloud
NODE_ENV=production
```

**Optional (for CORS):**
```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Step 2: Deploy Changes

```bash
git add .
git commit -m "Fix Vercel deployment - CORS and env variables"
git push
```

### Step 3: Check Logs

After deployment:
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click "View Function Logs"
4. Look for errors

### Step 4: Test Endpoint

Test if backend is working:
```
https://your-app.vercel.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Step 5: Test Token Generation

Use browser console or Postman:
```javascript
fetch('https://your-app.vercel.app/get-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roomName: 'test', userName: 'test' })
})
.then(r => r.json())
.then(console.log)
```

Should return:
```json
{"token":"eyJhbGc..."}
```

## Common Issues:

### 1. Environment Variables Not Set
**Error:** "Server configuration error"
**Fix:** Add all required env variables in Vercel dashboard

### 2. CORS Error
**Error:** "Not allowed by CORS"
**Fix:** Add your Vercel domain to ALLOWED_ORIGINS

### 3. Rate Limit
**Error:** "Too many requests"
**Fix:** Wait 1 minute or increase rate limit in code

### 4. Invalid Credentials
**Error:** Token generation fails
**Fix:** Verify LiveKit API keys are correct

## Verification Checklist:

- [ ] All environment variables added in Vercel
- [ ] Latest code pushed to GitHub
- [ ] Vercel deployment successful (green checkmark)
- [ ] `/health` endpoint returns 200 OK
- [ ] `/get-token` endpoint returns token
- [ ] Frontend can join meeting

## Need Help?

Check Vercel function logs for detailed error messages.
