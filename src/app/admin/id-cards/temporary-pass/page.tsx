"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, ArrowLeft, User, Phone, CheckCircle2, 
  Printer, QrCode, ShieldCheck, Building2, AlertTriangle 
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getStudents } from "@/app/actions/students";
import { createTemporaryEscortPass } from "@/app/actions/id-cards";
import FileUpload from "@/components/admin/FileUpload";

export default function TemporaryEscortPassPage() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj } = useInstitution();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [escortName, setEscortName] = useState("");
  const [relationship, setRelationship] = useState("Relative / Uncle");
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await getStudents(activeCampusId);
      if (res.success && res.data && res.data.length > 0) {
        setStudents(res.data);
        setSelectedStudentId(res.data[0].id);
      }
    }
    load();
  }, [activeCampusId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await createTemporaryEscortPass({
        studentId: selectedStudentId,
        escortName,
        relationship,
        mobile,
        reason,
        photoUrl
      });

      if (res.success && res.data) {
        const student = students.find(s => s.id === selectedStudentId);
        setGeneratedPass({
          ...res.data,
          studentName: `${student?.first_name} ${student?.last_name || ''}`,
          studentClass: student?.class_name || student?.grade || 'Grade 3-B',
          admissionNo: student?.admission_no || 'CB1042'
        });
      } else {
        alert("Error creating temporary pass: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/id-cards" 
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to ID Cards Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Emergency Temporary Escort Pass</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Issue single-day, time-bound pickup clearance for emergency relatives, neighbors, or drivers.
          </p>
        </div>

        {generatedPass && (
          <button
            onClick={() => window.print()}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Emergency Pass
          </button>
        )}
      </div>

      {!generatedPass ? (
        /* Issue Form */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> 1-Day Emergency Pickup Authorization
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
              Valid Today Only
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-600 block mb-1">Select Student Ward *</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full border border-stone-200 p-3 rounded-xl font-bold text-stone-900 text-xs"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name || ''} ({s.class_name || s.grade || 'Grade 3'}) — Adm: {s.admission_no}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Temporary Escort Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Chandra (Maternal Uncle)"
                  value={escortName}
                  onChange={e => setEscortName(e.target.value)}
                  className="w-full border border-stone-200 p-3 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Relationship with Student *</label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full border border-stone-200 p-3 rounded-xl font-bold"
                >
                  <option value="Maternal Uncle / Mama">Maternal Uncle / Mama</option>
                  <option value="Paternal Uncle / Chacha">Paternal Uncle / Chacha</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Family Friend / Neighbor">Family Friend / Neighbor</option>
                  <option value="Temporary Driver">Temporary Driver</option>
                  <option value="Other Authorized Guardian">Other Authorized Guardian</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-600 block mb-1">Contact Mobile Number *</label>
                <input
                  required
                  type="text"
                  placeholder="+91 98100 XXXXX"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full border border-stone-200 p-3 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-600 block mb-1">Reason for Emergency Pickup *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mother in hospital / Flight delay"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full border border-stone-200 p-3 rounded-xl"
                />
              </div>
            </div>

            <FileUpload
              label="Escort Photo / Live Selfie (Optional)"
              value={photoUrl}
              onChange={setPhotoUrl}
              folder="escort_photos"
              mode="avatar"
            />

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <input type="checkbox" required defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              <span className="text-[11px] font-bold text-emerald-900">
                I confirm that parent verbal / OTP consent has been verified for this emergency handover.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-stone-900 hover:bg-stone-800 text-white font-black text-xs px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {isSubmitting ? "Generating..." : "Generate Emergency Pass"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Generated Pass Printable View */
        <div id="printable-temp-pass" className="bg-white rounded-3xl border-2 border-dashed border-stone-900 p-8 shadow-2xl space-y-6 max-w-md mx-auto print:border-solid print:shadow-none">
          <div className="text-center border-b-2 border-stone-900 pb-4 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 font-black flex items-center justify-center mx-auto text-sm">
              {selectedInstitutionObj?.code || 'PASS'}
            </div>
            <h2 className="text-lg font-black text-stone-900 uppercase">
              {selectedInstitutionObj?.name || "School Campus"}
            </h2>
            <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
              TEMPORARY EMERGENCY ESCORT PASS
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-20 h-24 rounded-2xl border border-stone-800 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
              {generatedPass.photo_url ? (
                <img src={generatedPass.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-stone-400" />
              )}
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono text-purple-700 font-bold block">{generatedPass.pass_code}</span>
              <h3 className="font-black text-stone-900 text-sm">{generatedPass.escort_name}</h3>
              <p className="text-stone-600"><span className="font-bold">Relation:</span> {generatedPass.relationship}</p>
              <p className="text-stone-600 font-mono text-[11px]"><span className="font-bold">Mobile:</span> {generatedPass.mobile}</p>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <p><span className="font-bold text-stone-500">Authorized Student:</span> <span className="font-black text-stone-900">{generatedPass.studentName} ({generatedPass.studentClass})</span></p>
            <p><span className="font-bold text-stone-500">Reason:</span> {generatedPass.reason}</p>
            <p><span className="font-bold text-stone-500">Valid Date:</span> <span className="font-bold text-red-600">{generatedPass.valid_date} (Today Only)</span></p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="w-20 h-20 bg-white border border-stone-800 rounded-xl p-1 shrink-0 flex flex-col items-center justify-center">
              <QrCode className="w-12 h-12 text-stone-900" />
              <span className="text-[6px] font-mono font-bold text-stone-500">{generatedPass.pass_code}</span>
            </div>

            <div className="text-right text-[10px] space-y-1">
              <span className="font-bold text-stone-400 block uppercase">Gate Clearance</span>
              <span className="text-emerald-700 font-black block">✓ Parent Verified</span>
              <span className="text-[8px] text-stone-400 block">Principal Office</span>
            </div>
          </div>

          <div className="print:hidden pt-4 border-t border-stone-200 flex justify-between">
            <button
              onClick={() => setGeneratedPass(null)}
              className="text-xs font-bold text-stone-500 hover:text-stone-900"
            >
              ← Issue Another Pass
            </button>
            <button
              onClick={() => window.print()}
              className="bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Print Pass
            </button>
          </div>
        </div>
      )}

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-temp-pass, #printable-temp-pass * {
            visibility: visible;
          }
          #printable-temp-pass {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 380px;
            padding: 24px;
          }
        }
      `}</style>

    </div>
  );
}
