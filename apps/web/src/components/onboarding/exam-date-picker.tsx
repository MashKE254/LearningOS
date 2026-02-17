'use client';

import { useState } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ExamDatePickerProps {
  onSelect: (date: Date, daysUntil: number) => void;
  selectedDate?: Date;
}

export function ExamDatePicker({ onSelect, selectedDate }: ExamDatePickerProps) {
  const [date, setDate] = useState<string>(
    selectedDate ? selectedDate.toISOString().split('T')[0] : ''
  );

  const quickOptions = [
    { label: 'Tomorrow', days: 1 },
    { label: 'In 3 days', days: 3 },
    { label: 'In 1 week', days: 7 },
    { label: 'In 2 weeks', days: 14 },
    { label: 'In 1 month', days: 30 },
  ];

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const dateObj = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    onSelect(dateObj, daysUntil);
  };

  const handleQuickSelect = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const dateString = newDate.toISOString().split('T')[0];
    setDate(dateString);
    onSelect(newDate, days);
  };

  const getDaysUntil = () => {
    if (!date) return null;
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntil = getDaysUntil();

  return (
    <div className="space-y-6">
      {/* Quick Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick select
        </label>
        <div className="flex flex-wrap gap-2">
          {quickOptions.map((option) => {
            const isSelected = daysUntil === option.days;
            return (
              <button
                key={option.days}
                onClick={() => handleQuickSelect(option.days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or select a specific date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Urgency Indicator */}
      {daysUntil !== null && (
        <div
          className={`p-4 rounded-xl ${
            daysUntil <= 3
              ? 'bg-red-50 border border-red-200'
              : daysUntil <= 7
              ? 'bg-orange-50 border border-orange-200'
              : daysUntil <= 14
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {daysUntil <= 7 ? (
              <AlertTriangle
                className={`w-5 h-5 ${
                  daysUntil <= 3 ? 'text-red-500' : 'text-orange-500'
                }`}
              />
            ) : (
              <Clock
                className={`w-5 h-5 ${
                  daysUntil <= 14 ? 'text-yellow-600' : 'text-green-600'
                }`}
              />
            )}
            <div>
              <div
                className={`font-medium ${
                  daysUntil <= 3
                    ? 'text-red-800'
                    : daysUntil <= 7
                    ? 'text-orange-800'
                    : daysUntil <= 14
                    ? 'text-yellow-800'
                    : 'text-green-800'
                }`}
              >
                {daysUntil === 0
                  ? 'Your exam is today!'
                  : daysUntil === 1
                  ? 'Your exam is tomorrow!'
                  : `${daysUntil} days until your exam`}
              </div>
              <div
                className={`text-sm ${
                  daysUntil <= 3
                    ? 'text-red-600'
                    : daysUntil <= 7
                    ? 'text-orange-600'
                    : daysUntil <= 14
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {daysUntil <= 3
                  ? "We'll create an intensive rapid-review plan."
                  : daysUntil <= 7
                  ? "We'll prioritize high-impact topics."
                  : daysUntil <= 14
                  ? "Good time to focus on weak areas."
                  : "You have time for comprehensive preparation."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
