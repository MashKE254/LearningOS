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
export declare const StudentStateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    preferredLanguage: z.ZodDefault<z.ZodString>;
    targetLanguage: z.ZodOptional<z.ZodString>;
    learningStyle: z.ZodDefault<z.ZodEnum<["visual", "auditory", "kinesthetic", "reading_writing", "mixed"]>>;
    specialNeeds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    currentMastery: z.ZodDefault<z.ZodNumber>;
    misconceptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        concept: z.ZodString;
        description: z.ZodString;
        detectedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        concept: string;
        description: string;
        detectedAt: Date;
    }, {
        concept: string;
        description: string;
        detectedAt: Date;
    }>, "many">>;
    enrolledCurriculum: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        examBoard: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        examBoard: string;
        name: string;
    }, {
        id: string;
        examBoard: string;
        name: string;
    }>>;
    currentTopic: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>>;
    emotionalState: z.ZodDefault<z.ZodEnum<["confident", "neutral", "struggling", "frustrated", "crisis"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    preferredLanguage: string;
    learningStyle: "visual" | "auditory" | "kinesthetic" | "reading_writing" | "mixed";
    specialNeeds: string[];
    currentMastery: number;
    misconceptions: {
        concept: string;
        description: string;
        detectedAt: Date;
    }[];
    emotionalState: "crisis" | "confident" | "neutral" | "struggling" | "frustrated";
    name?: string | undefined;
    targetLanguage?: string | undefined;
    enrolledCurriculum?: {
        id: string;
        examBoard: string;
        name: string;
    } | undefined;
    currentTopic?: {
        id: string;
        name: string;
    } | undefined;
}, {
    id: string;
    name?: string | undefined;
    preferredLanguage?: string | undefined;
    targetLanguage?: string | undefined;
    learningStyle?: "visual" | "auditory" | "kinesthetic" | "reading_writing" | "mixed" | undefined;
    specialNeeds?: string[] | undefined;
    currentMastery?: number | undefined;
    misconceptions?: {
        concept: string;
        description: string;
        detectedAt: Date;
    }[] | undefined;
    enrolledCurriculum?: {
        id: string;
        examBoard: string;
        name: string;
    } | undefined;
    currentTopic?: {
        id: string;
        name: string;
    } | undefined;
    emotionalState?: "crisis" | "confident" | "neutral" | "struggling" | "frustrated" | undefined;
}>;
export type StudentState = z.infer<typeof StudentStateSchema>;
export declare const TeachingResponseSchema: z.ZodObject<{
    content: z.ZodString;
    responseType: z.ZodEnum<["socratic_question", "scaffolded_hint", "misconception_repair", "encouragement", "concept_bridge", "direct_instruction", "verification_feedback"]>;
    pedagogicalNotes: z.ZodOptional<z.ZodString>;
    suggestedFollowUp: z.ZodOptional<z.ZodString>;
    citations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    detectedMisconception: z.ZodOptional<z.ZodObject<{
        concept: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        concept: string;
        description: string;
    }, {
        concept: string;
        description: string;
    }>>;
    languageUsed: z.ZodObject<{
        primary: z.ZodString;
        secondary: z.ZodOptional<z.ZodString>;
        academicTerms: z.ZodDefault<z.ZodArray<z.ZodObject<{
            term: z.ZodString;
            language: z.ZodString;
            definition: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            language: string;
            term: string;
            definition?: string | undefined;
        }, {
            language: string;
            term: string;
            definition?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        primary: string;
        academicTerms: {
            language: string;
            term: string;
            definition?: string | undefined;
        }[];
        secondary?: string | undefined;
    }, {
        primary: string;
        secondary?: string | undefined;
        academicTerms?: {
            language: string;
            term: string;
            definition?: string | undefined;
        }[] | undefined;
    }>;
    confidenceCheck: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: string;
    responseType: "socratic_question" | "scaffolded_hint" | "misconception_repair" | "encouragement" | "concept_bridge" | "direct_instruction" | "verification_feedback";
    citations: string[];
    languageUsed: {
        primary: string;
        academicTerms: {
            language: string;
            term: string;
            definition?: string | undefined;
        }[];
        secondary?: string | undefined;
    };
    confidenceCheck: boolean;
    pedagogicalNotes?: string | undefined;
    suggestedFollowUp?: string | undefined;
    detectedMisconception?: {
        concept: string;
        description: string;
    } | undefined;
}, {
    content: string;
    responseType: "socratic_question" | "scaffolded_hint" | "misconception_repair" | "encouragement" | "concept_bridge" | "direct_instruction" | "verification_feedback";
    languageUsed: {
        primary: string;
        secondary?: string | undefined;
        academicTerms?: {
            language: string;
            term: string;
            definition?: string | undefined;
        }[] | undefined;
    };
    pedagogicalNotes?: string | undefined;
    suggestedFollowUp?: string | undefined;
    citations?: string[] | undefined;
    detectedMisconception?: {
        concept: string;
        description: string;
    } | undefined;
    confidenceCheck?: boolean | undefined;
}>;
export type TeachingResponse = z.infer<typeof TeachingResponseSchema>;
interface ConversationContext {
    history: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }>;
    retrievedContent?: RetrievedChunk[];
    verificationResults?: VerificationResult[];
    attemptCount: number;
}
export declare class SocraticTeachingEngine {
    private modelRouter;
    private ragEngine;
    private verificationEngine;
    constructor(modelRouter: ModelRouter, ragEngine: RAGEngine, verificationEngine: VerificationEngine);
    /**
     * Generate a teaching response using Socratic method
     */
    teach(studentQuery: string, studentState: StudentState, context: ConversationContext): Promise<TeachingResponse>;
    /**
     * Detect student's emotional state from their message
     */
    private detectEmotionalState;
    /**
     * Build the teaching system prompt
     */
    private buildTeachingPrompt;
    /**
     * Get learning style adaptation instructions
     */
    private getStyleAdaptation;
    /**
     * Get emotional guidance based on student state
     */
    private getEmotionalGuidance;
    /**
     * Get accommodations for special needs
     */
    private getAccommodations;
    /**
     * Parse the AI response into structured teaching response
     */
    private parseTeachingResponse;
    /**
     * Classify the type of teaching response
     */
    private classifyResponseType;
    /**
     * Generate follow-up suggestion based on response type
     */
    private generateFollowUp;
    /**
     * Generate practice problems based on student state
     */
    generatePractice(studentState: StudentState, options?: {
        count?: number;
        difficulty?: number;
        focusOnMisconceptions?: boolean;
    }): Promise<Array<{
        question: string;
        hints: string[];
        markingScheme: string;
        targetConcept: string;
    }>>;
}
export declare const createSocraticEngine: (modelRouter: ModelRouter, ragEngine: RAGEngine, verificationEngine: VerificationEngine) => SocraticTeachingEngine;
export {};
