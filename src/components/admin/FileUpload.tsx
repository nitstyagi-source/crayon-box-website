"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, Loader2, Camera, FileText, ExternalLink, Image as ImageIcon } from "lucide-react";
import { uploadFileToStorage } from "@/app/actions/students";

interface FileUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  mode?: "avatar" | "document" | "banner";
  placeholder?: string;
}

export default function FileUpload({
  label,
  value,
  onChange,
  folder = "student_photos",
  accept = "image/*",
  mode = "avatar",
  placeholder = "Upload photo or file"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState(value || "");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File) {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await uploadFileToStorage(formData);
      if (res.success && res.url) {
        onChange(res.url);
        setUrlValue(res.url);
      } else {
        alert("Upload failed: " + (res.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setIsUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  const isPdf = value?.endsWith(".pdf") || value?.includes(".pdf");

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-stone-600 block">{label}</label>}

      {mode === "avatar" ? (
        <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
          {/* Avatar Thumbnail */}
          <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-stone-300 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            ) : value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-stone-400" />
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-1.5">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept={accept} 
              onChange={onFileChange} 
              className="hidden" 
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "Uploading..." : value ? "Change Photo" : "Upload File"}
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setUrlValue(""); }}
                  className="text-red-500 hover:bg-red-50 text-xs font-bold px-2 py-1.5 rounded-xl transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-stone-500 hover:text-stone-800 text-[11px] font-bold px-2 py-1.5"
              >
                {showUrlInput ? "Hide URL" : "Paste URL"}
              </button>
            </div>

            {showUrlInput && (
              <input
                type="url"
                placeholder="https://... (or image URL)"
                value={urlValue}
                onChange={e => { setUrlValue(e.target.value); onChange(e.target.value); }}
                className="w-full border border-stone-200 p-1.5 rounded-xl text-xs bg-white"
              />
            )}
          </div>
        </div>
      ) : (
        /* Document / Banner Upload Mode */
        <div 
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center ${
            dragOver ? "border-blue-500 bg-blue-50/50" : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            accept={accept} 
            onChange={onFileChange} 
            className="hidden" 
          />

          {isUploading ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs font-bold text-stone-600">Uploading file to secure cloud...</p>
            </div>
          ) : value ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                {isPdf ? (
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                ) : (
                  <img src={value} alt="Preview" className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                )}
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold text-stone-900 truncate">{value.split("/").pop()}</p>
                  <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Uploaded successfully
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a href={value} target="_blank" rel="noreferrer" className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-blue-600 hover:underline px-2">
                  Replace
                </button>
                <button type="button" onClick={() => { onChange(""); setUrlValue(""); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-700">{placeholder}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Drag & drop here or click to browse device</p>
              
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Choose File
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-stone-500 hover:text-stone-800 text-xs font-bold px-2 py-2"
                >
                  {showUrlInput ? "Hide Link" : "Or Paste URL"}
                </button>
              </div>

              {showUrlInput && (
                <div className="mt-3 w-full max-w-sm">
                  <input
                    type="url"
                    placeholder="https://... (or image / document link)"
                    value={urlValue}
                    onChange={e => { setUrlValue(e.target.value); onChange(e.target.value); }}
                    className="w-full border border-stone-200 p-2 rounded-xl text-xs bg-white"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
