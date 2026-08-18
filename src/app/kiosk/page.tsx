"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { User, Phone, Camera, CheckCircle2, ChevronRight, AlertCircle, Building2, UserCog, Briefcase, ChevronLeft, Printer } from "lucide-react";

type FlowState = "WELCOME" | "TYPE_SELECT" | "PHONE_INPUT" | "CAMERA" | "AWAITING_HOST" | "BADGE_PRINT";

export default function KioskPage() {
  const [flowState, setFlowState] = useState<FlowState>("WELCOME");
  const [visitorType, setVisitorType] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Timer for 45s inactivity reset
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const resetFlow = useCallback(() => {
    setFlowState("WELCOME");
    setVisitorType(null);
    setPhone("");
    setPhoto(null);
  }, []);

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (flowState !== "WELCOME") {
      inactivityTimer.current = setTimeout(() => {
        resetFlow();
      }, 45000); // 45 seconds
    }
  }, [flowState, resetFlow]);

  // Attach global touch/click listeners to reset the timer
  useEffect(() => {
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("keydown", resetTimer);
    
    // Start timer if not on welcome screen
    resetTimer();

    return () => {
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetTimer]);

  // Handle flow transitions
  const handleStart = () => setFlowState("TYPE_SELECT");
  
  const handleTypeSelect = (type: string) => {
    setVisitorType(type);
    setFlowState("PHONE_INPUT");
  };

  const handlePhoneSubmit = () => {
    if (phone.length >= 10) setFlowState("CAMERA");
  };

  // Webcam ref
  const webcamRef = useRef<Webcam>(null);

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setFlowState("AWAITING_HOST");
      
      // Simulate host approval after 4 seconds
      setTimeout(() => {
        setFlowState("BADGE_PRINT");
        // Auto reset after 10s of showing badge
        setTimeout(() => resetFlow(), 10000);
      }, 4000);
    }
  }, [resetFlow]);


  return (
    <div className="w-full h-full max-w-6xl mx-auto flex flex-col relative overflow-hidden bg-white shadow-2xl rounded-3xl m-8 ring-1 ring-slate-200">
      
      {/* Global Kiosk Header */}
      <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-inner">
            C
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Crayon Box International</h1>
            <p className="text-sm font-medium text-slate-500">Smart Visitor Portal</p>
          </div>
        </div>
        
        {flowState !== "WELCOME" && (
          <button 
            onClick={resetFlow}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Start Over
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 relative">
        
        {/* STEP 1: WELCOME */}
        {flowState === "WELCOME" && (
          <div className="text-center w-full max-w-2xl animate-in fade-in zoom-in duration-500">
            <h2 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">Welcome to Campus</h2>
            <p className="text-2xl text-slate-500 mb-16 leading-relaxed">Please tap the screen to check in and print your visitor badge.</p>
            <button 
              onClick={handleStart}
              className="w-full max-w-md mx-auto h-24 bg-blue-600 text-white rounded-3xl text-3xl font-bold shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              Tap to Start <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        )}

        {/* STEP 2: TYPE SELECT */}
        {flowState === "TYPE_SELECT" && (
          <div className="w-full max-w-4xl animate-in slide-in-from-right duration-500">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Who are you visiting today?</h2>
            <p className="text-lg text-slate-500 mb-12 text-center">Select your visitor profile to continue.</p>
            
            <div className="grid grid-cols-3 gap-8">
              {[
                { type: "Parent", icon: User, desc: "Visiting your child or staff" },
                { type: "Vendor", icon: Briefcase, desc: "Deliveries & contractors" },
                { type: "Official", icon: Building2, desc: "Govt. or board officials" }
              ].map(item => (
                <button 
                  key={item.type}
                  onClick={() => handleTypeSelect(item.type)}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.1)] transition-all group text-left active:scale-95 min-h-[200px] flex flex-col"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.type}</h3>
                  <p className="text-slate-500 text-lg font-medium">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PHONE INPUT */}
        {flowState === "PHONE_INPUT" && (
          <div className="w-full max-w-xl animate-in slide-in-from-right duration-500 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Enter your Mobile Number</h2>
            <p className="text-lg text-slate-500 mb-12">We'll use this to notify your host.</p>
            
            <div className="relative mb-12">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">+91</span>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                autoFocus
                className="w-full h-24 pl-24 pr-8 bg-slate-50 border-2 border-slate-200 rounded-3xl text-4xl font-black text-slate-900 tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner"
              />
            </div>

            <button 
              disabled={phone.length < 10}
              onClick={handlePhoneSubmit}
              className="w-full h-24 bg-blue-600 text-white rounded-3xl text-3xl font-bold shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-4 active:scale-95"
            >
              Continue <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        )}

        {/* STEP 4: CAMERA CAPTURE */}
        {flowState === "CAMERA" && (
          <div className="w-full max-w-2xl animate-in slide-in-from-right duration-500 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Take a Photo</h2>
            <p className="text-lg text-slate-500 mb-8">Please align your face in the frame for your visitor badge.</p>
            
            <div className="w-[400px] h-[400px] mx-auto bg-slate-900 rounded-full overflow-hidden border-8 border-slate-100 shadow-2xl relative mb-12">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 400, height: 400, facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-white/20 rounded-full m-4 pointer-events-none"></div>
            </div>

            <button 
              onClick={capturePhoto}
              className="w-full max-w-md mx-auto h-24 bg-blue-600 text-white rounded-3xl text-3xl font-bold shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              <Camera className="w-8 h-8" /> Capture Photo
            </button>
          </div>
        )}

        {/* STEP 5: AWAITING HOST */}
        {flowState === "AWAITING_HOST" && (
          <div className="text-center w-full max-w-xl animate-in fade-in duration-500">
            <div className="w-32 h-32 mx-auto relative mb-12">
              <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <AlertCircle className="w-10 h-10" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Awaiting Host Approval</h2>
            <p className="text-xl text-slate-500 leading-relaxed">
              We have notified the host.<br/>Please wait here while they approve your entry.
            </p>
          </div>
        )}

        {/* STEP 6: BADGE PRINTING */}
        {flowState === "BADGE_PRINT" && (
          <div className="text-center w-full max-w-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Approved!</h2>
            <p className="text-xl text-slate-500 mb-12">Printing your visitor badge now...</p>
            
            {/* Mock Badge Preview */}
            <div className="w-[300px] mx-auto bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left relative transform -rotate-2">
              <div className="h-4 bg-blue-600 w-full"></div>
              <div className="p-6">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Visitor Pass</p>
                {photo && <img src={photo} alt="Visitor" className="w-24 h-24 rounded-lg bg-slate-100 object-cover mb-4" />}
                <h3 className="text-xl font-black text-slate-900 mb-1">{visitorType}</h3>
                <p className="text-xs text-slate-500 font-mono mb-4">+91 {phone}</p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Valid Until</p>
                    <p className="text-xs font-bold text-slate-800">Today, 5:00 PM</p>
                  </div>
                  <Printer className="w-6 h-6 text-slate-300" />
                </div>
              </div>
            </div>
            
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-12 animate-pulse">Please collect badge below</p>
          </div>
        )}

      </div>
    </div>
  );
}
