"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, ChevronDown, Send, ShieldAlert, Award, Calendar, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageContent } from "@/app/actions/cms";
import { submitContactEnquiry } from "@/app/actions/forms";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function ContactUs() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cmsData, setCmsData] = useState<Record<string, any>>({});
  const [globalData, setGlobalData] = useState<Record<string, any>>({});

  useEffect(() => {
    Promise.all([
      getPageContent("contact"),
      getPageContent("global")
    ]).then(([res, globalRes]) => {
      if (res.success && res.data) setCmsData(res.data);
      if (globalRes.success && globalRes.data) setGlobalData(globalRes.data);
    });
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitContactEnquiry(formData);
    if (res.success) {
      setSuccess(true);
      e.currentTarget.reset();
    }
    setIsSubmitting(false);
  }

  const departments = [
    { title: "Admissions Desk", content: "For campus tours, fee structures, and application status." },
    { title: "Accounts & Billing", content: "For fee ledger queries and payment gateway support." },
    { title: "Transport Helpdesk", content: "For bus route queries, live-tracking issues, and driver contact info." },
    { title: "Grievance & Counseling Cell", content: "A direct, confidential line to our student welfare committee." },
    { title: "Careers (HR)", content: "As we prepare for our K-12 expansion, we are actively recruiting senior secondary educators. Please visit our Careers portal to apply." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Section 1: The Hero Header (Warmth & Clarity) */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"}
            alt="Welcoming reception" 
            fill sizes="(max-width: 768px) 100vw, 50vw" 
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/80 to-transparent mix-blend-multiply" />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              {cmsData.hero?.headline || "Let’s Start a"} <br/><span className="text-accent italic">{cmsData.hero?.subtext || "Conversation."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-stone-200 font-light leading-relaxed mb-10 border-l-4 border-accent pl-6">
              {cmsData.hero?.description || "Whether you are exploring admissions for your child or need assistance from our administrative team, we are here to help."}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Quick Connect (The Essentials) */}
      <section className="py-24 bg-stone-50 border-b border-stone-200 relative z-20 -mt-8 rounded-t-[3rem]">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Call Us */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-shadow group text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Call Us</h3>
              <div className="space-y-3 text-stone-600 font-light">
                <p><strong className="text-stone-900">Main Reception:</strong><br />{globalData.contact?.phone || "+91 98765 43210"}</p>
                <p><strong className="text-stone-900">Emergency / Transport:</strong><br />{globalData.contact?.phone || "+91 98765 43211"}<br /><span className="text-xs text-stone-400">(Available 6 AM - 6 PM)</span></p>
              </div>
            </motion.div>

            {/* Card 2: Email Us */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-shadow group text-center">
              <div className="w-16 h-16 mx-auto bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Email Us</h3>
              <div className="space-y-3 text-stone-600 font-light">
                <p><strong className="text-stone-900">General Inquiries:</strong><br /><a href={`mailto:${globalData.contact?.email || 'info@crayonboxschool.edu.in'}`} className="hover:text-secondary transition-colors">{globalData.contact?.email || "info@crayonboxschool.edu.in"}</a></p>
                <p><strong className="text-stone-900">Admissions:</strong><br /><a href={`mailto:${globalData.contact?.email || 'admissions@crayonboxschool.edu.in'}`} className="hover:text-secondary transition-colors">{globalData.contact?.email || "admissions@crayonboxschool.edu.in"}</a></p>
              </div>
            </motion.div>

            {/* Card 3: Visit Us */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-shadow group text-center">
              <div className="w-16 h-16 mx-auto bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Visit Us</h3>
              <div className="space-y-3 text-stone-600 font-light">
                <p>{globalData.contact?.address || "123 Education Boulevard, Knowledge Park, New Delhi, India"}</p>
                <p><strong className="text-stone-900">Office Hours:</strong><br />Mon - Sat, 8:00 AM - 4:00 PM</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Section 3 & 4: Smart Departmental Directory & Smart Enquiry Form */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left: Departmental Directory */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Departmental Directory</motion.h2>
              <motion.p variants={fadeUp} className="text-stone-600 font-light mb-10 leading-relaxed">
                To route your inquiries efficiently and ensure a prompt response, please reach out to the specific department below.
              </motion.p>

              <motion.div variants={fadeUp} className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50">
                    <button 
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-stone-50 transition-colors"
                    >
                      <span className="font-bold text-stone-900 text-lg">{dept.title}</span>
                      <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${openAccordion === index ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openAccordion === index && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-2 text-stone-600 font-light leading-relaxed border-t border-stone-100 bg-white">
                            {dept.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: The Smart Enquiry Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-stone-100">
                <motion.h2 variants={fadeUp} className="text-3xl font-serif font-bold text-stone-900 mb-6">Send an Enquiry</motion.h2>
                
                <motion.div variants={fadeUp} className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-8 flex gap-4 items-start">
                  <ShieldAlert className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 leading-relaxed font-light">
                    <strong className="font-semibold block mb-1">Current Parents Notice:</strong> 
                    For the fastest response to daily operational queries (leave requests, transport, fees), please use the Helpdesk Ticketing System inside your Crayon Box Parent App.
                  </p>
                </motion.div>

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">Your message has been sent successfully. We will get back to you shortly.</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Full Name</label>
                      <input name="name" required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                      <input name="email" required type="email" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="john@example.com" />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Phone Number</label>
                    <input name="phone" required type="tel" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700" placeholder="+91 98765 43210" />
                  </motion.div>

                  <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Department</label>
                      <select name="department" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 appearance-none">
                        <option>General Inquiry</option>
                        <option>Admissions Office</option>
                        <option>Principal's Office</option>
                        <option>Finance & Billing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Nature of Inquiry</label>
                      <select name="nature" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-stone-700 appearance-none">
                        <option>Admissions</option>
                        <option>Transport</option>
                        <option>Fees</option>
                        <option>Grievance</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Message</label>
                    <textarea name="message" required rows={4} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" placeholder="How can we help you?"></textarea>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
                    </button>
                  </motion.div>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 5: Interactive Location & Visitor Policy */}
      <section className="relative h-[80vh] min-h-[600px] bg-stone-200">
        {/* Placeholder for Google Maps Embed */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <MapPin className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 h-full flex items-center justify-end relative z-10 pointer-events-none">
          {/* Safety Overlay Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md pointer-events-auto border border-stone-100"
          >
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Campus Visitor Policy</h3>
            <p className="text-stone-600 font-light leading-relaxed mb-8">
              Student safety is our uncompromising priority. All campus visits must be pre-scheduled. Upon arrival, guests must register at our digital Smart Visitor Kiosk at the main gate and present a valid government ID to receive a digital visitor badge.
            </p>
            <button className="w-full px-6 py-4 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" /> Schedule a Campus Visit
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 6: Footer Integration (Social Proof) */}
      <section className="py-20 bg-stone-950 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl font-serif font-bold mb-8">Stay Connected</motion.h2>
            
            <motion.div variants={fadeUp} className="flex justify-center gap-6 mb-16">
              {['Instagram', 'YouTube', 'Facebook'].map((platform, idx) => (
                <a key={idx} href="#" className="px-6 py-3 bg-white/10 rounded-full font-bold hover:bg-accent transition-colors">
                  {platform}
                </a>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-stone-800">
              <div className="flex flex-col items-center justify-center gap-3">
                <Award className="w-8 h-8 text-stone-500" />
                <span className="text-xs uppercase tracking-widest font-bold text-stone-400">CBSE Affiliation: 1234567</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <ShieldAlert className="w-8 h-8 text-stone-500" />
                <span className="text-xs uppercase tracking-widest font-bold text-stone-400">100% Safety Compliant</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <Award className="w-8 h-8 text-stone-500" />
                <span className="text-xs uppercase tracking-widest font-bold text-stone-400">ISO 9001:2015 Certified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
