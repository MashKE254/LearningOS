'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCanvas } from '../canvas-context';
import { MathContent, MathStep } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, Info } from 'lucide-react';

// Math symbols for quick insertion
const mathSymbols = [
  { label: 'π', latex: '\\pi' },
  { label: '√', latex: '\\sqrt{}' },
  { label: '∫', latex: '\\int' },
  { label: '∑', latex: '\\sum' },
  { label: '∞', latex: '\\infty' },
  { label: '±', latex: '\\pm' },
  { label: '≤', latex: '\\leq' },
  { label: '≥', latex: '\\geq' },
  { label: '≠', latex: '\\neq' },
  { label: '÷', latex: '\\div' },
  { label: '×', latex: '\\times' },
  { label: '→', latex: '\\rightarrow' },
];

const fractionTemplates = [
  { label: 'a/b', latex: '\\frac{a}{b}' },
  { label: 'x²', latex: 'x^{2}' },
  { label: 'xₙ', latex: 'x_{n}' },
  { label: '√x', latex: '\\sqrt{x}' },
  { label: 'ⁿ√x', latex: '\\sqrt[n]{x}' },
  { label: 'log', latex: '\\log_{b}(x)' },
  { label: 'lim', latex: '\\lim_{x \\to a}' },
  { label: '∫ab', latex: '\\int_{a}^{b}' },
];

interface MathEditorProps {
  initialContent?: MathContent;
}

export function MathEditor({ initialContent }: MathEditorProps) {
  const { state, updateContent } = useCanvas();
  const [latex, setLatex] = useState(initialContent?.latex ?? '');
  const [steps, setSteps] = useState<MathStep[]>(initialContent?.steps ?? []);
  const [showSymbols, setShowSymbols] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync with canvas context
  useEffect(() => {
    const content: MathContent = {
      type: 'math',
      latex,
      steps,
    };
    updateContent(content);
  }, [latex, steps, updateContent]);

  // Load existing content
  useEffect(() => {
    if (state.content?.type === 'math') {
      setLatex(state.content.latex);
      setSteps(state.content.steps ?? []);
    }
  }, []);

  const insertSymbol = useCallback((symbolLatex: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const newValue = latex.slice(0, start) + symbolLatex + latex.slice(end);
      setLatex(newValue);

      // Set cursor position after inserted symbol
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = start + symbolLatex.length;
          inputRef.current.selectionStart = newPos;
          inputRef.current.selectionEnd = newPos;
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [latex]);

  const addStep = useCallback(() => {
    const newStep: MathStep = {
      id: crypto.randomUUID(),
      latex: '',
      explanation: '',
    };
    setSteps([...steps, newStep]);
  }, [steps]);

  const updateStep = useCallback((id: string, updates: Partial<MathStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, [steps]);

  const removeStep = useCallback((id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  }, [steps]);

  const moveStep = useCallback((id: string, direction: 'up' | 'down') => {
    const index = steps.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  }, [steps]);

  return (
    <div className="flex flex-col h-full">
      {/* Symbol Toolbar */}
      <div className="border-b border-gray-200 p-3">
        <button
          onClick={() => setShowSymbols(!showSymbols)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          {showSymbols ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Math Symbols
        </button>

        {showSymbols && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex flex-wrap gap-1">
              {mathSymbols.map((symbol) => (
                <button
                  key={symbol.latex}
                  onClick={() => insertSymbol(symbol.latex)}
                  className="px-2 py-1 text-lg bg-gray-100 hover:bg-violet-100 hover:text-violet-700 rounded transition-colors"
                  title={symbol.latex}
                >
                  {symbol.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {fractionTemplates.map((template) => (
                <button
                  key={template.latex}
                  onClick={() => insertSymbol(template.latex)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-violet-100 hover:text-violet-700 rounded transition-colors font-mono"
                  title={template.latex}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Input Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Expression
          </label>
          <textarea
            ref={inputRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="Enter LaTeX here... e.g., \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
            className="w-full h-24 px-4 py-3 font-mono text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          />

          {/* Preview */}
          {latex && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <div className="text-lg text-gray-900 font-mono">
                {/* In a real implementation, this would render the LaTeX using KaTeX or MathJax */}
                <code>{latex}</code>
              </div>
            </div>
          )}
        </div>

        {/* Steps Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Show Your Work (optional)
            </label>
            <button
              onClick={addStep}
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          {steps.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Showing your work helps the AI understand your thinking and give better feedback.
                Add steps to walk through your solution.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Step {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  value={step.latex}
                  onChange={(e) => updateStep(step.id, { latex: e.target.value })}
                  placeholder="LaTeX for this step..."
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 mb-2"
                />
                <input
                  value={step.explanation ?? ''}
                  onChange={(e) => updateStep(step.id, { explanation: e.target.value })}
                  placeholder="Explain what you did in this step..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
