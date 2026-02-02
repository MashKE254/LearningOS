/**
 * EduForge Hierarchical Model Router
 *
 * Routes queries to appropriate AI models based on cognitive complexity:
 * - Haiku (Fast): Intent classification, simple recall, dashboard updates
 * - Sonnet (Balanced): Standard explanations, practice problems, essay feedback
 * - Opus (Deep): Complex Socratic dialogue, debugging, high-stakes exam prep
 * - Verified (Deterministic): Mathematical proofs (Wolfram), chemistry (RDKit), code (Judge0)
 */
import { z } from 'zod';
export declare const MODELS: {
    readonly HAIKU: "claude-3-haiku-20240307";
    readonly SONNET: "claude-sonnet-4-20250514";
    readonly OPUS: "claude-opus-4-20250514";
};
export type ModelTier = keyof typeof MODELS;
export declare const QueryComplexitySchema: z.ZodObject<{
    tier: z.ZodEnum<["HAIKU", "SONNET", "OPUS", "VERIFIED"]>;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
    requiresVerification: z.ZodBoolean;
    verificationType: z.ZodOptional<z.ZodEnum<["MATH", "CHEMISTRY", "CODE", "NONE"]>>;
}, "strip", z.ZodTypeAny, {
    tier: "HAIKU" | "SONNET" | "OPUS" | "VERIFIED";
    confidence: number;
    reasoning: string;
    requiresVerification: boolean;
    verificationType?: "MATH" | "CHEMISTRY" | "CODE" | "NONE" | undefined;
}, {
    tier: "HAIKU" | "SONNET" | "OPUS" | "VERIFIED";
    confidence: number;
    reasoning: string;
    requiresVerification: boolean;
    verificationType?: "MATH" | "CHEMISTRY" | "CODE" | "NONE" | undefined;
}>;
export type QueryComplexity = z.infer<typeof QueryComplexitySchema>;
export declare class ModelRouter {
    private anthropic;
    private usageMetrics;
    constructor(apiKey?: string);
    /**
     * Classify query complexity and determine routing
     */
    classifyQuery(query: string, context?: {
        sessionMode?: string;
        studentProfile?: {
            learningStyle?: string;
            specialNeeds?: string[];
            masteryLevel?: number;
        };
        conversationHistory?: Array<{
            role: string;
            content: string;
        }>;
    }): Promise<QueryComplexity>;
    /**
     * Execute a query with automatic model routing
     */
    route(query: string, systemPrompt: string, options?: {
        context?: {
            sessionMode?: string;
            studentProfile?: {
                learningStyle?: string;
                specialNeeds?: string[];
                masteryLevel?: number;
            };
            conversationHistory?: Array<{
                role: string;
                content: string;
            }>;
        };
        forceTier?: ModelTier;
        maxTokens?: number;
        temperature?: number;
    }): Promise<{
        response: string;
        modelUsed: string;
        complexity: QueryComplexity;
        usage: {
            inputTokens: number;
            outputTokens: number;
        };
    }>;
    /**
     * Quick classification using Haiku
     */
    quickClassify(input: string, options: string[]): Promise<string>;
    /**
     * Get usage metrics
     */
    getMetrics(): Record<ModelTier, {
        tokens: number;
        calls: number;
        estimatedCost: number;
    }>;
    /**
     * Reset metrics (for testing or periodic resets)
     */
    resetMetrics(): void;
}
export declare const createModelRouter: (apiKey?: string) => ModelRouter;
