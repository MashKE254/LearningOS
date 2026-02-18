'use client';

import { useState, useRef, useCallback } from 'react';
import { useCanvas } from '../canvas-context';
import { FileContent, UploadedFile } from '../types';
import { Upload, File, Image, FileText, X, Eye, Download } from 'lucide-react';

const acceptedTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  text: ['text/plain', 'text/csv'],
};

const maxFileSize = 10 * 1024 * 1024; // 10MB

interface FileUploaderProps {
  initialContent?: FileContent;
}

export function FileUploader({ initialContent }: FileUploaderProps) {
  const { updateContent } = useCanvas();
  const [files, setFiles] = useState<UploadedFile[]>(initialContent?.files ?? []);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const syncContent = useCallback((newFiles: UploadedFile[]) => {
    const content: FileContent = {
      type: 'file',
      files: newFiles,
    };
    updateContent(content);
  }, [updateContent]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }

    const allAccepted = [...acceptedTypes.image, ...acceptedTypes.document, ...acceptedTypes.text];
    if (!allAccepted.includes(file.type)) {
      return `File type "${file.type}" is not supported.`;
    }

    return null;
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        let thumbnail: string | undefined;

        // Generate thumbnail for images
        if (acceptedTypes.image.includes(file.type)) {
          thumbnail = url;
        }

        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          url,
          thumbnail,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList) => {
    setError(null);
    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(fileList)) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      const processed = await processFile(file);
      newFiles.push(processed);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    syncContent(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    syncContent(updatedFiles);
    if (previewFile?.id === id) {
      setPreviewFile(null);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (acceptedTypes.image.includes(type)) {
      return <Image className="w-5 h-5" />;
    }
    if (acceptedTypes.document.includes(type)) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
          isDragging
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept={[...acceptedTypes.image, ...acceptedTypes.document, ...acceptedTypes.text].join(',')}
          className="hidden"
        />
        <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-violet-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600 text-center">
          <span className="font-medium text-violet-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Images, PDFs, Word docs, or text files (max 10MB)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
              >
                {/* Thumbnail or Icon */}
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    {getFileIcon(file.type)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.thumbnail && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRemove(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && previewFile.thumbnail && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewFile.thumbnail}
              alt={previewFile.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
