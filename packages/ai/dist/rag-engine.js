"use strict";
/**
 * EduForge RAG Engine
 *
 * Retrieval-Augmented Generation for curriculum intelligence.
 * Retrieves official syllabi, learning objectives, marking schemes,
 * and textbook content to ground AI responses in verified educational content.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRAGEngine = exports.RAGEngine = exports.RetrievedChunkSchema = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("zod");
// Schema for retrieved content
exports.RetrievedChunkSchema = zod_1.z.object({
    id: zod_1.z.string(),
    content: zod_1.z.string(),
    metadata: zod_1.z.object({
        conceptId: zod_1.z.string(),
        conceptName: zod_1.z.string(),
        topicId: zod_1.z.string(),
        topicName: zod_1.z.string(),
        curriculumId: zod_1.z.string(),
        curriculumName: zod_1.z.string(),
        examBoard: zod_1.z.string(),
        contentType: zod_1.z.enum(['explanation', 'example', 'analogy', 'common_mistake', 'marking_scheme', 'learning_objective']),
        source: zod_1.z.string().optional(),
        difficulty: zod_1.z.number().optional(),
    }),
    score: zod_1.z.number(),
});
class RAGEngine {
    pinecone;
    openai;
    indexName;
    embeddingModel;
    index = null;
    constructor(config) {
        this.pinecone = new pinecone_1.Pinecone({
            apiKey: config?.pineconeApiKey || process.env.PINECONE_API_KEY || '',
        });
        this.openai = new openai_1.default({
            apiKey: config?.openaiApiKey || process.env.OPENAI_API_KEY,
        });
        this.indexName = config?.pineconeIndex || process.env.PINECONE_INDEX || 'eduforge-curriculum';
        this.embeddingModel = config?.embeddingModel || 'text-embedding-3-small';
    }
    /**
     * Initialize connection to Pinecone index
     */
    async initialize() {
        this.index = this.pinecone.index(this.indexName);
    }
    /**
     * Generate embedding for a query
     */
    async generateEmbedding(text) {
        const response = await this.openai.embeddings.create({
            model: this.embeddingModel,
            input: text,
        });
        return response.data[0].embedding;
    }
    /**
     * Retrieve relevant curriculum content for a query
     */
    async retrieve(query, options) {
        if (!this.index) {
            await this.initialize();
        }
        // Generate query embedding
        const queryEmbedding = await this.generateEmbedding(query);
        // Build filter based on options
        const filter = {};
        if (options?.curriculumId) {
            filter.curriculumId = options.curriculumId;
        }
        if (options?.examBoard) {
            filter.examBoard = options.examBoard;
        }
        if (options?.topicId) {
            filter.topicId = options.topicId;
        }
        if (options?.conceptId) {
            filter.conceptId = options.conceptId;
        }
        if (options?.contentTypes && options.contentTypes.length > 0) {
            filter.contentType = { $in: options.contentTypes };
        }
        // Query Pinecone
        const results = await this.index.query({
            vector: queryEmbedding,
            topK: options?.maxResults || 10,
            filter: Object.keys(filter).length > 0 ? filter : undefined,
            includeMetadata: true,
        });
        // Process and filter results
        const chunks = [];
        const minScore = options?.minScore || 0.7;
        for (const match of results.matches || []) {
            if (match.score && match.score >= minScore && match.metadata) {
                chunks.push({
                    id: match.id,
                    content: match.metadata.content,
                    metadata: {
                        conceptId: match.metadata.conceptId,
                        conceptName: match.metadata.conceptName,
                        topicId: match.metadata.topicId,
                        topicName: match.metadata.topicName,
                        curriculumId: match.metadata.curriculumId,
                        curriculumName: match.metadata.curriculumName,
                        examBoard: match.metadata.examBoard,
                        contentType: match.metadata.contentType,
                        source: match.metadata.source,
                        difficulty: match.metadata.difficulty,
                    },
                    score: match.score,
                });
            }
        }
        return chunks;
    }
    /**
     * Retrieve with curriculum-specific context
     * Ensures responses are grounded in the student's specific exam board
     */
    async retrieveForStudent(query, studentContext) {
        // Retrieve main content
        const relevantContent = await this.retrieve(query, {
            curriculumId: studentContext.curriculumId,
            examBoard: studentContext.examBoard,
            maxResults: 5,
            contentTypes: ['explanation', 'example', 'analogy'],
        });
        // Retrieve learning objectives
        const learningObjectives = await this.retrieve(query, {
            curriculumId: studentContext.curriculumId,
            maxResults: 3,
            contentTypes: ['learning_objective'],
        });
        // Retrieve marking schemes (for exam-aligned feedback)
        const markingSchemes = await this.retrieve(query, {
            curriculumId: studentContext.curriculumId,
            maxResults: 3,
            contentTypes: ['marking_scheme'],
        });
        // Retrieve prerequisite content if student has knowledge gaps
        let prerequisites = [];
        if (studentContext.knowledgeGaps && studentContext.knowledgeGaps.length > 0) {
            for (const gap of studentContext.knowledgeGaps.slice(0, 2)) {
                const prereqContent = await this.retrieve(gap, {
                    curriculumId: studentContext.curriculumId,
                    maxResults: 2,
                    contentTypes: ['explanation'],
                });
                prerequisites.push(...prereqContent);
            }
        }
        return {
            relevantContent,
            learningObjectives,
            markingSchemes,
            prerequisites,
        };
    }
    /**
     * Format retrieved content for inclusion in AI prompt
     */
    formatForPrompt(chunks) {
        if (chunks.length === 0) {
            return '';
        }
        const sections = [];
        for (const chunk of chunks) {
            sections.push(`
<curriculum_content source="${chunk.metadata.source || 'Official Syllabus'}" type="${chunk.metadata.contentType}">
  <topic>${chunk.metadata.topicName}</topic>
  <concept>${chunk.metadata.conceptName}</concept>
  <exam_board>${chunk.metadata.examBoard}</exam_board>
  <content>
${chunk.content}
  </content>
</curriculum_content>`);
        }
        return sections.join('\n');
    }
    /**
     * Generate citations for retrieved content
     */
    generateCitations(chunks) {
        return chunks.map(chunk => {
            const citation = `${chunk.metadata.examBoard} ${chunk.metadata.curriculumName}, ${chunk.metadata.topicName}`;
            if (chunk.metadata.source) {
                return `${citation} (Source: ${chunk.metadata.source})`;
            }
            return citation;
        });
    }
    /**
     * Upsert content chunks to the vector store
     */
    async upsertChunks(chunks) {
        if (!this.index) {
            await this.initialize();
        }
        // Generate embeddings for all chunks
        const vectors = await Promise.all(chunks.map(async (chunk) => {
            const embedding = await this.generateEmbedding(chunk.content);
            return {
                id: chunk.id,
                values: embedding,
                metadata: {
                    ...chunk.metadata,
                    content: chunk.content,
                },
            };
        }));
        // Upsert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await this.index.upsert(batch);
        }
    }
    /**
     * Delete chunks by ID
     */
    async deleteChunks(ids) {
        if (!this.index) {
            await this.initialize();
        }
        await this.index.deleteMany(ids);
    }
    /**
     * Get statistics about the index
     */
    async getStats() {
        if (!this.index) {
            await this.initialize();
        }
        const stats = await this.index.describeIndexStats();
        return {
            totalVectors: stats.totalRecordCount || 0,
            dimensions: stats.dimension || 0,
        };
    }
}
exports.RAGEngine = RAGEngine;
const createRAGEngine = (config) => new RAGEngine(config);
exports.createRAGEngine = createRAGEngine;
