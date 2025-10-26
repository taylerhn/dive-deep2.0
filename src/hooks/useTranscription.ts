import { useState, useEffect, useCallback, useRef } from 'react';
import { transcriptionService } from '../services/transcriptionService';
import type { TranscriptSegment } from '../types/livekit';

interface UseTranscriptionOptions {
  participantId: string;
  participantName: string;
  enabled?: boolean;
}

export function useTranscription(options: UseTranscriptionOptions) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const lastSegmentRef = useRef<string>('');

  const handleTranscript = useCallback(
    (segment: TranscriptSegment) => {
      setTranscript((prev) => {
        // If this is an interim result, replace the last interim segment
        if (!segment.isFinal && prev.length > 0 && !prev[prev.length - 1].isFinal) {
          const updated = [...prev];
          updated[updated.length - 1] = segment;
          return updated;
        }

        // If this is a final result, add it (unless it's a duplicate)
        if (segment.isFinal && segment.text !== lastSegmentRef.current) {
          lastSegmentRef.current = segment.text;
          return [...prev, segment];
        }

        // For first interim result, just add it
        if (!segment.isFinal) {
          return [...prev, segment];
        }

        return prev;
      });
    },
    []
  );

  const startListening = useCallback(() => {
    if (isListening) return;

    transcriptionService.initialize(
      options.participantId,
      options.participantName,
      handleTranscript
    );
    transcriptionService.start();
    setIsListening(true);
  }, [isListening, options.participantId, options.participantName, handleTranscript]);

  const stopListening = useCallback(() => {
    if (!isListening) return;

    transcriptionService.stop();
    setIsListening(false);
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    lastSegmentRef.current = '';
  }, []);

  const getFullTranscript = useCallback((): string => {
    return transcript
      .filter((segment) => segment.isFinal)
      .map((segment) => `${segment.participantName}: ${segment.text}`)
      .join('\n');
  }, [transcript]);

  const getRecentTranscript = useCallback((minutes: number = 5): string => {
    const cutoffTime = Date.now() - minutes * 60 * 1000;
    return transcript
      .filter((segment) => segment.isFinal && segment.timestamp > cutoffTime)
      .map((segment) => `${segment.participantName}: ${segment.text}`)
      .join('\n');
  }, [transcript]);

  // Auto-start if enabled
  useEffect(() => {
    if (options.enabled && !isListening) {
      startListening();
    } else if (!options.enabled && isListening) {
      stopListening();
    }
  }, [options.enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      transcriptionService.cleanup();
    };
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    getFullTranscript,
    getRecentTranscript,
  };
}
