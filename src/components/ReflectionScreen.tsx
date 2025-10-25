import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Download, Home, RefreshCw, Share2, Heart, Clock, MessageSquare } from 'lucide-react';

interface SessionData {
  duration: string;
  vibeBreakdown: { deep: number; fun: number; thoughtful: number };
  keyThemes: string[];
  questionsAnswered: number;
  topQuestions: string[];
}

interface ReflectionScreenProps {
  sessionData: SessionData;
  onBackToHome: () => void;
}

export function ReflectionScreen({ sessionData, onBackToHome }: ReflectionScreenProps) {
  const vibeColors = [
    { name: 'Deep', percentage: sessionData.vibeBreakdown.deep, color: 'bg-pink-400' },
    { name: 'Fun', percentage: sessionData.vibeBreakdown.fun, color: 'bg-yellow-400' },
    { name: 'Thoughtful', percentage: sessionData.vibeBreakdown.thoughtful, color: 'bg-blue-400' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 mb-2"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-white text-5xl">
            Beautiful Session
          </h1>
          <p className="text-purple-200 text-lg">
            Here's what happened in your conversation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 border-white/20 p-6 text-center backdrop-blur-sm">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl text-white mb-1">{sessionData.duration}</div>
              <div className="text-sm text-purple-200">Time Together</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 p-6 text-center backdrop-blur-sm">
              <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl text-white mb-1">{sessionData.questionsAnswered}</div>
              <div className="text-sm text-purple-200">Questions Explored</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/10 border-white/20 p-6 text-center backdrop-blur-sm">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <div className="text-3xl text-white mb-1">{sessionData.keyThemes.length}</div>
              <div className="text-sm text-purple-200">Key Themes</div>
            </Card>
          </motion.div>
        </div>

        {/* Vibe Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/10 border-white/20 p-6 backdrop-blur-sm">
            <h3 className="text-white mb-4">Your Conversation Vibe</h3>
            
            {/* Vibe Bar */}
            <div className="h-8 rounded-full overflow-hidden flex mb-4">
              {vibeColors.map((vibe, index) => (
                <motion.div
                  key={vibe.name}
                  initial={{ width: 0 }}
                  animate={{ width: `${vibe.percentage}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                  className={`${vibe.color} flex items-center justify-center text-white text-xs`}
                >
                  {vibe.percentage > 15 && `${vibe.percentage}%`}
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {vibeColors.map((vibe) => (
                <div key={vibe.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${vibe.color}`} />
                  <span className="text-sm text-purple-200">
                    {vibe.name} ({vibe.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Key Themes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-white/10 border-white/20 p-6 backdrop-blur-sm">
            <h3 className="text-white mb-4">Key Themes You Explored</h3>
            <div className="flex flex-wrap gap-2">
              {sessionData.keyThemes.map((theme) => (
                <Badge
                  key={theme}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2"
                >
                  {theme}
                </Badge>
              ))}
            </div>
            <p className="text-purple-200 text-sm mt-4">
              Strong emotional themes - you went deep! ✨
            </p>
          </Card>
        </motion.div>

        {/* Top Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="bg-white/10 border-white/20 p-6 backdrop-blur-sm">
            <h3 className="text-white mb-4">Memorable Questions</h3>
            <div className="space-y-3">
              {sessionData.topQuestions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-purple-100 text-sm">{question}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={onBackToHome}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Start New Session
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <Download className="mr-2 h-5 w-5" />
            Save
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
