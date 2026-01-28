const express = require('express');
const {AccessToken} = require('livekit-server-sdk');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.post('/get-token', async (req, res) => {
  const { roomName, userName } = req.body;

  if (!roomName || !userName) {
    return res.status(400).json({ error: 'roomName and userName required' });
  }

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY || "API4dsCuLM7s2ML" ,
    process.env.LIVEKIT_API_SECRET || "dB4k6wdI7NWpk6EqaHxhCTZenYvsSMeLmjJOYtann5a",
    { identity: userName }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
  });

  res.json({ token: await token.toJwt() });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});