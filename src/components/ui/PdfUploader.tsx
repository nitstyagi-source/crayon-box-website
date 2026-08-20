"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Trash2, ExternalLink, AlertCircle } from "lucide-react";

interface PdfUploaderProps {
  label?: string;
  helperText?: string;
  initialUrl?: string;
  onPdfUploaded: (data: { fileUrl: string; fileName: string; fileSize: number }) => void;
  onPdfRemoved?: () => void;
  maxSizeMb?: number;
}

export default function PdfUploader({
  label = "Upload PDF Document",
  helperText = "Drag and drop PDF file (Max 10MB) or click to browse",
  initialUrl = "",
  onPdfUploaded,
  onPdfRemoved,
  maxSizeMb = 10
}: PdfUploaderProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [fileName, setFileName] = useState<string>(initialUrl ? "Uploaded_Document.pdf" : "");
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setErrorMsg("");
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF (.pdf) documents are supported.");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`File size exceeds the ${maxSizeMb}MB limit.`);
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setCurrentUrl(base64Data);
      setFileName(file.name);
      setFileSize(file.size);
      setIsProcessing(false);

      onPdfUploaded({
        fileUrl: base64Data,
        fileName: file.name,
        fileSize: file.size
      });
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read the selected PDF file.");
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleRemove() {
    setCurrentUrl("");
    setFileName("");
    setFileSize(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
    if (onPdfRemoved) onPdfRemoved();
  }

  function formatSize(bytes: number) {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-2 text-xs">
      {label && <label className="font-bold text-stone-700 block">{label}</label>}

      {currentUrl ? (
        <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-stone-900 block truncate text-xs">{fileName}</span>
              <span className="text-[10px] text-stone-500 font-mono">
                {fileSize > 0 ? formatSize(fileSize) : "Attached PDF"} • Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-white hover:bg-stone-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition"
              title="Preview PDF"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-red-200 transition"
              title="Remove File"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging 
              ? "border-blue-500 bg-blue-50/60" 
              : "border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-9 h-9 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 mb-2 shadow-xs">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>

          <p className="font-bold text-stone-800 text-xs">
            {isProcessing ? "Processing PDF..." : "Click to select PDF or drag & drop"}
          </p>
          <span className="text-[10px] text-stone-400 mt-0.5">{helperText}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-bold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
