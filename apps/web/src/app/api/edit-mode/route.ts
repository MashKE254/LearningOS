import { NextRequest, NextResponse } from 'next/server';

/**
 * Edit Mode for Teachers/Parents (inspired by Sana Labs)
 *
 * Teachers upload materials (PDFs, slides, videos).
 * AI generates curriculum-aligned courses from them, mapped to knowledge graph nodes.
 * Teacher can review, edit, approve. Students get adaptive pathways through teacher's content.
 */

interface UploadedMaterial {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'processing' | 'processed' | 'error';
  extractedContent?: string;
}

interface GeneratedCourse {
  id: string;
  materialId: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: number;

  // Curriculum alignment
  examBoard?: string;
  curriculumUnit?: string;
  learningObjectives: string[];

  // Generated content structure
  modules: CourseModule[];

  // Approval flow
  status: 'draft' | 'review' | 'approved' | 'published';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

interface CourseModule {
  id: string;
  order: number;
  title: string;
  type: 'lesson' | 'practice' | 'assessment' | 'activity';
  content: string;
  knowledgeGraphNodeId?: string;
  estimatedDuration: number; // minutes
  bloomsLevel: string;

  // For practice/assessment modules
  questions?: GeneratedQuestion[];
}

interface GeneratedQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'long_answer' | 'fill_blank' | 'matching';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  hints: string[];
}

// In-memory storage
const uploadedMaterials: Map<string, UploadedMaterial> = new Map();
const generatedCourses: Map<string, GeneratedCourse> = new Map();

// Seed demo content
function seedEditMode() {
  if (generatedCourses.size > 0) return;

  const materialId = 'demo_material_1';
  uploadedMaterials.set(materialId, {
    id: materialId,
    fileName: 'Chapter_5_Chemical_Bonding.pdf',
    fileType: 'application/pdf',
    fileSize: 2450000,
    uploadedBy: 'teacher_1',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'processed',
    extractedContent: 'Chemical bonding chapter covering ionic, covalent, and metallic bonds...',
  });

  const courseId = 'demo_course_1';
  generatedCourses.set(courseId, {
    id: courseId,
    materialId,
    title: 'Chemical Bonding: From Atoms to Molecules',
    description: 'A comprehensive course on chemical bonding derived from your uploaded materials, aligned to CIE IGCSE Chemistry (0620).',
    subject: 'Chemistry',
    gradeLevel: 10,
    examBoard: 'CIE',
    curriculumUnit: 'Structure and Bonding',
    learningObjectives: [
      'Describe ionic bonding as the transfer of electrons',
      'Describe covalent bonding as the sharing of electrons',
      'Explain metallic bonding in terms of a lattice of positive ions and delocalized electrons',
      'Draw dot-and-cross diagrams for ionic and covalent compounds',
      'Relate bonding type to physical properties',
    ],
    modules: [
      {
        id: 'mod_1',
        order: 1,
        title: 'Introduction to Chemical Bonds',
        type: 'lesson',
        content: '## Why Do Atoms Bond?\n\nAtoms bond to achieve a stable electron configuration (full outer shell). There are three main types of bonding:\n\n1. **Ionic bonding** - Transfer of electrons between metals and non-metals\n2. **Covalent bonding** - Sharing of electrons between non-metals\n3. **Metallic bonding** - Sharing of delocalized electrons among metal atoms\n\nThe type of bonding determines the physical properties of the substance.',
        estimatedDuration: 15,
        bloomsLevel: 'understand',
      },
      {
        id: 'mod_2',
        order: 2,
        title: 'Ionic Bonding Deep Dive',
        type: 'lesson',
        content: '## Ionic Bonding\n\nIonic bonds form when electrons are **transferred** from a metal atom to a non-metal atom.\n\n### Process:\n1. Metal atom loses electrons → becomes positive ion (cation)\n2. Non-metal atom gains electrons → becomes negative ion (anion)\n3. Opposite charges attract → ionic bond\n\n### Example: NaCl\n- Na (2,8,1) → Na⁺ (2,8) + e⁻\n- Cl (2,8,7) + e⁻ → Cl⁻ (2,8,8)\n\n### Properties of Ionic Compounds:\n- High melting/boiling points (strong electrostatic forces)\n- Conduct electricity when molten or dissolved\n- Form regular crystal lattices\n- Brittle',
        estimatedDuration: 20,
        bloomsLevel: 'understand',
        questions: [
          {
            id: 'q1',
            question: 'What happens to the electrons during ionic bonding?',
            type: 'multiple_choice',
            options: [
              'Electrons are shared between atoms',
              'Electrons are transferred from metal to non-metal',
              'Electrons are destroyed',
              'Electrons become delocalized',
            ],
            correctAnswer: 'Electrons are transferred from metal to non-metal',
            explanation: 'In ionic bonding, metal atoms transfer their outer electrons to non-metal atoms. This creates positive and negative ions which are attracted to each other.',
            difficulty: 'easy',
            marks: 1,
            hints: ['Think about what metals and non-metals do differently with electrons'],
          },
          {
            id: 'q2',
            question: 'Draw the dot-and-cross diagram for magnesium chloride (MgCl₂). Explain why the ratio is 1:2.',
            type: 'long_answer',
            correctAnswer: 'Mg has 2 outer electrons to lose, while each Cl needs 1 electron. Therefore 1 Mg provides electrons for 2 Cl atoms. Mg²⁺ has configuration (2,8), each Cl⁻ has (2,8,8).',
            explanation: 'The ratio depends on how many electrons need to be transferred. Mg needs to lose 2 electrons, each Cl needs to gain 1, so you need 2 Cl for every 1 Mg.',
            difficulty: 'medium',
            marks: 3,
            hints: [
              'How many outer electrons does Mg have?',
              'How many electrons does each Cl need?',
              'If Mg gives away 2 electrons, how many Cl atoms can accept them?',
            ],
          },
        ],
      },
      {
        id: 'mod_3',
        order: 3,
        title: 'Practice: Ionic Bonding',
        type: 'practice',
        content: 'Apply your knowledge of ionic bonding to these practice questions.',
        estimatedDuration: 15,
        bloomsLevel: 'apply',
        questions: [
          {
            id: 'q3',
            question: 'Explain why ionic compounds have high melting points.',
            type: 'short_answer',
            correctAnswer: 'Ionic compounds have high melting points because the strong electrostatic forces of attraction between the oppositely charged ions in the lattice require a lot of energy to overcome.',
            explanation: 'The key phrase examiners look for is "strong electrostatic forces between oppositely charged ions".',
            difficulty: 'medium',
            marks: 2,
            hints: ['Think about what holds the ions together', 'What type of force is it?'],
          },
          {
            id: 'q4',
            question: 'Predict and explain whether potassium oxide (K₂O) conducts electricity when: (a) solid, (b) molten, (c) dissolved in water.',
            type: 'long_answer',
            correctAnswer: '(a) Solid: Does not conduct - ions are held in fixed positions in the lattice and cannot move. (b) Molten: Conducts - ions are free to move and carry charge. (c) Dissolved: Conducts - ions dissociate and are free to move in solution.',
            explanation: 'Electrical conductivity in ionic compounds depends on whether ions are free to move. In solid state they are locked in place; when melted or dissolved they become mobile charge carriers.',
            difficulty: 'hard',
            marks: 4,
            hints: [
              'What carries the electrical charge in ionic compounds?',
              'Can ions move in a solid lattice?',
              'What happens to the lattice when it melts?',
            ],
          },
        ],
      },
      {
        id: 'mod_4',
        order: 4,
        title: 'Covalent Bonding',
        type: 'lesson',
        content: '## Covalent Bonding\n\nCovalent bonds form when two non-metal atoms **share** electron pairs.\n\n### Types:\n- **Single bond**: 1 shared pair (e.g., H-H)\n- **Double bond**: 2 shared pairs (e.g., O=O)\n- **Triple bond**: 3 shared pairs (e.g., N≡N)\n\n### Properties of Simple Covalent Molecules:\n- Low melting/boiling points (weak intermolecular forces)\n- Do not conduct electricity (no free charges)\n- Often gases or liquids at room temperature\n\n### Giant Covalent Structures:\n- Diamond, graphite, silicon dioxide\n- Very high melting points\n- Graphite conducts electricity (delocalized electrons)',
        estimatedDuration: 20,
        bloomsLevel: 'understand',
      },
      {
        id: 'mod_5',
        order: 5,
        title: 'Assessment: Chemical Bonding',
        type: 'assessment',
        content: 'Complete this assessment to test your understanding of chemical bonding.',
        estimatedDuration: 25,
        bloomsLevel: 'evaluate',
        questions: [
          {
            id: 'q5',
            question: 'Compare and contrast ionic and covalent bonding. Include: how they form, types of elements involved, and typical properties.',
            type: 'long_answer',
            correctAnswer: 'Ionic bonding involves transfer of electrons between metals and non-metals, forming ions held by electrostatic attraction. Results in high MP/BP, conducts when molten/dissolved. Covalent bonding involves sharing of electrons between non-metals. Simple molecules have low MP/BP, don\'t conduct. Both achieve stable electron configurations.',
            explanation: 'A good comparison addresses formation mechanism, elements involved, and resulting properties systematically.',
            difficulty: 'hard',
            marks: 6,
            hints: [
              'Structure your answer: formation, elements, properties',
              'Use specific examples for each bond type',
            ],
          },
        ],
      },
    ],
    status: 'published',
    createdBy: 'teacher_1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    approvedBy: 'teacher_1',
    approvedAt: new Date(),
  });
}

seedEditMode();

// GET - Fetch courses or materials
export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get('courseId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  const subject = request.nextUrl.searchParams.get('subject');
  const getMaterials = request.nextUrl.searchParams.get('materials') === 'true';

  if (getMaterials) {
    let materials = Array.from(uploadedMaterials.values());
    if (teacherId) materials = materials.filter(m => m.uploadedBy === teacherId);
    return NextResponse.json({ materials });
  }

  if (courseId) {
    const course = generatedCourses.get(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ course });
  }

  let courses = Array.from(generatedCourses.values());
  if (teacherId) courses = courses.filter(c => c.createdBy === teacherId);
  if (subject) courses = courses.filter(c => c.subject.toLowerCase() === subject.toLowerCase());

  return NextResponse.json({
    courses: courses.map(c => ({
      ...c,
      modules: c.modules.map(m => ({ ...m, questions: undefined })),
    })),
  });
}

// POST - Upload material or generate course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'upload') {
      const { fileName, fileType, fileSize, uploadedBy, content } = body;
      const id = crypto.randomUUID();
      const material: UploadedMaterial = {
        id,
        fileName,
        fileType,
        fileSize,
        uploadedBy,
        uploadedAt: new Date(),
        status: 'processed',
        extractedContent: content || 'Extracted content from uploaded file...',
      };
      uploadedMaterials.set(id, material);
      return NextResponse.json({ success: true, material });
    }

    if (body.action === 'generate') {
      const { materialId, title, subject, gradeLevel, examBoard, createdBy } = body;
      const material = uploadedMaterials.get(materialId);
      if (!material) return NextResponse.json({ error: 'Material not found' }, { status: 404 });

      // Call Ollama to generate course content
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

      const generationPrompt = `You are an expert curriculum designer. Based on the following educational material, create a structured course.

Material: ${material.fileName}
Subject: ${subject || 'General'}
Grade Level: ${gradeLevel || 8}
${examBoard ? `Exam Board: ${examBoard}` : ''}

Content:
${material.extractedContent}

Generate a course with the following JSON structure (respond ONLY with valid JSON):
{
  "title": "Course title",
  "description": "2-3 sentence description",
  "learningObjectives": ["objective 1", "objective 2", "objective 3"],
  "modules": [
    {
      "title": "Module title",
      "type": "lesson",
      "content": "Full lesson content with markdown formatting",
      "estimatedDuration": 15,
      "bloomsLevel": "understand"
    },
    {
      "title": "Practice",
      "type": "practice",
      "content": "Practice introduction",
      "estimatedDuration": 20,
      "bloomsLevel": "apply",
      "questions": [
        {
          "question": "Question text",
          "type": "multiple_choice",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why A is correct",
          "difficulty": "medium",
          "marks": 2,
          "hints": ["hint 1", "hint 2"]
        }
      ]
    }
  ]
}

Create 3-5 modules including lessons, practice, and assessment. Include 2-4 questions per practice/assessment module.`;

      let generatedContent;
      try {
        const response = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              { role: 'system', content: 'You are a curriculum designer. Always respond with valid JSON only, no other text.' },
              { role: 'user', content: generationPrompt },
            ],
            stream: false,
            options: { temperature: 0.7, num_predict: 4096 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.message?.content || '';
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedContent = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (aiError) {
        console.log('AI generation not available, using template:', aiError);
      }

      // Fall back to template if AI generation failed
      const courseId = crypto.randomUUID();
      const course: GeneratedCourse = {
        id: courseId,
        materialId,
        title: generatedContent?.title || title || `Course from ${material.fileName}`,
        description: generatedContent?.description || `AI-generated course from uploaded material: ${material.fileName}`,
        subject: subject || 'General',
        gradeLevel: gradeLevel || 8,
        examBoard,
        learningObjectives: generatedContent?.learningObjectives || [
          'Understand the key concepts from the uploaded material',
          'Apply knowledge through practice problems',
          'Demonstrate mastery through assessment',
        ],
        modules: generatedContent?.modules?.map((m: CourseModule, i: number) => ({
          id: crypto.randomUUID(),
          order: i + 1,
          title: m.title,
          type: m.type,
          content: m.content,
          estimatedDuration: m.estimatedDuration || 15,
          bloomsLevel: m.bloomsLevel || 'understand',
          questions: m.questions?.map((q: GeneratedQuestion) => ({
            id: crypto.randomUUID(),
            ...q,
          })),
        })) || [
          {
            id: crypto.randomUUID(),
            order: 1,
            title: 'Introduction',
            type: 'lesson',
            content: `## Generated from: ${material.fileName}\n\nThis module covers the foundational concepts extracted from your uploaded material.\n\n${material.extractedContent}`,
            estimatedDuration: 15,
            bloomsLevel: 'understand',
          },
          {
            id: crypto.randomUUID(),
            order: 2,
            title: 'Practice & Application',
            type: 'practice',
            content: 'Apply what you learned in the introduction.',
            estimatedDuration: 20,
            bloomsLevel: 'apply',
            questions: [
              {
                id: crypto.randomUUID(),
                question: 'Based on the material, explain the main concept in your own words.',
                type: 'short_answer',
                correctAnswer: 'Student should demonstrate understanding of the core concept.',
                explanation: 'This question tests comprehension of the uploaded material.',
                difficulty: 'medium',
                marks: 3,
                hints: ['Refer back to the key definitions', 'Think about how the concepts connect'],
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            order: 3,
            title: 'Assessment',
            type: 'assessment',
            content: 'Test your understanding with this final assessment.',
            estimatedDuration: 15,
            bloomsLevel: 'evaluate',
          },
        ],
        status: 'draft',
        createdBy: createdBy || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      generatedCourses.set(courseId, course);
      return NextResponse.json({ success: true, course, aiGenerated: !!generatedContent });
    }

    if (body.action === 'approve') {
      const { courseId, approvedBy } = body;
      const course = generatedCourses.get(courseId);
      if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      course.status = 'approved';
      course.approvedBy = approvedBy;
      course.approvedAt = new Date();
      course.updatedAt = new Date();
      return NextResponse.json({ success: true, course });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PUT - Update course content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, modules, title, description, status } = body;

    const course = generatedCourses.get(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    if (title) course.title = title;
    if (description) course.description = description;
    if (modules) course.modules = modules;
    if (status) course.status = status;
    course.updatedAt = new Date();

    return NextResponse.json({ success: true, course });
  } catch {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}
