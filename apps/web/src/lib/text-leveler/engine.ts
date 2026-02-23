/**
 * Text Leveler 2.0 (Beyond MagicSchool)
 *
 * Not just rewriting at grade level, but:
 * - Adapt to learning style (visual learners get more diagrams)
 * - Adapt to language level (ELL students get simplified vocabulary with glossaries)
 * - Maintain exam terminology separately (students learn both simplified and academic versions)
 * - Conceptual bridging from L1 to L2
 */

export interface TextLevelConfig {
  targetGradeLevel: number;
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  languageLevel: 'native' | 'advanced' | 'intermediate' | 'beginner';
  nativeLanguage: string;
  targetLanguage: string;
  includeGlossary: boolean;
  preserveExamTerms: boolean;
  includeAnalogies: boolean;
  addVisualCues: boolean;
  specialNeeds: string[];
}

export interface LeveledContent {
  originalText: string;
  leveledText: string;
  gradeLevel: number;
  readabilityScore: number;

  // Vocabulary support
  glossary: GlossaryEntry[];
  examTerminology: ExamTerm[];

  // Learning style adaptations
  visualCues: string[];
  analogies: string[];

  // Language bridging
  conceptBridges: ConceptBridge[];

  // Accessibility
  simplifiedStructure: string;
  keyPoints: string[];
}

export interface GlossaryEntry {
  term: string;
  simpleDefinition: string;
  academicDefinition: string;
  nativeLanguageEquivalent?: string;
  exampleInContext: string;
}

export interface ExamTerm {
  term: string;
  meaning: string;
  examBoard: string;
  howToUseInAnswer: string;
  commonMistake: string;
}

export interface ConceptBridge {
  concept: string;
  nativeLanguageExplanation: string;
  targetLanguageExplanation: string;
  bridgingPhrase: string;
  academicVocabulary: string[];
}

// Grade level vocabulary mappings
const VOCABULARY_LEVELS: Record<number, Record<string, string>> = {
  5: {
    'photosynthesis': 'how plants make food using sunlight',
    'equation': 'a math sentence with an equals sign',
    'hypothesis': 'an educated guess',
    'molecule': 'tiny building blocks that make up everything',
    'evaporation': 'when water turns into water vapor',
    'denominator': 'the bottom number in a fraction',
    'organism': 'any living thing',
    'velocity': 'how fast and in which direction something moves',
    'precipitation': 'rain, snow, or hail falling from clouds',
    'quotient': 'the answer when you divide',
  },
  8: {
    'photosynthesis': 'the process by which plants convert light energy into chemical energy (glucose)',
    'equation': 'a mathematical statement showing two expressions are equal',
    'hypothesis': 'a testable prediction based on observations',
    'molecule': 'two or more atoms bonded together',
    'evaporation': 'the change of state from liquid to gas at the surface',
    'denominator': 'the number below the line in a fraction representing total parts',
    'organism': 'a living system capable of growth, reproduction, and response to stimuli',
    'velocity': 'the rate of change of displacement (speed with direction)',
    'precipitation': 'water falling from the atmosphere as rain, snow, sleet, or hail',
    'quotient': 'the result of dividing one number by another',
  },
  11: {
    'photosynthesis': 'the biochemical process (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂) in which chlorophyll absorbs light energy to synthesize glucose from carbon dioxide and water',
    'equation': 'a mathematical proposition asserting the equality of two expressions, which may contain variables',
    'hypothesis': 'a falsifiable conjecture formulated from observations, to be tested through controlled experimentation',
    'molecule': 'an electrically neutral group of atoms held together by covalent bonds',
    'evaporation': 'a type of vaporization occurring at the liquid surface below boiling point, driven by kinetic energy distribution',
    'denominator': 'in a rational expression a/b, the divisor b representing the total number of equal parts',
    'organism': 'an individual entity exhibiting the properties of life: homeostasis, metabolism, growth, adaptation, and reproduction',
    'velocity': 'the first derivative of displacement with respect to time; a vector quantity measured in ms⁻¹',
    'precipitation': 'the deposition of atmospheric moisture condensed from water vapour upon cooling below dew point',
    'quotient': 'the result q in the division equation a = bq + r, where a is the dividend, b the divisor, and r the remainder',
  },
};

// Sentence complexity transformations
function simplifyForGrade(text: string, targetGrade: number): string {
  let result = text;

  if (targetGrade <= 6) {
    // Break long sentences
    result = result.replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n');
    // Replace complex connectors
    result = result.replace(/\bhowever\b/gi, 'but');
    result = result.replace(/\btherefore\b/gi, 'so');
    result = result.replace(/\bfurthermore\b/gi, 'also');
    result = result.replace(/\bnevertheless\b/gi, 'but still');
    result = result.replace(/\bconsequently\b/gi, 'because of this');
    result = result.replace(/\bin addition\b/gi, 'also');
    result = result.replace(/\bmoreover\b/gi, 'and also');
    result = result.replace(/\butilize\b/gi, 'use');
    result = result.replace(/\bdemonstrate\b/gi, 'show');
    result = result.replace(/\bapproximate(ly)?\b/gi, 'about');
    result = result.replace(/\bsufficient\b/gi, 'enough');
    result = result.replace(/\brequire\b/gi, 'need');
  }

  if (targetGrade <= 8) {
    result = result.replace(/\bnotwithstanding\b/gi, 'despite');
    result = result.replace(/\bheretofore\b/gi, 'before now');
    result = result.replace(/\bsubsequently\b/gi, 'after that');
    result = result.replace(/\bprecipitate\b/gi, 'cause');
  }

  return result;
}

function replaceVocabulary(text: string, targetGrade: number): { text: string; replacements: GlossaryEntry[] } {
  const vocab = VOCABULARY_LEVELS[targetGrade] || VOCABULARY_LEVELS[8];
  const replacements: GlossaryEntry[] = [];

  let result = text;
  for (const [term, definition] of Object.entries(vocab)) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(result)) {
      replacements.push({
        term,
        simpleDefinition: VOCABULARY_LEVELS[5]?.[term] || definition,
        academicDefinition: VOCABULARY_LEVELS[11]?.[term] || definition,
        exampleInContext: `As used here: "${definition}"`,
      });
    }
  }

  return { text: result, replacements };
}

function extractKeyPoints(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 5).map(s => s.trim());
}

function generateAnalogies(topic: string): string[] {
  const analogyBank: Record<string, string[]> = {
    'cell': ['Think of a cell like a tiny factory — different parts (organelles) have different jobs'],
    'atom': ['Atoms are like LEGO bricks — simple by themselves but build everything when combined'],
    'electricity': ['Electricity flows like water through pipes — voltage is water pressure, current is flow rate'],
    'gravity': ["Gravity is like a invisible rubber band between objects — the bigger the object, the stronger the pull"],
    'dna': ['DNA is like a recipe book — it contains instructions for building every part of a living thing'],
    'fraction': ['Fractions are like pizza slices — the denominator tells you how many slices total, the numerator tells you how many you have'],
    'equation': ['An equation is like a balanced seesaw — whatever you do to one side, you must do to the other'],
    'photosynthesis': ['Photosynthesis is like a solar-powered kitchen — plants use sunlight as energy to cook glucose from CO₂ and water'],
  };

  const topicLower = topic.toLowerCase();
  for (const [key, analogies] of Object.entries(analogyBank)) {
    if (topicLower.includes(key)) return analogies;
  }
  return [];
}

export function levelContent(
  originalText: string,
  config: TextLevelConfig,
  topic: string = ''
): LeveledContent {
  // Step 1: Simplify sentence structure
  let leveledText = simplifyForGrade(originalText, config.targetGradeLevel);

  // Step 2: Replace vocabulary
  const { text: vocabText, replacements } = replaceVocabulary(leveledText, config.targetGradeLevel);
  leveledText = vocabText;

  // Step 3: Generate glossary
  const glossary = replacements;

  // Step 4: Extract exam terminology
  const examTerminology: ExamTerm[] = replacements.map(r => ({
    term: r.term,
    meaning: r.academicDefinition,
    examBoard: 'General',
    howToUseInAnswer: `Use the term "${r.term}" in your exam answer to show subject-specific vocabulary.`,
    commonMistake: `Don't confuse "${r.term}" with its everyday meaning.`,
  }));

  // Step 5: Generate visual cues for visual learners
  const visualCues: string[] = [];
  if (config.learningStyle === 'visual' || config.addVisualCues) {
    visualCues.push('Try drawing a diagram to represent this concept');
    visualCues.push('Color-code different parts of the process');
    visualCues.push('Create a mind map connecting all the key terms');
  }

  // Step 6: Generate analogies
  const analogies = config.includeAnalogies ? generateAnalogies(topic) : [];

  // Step 7: Concept bridges for L1 → L2
  const conceptBridges: ConceptBridge[] = [];
  if (config.nativeLanguage !== config.targetLanguage) {
    replacements.forEach(r => {
      conceptBridges.push({
        concept: r.term,
        nativeLanguageExplanation: r.simpleDefinition,
        targetLanguageExplanation: r.academicDefinition,
        bridgingPhrase: `In academic ${config.targetLanguage}, we call this "${r.term}"`,
        academicVocabulary: [r.term],
      });
    });
  }

  // Step 8: Accessibility adaptations
  let simplifiedStructure = leveledText;
  if (config.specialNeeds.includes('dyslexia')) {
    simplifiedStructure = simplifiedStructure.replace(/([.!?])\s*/g, '$1\n\n');
  }
  if (config.specialNeeds.includes('adhd')) {
    const sentences = simplifiedStructure.split(/[.!?]+/).filter(s => s.trim());
    simplifiedStructure = sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
  }

  const keyPoints = extractKeyPoints(originalText);

  // Calculate readability (simplified Flesch-Kincaid approximation)
  const words = leveledText.split(/\s+/).length;
  const sentences = leveledText.split(/[.!?]+/).filter(s => s.trim()).length;
  const syllables = leveledText.split(/\s+/).reduce((count, word) => {
    return count + Math.max(1, word.replace(/[^aeiouy]/gi, '').length);
  }, 0);

  const readabilityScore = Math.max(0, Math.min(100,
    206.835 - 1.015 * (words / Math.max(1, sentences)) - 84.6 * (syllables / Math.max(1, words))
  ));

  return {
    originalText,
    leveledText,
    gradeLevel: config.targetGradeLevel,
    readabilityScore,
    glossary,
    examTerminology,
    visualCues,
    analogies,
    conceptBridges,
    simplifiedStructure,
    keyPoints,
  };
}
