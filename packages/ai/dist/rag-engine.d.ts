/**
 * EduForge RAG Engine
 *
 * Retrieval-Augmented Generation for curriculum intelligence.
 * Retrieves official syllabi, learning objectives, marking schemes,
 * and textbook content to ground AI responses in verified educational content.
 */
import { z } from 'zod';
export declare const RetrievedChunkSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    metadata: z.ZodObject<{
        conceptId: z.ZodString;
        conceptName: z.ZodString;
        topicId: z.ZodString;
        topicName: z.ZodString;
        curriculumId: z.ZodString;
        curriculumName: z.ZodString;
        examBoard: z.ZodString;
        contentType: z.ZodEnum<["explanation", "example", "analogy", "common_mistake", "marking_scheme", "learning_objective"]>;
        source: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        conceptId: string;
        conceptName: string;
        topicId: string;
        topicName: string;
        curriculumId: string;
        curriculumName: string;
        examBoard: string;
        contentType: "example" | "explanation" | "analogy" | "common_mistake" | "marking_scheme" | "learning_objective";
        source?: string | undefined;
        difficulty?: number | undefined;
    }, {
        conceptId: string;
        conceptName: string;
        topicId: string;
        topicName: string;
        curriculumId: string;
        curriculumName: string;
        examBoard: string;
        contentType: "example" | "explanation" | "analogy" | "common_mistake" | "marking_scheme" | "learning_objective";
        source?: string | undefined;
        difficulty?: number | undefined;
    }>;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    metadata: {
        conceptId: string;
        conceptName: string;
        topicId: string;
        topicName: string;
        curriculumId: string;
        curriculumName: string;
        examBoard: string;
        contentType: "example" | "explanation" | "analogy" | "common_mistake" | "marking_scheme" | "learning_objective";
        source?: string | undefined;
        difficulty?: number | undefined;
    };
    score: number;
}, {
    id: string;
    content: string;
    metadata: {
        conceptId: string;
        conceptName: string;
        topicId: string;
        topicName: string;
        curriculumId: string;
        curriculumName: string;
        examBoard: string;
        contentType: "example" | "explanation" | "analogy" | "common_mistake" | "marking_scheme" | "learning_objective";
        source?: string | undefined;
        difficulty?: number | undefined;
    };
    score: number;
}>;
export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;
export interface RAGQueryOptions {
    curriculumId?: string;
    examBoard?: string;
    topicId?: string;
    conceptId?: string;
    contentTypes?: string[];
    maxResults?: number;
    minScore?: number;
    includeMarkingSchemes?: boolean;
}
interface RAGEngineConfig {
    pineconeApiKey?: string;
    pineconeIndex?: string;
    openaiApiKey?: string;
    embeddingModel?: string;
}
export declare class RAGEngine {
    private pinecone;
    private openai;
    private indexName;
    private embeddingModel;
    private index;
    constructor(config?: RAGEngineConfig);
    /**
     * Initialize connection to Pinecone index
     */
    initialize(): Promise<void>;
    /**
     * Generate embedding for a query
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * Retrieve relevant curriculum content for a query
     */
    retrieve(query: string, options?: RAGQueryOptions): Promise<RetrievedChunk[]>;
    /**
     * Retrieve with curriculum-specific context
     * Ensures responses are grounded in the student's specific exam board
     */
    retrieveForStudent(query: string, studentContext: {
        curriculumId: string;
        examBoard: string;
        currentTopicId?: string;
        knowledgeGaps?: string[];
    }): Promise<{
        relevantContent: RetrievedChunk[];
        learningObjectives: RetrievedChunk[];
        markingSchemes: RetrievedChunk[];
        prerequisites: RetrievedChunk[];
    }>;
    /**
     * Format retrieved content for inclusion in AI prompt
     */
    formatForPrompt(chunks: RetrievedChunk[]): string;
    /**
     * Generate citations for retrieved content
     */
    generateCitations(chunks: RetrievedChunk[]): string[];
    /**
     * Upsert content chunks to the vector store
     */
    upsertChunks(chunks: Array<{
        id: string;
        content: string;
        metadata: {
            conceptId: string;
            conceptName: string;
            topicId: string;
            topicName: string;
            curriculumId: string;
            curriculumName: string;
            examBoard: string;
            contentType: string;
            source?: string;
            difficulty?: number;
        };
    }>): Promise<void>;
    /**
     * Delete chunks by ID
     */
    deleteChunks(ids: string[]): Promise<void>;
    /**
     * Get statistics about the index
     */
    getStats(): Promise<{
        totalVectors: number;
        dimensions: number;
    }>;
}
export declare const createRAGEngine: (config?: RAGEngineConfig) => RAGEngine;
export {};
