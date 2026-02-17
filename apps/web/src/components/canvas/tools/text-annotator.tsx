'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCanvas } from '../canvas-context';
import { TextContent, TextAnnotation } from '../types';
import { Highlighter, MessageSquare, Trash2, Plus } from 'lucide-react';

const highlightColors = [
  { id: 'yellow', color: '#FEF08A', label: 'Yellow' },
  { id: 'green', color: '#BBF7D0', label: 'Green' },
  { id: 'blue', color: '#BFDBFE', label: 'Blue' },
  { id: 'pink', color: '#FBCFE8', label: 'Pink' },
  { id: 'orange', color: '#FED7AA', label: 'Orange' },
];

interface TextAnnotatorProps {
  initialContent?: TextContent;
}

export function TextAnnotator({ initialContent }: TextAnnotatorProps) {
  const { state, updateContent } = useCanvas();
  const [text, setText] = useState(initialContent?.content ?? '');
  const [annotations, setAnnotations] = useState<TextAnnotation[]>(
    initialContent?.annotations ?? []
  );
  const [selectedColor, setSelectedColor] = useState(highlightColors[0]);
  const [selectedText, setSelectedText] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);

  // Sync with canvas context
  useEffect(() => {
    const content: TextContent = {
      type: 'text',
      content: text,
      annotations,
    };
    updateContent(content);
  }, [text, annotations, updateContent]);

  // Load existing content
  useEffect(() => {
    if (state.content?.type === 'text') {
      setText(state.content.content);
      setAnnotations(state.content.annotations ?? []);
    }
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const textArea = document.getElementById('annotatable-text');
    if (!textArea || !textArea.contains(range.commonAncestorContainer)) {
      return;
    }

    const start = getTextOffset(textArea, range.startContainer, range.startOffset);
    const end = getTextOffset(textArea, range.endContainer, range.endOffset);

    if (start !== end) {
      setSelectedText({
        start: Math.min(start, end),
        end: Math.max(start, end),
        text: selection.toString(),
      });
    }
  };

  const getTextOffset = (
    container: Node,
    node: Node,
    offset: number
  ): number => {
    let totalOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode === node) {
        return totalOffset + offset;
      }
      totalOffset += currentNode.textContent?.length ?? 0;
      currentNode = walker.nextNode();
    }

    return totalOffset + offset;
  };

  const addAnnotation = useCallback(
    (label: string = '') => {
      if (!selectedText) return;

      const newAnnotation: TextAnnotation = {
        id: crypto.randomUUID(),
        start: selectedText.start,
        end: selectedText.end,
        label: label || selectedText.text.slice(0, 20),
        color: selectedColor.color,
      };

      setAnnotations([...annotations, newAnnotation]);
      setSelectedText(null);
      window.getSelection()?.removeAllRanges();
    },
    [selectedText, selectedColor, annotations]
  );

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (editingAnnotation === id) {
      setEditingAnnotation(null);
    }
  }, [editingAnnotation]);

  const updateAnnotationComment = useCallback(
    (id: string, comment: string) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, comment } : a))
      );
    },
    []
  );

  const renderAnnotatedText = () => {
    if (!text) return null;

    // Sort annotations by start position
    const sorted = [...annotations].sort((a, b) => a.start - b.start);

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    sorted.forEach((annotation) => {
      // Add text before this annotation
      if (annotation.start > lastEnd) {
        elements.push(
          <span key={`text-${lastEnd}`}>
            {text.slice(lastEnd, annotation.start)}
          </span>
        );
      }

      // Add highlighted text
      elements.push(
        <span
          key={annotation.id}
          className="relative cursor-pointer group"
          style={{ backgroundColor: annotation.color }}
          onClick={() => setEditingAnnotation(annotation.id)}
        >
          {text.slice(annotation.start, annotation.end)}
          {annotation.comment && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full" />
          )}
        </span>
      );

      lastEnd = annotation.end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      elements.push(<span key="text-end">{text.slice(lastEnd)}</span>);
    }

    return elements;
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Highlight color:</span>
            <div className="flex items-center gap-1">
              {highlightColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-transform ${
                    selectedColor.id === color.id
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {selectedText && (
            <button
              onClick={() => addAnnotation()}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700"
            >
              <Highlighter className="w-4 h-4" />
              Highlight
            </button>
          )}
        </div>

        {/* Text Area */}
        <div className="flex-1 overflow-auto p-4">
          {text ? (
            <div
              id="annotatable-text"
              onMouseUp={handleTextSelection}
              className="prose prose-sm max-w-none whitespace-pre-wrap select-text"
            >
              {renderAnnotatedText()}
            </div>
          ) : (
            <div className="h-full">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type text to annotate..."
                className="w-full h-full resize-none border-0 focus:outline-none focus:ring-0"
              />
            </div>
          )}
        </div>

        {/* Edit mode - show text input when no text */}
        {text && (
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setText('')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear and edit text
            </button>
          </div>
        )}
      </div>

      {/* Annotations Sidebar */}
      <div className="w-64 border-l border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Annotations</h3>
          <p className="text-xs text-gray-500 mt-1">
            {annotations.length} highlight{annotations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-2">
          {annotations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Select text to highlight
            </p>
          ) : (
            annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`p-3 rounded-lg border transition-all ${
                  editingAnnotation === annotation.id
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded flex-shrink-0 mt-1"
                    style={{ backgroundColor: annotation.color }}
                  />
                  <p className="flex-1 text-sm text-gray-700 line-clamp-2">
                    &ldquo;{text.slice(annotation.start, annotation.end)}&rdquo;
                  </p>
                  <button
                    onClick={() => removeAnnotation(annotation.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {editingAnnotation === annotation.id && (
                  <div className="mt-2">
                    <textarea
                      value={annotation.comment ?? ''}
                      onChange={(e) =>
                        updateAnnotationComment(annotation.id, e.target.value)
                      }
                      placeholder="Add a note..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
