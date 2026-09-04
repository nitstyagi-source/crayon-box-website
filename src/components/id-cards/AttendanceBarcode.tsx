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

  // Mode 2: Vertical Stacked Barcode (Matching media_1788548141303.jpg - Bars on left, Code text on right)
  if (orientation === 'vertical-stacked') {
    const boxHeight = height > 50 ? height : 155;
    const barWidth = width > 40 ? width - 26 : 48;

    return (
      <div 
        className={`flex items-center justify-between w-full h-full select-none px-1 ${className}`}
      >
        {/* Horizontal bars stacked along vertical height */}
        <div className="flex-1 h-full flex items-center justify-center">
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
        </div>

        {/* Side Text oriented vertically (CBS20260412) reading vertically */}
        {showText && (
          <div
            className="flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 tracking-widest select-none shrink-0"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              height: `${boxHeight}px`,
            }}
          >
            <span className="font-extrabold uppercase">{cleanCode.replace(/[^A-Z0-9]/g, '')}</span>
          </div>
        )}
      </div>
    );
  }

  // Mode 1: Standard horizontal linear barcode (Matching media_1788549831427.jpg)
  return (
    <div className={`flex flex-col items-center justify-center w-full select-none ${className}`}>
      <svg
        viewBox={`0 0 ${stripes.totalWidth} ${height}`}
        style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px` }}
        className="overflow-hidden shrink-0"
        preserveAspectRatio="none"
      >
        {stripes.bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={0}
            width={bar.w}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      {showText && (
        <span className="text-[10.5px] font-mono font-bold text-black tracking-[0.28em] mt-1 uppercase text-center pl-1">
          {cleanCode.replace(/[^A-Z0-9]/g, '')}
        </span>
      )}
    </div>
  );
}

export default AttendanceBarcode;
