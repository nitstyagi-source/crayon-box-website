"use client";

import { useState } from "react";
import { submitAdmission } from "@/app/actions/forms";
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, FileCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ApplyNowPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitAdmission(formData);
    if (res.success) {
      setSuccessId(res.applicationId);
    }
    setIsSubmitting(false);
  }

  if (successId) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 pt-32">
        <div className="bg-white p-12 rounded-[2rem] shadow-xl max-w-lg w-full text-center border border-stone-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Application Received!</h1>
          <p className="text-stone-600 mb-6 leading-relaxed text-sm">
            Thank you for applying to Crayon Box School. Your digital application has been registered with zero upfront fees. Our admissions committee will review your child's profile and contact you for interactive assessment and seat allocation.
          </p>
          
          <div className="bg-stone-50 p-4 rounded-2xl mb-6 border border-stone-200">
            <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">Application Reference ID</p>
            <p className="text-2xl font-mono font-black text-primary">{successId}</p>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-left text-xs text-blue-900 mb-8 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
              Next Step: Post-Admission Document Checklist
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              No document uploads were required today. Physical documents (Birth Certificate, TC from previous school, and Aadhaar card) will only be requested <strong>after</strong> admission confirmation during final desk onboarding.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/admissions/track?token=${successId}`} className="inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-800 px-8 py-4 rounded-full font-bold hover:bg-stone-200 transition-colors text-sm">
              Track Application Status
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-blue-900 transition-colors text-sm">
              Return to Homepage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-10 text-center">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
            Academic Session 2026–27
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3">Admissions Application</h1>
          <p className="text-stone-600 text-base max-w-xl mx-auto">
            Quick 2-minute digital intake. Zero processing fee and no document uploads required prior to admission confirmation.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="bg-stone-50 border-b border-stone-200 p-6 md:px-12 flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-stone-900">
                Step {step} of 2: {step === 1 ? "Parent / Guardian Details" : "Student Details & Grade Choice"}
              </span>
              <span className="text-accent flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Online Application
              </span>
            </div>
            <div className="flex gap-2 h-2">
              <div className={`w-1/2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-secondary' : 'bg-stone-200'}`}></div>
              <div className={`w-1/2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-secondary' : 'bg-stone-200'}`}></div>
            </div>
          </div>

          <div className="p-8 md:p-12 relative z-10">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                  <div>
                    <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-2">
                      Parent / Guardian Contact Coordinates
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Our admissions team will reach out via phone/email regarding assessment schedules.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                      Parent / Guardian Full Name *
                    </label>
                    <input 
                      required 
                      type="text" 
                      name="parentName" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-medium" 
                      placeholder="e.g. Rajesh Sharma" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                        Email Address *
                      </label>
                      <input 
                        required 
                        type="email" 
                        name="email" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-medium" 
                        placeholder="rajesh.sharma@example.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                        Mobile Phone Number *
                      </label>
                      <input 
                        required 
                        type="tel" 
                        name="phone" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-medium font-mono" 
                        placeholder="+91 98765 43210" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                  <div>
                    <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-2">
                      Student Details & Grade Preference
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Enter your child's basic identification details.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                        Child's Full Name *
                      </label>
                      <input 
                        required 
                        type="text" 
                        name="childName" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-medium" 
                        placeholder="e.g. Aarav Sharma" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                        Applying for Grade / Class *
                      </label>
                      <select 
                        required 
                        name="grade" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-medium appearance-none"
                      >
                        <option value="">Select a Grade...</option>
                        <option value="Pre-Nursery">Pre-Nursery (Age 2.5+)</option>
                        <option value="Nursery">Nursery (Age 3+)</option>
                        <option value="Kindergarten">Kindergarten / KG (Age 4+)</option>
                        <option value="Grade 1">Grade 1 (Age 5+)</option>
                        <option value="Grade 2">Grade 2 (Age 6+)</option>
                        <option value="Grade 3">Grade 3 (Age 7+)</option>
                        <option value="Grade 4">Grade 4 (Age 8+)</option>
                        <option value="Grade 5">Grade 5 (Age 9+)</option>
                        <option value="Grade 6">Grade 6 (Age 10+)</option>
                        <option value="Grade 7">Grade 7 (Age 11+)</option>
                        <option value="Grade 8">Grade 8 (Age 12+)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                      Date of Birth *
                    </label>
                    <input 
                      required 
                      type="date" 
                      name="dob" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 font-medium" 
                    />
                  </div>

                  {/* Post-Admission Document Verification Guarantee Notice */}
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      Zero Upfront Fees & Post-Confirmation Document Policy
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[11px] text-emerald-900/90 leading-relaxed font-medium">
                      <li><strong>No Upfront Fee</strong>: Submitting an admission application is 100% free of cost.</li>
                      <li><strong>No Document Uploads Required Now</strong>: You do not need to scan or upload documents at this stage. Physical certificates (Birth Certificate, TC, Immunization cards) are only verified after seat confirmation.</li>
                      <li><strong>Fast Intake</strong>: Click submit to receive your Application Token and track your candidate pipeline status.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-4 border-t border-stone-100">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)}
                    className="w-1/3 bg-stone-100 text-stone-700 font-bold py-3.5 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-accent text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent/20 hover:bg-orange-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base`}
                >
                  {step < 2 ? (
                    <>Next: Student Details <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>{isSubmitting ? "Registering Application..." : "Submit Application"} <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
