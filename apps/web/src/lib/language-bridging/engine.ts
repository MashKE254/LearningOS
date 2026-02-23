/**
 * Conceptual Language Bridging System
 *
 * Goes beyond simple translation (what Sana Labs and others do):
 * - Teaches concept in native language first (L1)
 * - Bridges to target language's academic vocabulary (L2)
 * - Maintains exam terminology awareness
 * - Conceptual bridging, not phrase-matching (unlike Duolingo)
 */

export interface LanguageBridgeConfig {
  nativeLanguage: string; // L1 - student's mother tongue
  targetLanguage: string; // L2 - language of instruction/exam
  bridgeStrategy: 'full_bridge' | 'vocab_support' | 'minimal';
  includeExamTerms: boolean;
  culturalContext?: string;
}

export interface ConceptBridge {
  concept: string;
  subject: string;

  // L1 explanation (native language)
  nativeExplanation: string;
  nativeAnalogy?: string;

  // Bridge (connecting L1 understanding to L2 terminology)
  bridgingPhrase: string;
  cognates?: string[]; // Words similar in both languages

  // L2 academic vocabulary
  academicTerms: AcademicTerm[];

  // Exam awareness
  examPhrasing?: string; // How the concept appears in exams
  markSchemeTerms?: string[]; // Terms that earn marks

  // Cultural adaptation
  culturalNote?: string; // Context relevant to student's background
  localExample?: string; // Real-world example from student's culture
}

export interface AcademicTerm {
  term: string;
  language: string;
  definition: string;
  pronunciation?: string;
  usage: string; // How to use in an academic sentence
  commonMistake?: string; // Common L1 interference error
}

// Language data
interface LanguageVocab {
  [concept: string]: {
    explanation: string;
    analogy?: string;
  };
}

const LANGUAGE_DATABASE: Record<string, LanguageVocab> = {
  sw: { // Swahili
    'photosynthesis': {
      explanation: 'Usanisinuru ni njia mimea inavyotengeneza chakula kwa kutumia mwanga wa jua, maji, na hewa ya kaboni dioksidi.',
      analogy: 'Fikiria mmea kama jiko la sola — linatumia jua kupika chakula chake.',
    },
    'gravity': {
      explanation: 'Uvutano ni nguvu inayovuta vitu kuelekea katikati ya dunia. Ndiyo sababu tunaanguka chini, si juu!',
      analogy: 'Ni kama dunia ina sumaku kubwa inayovuta kila kitu.',
    },
    'equation': {
      explanation: 'Mlinganyo ni sentensi ya hesabu inayoonyesha kuwa pande mbili ni sawa.',
      analogy: 'Kama mizani — kile unachoweka upande mmoja lazima kiwe sawa na upande mwingine.',
    },
    'cell': {
      explanation: 'Seli ni kipande kidogo zaidi cha uhai. Kila kiumbe hai kinatengenezwa na seli.',
      analogy: 'Seli ni kama matofali ya nyumba — zimeunganishwa kuunda mwili mzima.',
    },
    'fraction': {
      explanation: 'Sehemu ni sehemu ya kitu kizima. Nambari ya juu inaonyesha sehemu ngapi una, nambari ya chini inaonyesha jumla ya sehemu.',
      analogy: 'Fikiria pizza iliyokatwa vipande — sehemu inaonyesha vipande ngapi unazo.',
    },
  },
  hi: { // Hindi
    'photosynthesis': {
      explanation: 'प्रकाश संश्लेषण वह प्रक्रिया है जिसमें पौधे सूर्य के प्रकाश का उपयोग करके भोजन बनाते हैं।',
      analogy: 'पौधे को एक सौर ऊर्जा रसोईघर समझें — यह सूरज की रोशनी से भोजन पकाता है।',
    },
    'gravity': {
      explanation: 'गुरुत्वाकर्षण वह बल है जो वस्तुओं को पृथ्वी के केंद्र की ओर खींचता है।',
      analogy: 'जैसे चुंबक लोहे को खींचता है, वैसे ही पृथ्वी सब कुछ अपनी ओर खींचती है।',
    },
    'equation': {
      explanation: 'समीकरण एक गणितीय वाक्य है जो दिखाता है कि दो चीज़ें बराबर हैं।',
      analogy: 'तराज़ू की तरह — जो एक तरफ है वह दूसरी तरफ बराबर होना चाहिए।',
    },
  },
  fr: { // French
    'photosynthesis': {
      explanation: "La photosynthèse est le processus par lequel les plantes fabriquent leur nourriture en utilisant la lumière du soleil.",
      analogy: 'Pensez à la plante comme une cuisine solaire — elle utilise le soleil pour préparer son repas.',
    },
    'gravity': {
      explanation: "La gravité est la force qui attire les objets vers le centre de la Terre.",
      analogy: "C'est comme si la Terre avait un aimant géant qui attire tout vers elle.",
    },
    'equation': {
      explanation: "Une équation est une phrase mathématique qui montre que deux expressions sont égales.",
      analogy: "Comme une balance — ce que vous mettez d'un côté doit être égal à l'autre côté.",
    },
  },
  es: { // Spanish
    'photosynthesis': {
      explanation: 'La fotosíntesis es el proceso por el cual las plantas producen su alimento usando la luz del sol.',
      analogy: 'Piensa en la planta como una cocina solar — usa el sol para cocinar su comida.',
    },
    'gravity': {
      explanation: 'La gravedad es la fuerza que atrae los objetos hacia el centro de la Tierra.',
      analogy: 'Es como si la Tierra tuviera un imán gigante que atrae todo hacia ella.',
    },
  },
};

const EXAM_TERMS: Record<string, { examPhrasing: string; markSchemeTerms: string[] }> = {
  'photosynthesis': {
    examPhrasing: 'Describe the process of photosynthesis, including the word equation and conditions necessary.',
    markSchemeTerms: ['light energy', 'chlorophyll', 'carbon dioxide', 'water', 'glucose', 'oxygen', 'endothermic'],
  },
  'gravity': {
    examPhrasing: 'Explain gravitational field strength and its relationship to mass and distance.',
    markSchemeTerms: ['gravitational force', 'mass', 'gravitational field strength', 'weight', 'inversely proportional', 'distance squared'],
  },
  'equation': {
    examPhrasing: 'Solve the following equation and show all working.',
    markSchemeTerms: ['substitute', 'rearrange', 'simplify', 'solve', 'verify'],
  },
  'cell': {
    examPhrasing: 'Compare and contrast animal and plant cells, with reference to their organelles.',
    markSchemeTerms: ['cell membrane', 'cytoplasm', 'nucleus', 'cell wall', 'chloroplast', 'vacuole', 'mitochondria'],
  },
};

/**
 * Generate a concept bridge between L1 and L2
 */
export function createConceptBridge(
  concept: string,
  subject: string,
  config: LanguageBridgeConfig
): ConceptBridge {
  const conceptLower = concept.toLowerCase();
  const langData = LANGUAGE_DATABASE[config.nativeLanguage];
  const conceptData = langData?.[conceptLower];
  const examData = EXAM_TERMS[conceptLower];

  // Build L1 explanation
  const nativeExplanation = conceptData?.explanation ||
    `${concept}: A key concept in ${subject}. (Translation not yet available for ${config.nativeLanguage})`;

  // Build bridging phrase
  const bridgingPhrase = config.bridgeStrategy === 'full_bridge'
    ? `In academic English, we call this "${concept}". Let's connect what you understand in your language to the English terms you'll need for exams.`
    : `The English term for this is "${concept}".`;

  // Build academic terms
  const academicTerms: AcademicTerm[] = [];
  if (examData) {
    for (const term of examData.markSchemeTerms) {
      academicTerms.push({
        term,
        language: config.targetLanguage,
        definition: `A key term used in ${subject} exams when discussing ${concept}`,
        usage: `Use "${term}" when writing about ${concept} in your exam answers.`,
      });
    }
  } else {
    academicTerms.push({
      term: concept,
      language: config.targetLanguage,
      definition: `The academic term for this concept in ${config.targetLanguage}`,
      usage: `Use "${concept}" in your academic writing and exam answers.`,
    });
  }

  return {
    concept,
    subject,
    nativeExplanation,
    nativeAnalogy: conceptData?.analogy,
    bridgingPhrase,
    academicTerms,
    examPhrasing: examData?.examPhrasing,
    markSchemeTerms: examData?.markSchemeTerms,
  };
}

/**
 * Get all available bridges for a subject
 */
export function getAvailableBridges(language: string): string[] {
  const langData = LANGUAGE_DATABASE[language];
  if (!langData) return [];
  return Object.keys(langData);
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): { code: string; name: string }[] {
  return [
    { code: 'sw', name: 'Kiswahili' },
    { code: 'hi', name: 'Hindi' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
  ];
}
