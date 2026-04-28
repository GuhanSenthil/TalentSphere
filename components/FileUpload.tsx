import React, { useState, useCallback } from 'react';
import { ArrowUpOnSquareIcon } from './IconComponents';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
      e.target.value = ''; // Reset file input
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  }

  return (
    <div>
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
            isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-900/25'
            }`}
        >
            <div className="text-center">
                <ArrowUpOnSquareIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PDF, DOC, DOCX, TXT up to 10MB</p>
            </div>
        </div>
        {selectedFile && (
            <div className="mt-2 flex items-center justify-between bg-slate-100 p-2 rounded-md text-sm">
                <span className="text-slate-700 font-medium truncate">{selectedFile.name}</span>
                <button onClick={removeFile} type="button" className="text-red-500 hover:text-red-700 font-semibold ml-2">
                    Remove
                </button>
            </div>
        )}
    </div>
  );
};

export default FileUpload;