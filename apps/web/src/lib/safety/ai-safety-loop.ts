/**
 * AI Safety Loop with Teacher Override
 *
 * Three-stage protection inspired by MagicSchool's approach,
 * extended with teacher controls and real-time transcript visibility.
 *
 * Frame → Audit → Refine → Teacher Override
 */

export interface SafetyConfig {
  // Frame stage: structure inputs
  allowedTopics: string[];
  blockedTopics: string[];
  maxPromptLength: number;
  requireTopicRelevance: boolean;
  ageGroup: 'elementary' | 'middle' | 'high' | 'adult';

  // Audit stage: check outputs
  checkForHarmfulContent: boolean;
  checkForInaccuracy: boolean;
  checkForBias: boolean;
  checkForAgeAppropriateness: boolean;
  determinsiticVerification: boolean;

  // Teacher override settings
  teacherCanPauseRooms: boolean;
  teacherCanSeeTranscripts: boolean;
  teacherCanOverrideAI: boolean;
  teacherAlertThreshold: 'low' | 'medium' | 'high';
}

export interface FrameResult {
  passed: boolean;
  modifiedPrompt?: string;
  blockedReason?: string;
  topicRelevance: number;
  safetyFlags: SafetyFlag[];
}

export interface AuditResult {
  passed: boolean;
  issues: AuditIssue[];
  safetyScore: number; // 0-1
  requiresTeacherReview: boolean;
  modifiedResponse?: string;
}

export interface SafetyFlag {
  type: 'off_topic' | 'harmful' | 'inappropriate' | 'academic_integrity' | 'personal_info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export interface AuditIssue {
  type: 'inaccuracy' | 'bias' | 'harmful_content' | 'age_inappropriate' | 'unsupported_claim';
  severity: 'low' | 'medium' | 'high';
  location: string;
  details: string;
  suggestion?: string;
}

export interface TeacherOverride {
  id: string;
  roomId: string;
  teacherId: string;
  action: 'pause_room' | 'edit_response' | 'block_topic' | 'allow_topic' | 'add_instruction';
  details: string;
  timestamp: Date;
}

export interface SafetyTranscript {
  sessionId: string;
  roomId?: string;
  entries: TranscriptEntry[];
  safetyFlags: SafetyFlag[];
  teacherOverrides: TeacherOverride[];
}

export interface TranscriptEntry {
  timestamp: Date;
  role: 'student' | 'ai' | 'system';
  content: string;
  safetyScore: number;
  flags: SafetyFlag[];
}

// Pattern databases
const HARMFUL_PATTERNS = [
  /how\s+to\s+(?:make|build|create)\s+(?:a\s+)?(?:bomb|weapon|explosive)/i,
  /how\s+to\s+(?:hack|break\s+into)/i,
  /how\s+to\s+(?:hurt|harm|kill)/i,
  /self[- ]?harm/i,
  /suicide\s+methods/i,
];

const ACADEMIC_INTEGRITY_PATTERNS = [
  /write\s+(?:my|this|the)\s+(?:essay|paper|assignment|homework)\s+for\s+me/i,
  /give\s+me\s+the\s+(?:answers?|solutions?)\s+to\s+(?:this|my|the)\s+(?:test|exam|quiz)/i,
  /do\s+(?:my|this)\s+homework/i,
];

const PERSONAL_INFO_PATTERNS = [
  /\b(?:my|their)\s+(?:address|phone|social\s+security|credit\s+card)\b/i,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
  /\b\d{3}[-]?\d{2}[-]?\d{4}\b/, // SSN pattern
];

const AGE_INAPPROPRIATE: Record<string, RegExp[]> = {
  elementary: [
    /\b(?:sex|drugs?|alcohol|violence|death)\b/i,
  ],
  middle: [
    /\b(?:drugs?\s+use|alcohol\s+abuse)\b/i,
  ],
  high: [],
  adult: [],
};

/**
 * FRAME Stage: Structure and filter incoming prompts
 */
export function framePrompt(
  prompt: string,
  config: SafetyConfig
): FrameResult {
  const flags: SafetyFlag[] = [];
  let passed = true;
  let modifiedPrompt = prompt;

  // Check prompt length
  if (prompt.length > config.maxPromptLength) {
    modifiedPrompt = prompt.slice(0, config.maxPromptLength);
    flags.push({
      type: 'off_topic',
      severity: 'low',
      details: 'Prompt truncated to maximum length',
    });
  }

  // Check for harmful content
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(prompt)) {
      flags.push({
        type: 'harmful',
        severity: 'critical',
        details: 'Prompt contains potentially harmful request',
      });
      passed = false;
    }
  }

  // Check academic integrity
  for (const pattern of ACADEMIC_INTEGRITY_PATTERNS) {
    if (pattern.test(prompt)) {
      flags.push({
        type: 'academic_integrity',
        severity: 'medium',
        details: 'Prompt may be asking for direct answers to assignments',
      });
      // Don't block, but modify the response approach
      modifiedPrompt = `[ACADEMIC INTEGRITY NOTE: Guide the student through the problem using Socratic questioning. Do not provide direct answers.]\n\n${prompt}`;
    }
  }

  // Check for personal info
  for (const pattern of PERSONAL_INFO_PATTERNS) {
    if (pattern.test(prompt)) {
      flags.push({
        type: 'personal_info',
        severity: 'high',
        details: 'Prompt may contain personal information',
      });
      // Redact personal info
      modifiedPrompt = modifiedPrompt.replace(pattern, '[REDACTED]');
    }
  }

  // Check age appropriateness
  const agePatterns = AGE_INAPPROPRIATE[config.ageGroup] || [];
  for (const pattern of agePatterns) {
    if (pattern.test(prompt)) {
      flags.push({
        type: 'inappropriate',
        severity: 'medium',
        details: `Content may not be appropriate for ${config.ageGroup} age group`,
      });
    }
  }

  // Check blocked topics
  const promptLower = prompt.toLowerCase();
  for (const topic of config.blockedTopics) {
    if (promptLower.includes(topic.toLowerCase())) {
      flags.push({
        type: 'off_topic',
        severity: 'medium',
        details: `Topic "${topic}" is blocked in this room`,
      });
      passed = false;
    }
  }

  // Calculate topic relevance
  let topicRelevance = 0.5;
  if (config.allowedTopics.length > 0) {
    const relevant = config.allowedTopics.some(t => promptLower.includes(t.toLowerCase()));
    topicRelevance = relevant ? 0.9 : 0.3;
  }

  return {
    passed,
    modifiedPrompt: passed ? modifiedPrompt : undefined,
    blockedReason: passed ? undefined : flags.find(f => f.severity === 'critical')?.details || 'Content blocked by safety policy',
    topicRelevance,
    safetyFlags: flags,
  };
}

/**
 * AUDIT Stage: Check AI responses for safety and accuracy
 */
export function auditResponse(
  response: string,
  config: SafetyConfig
): AuditResult {
  const issues: AuditIssue[] = [];
  let safetyScore = 1.0;
  let requiresTeacherReview = false;

  // Check for harmful content in response
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(response)) {
      issues.push({
        type: 'harmful_content',
        severity: 'high',
        location: 'response',
        details: 'Response contains potentially harmful content',
        suggestion: 'Remove harmful content and redirect to educational material',
      });
      safetyScore -= 0.5;
      requiresTeacherReview = true;
    }
  }

  // Check age appropriateness
  const agePatterns = AGE_INAPPROPRIATE[config.ageGroup] || [];
  for (const pattern of agePatterns) {
    if (pattern.test(response)) {
      issues.push({
        type: 'age_inappropriate',
        severity: 'medium',
        location: 'response',
        details: 'Response may not be age-appropriate',
        suggestion: 'Rewrite using age-appropriate language',
      });
      safetyScore -= 0.2;
    }
  }

  // Check for unsupported claims
  const claimPatterns = [
    /\b(?:always|never|everyone|nobody)\s+(?:does|is|has|will)\b/i,
    /\b(?:proven|guaranteed|certainly|definitely)\b/i,
  ];
  for (const pattern of claimPatterns) {
    if (pattern.test(response)) {
      issues.push({
        type: 'unsupported_claim',
        severity: 'low',
        location: 'response',
        details: 'Response contains absolute claims that may not be fully supported',
        suggestion: 'Add qualifiers or cite sources',
      });
      safetyScore -= 0.05;
    }
  }

  // Determine if teacher review is needed based on threshold
  if (config.teacherAlertThreshold === 'low' && issues.length > 0) {
    requiresTeacherReview = true;
  } else if (config.teacherAlertThreshold === 'medium' && issues.some(i => i.severity !== 'low')) {
    requiresTeacherReview = true;
  } else if (config.teacherAlertThreshold === 'high' && issues.some(i => i.severity === 'high')) {
    requiresTeacherReview = true;
  }

  return {
    passed: safetyScore >= 0.5,
    issues,
    safetyScore: Math.max(0, safetyScore),
    requiresTeacherReview,
    modifiedResponse: safetyScore < 0.5 ? "I can't help with that request. Let me redirect you to something more productive." : undefined,
  };
}

/**
 * REFINE Stage: Update safety rules based on usage patterns
 */
export interface RefinementSuggestion {
  type: 'add_blocked_topic' | 'relax_restriction' | 'update_age_filter' | 'custom_instruction';
  description: string;
  evidence: string;
  confidence: number;
}

export function generateRefinements(
  transcripts: SafetyTranscript[],
  _config: SafetyConfig
): RefinementSuggestion[] {
  const suggestions: RefinementSuggestion[] = [];

  // Analyze patterns across transcripts
  const allFlags = transcripts.flatMap(t => t.safetyFlags);
  const flagCounts = new Map<string, number>();

  for (const flag of allFlags) {
    const key = `${flag.type}:${flag.severity}`;
    flagCounts.set(key, (flagCounts.get(key) || 0) + 1);
  }

  // Suggest blocking topics that frequently trigger warnings
  for (const [key, count] of flagCounts) {
    if (count >= 5 && key.includes('off_topic')) {
      suggestions.push({
        type: 'add_blocked_topic',
        description: `Consider blocking frequently off-topic conversations`,
        evidence: `${count} off-topic warnings detected across sessions`,
        confidence: Math.min(0.9, count / 20),
      });
    }
  }

  // Suggest relaxing restrictions if they're too aggressive
  const blockedCount = transcripts.filter(t =>
    t.safetyFlags.some(f => f.severity === 'low')
  ).length;
  if (blockedCount > transcripts.length * 0.3) {
    suggestions.push({
      type: 'relax_restriction',
      description: 'Safety filters may be too aggressive — many low-severity flags are being raised',
      evidence: `${blockedCount} of ${transcripts.length} sessions have low-severity flags`,
      confidence: 0.6,
    });
  }

  return suggestions;
}

export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  allowedTopics: [],
  blockedTopics: [],
  maxPromptLength: 5000,
  requireTopicRelevance: false,
  ageGroup: 'middle',
  checkForHarmfulContent: true,
  checkForInaccuracy: true,
  checkForBias: true,
  checkForAgeAppropriateness: true,
  determinsiticVerification: true,
  teacherCanPauseRooms: true,
  teacherCanSeeTranscripts: true,
  teacherCanOverrideAI: true,
  teacherAlertThreshold: 'medium',
};
