export type ConnectionDomain =
  | 'values_beliefs'
  | 'personal_history'
  | 'aspirations'
  | 'emotions'
  | 'relational_style'
  | 'current_situation';

export interface ConversationAnalysis {
  exploredDomains: ConnectionDomain[];
  unexploredDomains: ConnectionDomain[];
  connectionDepth: number; // 0-10 scale
  suggestedDomain: ConnectionDomain;
  reasoning: string;
}

export interface QuestionContext {
  vibe: string;
  conversationAnalysis: ConversationAnalysis;
  recentTranscript: string;
  askedQuestions: string[];
}

export interface GeneratedQuestion {
  question: string;
  domain: ConnectionDomain;
  followUp?: string;
  reasoning: string;
}
