/**
 * EduForge Verification Engine
 *
 * Deterministic verification layer for STEM content:
 * - Mathematical proofs and calculations (Wolfram Alpha)
 * - Chemical equations and structures (RDKit)
 * - Code execution and testing (Judge0)
 *
 * Ensures AI responses are factually accurate before reaching students.
 */
import { z } from 'zod';
export declare const VerificationResultSchema: z.ZodObject<{
    verified: z.ZodBoolean;
    method: z.ZodEnum<["MATH", "CHEMISTRY", "CODE", "NONE"]>;
    input: z.ZodString;
    result: z.ZodUnknown;
    confidence: z.ZodNumber;
    errorMessage: z.ZodOptional<z.ZodString>;
    corrections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        original: z.ZodString;
        corrected: z.ZodString;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        explanation: string;
        original: string;
        corrected: string;
    }, {
        explanation: string;
        original: string;
        corrected: string;
    }>, "many">>;
    executionTimeMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    verified: boolean;
    method: "MATH" | "CHEMISTRY" | "CODE" | "NONE";
    input: string;
    result?: unknown;
    errorMessage?: string | undefined;
    corrections?: {
        explanation: string;
        original: string;
        corrected: string;
    }[] | undefined;
    executionTimeMs?: number | undefined;
}, {
    confidence: number;
    verified: boolean;
    method: "MATH" | "CHEMISTRY" | "CODE" | "NONE";
    input: string;
    result?: unknown;
    errorMessage?: string | undefined;
    corrections?: {
        explanation: string;
        original: string;
        corrected: string;
    }[] | undefined;
    executionTimeMs?: number | undefined;
}>;
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
export declare class VerificationEngine {
    private wolframAppId;
    private judge0ApiKey;
    private judge0BaseUrl;
    constructor(config?: {
        wolframAppId?: string;
        judge0ApiKey?: string;
        judge0BaseUrl?: string;
    });
    /**
     * Main verification entry point
     */
    verify(content: string, type: 'MATH' | 'CHEMISTRY' | 'CODE'): Promise<VerificationResult>;
    /**
     * Verify mathematical content using Wolfram Alpha
     */
    verifyMath(content: string): Promise<VerificationResult>;
    /**
     * Parse math query from natural language
     */
    private parseMathQuery;
    /**
     * Parse Wolfram Alpha API response
     */
    private parseWolframResult;
    /**
     * Basic math verification without external API
     */
    private basicMathVerification;
    /**
     * Verify chemistry content
     * In production, this would use RDKit or similar
     */
    verifyChemistry(content: string): Promise<VerificationResult>;
    /**
     * Parse chemistry query
     */
    private parseChemistryQuery;
    /**
     * Verify a chemical equation is balanced
     */
    private verifyChemicalEquation;
    /**
     * Count atoms in a chemical expression
     */
    private countAtoms;
    /**
     * Compare two atom count objects
     */
    private compareAtomCounts;
    /**
     * Verify code using Judge0
     */
    verifyCode(content: string): Promise<VerificationResult>;
    /**
     * Parse code from content
     */
    private parseCodeQuery;
    /**
     * Basic code verification without execution
     */
    private basicCodeVerification;
    /**
     * Batch verify multiple items
     */
    verifyBatch(items: Array<{
        content: string;
        type: 'MATH' | 'CHEMISTRY' | 'CODE';
    }>): Promise<VerificationResult[]>;
}
export declare const createVerificationEngine: (config?: {
    wolframAppId?: string;
    judge0ApiKey?: string;
    judge0BaseUrl?: string;
}) => VerificationEngine;
