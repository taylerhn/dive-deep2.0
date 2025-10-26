import { useState, useEffect, useCallback, useRef } from 'react';
import { aiService } from '../services/aiService';
import type { GeneratedQuestion, ConversationAnalysis } from '../types/ai';

interface UseAIQuestionsOptions {
  vibe: string;
  getTranscript: () => string;
  enabled?: boolean;
  checkInterval?: number; // How often to check if we should ask a question (ms)
}

export function useAIQuestions(options: UseAIQuestionsOptions) {
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);
  const [conversationAnalysis, setConversationAnalysis] =
    useState<ConversationAnalysis | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastQuestionTimeRef = useRef<number>(0);
  const lastAnalysisTimeRef = useRef<number>(0);

  const analyzeConversation = useCallback(async () => {
    if (isAnalyzing) return;

    const transcript = options.getTranscript();
    if (!transcript || transcript.length < 100) {
      // Not enough conversation yet
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await aiService.analyzeConversation(
        transcript,
        options.vibe,
        askedQuestions
      );
      setConversationAnalysis(analysis);
      lastAnalysisTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [options.vibe, options.getTranscript, askedQuestions, isAnalyzing]);

  const generateQuestion = useCallback(async () => {
    if (isGenerating || !conversationAnalysis) return;

    setIsGenerating(true);
    try {
      const question = await aiService.generateQuestion({
        vibe: options.vibe,
        conversationAnalysis,
        recentTranscript: options.getTranscript(),
        askedQuestions,
      });

      setCurrentQuestion(question);
      setAskedQuestions((prev) => [...prev, question.question]);
      lastQuestionTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    options.vibe,
    options.getTranscript,
    conversationAnalysis,
    askedQuestions,
    isGenerating,
  ]);

  const checkAndAskQuestion = useCallback(async () => {
    if (!options.enabled || isGenerating || currentQuestion) return;

    const transcript = options.getTranscript();
    const now = Date.now();

    // Analyze conversation every 30 seconds if needed
    if (now - lastAnalysisTimeRef.current > 30000) {
      await analyzeConversation();
    }

    // Check if it's a good time to ask a question
    const shouldAsk = await aiService.shouldAskQuestion(
      transcript,
      lastQuestionTimeRef.current,
      now
    );

    if (shouldAsk && conversationAnalysis) {
      await generateQuestion();
    }
  }, [
    options.enabled,
    options.getTranscript,
    currentQuestion,
    isGenerating,
    conversationAnalysis,
    analyzeConversation,
    generateQuestion,
  ]);

  const dismissQuestion = useCallback(() => {
    setCurrentQuestion(null);
  }, []);

  const skipQuestion = useCallback(() => {
    setCurrentQuestion(null);
    // Don't count skipped questions in the answered count
  }, []);

  const forceNextQuestion = useCallback(async () => {
    if (!conversationAnalysis) {
      await analyzeConversation();
    }
    await generateQuestion();
  }, [conversationAnalysis, analyzeConversation, generateQuestion]);

  // Periodic check for asking questions
  useEffect(() => {
    if (!options.enabled) return;

    const interval = setInterval(
      checkAndAskQuestion,
      options.checkInterval || 15000 // Check every 15 seconds by default
    );

    return () => clearInterval(interval);
  }, [options.enabled, options.checkInterval, checkAndAskQuestion]);

  // Initial analysis after some conversation
  useEffect(() => {
    if (options.enabled && !conversationAnalysis) {
      const timeout = setTimeout(() => {
        analyzeConversation();
      }, 30000); // Analyze after 30 seconds

      return () => clearTimeout(timeout);
    }
  }, [options.enabled, conversationAnalysis, analyzeConversation]);

  return {
    currentQuestion,
    conversationAnalysis,
    askedQuestions,
    isAnalyzing,
    isGenerating,
    dismissQuestion,
    skipQuestion,
    forceNextQuestion,
    analyzeConversation,
  };
}
