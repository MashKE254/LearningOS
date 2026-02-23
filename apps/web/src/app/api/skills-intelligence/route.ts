import { NextRequest, NextResponse } from 'next/server';

/**
 * Enterprise Skills Intelligence (from Sana Labs + 360Learning)
 *
 * For institutional tier:
 * - Skills heatmaps across organization
 * - Identification of emerging experts
 * - Succession planning insights
 * - Compliance tracking with automated reporting
 */

interface SkillsIntelligence {
  organizationId: string;
  generatedAt: Date;

  // Skills heatmap
  skillsHeatmap: SkillHeatmapEntry[];

  // Expert identification
  emergingExperts: ExpertProfile[];

  // Department analysis
  departmentAnalysis: DepartmentSkillsAnalysis[];

  // Compliance tracking
  complianceStatus: ComplianceEntry[];

  // Trends
  skillTrends: SkillTrend[];

  // Recommendations
  recommendations: SkillRecommendation[];
}

interface SkillHeatmapEntry {
  skillName: string;
  category: string;
  organizationAvg: number; // 0-1
  departmentScores: Record<string, number>;
  trend: 'improving' | 'stable' | 'declining';
  gap: number; // Difference from target
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ExpertProfile {
  userId: string;
  name: string;
  department: string;
  topSkills: { skill: string; proficiency: number }[];
  certificatesEarned: string[];
  mentorPotential: number; // 0-1
  knowledgeShareScore: number; // Based on collaborative authoring contributions
}

interface DepartmentSkillsAnalysis {
  departmentId: string;
  departmentName: string;
  headcount: number;
  avgProficiency: number;
  topSkills: string[];
  skillGaps: string[];
  completionRate: number;
  engagementScore: number;
}

interface ComplianceEntry {
  requirementName: string;
  category: string;
  dueDate: string;
  completedCount: number;
  totalRequired: number;
  completionRate: number;
  status: 'on_track' | 'at_risk' | 'overdue';
  nonCompliantUsers: string[];
}

interface SkillTrend {
  skillName: string;
  dataPoints: { date: string; avgProficiency: number }[];
  forecast: number; // Predicted proficiency in 30 days
}

interface SkillRecommendation {
  type: 'training' | 'hiring' | 'succession' | 'compliance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  estimatedCost?: string;
}

// In-memory demo data
function generateDemoIntelligence(): SkillsIntelligence {
  return {
    organizationId: 'demo_org_1',
    generatedAt: new Date(),
    skillsHeatmap: [
      { skillName: 'Data Analysis', category: 'Technical', organizationAvg: 0.62, departmentScores: { Engineering: 0.78, Marketing: 0.45, Sales: 0.38, HR: 0.35 }, trend: 'improving', gap: 0.18, priority: 'high' },
      { skillName: 'AI/ML Fundamentals', category: 'Technical', organizationAvg: 0.34, departmentScores: { Engineering: 0.67, Marketing: 0.22, Sales: 0.15, HR: 0.12 }, trend: 'improving', gap: 0.46, priority: 'critical' },
      { skillName: 'Cloud Infrastructure', category: 'Technical', organizationAvg: 0.55, departmentScores: { Engineering: 0.82, Marketing: 0.18, Sales: 0.22, HR: 0.15 }, trend: 'stable', gap: 0.25, priority: 'medium' },
      { skillName: 'Communication', category: 'Soft Skill', organizationAvg: 0.71, departmentScores: { Engineering: 0.58, Marketing: 0.85, Sales: 0.82, HR: 0.78 }, trend: 'stable', gap: 0.09, priority: 'low' },
      { skillName: 'Project Management', category: 'Management', organizationAvg: 0.58, departmentScores: { Engineering: 0.62, Marketing: 0.55, Sales: 0.48, HR: 0.65 }, trend: 'improving', gap: 0.22, priority: 'medium' },
      { skillName: 'Cybersecurity Awareness', category: 'Compliance', organizationAvg: 0.73, departmentScores: { Engineering: 0.88, Marketing: 0.65, Sales: 0.62, HR: 0.72 }, trend: 'improving', gap: 0.07, priority: 'high' },
      { skillName: 'Leadership', category: 'Management', organizationAvg: 0.51, departmentScores: { Engineering: 0.45, Marketing: 0.52, Sales: 0.58, HR: 0.62 }, trend: 'stable', gap: 0.29, priority: 'high' },
      { skillName: 'Ethics & Compliance', category: 'Compliance', organizationAvg: 0.82, departmentScores: { Engineering: 0.80, Marketing: 0.78, Sales: 0.85, HR: 0.92 }, trend: 'stable', gap: 0.08, priority: 'low' },
    ],
    emergingExperts: [
      { userId: 'u1', name: 'Dr. Amara Osei', department: 'Engineering', topSkills: [{ skill: 'AI/ML', proficiency: 0.92 }, { skill: 'Data Analysis', proficiency: 0.88 }, { skill: 'Python', proficiency: 0.95 }], certificatesEarned: ['Data Analytics Pro', 'ML Engineer'], mentorPotential: 0.89, knowledgeShareScore: 0.85 },
      { userId: 'u2', name: 'Marcus Chen', department: 'Engineering', topSkills: [{ skill: 'Cloud Infrastructure', proficiency: 0.91 }, { skill: 'Cybersecurity', proficiency: 0.87 }, { skill: 'DevOps', proficiency: 0.85 }], certificatesEarned: ['Cloud Architect'], mentorPotential: 0.78, knowledgeShareScore: 0.72 },
      { userId: 'u3', name: 'Priya Sharma', department: 'Marketing', topSkills: [{ skill: 'Data Analysis', proficiency: 0.82 }, { skill: 'Communication', proficiency: 0.90 }, { skill: 'AI/ML', proficiency: 0.68 }], certificatesEarned: ['Data Analytics Pro'], mentorPotential: 0.82, knowledgeShareScore: 0.91 },
    ],
    departmentAnalysis: [
      { departmentId: 'd1', departmentName: 'Engineering', headcount: 45, avgProficiency: 0.72, topSkills: ['Cloud Infrastructure', 'Data Analysis', 'AI/ML'], skillGaps: ['Leadership', 'Communication'], completionRate: 0.78, engagementScore: 0.82 },
      { departmentId: 'd2', departmentName: 'Marketing', headcount: 22, avgProficiency: 0.58, topSkills: ['Communication', 'Data Analysis'], skillGaps: ['AI/ML', 'Cloud Infrastructure', 'Technical Writing'], completionRate: 0.65, engagementScore: 0.71 },
      { departmentId: 'd3', departmentName: 'Sales', headcount: 35, avgProficiency: 0.52, topSkills: ['Communication', 'Negotiation'], skillGaps: ['Data Analysis', 'AI/ML', 'Project Management'], completionRate: 0.58, engagementScore: 0.62 },
      { departmentId: 'd4', departmentName: 'HR', headcount: 12, avgProficiency: 0.61, topSkills: ['Ethics & Compliance', 'Communication', 'Project Management'], skillGaps: ['Data Analysis', 'AI/ML'], completionRate: 0.72, engagementScore: 0.75 },
    ],
    complianceStatus: [
      { requirementName: 'Annual Security Training', category: 'Security', dueDate: '2026-03-31', completedCount: 98, totalRequired: 114, completionRate: 0.86, status: 'on_track', nonCompliantUsers: [] },
      { requirementName: 'Data Privacy (GDPR)', category: 'Privacy', dueDate: '2026-02-28', completedCount: 105, totalRequired: 114, completionRate: 0.92, status: 'on_track', nonCompliantUsers: [] },
      { requirementName: 'AI Ethics Certification', category: 'AI Governance', dueDate: '2026-06-30', completedCount: 32, totalRequired: 114, completionRate: 0.28, status: 'at_risk', nonCompliantUsers: [] },
      { requirementName: 'Anti-Harassment Training', category: 'HR', dueDate: '2026-04-15', completedCount: 88, totalRequired: 114, completionRate: 0.77, status: 'on_track', nonCompliantUsers: [] },
    ],
    skillTrends: [
      { skillName: 'AI/ML Fundamentals', dataPoints: [
        { date: '2025-09', avgProficiency: 0.18 }, { date: '2025-10', avgProficiency: 0.22 },
        { date: '2025-11', avgProficiency: 0.25 }, { date: '2025-12', avgProficiency: 0.28 },
        { date: '2026-01', avgProficiency: 0.31 }, { date: '2026-02', avgProficiency: 0.34 },
      ], forecast: 0.42 },
      { skillName: 'Data Analysis', dataPoints: [
        { date: '2025-09', avgProficiency: 0.48 }, { date: '2025-10', avgProficiency: 0.51 },
        { date: '2025-11', avgProficiency: 0.54 }, { date: '2025-12', avgProficiency: 0.57 },
        { date: '2026-01', avgProficiency: 0.60 }, { date: '2026-02', avgProficiency: 0.62 },
      ], forecast: 0.68 },
    ],
    recommendations: [
      { type: 'training', priority: 'critical', title: 'Organization-wide AI Literacy Program', description: 'Only 34% average proficiency in AI/ML. Launch a mandatory learning pathway to reach 60% by Q3.', impact: 'Enables AI-driven decision making across all departments', estimatedCost: '$15,000 (platform + time)' },
      { type: 'succession', priority: 'high', title: 'Leadership Development for Engineering', description: 'Engineering has lowest leadership scores (0.45). Identify and develop 5 future leaders.', impact: 'Reduces succession risk for 3 critical management roles', estimatedCost: '$8,000 (coaching + programs)' },
      { type: 'hiring', priority: 'medium', title: 'Data Analytics Capability in Sales', description: 'Sales team has significant data analysis gap (0.38). Consider hiring a sales analyst or upskilling 3 team members.', impact: 'Could increase sales efficiency by 15-20%', estimatedCost: '$12,000 (training) or $75,000 (hire)' },
      { type: 'compliance', priority: 'high', title: 'Accelerate AI Ethics Certification', description: 'Only 28% completion with Q2 deadline. Send targeted reminders and allocate dedicated learning time.', impact: 'Regulatory compliance for AI-using departments', estimatedCost: '$2,000 (time allocation)' },
    ],
  };
}

let cachedIntelligence: SkillsIntelligence | null = null;

// GET - Fetch skills intelligence data
export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get('section');

  if (!cachedIntelligence) {
    cachedIntelligence = generateDemoIntelligence();
  }

  if (section) {
    switch (section) {
      case 'heatmap': return NextResponse.json({ heatmap: cachedIntelligence.skillsHeatmap });
      case 'experts': return NextResponse.json({ experts: cachedIntelligence.emergingExperts });
      case 'departments': return NextResponse.json({ departments: cachedIntelligence.departmentAnalysis });
      case 'compliance': return NextResponse.json({ compliance: cachedIntelligence.complianceStatus });
      case 'trends': return NextResponse.json({ trends: cachedIntelligence.skillTrends });
      case 'recommendations': return NextResponse.json({ recommendations: cachedIntelligence.recommendations });
      default: return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
    }
  }

  return NextResponse.json(cachedIntelligence);
}

// POST - Refresh intelligence or update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'refresh') {
      cachedIntelligence = generateDemoIntelligence();
      return NextResponse.json({ success: true, intelligence: cachedIntelligence });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
