/**
 * EduForge RAG Engine
 * 
 * Retrieval-Augmented Generation for curriculum intelligence.
 * Retrieves official syllabi, learning objectives, marking schemes,
 * and textbook content to ground AI responses in verified educational content.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { z } from 'zod';

// Schema for retrieved content
export const RetrievedChunkSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.object({
    conceptId: z.string(),
    conceptName: z.string(),
    topicId: z.string(),
    topicName: z.string(),
    curriculumId: z.string(),
    curriculumName: z.string(),
    examBoard: z.string(),
    contentType: z.enum(['explanation', 'example', 'analogy', 'common_mistake', 'marking_scheme', 'learning_objective']),
    source: z.string().optional(),
    difficulty: z.number().optional(),
  }),
  score: z.number(),
});

export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;

// RAG query options
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

// Configuration
interface RAGEngineConfig {
  pineconeApiKey?: string;
  pineconeIndex?: string;
  openaiApiKey?: string;
  embeddingModel?: string;
}

export class RAGEngine {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string;
  private embeddingModel: string;
  private index: ReturnType<Pinecone['index']> | null = null;

  constructor(config?: RAGEngineConfig) {
    this.pinecone = new Pinecone({
      apiKey: config?.pineconeApiKey || process.env.PINECONE_API_KEY || '',
    });
    
    this.openai = new OpenAI({
      apiKey: config?.openaiApiKey || process.env.OPENAI_API_KEY,
    });

    this.indexName = config?.pineconeIndex || process.env.PINECONE_INDEX || 'eduforge-curriculum';
    this.embeddingModel = config?.embeddingModel || 'text-embedding-3-small';
  }

  /**
   * Initialize connection to Pinecone index
   */
  async initialize(): Promise<void> {
    this.index = this.pinecone.index(this.indexName);
  }

  /**
   * Generate embedding for a query
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: text,
    });
    return response.data[0].embedding;
  }

  /**
   * Retrieve relevant curriculum content for a query
   */
  async retrieve(
    query: string,
    options?: RAGQueryOptions
  ): Promise<RetrievedChunk[]> {
    if (!this.index) {
      await this.initialize();
    }

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Build filter based on options
    const filter: Record<string, unknown> = {};
    
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
    const results = await this.index!.query({
      vector: queryEmbedding,
      topK: options?.maxResults || 10,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      includeMetadata: true,
    });

    // Process and filter results
    const chunks: RetrievedChunk[] = [];
    const minScore = options?.minScore || 0.7;

    for (const match of results.matches || []) {
      if (match.score && match.score >= minScore && match.metadata) {
        chunks.push({
          id: match.id,
          content: match.metadata.content as string,
          metadata: {
            conceptId: match.metadata.conceptId as string,
            conceptName: match.metadata.conceptName as string,
            topicId: match.metadata.topicId as string,
            topicName: match.metadata.topicName as string,
            curriculumId: match.metadata.curriculumId as string,
            curriculumName: match.metadata.curriculumName as string,
            examBoard: match.metadata.examBoard as string,
            contentType: match.metadata.contentType as RetrievedChunk['metadata']['contentType'],
            source: match.metadata.source as string | undefined,
            difficulty: match.metadata.difficulty as number | undefined,
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
  async retrieveForStudent(
    query: string,
    studentContext: {
      curriculumId: string;
      examBoard: string;
      currentTopicId?: string;
      knowledgeGaps?: string[];
    }
  ): Promise<{
    relevantContent: RetrievedChunk[];
    learningObjectives: RetrievedChunk[];
    markingSchemes: RetrievedChunk[];
    prerequisites: RetrievedChunk[];
  }> {
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
    let prerequisites: RetrievedChunk[] = [];
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
  formatForPrompt(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) {
      return '';
    }

    const sections: string[] = [];
    
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
  generateCitations(chunks: RetrievedChunk[]): string[] {
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
  async upsertChunks(chunks: Array<{
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
  }>): Promise<void> {
    if (!this.index) {
      await this.initialize();
    }

    // Generate embeddings for all chunks
    const vectors = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await this.generateEmbedding(chunk.content);
        return {
          id: chunk.id,
          values: embedding,
          metadata: {
            ...chunk.metadata,
            content: chunk.content,
          },
        };
      })
    );

    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index!.upsert(batch);
    }
  }

  /**
   * Delete chunks by ID
   */
  async deleteChunks(ids: string[]): Promise<void> {
    if (!this.index) {
      await this.initialize();
    }
    await this.index!.deleteMany(ids);
  }

  /**
   * Get statistics about the index
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimensions: number;
  }> {
    if (!this.index) {
      await this.initialize();
    }
    const stats = await this.index!.describeIndexStats();
    return {
      totalVectors: stats.totalRecordCount || 0,
      dimensions: stats.dimension || 0,
    };
  }
}

export const createRAGEngine = (config?: RAGEngineConfig) => new RAGEngine(config);
