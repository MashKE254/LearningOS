'use client';

import { motion } from 'framer-motion';
import { useCanvas } from './canvas-context';
import { CanvasToolType, CANVAS_TOOLS } from './types';
import {
  FunctionSquare,
  Code,
  Shapes,
  LineChart,
  FlaskConical,
  Highlighter,
  PenTool,
  Upload,
  Undo,
  Redo,
  Trash2,
  Send,
} from 'lucide-react';

const toolIcons: Record<CanvasToolType, React.ReactNode> = {
  'math-editor': <FunctionSquare className="w-4 h-4" />,
  'code-editor': <Code className="w-4 h-4" />,
  'diagram-tool': <Shapes className="w-4 h-4" />,
  'graph-plotter': <LineChart className="w-4 h-4" />,
  'chemistry-drawer': <FlaskConical className="w-4 h-4" />,
  'text-annotator': <Highlighter className="w-4 h-4" />,
  'whiteboard': <PenTool className="w-4 h-4" />,
  'file-upload': <Upload className="w-4 h-4" />,
};

interface CanvasToolbarProps {
  availableTools?: CanvasToolType[];
  onSubmit?: () => void;
  className?: string;
}

export function CanvasToolbar({
  availableTools,
  onSubmit,
  className = '',
}: CanvasToolbarProps) {
  const {
    state,
    setActiveTool,
    clearCanvas,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvas();

  const tools = availableTools
    ? CANVAS_TOOLS.filter((t) => availableTools.includes(t.id))
    : CANVAS_TOOLS;

  return (
    <div
      className={`flex items-center gap-1 p-2 bg-white border border-gray-200 rounded-xl ${className}`}
    >
      {/* Tool Buttons */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const isActive = state.activeTool === tool.id;
          return (
            <motion.button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title={tool.name}
            >
              {toolIcons[tool.id]}
              {isActive && (
                <motion.div
                  layoutId="activeTool"
                  className="absolute inset-0 bg-violet-100 rounded-lg -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* History Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo
              ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${
            canRedo
              ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
        <button
          onClick={clearCanvas}
          disabled={!state.content}
          className={`p-2 rounded-lg transition-colors ${
            state.content
              ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Submit Button */}
      {onSubmit && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <button
            onClick={onSubmit}
            disabled={!state.content}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              state.content
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </>
      )}
    </div>
  );
}
