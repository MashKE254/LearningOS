/**
 * EduForge Socratic Teaching Engine
 * 
 * The core pedagogical AI that implements:
 * - Socratic questioning (never gives direct answers)
 * - Adaptive scaffolding based on student knowledge
 * - Misconception detection and repair
 * - Curriculum-aligned explanations
 * - Multi-language pedagogy
 */

import { ModelRouter } from './model-router';
import { RAGEngine, RetrievedChunk } from './rag-engine';
import { VerificationEngine, VerificationResult } from './verification-engine';
import { z } from 'zod';

// Student state for teaching context
export const StudentStateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  preferredLanguage: z.string().default('en'),
  targetLanguage: z.string().optional(), // For bilingual learning
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading_writing', 'mixed']).default('mixed'),
  specialNeeds: z.array(z.string()).default([]),
  currentMastery: z.number().min(0).max(1).default(0),
  misconceptions: z.array(z.object({
    concept: z.string(),
    description: z.string(),
    detectedAt: z.date(),
  })).default([]),
  enrolledCurriculum: z.object({
    id: z.string(),
    name: z.string(),
    examBoard: z.string(),
  }).optional(),
  currentTopic: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  emotionalState: z.enum(['confident', 'neutral', 'struggling', 'frustrated', 'crisis']).default('neutral'),
});

export type StudentState = z.infer<typeof StudentStateSchema>;

// Teaching response structure
export const TeachingResponseSchema = z.object({
  content: z.string(),
  responseType: z.enum([
    'socratic_question',    // Guiding question to prompt thinking
    'scaffolded_hint',      // Partial help without full answer
    'misconception_repair', // Addressing a specific error
    'encouragement',        // Emotional support
    'concept_bridge',       // Connecting to known concepts
    'direct_instruction',   // Only when appropriate (e.g., definitions)
    'verification_feedback',// Feedback on verified work
  ]),
  pedagogicalNotes: z.string().optional(), // Why this approach was chosen
  suggestedFollowUp: z.string().optional(),
  citations: z.array(z.string()).default([]),
  detectedMisconception: z.object({
    concept: z.string(),
    description: z.string(),
  }).optional(),
  languageUsed: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    academicTerms: z.array(z.object({
      term: z.string(),
      language: z.string(),
      definition: z.string().optional(),
    })).default([]),
  }),
  confidenceCheck: z.boolean().default(false), // Should we ask if student understands?
});

export type TeachingResponse = z.infer<typeof TeachingResponseSchema>;

// Conversation context
interface ConversationContext {
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  retrievedContent?: RetrievedChunk[];
  verificationResults?: VerificationResult[];
  attemptCount: number; // How many times student has tried current problem
}

export class SocraticTeachingEngine {
  private modelRouter: ModelRouter;
  private ragEngine: RAGEngine;
  private verificationEngine: VerificationEngine;

  constructor(
    modelRouter: ModelRouter,
    ragEngine: RAGEngine,
    verificationEngine: VerificationEngine
  ) {
    this.modelRouter = modelRouter;
    this.ragEngine = ragEngine;
    this.verificationEngine = verificationEngine;
  }

  /**
   * Generate a teaching response using Socratic method
   */
  async teach(
    studentQuery: string,
    studentState: StudentState,
    context: ConversationContext
  ): Promise<TeachingResponse> {
    // 1. Detect emotional state from query
    const emotionalState = await this.detectEmotionalState(studentQuery, context);
    studentState.emotionalState = emotionalState;

    // 2. Retrieve relevant curriculum content
    let retrievedContent: RetrievedChunk[] = [];
    if (studentState.enrolledCurriculum) {
      const ragResult = await this.ragEngine.retrieveForStudent(studentQuery, {
        curriculumId: studentState.enrolledCurriculum.id,
        examBoard: studentState.enrolledCurriculum.examBoard,
        currentTopicId: studentState.currentTopic?.id,
        knowledgeGaps: studentState.misconceptions.map(m => m.concept),
      });
      retrievedContent = [
        ...ragResult.relevantContent,
        ...ragResult.learningObjectives,
        ...ragResult.markingSchemes,
      ];
    }

    // 3. Check if verification is needed
    const complexity = await this.modelRouter.classifyQuery(studentQuery, {
      studentProfile: {
        learningStyle: studentState.learningStyle,
        specialNeeds: studentState.specialNeeds,
        masteryLevel: studentState.currentMastery,
      },
    });

    let verificationResult: VerificationResult | undefined;
    if (complexity.requiresVerification && complexity.verificationType && complexity.verificationType !== 'NONE') {
      verificationResult = await this.verificationEngine.verify(studentQuery, complexity.verificationType);
    }

    // 4. Build the teaching system prompt
    const systemPrompt = this.buildTeachingPrompt(studentState, retrievedContent, context);

    // 5. Generate response using appropriate model
    const result = await this.modelRouter.route(studentQuery, systemPrompt, {
      context: {
        sessionMode: emotionalState === 'crisis' ? 'EXAM_PREP' : undefined,
        studentProfile: {
          learningStyle: studentState.learningStyle,
          specialNeeds: studentState.specialNeeds,
          masteryLevel: studentState.currentMastery,
        },
        conversationHistory: context.history.map(h => ({
          role: h.role,
          content: h.content,
        })),
      },
    });

    // 6. Parse and structure the response
    const teachingResponse = this.parseTeachingResponse(
      result.response,
      studentState,
      retrievedContent,
      verificationResult
    );

    return teachingResponse;
  }

  /**
   * Detect student's emotional state from their message
   */
  private async detectEmotionalState(
    query: string,
    context: ConversationContext
  ): Promise<StudentState['emotionalState']> {
    const crisisIndicators = [
      'i\'m screwed', 'i give up', 'i can\'t do this', 'exam tomorrow',
      'final in', 'panic', 'stressed', 'desperate', 'hopeless',
    ];
    const frustrationIndicators = [
      'i don\'t get it', 'this makes no sense', 'why won\'t',
      'i\'ve tried', 'still wrong', 'confused', 'frustrated',
    ];
    const struggleIndicators = [
      'i\'m stuck', 'help me', 'not sure', 'struggling with',
      'having trouble', 'difficult', 'hard',
    ];

    const lowerQuery = query.toLowerCase();

    if (crisisIndicators.some(ind => lowerQuery.includes(ind))) {
      return 'crisis';
    }
    if (frustrationIndicators.some(ind => lowerQuery.includes(ind))) {
      return 'frustrated';
    }
    if (struggleIndicators.some(ind => lowerQuery.includes(ind))) {
      return 'struggling';
    }

    // Check attempt count for implicit frustration
    if (context.attemptCount > 3) {
      return 'struggling';
    }

    return 'neutral';
  }

  /**
   * Build the teaching system prompt
   */
  private buildTeachingPrompt(
    studentState: StudentState,
    retrievedContent: RetrievedChunk[],
    context: ConversationContext
  ): string {
    const curriculumContext = this.ragEngine.formatForPrompt(retrievedContent);
    
    // Language instruction
    let languageInstruction = '';
    if (studentState.targetLanguage && studentState.targetLanguage !== studentState.preferredLanguage) {
      languageInstruction = `
<bilingual_instruction>
The student's native language is ${studentState.preferredLanguage} but they are learning in ${studentState.targetLanguage}.
- Explain complex concepts first in ${studentState.preferredLanguage} for understanding
- Then provide the ${studentState.targetLanguage} academic terminology they need for exams
- Format: "Concept in native language → Academic term in target language"
- Help them build vocabulary for their specific exam board
</bilingual_instruction>`;
    }

    // Learning style adaptation
    const styleAdaptation = this.getStyleAdaptation(studentState.learningStyle);

    // Emotional state handling
    const emotionalGuidance = this.getEmotionalGuidance(studentState.emotionalState, context.attemptCount);

    // Special needs accommodations
    const accommodations = this.getAccommodations(studentState.specialNeeds);

    return `You are EduForge, a Socratic AI tutor. Your mission is to help students develop deep understanding through guided discovery, NOT to give direct answers.

<core_principles>
1. NEVER give direct answers to problems - ask guiding questions instead
2. Meet students where they are - use their current knowledge as a bridge
3. Detect and gently repair misconceptions
4. Align all content to the student's specific exam board and curriculum
5. Build confidence through incremental success
6. Adapt explanations to learning style and any special needs
</core_principles>

<student_profile>
- Name: ${studentState.name || 'Student'}
- Preferred Language: ${studentState.preferredLanguage}
- Learning Style: ${studentState.learningStyle}
- Current Mastery Level: ${Math.round(studentState.currentMastery * 100)}%
- Emotional State: ${studentState.emotionalState}
- Current Topic: ${studentState.currentTopic?.name || 'Not specified'}
- Exam Board: ${studentState.enrolledCurriculum?.examBoard || 'General'}
${studentState.misconceptions.length > 0 ? `- Known Misconceptions: ${studentState.misconceptions.map(m => m.description).join('; ')}` : ''}
</student_profile>

${languageInstruction}

<learning_style_adaptation>
${styleAdaptation}
</learning_style_adaptation>

${emotionalGuidance}

${accommodations}

<curriculum_context>
Use the following official curriculum content to ground your responses:
${curriculumContext || 'No specific curriculum content retrieved. Provide general guidance.'}
</curriculum_context>

<socratic_techniques>
When the student asks for help:
1. First, acknowledge what they DO understand
2. Ask a question that leads them toward the next insight
3. If they're stuck after 2-3 attempts, provide a small hint (not the answer)
4. Use analogies connected to their interests when possible
5. Always end with either a checking question OR encouragement

When the student makes an error:
1. Don't say "wrong" - ask them to explain their reasoning
2. Identify the specific misconception
3. Guide them to see the flaw themselves through targeted questions
4. Provide a counter-example that challenges their incorrect mental model

When verifying their work:
1. For correct answers: Celebrate, then deepen understanding with "what if" questions
2. For incorrect answers: Guide discovery of the error using the marking scheme criteria
</socratic_techniques>

<response_format>
Structure your response naturally, but internally ensure you:
- Choose the most appropriate response type (question, hint, encouragement, etc.)
- Include curriculum-aligned terminology for their exam board
- Note any misconceptions detected for tracking
- Suggest what to explore next
</response_format>

Remember: Your goal is to develop independent thinkers, not dependent answer-seekers. Every interaction should leave the student more capable of solving similar problems on their own.`;
  }

  /**
   * Get learning style adaptation instructions
   */
  private getStyleAdaptation(style: StudentState['learningStyle']): string {
    const adaptations: Record<StudentState['learningStyle'], string> = {
      visual: `- Use diagrams, charts, and visual metaphors
- Describe spatial relationships
- Suggest drawing or mapping concepts
- Use color-coding when explaining categories`,
      
      auditory: `- Explain concepts as if telling a story
- Use rhythm and patterns in explanations
- Suggest reading aloud or discussing
- Use memorable phrases and mnemonics`,
      
      kinesthetic: `- Connect concepts to physical actions
- Suggest hands-on experiments or activities
- Use movement-based metaphors
- Break learning into active, short segments`,
      
      reading_writing: `- Provide detailed written explanations
- Suggest note-taking strategies
- Use lists and structured formats
- Encourage paraphrasing in their own words`,
      
      mixed: `- Use a variety of explanation styles
- Combine visual, verbal, and practical elements
- Adapt based on the specific concept being taught`,
    };

    return adaptations[style];
  }

  /**
   * Get emotional guidance based on student state
   */
  private getEmotionalGuidance(
    state: StudentState['emotionalState'],
    attemptCount: number
  ): string {
    if (state === 'crisis') {
      return `
<crisis_mode>
PRIORITY: This student is in high-stress exam preparation mode.
- Be calm and reassuring but action-oriented
- Focus on high-yield concepts and exam techniques
- Break overwhelming content into manageable chunks
- Emphasize what they DO know, not what they don't
- Create a clear, achievable plan
- Remind them that understanding beats memorization
</crisis_mode>`;
    }

    if (state === 'frustrated' || (state === 'struggling' && attemptCount > 2)) {
      return `
<frustration_handling>
The student is frustrated. Before teaching, acknowledge their feelings.
- Start with empathy: "This concept trips up a lot of students..."
- Remind them that confusion is a sign of learning, not failure
- Take a step back to simpler prerequisite concepts if needed
- Consider a completely different angle or analogy
- Celebrate any progress, no matter how small
</frustration_handling>`;
    }

    if (state === 'struggling') {
      return `
<struggle_support>
The student is struggling but engaged. Provide extra scaffolding.
- Break the problem into smaller, more manageable steps
- Check understanding at each step before proceeding
- Offer more hints than usual (but still not answers)
- Connect to concepts they've already mastered
</struggle_support>`;
    }

    return '';
  }

  /**
   * Get accommodations for special needs
   */
  private getAccommodations(specialNeeds: string[]): string {
    if (specialNeeds.length === 0) return '';

    const accommodationMap: Record<string, string> = {
      'adhd': `- Keep explanations concise and chunked
- Use frequent engagement points
- Provide clear structure and timelines
- Avoid long blocks of text`,
      
      'dyslexia': `- Use clear, simple language
- Avoid ambiguous homophones
- Suggest text-to-speech when appropriate
- Be patient with spelling in responses`,
      
      'vision_issues': `- Describe visual elements verbally
- Use high contrast formatting
- Avoid relying solely on visual diagrams
- Support voice-based interaction`,
      
      'autism': `- Be direct and literal
- Avoid idioms and sarcasm
- Provide explicit structure
- Give clear expectations for each task`,
      
      'anxiety': `- Use calming, reassuring language
- Normalize mistakes as learning
- Avoid time pressure references
- Celebrate small wins`,
    };

    const applicable = specialNeeds
      .filter(need => accommodationMap[need.toLowerCase()])
      .map(need => accommodationMap[need.toLowerCase()])
      .join('\n');

    if (!applicable) return '';

    return `
<special_accommodations>
Apply these accommodations for the student:
${applicable}
</special_accommodations>`;
  }

  /**
   * Parse the AI response into structured teaching response
   */
  private parseTeachingResponse(
    rawResponse: string,
    studentState: StudentState,
    retrievedContent: RetrievedChunk[],
    verificationResult?: VerificationResult
  ): TeachingResponse {
    // Determine response type based on content analysis
    const responseType = this.classifyResponseType(rawResponse);

    // Extract any detected misconception
    let detectedMisconception: TeachingResponse['detectedMisconception'] | undefined;
    const misconceptionMatch = rawResponse.match(/misconception[:\s]+([^.]+)/i);
    if (misconceptionMatch) {
      detectedMisconception = {
        concept: studentState.currentTopic?.name || 'Unknown',
        description: misconceptionMatch[1].trim(),
      };
    }

    // Generate citations from retrieved content
    const citations = this.ragEngine.generateCitations(retrievedContent);

    // Build language usage info
    const languageUsed: TeachingResponse['languageUsed'] = {
      primary: studentState.preferredLanguage,
      secondary: studentState.targetLanguage,
      academicTerms: [],
    };

    // Extract academic terms if bilingual
    if (studentState.targetLanguage) {
      const termMatches = rawResponse.matchAll(/["']([^"']+)["']\s*\(([^)]+)\)/g);
      for (const match of termMatches) {
        languageUsed.academicTerms.push({
          term: match[1],
          language: studentState.targetLanguage,
          definition: match[2],
        });
      }
    }

    // Determine if we should check confidence
    const confidenceCheck = responseType === 'direct_instruction' || 
      responseType === 'concept_bridge' ||
      studentState.emotionalState === 'struggling';

    return {
      content: rawResponse,
      responseType,
      pedagogicalNotes: verificationResult?.verified 
        ? 'Response verified through deterministic check'
        : undefined,
      suggestedFollowUp: this.generateFollowUp(responseType, studentState),
      citations,
      detectedMisconception,
      languageUsed,
      confidenceCheck,
    };
  }

  /**
   * Classify the type of teaching response
   */
  private classifyResponseType(response: string): TeachingResponse['responseType'] {
    const lowerResponse = response.toLowerCase();

    if (response.includes('?') && (
      lowerResponse.includes('what do you think') ||
      lowerResponse.includes('can you explain') ||
      lowerResponse.includes('why might') ||
      lowerResponse.includes('what would happen')
    )) {
      return 'socratic_question';
    }

    if (lowerResponse.includes('hint') || lowerResponse.includes('try thinking about') ||
        lowerResponse.includes('consider') || lowerResponse.includes('remember that')) {
      return 'scaffolded_hint';
    }

    if (lowerResponse.includes('common mistake') || lowerResponse.includes('misconception') ||
        lowerResponse.includes('actually') || lowerResponse.includes('not quite')) {
      return 'misconception_repair';
    }

    if (lowerResponse.includes('great job') || lowerResponse.includes('excellent') ||
        lowerResponse.includes('you\'ve got this') || lowerResponse.includes('well done')) {
      return 'encouragement';
    }

    if (lowerResponse.includes('is defined as') || lowerResponse.includes('this means') ||
        lowerResponse.includes('the formula is')) {
      return 'direct_instruction';
    }

    return 'concept_bridge';
  }

  /**
   * Generate follow-up suggestion based on response type
   */
  private generateFollowUp(
    responseType: TeachingResponse['responseType'],
    studentState: StudentState
  ): string {
    const followUps: Record<TeachingResponse['responseType'], string> = {
      socratic_question: 'Let the student attempt to answer before providing more guidance.',
      scaffolded_hint: 'Wait for the student to try applying the hint.',
      misconception_repair: 'Ask the student to rephrase the concept in their own words.',
      encouragement: 'Present a slightly more challenging variation.',
      concept_bridge: 'Check if the connection made sense by asking a simple application question.',
      direct_instruction: 'Follow up with a practice problem to confirm understanding.',
      verification_feedback: 'Have them explain why their approach worked (or didn\'t).',
    };

    return followUps[responseType];
  }

  /**
   * Generate practice problems based on student state
   */
  async generatePractice(
    studentState: StudentState,
    options: {
      count?: number;
      difficulty?: number;
      focusOnMisconceptions?: boolean;
    } = {}
  ): Promise<Array<{
    question: string;
    hints: string[];
    markingScheme: string;
    targetConcept: string;
  }>> {
    if (!studentState.enrolledCurriculum || !studentState.currentTopic) {
      throw new Error('Student must be enrolled in a curriculum with a current topic');
    }

    const systemPrompt = `You are generating practice questions for the ${studentState.enrolledCurriculum.examBoard} ${studentState.enrolledCurriculum.name} curriculum.

Current topic: ${studentState.currentTopic.name}
Student mastery: ${Math.round(studentState.currentMastery * 100)}%
Target difficulty: ${options.difficulty || Math.ceil(studentState.currentMastery * 5)}
${options.focusOnMisconceptions && studentState.misconceptions.length > 0 
  ? `Focus on addressing these misconceptions: ${studentState.misconceptions.map(m => m.description).join('; ')}` 
  : ''}

Generate ${options.count || 3} practice questions in JSON format:
[
  {
    "question": "The question text",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "markingScheme": "Detailed marking criteria",
    "targetConcept": "The concept being tested"
  }
]

Ensure questions:
- Match the exam board's style and terminology
- Progress from easier to harder
- Include common misconception traps if applicable
- Have clear, actionable marking schemes`;

    const result = await this.modelRouter.route(
      `Generate ${options.count || 3} practice questions`,
      systemPrompt,
      { forceTier: 'SONNET' }
    );

    try {
      // Extract JSON from response
      const jsonMatch = result.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parsing fails, return empty array
    }

    return [];
  }
}

export const createSocraticEngine = (
  modelRouter: ModelRouter,
  ragEngine: RAGEngine,
  verificationEngine: VerificationEngine
) => new SocraticTeachingEngine(modelRouter, ragEngine, verificationEngine);
