'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useCanvas } from '../canvas-context';
import { WhiteboardContent, WhiteboardStroke } from '../types';
import { Pencil, Eraser, Circle, Square, Type, Trash2, Download } from 'lucide-react';

type Tool = 'pen' | 'eraser' | 'circle' | 'rectangle' | 'text';

const colors = [
  '#000000', // Black
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

const brushSizes = [2, 4, 8, 12, 16];

interface WhiteboardProps {
  initialContent?: WhiteboardContent;
}

export function Whiteboard({ initialContent }: WhiteboardProps) {
  const { updateContent } = useCanvas();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>(initialContent?.strokes ?? []);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Redraw canvas when strokes change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all saved strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      currentStroke.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [strokes, currentStroke, color, brushSize, tool]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Sync with canvas context
  useEffect(() => {
    const content: WhiteboardContent = {
      type: 'whiteboard',
      strokes,
      objects: [],
    };
    updateContent(content);
  }, [strokes, updateContent]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool !== 'pen' && tool !== 'eraser') return;

    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentStroke([point]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handleEnd = () => {
    if (!isDrawing) return;

    if (currentStroke.length > 1) {
      const newStroke: WhiteboardStroke = {
        id: crypto.randomUUID(),
        points: currentStroke,
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? brushSize * 3 : brushSize,
      };
      setStrokes((prev) => [...prev, newStroke]);
    }

    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const tools = [
    { id: 'pen' as Tool, icon: <Pencil className="w-4 h-4" />, label: 'Pen' },
    { id: 'eraser' as Tool, icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
    // Future tools
    // { id: 'circle' as Tool, icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    // { id: 'rectangle' as Tool, icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
    // { id: 'text' as Tool, icon: <Type className="w-4 h-4" />, label: 'Text' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 p-2">
        <div className="flex items-center gap-4">
          {/* Tools */}
          <div className="flex items-center gap-1">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-2 rounded-lg transition-colors ${
                  tool === t.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'border-violet-500 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Brush Size */}
          <div className="flex items-center gap-1">
            {brushSizes.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`p-2 rounded-lg transition-colors ${
                  brushSize === size
                    ? 'bg-violet-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{
                    width: size,
                    height: size,
                    color: brushSize === size ? '#8b5cf6' : '#9ca3af',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="touch-none"
        />
      </div>
    </div>
  );
}
