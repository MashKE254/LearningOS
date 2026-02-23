/**
 * EduForge Unified AI Service
 *
 * Provides a unified interface for AI operations that works with:
 * - Ollama (local development)
 * - Anthropic Claude (production)
 * - OpenAI (fallback/embeddings)
 *
 * The service automatically routes to the configured provider.
 */

import { OllamaClient, OllamaMessage } from './ollama-client';
import { ModelRouter, MODELS, QueryComplexity } from './model-router';

export type AIProvider = 'ollama' | 'anthropic' | 'openai';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  context?: {
    sessionMode?: string;
    studentProfile?: {
      learningStyle?: string;
      specialNeeds?: string[];
      masteryLevel?: number;
    };
  };
}

export interface AICompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  complexity?: QueryComplexity;
}

export interface AIServiceConfig {
  provider: AIProvider;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  anthropicApiKey?: string;
}

// EduForge-specific system prompts
export const SYSTEM_PROMPTS = {
  TUTOR: `You are EduForge AI, a patient and encouraging educational tutor. Your role is to:

1. Use the Socratic method - guide students to discover answers rather than giving them directly
2. Break complex concepts into smaller, manageable pieces
3. Provide examples from everyday life to make concepts relatable
4. Celebrate progress and maintain an encouraging tone
5. Identify and gently correct misconceptions
6. Adapt explanations to the student's demonstrated level
7. Ask probing questions to check understanding

When a student is struggling:
- Acknowledge their effort
- Simplify the explanation
- Use analogies and visual descriptions
- Break the problem into smaller steps

Format your responses with clear structure using markdown when helpful.`,

  DEBUG: `You are EduForge AI in Debug Mode. Your role is to help students understand and fix their misconceptions through a structured 4-step process:

1. IDENTIFY: First, clearly state what the misconception is
2. EXPLAIN: Explain why this is a common mistake and what the correct understanding is
3. CONTRAST: Show a side-by-side comparison of wrong vs correct thinking
4. VERIFY: Ask a follow-up question to check understanding

Always be encouraging - misconceptions are learning opportunities, not failures.
Use concrete examples and avoid abstract explanations.`,

  PRACTICE: `You are EduForge AI in Practice Mode. Your role is to:

1. Present problems appropriate to the student's level
2. Provide hints when requested (progressive hints that don't give away the answer)
3. Check work and provide detailed feedback
4. Explain errors without giving the full solution
5. Offer similar problems for additional practice

Progress from easier to harder problems based on student performance.
Track patterns in errors to identify areas needing review.`,

  EXAM: `You are EduForge AI in Exam Prep Mode. Your role is to:

1. Help students prepare for specific exams (mention exam board if known)
2. Practice exam-style questions with proper time constraints
3. Teach exam techniques and mark scheme requirements
4. Identify high-yield topics to prioritize
5. Build confidence through structured revision

Focus on:
- Command words (describe, explain, evaluate, analyse)
- Mark scheme patterns
- Time management strategies
- Common pitfalls in exams`,

  REVIEW: `You are EduForge AI in Review Mode. Your role is to:

1. Help students review previously learned material using spaced repetition
2. Focus on concepts that are due for review based on forgetting curve
3. Reinforce connections between related concepts
4. Identify areas that need more practice
5. Celebrate retained knowledge

Keep reviews efficient - focus on retrieval practice over re-reading.`,

  COURSE_GENERATOR: `You are EduForge AI Course Generator. Given uploaded educational material, create a comprehensive course structure including:

1. Learning objectives aligned to curriculum standards
2. Module breakdown with lessons, activities, and assessments
3. Practice problems with worked examples
4. Key vocabulary and definitions
5. Common misconceptions to address

Format output as structured JSON that can be parsed programmatically.`,

  IEP_GENERATOR: `You are EduForge AI IEP Document Generator. Based on student learning data, create comprehensive IEP/504 documentation including:

1. Present levels of academic performance
2. Measurable annual goals
3. Accommodations and modifications
4. Progress monitoring methods
5. Parent-friendly summaries

Be specific, measurable, and action-oriented. Use professional educational terminology while keeping parent summaries accessible.`,
};

export class AIService {
  private provider: AIProvider;
  private ollamaClient: OllamaClient | null = null;
  private anthropicRouter: ModelRouter | null = null;

  constructor(config?: Partial<AIServiceConfig>) {
    // Determine provider from config or environment
    this.provider = config?.provider ||
      (process.env.AI_PROVIDER as AIProvider) ||
      'ollama';

    // Initialize appropriate client
    if (this.provider === 'ollama') {
      this.ollamaClient = new OllamaClient({
        baseUrl: config?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL,
        model: config?.ollamaModel || process.env.OLLAMA_MODEL,
      });
    } else if (this.provider === 'anthropic') {
      this.anthropicRouter = new ModelRouter(config?.anthropicApiKey);
    }
  }

  /**
   * Check if the AI service is available and ready
   */
  async isReady(): Promise<{ ready: boolean; provider: AIProvider; details: string }> {
    if (this.provider === 'ollama' && this.ollamaClient) {
      const health = await this.ollamaClient.healthCheck();
      return {
        ready: health.ok,
        provider: 'ollama',
        details: health.ok
          ? `Connected to Ollama with models: ${health.models.join(', ')}`
          : `Ollama not available: ${health.error}`,
      };
    }

    if (this.provider === 'anthropic') {
      return {
        ready: !!process.env.ANTHROPIC_API_KEY,
        provider: 'anthropic',
        details: process.env.ANTHROPIC_API_KEY
          ? 'Anthropic API key configured'
          : 'Missing ANTHROPIC_API_KEY',
      };
    }

    return {
      ready: false,
      provider: this.provider,
      details: `Unknown provider: ${this.provider}`,
    };
  }

  /**
   * Complete a chat conversation
   */
  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    if (this.provider === 'ollama' && this.ollamaClient) {
      return this.completeWithOllama(options);
    }

    if (this.provider === 'anthropic' && this.anthropicRouter) {
      return this.completeWithAnthropic(options);
    }

    throw new Error(`Provider ${this.provider} not initialized`);
  }

  private async completeWithOllama(options: AICompletionOptions): Promise<AICompletionResult> {
    const ollamaMessages: OllamaMessage[] = options.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.ollamaClient!.chat({
      messages: ollamaMessages,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });

    return {
      content: response.message.content,
      provider: 'ollama',
      model: response.model,
      usage: {
        inputTokens: response.prompt_eval_count || 0,
        outputTokens: response.eval_count || 0,
      },
    };
  }

  private async completeWithAnthropic(options: AICompletionOptions): Promise<AICompletionResult> {
    // Get the last user message for classification
    const lastUserMessage = [...options.messages].reverse().find(m => m.role === 'user');
    const query = lastUserMessage?.content || '';

    const result = await this.anthropicRouter!.route(
      query,
      options.systemPrompt || SYSTEM_PROMPTS.TUTOR,
      {
        context: {
          sessionMode: options.context?.sessionMode,
          studentProfile: options.context?.studentProfile,
          conversationHistory: options.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      }
    );

    return {
      content: result.response,
      provider: 'anthropic',
      model: result.modelUsed,
      usage: result.usage,
      complexity: result.complexity,
    };
  }

  /**
   * Stream a chat completion (returns async iterator)
   */
  async *stream(options: AICompletionOptions): AsyncGenerator<string> {
    if (this.provider === 'ollama' && this.ollamaClient) {
      const ollamaMessages: OllamaMessage[] = options.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      for await (const chunk of this.ollamaClient.chatStream({
        messages: ollamaMessages,
        systemPrompt: options.systemPrompt,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      })) {
        yield chunk.message.content;
      }
    } else {
      // For non-streaming providers, yield the full response
      const result = await this.complete(options);
      yield result.content;
    }
  }

  /**
   * Generate course content from uploaded material
   */
  async generateCourse(
    materialContent: string,
    materialType: string,
    subject?: string
  ): Promise<{
    title: string;
    description: string;
    learningObjectives: string[];
    modules: Array<{
      title: string;
      type: 'lesson' | 'practice' | 'assessment' | 'activity';
      content: string;
      duration: number;
    }>;
    questions: Array<{
      question: string;
      type: 'multiple_choice' | 'short_answer' | 'long_answer';
      options?: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  }> {
    const prompt = `Analyze the following educational material and create a comprehensive course structure.

Material Type: ${materialType}
Subject: ${subject || 'General'}

Material Content:
---
${materialContent}
---

Create a course with:
1. A clear title and description
2. 3-5 learning objectives
3. 3-5 modules (mix of lessons, practice, and assessments)
4. 5-10 assessment questions with answers and explanations

Respond with valid JSON in this exact format:
{
  "title": "Course Title",
  "description": "Course description",
  "learningObjectives": ["Objective 1", "Objective 2"],
  "modules": [
    {
      "title": "Module Title",
      "type": "lesson",
      "content": "Module content...",
      "duration": 15
    }
  ],
  "questions": [
    {
      "question": "Question text?",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why A is correct..."
    }
  ]
}`;

    const result = await this.complete({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: SYSTEM_PROMPTS.COURSE_GENERATOR,
      temperature: 0.7,
      maxTokens: 4096,
    });

    // Parse JSON from response
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parsing fails, create a structured response
    }

    // Return a basic structure if parsing fails
    return {
      title: 'Generated Course',
      description: 'Course generated from uploaded material',
      learningObjectives: ['Understand the core concepts'],
      modules: [{
        title: 'Introduction',
        type: 'lesson',
        content: result.content,
        duration: 30,
      }],
      questions: [],
    };
  }

  /**
   * Generate IEP document from student data
   */
  async generateIEPDocument(studentData: {
    name: string;
    grade: number;
    specialNeeds: string[];
    masteryData: Array<{ concept: string; mastery: number }>;
    misconceptions: Array<{ concept: string; description: string; occurrences: number }>;
    learningStyle?: string;
  }): Promise<{
    presentLevels: string;
    goals: Array<{ goal: string; measurementMethod: string; timeline: string }>;
    accommodations: string[];
    interventions: string[];
    parentSummary: string;
  }> {
    const prompt = `Generate an IEP/504 document for the following student:

Student Name: ${studentData.name}
Grade Level: ${studentData.grade}
Special Needs: ${studentData.specialNeeds.join(', ')}
Learning Style: ${studentData.learningStyle || 'Visual/Kinesthetic'}

Mastery Data:
${studentData.masteryData.map(m => `- ${m.concept}: ${Math.round(m.mastery * 100)}%`).join('\n')}

Known Misconceptions:
${studentData.misconceptions.map(m => `- ${m.concept}: ${m.description} (occurred ${m.occurrences} times)`).join('\n')}

Generate a comprehensive IEP document with:
1. Present Levels of Academic Performance
2. 3-5 Measurable Annual Goals
3. Recommended Accommodations
4. Intervention Strategies
5. A parent-friendly summary

Respond with valid JSON in this format:
{
  "presentLevels": "Description of current performance...",
  "goals": [
    {
      "goal": "Goal description",
      "measurementMethod": "How progress will be measured",
      "timeline": "When to achieve"
    }
  ],
  "accommodations": ["Accommodation 1", "Accommodation 2"],
  "interventions": ["Intervention 1", "Intervention 2"],
  "parentSummary": "Plain language summary for parents..."
}`;

    const result = await this.complete({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: SYSTEM_PROMPTS.IEP_GENERATOR,
      temperature: 0.6,
      maxTokens: 3000,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Parsing failed
    }

    return {
      presentLevels: result.content,
      goals: [{ goal: 'Improve understanding', measurementMethod: 'Assessment scores', timeline: 'End of semester' }],
      accommodations: ['Extended time on tests', 'Preferential seating'],
      interventions: ['Small group instruction', 'Visual aids'],
      parentSummary: 'Please contact the school for detailed information.',
    };
  }

  /**
   * Generate study materials from uploaded content
   */
  async generateStudyMaterials(content: string, types: string[]): Promise<{
    flashcards: Array<{ front: string; back: string }>;
    summary: string;
    keyTerms: Array<{ term: string; definition: string }>;
    practiceQuestions: Array<{ question: string; answer: string }>;
  }> {
    const prompt = `Create study materials from the following content:

${content}

Generate the following types of study materials: ${types.join(', ')}

Respond with valid JSON:
{
  "flashcards": [{"front": "Term/Question", "back": "Definition/Answer"}],
  "summary": "Concise summary of main points...",
  "keyTerms": [{"term": "Term", "definition": "Definition"}],
  "practiceQuestions": [{"question": "Q?", "answer": "A"}]
}`;

    const result = await this.complete({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: 'You are an educational content creator. Create clear, accurate study materials.',
      temperature: 0.7,
      maxTokens: 3000,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Parsing failed
    }

    return {
      flashcards: [{ front: 'Key concept', back: 'Definition from content' }],
      summary: result.content.substring(0, 500),
      keyTerms: [],
      practiceQuestions: [],
    };
  }

  /**
   * Get the current provider
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Get current model being used
   */
  getCurrentModel(): string {
    if (this.provider === 'ollama' && this.ollamaClient) {
      return this.ollamaClient.getConfig().model;
    }
    return MODELS.SONNET;
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(config?: Partial<AIServiceConfig>): AIService {
  if (!aiServiceInstance || config) {
    aiServiceInstance = new AIService(config);
  }
  return aiServiceInstance;
}

export function resetAIService(): void {
  aiServiceInstance = null;
}
