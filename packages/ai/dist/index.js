"use strict";
/**
 * EduForge AI Package
 *
 * Core AI components for the Generative Teaching Infrastructure:
 * - Model Router: Intelligent routing to appropriate AI models
 * - RAG Engine: Curriculum-aware retrieval augmented generation
 * - Socratic Engine: Pedagogical AI for guided discovery
 * - Verification Engine: Deterministic STEM content verification
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEduForgeAI = createEduForgeAI;
__exportStar(require("./model-router"), exports);
__exportStar(require("./rag-engine"), exports);
__exportStar(require("./socratic-engine"), exports);
__exportStar(require("./verification-engine"), exports);
// Convenience factory for creating a complete AI stack
const model_router_1 = require("./model-router");
const rag_engine_1 = require("./rag-engine");
const verification_engine_1 = require("./verification-engine");
const socratic_engine_1 = require("./socratic-engine");
/**
 * Create the complete EduForge AI stack
 */
function createEduForgeAI(config) {
    const modelRouter = (0, model_router_1.createModelRouter)(config?.anthropicApiKey);
    const ragEngine = (0, rag_engine_1.createRAGEngine)({
        pineconeApiKey: config?.pineconeApiKey,
        pineconeIndex: config?.pineconeIndex,
        openaiApiKey: config?.openaiApiKey,
    });
    const verificationEngine = (0, verification_engine_1.createVerificationEngine)({
        wolframAppId: config?.wolframAppId,
        judge0ApiKey: config?.judge0ApiKey,
        judge0BaseUrl: config?.judge0BaseUrl,
    });
    const socraticEngine = (0, socratic_engine_1.createSocraticEngine)(modelRouter, ragEngine, verificationEngine);
    return {
        modelRouter,
        ragEngine,
        verificationEngine,
        socraticEngine,
    };
}
exports.default = createEduForgeAI;
