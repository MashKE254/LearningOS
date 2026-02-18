'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '../canvas-context';
import { GraphContent, GraphEquation, GraphViewport } from '../types';
import { Plus, Trash2, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const defaultViewport: GraphViewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

// Simple math expression parser and evaluator
function evaluateExpression(expr: string, x: number): number | null {
  try {
    // Replace common math functions and constants
    let sanitized = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log/g, 'Math.log')
      .replace(/ln/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e(?![x])/gi, 'Math.E');

    // Simple security: only allow safe characters
    if (!/^[0-9x+\-*/().Math\s^sincotaqrtblogexpPI E]+$/i.test(sanitized)) {
      return null;
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return ${sanitized}`);
    const result = fn(x);

    if (typeof result !== 'number' || !isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

export function GraphPlotter() {
  const { updateContent } = useCanvas();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [equations, setEquations] = useState<GraphEquation[]>([
    { id: crypto.randomUUID(), expression: 'x^2', color: colors[0], visible: true },
  ]);
  const [viewport, setViewport] = useState<GraphViewport>(defaultViewport);
  const [newExpression, setNewExpression] = useState('');

  // Sync with canvas context
  useEffect(() => {
    const content: GraphContent = {
      type: 'graph',
      equations,
      viewport,
    };
    updateContent(content);
  }, [equations, viewport, updateContent]);

  // Draw the graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const { width, height } = canvas;
    const { xMin, xMax, yMin, yMax } = viewport;

    // Helper functions for coordinate conversion
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;

    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const y0 = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0);
      ctx.stroke();
    }

    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const x0 = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, height);
      ctx.stroke();
    }

    // Draw equations
    equations.forEach((eq) => {
      if (!eq.visible || !eq.expression.trim()) return;

      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let isFirstPoint = true;
      const step = (xMax - xMin) / width;

      for (let px = 0; px < width; px++) {
        const x = xMin + px * step;
        const y = evaluateExpression(eq.expression, x);

        if (y === null) continue;

        const canvasY = toCanvasY(y);

        // Skip if out of bounds
        if (canvasY < -100 || canvasY > height + 100) {
          isFirstPoint = true;
          continue;
        }

        if (isFirstPoint) {
          ctx.moveTo(px, canvasY);
          isFirstPoint = false;
        } else {
          ctx.lineTo(px, canvasY);
        }
      }

      ctx.stroke();
    });

    // Draw axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';

    // X-axis labels
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      if (x === 0) continue;
      const canvasX = toCanvasX(x);
      const canvasY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) + 15 : height - 5;
      ctx.fillText(x.toString(), canvasX - 5, canvasY);
    }

    // Y-axis labels
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y === 0) continue;
      const canvasX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) + 5 : 5;
      const canvasY = toCanvasY(y);
      ctx.fillText(y.toString(), canvasX, canvasY + 4);
    }
  }, [equations, viewport]);

  useEffect(() => {
    drawGraph();
    window.addEventListener('resize', drawGraph);
    return () => window.removeEventListener('resize', drawGraph);
  }, [drawGraph]);

  const addEquation = () => {
    if (!newExpression.trim()) return;

    const colorIndex = equations.length % colors.length;
    const newEq: GraphEquation = {
      id: crypto.randomUUID(),
      expression: newExpression,
      color: colors[colorIndex],
      visible: true,
    };

    setEquations([...equations, newEq]);
    setNewExpression('');
  };

  const updateEquation = (id: string, updates: Partial<GraphEquation>) => {
    setEquations(equations.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq)));
  };

  const removeEquation = (id: string) => {
    setEquations(equations.filter((eq) => eq.id !== id));
  };

  const zoom = (factor: number) => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xRange = (xMax - xMin) * factor;
    const yRange = (yMax - yMin) * factor;

    setViewport({
      xMin: xCenter - xRange / 2,
      xMax: xCenter + xRange / 2,
      yMin: yCenter - yRange / 2,
      yMax: yCenter + yRange / 2,
    });
  };

  const resetViewport = () => {
    setViewport(defaultViewport);
  };

  return (
    <div className="flex h-full">
      {/* Graph Canvas */}
      <div ref={containerRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white rounded-lg shadow-md border border-gray-200">
          <button
            onClick={() => zoom(0.8)}
            className="p-2 hover:bg-gray-100 rounded-t-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => zoom(1.25)}
            className="p-2 hover:bg-gray-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={resetViewport}
            className="p-2 hover:bg-gray-100 rounded-b-lg"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Equation Sidebar */}
      <div className="w-72 border-l border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Functions</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newExpression}
              onChange={(e) => setNewExpression(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEquation()}
              placeholder="e.g., sin(x), x^2"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={addEquation}
              disabled={!newExpression.trim()}
              className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-2">
          {equations.map((eq) => (
            <div
              key={eq.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: eq.color }}
              />
              <input
                type="text"
                value={eq.expression}
                onChange={(e) => updateEquation(eq.id, { expression: e.target.value })}
                className="flex-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
              />
              <button
                onClick={() => updateEquation(eq.id, { visible: !eq.visible })}
                className={`p-1 rounded ${
                  eq.visible ? 'text-gray-500' : 'text-gray-300'
                }`}
              >
                {eq.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => removeEquation(eq.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Help */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            <strong>Supported:</strong> x, +, -, *, /, ^, sin, cos, tan, sqrt, abs, log, exp, pi
          </p>
        </div>
      </div>
    </div>
  );
}
