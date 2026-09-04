"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  RotateCcw as ResetIcon,
  Check,
  Sparkles,
  Crop,
  Square,
  Circle,
  FileImage,
  Layers,
  Palette
} from "lucide-react";
import { standardizePhotoBackground, StandardizePhotoOptions } from "@/lib/utils/photo-standardizer";

export type CropAspectPreset = "1:1" | "circle" | "3:4" | "16:9" | "free";
export type CropType = "logo" | "avatar" | "photo" | "banner" | "general";

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  title?: string;
  cropType?: CropType;
  defaultAspect?: CropAspectPreset;
  allowUniversalBackground?: boolean;
}

export function ImageCropperModal({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  title = "Adjust Visible Area & Framing",
  cropType = "general",
  defaultAspect,
  allowUniversalBackground = true
}: ImageCropperModalProps) {
  // Determine initial aspect based on cropType if not provided
  const initialPreset: CropAspectPreset = defaultAspect || (
    cropType === "logo" ? "1:1" :
    cropType === "avatar" ? "circle" :
    cropType === "photo" ? "3:4" :
    cropType === "banner" ? "16:9" : "1:1"
  );

  const [aspect, setAspect] = useState<CropAspectPreset>(initialPreset);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Universal studio background options for profile photos
  const isProfilePhoto = cropType === "avatar" || cropType === "photo";
  const [backgroundType, setBackgroundType] = useState<StandardizePhotoOptions["backgroundType"] | "original">(
    isProfilePhoto ? "studio-gradient-light" : "original"
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Load image when imageUrl changes
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageElement(img);
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      // Reset transforms
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setPan({ x: 0, y: 0 });
      setAspect(defaultAspect || initialPreset);
      setBackgroundType(isProfilePhoto ? "studio-gradient-light" : "original");
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl, defaultAspect, initialPreset, isProfilePhoto]);

  // Pointer interaction for smooth dragging/panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.5), 4));
  };

  // Reset framing
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
  };

  // Get frame aperture dimensions inside the 340x340 viewport
  const getApertureDimensions = useCallback(() => {
    const boxSize = 300;
    if (aspect === "1:1" || aspect === "circle") {
      return { width: boxSize, height: boxSize, radius: aspect === "circle" ? "9999px" : "16px" };
    }
    if (aspect === "3:4") {
      return { width: Math.round(boxSize * 0.75), height: boxSize, radius: "12px" };
    }
    if (aspect === "16:9") {
      return { width: boxSize, height: Math.round(boxSize * (9 / 16)), radius: "12px" };
    }
    // free
    return { width: boxSize, height: Math.round(boxSize * 0.8), radius: "12px" };
  }, [aspect]);

  // Generate cropped output canvas
  const generateCroppedImage = useCallback(async (): Promise<string> => {
    if (!imageElement || !containerRef.current) return imageUrl;

    const aperture = getApertureDimensions();
    const targetWidth = aspect === "3:4" ? 600 : aspect === "16:9" ? 960 : 600;
    const targetHeight = aspect === "3:4" ? 800 : aspect === "16:9" ? 540 : 600;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageUrl;

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Center canvas origin
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply rotation & flip
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);

    // Scale calculation: how viewport aperture maps to target resolution
    const viewportScale = targetWidth / aperture.width;
    const effectiveZoom = zoom * viewportScale;

    // Calculate base fitted size of image in viewport
    const imgAspect = imageNaturalSize.width / (imageNaturalSize.height || 1);
    let baseRenderW: number;
    let baseRenderH: number;

    if (imgAspect >= 1) {
      baseRenderH = 340;
      baseRenderW = 340 * imgAspect;
    } else {
      baseRenderW = 340;
      baseRenderH = 340 / imgAspect;
    }

    const drawW = baseRenderW * effectiveZoom;
    const drawH = baseRenderH * effectiveZoom;
    const drawX = (pan.x * viewportScale) - (drawW / 2);
    const drawY = (pan.y * viewportScale) - (drawH / 2);

    ctx.drawImage(imageElement, drawX, drawY, drawW, drawH);

    // If circular mask, crop circle
    if (aspect === "circle") {
      const circleCanvas = document.createElement("canvas");
      circleCanvas.width = targetWidth;
      circleCanvas.height = targetHeight;
      const cCtx = circleCanvas.getContext("2d");
      if (cCtx) {
        cCtx.beginPath();
        cCtx.arc(targetWidth / 2, targetHeight / 2, targetWidth / 2, 0, Math.PI * 2);
        cCtx.closePath();
        cCtx.clip();
        cCtx.drawImage(canvas, 0, 0);
        return circleCanvas.toDataURL("image/png");
      }
    }

    // Output format: PNG for logos with transparency, JPEG for photos
    const format = cropType === "logo" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(format, 0.95);
  }, [imageElement, getApertureDimensions, aspect, cropType, flipH, imageNaturalSize, pan, rotation, zoom, imageUrl]);

  // Handle Apply
  const handleApply = async () => {
    setIsProcessing(true);
    try {
      let croppedDataUrl = await generateCroppedImage();

      // If user selected a Universal Institutional Studio Background for a profile photo
      if (isProfilePhoto && backgroundType !== "original" && allowUniversalBackground) {
        croppedDataUrl = await standardizePhotoBackground(croppedDataUrl, {
          backgroundType: backgroundType as any,
          targetWidth: aspect === "3:4" ? 480 : 600,
          targetHeight: aspect === "3:4" ? 640 : 600
        });
      }

      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error("Error cropping image:", err);
      // Fallback
      if (imageElement) {
        onCropComplete(imageUrl);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const aperture = getApertureDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Drag to pan • Wheel to zoom • Select exact visible portion of your {cropType === "logo" ? "school logo" : "profile photo"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Canvas & Right Controls */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto items-center">
          
          {/* Left Column: Interactive Framing Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center select-none">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] rounded-2xl bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing border-2 border-slate-300 shadow-inner flex items-center justify-center touch-none"
            >
              {/* Image Transform Layer */}
              {imageElement && (
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.08s ease-out"
                  }}
                  className="pointer-events-none relative flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Framing Target"
                    className="max-w-none w-[320px] h-auto object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Darkened Mask Overlay outside aperture */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  style={{
                    width: `${aperture.width}px`,
                    height: `${aperture.height}px`,
                    borderRadius: aperture.radius,
                    boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.65)",
                    border: "2px solid rgba(245, 158, 11, 0.9)"
                  }}
                  className="relative z-10"
                >
                  {/* Rule-of-Thirds Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-b border-white/50" />
                    <div className="border-r border-white/50" />
                    <div className="border-r border-white/50" />
                    <div />
                  </div>

                  {/* Corner Target Markers */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
                </div>
              </div>

              {/* Pan / Drag Helper Badge */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white pointer-events-none border border-white/20">
                Drag to frame • Scroll to zoom
              </div>
            </div>

            {/* Quick Canvas Transform Bar */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 font-mono w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 0.15, 4))}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90) % 360)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setFlipH((f) => !f)}
                className={`p-2 rounded-xl border transition ${
                  flipH ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Flip Horizontally"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Reset Framing"
              >
                <ResetIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Aspect Ratio, Studio Background & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50/70 p-5 rounded-3xl border border-slate-200 text-xs">
            
            {/* 1. Frame Shape & Aspect Ratio */}
            <div className="space-y-2">
              <label className="font-black text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-amber-600" />
                Select Framing Aperture
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspect("1:1")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    aspect === "1:1"
                      ? "bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs"
                      : "bg-white text-slate-700 font-bold border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Square className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight">1:1 Square</span>
                    <span className="text-[9px] opacity-75">Logo / Crest</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspect("circle")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    aspect === "circle"
                      ? "bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs"
                      : "bg-white text-slate-700 font-bold border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Circle className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight">Round</span>
                    <span className="text-[9px] opacity-75">Avatar / Badge</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspect("3:4")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    aspect === "3:4"
                      ? "bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs"
                      : "bg-white text-slate-700 font-bold border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <FileImage className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight">3:4 Portrait</span>
                    <span className="text-[9px] opacity-75">ID / Passport</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspect("16:9")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    aspect === "16:9"
                      ? "bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs"
                      : "bg-white text-slate-700 font-bold border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight">16:9 Banner</span>
                    <span className="text-[9px] opacity-75">Header</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspect("free")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    aspect === "free"
                      ? "bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs"
                      : "bg-white text-slate-700 font-bold border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Crop className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[11px] leading-tight">Custom</span>
                    <span className="text-[9px] opacity-75">Free Box</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Universal Institutional Studio Background (for Profile Photos / Avatars) */}
            {allowUniversalBackground && isProfilePhoto && (
              <div className="space-y-2 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-black text-indigo-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Universal Institutional Backdrop
                  </label>
                  <span className="text-[9px] bg-indigo-200/80 text-indigo-950 px-2 py-0.5 rounded-full font-bold">
                    Standardized ID Norm
                  </span>
                </div>
                <p className="text-[10px] text-indigo-800 leading-tight">
                  Automatically harmonizes background lighting so all student &amp; staff cards look 100% uniform.
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setBackgroundType("studio-gradient-light")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-left transition flex items-center gap-2 ${
                      backgroundType === "studio-gradient-light"
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-slate-200 to-white border border-slate-300 shrink-0" />
                    <span>Studio Neutral</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackgroundType("formal-blue")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-left transition flex items-center gap-2 ${
                      backgroundType === "formal-blue"
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-700 to-blue-400 border border-blue-500 shrink-0" />
                    <span>Formal Blue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackgroundType("pure-white")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-left transition flex items-center gap-2 ${
                      backgroundType === "pure-white"
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shrink-0" />
                    <span>Pure White</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackgroundType("original")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-left transition flex items-center gap-2 ${
                      backgroundType === "original"
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Keep Original</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Context Preview Hint */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                How it will appear in system
              </span>
              
              <div className="flex items-center gap-4">
                {/* Round Avatar Preview */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-500 overflow-hidden mx-auto bg-slate-100 shadow-xs flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt=""
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                        transformOrigin: "center center"
                      }}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 block">Avatar</span>
                </div>

                {/* Square Badge Preview */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-300 overflow-hidden mx-auto bg-slate-100 shadow-xs flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt=""
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                        transformOrigin: "center center"
                      }}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 block">Crest / Card</span>
                </div>

                <div className="flex-1 text-[11px] text-slate-600 leading-tight">
                  <p className="font-semibold text-slate-800">High-Resolution Export</p>
                  <p className="text-[10px] text-slate-500">
                    Auto-crops cleanly at 600×600 DPI. Transparency preserved for PNG logos.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onCropComplete(imageUrl);
              onClose();
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
          >
            Keep Original Without Cropping
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Visible Area...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Visible Area</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
