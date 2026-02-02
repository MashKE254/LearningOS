"use strict";
/**
 * EduForge Hierarchical Model Router
 *
 * Routes queries to appropriate AI models based on cognitive complexity:
 * - Haiku (Fast): Intent classification, simple recall, dashboard updates
 * - Sonnet (Balanced): Standard explanations, practice problems, essay feedback
 * - Opus (Deep): Complex Socratic dialogue, debugging, high-stakes exam prep
 * - Verified (Deterministic): Mathematical proofs (Wolfram), chemistry (RDKit), code (Judge0)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelRouter = exports.ModelRouter = exports.QueryComplexitySchema = exports.MODELS = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const zod_1 = require("zod");
// Model definitions
exports.MODELS = {
    HAIKU: 'claude-3-haiku-20240307',
    SONNET: 'claude-sonnet-4-20250514',
    OPUS: 'claude-opus-4-20250514',
};
// Query complexity classification
exports.QueryComplexitySchema = zod_1.z.object({
    tier: zod_1.z.enum(['HAIKU', 'SONNET', 'OPUS', 'VERIFIED']),
    confidence: zod_1.z.number().min(0).max(1),
    reasoning: zod_1.z.string(),
    requiresVerification: zod_1.z.boolean(),
    verificationType: zod_1.z.enum(['MATH', 'CHEMISTRY', 'CODE', 'NONE']).optional(),
});
// Complexity indicators for routing
const OPUS_INDICATORS = [
    'debug', 'why doesn\'t', 'explain deeply', 'philosophy',
    'prove', 'derive', 'complex', 'struggling with',
    'help me understand', 'exam in', 'crisis', 'final exam',
    'socratic', 'walk me through', 'step by step reasoning',
];
const SONNET_INDICATORS = [
    'explain', 'help with', 'practice', 'example',
    'essay', 'feedback', 'review', 'check my work',
    'solve', 'calculate', 'what is', 'how do',
];
const VERIFICATION_INDICATORS = {
    MATH: ['equation', 'integral', 'derivative', 'proof', 'calculate', 'solve for', '=', 'simplify'],
    CHEMISTRY: ['reaction', 'mechanism', 'molecule', 'compound', 'balance', 'structural formula'],
    CODE: ['code', 'function', 'error', 'bug', 'compile', 'run', 'execute', 'program'],
};
class ModelRouter {
    anthropic;
    usageMetrics;
    constructor(apiKey) {
        this.anthropic = new sdk_1.default({
            apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
        });
        this.usageMetrics = new Map([
            ['HAIKU', { tokens: 0, calls: 0 }],
            ['SONNET', { tokens: 0, calls: 0 }],
            ['OPUS', { tokens: 0, calls: 0 }],
        ]);
    }
    /**
     * Classify query complexity and determine routing
     */
    async classifyQuery(query, context) {
        const lowerQuery = query.toLowerCase();
        // Check for verification needs first
        let verificationType = 'NONE';
        for (const [type, indicators] of Object.entries(VERIFICATION_INDICATORS)) {
            if (indicators.some(ind => lowerQuery.includes(ind))) {
                verificationType = type;
                break;
            }
        }
        // Crisis mode detection (exam prep within tight deadline)
        const isCrisisMode = context?.sessionMode === 'EXAM_PREP' ||
            /exam in \d+ (day|hour)/i.test(query) ||
            /final (exam|test)/i.test(query);
        // Check for Opus-level complexity
        const hasOpusIndicators = OPUS_INDICATORS.some(ind => lowerQuery.includes(ind));
        const hasLongConversation = (context?.conversationHistory?.length || 0) > 10;
        const isStruggling = context?.studentProfile?.masteryLevel !== undefined &&
            context.studentProfile.masteryLevel < 0.3;
        // Determine tier
        let tier;
        let confidence;
        let reasoning;
        if (verificationType !== 'NONE') {
            tier = 'VERIFIED';
            confidence = 0.95;
            reasoning = `Query requires ${verificationType} verification for accuracy`;
        }
        else if (isCrisisMode || hasOpusIndicators || isStruggling) {
            tier = 'OPUS';
            confidence = 0.85;
            reasoning = isCrisisMode
                ? 'High-stakes exam preparation requires deep reasoning'
                : isStruggling
                    ? 'Student struggling - needs patient Socratic dialogue'
                    : 'Complex query requiring multi-step reasoning';
        }
        else if (SONNET_INDICATORS.some(ind => lowerQuery.includes(ind)) || hasLongConversation) {
            tier = 'SONNET';
            confidence = 0.8;
            reasoning = 'Standard educational query - balanced model appropriate';
        }
        else {
            tier = 'HAIKU';
            confidence = 0.9;
            reasoning = 'Simple query - fast response appropriate';
        }
        return {
            tier,
            confidence,
            reasoning,
            requiresVerification: verificationType !== 'NONE',
            verificationType: verificationType !== 'NONE' ? verificationType : undefined,
        };
    }
    /**
     * Execute a query with automatic model routing
     */
    async route(query, systemPrompt, options) {
        // Classify the query
        const complexity = await this.classifyQuery(query, options?.context);
        // Determine model to use
        const tier = options?.forceTier || (complexity.tier === 'VERIFIED' ? 'SONNET' : complexity.tier);
        const model = exports.MODELS[tier];
        // Build messages
        const messages = [];
        // Add conversation history if available
        if (options?.context?.conversationHistory) {
            for (const msg of options.context.conversationHistory) {
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }
        }
        // Add current query
        messages.push({ role: 'user', content: query });
        // Execute the request
        const response = await this.anthropic.messages.create({
            model,
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature ?? 0.7,
            system: systemPrompt,
            messages,
        });
        // Extract text response
        const textContent = response.content.find(c => c.type === 'text');
        const responseText = textContent?.type === 'text' ? textContent.text : '';
        // Update metrics
        const metrics = this.usageMetrics.get(tier);
        metrics.tokens += response.usage.input_tokens + response.usage.output_tokens;
        metrics.calls += 1;
        return {
            response: responseText,
            modelUsed: model,
            complexity,
            usage: {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            },
        };
    }
    /**
     * Quick classification using Haiku
     */
    async quickClassify(input, options) {
        const response = await this.anthropic.messages.create({
            model: exports.MODELS.HAIKU,
            max_tokens: 100,
            temperature: 0,
            system: 'You are a classifier. Respond with ONLY one of the provided options.',
            messages: [{
                    role: 'user',
                    content: `Classify the following input into one of these categories: ${options.join(', ')}\n\nInput: "${input}"\n\nCategory:`,
                }],
        });
        const textContent = response.content.find(c => c.type === 'text');
        return textContent?.type === 'text' ? textContent.text.trim() : options[0];
    }
    /**
     * Get usage metrics
     */
    getMetrics() {
        const costPerMillion = {
            HAIKU: { input: 0.25, output: 1.25 },
            SONNET: { input: 3, output: 15 },
            OPUS: { input: 15, output: 75 },
        };
        const result = {};
        for (const [tier, metrics] of this.usageMetrics) {
            const costs = costPerMillion[tier];
            // Rough estimate assuming 50/50 input/output split
            const estimatedCost = (metrics.tokens / 2 / 1000000) * (costs.input + costs.output);
            result[tier] = { ...metrics, estimatedCost };
        }
        return result;
    }
    /**
     * Reset metrics (for testing or periodic resets)
     */
    resetMetrics() {
        for (const key of this.usageMetrics.keys()) {
            this.usageMetrics.set(key, { tokens: 0, calls: 0 });
        }
    }
}
exports.ModelRouter = ModelRouter;
const createModelRouter = (apiKey) => new ModelRouter(apiKey);
exports.createModelRouter = createModelRouter;
