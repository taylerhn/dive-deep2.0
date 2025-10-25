import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle, SkipForward } from 'lucide-react';

type Vibe = 'fun' | 'thoughtful' | 'deep' | 'mixed';

interface QuestionCardProps {
  question: string;
  vibe: Vibe;
  onAnswer: () => void;
  onSkip: () => void;
}

export function QuestionCard({ question, vibe, onAnswer, onSkip }: QuestionCardProps) {
  const vibeColors = {
    fun: 'from-yellow-400 to-orange-500',
    thoughtful: 'from-blue-400 to-cyan-500',
    deep: 'from-pink-400 to-rose-500',
    mixed: 'from-purple-400 to-indigo-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onAnswer}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className={`max-w-2xl w-full bg-gradient-to-br ${vibeColors[vibe]} p-8 border-0 shadow-2xl`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="text-white/80 text-sm uppercase tracking-wider">
                Question from AI
              </div>
              <h2 className="text-white text-3xl leading-tight">
                {question}
              </h2>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onAnswer}
                size="lg"
                className="flex-1 bg-white text-slate-900 hover:bg-white/90"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Let's Talk About It
              </Button>
              
              <Button
                onClick={onSkip}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
