"use client";

import React, { useState } from "react";
import { useInstitution } from "@/components/providers/InstitutionContext";

export interface SchoolLogoProps {
  code?: string;
  name?: string;
  logoUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  shape?: "rounded" | "square" | "circle";
  border?: boolean;
  alt?: string;
}

export function SchoolLogo({
  code,
  name,
  logoUrl,
  size = "md",
  className = "",
  shape = "rounded",
  border = true,
  alt
}: SchoolLogoProps) {
  const { institutionsList, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const [hasError, setHasError] = useState(false);

  // 1. Resolve target institution from code or active context
  const targetInst = code
    ? institutionsList.find((i) => i.code === code)
    : selectedInstitutionObj;

  const isTrustHq = code === "ALL" || code === "TRUST" || (isAllInstitutions && !code);

  // 2. Resolve image source
  const resolvedLogo =
    logoUrl ||
    (isTrustHq ? "/trust-logo.png" : targetInst?.logoUrl || "/logo.png");

  const resolvedName =
    name ||
    (isTrustHq ? "Trust HQ" : targetInst?.name || targetInst?.shortName || "School Logo");

  // 3. Resolve size styling
  let dimensionClasses = "w-8 h-8";
  let style: React.CSSProperties | undefined = undefined;

  if (typeof size === "number") {
    style = { width: `${size}px`, height: `${size}px` };
    dimensionClasses = "";
  } else {
    switch (size) {
      case "xs":
        dimensionClasses = "w-5 h-5";
        break;
      case "sm":
        dimensionClasses = "w-6 h-6";
        break;
      case "md":
        dimensionClasses = "w-8 h-8";
        break;
      case "lg":
        dimensionClasses = "w-10 h-10";
        break;
      case "xl":
        dimensionClasses = "w-12 h-12";
        break;
      default:
        dimensionClasses = "w-8 h-8";
    }
  }

  // 4. Resolve shape styling
  const shapeClasses =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
      ? "rounded-md"
      : "rounded-xl";

  const borderClass = border ? "border border-slate-200 shadow-2xs" : "";

  // 5. Monogram fallback if image fails completely
  if (hasError) {
    const initials = (code || resolvedName || "SCH")
      .slice(0, 2)
      .toUpperCase();
    const brandColor = targetInst?.brandColor || (isTrustHq ? "#0B1B30" : "#2563eb");

    return (
      <div
        style={{ ...style, backgroundColor: brandColor }}
        className={`${dimensionClasses} ${shapeClasses} ${borderClass} ${className} flex items-center justify-center text-white font-black text-[10px] select-none shrink-0`}
        title={resolvedName}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`${dimensionClasses} ${shapeClasses} ${borderClass} ${className} bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0`}
      title={resolvedName}
    >
      <img
        src={resolvedLogo}
        alt={alt || resolvedName}
        className="w-full h-full object-contain"
        onError={(e) => {
          // If custom logo fails, attempt /logo.png before monogram
          if (e.currentTarget.src.includes("/logo.png") || isTrustHq) {
            setHasError(true);
          } else {
            e.currentTarget.src = "/logo.png";
          }
        }}
      />
    </div>
  );
}

export default SchoolLogo;
