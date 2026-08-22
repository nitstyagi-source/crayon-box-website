"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

interface Msg91OtpWidgetProps {
  identifier?: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  className?: string;
}

declare global {
  interface Window {
    initSendOTP?: (config: any) => void;
  }
}

export const MSG91_WEB_CONFIG = {
  widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '3668766f6a71323234393034',
  tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '319435TL9QVRfp6n6a89bdeaP1',
};

export default function Msg91OtpWidget({
  identifier = '',
  onSuccess,
  onFailure,
  className = '',
}: Msg91OtpWidgetProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (scriptLoaded && typeof window.initSendOTP === 'function') {
      const configuration = {
        widgetId: MSG91_WEB_CONFIG.widgetId,
        tokenAuth: MSG91_WEB_CONFIG.tokenAuth,
        identifier: identifier || undefined,
        exposeMethods: true,
        success: (data: any) => {
          console.log('✅ MSG91 Web OTP Success:', data);
          if (onSuccess) onSuccess(data);
        },
        failure: (error: any) => {
          console.error('❌ MSG91 Web OTP Failure:', error);
          if (onFailure) onFailure(error);
        },
      };

      try {
        window.initSendOTP(configuration);
      } catch (e) {
        console.error('Error initializing MSG91 sendOTP on web:', e);
      }
    }
  }, [scriptLoaded, identifier, onSuccess, onFailure]);

  return (
    <div className={`msg91-otp-container ${className}`}>
      {/* Script Loader with fallback */}
      <Script
        src="https://verify.msg91.com/otp-provider.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          // Fallback to secondary endpoint
          const script = document.createElement('script');
          script.src = 'https://verify.phone91.com/otp-provider.js';
          script.async = true;
          script.onload = () => setScriptLoaded(true);
          document.head.appendChild(script);
        }}
      />
    </div>
  );
}
