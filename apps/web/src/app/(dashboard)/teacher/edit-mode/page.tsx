'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Teacher Edit Mode Page (inspired by Sana Labs)
 *
 * Upload materials → AI generates curriculum-aligned courses.
 * Review, edit, approve → Students get adaptive pathways.
 */

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: number;
  examBoard?: string;
  status: string;
  modules: { id: string; title: string; type: string; estimatedDuration: number }[];
  createdAt: string;
}

interface Upload {
  id: string;
  fileName: string;
  status: string;
  processingProgress: number;
  suggestedSubject?: string;
  materialCount: number;
}

export default function TeacherEditModePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [coursesRes, uploadsRes] = await Promise.all([
        fetch('/api/edit-mode?teacherId=teacher_1'),
        fetch('/api/edit-mode?materials=true&teacherId=teacher_1'),
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }
      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        setUploads(data.materials || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!uploadFileName.trim()) return;
    setIsUploading(true);
    try {
      // Upload material
      const uploadRes = await fetch('/api/edit-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          fileName: uploadFileName,
          fileType: 'application/pdf',
          fileSize: uploadContent.length * 2,
          uploadedBy: 'teacher_1',
          content: uploadContent,
        }),
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();

        // Generate course from upload
        await fetch('/api/edit-mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            materialId: data.material.id,
            title: `Course from ${uploadFileName}`,
            subject: 'General',
            gradeLevel: 8,
            createdBy: 'teacher_1',
          }),
        });

        setUploadFileName('');
        setUploadContent('');
        setShowUploadForm(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setIsUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{selectedCourse.title}</h1>
              <p className="text-slate-400 text-sm mt-1">{selectedCourse.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              selectedCourse.status === 'published' ? 'bg-green-500/20 text-green-400' :
              selectedCourse.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {selectedCourse.status}
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>{selectedCourse.subject}</span>
            <span>Grade {selectedCourse.gradeLevel}</span>
            {selectedCourse.examBoard && <span>{selectedCourse.examBoard}</span>}
            <span>{selectedCourse.modules.length} modules</span>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Course Modules</h2>
          {selectedCourse.modules.map((mod, idx) => (
            <div key={mod.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{mod.title}</h3>
                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                  <span className={`px-2 py-0.5 rounded ${
                    mod.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' :
                    mod.type === 'practice' ? 'bg-green-500/20 text-green-400' :
                    mod.type === 'assessment' ? 'bg-red-500/20 text-red-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>{mod.type}</span>
                  <span>{mod.estimatedDuration} min</span>
                </div>
              </div>
              <button className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Mode</h1>
          <p className="text-slate-400">Upload materials and generate curriculum-aligned courses.</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Material
        </button>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Upload Learning Material</h2>
          <p className="text-sm text-slate-400">Upload a document and AI will generate a full course from it.</p>

          <div>
            <label className="block text-sm text-slate-400 mb-1">File Name</label>
            <input
              type="text"
              value={uploadFileName}
              onChange={e => setUploadFileName(e.target.value)}
              placeholder="e.g., Chapter_5_Chemical_Bonding.pdf"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Content (paste text or key points)</label>
            <textarea
              value={uploadContent}
              onChange={e => setUploadContent(e.target.value)}
              placeholder="Paste the content of your material here..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              rows={6}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading || !uploadFileName.trim()}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {isUploading ? 'Generating Course...' : 'Upload & Generate Course'}
            </button>
            <button
              onClick={() => setShowUploadForm(false)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Courses */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Generated Courses</h2>
        {courses.length === 0 && !showUploadForm && (
          <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-xl">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 mb-2">No courses yet</p>
            <p className="text-slate-500 text-sm">Upload a material to generate your first course.</p>
          </div>
        )}
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className="w-full text-left bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                  <span>{course.subject}</span>
                  <span>Grade {course.gradeLevel}</span>
                  <span>{course.modules.length} modules</span>
                  <span>{course.modules.reduce((sum, m) => sum + m.estimatedDuration, 0)} min total</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                course.status === 'published' ? 'bg-green-500/20 text-green-400' :
                course.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {course.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Uploads */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Uploaded Materials</h2>
          {uploads.map(upload => (
            <div key={upload.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{upload.fileName}</p>
                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                  <span className={upload.status === 'processed' ? 'text-green-400' : 'text-amber-400'}>
                    {upload.status}
                  </span>
                  {upload.suggestedSubject && <span>Subject: {upload.suggestedSubject}</span>}
                  <span>{upload.materialCount} materials generated</span>
                </div>
              </div>
              {upload.status === 'processed' && (
                <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
