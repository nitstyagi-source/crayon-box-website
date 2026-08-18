"use client";

import { useState } from "react";
import { submitAdmission } from "@/app/actions/forms";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ApplyNowPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-blue-900 transition-colors">
            Return to Homepage <ArrowRight className="w-5 h-5" />
          </Link>
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

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            <div className="space-y-6">
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

            <div className="space-y-6 pt-6">
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
            </div>

            <div className="pt-8">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 hover:bg-orange-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
