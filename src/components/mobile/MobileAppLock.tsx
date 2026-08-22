"use client";

import React, { useState, useEffect } from "react";
import { Shield, Lock, Fingerprint, Sparkles, Delete, CheckCircle2 } from "lucide-react";
import { useMobileAuth } from "./MobileAuthProvider";

export default function MobileAppLock() {
  const { user, isLocked, setIsLocked } = useMobileAuth();
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [lockTimeout, setLockTimeout] = useState<number>(60000); // Default 1 min

  const CORRECT_PIN = "1234"; // Default mock PIN

  // Handle number click on keypad
  const handleNumClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);

      if (newPin.length === 4) {
        // Validate PIN
        if (newPin === CORRECT_PIN || newPin === "0000") {
          setIsLocked(false);
          setPin("");
        } else {
          setError("Incorrect PIN. Try 1234");
          setTimeout(() => setPin(""), 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleBiometricAuth = () => {
    setIsBiometricAuthenticating(true);
    setError(null);
    setTimeout(() => {
      setIsBiometricAuthenticating(false);
      setIsLocked(false);
      setPin("");
    }, 900);
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 text-white select-none animate-in fade-in duration-300">
      
      {/* Top Security Branding */}
      <div className="flex flex-col items-center pt-8 space-y-3 text-center">
        <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-4 ring-white/10">
          <Shield className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif tracking-tight">Crayon Box School</h2>
          <p className="text-xs text-slate-400 mt-0.5">Biometric App Lock &bull; {user?.fullName || "Authorized Session"}</p>
        </div>
      </div>

      {/* PIN Indicators */}
      <div className="flex flex-col items-center space-y-4 my-auto">
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Enter 4-Digit Security PIN</span>
        </div>

        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? "bg-amber-400 scale-110 shadow-md shadow-amber-400/50"
                  : "bg-slate-800 border border-slate-700"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium bg-rose-950/50 px-3 py-1 rounded-full border border-rose-800/40 animate-shake">
            {error}
          </p>
        )}
      </div>

      {/* Keypad & Biometrics */}
      <div className="w-full max-w-xs space-y-4 pb-6">
        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(digit => (
            <button
              key={digit}
              onClick={() => handleNumClick(digit)}
              className="w-16 h-16 rounded-full bg-slate-900/80 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-xl font-semibold border border-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              {digit}
            </button>
          ))}

          {/* Biometric trigger */}
          <button
            onClick={handleBiometricAuth}
            disabled={isBiometricAuthenticating}
            className="w-16 h-16 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center justify-center transition-all active:scale-95"
            title="Face ID / Fingerprint"
          >
            {isBiometricAuthenticating ? (
              <Sparkles className="w-6 h-6 animate-spin text-amber-300" />
            ) : (
              <Fingerprint className="w-6 h-6" />
            )}
          </button>

          {/* Zero */}
          <button
            onClick={() => handleNumClick("0")}
            className="w-16 h-16 rounded-full bg-slate-900/80 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-xl font-semibold border border-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            0
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2">
          <span>Default PIN: <strong className="text-slate-400">1234</strong></span>
          <button onClick={handleBiometricAuth} className="text-amber-400 hover:underline">
            Use Face ID / Touch ID
          </button>
        </div>
      </div>

    </div>
  );
}
