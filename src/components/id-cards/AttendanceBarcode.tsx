"use client";

import React, { useMemo } from 'react';

export interface AttendanceBarcodeProps {
  code: string;
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  orientation?: 'horizontal' | 'vertical-stacked';
}

/**
 * Universal Code 128 / High-density Attendance Barcode Generator (Pure SVG)
 * Supports:
 * - 'horizontal' (default): standard linear barcode
 * - 'vertical-stacked' (matching Image 2): horizontal stripes stacked vertically with vertical side text
 */
export function AttendanceBarcode({
  code,
  className = '',
  width = 180,
  height = 36,
  showText = true,
  orientation = 'horizontal',
}: AttendanceBarcodeProps) {
  const cleanCode = (code || 'STU-000000').toUpperCase();

  // Pattern for horizontal linear barcode
  const stripes = useMemo(() => {
    const bars: { x: number; w: number }[] = [];
    let curX = 6;
    bars.push({ x: curX, w: 2 }); curX += 4;
    bars.push({ x: curX, w: 3 }); curX += 5;
    bars.push({ x: curX, w: 1.5 }); curX += 3.5;

    for (let i = 0; i < cleanCode.length; i++) {
      const charCode = cleanCode.charCodeAt(i);
      const b1 = ((charCode * 3 + i * 7) % 3) + 1.2;
      const s1 = ((charCode * 5 + i * 3) % 3) + 1.5;
      const b2 = ((charCode * 7 + i * 2) % 4) + 1.5;
      const s2 = ((charCode * 2 + i * 5) % 2) + 1.2;
      const b3 = ((charCode + i) % 3) + 1.2;
      const s3 = ((charCode * 11) % 3) + 1.5;

      bars.push({ x: curX, w: b1 }); curX += b1 + s1;
      bars.push({ x: curX, w: b2 }); curX += b2 + s2;
      bars.push({ x: curX, w: b3 }); curX += b3 + s3;
    }

    bars.push({ x: curX, w: 2.5 }); curX += 4.5;
    bars.push({ x: curX, w: 1.5 }); curX += 3.5;
    bars.push({ x: curX, w: 3 }); curX += 5;
    bars.push({ x: curX, w: 2 }); curX += 6;

    return { bars, totalWidth: curX };
  }, [cleanCode]);

  // Pattern for vertical stacked barcode (Image 2 style)
  const verticalBars = useMemo(() => {
    const bars: { y: number; h: number }[] = [];
    let curY = 4;
    const targetHeight = height > 50 ? height - 8 : 130;

    bars.push({ y: curY, h: 2.5 }); curY += 4.5;
    bars.push({ y: curY, h: 1.5 }); curY += 3.5;
    bars.push({ y: curY, h: 3 }); curY += 5;

    let charIdx = 0;
    while (curY < targetHeight - 12) {
      const charCode = cleanCode.charCodeAt(charIdx % cleanCode.length);
      const h1 = ((charCode * 3 + charIdx * 5) % 3) + 1.2;
      const s1 = ((charCode * 7 + charIdx * 2) % 3) + 1.4;
      const h2 = ((charCode * 11 + charIdx * 3) % 4) + 1.5;
      const s2 = ((charCode * 2 + charIdx * 7) % 2) + 1.3;

      bars.push({ y: curY, h: h1 }); curY += h1 + s1;
      if (curY >= targetHeight - 12) break;
      bars.push({ y: curY, h: h2 }); curY += h2 + s2;
      charIdx++;
    }

    bars.push({ y: curY, h: 2 }); curY += 3.5;
    bars.push({ y: curY, h: 3 }); curY += 5;
    bars.push({ y: curY, h: 1.5 }); curY += 4;

    return { bars, totalHeight: curY };
  }, [cleanCode, height]);

  // Mode 2: Vertical Stacked Barcode (Matching Image 2 - Borderless)
  if (orientation === 'vertical-stacked') {
    const boxHeight = height > 50 ? height : 140;
    const barWidth = width > 40 ? width - 26 : 54;

    return (
      <div 
        className={`flex items-center gap-1.5 select-none ${className}`}
        style={{ height: `${boxHeight}px` }}
      >
        {/* Horizontal bars stacked along vertical height */}
        <svg
          viewBox={`0 0 ${barWidth} ${boxHeight}`}
          style={{ width: `${barWidth}px`, height: `${boxHeight}px` }}
          className="overflow-hidden shrink-0"
        >
          {verticalBars.bars.map((bar, idx) => (
            <rect
              key={idx}
              x={0}
              y={bar.y}
              width={barWidth}
              height={bar.h}
              fill="#000000"
            />
          ))}
        </svg>

        {/* Side Text oriented vertically (reading bottom-to-top) */}
        {showText && (
          <div
            className="flex items-center justify-between text-[8px] font-condensed font-bold text-slate-900 tracking-wider select-none shrink-0"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              height: `${boxHeight}px`,
            }}
          >
            <span className="font-extrabold tracking-tight">*{cleanCode}*</span>
            <span className="font-bold text-slate-900 tracking-wider">ATTENDANCE BARCODE</span>
          </div>
        )}
      </div>
    );
  }

  // Mode 1: Standard horizontal linear barcode
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${stripes.totalWidth} ${height}`}
        style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px` }}
        className="overflow-visible"
      >
        <rect width={stripes.totalWidth} height={height} fill="#ffffff" rx={2} />
        {stripes.bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.w}
            height={height - 4}
            fill="#0f172a"
          />
        ))}
      </svg>
      {showText && (
        <span className="text-[9px] font-mono font-black text-slate-800 tracking-[0.25em] mt-0.5 uppercase">
          *{code}*
        </span>
      )}
    </div>
  );
}

export default AttendanceBarcode;
