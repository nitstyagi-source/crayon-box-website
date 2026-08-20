"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  DoorOpen, ArrowLeft, Camera, QrCode, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, User, Phone, 
  Send, Sparkles, Check, X, ShieldAlert, Clock, CheckCheck
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { verifyEscortQROnGate, recordStudentPickupRelease } from "@/app/actions/id-cards";

export default function GatePickupSecurityTerminal() {
  const { activeCampusId } = useCampusContext();
  const [qrInput, setQrInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);

  async function handleScanSubmit(token: string) {
    if (!token.trim()) return;
    setIsVerifying(true);
    setReleaseSuccess(null);

    try {
      const res = await verifyEscortQROnGate(token.trim());
      setVerificationResult(res);
      setQrInput("");
    } catch (err: any) {
      alert("Verification Error: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleRelease(studentId: string, escort: any, cardId?: string) {
    setIsReleasing(true);
    try {
      const res = await recordStudentPickupRelease({
        studentId,
        escortId: escort?.id,
        cardId,
        gateNumber: "Main Gate 1",
        securityStaffName: "Subedar Jaswant Singh (Security Head)",
        remarks: `Released to verified authorized escort: ${escort?.full_name} (${escort?.relationship})`
      });

      if (res.success) {
        setReleaseSuccess(res.message || null);
        setTimeout(() => {
          setVerificationResult(null);
          setReleaseSuccess(null);
        }, 3500);
      } else {
        alert("Error releasing student: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsReleasing(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      
      {/* Top Bar */}
      <div className="w-full max-w-3xl mb-4 flex justify-between items-center">
        <Link 
          href="/admin/id-cards"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white bg-stone-800 border border-stone-700 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ID Cards Hub
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            GATE 1 SECURITY TERMINAL
          </span>
        </div>
      </div>

      {/* Main Terminal Box */}
      <div className="w-full max-w-3xl bg-stone-950 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Scanner Input & Viewfinder Header */}
        {!verificationResult ? (
          <div className="space-y-6 text-center">
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                DISMISSAL &amp; STUDENT ESCORT CLEARANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Scan Student Escort Card</h2>
              <p className="text-stone-400 text-xs sm:text-sm max-w-md mx-auto">
                Scan the student&apos;s master escort card QR to view all authorized pickup persons.
              </p>
            </div>

            {/* Viewfinder Target */}
            <div className="relative aspect-16/9 max-w-md mx-auto bg-stone-900 rounded-2xl border-2 border-dashed border-emerald-500/60 flex flex-col items-center justify-center p-6 overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-bounce"></div>
              <QrCode className="w-16 h-16 text-stone-700 mb-2" />
              <p className="text-xs text-stone-400 font-bold">Scanning for student escort token...</p>
            </div>

            {/* Direct Token / Barcode Gun Input */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan QR or enter token..."
                  value={qrInput}
                  onChange={e => setQrInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleScanSubmit(qrInput);
                  }}
                  className="flex-1 bg-stone-900 border border-stone-700 text-white px-4 py-3 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleScanSubmit(qrInput)}
                  disabled={isVerifying}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-3 rounded-xl text-xs shadow-lg transition-all"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>

              {/* Quick 1-Click Test Buttons for Demo */}
              <div className="pt-3 border-t border-stone-800/80 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleScanSubmit("CBS-SEC-ESC-STU-CB101-STUD")}
                  className="text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-emerald-400 px-3 py-1.5 rounded-lg border border-stone-700"
                >
                  Demo: Scan Aarav Sharma&apos;s Escort Card
                </button>
                <button
                  onClick={() => handleScanSubmit("CBS-SEC-BLOCKED-TOKEN-9999")}
                  className="text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-red-400 px-3 py-1.5 rounded-lg border border-stone-700"
                >
                  Demo: Scan Blocked / Lost Card
                </button>
              </div>
            </div>

          </div>
        ) : (
          
          /* Verification Result Display */
          <div className="space-y-6">
            
            {/* Header Result Badge */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                {verificationResult.isAuthorized ? (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className={`text-lg font-black ${verificationResult.isAuthorized ? "text-emerald-400" : "text-red-400"}`}>
                    {verificationResult.isAuthorized ? "STUDENT ESCORT CARD VERIFIED" : "PICKUP BLOCKED / SECURITY ALERT"}
                  </h3>
                  <p className="text-xs text-stone-400">{verificationResult.message}</p>
                </div>
              </div>

              <button
                onClick={() => setVerificationResult(null)}
                className="text-stone-400 hover:text-white p-2 rounded-xl bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AUTHORIZED HUD: STUDENT PROFILE + ALL AUTHORIZED ESCORTS */}
            {verificationResult.isAuthorized && verificationResult.student && (
              <div className="space-y-6">
                
                {/* Student Profile Header Card */}
                <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0">
                      {verificationResult.student.photo_url ? (
                        <img src={verificationResult.student.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-purple-900 text-purple-200 flex items-center justify-center font-bold text-lg">
                          {verificationResult.student.first_name[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-black">
                        STUDENT WARD
                      </span>
                      <h4 className="text-base font-black text-white">
                        {verificationResult.student.first_name} {verificationResult.student.last_name || ''}
                      </h4>
                      <p className="text-xs text-stone-400">
                        Adm: <span className="font-mono font-bold text-white">{verificationResult.student.admission_no || 'CB1042'}</span> • Parent Phone: {verificationResult.student.parent_phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/40 block">
                      ✓ Present in School Today
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1 block">Gate In: {verificationResult.student.inTime || '07:52 AM'}</span>
                  </div>
                </div>

                {/* ALL AUTHORIZED PICKUP PERSONS LIST */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider">
                      Authorized Pickup Persons ({verificationResult.authorizedEscorts?.length || 0} Registered):
                    </h4>
                    <span className="text-[11px] text-amber-400 font-bold">
                      Match face with the person at the gate →
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(verificationResult.authorizedEscorts || []).map((escort: any) => (
                      <div 
                        key={escort.id}
                        className="bg-stone-900 hover:bg-stone-850 p-4 rounded-2xl border border-stone-800 flex flex-col justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-16 rounded-xl overflow-hidden border-2 border-stone-700 shrink-0 bg-stone-800 flex items-center justify-center">
                            {escort.photo_url ? (
                              <img src={escort.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-stone-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                              {escort.relationship}
                            </span>
                            <h5 className="font-black text-sm text-white mt-1 truncate">{escort.full_name}</h5>
                            <p className="text-[11px] font-mono text-stone-400 truncate">{escort.mobile}</p>
                          </div>
                        </div>

                        {/* Release To This Person Button */}
                        <button
                          onClick={() => handleRelease(verificationResult.student.id, escort, verificationResult.card?.id)}
                          disabled={isReleasing}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Release to {escort.full_name.split(' ')[0]} ({escort.relationship})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SECURITY BLOCKED ALERT HUD */}
            {!verificationResult.isAuthorized && (
              <div className="p-6 bg-red-950/40 rounded-2xl border-2 border-red-500 text-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-lg font-black text-red-400">DO NOT RELEASE STUDENT UNDER THIS CREDENTIAL</h4>
                  <p className="text-xs text-stone-300 mt-1 max-w-md mx-auto">
                    {verificationResult.message}
                  </p>
                </div>
                <div className="p-3 bg-red-900/50 rounded-xl text-xs text-red-200 font-mono">
                  ACTION REQUIRED: Escort must report to Main Reception / Principal Office for identity verification.
                </div>
              </div>
            )}

            {/* Success Toast */}
            {releaseSuccess && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-xl animate-in zoom-in-95">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                {releaseSuccess}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
