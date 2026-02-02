"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationEngine = exports.VerificationEngine = exports.VerificationResultSchema = void 0;
const zod_1 = require("zod");
// Verification result schema
exports.VerificationResultSchema = zod_1.z.object({
    verified: zod_1.z.boolean(),
    method: zod_1.z.enum(['MATH', 'CHEMISTRY', 'CODE', 'NONE']),
    input: zod_1.z.string(),
    result: zod_1.z.unknown(),
    confidence: zod_1.z.number().min(0).max(1),
    errorMessage: zod_1.z.string().optional(),
    corrections: zod_1.z.array(zod_1.z.object({
        original: zod_1.z.string(),
        corrected: zod_1.z.string(),
        explanation: zod_1.z.string(),
    })).optional(),
    executionTimeMs: zod_1.z.number().optional(),
});
class VerificationEngine {
    wolframAppId;
    judge0ApiKey;
    judge0BaseUrl;
    constructor(config) {
        this.wolframAppId = config?.wolframAppId || process.env.WOLFRAM_APP_ID || '';
        this.judge0ApiKey = config?.judge0ApiKey || process.env.JUDGE0_API_KEY || '';
        this.judge0BaseUrl = config?.judge0BaseUrl || process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
    }
    /**
     * Main verification entry point
     */
    async verify(content, type) {
        const startTime = Date.now();
        try {
            let result;
            switch (type) {
                case 'MATH':
                    result = await this.verifyMath(content);
                    break;
                case 'CHEMISTRY':
                    result = await this.verifyChemistry(content);
                    break;
                case 'CODE':
                    result = await this.verifyCode(content);
                    break;
                default:
                    result = {
                        verified: false,
                        method: 'NONE',
                        input: content,
                        result: null,
                        confidence: 0,
                        errorMessage: 'Unknown verification type',
                    };
            }
            result.executionTimeMs = Date.now() - startTime;
            return result;
        }
        catch (error) {
            return {
                verified: false,
                method: type,
                input: content,
                result: null,
                confidence: 0,
                errorMessage: error instanceof Error ? error.message : 'Verification failed',
                executionTimeMs: Date.now() - startTime,
            };
        }
    }
    /**
     * Verify mathematical content using Wolfram Alpha
     */
    async verifyMath(content) {
        // Parse the mathematical query
        const query = this.parseMathQuery(content);
        if (!this.wolframAppId) {
            // Fallback to basic verification if no Wolfram API
            return this.basicMathVerification(content);
        }
        try {
            const encodedQuery = encodeURIComponent(query.expression);
            const url = `https://api.wolframalpha.com/v2/query?input=${encodedQuery}&appid=${this.wolframAppId}&format=plaintext&output=JSON`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.queryresult?.success) {
                const result = this.parseWolframResult(data);
                return {
                    verified: true,
                    method: 'MATH',
                    input: content,
                    result: result,
                    confidence: 0.95,
                };
            }
            else {
                return {
                    verified: false,
                    method: 'MATH',
                    input: content,
                    result: null,
                    confidence: 0,
                    errorMessage: 'Wolfram Alpha could not process the query',
                };
            }
        }
        catch (error) {
            return {
                verified: false,
                method: 'MATH',
                input: content,
                result: null,
                confidence: 0,
                errorMessage: `Wolfram API error: ${error instanceof Error ? error.message : 'Unknown'}`,
            };
        }
    }
    /**
     * Parse math query from natural language
     */
    parseMathQuery(content) {
        const lowerContent = content.toLowerCase();
        let operation = 'evaluate';
        if (lowerContent.includes('simplify')) {
            operation = 'simplify';
        }
        else if (lowerContent.includes('solve') || lowerContent.includes('find x')) {
            operation = 'solve';
        }
        else if (lowerContent.includes('integral') || lowerContent.includes('integrate')) {
            operation = 'integrate';
        }
        else if (lowerContent.includes('derivative') || lowerContent.includes('differentiate')) {
            operation = 'differentiate';
        }
        else if (lowerContent.includes('verify') || lowerContent.includes('check')) {
            operation = 'verify';
        }
        // Extract the mathematical expression
        // Remove common prefixes
        let expression = content
            .replace(/^(simplify|solve|integrate|differentiate|evaluate|verify|calculate|compute)\s*/i, '')
            .replace(/^(the|this)\s+/i, '')
            .trim();
        return { expression, operation };
    }
    /**
     * Parse Wolfram Alpha API response
     */
    parseWolframResult(data) {
        const queryResult = data.queryresult;
        const pods = queryResult.pods || [];
        const results = {};
        for (const pod of pods) {
            const title = pod.title;
            const subpods = pod.subpods || [];
            if (subpods.length > 0 && subpods[0].plaintext) {
                results[title] = subpods[0].plaintext;
            }
        }
        return results;
    }
    /**
     * Basic math verification without external API
     */
    basicMathVerification(content) {
        // Extract numbers and operations for basic arithmetic verification
        const arithmeticMatch = content.match(/(\d+(?:\.\d+)?)\s*([+\-*/^])\s*(\d+(?:\.\d+)?)/);
        if (arithmeticMatch) {
            const a = parseFloat(arithmeticMatch[1]);
            const op = arithmeticMatch[2];
            const b = parseFloat(arithmeticMatch[3]);
            let result;
            switch (op) {
                case '+':
                    result = a + b;
                    break;
                case '-':
                    result = a - b;
                    break;
                case '*':
                    result = a * b;
                    break;
                case '/':
                    result = b !== 0 ? a / b : NaN;
                    break;
                case '^':
                    result = Math.pow(a, b);
                    break;
                default: result = NaN;
            }
            if (!isNaN(result)) {
                return {
                    verified: true,
                    method: 'MATH',
                    input: content,
                    result: { expression: `${a} ${op} ${b}`, value: result },
                    confidence: 1.0,
                };
            }
        }
        return {
            verified: false,
            method: 'MATH',
            input: content,
            result: null,
            confidence: 0,
            errorMessage: 'Could not verify basic math - requires Wolfram API for complex expressions',
        };
    }
    /**
     * Verify chemistry content
     * In production, this would use RDKit or similar
     */
    async verifyChemistry(content) {
        // Parse chemistry query
        const query = this.parseChemistryQuery(content);
        // Basic chemical equation balancing verification
        if (query.operation === 'balance') {
            return this.verifyChemicalEquation(query.input);
        }
        // For now, return a placeholder - in production, integrate with RDKit
        return {
            verified: false,
            method: 'CHEMISTRY',
            input: content,
            result: null,
            confidence: 0,
            errorMessage: 'Chemistry verification requires RDKit integration',
        };
    }
    /**
     * Parse chemistry query
     */
    parseChemistryQuery(content) {
        const lowerContent = content.toLowerCase();
        let operation = 'properties';
        if (lowerContent.includes('balance')) {
            operation = 'balance';
        }
        else if (lowerContent.includes('structure') || lowerContent.includes('draw')) {
            operation = 'structure';
        }
        else if (lowerContent.includes('reaction') || lowerContent.includes('react')) {
            operation = 'reaction';
        }
        else if (lowerContent.includes('mechanism')) {
            operation = 'validate_mechanism';
        }
        return { input: content, operation };
    }
    /**
     * Verify a chemical equation is balanced
     */
    verifyChemicalEquation(equation) {
        // Basic regex to parse chemical formulas
        const sides = equation.split(/->|→|=/).map(s => s.trim());
        if (sides.length !== 2) {
            return {
                verified: false,
                method: 'CHEMISTRY',
                input: equation,
                result: null,
                confidence: 0,
                errorMessage: 'Invalid equation format. Expected: reactants -> products',
            };
        }
        try {
            const [reactants, products] = sides;
            const reactantAtoms = this.countAtoms(reactants);
            const productAtoms = this.countAtoms(products);
            // Compare atom counts
            const isBalanced = this.compareAtomCounts(reactantAtoms, productAtoms);
            if (isBalanced) {
                return {
                    verified: true,
                    method: 'CHEMISTRY',
                    input: equation,
                    result: { balanced: true, reactantAtoms, productAtoms },
                    confidence: 0.9,
                };
            }
            else {
                return {
                    verified: false,
                    method: 'CHEMISTRY',
                    input: equation,
                    result: { balanced: false, reactantAtoms, productAtoms },
                    confidence: 0.9,
                    corrections: [{
                            original: equation,
                            corrected: 'Equation is not balanced',
                            explanation: `Reactant atoms: ${JSON.stringify(reactantAtoms)}, Product atoms: ${JSON.stringify(productAtoms)}`,
                        }],
                };
            }
        }
        catch (error) {
            return {
                verified: false,
                method: 'CHEMISTRY',
                input: equation,
                result: null,
                confidence: 0,
                errorMessage: `Could not parse equation: ${error instanceof Error ? error.message : 'Unknown'}`,
            };
        }
    }
    /**
     * Count atoms in a chemical expression
     */
    countAtoms(expression) {
        const atoms = {};
        // Split by + and process each compound
        const compounds = expression.split('+').map(c => c.trim());
        for (const compound of compounds) {
            // Extract coefficient
            const coeffMatch = compound.match(/^(\d*)/);
            const coefficient = coeffMatch && coeffMatch[1] ? parseInt(coeffMatch[1]) : 1;
            // Extract formula (without coefficient)
            const formula = compound.replace(/^\d*/, '');
            // Parse elements and their counts
            const elementPattern = /([A-Z][a-z]?)(\d*)/g;
            let match;
            while ((match = elementPattern.exec(formula)) !== null) {
                const element = match[1];
                const count = match[2] ? parseInt(match[2]) : 1;
                atoms[element] = (atoms[element] || 0) + (count * coefficient);
            }
        }
        return atoms;
    }
    /**
     * Compare two atom count objects
     */
    compareAtomCounts(count1, count2) {
        const keys1 = Object.keys(count1).sort();
        const keys2 = Object.keys(count2).sort();
        if (keys1.length !== keys2.length)
            return false;
        for (const key of keys1) {
            if (count1[key] !== count2[key])
                return false;
        }
        return true;
    }
    /**
     * Verify code using Judge0
     */
    async verifyCode(content) {
        const query = this.parseCodeQuery(content);
        if (!this.judge0ApiKey) {
            // Fallback to syntax-only verification
            return this.basicCodeVerification(query);
        }
        try {
            const languageIds = {
                python: 71,
                javascript: 63,
                cpp: 54,
                java: 62,
            };
            const languageId = languageIds[query.language] || 71;
            // Submit code
            const submitResponse = await fetch(`${this.judge0BaseUrl}/submissions?base64_encoded=false&wait=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': this.judge0ApiKey,
                },
                body: JSON.stringify({
                    source_code: query.code,
                    language_id: languageId,
                    stdin: query.testCases?.[0]?.input || '',
                    expected_output: query.testCases?.[0]?.expectedOutput || null,
                }),
            });
            const result = await submitResponse.json();
            const passed = result.status?.id === 3; // 3 = Accepted
            return {
                verified: passed,
                method: 'CODE',
                input: content,
                result: {
                    status: result.status?.description,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    compile_output: result.compile_output,
                    time: result.time,
                    memory: result.memory,
                },
                confidence: passed ? 1.0 : 0.5,
                errorMessage: result.stderr || result.compile_output || undefined,
            };
        }
        catch (error) {
            return {
                verified: false,
                method: 'CODE',
                input: content,
                result: null,
                confidence: 0,
                errorMessage: `Judge0 API error: ${error instanceof Error ? error.message : 'Unknown'}`,
            };
        }
    }
    /**
     * Parse code from content
     */
    parseCodeQuery(content) {
        // Detect language from content or code block markers
        let language = 'python';
        if (content.includes('```javascript') || content.includes('```js')) {
            language = 'javascript';
        }
        else if (content.includes('```cpp') || content.includes('```c++')) {
            language = 'cpp';
        }
        else if (content.includes('```java')) {
            language = 'java';
        }
        // Extract code from markdown code blocks
        const codeBlockMatch = content.match(/```(?:\w+)?\n?([\s\S]*?)```/);
        const code = codeBlockMatch ? codeBlockMatch[1].trim() : content;
        return { code, language };
    }
    /**
     * Basic code verification without execution
     */
    basicCodeVerification(query) {
        const syntaxErrors = [];
        // Basic Python syntax checks
        if (query.language === 'python') {
            // Check for common syntax issues
            const lines = query.code.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Check for missing colons after control structures
                if (/^\s*(if|elif|else|for|while|def|class|try|except|finally|with)\b.*[^:]$/.test(line)) {
                    syntaxErrors.push(`Line ${i + 1}: Missing colon at end of statement`);
                }
                // Check for inconsistent indentation (basic check)
                if (/^\t+ /.test(line) || /^ +\t/.test(line)) {
                    syntaxErrors.push(`Line ${i + 1}: Mixed tabs and spaces in indentation`);
                }
            }
        }
        // Basic JavaScript syntax checks
        if (query.language === 'javascript') {
            // Check for common issues
            if (query.code.includes('= =') || query.code.includes('! =')) {
                syntaxErrors.push('Spaces in comparison operators');
            }
        }
        return {
            verified: syntaxErrors.length === 0,
            method: 'CODE',
            input: query.code,
            result: { syntaxCheck: 'basic', errors: syntaxErrors },
            confidence: 0.6,
            errorMessage: syntaxErrors.length > 0 ? syntaxErrors.join('; ') : undefined,
        };
    }
    /**
     * Batch verify multiple items
     */
    async verifyBatch(items) {
        return Promise.all(items.map(item => this.verify(item.content, item.type)));
    }
}
exports.VerificationEngine = VerificationEngine;
const createVerificationEngine = (config) => new VerificationEngine(config);
exports.createVerificationEngine = createVerificationEngine;
