"use client";

import React from "react";

export type WritingGuideType = "none" | "english_4lines" | "hindi_2lines" | "math_grid" | "math_column";

interface WritingGuideRendererProps {
  type?: WritingGuideType;
  rows?: number;
  mathOp?: "+" | "-" | "×" | "÷";
  num1?: string;
  num2?: string;
}

export default function WritingGuideRenderer({
  type = "none",
  rows = 2,
  mathOp = "+",
  num1 = "458",
  num2 = "273"
}: WritingGuideRendererProps) {
  if (!type || type === "none") return null;

  const rowCount = Math.max(1, Math.min(6, rows || 2));

  // 1. ENGLISH 4-LINES (Red - Sky - Sky - Red)
  if (type === "english_4lines") {
    return (
      <div className="space-y-3 pt-2 my-2 select-none print:my-1.5">
        {Array.from({ length: rowCount }).map((_, idx) => (
          <div 
            key={idx} 
            className="w-full bg-white border-y border-red-500 relative flex flex-col justify-between"
            style={{ height: "36px" }}
          >
            {/* Top Red Line */}
            <div className="w-full border-t border-red-500" />
            
            {/* Middle Sky Blue Line 1 */}
            <div className="w-full border-t border-sky-400 border-dashed opacity-80" />
            
            {/* Middle Sky Blue Line 2 */}
            <div className="w-full border-t border-sky-400 border-dashed opacity-80" />
            
            {/* Bottom Red Line */}
            <div className="w-full border-b border-red-500" />
          </div>
        ))}
      </div>
    );
  }

  // 2. HINDI 2-LINES / HEADLINE GUIDE (Hindi Ruled Lines)
  if (type === "hindi_2lines") {
    return (
      <div className="space-y-4 pt-2 my-2 select-none print:my-2">
        {Array.from({ length: rowCount }).map((_, idx) => (
          <div 
            key={idx}
            className="w-full bg-slate-50/40 border-y-2 border-slate-700 relative flex flex-col justify-between"
            style={{ height: "34px" }}
          >
            {/* Top Shirorekha Bar */}
            <div className="w-full border-t-2 border-slate-800" />
            
            {/* Light Mid Guide */}
            <div className="w-full border-t border-slate-300 border-dashed" />
            
            {/* Bottom Base Line */}
            <div className="w-full border-b-2 border-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  // 3. MATH SQUARE GRID (Mathematics Box Notebook)
  if (type === "math_grid") {
    const gridCols = 10;
    return (
      <div className="pt-2 my-2 select-none overflow-x-auto print:my-1.5">
        <div className="inline-block border border-slate-400 bg-white">
          {Array.from({ length: rowCount + 1 }).map((_, rIdx) => (
            <div key={rIdx} className="flex">
              {Array.from({ length: gridCols }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  className="w-8 h-8 sm:w-9 sm:h-9 border-r border-b border-slate-300 flex items-center justify-center text-xs font-mono font-bold text-slate-400"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. MATH ARITHMETIC COLUMN (Place Value Grid)
  if (type === "math_column") {
    const digits1 = (num1 || "458").split("");
    const digits2 = (num2 || "273").split("");
    const maxLen = Math.max(digits1.length, digits2.length, 3);
    
    // Pad left
    const pad1 = Array(maxLen - digits1.length).fill("").concat(digits1);
    const pad2 = Array(maxLen - digits2.length).fill("").concat(digits2);

    const placeHeaders = ["Th", "H", "T", "O"].slice(4 - maxLen);

    return (
      <div className="pt-2 my-2 select-none inline-block print:my-2">
        <div className="border-2 border-stone-800 rounded-xl p-3 bg-white font-mono text-base font-black text-stone-900 shadow-xs">
          
          {/* Place Values Header */}
          <div className="grid grid-flow-col auto-cols-[36px] gap-1 text-center text-xs font-sans font-black text-purple-700 pb-1 border-b border-stone-200">
            <span className="text-stone-300"></span>
            {placeHeaders.map((h, i) => (
              <span key={i}>{h}</span>
            ))}
          </div>

          {/* Carry-over Circles */}
          <div className="grid grid-flow-col auto-cols-[36px] gap-1 text-center py-1">
            <span></span>
            {pad1.map((_, i) => (
              <span key={i} className="w-6 h-6 mx-auto rounded-full border border-dashed border-stone-300 text-[10px] text-stone-400 flex items-center justify-center font-normal">
                
              </span>
            ))}
          </div>

          {/* Operand 1 */}
          <div className="grid grid-flow-col auto-cols-[36px] gap-1 text-center text-lg sm:text-xl py-0.5">
            <span></span>
            {pad1.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Operand 2 & Sign */}
          <div className="grid grid-flow-col auto-cols-[36px] gap-1 text-center text-lg sm:text-xl py-0.5 border-b-2 border-stone-900">
            <span className="text-stone-900 font-black">{mathOp}</span>
            {pad2.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Answer Row */}
          <div className="grid grid-flow-col auto-cols-[36px] gap-1 text-center py-2">
            <span></span>
            {pad1.map((_, i) => (
              <span key={i} className="h-8 border border-stone-300 bg-stone-50 rounded text-center" />
            ))}
          </div>

        </div>
      </div>
    );
  }

  return null;
}
