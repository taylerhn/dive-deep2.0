export interface LiveKitConfig {
  url: string;
  token: string;
}

export interface Participant {
  identity: string;
  name: string;
  isSpeaking: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface TranscriptSegment {
  participantId: string;
  participantName: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface ConversationContext {
  transcript: TranscriptSegment[];
  currentVibe: string;
  askedQuestions: string[];
  conversationDuration: number;
  participantCount: number;
}
