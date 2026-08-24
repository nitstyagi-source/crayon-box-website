"use client";

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon } from 'lucide-react';

export interface StudentQRCodeProps {
  payload: string;
  size?: number;
  className?: string;
}

export function StudentQRCode({ payload, size = 120, className = '' }: StudentQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!payload) return;
    QRCode.toDataURL(payload, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('QR Code generation error:', err));
  }, [payload, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 ${className}`}
      >
        <QrIcon className="w-6 h-6 text-slate-400 animate-pulse" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Unique Student Gate Attendance QR"
      style={{ width: size, height: size }}
      className={`rounded-lg bg-white p-1 border border-slate-200 shadow-2xs ${className}`}
    />
  );
}
