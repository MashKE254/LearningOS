import { NextRequest, NextResponse } from 'next/server';

/**
 * Professional Certificate Pathways (inspired by Coursera/edX)
 *
 * Career track culminates in verifiable credentials:
 * - Industry-endorsed certificates
 * - Portfolio of real projects
 * - Interview prep module
 * - Job board access
 */

interface CertificatePathway {
  id: string;
  name: string;
  description: string;
  industry: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  estimatedHours: number;

  // Skills & requirements
  skills: PathwaySkill[];
  prerequisites: string[];

  // Modules
  modules: PathwayModule[];

  // Portfolio
  portfolioProjects: PortfolioProject[];

  // Interview prep
  interviewPrep: InterviewPrepModule;

  // Credential
  credential: CredentialInfo;

  // Progress tracking
  enrolledCount: number;
  completionRate: number;
  avgRating: number;
}

interface PathwaySkill {
  id: string;
  name: string;
  category: string;
  proficiencyRequired: number; // 0-1
  assessmentType: 'quiz' | 'project' | 'peer_review' | 'simulation';
}

interface PathwayModule {
  id: string;
  order: number;
  title: string;
  type: 'learning' | 'project' | 'assessment' | 'capstone';
  description: string;
  estimatedHours: number;
  skills: string[];
  completionCriteria: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  type: 'case_study' | 'analysis' | 'presentation' | 'code_project' | 'report';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  usesRealData: boolean;
  deliverables: string[];
  rubric: string[];
}

interface InterviewPrepModule {
  behavioralQuestions: string[];
  technicalQuestions: string[];
  caseStudyTopics: string[];
  mockInterviewAvailable: boolean;
  resumeTips: string[];
}

interface CredentialInfo {
  name: string;
  issuedBy: string;
  validityPeriod: string;
  verifiable: boolean;
  industryRecognized: boolean;
  linkedInShareable: boolean;
}

interface UserCertProgress {
  userId: string;
  pathwayId: string;
  enrolledAt: Date;
  completedModules: string[];
  completedProjects: string[];
  skillProficiencies: Record<string, number>;
  currentModule: string;
  overallProgress: number;
  certificateEarned: boolean;
  certificateIssuedAt?: Date;
}

// In-memory storage
const pathways: Map<string, CertificatePathway> = new Map();
const userProgress: Map<string, UserCertProgress> = new Map();

// Seed pathways
function seedPathways() {
  if (pathways.size > 0) return;

  const dataAnalytics: CertificatePathway = {
    id: 'data_analytics_pro',
    name: 'Data Analytics Professional',
    description: 'Master data analysis from spreadsheets to machine learning. Build a portfolio of real projects using actual datasets. Prepare for data analyst roles.',
    industry: 'Technology',
    level: 'intermediate',
    estimatedHours: 120,
    skills: [
      { id: 's1', name: 'Data Cleaning', category: 'Technical', proficiencyRequired: 0.8, assessmentType: 'project' },
      { id: 's2', name: 'Statistical Analysis', category: 'Technical', proficiencyRequired: 0.7, assessmentType: 'quiz' },
      { id: 's3', name: 'Data Visualization', category: 'Technical', proficiencyRequired: 0.8, assessmentType: 'project' },
      { id: 's4', name: 'SQL', category: 'Technical', proficiencyRequired: 0.7, assessmentType: 'simulation' },
      { id: 's5', name: 'Python/Pandas', category: 'Technical', proficiencyRequired: 0.7, assessmentType: 'project' },
      { id: 's6', name: 'Business Communication', category: 'Soft Skill', proficiencyRequired: 0.6, assessmentType: 'peer_review' },
      { id: 's7', name: 'Critical Thinking', category: 'Soft Skill', proficiencyRequired: 0.7, assessmentType: 'quiz' },
    ],
    prerequisites: ['Basic computer skills', 'High school mathematics'],
    modules: [
      { id: 'm1', order: 1, title: 'Foundations of Data Analysis', type: 'learning', description: 'Learn the data analysis process, types of data, and basic statistics.', estimatedHours: 15, skills: ['s2', 's7'], completionCriteria: 'Pass module quiz with 70%+' },
      { id: 'm2', order: 2, title: 'Spreadsheet Mastery', type: 'learning', description: 'Advanced formulas, pivot tables, and data cleaning in spreadsheets.', estimatedHours: 15, skills: ['s1'], completionCriteria: 'Complete 3 practice exercises' },
      { id: 'm3', order: 3, title: 'SQL for Data Analysis', type: 'learning', description: 'Write queries, joins, aggregations, and subqueries.', estimatedHours: 20, skills: ['s4'], completionCriteria: 'Pass SQL challenge set' },
      { id: 'm4', order: 4, title: 'Data Visualization & Storytelling', type: 'learning', description: 'Create compelling visualizations and narratives from data.', estimatedHours: 15, skills: ['s3', 's6'], completionCriteria: 'Create a visualization portfolio' },
      { id: 'm5', order: 5, title: 'Python for Analysis', type: 'learning', description: 'Pandas, NumPy, and matplotlib for data analysis.', estimatedHours: 20, skills: ['s5'], completionCriteria: 'Complete Python analysis project' },
      { id: 'm6', order: 6, title: 'Real-World Project: E-Commerce Analysis', type: 'project', description: 'Analyze a real e-commerce dataset to find growth opportunities.', estimatedHours: 15, skills: ['s1', 's2', 's3', 's5'], completionCriteria: 'Submit analysis report' },
      { id: 'm7', order: 7, title: 'Capstone: End-to-End Analysis', type: 'capstone', description: 'Choose your own dataset, clean it, analyze it, visualize insights, and present to stakeholders.', estimatedHours: 20, skills: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'], completionCriteria: 'Present capstone and pass peer review' },
    ],
    portfolioProjects: [
      {
        id: 'pp1', title: 'Customer Segmentation Analysis', description: 'Segment customers using real retail data to identify high-value groups.',
        type: 'analysis', difficulty: 'intermediate', usesRealData: true,
        deliverables: ['Cleaned dataset', 'Segmentation model', 'Executive summary', 'Visualization dashboard'],
        rubric: ['Data cleaning quality', 'Analysis depth', 'Visualization clarity', 'Actionable insights'],
      },
      {
        id: 'pp2', title: 'Sales Forecasting Report', description: 'Build a time series forecast for a business.',
        type: 'report', difficulty: 'advanced', usesRealData: true,
        deliverables: ['Forecast model', 'Accuracy metrics', 'Business recommendations', 'Technical documentation'],
        rubric: ['Model accuracy', 'Clear communication', 'Business relevance', 'Technical rigor'],
      },
    ],
    interviewPrep: {
      behavioralQuestions: [
        'Tell me about a time you found an insight in data that changed a business decision.',
        'How do you handle conflicting data or ambiguous results?',
        'Describe a time you had to explain complex data to a non-technical audience.',
      ],
      technicalQuestions: [
        'What is the difference between correlation and causation? Give an example.',
        'How would you handle missing data in a dataset?',
        'Write a SQL query to find the top 10 customers by revenue.',
        'What visualization would you use for comparing categories? For trends over time?',
      ],
      caseStudyTopics: [
        'A/B test analysis for a product feature',
        'Marketing campaign effectiveness measurement',
        'Supply chain optimization using data',
      ],
      mockInterviewAvailable: true,
      resumeTips: [
        'Quantify your impact: "Reduced processing time by 40%"',
        'List tools: SQL, Python, Excel, Tableau',
        'Include portfolio link and GitHub',
        'Highlight business outcomes, not just technical skills',
      ],
    },
    credential: {
      name: 'EduForge Certified Data Analytics Professional',
      issuedBy: 'EduForge Learning Platform',
      validityPeriod: '2 years',
      verifiable: true,
      industryRecognized: true,
      linkedInShareable: true,
    },
    enrolledCount: 2547,
    completionRate: 0.68,
    avgRating: 4.7,
  };

  pathways.set(dataAnalytics.id, dataAnalytics);

  const webDev: CertificatePathway = {
    id: 'web_dev_fullstack',
    name: 'Full-Stack Web Development',
    description: 'From HTML basics to deploying production applications. Build real projects, learn modern frameworks, and prepare for developer roles.',
    industry: 'Technology',
    level: 'beginner',
    estimatedHours: 200,
    skills: [
      { id: 's1', name: 'HTML/CSS', category: 'Technical', proficiencyRequired: 0.8, assessmentType: 'project' },
      { id: 's2', name: 'JavaScript', category: 'Technical', proficiencyRequired: 0.8, assessmentType: 'project' },
      { id: 's3', name: 'React', category: 'Technical', proficiencyRequired: 0.7, assessmentType: 'project' },
      { id: 's4', name: 'Node.js', category: 'Technical', proficiencyRequired: 0.7, assessmentType: 'project' },
      { id: 's5', name: 'Databases', category: 'Technical', proficiencyRequired: 0.6, assessmentType: 'quiz' },
      { id: 's6', name: 'Git & Deployment', category: 'Technical', proficiencyRequired: 0.6, assessmentType: 'simulation' },
      { id: 's7', name: 'Problem Solving', category: 'Soft Skill', proficiencyRequired: 0.7, assessmentType: 'quiz' },
    ],
    prerequisites: ['Basic computer literacy'],
    modules: [
      { id: 'm1', order: 1, title: 'HTML & CSS Fundamentals', type: 'learning', description: 'Build your first web pages.', estimatedHours: 25, skills: ['s1'], completionCriteria: 'Build 3 responsive pages' },
      { id: 'm2', order: 2, title: 'JavaScript Essentials', type: 'learning', description: 'Programming fundamentals with JavaScript.', estimatedHours: 30, skills: ['s2', 's7'], completionCriteria: 'Pass JS challenges' },
      { id: 'm3', order: 3, title: 'React & Modern Frontend', type: 'learning', description: 'Build interactive UIs with React.', estimatedHours: 35, skills: ['s3'], completionCriteria: 'Build a React app' },
      { id: 'm4', order: 4, title: 'Backend with Node.js', type: 'learning', description: 'APIs, authentication, and server-side logic.', estimatedHours: 30, skills: ['s4', 's5'], completionCriteria: 'Build a REST API' },
      { id: 'm5', order: 5, title: 'Full-Stack Project', type: 'project', description: 'Build and deploy a complete application.', estimatedHours: 40, skills: ['s1', 's2', 's3', 's4', 's5', 's6'], completionCriteria: 'Deploy working app' },
      { id: 'm6', order: 6, title: 'Capstone: Your Product', type: 'capstone', description: 'Design, build, and launch your own web product.', estimatedHours: 40, skills: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'], completionCriteria: 'Launch and present' },
    ],
    portfolioProjects: [
      {
        id: 'pp1', title: 'Personal Portfolio Website', description: 'Showcase your work with a responsive portfolio.',
        type: 'code_project', difficulty: 'beginner', usesRealData: false,
        deliverables: ['Live website', 'Source code', 'Documentation'],
        rubric: ['Design quality', 'Responsiveness', 'Code quality', 'Performance'],
      },
      {
        id: 'pp2', title: 'Task Management App', description: 'Full-stack CRUD application with authentication.',
        type: 'code_project', difficulty: 'intermediate', usesRealData: false,
        deliverables: ['Deployed app', 'API documentation', 'Test coverage', 'Architecture diagram'],
        rubric: ['Functionality', 'Code organization', 'Security', 'User experience'],
      },
    ],
    interviewPrep: {
      behavioralQuestions: [
        'Walk me through a project you built. What decisions did you make and why?',
        'How do you approach debugging a problem you\'ve never seen before?',
      ],
      technicalQuestions: [
        'Explain the virtual DOM in React.',
        'What is the event loop in JavaScript?',
        'How would you design a REST API for a blog?',
      ],
      caseStudyTopics: ['Design a URL shortener', 'Build a real-time chat application'],
      mockInterviewAvailable: true,
      resumeTips: [
        'Link to GitHub and live projects',
        'List frameworks and tools with proficiency levels',
        'Show before/after impact of your work',
      ],
    },
    credential: {
      name: 'EduForge Certified Full-Stack Developer',
      issuedBy: 'EduForge Learning Platform',
      validityPeriod: '2 years',
      verifiable: true,
      industryRecognized: true,
      linkedInShareable: true,
    },
    enrolledCount: 4123,
    completionRate: 0.54,
    avgRating: 4.6,
  };

  pathways.set(webDev.id, webDev);
}

seedPathways();

// GET - Fetch pathways or progress
export async function GET(request: NextRequest) {
  const pathwayId = request.nextUrl.searchParams.get('pathwayId');
  const userId = request.nextUrl.searchParams.get('userId');
  const industry = request.nextUrl.searchParams.get('industry');

  if (pathwayId && userId) {
    const progressKey = `${userId}_${pathwayId}`;
    const progress = userProgress.get(progressKey);
    const pathway = pathways.get(pathwayId);
    return NextResponse.json({ pathway, progress });
  }

  if (pathwayId) {
    const pathway = pathways.get(pathwayId);
    if (!pathway) return NextResponse.json({ error: 'Pathway not found' }, { status: 404 });
    return NextResponse.json({ pathway });
  }

  let results = Array.from(pathways.values());
  if (industry) results = results.filter(p => p.industry.toLowerCase() === industry.toLowerCase());

  return NextResponse.json({ pathways: results });
}

// POST - Enroll in pathway or update progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'enroll') {
      const { userId, pathwayId } = body;
      const pathway = pathways.get(pathwayId);
      if (!pathway) return NextResponse.json({ error: 'Pathway not found' }, { status: 404 });

      const progressKey = `${userId}_${pathwayId}`;
      const progress: UserCertProgress = {
        userId,
        pathwayId,
        enrolledAt: new Date(),
        completedModules: [],
        completedProjects: [],
        skillProficiencies: {},
        currentModule: pathway.modules[0]?.id || '',
        overallProgress: 0,
        certificateEarned: false,
      };

      userProgress.set(progressKey, progress);
      pathway.enrolledCount += 1;

      return NextResponse.json({ success: true, progress });
    }

    if (body.action === 'complete_module') {
      const { userId, pathwayId, moduleId } = body;
      const progressKey = `${userId}_${pathwayId}`;
      const progress = userProgress.get(progressKey);
      if (!progress) return NextResponse.json({ error: 'Not enrolled' }, { status: 404 });

      const pathway = pathways.get(pathwayId);
      if (!pathway) return NextResponse.json({ error: 'Pathway not found' }, { status: 404 });

      if (!progress.completedModules.includes(moduleId)) {
        progress.completedModules.push(moduleId);
      }

      // Calculate overall progress
      progress.overallProgress = progress.completedModules.length / pathway.modules.length;

      // Move to next module
      const currentIdx = pathway.modules.findIndex(m => m.id === moduleId);
      if (currentIdx < pathway.modules.length - 1) {
        progress.currentModule = pathway.modules[currentIdx + 1].id;
      }

      // Check if certificate earned
      if (progress.overallProgress >= 1.0) {
        progress.certificateEarned = true;
        progress.certificateIssuedAt = new Date();
      }

      return NextResponse.json({ success: true, progress });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
