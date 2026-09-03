"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, Smartphone, CheckCircle2, ChevronRight, PlayCircle, Quote, Compass, BookOpen, Layers, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { submitPublicEnquiry } from "@/app/actions/enquiry";
import { PublicEnquiryForm } from "@/components/enquiry/PublicEnquiryForm";
import { HomepageVaniSection } from "@/components/vani-public/HomepageVaniSection";
import { getPageContent } from "@/app/actions/cms";
import { useLivePreview } from "@/hooks/useLivePreview";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cmsData = useLivePreview("home");

  useEffect(() => {
    // Capture Email Magic Link sign-ins
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user?.email) {
        const userEmail = session.user.email;
        const userName = userEmail.includes('tyagi') ? 'Nitin Tyagi (Chairman)' : userEmail.split('@')[0];
        const userRole = userEmail.includes('tyagi') ? 'SUPER_ADMIN' : 'STAFF';

        localStorage.setItem('cb_auth_token', session.access_token || 'true');
        localStorage.setItem('cb_user_role', userRole);
        localStorage.setItem('cb_user_name', userName);
        localStorage.setItem('cb_user_email', userEmail);

        window.location.href = '/admin';
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await submitPublicEnquiry(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to submit enquiry.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Section 2: The Hero Section (First Impression) */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Cinematic Video Background Mockup */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="object-cover w-full h-full"
            poster={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"}
          >
            <source src={cmsData.hero?.video_url || "https://www.w3schools.com/html/mov_bbb.mp4"} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/70 to-transparent mix-blend-multiply" />
        </div>

        {/* Live Circular Ticker */}
        <div className="absolute top-24 left-0 w-full z-20 bg-accent/90 text-white overflow-hidden py-2 backdrop-blur-sm">
          <div className="whitespace-nowrap flex animate-[marquee_20s_linear_infinite]">
             <span className="mx-4 text-sm font-bold tracking-widest uppercase">{cmsData.hero?.ticker_text || "• ADMISSIONS OPEN FOR 2026-27 • K-12 EXPANSION IN PROGRESS • ROBOTICS LAB INAUGURATION NEXT WEEK •"}</span>
             <span className="mx-4 text-sm font-bold tracking-widest uppercase">{cmsData.hero?.ticker_text || "• ADMISSIONS OPEN FOR 2026-27 • K-12 EXPANSION IN PROGRESS • ROBOTICS LAB INAUGURATION NEXT WEEK •"}</span>
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 mt-12">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-[1.1] drop-shadow-lg">
              {cmsData.hero?.headline || "Inspiring Excellence."}<br/>
              <span className="text-secondary">{cmsData.hero?.subtext || "Nurturing Tomorrow."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-stone-200 mb-10 font-light leading-relaxed max-w-2xl drop-shadow-md">
              {cmsData.hero?.description || "Welcome to Crayon Box School—a modern, holistic learning ecosystem designed to help your child thrive in a rapidly evolving world."}
            </motion.p>
            
            {/* Quick Action Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Link href="/pay-fees" className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 group">
                <Layers className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Pay Fees</span>
              </Link>
              <Link href="/academics" className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 group">
                <BookOpen className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Syllabus</span>
              </Link>
              <Link href="/admissions/apply" className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 group">
                <CheckCircle2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Apply Now</span>
              </Link>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2 group">
                <Compass className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Campus Tour</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* School Metrics Grid */}
      <section className="py-12 bg-stone-900 border-y border-stone-800 text-white relative z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-stone-800">
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-black text-accent mb-2">{cmsData.metrics?.stat_1_val || "50+"}</h4>
              <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">{cmsData.metrics?.stat_1_label || "Acres Campus"}</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-black text-accent mb-2">{cmsData.metrics?.stat_2_val || "100%"}</h4>
              <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">{cmsData.metrics?.stat_2_label || "Board Results"}</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-black text-accent mb-2">{cmsData.metrics?.stat_3_val || "15:1"}</h4>
              <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">{cmsData.metrics?.stat_3_label || "Student-Teacher Ratio"}</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-black text-accent mb-2">{cmsData.metrics?.stat_4_val || "20+"}</h4>
              <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">{cmsData.metrics?.stat_4_label || "Sports Facilities"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Growth Announcement (K-8 to K-12 Roadmap) */}
      <section className="py-24 bg-white relative z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left: Overlapping Photo Gallery */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" as any }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 relative min-h-[500px]"
            >
              <div className="absolute top-0 left-0 w-3/4 aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl z-10">
                <Image src={cmsData.growth_announcement?.image_1 || "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"} alt="Middle school students" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-3/5 aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white z-20">
                <Image src={cmsData.growth_announcement?.image_2 || "https://images.unsplash.com/photo-1587691592099-24045742c181?q=80&w=2073&auto=format&fit=crop"} alt="Students collaborating" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              {/* Decorative Circle */}
              <div className="absolute top-1/2 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-10" />
            </motion.div>

            {/* Right: Typography & Callout */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="w-full lg:w-1/2"
            >
              <motion.span variants={fadeUp} className="text-secondary font-bold tracking-widest uppercase text-xs mb-4 block">Our Academic Journey</motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">{cmsData.growth_announcement?.title || "Growing Alongside Your Child."}</motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-stone-600 mb-8 leading-relaxed font-light">
                {cmsData.growth_announcement?.description || "Crayon Box School is currently a premier Kindergarten through Grade 8 (K-8) institution, providing a foundational environment where young minds feel secure, challenged, and deeply understood."}
              </motion.p>
              
              <motion.div variants={fadeUp} className="bg-stone-50 border-l-4 border-accent p-8 rounded-r-2xl mb-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Compass className="w-24 h-24" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2 relative z-10">The Future Vision</h3>
                <p className="text-stone-600 italic font-serif leading-relaxed relative z-10">
                  {cmsData.growth_announcement?.vision_quote || "“We are expanding our horizons. Crayon Box School is actively upgrading our infrastructure, faculty, and curriculum to become a comprehensive K-12 institution in the near future. Students joining us today will have the seamless opportunity to complete their entire high school journey within the campus they know and love.”"}
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-stone-800 text-sm">Currently K-8</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-stone-800 text-sm">Future K-12 Expansion</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-stone-800 text-sm">Seamless Transition</span>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 4: The Core Pillars (Why Choose Us) */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">{cmsData.why_us?.heading || "Why Choose Us"}</motion.h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded"></div>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card 1 */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">{cmsData.why_us?.feature_1_title || "Future-Ready Academics"}</h3>
              <p className="text-stone-600 leading-relaxed font-light">
                {cmsData.why_us?.feature_1_desc || "A dynamic curriculum blending traditional rigor with AI-integrated tools, coding, and critical thinking."}
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">{cmsData.why_us?.feature_2_title || "Safe & Smart Campus"}</h3>
              <p className="text-stone-600 leading-relaxed font-light">
                {cmsData.why_us?.feature_2_desc || "Equipped with real-time digital visitor logs, automated gate security, and comprehensive CCTV monitoring for absolute peace of mind."}
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">{cmsData.why_us?.feature_3_title || "360° Parent Transparency"}</h3>
              <p className="text-stone-600 leading-relaxed font-light">
                {cmsData.why_us?.feature_3_desc || "Stay connected with our live transport tracking, digital daily diaries, and seamless in-app fee management."}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 4.5: VANI 24/7 AI Admissions Receptionist */}
      <HomepageVaniSection />

      {/* Section 5: Admissions & Digital Onboarding (The Funnel) */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="w-full lg:w-5/12"
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">{cmsData.admissions_cta?.headline || "Begin Your Child's Journey With Us."}</motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-blue-100 mb-10 font-light leading-relaxed">
                {cmsData.admissions_cta?.description || "Admissions for the upcoming academic year are now open. Experience our paperless, hassle-free digital enrollment process."}
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link href="/admissions/apply" className="inline-block bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-orange-800 transition-all shadow-xl hover:-translate-y-1">
                  {cmsData.admissions_cta?.button_text || "Start Application"}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="w-full lg:w-7/12"
            >
              <div className="bg-white rounded-3xl p-2 sm:p-4 shadow-2xl text-slate-900 border border-slate-100">
                <PublicEnquiryForm />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 6: Testimonials & Trust Signals */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">{cmsData.testimonials?.heading || "What Our Parents Say"}</motion.h2>
            <div className="w-12 h-1 bg-secondary mx-auto rounded"></div>
          </motion.div>

          {/* Minimalist Carousel Placeholder (Static for now, but design implies sliding) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 mb-20"
          >
            <div className="bg-stone-50 p-10 rounded-3xl border border-stone-100 relative">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-stone-200" />
              <div className="flex text-accent mb-6">
                {[1,2,3,4,5].map(star => <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
              <p className="text-stone-600 italic leading-relaxed mb-6">{cmsData.testimonials?.t1_quote || "\"The teaching quality is outstanding, but what really impressed us is the absolute safety of the campus. The live bus tracking feature on the school app gives us incredible peace of mind every single day.\"\""}</p>
              <div>
                <h4 className="font-bold text-stone-900">{cmsData.testimonials?.t1_author || "Priya Sharma"}</h4>
                <p className="text-sm text-stone-500">{cmsData.testimonials?.t1_role || "Parent of Grade 4 Student"}</p>
              </div>
            </div>

            <div className="bg-stone-50 p-10 rounded-3xl border border-stone-100 relative">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-stone-200" />
              <div className="flex text-accent mb-6">
                {[1,2,3,4,5].map(star => <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
              <p className="text-stone-600 italic leading-relaxed mb-6">{cmsData.testimonials?.t2_quote || "\"Moving from paper forms to their digital enrollment and fee payment was seamless. Crayon Box truly operates like a modern, transparent institution that values parent time as much as student education.\""}</p>
              <div>
                <h4 className="font-bold text-stone-900">{cmsData.testimonials?.t2_author || "David & Emma Wilson"}</h4>
                <p className="text-sm text-stone-500">{cmsData.testimonials?.t2_role || "Parents of Grade 7 Student"}</p>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <div className="pt-12 border-t border-stone-200 text-center">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-8">Recognized For Excellence & Safety</h3>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="text-2xl font-black text-stone-800 tracking-tighter">Accredited <span className="font-light">Curriculum</span></div>
              <div className="text-2xl font-black text-stone-800 tracking-tighter">State <span className="font-light">Recognized</span></div>
              <div className="text-2xl font-black text-stone-800 tracking-tighter">ISO <span className="font-light">9001:2015</span></div>
              <div className="text-2xl font-black text-stone-800 tracking-tighter">Safety <span className="font-light">Certified</span></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
