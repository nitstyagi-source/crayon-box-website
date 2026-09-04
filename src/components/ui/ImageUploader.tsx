"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, CheckCircle2, Trash2, Link as LinkIcon, ZoomIn, Crop } from "lucide-react";
import { ImageCropperModal } from "@/components/ui/ImageCropperModal";

interface ImageUploaderProps {
  label?: string;
  helperText?: string;
  initialUrl?: string;
  initialSize?: "small" | "medium" | "large" | "full";
  initialAlignment?: "left" | "center" | "right";
  onImageChanged: (data: {
    imageUrl: string;
    imageSize: "small" | "medium" | "large" | "full";
    imageAlignment: "left" | "center" | "right";
  }) => void;
  onImageRemoved?: () => void;
  maxSizeMb?: number;
}

export default function ImageUploader({
  label = "Insert Question Image / Diagram",
  helperText = "Drag & drop image (PNG, JPG, SVG) or paste URL",
  initialUrl = "",
  initialSize = "medium",
  initialAlignment = "center",
  onImageChanged,
  onImageRemoved,
  maxSizeMb = 5
}: ImageUploaderProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [size, setSize] = useState<"small" | "medium" | "large" | "full">(initialSize);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(initialAlignment);
  const [isUrlTab, setIsUrlTab] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperSource, setCropperSource] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setErrorMsg("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`Image exceeds max size of ${maxSizeMb}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setCropperSource(base64);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  }

  function handleUrlSubmit() {
    if (!urlInput.trim()) return;
    setCurrentUrl(urlInput.trim());
    onImageChanged({
      imageUrl: urlInput.trim(),
      imageSize: size,
      imageAlignment: alignment
    });
    setUrlInput("");
    setIsUrlTab(false);
  }

  function handleSizeChange(newSize: "small" | "medium" | "large" | "full") {
    setSize(newSize);
    if (currentUrl) {
      onImageChanged({
        imageUrl: currentUrl,
        imageSize: newSize,
        imageAlignment: alignment
      });
    }
  }

  function handleAlignmentChange(newAlign: "left" | "center" | "right") {
    setAlignment(newAlign);
    if (currentUrl) {
      onImageChanged({
        imageUrl: currentUrl,
        imageSize: size,
        imageAlignment: newAlign
      });
    }
  }

  function handleRemove() {
    setCurrentUrl("");
    if (onImageRemoved) onImageRemoved();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-2 text-xs font-sans">
      <div className="flex justify-between items-center">
        <label className="font-bold text-stone-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
          {label}
        </label>
        
        {!currentUrl && (
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setIsUrlTab(false)}
              className={`font-bold px-2 py-0.5 rounded ${!isUrlTab ? "bg-purple-100 text-purple-900" : "text-stone-500"}`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setIsUrlTab(true)}
              className={`font-bold px-2 py-0.5 rounded ${isUrlTab ? "bg-purple-100 text-purple-900" : "text-stone-500"}`}
            >
              Image URL
            </button>
          </div>
        )}
      </div>

      {!currentUrl ? (
        isUrlTab ? (
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/geometry-diagram.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              Insert
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
              isDragging 
                ? "border-purple-500 bg-purple-50/50" 
                : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/60 hover:border-purple-300"
            }`}
          >
            <Upload className="w-5 h-5 text-stone-400" />
            <span className="text-[11px] font-bold text-stone-700">{helperText}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
          </div>
        )
      ) : (
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Image Attached
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCropperSource(currentUrl);
                  setIsCropperOpen(true);
                }}
                className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                title="Select which part of the diagram is visible"
              >
                <Crop className="w-3.5 h-3.5 text-amber-600" /> Adjust Framing / Crop
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Image
              </button>
            </div>
          </div>

          {/* Sizing & Alignment Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-200 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-500">Size:</span>
              <div className="flex bg-white rounded-lg p-0.5 border border-stone-200">
                {(["small", "medium", "large", "full"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSizeChange(s)}
                    className={`px-2 py-0.5 rounded font-bold capitalize ${
                      size === s ? "bg-purple-600 text-white" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {s === "small" ? "S (120px)" : s === "medium" ? "M (220px)" : s === "large" ? "L (360px)" : "Full"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-500">Align:</span>
              <div className="flex bg-white rounded-lg p-0.5 border border-stone-200">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAlignmentChange(a)}
                    className={`px-2 py-0.5 rounded font-bold capitalize ${
                      alignment === a ? "bg-purple-600 text-white" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail preview */}
          <div className={`pt-2 flex ${alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"}`}>
            <img
              src={currentUrl}
              alt="Question preview"
              className={`rounded-xl border border-stone-300 object-contain bg-white ${
                size === "small" ? "max-w-[120px] max-h-[100px]" :
                size === "medium" ? "max-w-[220px] max-h-[160px]" :
                size === "large" ? "max-w-[360px] max-h-[240px]" :
                "w-full max-h-[300px]"
              }`}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-red-500 text-[11px] font-bold">{errorMsg}</p>
      )}

      {/* Interactive Crop & Visible Area Framing Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageUrl={cropperSource}
        cropType="general"
        defaultAspect="free"
        title="Select Visible Diagram Area"
        allowUniversalBackground={false}
        onCropComplete={(croppedUrl) => {
          setCurrentUrl(croppedUrl);
          onImageChanged({
            imageUrl: croppedUrl,
            imageSize: size,
            imageAlignment: alignment
          });
          setIsCropperOpen(false);
        }}
      />
    </div>
  );
}
