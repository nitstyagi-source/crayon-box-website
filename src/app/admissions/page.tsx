"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Calculator, ChevronRight, UploadCloud, CheckCircle2, FileText, Phone, Mail, HelpCircle, Lock, GraduationCap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageContent } from "@/app/actions/cms";
import { useLivePreview } from "@/hooks/useLivePreview";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function AdmissionsHub() {
  const [feeGrade, setFeeGrade] = useState("pre-k");
  const [feeTransport, setFeeTransport] = useState("none");
  const [feeKits, setFeeKits] = useState("none");
  const cmsData = useLivePreview("admissions");

  // Simple fee calculation logic for the demo UI
  const baseTuition = feeGrade === "pre-k" || feeGrade === "kg" ? 18000 : 22000;
  const transportFee = feeTransport === "none" ? 0 : (feeTransport === "zone1" ? 4500 : 7500);
  const kitFee = feeKits === "none" ? 0 : (feeKits === "robotics" ? 3000 : 2500);
  const totalFee = baseTuition + transportFee + kitFee;

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (idx: number) => setOpenFaq(openFaq === idx ? null : idx);

  const faqs = [
    { q: "What is the student-to-teacher ratio?", a: "We maintain a strict 1:20 ratio in primary grades and 1:25 in middle school to ensure personalized attention." },
    { q: "Is the application fee refundable?", a: "The one-time application processing fee of ₹1,500 is non-refundable." },
    { q: "How do I track my application status?", a: "Use your unique Application Token (e.g., APP-2026-8942) in our application tracker portal." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      
      {/* Section 1: The Hero Header */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1544256718-3b62eb73f871?q=80&w=2070&auto=format&fit=crop"} 
            alt="Admissions Welcome" 
            fill sizes="(max-width: 768px) 100vw, 50vw" 
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/80 to-transparent mix-blend-multiply" />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              {cmsData.hero?.headline || "Begin Your Child’s"} <span className="text-accent italic">{cmsData.hero?.subtext || "Journey."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-stone-200 font-light leading-relaxed border-l-4 border-accent pl-6">
              {cmsData.hero?.description || "Welcome to a paperless, transparent, and seamless admissions experience. We are currently accepting applications for the 2026–27 academic year."}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/admissions/apply" className="px-8 py-4 bg-accent text-white font-bold rounded-full hover:bg-orange-800 transition-colors shadow-xl text-center">
                Apply Now (New Admissions)
              </Link>
              <Link href="/pay-fees" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-colors text-center">
                Pay Fees (Current Students)
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: The Future-Proof Advantage */}
      <section className="py-16 bg-white relative z-20 -mt-8 rounded-t-[3rem] border-b border-stone-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-stone-50 border border-stone-200 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 shadow-sm"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
              <GraduationCap className="w-12 h-12" />
            </div>
            <div>
              <span className="text-accent font-bold uppercase tracking-widest text-xs mb-2 block">{cmsData.vision?.label || "Our Vision"}</span>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">{cmsData.vision?.headline || "Grow With Us: The K-12 Advantage."}</h2>
              <p className="text-stone-600 font-light leading-relaxed mb-4">
                {cmsData.vision?.description || "Crayon Box School is currently an elite K-8 institution, but our vision doesn't stop at middle school. We are actively expanding our campus infrastructure to become a fully-fledged K-12 senior secondary school."}
              </p>
              <p className="text-stone-900 font-medium">
                <strong>{cmsData.vision?.promise_label || "The Promise:"}</strong> {cmsData.vision?.promise_text || "By enrolling your child today, you guarantee them a seamless transition through high school without the stress of changing schools, boards, or environments during their most crucial academic years."}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Eligibility & Age Criteria */}
      <section className="py-24 bg-stone-50 border-b border-stone-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
            <motion.h2 variants={fadeUp} className="text-4xl font-serif font-bold text-stone-900 mb-4">{cmsData.criteria?.headline || "Admission Criteria for 2026–27"}</motion.h2>
            <motion.p variants={fadeUp} className="text-stone-600 font-light">{cmsData.criteria?.description || "Please review the age eligibility requirements before proceeding with the application."}</motion.p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 text-sm uppercase tracking-widest border-b border-stone-200">
                    <th className="p-6 font-bold">Grade Applied For</th>
                    <th className="p-6 font-bold">Age Criteria <span className="text-xs font-normal lowercase tracking-normal text-stone-400">(As of Mar 31, 2026)</span></th>
                    <th className="p-6 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-6 font-bold text-stone-900">Pre-Nursery</td>
                    <td className="p-6">2.5 to 3 Years</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Open</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-6 font-bold text-stone-900">Nursery</td>
                    <td className="p-6">3 to 4 Years</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Open</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-6 font-bold text-stone-900">Kindergarten (K1 & K2)</td>
                    <td className="p-6">4 to 6 Years</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Open</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-6 font-bold text-stone-900">Grade 1</td>
                    <td className="p-6">6 to 7 Years</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">Limited Seats</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-6 font-bold text-stone-900">Primary (Grades 2 to 5)</td>
                    <td className="p-6">7 to 11 Years</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">Subject to Availability</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="p-6 font-bold text-stone-900">Middle School (Grades 6 to 8)</td>
                    <td className="p-6">11 to 14 Years</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">Assessment Req.</span></td>
                  </tr>
                  <tr className="bg-stone-50 text-stone-400">
                    <td className="p-6 font-bold">Senior Secondary (9 to 12)</td>
                    <td className="p-6">-</td>
                    <td className="p-6 text-right"><span className="inline-block px-3 py-1 bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase">Coming Soon</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4 & 5: Fee Calculator & Application Form */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-64 bg-stone-50 border-b border-stone-200 z-0" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Transparent Fee Calculator */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="lg:col-span-5">
              <motion.div variants={fadeUp} className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Calculator className="w-48 h-48" />
                </div>
                
                <h3 className="text-3xl font-serif font-bold mb-2 relative z-10">{cmsData.calculator?.headline || "Transparent Fee Calculator"}</h3>
                <p className="text-blue-200 font-light text-sm mb-8 relative z-10">{cmsData.calculator?.description || "Calculate your estimated quarterly tuition instantly. No hidden costs."}</p>

                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Select Grade</label>
                    <select 
                      value={feeGrade} onChange={(e) => setFeeGrade(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="pre-k" className="text-stone-900">Pre-K / Nursery</option>
                      <option value="kg" className="text-stone-900">Kindergarten (K1 & K2)</option>
                      <option value="primary" className="text-stone-900">Primary (Grades 1 to 5)</option>
                      <option value="middle" className="text-stone-900">Middle School (Grades 6 to 8)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Transport Required?</label>
                    <select 
                      value={feeTransport} onChange={(e) => setFeeTransport(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="none" className="text-stone-900">No Transport</option>
                      <option value="zone1" className="text-stone-900">Yes - Zone 1 (Within 5km)</option>
                      <option value="zone2" className="text-stone-900">Yes - Zone 2 (Beyond 5km)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Optional Co-Curricular Kits</label>
                    <select 
                      value={feeKits} onChange={(e) => setFeeKits(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="none" className="text-stone-900">None</option>
                      <option value="robotics" className="text-stone-900">Robotics Kit (Annual)</option>
                      <option value="performing" className="text-stone-900">Performing Arts Prop Kit</option>
                    </select>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/20">
                    <div className="flex justify-between items-center mb-2 text-sm text-blue-100">
                      <span>Tuition Fee (Quarterly)</span>
                      <span>₹ {baseTuition.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-sm text-blue-100">
                      <span>Transport Fee (Quarterly)</span>
                      <span>₹ {transportFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-sm text-blue-100">
                      <span>Co-Curricular Add-ons</span>
                      <span>₹ {kitFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm uppercase tracking-widest font-bold text-accent">Est. Total Payable</span>
                      <span className="text-3xl font-black text-white">₹ {totalFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-blue-300 mt-8 leading-relaxed opacity-80 relative z-10">
                  Disclaimer: This is an estimated breakdown. A one-time non-refundable admission fee applies to new enrollments. Download our detailed Fee Structure PDF for comprehensive board guidelines.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: The Multi-Step Digital Application Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:col-span-7">
              <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-[0_0_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full">
                
                {/* Progress Bar */}
                <div className="bg-stone-50 border-b border-stone-200 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-stone-900">Step 1 of 4: Profile Details</span>
                    <span className="text-accent flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Auto-saved</span>
                  </div>
                  <div className="flex gap-2 h-2">
                    <div className="w-1/4 bg-secondary rounded-full"></div>
                    <div className="w-1/4 bg-stone-200 rounded-full"></div>
                    <div className="w-1/4 bg-stone-200 rounded-full"></div>
                    <div className="w-1/4 bg-stone-200 rounded-full"></div>
                  </div>
                </div>

                {/* Form Body - Wired to Supabase */}
                <form action={async (formData) => {
                  const { submitAdmissionApplication } = await import('@/app/actions/admissions');
                  const res = await submitAdmissionApplication(formData);
                  if (res.success) {
                    alert('Application Submitted! Your Tracking Token: ' + res.trackingToken);
                  } else {
                    alert('Submission failed. Please check inputs.');
                    console.error(res.errors);
                  }
                }} className="p-8 md:p-12 flex-1 flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Student & Parent Profile</h3>
                  
                  <div className="space-y-6 mb-10 overflow-y-auto">
                    {/* Student Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student First Name</label>
                        <input name="studentFirstName" type="text" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student Last Name</label>
                        <input name="studentLastName" type="text" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Date of Birth</label>
                        <input name="dateOfBirth" type="date" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-stone-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Grade Applied For</label>
                        <select name="gradeApplied" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
                          <option value="Pre-K">Pre-K / Nursery</option>
                          <option value="Grade 1">Grade 1</option>
                          <option value="Grade 6">Grade 6</option>
                        </select>
                      </div>
                    </div>

                    {/* Parent Details */}
                    <h4 className="text-lg font-serif font-bold text-stone-900 mt-8 mb-4 border-t border-stone-100 pt-6">Primary Contact (Parent/Guardian)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Parent First Name</label>
                        <input name="parentFirstName" type="text" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Parent Last Name</label>
                        <input name="parentLastName" type="text" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                        <input name="parentEmail" type="email" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Phone Number</label>
                        <input name="parentPhone" type="tel" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-stone-100 mt-auto">
                    <button type="button" className="text-stone-400 font-bold hover:text-stone-600 transition-colors text-sm">Cancel</button>
                    <button type="submit" className="bg-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-800 transition-colors flex items-center gap-2">
                      Save & Submit <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 6: Current Parent Fee Gateway (Fast-Track Payment) */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-stone-800/50 backdrop-blur-md border border-stone-700 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
            
            <motion.div variants={fadeUp} className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-4xl font-serif font-bold mb-4">Quick Fee Payment</h2>
              <p className="text-stone-300 font-light text-lg mb-8 leading-relaxed">
                For enrolled students of Crayon Box School. Secure, fast-track payment integration with one-click UPI and card options.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-light text-stone-300">Instantly fetch outstanding dues via Student ID.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-light text-stone-300">Your GST-compliant receipt will be emailed instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-light text-stone-300">Ledger automatically updates in your Parent App.</span>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={fadeUp} className="w-full md:w-1/2 bg-white rounded-[2rem] p-8 text-stone-900 shadow-2xl">
              <h3 className="font-bold text-xl mb-6">Fetch Ledger Details</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student ID / Admission No.</label>
                  <input type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. CB-2024-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Student Date of Birth</label>
                  <input type="date" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-stone-500" />
                </div>
              </div>
              <button className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-stone-800 transition-colors">
                Fetch Dues & Pay Securely
              </button>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Section 7: Admissions Helpdesk & FAQs */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Helpdesk Contact Card */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="lg:col-span-5">
              <motion.div variants={fadeUp} className="bg-primary text-white rounded-[2.5rem] p-10 md:p-12 shadow-xl sticky top-24">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4">Admissions Helpdesk</h3>
                <p className="text-blue-200 font-light leading-relaxed mb-10">
                  Need help with your application? Our Admissions Counselors are here to guide you through every step.
                </p>
                <div className="space-y-6">
                  <a href="tel:+919811102008" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Call Us</p>
                      <p className="text-lg font-bold">+91 98111 02008</p>
                    </div>
                  </a>
                  <a href="mailto:admissions@crayonboxschool.com" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Email Us</p>
                      <p className="text-lg font-bold">admissions@crayonboxschool.com</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </motion.div>

            {/* FAQs */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="lg:col-span-7">
              <motion.h2 variants={fadeUp} className="text-4xl font-serif font-bold text-stone-900 mb-10">Frequently Asked Questions</motion.h2>
              <motion.div variants={fadeUp} className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-stone-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                    >
                      <span className="font-bold text-stone-900 text-lg pr-4">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 md:p-8 pt-0 text-stone-600 font-light leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}
