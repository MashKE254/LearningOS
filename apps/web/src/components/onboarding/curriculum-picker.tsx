'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Check } from 'lucide-react';

interface ExamBoard {
  id: string;
  name: string;
  code: string;
  country: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

const examBoards: ExamBoard[] = [
  {
    id: 'cie',
    name: 'Cambridge International (CIE)',
    code: 'CIE',
    country: 'International',
    subjects: [
      { id: 'cie-math', name: 'Mathematics', code: '0580' },
      { id: 'cie-physics', name: 'Physics', code: '0625' },
      { id: 'cie-chemistry', name: 'Chemistry', code: '0620' },
      { id: 'cie-biology', name: 'Biology', code: '0610' },
      { id: 'cie-english', name: 'English Language', code: '0500' },
      { id: 'cie-economics', name: 'Economics', code: '0455' },
      { id: 'cie-business', name: 'Business Studies', code: '0450' },
      { id: 'cie-cs', name: 'Computer Science', code: '0478' },
    ],
  },
  {
    id: 'ib',
    name: 'International Baccalaureate (IB)',
    code: 'IB',
    country: 'International',
    subjects: [
      { id: 'ib-math-aa', name: 'Mathematics AA', code: 'MAA' },
      { id: 'ib-math-ai', name: 'Mathematics AI', code: 'MAI' },
      { id: 'ib-physics', name: 'Physics', code: 'PHY' },
      { id: 'ib-chemistry', name: 'Chemistry', code: 'CHE' },
      { id: 'ib-biology', name: 'Biology', code: 'BIO' },
      { id: 'ib-english', name: 'English A', code: 'ENG' },
      { id: 'ib-economics', name: 'Economics', code: 'ECO' },
    ],
  },
  {
    id: 'kcse',
    name: 'Kenya Certificate (KCSE)',
    code: 'KCSE',
    country: 'Kenya',
    subjects: [
      { id: 'kcse-math', name: 'Mathematics', code: 'MAT' },
      { id: 'kcse-physics', name: 'Physics', code: 'PHY' },
      { id: 'kcse-chemistry', name: 'Chemistry', code: 'CHE' },
      { id: 'kcse-biology', name: 'Biology', code: 'BIO' },
      { id: 'kcse-english', name: 'English', code: 'ENG' },
      { id: 'kcse-kiswahili', name: 'Kiswahili', code: 'KIS' },
    ],
  },
  {
    id: 'common-core',
    name: 'Common Core (US)',
    code: 'CC',
    country: 'United States',
    subjects: [
      { id: 'cc-math-6', name: 'Math Grade 6', code: 'M6' },
      { id: 'cc-math-7', name: 'Math Grade 7', code: 'M7' },
      { id: 'cc-math-8', name: 'Math Grade 8', code: 'M8' },
      { id: 'cc-algebra', name: 'Algebra I', code: 'ALG1' },
      { id: 'cc-geometry', name: 'Geometry', code: 'GEO' },
      { id: 'cc-ela', name: 'ELA', code: 'ELA' },
    ],
  },
  {
    id: 'cbse',
    name: 'CBSE (India)',
    code: 'CBSE',
    country: 'India',
    subjects: [
      { id: 'cbse-math-10', name: 'Mathematics Class 10', code: 'M10' },
      { id: 'cbse-math-12', name: 'Mathematics Class 12', code: 'M12' },
      { id: 'cbse-physics', name: 'Physics', code: 'PHY' },
      { id: 'cbse-chemistry', name: 'Chemistry', code: 'CHE' },
      { id: 'cbse-biology', name: 'Biology', code: 'BIO' },
    ],
  },
  {
    id: 'ap',
    name: 'Advanced Placement (AP)',
    code: 'AP',
    country: 'United States',
    subjects: [
      { id: 'ap-calc-ab', name: 'Calculus AB', code: 'CALCAB' },
      { id: 'ap-calc-bc', name: 'Calculus BC', code: 'CALCBC' },
      { id: 'ap-physics-1', name: 'Physics 1', code: 'PHY1' },
      { id: 'ap-physics-c', name: 'Physics C', code: 'PHYC' },
      { id: 'ap-chemistry', name: 'Chemistry', code: 'CHE' },
      { id: 'ap-biology', name: 'Biology', code: 'BIO' },
      { id: 'ap-cs', name: 'Computer Science A', code: 'CSA' },
    ],
  },
];

interface CurriculumPickerProps {
  onSelect: (examBoard: ExamBoard, subject: Subject) => void;
  selectedExamBoard?: string;
  selectedSubject?: string;
}

export function CurriculumPicker({
  onSelect,
  selectedExamBoard,
  selectedSubject,
}: CurriculumPickerProps) {
  const [search, setSearch] = useState('');
  const [activeBoard, setActiveBoard] = useState<string | null>(selectedExamBoard || null);

  const filteredBoards = examBoards.filter(
    (board) =>
      board.name.toLowerCase().includes(search.toLowerCase()) ||
      board.code.toLowerCase().includes(search.toLowerCase()) ||
      board.country.toLowerCase().includes(search.toLowerCase()) ||
      board.subjects.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search curricula or subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Exam Boards List */}
      <div className="space-y-2">
        {filteredBoards.map((board) => (
          <div key={board.id} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Board Header */}
            <button
              onClick={() => setActiveBoard(activeBoard === board.id ? null : board.id)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                activeBoard === board.id ? 'bg-violet-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div>
                <div className="font-medium text-gray-900">{board.name}</div>
                <div className="text-sm text-gray-500">{board.country}</div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  activeBoard === board.id ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Subjects */}
            <AnimatePresence>
              {activeBoard === board.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-2 bg-gray-50 grid grid-cols-2 gap-2">
                    {board.subjects.map((subject) => {
                      const isSelected =
                        selectedExamBoard === board.id && selectedSubject === subject.id;
                      return (
                        <button
                          key={subject.id}
                          onClick={() => onSelect(board, subject)}
                          className={`flex items-center justify-between p-3 rounded-lg text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-violet-600 text-white'
                              : 'bg-white hover:bg-violet-50 text-gray-700'
                          }`}
                        >
                          <span>{subject.name}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
