import React, { useRef, useState } from "react";
import { AiOutlineCloudUpload, AiOutlineCheckCircle } from "react-icons/ai";

interface FileUploadProps {
  label: string;
  accept: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  currentFile?: string;
  helperText?: string;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  maxSize = 5,
  onFileSelect,
  currentFile,
  helperText,
  error,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-green-600 bg-green-50"
            : error
            ? "border-red-500 bg-red-50"
            : currentFile || fileName
            ? "border-green-600 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          {currentFile || fileName ? (
            <>
              <AiOutlineCheckCircle className="text-green-600" size={40} />
              <p className="text-sm text-gray-700 font-medium">
                {fileName || "File uploaded"}
              </p>
            </>
          ) : (
            <>
              <AiOutlineCloudUpload className="text-gray-400" size={40} />
              <p className="text-sm text-gray-600">
                Drag and drop or{" "}
                <span className="text-green-600 font-semibold">browse</span>
              </p>
            </>
          )}
          {helperText && (
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
