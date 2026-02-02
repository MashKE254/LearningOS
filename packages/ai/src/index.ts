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

// Convenience factory for creating a complete AI stack
import { ModelRouter, createModelRouter } from './model-router';
import { RAGEngine, createRAGEngine } from './rag-engine';
import { VerificationEngine, createVerificationEngine } from './verification-engine';
import { SocraticTeachingEngine, createSocraticEngine } from './socratic-engine';

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
export function createEduForgeAI(config?: EduForgeAIConfig): EduForgeAI {
  const modelRouter = createModelRouter(config?.anthropicApiKey);
  
  const ragEngine = createRAGEngine({
    pineconeApiKey: config?.pineconeApiKey,
    pineconeIndex: config?.pineconeIndex,
    openaiApiKey: config?.openaiApiKey,
  });

  const verificationEngine = createVerificationEngine({
    wolframAppId: config?.wolframAppId,
    judge0ApiKey: config?.judge0ApiKey,
    judge0BaseUrl: config?.judge0BaseUrl,
  });

  const socraticEngine = createSocraticEngine(
    modelRouter,
    ragEngine,
    verificationEngine
  );

  return {
    modelRouter,
    ragEngine,
    verificationEngine,
    socraticEngine,
  };
}

export default createEduForgeAI;
