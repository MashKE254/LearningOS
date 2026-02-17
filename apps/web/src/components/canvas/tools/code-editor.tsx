'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCanvas } from '../canvas-context';
import { CodeContent } from '../types';
import { Play, Copy, Check, ChevronDown, Terminal, AlertCircle } from 'lucide-react';

const languages = [
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'c', name: 'C', extension: '.c' },
  { id: 'sql', name: 'SQL', extension: '.sql' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'go', name: 'Go', extension: '.go' },
];

const templates: Record<string, string> = {
  python: `# Write your Python code here
def main():
    pass

if __name__ == "__main__":
    main()
`,
  javascript: `// Write your JavaScript code here
function main() {

}

main();
`,
  typescript: `// Write your TypeScript code here
function main(): void {

}

main();
`,
  java: `// Write your Java code here
public class Solution {
    public static void main(String[] args) {

    }
}
`,
  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {

    return 0;
}
`,
  sql: `-- Write your SQL query here
SELECT *
FROM table_name
WHERE condition;
`,
};

interface CodeEditorProps {
  initialContent?: CodeContent;
}

export function CodeEditor({ initialContent }: CodeEditorProps) {
  const { state, updateContent } = useCanvas();
  const [language, setLanguage] = useState(initialContent?.language ?? 'python');
  const [code, setCode] = useState(initialContent?.code ?? templates.python ?? '');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  // Sync with canvas context
  useEffect(() => {
    const content: CodeContent = {
      type: 'code',
      language,
      code,
      output: output ?? undefined,
      error: error ?? undefined,
    };
    updateContent(content);
  }, [language, code, output, error, updateContent]);

  // Load existing content
  useEffect(() => {
    if (state.content?.type === 'code') {
      setLanguage(state.content.language);
      setCode(state.content.code);
      setOutput(state.content.output ?? null);
      setError(state.content.error ?? null);
    }
  }, []);

  const handleLanguageChange = useCallback((newLang: string) => {
    setLanguage(newLang);
    if (!code || code === templates[language]) {
      setCode(templates[newLang] ?? '');
    }
    setShowLanguages(false);
    setOutput(null);
    setError(null);
  }, [code, language]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);

    try {
      // In a real implementation, this would call an API to execute the code
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulated output
      setOutput('Code execution simulated.\nIn production, this would run in a sandboxed environment.');
    } catch {
      setError('Failed to execute code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const selectedLang = languages.find((l) => l.id === language);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-sm font-medium">{selectedLang?.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showLanguages && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowLanguages(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-auto"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      lang.id === language ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                    }`}
                  >
                    {lang.name}
                    <span className="text-gray-400 ml-2">{lang.extension}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isRunning || !code.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        {(output || error) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="border-t border-gray-700 bg-gray-900"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">Output</span>
            </div>
            <div className="p-4 max-h-48 overflow-auto">
              {error ? (
                <div className="flex items-start gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                </div>
              ) : (
                <pre className="text-sm text-green-400 whitespace-pre-wrap">{output}</pre>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
