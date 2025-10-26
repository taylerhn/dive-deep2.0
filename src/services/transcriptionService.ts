import type { TranscriptSegment } from '../types/livekit';

export class TranscriptionService {
  private recognition: any = null;
  private isListening = false;
  private currentParticipantId: string = '';
  private currentParticipantName: string = '';
  private onTranscriptCallback: ((segment: TranscriptSegment) => void) | null = null;

  /**
   * Initialize Web Speech API for transcription
   */
  initialize(
    participantId: string,
    participantName: string,
    onTranscript: (segment: TranscriptSegment) => void
  ): void {
    this.currentParticipantId = participantId;
    this.currentParticipantName = participantName;
    this.onTranscriptCallback = onTranscript;

    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback({
          participantId: this.currentParticipantId,
          participantName: this.currentParticipantName,
          text: transcript,
          timestamp: Date.now(),
          isFinal,
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart if no speech detected
        this.restart();
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if we're still supposed to be listening
        this.recognition.start();
      }
    };
  }

  /**
   * Start listening for speech
   */
  start(): void {
    if (!this.recognition) {
      console.warn('Speech recognition not initialized');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  /**
   * Stop listening for speech
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    this.isListening = false;
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  /**
   * Restart speech recognition
   */
  private restart(): void {
    if (!this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      setTimeout(() => {
        if (this.isListening) {
          this.recognition.start();
        }
      }, 100);
    } catch (error) {
      console.error('Error restarting speech recognition:', error);
    }
  }

  /**
   * Alternative: Use OpenAI Whisper API for more accurate transcription
   * This requires sending audio chunks to the API
   */
  async transcribeWithWhisper(audioBlob: Blob): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const data = await response.json();
    return data.text;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    this.recognition = null;
    this.onTranscriptCallback = null;
  }
}

export const transcriptionService = new TranscriptionService();
