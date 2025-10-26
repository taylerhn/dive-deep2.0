# Dive Deep 2.0 - AI-Powered Connection Platform

An AI-integrated version of "We're Not Really Strangers" that uses real-time conversation analysis and psychological research to maximize human connection.

## Overview

Dive Deep 2.0 listens to your conversations in real-time and uses AI to ask thoughtful, contextual questions that deepen relationships. Built on research from Social Penetration Theory, Uncertainty Reduction Theory, and interpersonal psychology.

### Key Features

- **Real-time Video/Audio**: LiveKit integration for high-quality communication
- **Live Transcription**: Speech-to-text using Web Speech API (with Whisper API support)
- **AI Conversation Analysis**: Analyzes which connection domains have been explored
- **Intelligent Question Generation**: AI crafts contextual questions based on the conversation flow
- **Connection Research-Based**: Uses proven psychology research on building deep relationships
- **Four Vibes**: Fun, Thoughtful, Deep, and Mixed conversation modes

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Radix UI
- **Real-time Communication**: LiveKit
- **AI**: OpenAI GPT-4 (conversation analysis & question generation)
- **Speech Recognition**: Web Speech API / OpenAI Whisper
- **Backend**: Express.js (development token server)

## Prerequisites

1. **Node.js** 18+ and npm
2. **LiveKit Server** - Options:
   - [LiveKit Cloud](https://cloud.livekit.io) (recommended for quick start)
   - [Self-hosted LiveKit](https://docs.livekit.io/realtime/self-hosting/deployment/)
3. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd dive-deep2.0
npm install
```

### 2. Set Up LiveKit

#### Option A: LiveKit Cloud (Easiest)
1. Sign up at [cloud.livekit.io](https://cloud.livekit.io)
2. Create a new project
3. Get your WebSocket URL, API Key, and API Secret

#### Option B: Self-Hosted LiveKit
```bash
# Using Docker
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="your-api-key: your-api-secret" \
  livekit/livekit-server
```

### 3. Configure Environment Variables

Edit `.env` with your credentials:

```env
# LiveKit Configuration
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud  # Or ws://localhost:7880 for self-hosted
VITE_LIVEKIT_API_KEY=your-api-key
VITE_LIVEKIT_API_SECRET=your-api-secret

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Token Server (for development)
VITE_TOKEN_SERVER_URL=http://localhost:3001
```

### 4. Start the Application

```bash
# Start both the token server and the Vite dev server
npm start

# Or run them separately:
# Terminal 1: Token server
npm run server

# Terminal 2: Vite dev server
npm run dev
```

The app will be available at `http://localhost:3000`

## How It Works

### Connection Research Framework

The AI analyzes conversations across six key domains proven to build connection:

1. **Values/Beliefs**: What matters to someone, their principles
2. **Personal History/Identity**: Past experiences, cultural background
3. **Aspirations/Goals**: Future direction, what drives them
4. **Emotions/Inner World**: Feelings, vulnerabilities, fears, joys
5. **Relational Style**: Communication preferences, boundaries
6. **Current Situation**: What's happening now, current challenges

### AI Question Generation Flow

```
User speaks → Speech-to-Text → Conversation Analysis →
AI determines unexplored domains → Generates contextual question →
Question displayed at natural pause in conversation
```

### Features

#### 1. **Conversation Analysis**
- Analyzes recent transcript every 30 seconds
- Identifies which connection domains have been explored
- Calculates connection depth (0-10 scale)
- Suggests next domain to explore

#### 2. **Smart Question Timing**
- Waits for natural pauses (minimum 60s between questions)
- Avoids interrupting flowing conversation
- Detects conversation lulls as good moments to introduce questions

#### 3. **Contextual Questions**
- Questions build on what's been discussed
- Matched to the selected vibe (fun/thoughtful/deep)
- Never repeats previously asked questions
- Encourages mutual vulnerability and disclosure

#### 4. **Session Summary**
- AI-generated insights at the end
- Key themes identified
- Connection depth score
- Memorable questions highlighted

## Architecture

### Project Structure

```
dive-deep2.0/
├── src/
│   ├── components/
│   │   ├── LiveRoom.tsx         # Main conversation room
│   │   ├── HomeScreen.tsx       # Landing page
│   │   ├── ReflectionScreen.tsx # Post-session summary
│   │   └── QuestionCard.tsx     # Question overlay
│   ├── hooks/
│   │   ├── useLiveKit.ts        # LiveKit connection management
│   │   ├── useTranscription.ts  # Speech-to-text hook
│   │   └── useAIQuestions.ts    # AI question generation
│   ├── services/
│   │   ├── liveKitService.ts    # LiveKit API wrapper
│   │   ├── aiService.ts         # OpenAI integration
│   │   └── transcriptionService.ts # Speech recognition
│   ├── types/
│   │   ├── livekit.ts           # LiveKit types
│   │   └── ai.ts                # AI types
│   └── data/
│       └── questions.ts         # Fallback question bank
├── server.js                    # Development token server
└── .env                         # Configuration
```

### Key Services

#### `aiService.ts`
- `analyzeConversation()`: Analyzes which domains have been explored
- `generateQuestion()`: Creates contextual questions using GPT-4
- `shouldAskQuestion()`: Determines optimal timing
- `generateSessionSummary()`: Creates end-of-session insights

#### `liveKitService.ts`
- `generateToken()`: Creates LiveKit access tokens
- `connect()`: Connects to LiveKit room
- `setMicrophoneEnabled()`: Toggle mic
- `setCameraEnabled()`: Toggle camera

#### `transcriptionService.ts`
- `initialize()`: Sets up Web Speech API
- `start()`: Starts listening
- `transcribeWithWhisper()`: Alternative using OpenAI Whisper (more accurate)

### Custom Hooks

#### `useLiveKit(options)`
Manages LiveKit room connection and participant state.

```typescript
const {
  isConnected,
  participants,
  toggleMicrophone,
  toggleCamera
} = useLiveKit({
  roomName: 'room-code',
  participantName: 'User'
});
```

#### `useTranscription(options)`
Handles real-time speech-to-text transcription.

```typescript
const {
  transcript,
  isListening,
  getFullTranscript,
  getRecentTranscript
} = useTranscription({
  participantId: 'user-id',
  participantName: 'User',
  enabled: true
});
```

#### `useAIQuestions(options)`
Manages AI conversation analysis and question generation.

```typescript
const {
  currentQuestion,
  isAnalyzing,
  forceNextQuestion,
  conversationAnalysis
} = useAIQuestions({
  vibe: 'deep',
  getTranscript: getRecentTranscript,
  enabled: true
});
```

## Production Deployment

### Security Considerations

1. **Never expose API keys in frontend code**
   - Move token generation to a secure backend
   - Use environment variables only accessible server-side

2. **Implement proper authentication**
   - Add user authentication before room access
   - Validate room codes server-side

3. **Rate limiting**
   - Limit token generation requests
   - Throttle OpenAI API calls

### Backend Setup (Production)

Replace the development `server.js` with a production backend:

```typescript
// Example backend endpoint (Next.js API route)
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // Verify user is authenticated
  const user = await authenticateUser(req);

  const { roomName } = req.body;

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: user.id,
      name: user.name,
    }
  );

  token.addGrant({ room: roomName, roomJoin: true });

  res.json({ token: await token.toJwt() });
}
```

### Environment Variables (Production)

Move sensitive keys to server-side environment:

```env
# Server-side only
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
OPENAI_API_KEY=...

# Client-side (safe to expose)
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
VITE_API_BASE_URL=https://your-backend.com/api
```

### Build for Production

```bash
npm run build
# Output in /build directory
```

## Browser Compatibility

- **Web Speech API**: Chrome, Edge, Safari (with vendor prefix)
- **LiveKit**: All modern browsers with WebRTC support
- **Best experience**: Chrome/Edge on desktop

## Troubleshooting

### LiveKit Connection Issues

1. **Check LiveKit server is running**
   ```bash
   curl http://localhost:7880/health  # For self-hosted
   ```

2. **Verify credentials in `.env`**
   - URL format: `ws://` for local, `wss://` for cloud
   - Check API key/secret are correct

3. **Check token server**
   ```bash
   curl http://localhost:3001/health
   ```

### Transcription Not Working

1. **Grant microphone permissions** in browser
2. **Use HTTPS** (required for Web Speech API in production)
3. **Try Whisper API** for better accuracy:
   - Uncomment Whisper code in `transcriptionService.ts`
   - Add OpenAI API key to `.env`

### AI Questions Not Appearing

1. **Check OpenAI API key** is valid
2. **Monitor console** for API errors
3. **Ensure conversation is long enough** (minimum ~100 characters)
4. **Wait for natural pauses** (AI respects conversation flow)

## Development

### Adding New Connection Domains

Edit `src/types/ai.ts`:

```typescript
export type ConnectionDomain =
  | 'values_beliefs'
  | 'personal_history'
  // ... add your domain here
  | 'new_domain';
```

Update `src/services/aiService.ts` to include in analysis.

### Customizing Vibes

Edit `src/data/questions.ts` to add questions for each vibe:

```typescript
export const questions = {
  fun: ['Your fun question here'],
  thoughtful: ['Your thoughtful question here'],
  deep: ['Your deep question here']
};
```

### Adjusting AI Behavior

Edit prompts in `src/services/aiService.ts`:
- `analyzeConversation()`: Change analysis criteria
- `generateQuestion()`: Modify question generation style
- `shouldAskQuestion()`: Adjust timing logic

## Research References

The AI uses insights from:

- **Social Penetration Theory (SPT)**: Altman & Taylor (1973)
- **Uncertainty Reduction Theory (URT)**: Berger & Calabrese (1975)
- **Interpersonal Processes**: Meta-reviews on social connection and health outcomes

## Original Figma Design

This project is based on the original Figma design:
https://www.figma.com/design/tNNdrJ3JQpi158vcIwYZqj/Website-Design-for-Deeper-App

## License

[Your License Here]

## Contributing

[Your contribution guidelines]

---

Built with connection research, powered by AI.
