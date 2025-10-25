import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { LiveRoom } from './components/LiveRoom';
import { ReflectionScreen } from './components/ReflectionScreen';

type Screen = 'home' | 'room' | 'reflection';
type Vibe = 'fun' | 'thoughtful' | 'deep' | 'mixed';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedVibe, setSelectedVibe] = useState<Vibe>('mixed');
  const [roomCode, setRoomCode] = useState<string>('');
  const [sessionData, setSessionData] = useState<any>(null);

  const handleStartRoom = (vibe: Vibe) => {
    setSelectedVibe(vibe);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setCurrentScreen('room');
  };

  const handleJoinRoom = (code: string, vibe: Vibe) => {
    setSelectedVibe(vibe);
    setRoomCode(code);
    setCurrentScreen('room');
  };

  const handleEndSession = (data: any) => {
    setSessionData(data);
    setCurrentScreen('reflection');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSessionData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentScreen === 'home' && (
        <HomeScreen 
          onStartRoom={handleStartRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
      
      {currentScreen === 'room' && (
        <LiveRoom 
          vibe={selectedVibe}
          roomCode={roomCode}
          onEndSession={handleEndSession}
        />
      )}
      
      {currentScreen === 'reflection' && (
        <ReflectionScreen 
          sessionData={sessionData}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}
