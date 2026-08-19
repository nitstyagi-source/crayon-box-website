"use client";

import { useState } from "react";
import { submitAdmission } from "@/app/actions/forms";
import { CheckCircle2, ArrowRight, UploadCloud, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ApplyNowPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 3) {
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
        <div className="bg-white p-12 rounded-[2rem] shadow-xl max-w-lg w-full text-center border border-stone-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Application Received!</h1>
          <p className="text-stone-600 mb-8 leading-relaxed">
            Thank you for applying to Crayon Box School. Your application has been successfully submitted. Our admissions team will review it and contact you shortly.
          </p>
          <div className="bg-stone-50 p-4 rounded-xl mb-8 border border-stone-200">
            <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mb-1">Application Reference ID</p>
            <p className="text-xl font-mono font-bold text-primary">{successId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href={`/admissions/track?token=${successId}`} className="inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-800 px-8 py-4 rounded-full font-bold hover:bg-stone-200 transition-colors">
              Track Application
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-blue-900 transition-colors">
              Return to Homepage <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Admissions Application</h1>
          <p className="text-stone-600 text-lg">Please fill out the form below to begin your child's journey with us.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="bg-stone-50 border-b border-stone-200 p-6 md:px-12 flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-stone-900">Step {step} of 3: {step === 1 ? "Parent Details" : step === 2 ? "Student Details" : "Documents & Payment"}</span>
              <span className="text-accent flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Secure</span>
            </div>
            <div className="flex gap-2 h-2">
              <div className={`w-1/3 rounded-full ${step >= 1 ? 'bg-secondary' : 'bg-stone-200'}`}></div>
              <div className={`w-1/3 rounded-full ${step >= 2 ? 'bg-secondary' : 'bg-stone-200'}`}></div>
              <div className={`w-1/3 rounded-full ${step >= 3 ? 'bg-secondary' : 'bg-stone-200'}`}></div>
            </div>
          </div>

          <div className="p-8 md:p-12 relative z-10">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-2">Parent / Guardian Details</h2>
                  
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input required type="text" name="parentName" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="e.g. John Doe" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                      <input required type="email" name="email" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Phone Number</label>
                      <input required type="tel" name="phone" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-2">Student Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Child's Full Name</label>
                      <input required type="text" name="childName" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="Child's Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Applying for Grade</label>
                      <select required name="grade" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 appearance-none">
                        <option value="">Select a Grade...</option>
                        <option value="Pre-Nursery">Pre-Nursery</option>
                        <option value="Nursery">Nursery</option>
                        <option value="Kindergarten">Kindergarten</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Date of Birth</label>
                    <input required type="date" name="dob" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-500" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-2">Document Upload</h2>
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center hover:bg-stone-50 transition-colors cursor-pointer flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-stone-800 font-bold mb-1">Upload Birth Certificate / ID</p>
                      <p className="text-sm text-stone-500">Drag and drop or click to browse (PDF, JPG, PNG)</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-2">Application Fee Payment</h2>
                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-stone-600">Processing Fee</span>
                        <span className="text-2xl font-bold text-stone-900">₹1,500</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl">
                          <CreditCard className="text-primary w-6 h-6" />
                          <div className="flex-1">
                            <p className="font-bold text-stone-800 text-sm">Credit / Debit Card</p>
                            <p className="text-xs text-stone-500">Secured via Stripe / Razorpay</p>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 flex gap-4">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)}
                    className="w-1/3 bg-stone-100 text-stone-700 font-bold py-4 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" /> Back
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 hover:bg-orange-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg`}
                >
                  {step < 3 ? (
                    <>Next Step <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <>{isSubmitting ? "Processing..." : "Pay & Submit Application"} <CheckCircle2 className="w-5 h-5" /></>
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

