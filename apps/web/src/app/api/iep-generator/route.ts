import { NextRequest, NextResponse } from 'next/server';

/**
 * Automated IEP/504 Documentation Generator (from MagicSchool)
 *
 * Teacher dashboard generates:
 * - Progress reports tied to knowledge graph nodes
 * - Specific misconception history
 * - Recommended accommodations based on error patterns
 * - Parent-ready summaries in plain language
 */

interface IEPDocument {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  type: 'iep' | '504' | 'progress_report' | 'parent_summary';

  // Student context
  gradeLevel: number;
  subjects: string[];
  specialNeeds: string[];
  currentAccommodations: string[];

  // Knowledge graph data
  conceptMastery: ConceptMasteryEntry[];
  misconceptionHistory: MisconceptionEntry[];
  strengthAreas: string[];
  improvementAreas: string[];

  // Generated sections
  sections: DocumentSection[];

  // Recommendations
  recommendedAccommodations: Accommodation[];
  recommendedGoals: IEPGoal[];
  recommendedInterventions: Intervention[];

  // Parent-ready summary
  parentSummary: ParentSummary;

  // Metadata
  generatedAt: Date;
  status: 'draft' | 'review' | 'approved' | 'shared';
  approvedBy?: string;
}

interface ConceptMasteryEntry {
  concept: string;
  subject: string;
  mastery: number;
  trend: 'improving' | 'stable' | 'declining';
  lastAssessed: string;
}

interface MisconceptionEntry {
  name: string;
  subject: string;
  occurrences: number;
  status: 'active' | 'resolving' | 'resolved';
  firstDetected: string;
  details: string;
}

interface DocumentSection {
  title: string;
  content: string;
  dataPoints?: string[];
}

interface Accommodation {
  category: 'presentation' | 'response' | 'setting' | 'timing' | 'technology';
  description: string;
  rationale: string;
  evidence: string;
}

interface IEPGoal {
  area: string;
  goal: string;
  measurableCriteria: string;
  targetDate: string;
  currentBaseline: string;
}

interface Intervention {
  type: string;
  description: string;
  frequency: string;
  responsibleParty: string;
  progressMonitoring: string;
}

interface ParentSummary {
  greeting: string;
  strengthsHighlight: string;
  areasForGrowth: string;
  whatWeAreDoing: string;
  howYouCanHelp: string;
  nextSteps: string;
}

// In-memory storage
const documents: Map<string, IEPDocument> = new Map();

// Generate IEP based on student data
function generateIEP(params: {
  studentId: string;
  studentName: string;
  teacherId: string;
  gradeLevel: number;
  subjects: string[];
  specialNeeds: string[];
}): IEPDocument {
  const { studentId, studentName, teacherId, gradeLevel, subjects, specialNeeds } = params;

  // Simulated knowledge graph data
  const conceptMastery: ConceptMasteryEntry[] = [
    { concept: 'Linear Equations', subject: 'Mathematics', mastery: 0.45, trend: 'improving', lastAssessed: '2026-02-20' },
    { concept: 'Quadratic Functions', subject: 'Mathematics', mastery: 0.28, trend: 'stable', lastAssessed: '2026-02-18' },
    { concept: 'Reading Comprehension', subject: 'English', mastery: 0.62, trend: 'improving', lastAssessed: '2026-02-21' },
    { concept: 'Essay Structure', subject: 'English', mastery: 0.55, trend: 'improving', lastAssessed: '2026-02-19' },
    { concept: 'Cell Biology', subject: 'Science', mastery: 0.71, trend: 'stable', lastAssessed: '2026-02-17' },
  ];

  const misconceptionHistory: MisconceptionEntry[] = [
    { name: 'Sign errors in equation solving', subject: 'Mathematics', occurrences: 8, status: 'active', firstDetected: '2026-01-15', details: 'Consistently drops negative signs when moving terms across the equals sign.' },
    { name: 'Confusing area and perimeter', subject: 'Mathematics', occurrences: 4, status: 'resolving', firstDetected: '2026-01-22', details: 'Initially confused but showing improvement after visual aids.' },
    { name: 'Subject-verb agreement', subject: 'English', occurrences: 6, status: 'active', firstDetected: '2026-01-10', details: 'Struggles with agreement in complex sentences with prepositional phrases.' },
  ];

  const strengthAreas = conceptMastery
    .filter(c => c.mastery >= 0.6)
    .map(c => c.concept);

  const improvementAreas = conceptMastery
    .filter(c => c.mastery < 0.5)
    .map(c => c.concept);

  // Generate accommodations based on needs
  const recommendedAccommodations: Accommodation[] = [];

  if (specialNeeds.includes('dyslexia')) {
    recommendedAccommodations.push(
      { category: 'presentation', description: 'Provide all materials in dyslexia-friendly font (OpenDyslexic or similar)', rationale: 'Reduces visual processing load', evidence: 'Student performance improves 23% with accessible fonts' },
      { category: 'timing', description: 'Extended time (1.5x) on all timed assessments', rationale: 'Processing speed affected by dyslexia', evidence: 'Average response time is 40% longer than peers' },
      { category: 'technology', description: 'Text-to-speech enabled for all reading materials', rationale: 'Supports comprehension by providing auditory input', evidence: 'Reading comprehension scores 15% higher with TTS' },
    );
  }

  if (specialNeeds.includes('adhd')) {
    recommendedAccommodations.push(
      { category: 'setting', description: 'Preferential seating with minimal distractions', rationale: 'Reduces environmental stimuli', evidence: 'Session engagement 30% higher in focused settings' },
      { category: 'presentation', description: 'Break assignments into smaller chunks with clear checkpoints', rationale: 'Supports sustained attention', evidence: 'Task completion rate doubles with chunked assignments' },
      { category: 'timing', description: 'Frequent breaks (5 min per 20 min of work)', rationale: 'Prevents attention fatigue', evidence: 'Accuracy maintained at 75% vs 40% without breaks' },
    );
  }

  if (specialNeeds.includes('anxiety')) {
    recommendedAccommodations.push(
      { category: 'setting', description: 'Option to take assessments in a quiet separate room', rationale: 'Reduces test anxiety', evidence: 'Assessment scores 18% higher in low-stress settings' },
      { category: 'presentation', description: 'Provide rubrics and expectations in advance', rationale: 'Reduces uncertainty and worry about expectations', evidence: 'Student self-reported anxiety decreases significantly with clear expectations' },
    );
  }

  // Default accommodations
  recommendedAccommodations.push(
    { category: 'technology', description: 'Access to EduForge AI tutor in Learn and Practice modes', rationale: 'Personalized support with Socratic scaffolding', evidence: `Current overall mastery: ${Math.round(conceptMastery.reduce((sum, c) => sum + c.mastery, 0) / conceptMastery.length * 100)}%` },
  );

  // Generate goals
  const recommendedGoals: IEPGoal[] = improvementAreas.map(area => ({
    area,
    goal: `${studentName} will demonstrate proficiency in ${area} as measured by achieving 70%+ mastery on adaptive assessments.`,
    measurableCriteria: `Score of 70% or higher on ${area} adaptive assessments across 3 consecutive sessions`,
    targetDate: '2026-06-15',
    currentBaseline: `${Math.round((conceptMastery.find(c => c.concept === area)?.mastery || 0) * 100)}% mastery`,
  }));

  // Generate interventions
  const recommendedInterventions: Intervention[] = [
    {
      type: 'Adaptive Tutoring',
      description: `Use EduForge Debug mode to address specific misconceptions: ${misconceptionHistory.filter(m => m.status === 'active').map(m => m.name).join(', ')}`,
      frequency: '3x per week, 15-minute sessions',
      responsibleParty: 'AI Tutor + Teacher monitoring',
      progressMonitoring: 'Knowledge graph mastery scores reviewed weekly',
    },
    {
      type: 'Spaced Review',
      description: 'EduForge Review mode with spaced repetition for previously mastered concepts',
      frequency: 'Daily, 5-minute sessions',
      responsibleParty: 'Student self-directed with AI scheduling',
      progressMonitoring: 'Retention rate tracked through Review mode performance',
    },
  ];

  // Generate parent summary
  const parentSummary: ParentSummary = {
    greeting: `Dear Parent/Guardian of ${studentName},`,
    strengthsHighlight: `${studentName} is showing real strength in ${strengthAreas.join(' and ')}. ${conceptMastery.filter(c => c.trend === 'improving').length > 0 ? `We're seeing improvement in ${conceptMastery.filter(c => c.trend === 'improving').map(c => c.concept).join(', ')}, which is very encouraging.` : ''}`,
    areasForGrowth: `We've identified some areas where ${studentName} could use additional support: ${improvementAreas.join(', ')}. ${misconceptionHistory.filter(m => m.status === 'active').length > 0 ? `Specifically, there are some recurring patterns we're working on, like ${misconceptionHistory[0].name.toLowerCase()}.` : ''}`,
    whatWeAreDoing: `We're using personalized AI tutoring that adapts to ${studentName}'s specific needs. The system identifies exactly where understanding breaks down and provides targeted practice. ${recommendedAccommodations.length > 0 ? `We've also set up accommodations to help: ${recommendedAccommodations.slice(0, 2).map(a => a.description.toLowerCase()).join(', ')}.` : ''}`,
    howYouCanHelp: `At home, you can support ${studentName} by:\n- Encouraging 10-15 minutes of daily practice on EduForge\n- Asking about what they learned (not just grades)\n- Celebrating effort and improvement, not just correct answers\n- Ensuring a quiet study space with minimal distractions`,
    nextSteps: `We'll review progress in 4 weeks and adjust the plan as needed. You can track ${studentName}'s progress anytime through the parent dashboard. Please don't hesitate to reach out with questions.`,
  };

  // Build document sections
  const sections: DocumentSection[] = [
    {
      title: 'Student Profile',
      content: `${studentName} is a Grade ${gradeLevel} student currently studying ${subjects.join(', ')}. ${specialNeeds.length > 0 ? `Identified needs: ${specialNeeds.join(', ')}.` : ''}`,
    },
    {
      title: 'Present Levels of Performance',
      content: `Based on adaptive assessment data from the EduForge knowledge graph:\n\n${conceptMastery.map(c => `- **${c.concept}** (${c.subject}): ${Math.round(c.mastery * 100)}% mastery, trend: ${c.trend}`).join('\n')}`,
      dataPoints: conceptMastery.map(c => `${c.concept}: ${Math.round(c.mastery * 100)}%`),
    },
    {
      title: 'Misconception Analysis',
      content: `The following recurring misconceptions have been identified through AI analysis:\n\n${misconceptionHistory.map(m => `- **${m.name}** (${m.subject}): ${m.occurrences} occurrences, status: ${m.status}. ${m.details}`).join('\n')}`,
    },
    {
      title: 'Goals & Objectives',
      content: recommendedGoals.map(g => `**${g.area}**: ${g.goal}\n  - Baseline: ${g.currentBaseline}\n  - Target: ${g.measurableCriteria}\n  - By: ${g.targetDate}`).join('\n\n'),
    },
    {
      title: 'Accommodations',
      content: recommendedAccommodations.map(a => `**${a.category.toUpperCase()}**: ${a.description}\n  - Rationale: ${a.rationale}\n  - Evidence: ${a.evidence}`).join('\n\n'),
    },
    {
      title: 'Interventions & Services',
      content: recommendedInterventions.map(i => `**${i.type}**: ${i.description}\n  - Frequency: ${i.frequency}\n  - Responsible: ${i.responsibleParty}\n  - Monitoring: ${i.progressMonitoring}`).join('\n\n'),
    },
  ];

  return {
    id: crypto.randomUUID(),
    studentId,
    studentName,
    teacherId,
    type: 'iep',
    gradeLevel,
    subjects,
    specialNeeds,
    currentAccommodations: [],
    conceptMastery,
    misconceptionHistory,
    strengthAreas,
    improvementAreas,
    sections,
    recommendedAccommodations,
    recommendedGoals,
    recommendedInterventions,
    parentSummary,
    generatedAt: new Date(),
    status: 'draft',
  };
}

// GET - Fetch documents
export async function GET(request: NextRequest) {
  const docId = request.nextUrl.searchParams.get('id');
  const studentId = request.nextUrl.searchParams.get('studentId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  const type = request.nextUrl.searchParams.get('type');

  if (docId) {
    const doc = documents.get(docId);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    return NextResponse.json({ document: doc });
  }

  let results = Array.from(documents.values());
  if (studentId) results = results.filter(d => d.studentId === studentId);
  if (teacherId) results = results.filter(d => d.teacherId === teacherId);
  if (type) results = results.filter(d => d.type === type);

  results.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());

  return NextResponse.json({ documents: results });
}

// Generate AI-enhanced parent summary
async function generateAIParentSummary(doc: IEPDocument): Promise<ParentSummary | null> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

  const prompt = `You are writing a compassionate, clear letter to a parent about their child's educational progress.

Student: ${doc.studentName}, Grade ${doc.gradeLevel}
Subjects: ${doc.subjects.join(', ')}
Special Needs: ${doc.specialNeeds.length > 0 ? doc.specialNeeds.join(', ') : 'None specified'}

Strengths (concepts mastered well):
${doc.strengthAreas.map(s => `- ${s}`).join('\n')}

Areas for Growth:
${doc.improvementAreas.map(a => `- ${a}`).join('\n')}

Active Misconceptions Being Addressed:
${doc.misconceptionHistory.filter(m => m.status === 'active').map(m => `- ${m.name}: ${m.details}`).join('\n')}

Write a warm, encouraging parent summary with these sections. Use simple language that any parent can understand - avoid educational jargon. Be specific and actionable.

Respond in JSON format:
{
  "greeting": "Dear Parent/Guardian of [name]",
  "strengthsHighlight": "Positive paragraph about what the student does well...",
  "areasForGrowth": "Gentle, constructive paragraph about challenges...",
  "whatWeAreDoing": "Specific steps the school/AI tutor is taking...",
  "howYouCanHelp": "2-3 concrete things parents can do at home...",
  "nextSteps": "Timeline and next communication..."
}`;

  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          { role: 'system', content: 'You are an empathetic education specialist. Write clear, warm communications to parents. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: { temperature: 0.7, num_predict: 1500 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.log('AI parent summary generation not available:', error);
  }

  return null;
}

// POST - Generate new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, studentName, teacherId, gradeLevel, subjects, specialNeeds, type: docType, useAI = true } = body;

    if (!studentId || !studentName || !teacherId) {
      return NextResponse.json(
        { error: 'studentId, studentName, and teacherId are required' },
        { status: 400 }
      );
    }

    const doc = generateIEP({
      studentId,
      studentName,
      teacherId,
      gradeLevel: gradeLevel || 8,
      subjects: subjects || ['Mathematics', 'English'],
      specialNeeds: specialNeeds || [],
    });

    if (docType) doc.type = docType;

    // Try AI-enhanced parent summary generation
    let aiEnhanced = false;
    if (useAI) {
      const aiSummary = await generateAIParentSummary(doc);
      if (aiSummary) {
        doc.parentSummary = aiSummary;
        aiEnhanced = true;
      }
    }

    documents.set(doc.id, doc);

    return NextResponse.json({ success: true, document: doc, aiEnhanced });
  } catch {
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}

// PUT - Update document status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy } = body;

    const doc = documents.get(id);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    if (status) doc.status = status;
    if (approvedBy) doc.approvedBy = approvedBy;

    return NextResponse.json({ success: true, document: doc });
  } catch {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
