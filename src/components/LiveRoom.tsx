import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  SkipForward, 
  Shuffle, 
  Copy,
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestionCard } from './QuestionCard';
import { questions } from '../data/questions';

type Vibe = 'fun' | 'thoughtful' | 'deep' | 'mixed';

interface LiveRoomProps {
  vibe: Vibe;
  roomCode: string;
  onEndSession: (data: any) => void;
}

interface Participant {
  id: number;
  name: string;
  speaking: boolean;
}

interface TranscriptLine {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
}

export function LiveRoom({ vibe, roomCode, onEndSession }: LiveRoomProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [participants] = useState<Participant[]>([
    { id: 1, name: 'You', speaking: false },
    { id: 2, name: 'Alex', speaking: false },
  ]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);

  const vibeColors = {
    fun: { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-400' },
    thoughtful: { bg: 'from-blue-400 to-cyan-500', text: 'text-blue-400' },
    deep: { bg: 'from-pink-400 to-rose-500', text: 'text-pink-400' },
    mixed: { bg: 'from-purple-400 to-indigo-500', text: 'text-purple-400' },
  };

  // Simulate AI listening and generating questions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && !showQuestion) {
        triggerNewQuestion();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [showQuestion]);

  // Simulate transcript updates
  useEffect(() => {
    const mockTranscripts = [
      { speaker: 'You', text: "I've always wanted to travel to Japan..." },
      { speaker: 'Alex', text: "Oh really? What draws you to it?" },
      { speaker: 'You', text: "The culture, the food, and honestly the sense of calm I've seen." },
      { speaker: 'Alex', text: "I feel that. I went there last year and it completely changed my perspective on mindfulness." },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockTranscripts.length) {
        setTranscript(prev => [
          ...prev,
          {
            id: Date.now(),
            speaker: mockTranscripts[index].speaker,
            text: mockTranscripts[index].text,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }
        ]);
        index++;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const triggerNewQuestion = () => {
    setIsListening(true);
    setTimeout(() => {
      const vibeQuestions = vibe === 'mixed' 
        ? [...questions.fun, ...questions.thoughtful, ...questions.deep]
        : questions[vibe];
      
      const randomQuestion = vibeQuestions[Math.floor(Math.random() * vibeQuestions.length)];
      setCurrentQuestion(randomQuestion);
      setShowQuestion(true);
      setIsListening(false);
      setQuestionsAsked(prev => prev + 1);
    }, 2000);
  };

  const handleSkipQuestion = () => {
    setShowQuestion(false);
    setCurrentQuestion(null);
  };

  const handleAnswerQuestion = () => {
    setShowQuestion(false);
    setTimeout(() => setCurrentQuestion(null), 300);
  };

  const handleVibeShift = () => {
    setShowQuestion(false);
    setTimeout(() => triggerNewQuestion(), 500);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleEndSession = () => {
    const sessionData = {
      duration: '12 minutes',
      vibeBreakdown: { deep: 40, fun: 30, thoughtful: 30 },
      keyThemes: ['trust', 'childhood', 'travel'],
      questionsAnswered: questionsAsked,
      topQuestions: [
        "What's a place that changed your perspective?",
        "When do you feel most yourself?",
        "What do you need to hear right now?"
      ]
    };
    onEndSession(sessionData);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={`bg-gradient-to-r ${vibeColors[vibe].bg} text-white border-0`}>
            {vibe.charAt(0).toUpperCase() + vibe.slice(1)} Vibe
          </Badge>
          
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <span className="text-sm">Room: {roomCode}</span>
            <Copy className="h-3 w-3" />
            {copiedCode && <span className="text-xs text-green-400">Copied!</span>}
          </button>
        </div>

        <Button
          onClick={handleEndSession}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          End Session
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Grid */}
          <div className="grid grid-cols-2 gap-4">
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Placeholder video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl">
                    {participant.name.charAt(0)}
                  </div>
                </div>
                
                {/* Name badge */}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/50 text-white border-0">
                    {participant.name}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={micEnabled ? "default" : "destructive"}
                size="lg"
                onClick={() => setMicEnabled(!micEnabled)}
                className="rounded-full w-14 h-14"
              >
                {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className="rounded-full w-14 h-14"
              >
                {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <div className="flex-1" />

              <Button
                variant="outline"
                onClick={handleVibeShift}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Vibe Shift
              </Button>

              <Button
                variant="outline"
                onClick={triggerNewQuestion}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={showQuestion}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Next Question
              </Button>
            </div>
          </Card>

          {/* AI Listening Indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-2 text-purple-300"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <span>AI is listening and crafting the next question...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Transcript */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700 h-full">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-white">Live Transcript</h3>
              <p className="text-sm text-slate-400">Real-time conversation</p>
            </div>
            
            <ScrollArea className="h-[calc(100vh-300px)] p-4">
              <div className="space-y-4">
                {transcript.map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${vibeColors[vibe].text}`}>
                        {line.speaker}
                      </span>
                      <span className="text-xs text-slate-500">{line.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-300">{line.text}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Question Card Overlay */}
      <AnimatePresence>
        {showQuestion && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            vibe={vibe}
            onAnswer={handleAnswerQuestion}
            onSkip={handleSkipQuestion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
