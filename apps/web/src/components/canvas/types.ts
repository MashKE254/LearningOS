/**
 * Canvas/Work Area Types
 *
 * The Canvas is the non-chat input surface where students work on problems.
 * Different tools are available based on subject and mode.
 */

export type CanvasToolType =
  | 'math-editor'
  | 'code-editor'
  | 'diagram-tool'
  | 'graph-plotter'
  | 'chemistry-drawer'
  | 'text-annotator'
  | 'whiteboard'
  | 'file-upload';

export interface CanvasTool {
  id: CanvasToolType;
  name: string;
  description: string;
  icon: string;
  subjects: string[];
  defaultFor?: string[];
}

export interface CanvasState {
  activeTool: CanvasToolType | null;
  content: CanvasContent | null;
  history: CanvasHistoryEntry[];
  historyIndex: number;
  isDirty: boolean;
}

export type CanvasContent =
  | MathContent
  | CodeContent
  | DiagramContent
  | GraphContent
  | ChemistryContent
  | TextContent
  | WhiteboardContent
  | FileContent;

export interface MathContent {
  type: 'math';
  latex: string;
  rendered?: string;
  steps?: MathStep[];
}

export interface MathStep {
  id: string;
  latex: string;
  explanation?: string;
  isCorrect?: boolean;
}

export interface CodeContent {
  type: 'code';
  language: string;
  code: string;
  output?: string;
  error?: string;
}

export interface DiagramContent {
  type: 'diagram';
  format: 'excalidraw' | 'mermaid' | 'svg';
  data: string;
  thumbnail?: string;
}

export interface GraphContent {
  type: 'graph';
  equations: GraphEquation[];
  viewport: GraphViewport;
}

export interface GraphEquation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export interface GraphViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ChemistryContent {
  type: 'chemistry';
  format: 'smiles' | 'mol' | 'svg';
  data: string;
  moleculeName?: string;
}

export interface TextContent {
  type: 'text';
  content: string;
  annotations?: TextAnnotation[];
}

export interface TextAnnotation {
  id: string;
  start: number;
  end: number;
  label: string;
  color: string;
  comment?: string;
}

export interface WhiteboardContent {
  type: 'whiteboard';
  strokes: WhiteboardStroke[];
  objects: WhiteboardObject[];
}

export interface WhiteboardStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface WhiteboardObject {
  id: string;
  type: 'text' | 'image' | 'shape';
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface FileContent {
  type: 'file';
  files: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

export interface CanvasHistoryEntry {
  id: string;
  timestamp: Date;
  tool: CanvasToolType;
  content: CanvasContent;
  action: 'create' | 'update' | 'clear';
}

export interface CanvasSubmission {
  id: string;
  tool: CanvasToolType;
  content: CanvasContent;
  submittedAt: Date;
  questionId?: string;
  conceptId?: string;
}

// Canvas tool configurations
export const CANVAS_TOOLS: CanvasTool[] = [
  {
    id: 'math-editor',
    name: 'Math Editor',
    description: 'Write equations and mathematical expressions',
    icon: 'function',
    subjects: ['mathematics', 'physics', 'economics', 'statistics'],
    defaultFor: ['mathematics'],
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'Write and run code',
    icon: 'code',
    subjects: ['computer-science', 'programming', 'data-science'],
    defaultFor: ['computer-science', 'programming'],
  },
  {
    id: 'diagram-tool',
    name: 'Diagram Tool',
    description: 'Create flowcharts, mind maps, and diagrams',
    icon: 'shapes',
    subjects: ['all'],
  },
  {
    id: 'graph-plotter',
    name: 'Graph Plotter',
    description: 'Plot functions and visualize data',
    icon: 'line-chart',
    subjects: ['mathematics', 'physics', 'economics', 'statistics'],
  },
  {
    id: 'chemistry-drawer',
    name: 'Chemistry Drawer',
    description: 'Draw molecular structures and reactions',
    icon: 'flask',
    subjects: ['chemistry', 'biochemistry', 'organic-chemistry'],
    defaultFor: ['chemistry', 'organic-chemistry'],
  },
  {
    id: 'text-annotator',
    name: 'Text Annotator',
    description: 'Annotate and mark up text',
    icon: 'highlighter',
    subjects: ['all'],
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    description: 'Free-form drawing and sketching',
    icon: 'pen-tool',
    subjects: ['all'],
  },
  {
    id: 'file-upload',
    name: 'File Upload',
    description: 'Upload images, PDFs, and documents',
    icon: 'upload',
    subjects: ['all'],
  },
];

export function getToolsForSubject(subject: string): CanvasTool[] {
  return CANVAS_TOOLS.filter(
    (tool) => tool.subjects.includes('all') || tool.subjects.includes(subject)
  );
}

export function getDefaultToolForSubject(subject: string): CanvasToolType {
  const tool = CANVAS_TOOLS.find((t) => t.defaultFor?.includes(subject));
  return tool?.id ?? 'whiteboard';
}
