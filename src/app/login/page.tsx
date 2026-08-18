"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/app/actions/auth";
import { ShieldCheck, ArrowRight, Smartphone, RefreshCw, AlertCircle } from "lucide-react";

export default function UnifiedLoginPortal() {
  const router = useRouter();
  const [role, setRole] = useState<'parent' | 'staff'>('parent');
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

  // Refs for OTP input auto-advance
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatPhone = (val: string) => {
    // Basic formatting for +91 numbers
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
    }
    return formatted.trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    setError(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\s/g, '').length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await sendOtp(phone, role);
      if (res.success) {
        setStep(2);
        setTimer(30);
      } else {
        setError((res as any).error || "An error occurred.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the last entered digit
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await verifyOtp(phone, fullOtp, role);
      if (res.success && res.redirectPath) {
        router.push(res.redirectPath);
      } else {
        setError(res.error || "Invalid verification code.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    await sendOtp(phone, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-100">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-serif font-bold text-3xl shadow-lg shadow-blue-500/30">C</div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Crayon Box Portal</h2>
        <p className="mt-2 text-sm text-slate-500">Secure Passwordless Authentication</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100 relative overflow-hidden">
          
          {/* Top Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {step === 1 ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {/* Role Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                <button 
                  onClick={() => setRole('parent')} 
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Parent
                </button>
                <button 
                  onClick={() => setRole('staff')} 
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'staff' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Staff / Teacher
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Registered Mobile Number</label>
                  <div className="flex rounded-xl shadow-sm border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden bg-white transition-all">
                    <span className="inline-flex items-center px-4 rounded-l-xl border-r border-slate-200 bg-slate-50 text-slate-500 sm:text-sm font-bold">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className="flex-1 min-w-0 block w-full px-4 py-4 text-lg font-bold text-slate-900 border-none focus:ring-0 placeholder:text-slate-300 placeholder:font-normal tracking-wide"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={isProcessing}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2 border border-red-100 animate-in shake">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || phone.replace(/\s/g, '').length !== 10}
                  className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all
                    ${role === 'parent' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}
                    ${isProcessing || phone.replace(/\s/g, '').length !== 10 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {isProcessing ? "Verifying Record..." : "Send Secure OTP"}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 mb-4">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Check your phone</h3>
                <p className="text-sm text-slate-500">
                  We've sent a 6-digit code to <br/>
                  <strong className="text-slate-800 tracking-wider">+91 {phone}</strong>
                </p>
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 font-bold mt-2 hover:underline">Edit number</button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                
                <div className="flex justify-between gap-2 sm:gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-10 h-12 sm:w-12 sm:h-14 border-2 border-slate-200 rounded-xl text-center text-xl sm:text-2xl font-black text-slate-800 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isProcessing}
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2 border border-red-100 animate-in shake">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || otp.join('').length !== 6}
                  className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all
                    ${role === 'parent' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                    ${isProcessing || otp.join('').length !== 6 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-slate-500 font-medium">Resend code in <span className="font-bold text-slate-800">00:{timer.toString().padStart(2, '0')}</span></p>
                  ) : (
                    <button type="button" onClick={handleResend} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Resend Secure Code</button>
                  )}
                </div>

              </form>
            </div>
          )}
          
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          By logging in, you agree to Crayon Box's <br/>
          <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
