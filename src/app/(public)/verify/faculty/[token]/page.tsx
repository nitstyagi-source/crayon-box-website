import { verifyFacultyQrToken } from "@/app/actions/faculty-id-cards";
import { 
  ShieldCheck, ShieldAlert, Award, Building2, Phone, 
  Mail, CheckCircle2, XCircle, MapPin, Calendar, Clock, Lock
} from "lucide-react";
import Link from "next/link";

interface VerifyFacultyPageProps {
  params: Promise<{ token: string }>;
}

export default async function VerifyFacultyQrPage({ params }: VerifyFacultyPageProps) {
  const { token } = await params;
  const result = await verifyFacultyQrToken(token);

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Outer Card Container */}
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top Glowing Header Accent */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${
          result.verified ? "bg-emerald-500" : "bg-red-500"
        }`} />

        {/* Verification Status Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-white text-purple-950 flex items-center justify-center font-black text-sm">
              CB
            </div>
            <h1 className="text-sm font-black uppercase tracking-wider text-stone-200">
              CRAYON BOX SCHOOL
            </h1>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
            DIGITAL FACULTY CREDENTIAL VERIFICATION
          </span>

          {result.verified ? (
            <div className="pt-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-9 h-9 animate-pulse" />
              </div>
              <span className="inline-block bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                ✓ VERIFIED ACTIVE FACULTY
              </span>
            </div>
          ) : (
            <div className="pt-2">
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <span className="inline-block bg-red-600 text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                ✕ INVALID / UNVERIFIED CREDENTIAL
              </span>
            </div>
          )}
        </div>

        {/* Verified Faculty Profile Details */}
        {result.verified && result.facultyProfile && (
          <div className="space-y-4 pt-2">
            
            {/* Photo & Core Bio */}
            <div className="flex items-center gap-4 bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
              <div className="w-16 h-16 rounded-2xl bg-purple-900 text-purple-200 border border-purple-500/40 flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                {result.facultyProfile.photoUrl ? (
                  <img src={result.facultyProfile.photoUrl} alt="Faculty" className="w-full h-full object-cover" />
                ) : (
                  <span>{result.facultyProfile.fullName.charAt(0)}</span>
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="text-base font-black text-white truncate">
                  {result.facultyProfile.fullName}
                </h3>
                <p className="text-xs font-bold text-purple-400 truncate">
                  {result.facultyProfile.designation}
                </p>
                <span className="text-[10px] font-mono text-stone-400 block truncate">
                  Dept: {result.facultyProfile.department}
                </span>
              </div>
            </div>

            {/* Official Credential Attributes */}
            <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 text-xs font-mono space-y-2">
              <div className="flex justify-between items-center text-stone-400">
                <span>Employee ID:</span>
                <strong className="text-white font-black">{result.facultyProfile.employeeId}</strong>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Academic Session:</span>
                <span className="text-purple-300 font-bold">{result.facultyProfile.session}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Blood Group:</span>
                <span className="text-red-400 font-bold">{result.facultyProfile.bloodGroup || "O+"}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Branch Campus:</span>
                <span className="text-stone-300">{result.facultyProfile.branch}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Card Validity:</span>
                <span className="text-emerald-400 font-bold">{result.facultyProfile.validUntil || "31/03/2027"}</span>
              </div>
            </div>

            {/* Institutional Information */}
            <div className="bg-purple-950/40 border border-purple-800/40 p-3 rounded-2xl text-[11px] text-purple-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>CRAYON BOX SCHOOL</span>
              </div>
              <p className="text-[10px] text-purple-300/80">
                Sant Nagar, Main Burari Road, Delhi - 110084 • UDISE: 07124100151
              </p>
            </div>

          </div>
        )}

        {/* Failure Explanation */}
        {!result.verified && (
          <div className="bg-red-950/40 border border-red-800/50 p-4 rounded-2xl text-center text-xs text-red-200 space-y-1.5">
            <p className="font-bold">
              {result.message || "This credential has been revoked, blocked, or expired."}
            </p>
            <p className="text-[10px] text-stone-400">
              Please contact the school administrative desk at 9811102008 for assistance.
            </p>
          </div>
        )}

        {/* Security Audit Timestamp */}
        <div className="text-center text-[9px] font-mono text-stone-500 border-t border-stone-800 pt-3">
          Verification Timestamp: {new Date().toLocaleString("en-IN")}
        </div>

      </div>

    </div>
  );
}
