import OpenAI from 'openai';
import type {
  ConversationAnalysis,
  QuestionContext,
  GeneratedQuestion,
  ConnectionDomain,
} from '../types/ai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

// Connection research context for AI
const CONNECTION_RESEARCH = `
Based on psychology research on interpersonal processes and connection:

CORE THEORIES:
1. Social Penetration Theory (SPT): Relationships deepen through increasing breadth and depth of self-disclosure over time
2. Uncertainty Reduction Theory (URT): People seek information about others to reduce uncertainty and make interaction predictable
3. Strong social connections affect both psychological and physiological health outcomes

KEY DOMAINS FOR CONNECTION:
1. VALUES/BELIEFS: Understanding what matters to someone, their principles, passions
2. PERSONAL HISTORY/IDENTITY: Past experiences, upbringing, cultural background
3. ASPIRATIONS/GOALS/MOTIVATIONS: Future direction, what drives them, meaning
4. EMOTIONS/INNER WORLD: Feelings, fears, joys, vulnerabilities
5. RELATIONAL STYLE/PREFERENCES: Communication style, boundaries, how they relate
6. CURRENT SITUATION/CONTEXT: What's happening now, current challenges/joys

BEST PRACTICES:
- Use open-ended questions to invite stories
- Practice active listening and reflect back
- Encourage mutual sharing (two-way disclosure)
- Recognize depth takes time - start superficial, move deeper
- Be mindful of readiness - trust and safety matter
- Pay attention to non-verbal cues
`;

export class AIService {
  /**
   * Analyzes the conversation to understand which connection domains have been explored
   */
  async analyzeConversation(
    transcript: string,
    vibe: string,
    askedQuestions: string[]
  ): Promise<ConversationAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert in interpersonal psychology and building deep human connections.

${CONNECTION_RESEARCH}

Analyze conversations to identify which connection domains have been explored and suggest next areas to deepen the relationship.`,
          },
          {
            role: 'user',
            content: `Analyze this conversation transcript and identify which connection domains have been explored.

Current Vibe: ${vibe}
Transcript: ${transcript}
Previously Asked Questions: ${askedQuestions.join(', ')}

Return a JSON object with:
- exploredDomains: array of domains that have been discussed (values_beliefs, personal_history, aspirations, emotions, relational_style, current_situation)
- unexploredDomains: array of domains not yet explored
- connectionDepth: number 0-10 indicating how deep the connection is
- suggestedDomain: the next domain to explore for deepening connection
- reasoning: brief explanation of your analysis

Respond ONLY with valid JSON.`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content) as ConversationAnalysis;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      // Fallback analysis
      return {
        exploredDomains: [],
        unexploredDomains: [
          'values_beliefs',
          'personal_history',
          'aspirations',
          'emotions',
          'relational_style',
          'current_situation',
        ],
        connectionDepth: 1,
        suggestedDomain: 'current_situation',
        reasoning: 'Starting with current situation as a comfortable entry point.',
      };
    }
  }

  /**
   * Generates a contextual question based on conversation analysis
   */
  async generateQuestion(context: QuestionContext): Promise<GeneratedQuestion> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert facilitator of deep human connection, based on "We're Not Really Strangers" principles.

${CONNECTION_RESEARCH}

Your role is to generate questions that:
1. Build on what's been discussed (continuity)
2. Deepen the conversation in unexplored domains
3. Match the vibe (fun, thoughtful, or deep)
4. Feel natural and timely
5. Encourage mutual vulnerability and self-disclosure
6. Are open-ended to invite stories

VIBE GUIDELINES:
- Fun: Light, playful, creative - but still meaningful
- Thoughtful: Intellectual, reflective, perspective-shifting
- Deep: Vulnerable, emotional, intimate
- Mixed: Balance of all three`,
          },
          {
            role: 'user',
            content: `Generate the next question for this conversation.

Context:
- Current Vibe: ${context.vibe}
- Connection Depth: ${context.conversationAnalysis.connectionDepth}/10
- Explored Domains: ${context.conversationAnalysis.exploredDomains.join(', ') || 'none yet'}
- Suggested Domain: ${context.conversationAnalysis.suggestedDomain}
- Reasoning: ${context.conversationAnalysis.reasoning}
- Recent Conversation: ${context.recentTranscript.slice(-500)}
- Previously Asked: ${context.askedQuestions.slice(-3).join(', ')}

Generate ONE question that:
1. Fits the ${context.vibe} vibe
2. Explores the ${context.conversationAnalysis.suggestedDomain} domain
3. Builds naturally on the recent conversation
4. Hasn't been asked before
5. Encourages deeper connection

Return JSON with:
- question: the question text
- domain: the connection domain it targets
- followUp: (optional) a gentle follow-up prompt if they go shallow
- reasoning: why this question fits the moment

Respond ONLY with valid JSON.`,
          },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content) as GeneratedQuestion;
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback to static questions based on vibe
      const fallbackQuestions = {
        fun: "What's something that made you laugh recently?",
        thoughtful: "What's an idea that's been on your mind lately?",
        deep: "What do you need to hear right now?",
        mixed: "What's been the best part of your week?",
      };

      return {
        question:
          fallbackQuestions[context.vibe as keyof typeof fallbackQuestions] ||
          fallbackQuestions.mixed,
        domain: 'current_situation' as ConnectionDomain,
        reasoning: 'Fallback question due to API error',
      };
    }
  }

  /**
   * Analyzes if it's a good moment to ask a question based on conversation flow
   */
  async shouldAskQuestion(
    recentTranscript: string,
    lastQuestionTime: number,
    currentTime: number
  ): Promise<boolean> {
    // Don't ask too frequently (at least 60 seconds between questions)
    if (currentTime - lastQuestionTime < 60000) {
      return false;
    }

    // Don't interrupt if there's been very recent conversation (last 5 seconds)
    const segments = recentTranscript.split('\n');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && currentTime - lastQuestionTime < 5000) {
      return false;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert facilitator. Determine if this is a good moment to introduce a new question, or if the conversation is flowing naturally and should continue uninterrupted.',
          },
          {
            role: 'user',
            content: `Recent conversation:
${recentTranscript.slice(-300)}

Is this a good moment to introduce a new question? Consider:
- Is the conversation flowing naturally? (if yes, don't interrupt)
- Has there been a natural pause or lull? (good time)
- Are they deep in a topic? (let them continue)
- Has the energy dropped? (good time for new question)

Reply with just "yes" or "no".`,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const answer = response.choices[0].message.content?.toLowerCase().trim();
      return answer === 'yes';
    } catch (error) {
      console.error('Error checking question timing:', error);
      // Conservative fallback - ask if enough time has passed
      return currentTime - lastQuestionTime > 120000; // 2 minutes
    }
  }

  /**
   * Generates session summary for reflection screen
   */
  async generateSessionSummary(
    transcript: string,
    vibe: string,
    duration: number,
    questionsAnswered: number
  ): Promise<{
    keyThemes: string[];
    insights: string;
    connectionDepth: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing conversations and identifying themes, insights, and connection depth.

${CONNECTION_RESEARCH}`,
          },
          {
            role: 'user',
            content: `Analyze this conversation and provide a summary.

Duration: ${duration} minutes
Vibe: ${vibe}
Questions Answered: ${questionsAnswered}
Full Transcript: ${transcript}

Return JSON with:
- keyThemes: array of 3-5 main themes discussed (short phrases)
- insights: 2-3 sentence summary of what made this conversation meaningful
- connectionDepth: 0-10 score of how deep the connection went

Respond ONLY with valid JSON.`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating session summary:', error);
      return {
        keyThemes: ['Shared experiences', 'Personal growth', 'Future aspirations'],
        insights:
          'You shared meaningful moments and learned more about each other. The conversation touched on both lighthearted and deeper topics.',
        connectionDepth: 5,
      };
    }
  }
}

export const aiService = new AIService();
