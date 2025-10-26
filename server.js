/**
 * Simple development server for LiveKit token generation
 * In production, implement this on your backend with proper security
 */

import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * Generate LiveKit access token
 * POST /api/livekit/token
 * Body: { roomName: string, participantName: string }
 */
app.post('/api/livekit/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: 'Missing required fields: roomName, participantName',
      });
    }

    const apiKey = process.env.VITE_LIVEKIT_API_KEY;
    const apiSecret = process.env.VITE_LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        error: 'LiveKit credentials not configured',
      });
    }

    // Create access token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    res.json({ token: jwt });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`LiveKit token server running on http://localhost:${PORT}`);
  console.log(`Token endpoint: http://localhost:${PORT}/api/livekit/token`);
});
