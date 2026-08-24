"use client";

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export interface DualFileUploadProps {
  label?: string;
  helperText?: string;
  value?: string; // Current URL or Base64 string
  onChange: (value: string) => void;
  accept?: string; // e.g. "image/*" or ".pdf,image/*"
  placeholder?: string;
  allowDocument?: boolean;
  required?: boolean;
}

export function DualFileUpload({
  label = "Upload File / Photo or Provide Link",
  helperText,
  value = "",
  onChange,
  accept = "image/*,.pdf",
  placeholder = "https://example.com/image.png or /logo.png",
  allowDocument = true,
  required = false
}: DualFileUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(
    value && value.startsWith('http') ? 'url' : 'upload'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = value && (
    value.startsWith('data:image') ||
    value.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) ||
    value.startsWith('/') ||
    value.includes('photo') ||
    value.includes('logo') ||
    value.includes('avatar')
  );

  const isPdf = value && (
    value.startsWith('data:application/pdf') ||
    value.match(/\.pdf($|\?)/i) ||
    value.includes('pdf')
  );

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 text-xs font-sans">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        
        {/* Toggle Pills */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
              activeTab === 'url'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>File / Photo Link</span>
          </button>
        </div>
      </div>

      {/* Mode A: Upload File / Drag and Drop */}
      {activeTab === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            accept={accept}
            className="hidden"
          />

          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Click to browse or drag & drop file
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Supports PNG, JPG, WEBP, PDF (Max 10MB)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                {isImage ? (
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate">
                  <span className="font-bold text-slate-900 text-xs block truncate">
                    {fileName || "Uploaded File"}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for submission
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-bold"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Direct URL / Link Input */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required={required}
            />
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* URL Live Image Preview Box */}
          {value && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              {isImage ? (
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="URL Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="truncate">
                <span className="text-[11px] font-bold text-slate-800 block truncate">
                  External Resource Linked
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate block">
                  {value}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
