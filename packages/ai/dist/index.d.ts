/**
 * EduForge AI Package
 *
 * Core AI components for the Generative Teaching Infrastructure:
 * - Model Router: Intelligent routing to appropriate AI models
 * - RAG Engine: Curriculum-aware retrieval augmented generation
 * - Socratic Engine: Pedagogical AI for guided discovery
 * - Verification Engine: Deterministic STEM content verification
 */
export * from './model-router';
export * from './rag-engine';
export * from './socratic-engine';
export * from './verification-engine';
import { ModelRouter } from './model-router';
import { RAGEngine } from './rag-engine';
import { VerificationEngine } from './verification-engine';
import { SocraticTeachingEngine } from './socratic-engine';
export interface EduForgeAIConfig {
    anthropicApiKey?: string;
    pineconeApiKey?: string;
    pineconeIndex?: string;
    openaiApiKey?: string;
    wolframAppId?: string;
    judge0ApiKey?: string;
    judge0BaseUrl?: string;
}
export interface EduForgeAI {
    modelRouter: ModelRouter;
    ragEngine: RAGEngine;
    verificationEngine: VerificationEngine;
    socraticEngine: SocraticTeachingEngine;
}
/**
 * Create the complete EduForge AI stack
 */
export declare function createEduForgeAI(config?: EduForgeAIConfig): EduForgeAI;
export default createEduForgeAI;
