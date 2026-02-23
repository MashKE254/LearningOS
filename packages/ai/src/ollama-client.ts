/**
 * EduForge Ollama Client
 *
 * Local LLM integration for development using Ollama.
 * Provides a unified interface that mirrors the Anthropic SDK pattern.
 *
 * Setup:
 * 1. Install Ollama: https://ollama.ai
 * 2. Pull a model: ollama pull llama3.2
 * 3. Run Ollama: ollama serve
 * 4. Set AI_PROVIDER=ollama in .env
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout?: number;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  messages: OllamaMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
  prompt_eval_count?: number;
}

export interface OllamaStreamChunk {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaClient {
  private config: OllamaConfig;

  constructor(config?: Partial<OllamaConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: config?.model || process.env.OLLAMA_MODEL || 'llama3.2',
      timeout: config?.timeout || 120000, // 2 minutes default
    };
  }

  /**
   * Check if Ollama is running and accessible
   */
  async healthCheck(): Promise<{ ok: boolean; models: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return { ok: false, models: [], error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      const models = data.models?.map((m: { name: string }) => m.name) || [];

      return { ok: true, models };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { ok: false, models: [], error: message };
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    const health = await this.healthCheck();
    return health.models;
  }

  /**
   * Generate a chat completion (non-streaming)
   */
  async chat(options: OllamaGenerateOptions): Promise<OllamaResponse> {
    const messages = [...options.messages];

    // Prepend system prompt if provided
    if (options.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.config.model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens || 4096,
        },
      }),
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Generate a streaming chat completion
   */
  async *chatStream(options: OllamaGenerateOptions): AsyncGenerator<OllamaStreamChunk> {
    const messages = [...options.messages];

    if (options.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.config.model,
        messages,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens || 4096,
        },
      }),
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk: OllamaStreamChunk = JSON.parse(line);
            yield chunk;
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  }

  /**
   * Simple completion (no chat history)
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt,
    });
    return response.message.content;
  }

  /**
   * Generate embeddings (if supported by model)
   */
  async embed(text: string, model?: string): Promise<number[]> {
    const response = await fetch(`${this.config.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'nomic-embed-text',
        prompt: text,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Embedding error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  /**
   * Get current configuration
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  /**
   * Update model
   */
  setModel(model: string): void {
    this.config.model = model;
  }
}

export const createOllamaClient = (config?: Partial<OllamaConfig>) => new OllamaClient(config);
