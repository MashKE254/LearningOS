'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCanvas } from './canvas-context';
import { MathEditor } from './tools/math-editor';
import { CodeEditor } from './tools/code-editor';
import { Whiteboard } from './tools/whiteboard';
import { FileUploader } from './tools/file-uploader';
import { TextAnnotator } from './tools/text-annotator';
import { DiagramTool } from './tools/diagram-tool';
import { GraphPlotter } from './tools/graph-plotter';
import {
  FunctionSquare,
  Code,
  Shapes,
  LineChart,
  FlaskConical,
  Highlighter,
  PenTool,
  Upload,
} from 'lucide-react';

interface CanvasWorkAreaProps {
  className?: string;
  minHeight?: string;
}

export function CanvasWorkArea({
  className = '',
  minHeight = '300px',
}: CanvasWorkAreaProps) {
  const { state, setActiveTool } = useCanvas();

  const renderTool = () => {
    switch (state.activeTool) {
      case 'math-editor':
        return <MathEditor />;
      case 'code-editor':
        return <CodeEditor />;
      case 'whiteboard':
        return <Whiteboard />;
      case 'file-upload':
        return <FileUploader />;
      case 'text-annotator':
        return <TextAnnotator />;
      case 'diagram-tool':
        return <DiagramTool />;
      case 'graph-plotter':
        return <GraphPlotter />;
      case 'chemistry-drawer':
        // Placeholder for chemistry drawer
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Chemistry drawer coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  const toolOptions = [
    { id: 'math-editor' as const, icon: <FunctionSquare className="w-6 h-6" />, label: 'Math', color: 'violet' },
    { id: 'code-editor' as const, icon: <Code className="w-6 h-6" />, label: 'Code', color: 'blue' },
    { id: 'diagram-tool' as const, icon: <Shapes className="w-6 h-6" />, label: 'Diagram', color: 'emerald' },
    { id: 'graph-plotter' as const, icon: <LineChart className="w-6 h-6" />, label: 'Graph', color: 'orange' },
    { id: 'whiteboard' as const, icon: <PenTool className="w-6 h-6" />, label: 'Sketch', color: 'pink' },
    { id: 'file-upload' as const, icon: <Upload className="w-6 h-6" />, label: 'Upload', color: 'gray' },
  ];

  return (
    <div
      className={`relative bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      <AnimatePresence mode="wait">
        {state.activeTool ? (
          <motion.div
            key={state.activeTool}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            {renderTool()}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Choose a tool to get started
            </h3>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
              Select a tool from the toolbar above, or click one below to start working on your answer.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {toolOptions.map((tool) => (
                <motion.button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all"
                >
                  <div className="text-gray-400">{tool.icon}</div>
                  <span className="text-sm text-gray-600">{tool.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
