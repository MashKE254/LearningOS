'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCanvas } from '../canvas-context';
import { DiagramContent } from '../types';
import {
  Square,
  Circle,
  ArrowRight,
  Type,
  Diamond,
  Hexagon,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react';

type ShapeType = 'rectangle' | 'circle' | 'diamond' | 'hexagon';
type Tool = 'select' | 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'text';

interface DiagramShape {
  id: string;
  type: ShapeType | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
}

interface DiagramArrow {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

interface DiagramData {
  shapes: DiagramShape[];
  arrows: DiagramArrow[];
}

const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export function DiagramTool() {
  const { updateContent } = useCanvas();
  const [tool, setTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<DiagramShape[]>([]);
  const [arrows, setArrows] = useState<DiagramArrow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync with canvas context
  useEffect(() => {
    const data: DiagramData = { shapes, arrows };
    const content: DiagramContent = {
      type: 'diagram',
      format: 'excalidraw', // Using a custom format similar to Excalidraw
      data: JSON.stringify(data),
    };
    updateContent(content);
  }, [shapes, arrows, updateContent]);

  const addShape = useCallback(
    (type: ShapeType | 'text', x: number, y: number) => {
      const newShape: DiagramShape = {
        id: crypto.randomUUID(),
        type,
        x,
        y,
        width: type === 'text' ? 100 : 120,
        height: type === 'text' ? 30 : 80,
        text: type === 'text' ? 'Text' : '',
        color: selectedColor,
      };
      setShapes([...shapes, newShape]);
      setSelectedId(newShape.id);
      setTool('select');
    },
    [shapes, selectedColor]
  );

  const updateShape = useCallback(
    (id: string, updates: Partial<DiagramShape>) => {
      setShapes(shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    [shapes]
  );

  const deleteShape = useCallback(
    (id: string) => {
      setShapes(shapes.filter((s) => s.id !== id));
      setArrows(arrows.filter((a) => a.fromId !== id && a.toId !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [shapes, arrows, selectedId]
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === 'select') {
      setSelectedId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - 60;
    const y = (e.clientY - rect.top) / scale - 40;

    if (tool !== 'arrow') {
      addShape(tool as ShapeType | 'text', x, y);
    }
  };

  const handleShapeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
  };

  const handleShapeMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    setShapes(
      shapes.map((s) =>
        s.id === selectedId ? { ...s, x: s.x + dx, y: s.y + dy } : s
      )
    );
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderShape = (shape: DiagramShape) => {
    const isSelected = selectedId === shape.id;
    const baseStyle = {
      left: shape.x,
      top: shape.y,
      width: shape.width,
      height: shape.height,
    };

    const shapeClass = `absolute cursor-move transition-shadow ${
      isSelected ? 'ring-2 ring-violet-500 ring-offset-2' : ''
    }`;

    switch (shape.type) {
      case 'rectangle':
        return (
          <div
            key={shape.id}
            style={{ ...baseStyle, backgroundColor: shape.color }}
            className={`${shapeClass} rounded-lg flex items-center justify-center`}
            onClick={(e) => handleShapeClick(e, shape.id)}
            onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
          >
            {shape.text && (
              <input
                type="text"
                value={shape.text}
                onChange={(e) => updateShape(shape.id, { text: e.target.value })}
                className="bg-transparent text-white text-center text-sm w-full px-2 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        );

      case 'circle':
        return (
          <div
            key={shape.id}
            style={{ ...baseStyle, backgroundColor: shape.color }}
            className={`${shapeClass} rounded-full flex items-center justify-center`}
            onClick={(e) => handleShapeClick(e, shape.id)}
            onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
          >
            {shape.text && (
              <input
                type="text"
                value={shape.text}
                onChange={(e) => updateShape(shape.id, { text: e.target.value })}
                className="bg-transparent text-white text-center text-sm w-full px-2 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        );

      case 'diamond':
        return (
          <div
            key={shape.id}
            style={{
              ...baseStyle,
              backgroundColor: shape.color,
              transform: 'rotate(45deg)',
            }}
            className={`${shapeClass} rounded-lg flex items-center justify-center`}
            onClick={(e) => handleShapeClick(e, shape.id)}
            onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
          >
            <span
              className="text-white text-sm"
              style={{ transform: 'rotate(-45deg)' }}
            >
              {shape.text}
            </span>
          </div>
        );

      case 'text':
        return (
          <div
            key={shape.id}
            style={baseStyle}
            className={`${shapeClass} flex items-center`}
            onClick={(e) => handleShapeClick(e, shape.id)}
            onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
          >
            <input
              type="text"
              value={shape.text}
              onChange={(e) => updateShape(shape.id, { text: e.target.value })}
              className="bg-transparent text-gray-900 text-sm w-full focus:outline-none"
              placeholder="Enter text..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const tools = [
    { id: 'select' as Tool, icon: <Move className="w-4 h-4" />, label: 'Select' },
    { id: 'rectangle' as Tool, icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    { id: 'diamond' as Tool, icon: <Diamond className="w-4 h-4" />, label: 'Diamond' },
    { id: 'text' as Tool, icon: <Type className="w-4 h-4" />, label: 'Text' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 p-2">
        <div className="flex items-center gap-4">
          {/* Shape Tools */}
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
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  selectedColor === color
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Zoom & Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {selectedId && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={() => selectedId && deleteShape(selectedId)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-auto bg-gray-50 relative"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative min-w-full min-h-full"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Shapes */}
          {shapes.map(renderShape)}
        </div>

        {/* Empty State */}
        {shapes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <p className="mb-2">Click on a shape tool and click on the canvas to add shapes</p>
              <p className="text-sm">Use the select tool to move shapes around</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
