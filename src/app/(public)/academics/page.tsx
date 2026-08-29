"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Monitor, Users, CheckCircle2, ChevronRight, BookOpen, Microscope, GraduationCap, Palette, Dumbbell, Globe, Smartphone, Download, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useLivePreview } from "@/hooks/useLivePreview";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Academics() {
  const cmsData = useLivePreview("academics");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Section 1: The Hero Section (Focus & Intent) */}
      <section className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" as any }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop"}
            alt="Teacher and student collaborating"
            fill sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {/* Subtle navy-blue gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 mix-blend-multiply" />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10 flex-grow flex flex-col justify-center mt-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-2xl tracking-tight leading-[1.1]">
              {cmsData.hero?.headline || "Cultivating Intellect."} <br/>
              <span className="text-secondary italic">{cmsData.hero?.subtext || "Empowering Futures."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-stone-200 mb-10 font-light leading-relaxed max-w-2xl drop-shadow-md">
              {cmsData.hero?.description || "Our curriculum is designed to challenge, inspire, and prepare students for the complexities of tomorrow."}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 2: The "Crayon Box" Pedagogy (Our Approach) */}
      <section className="py-24 bg-white relative z-20 -mt-10 border-t border-stone-100 rounded-t-[3rem]">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">{cmsData.pedagogy?.tagline || "Our Pedagogy"}</motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">{cmsData.pedagogy?.headline || "The \"Crayon Box\" Approach"}</motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {/* Block 1 */}
            <motion.div variants={fadeUp} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">{cmsData.pedagogy?.p1_title || "Inquiry-Based Learning"}</h3>
              <p className="text-stone-600 font-light leading-relaxed">
                {cmsData.pedagogy?.p1_desc || "Moving beyond rote memorization. We encourage students to ask questions, hypothesize, and discover answers through hands-on exploration."}
              </p>
            </motion.div>

            {/* Block 2 */}
            <motion.div variants={fadeUp} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-emerald-50 text-secondary rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-sm">
                <Monitor className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">{cmsData.pedagogy?.p2_title || "Tech-Integrated Classrooms"}</h3>
              <p className="text-stone-600 font-light leading-relaxed">
                {cmsData.pedagogy?.p2_desc || "Equipped with smartboards and digital learning modules, our classrooms use technology to amplify learning and digital literacy, not replace human connection."}
              </p>
            </motion.div>

            {/* Block 3 */}
            <motion.div variants={fadeUp} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-orange-50 text-accent rounded-full flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-sm">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">{cmsData.pedagogy?.p3_title || "Differentiated Instruction"}</h3>
              <p className="text-stone-600 font-light leading-relaxed">
                {cmsData.pedagogy?.p3_desc || "Recognizing that every child learns differently. Our educators adapt their teaching strategies to support visual, auditory, and kinesthetic learners."}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: The Academic Journey (Progression) */}
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-24">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">{cmsData.journey?.headline || "The Academic Journey"}</motion.h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded"></div>
          </motion.div>

          <div className="space-y-32">
            
            {/* 1. Early Years */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="flex flex-col md:flex-row gap-12 items-center">
              <motion.div variants={fadeUp} className="w-full md:w-1/2 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src={cmsData.journey?.early_image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"} alt="Early Years Classroom" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <motion.div variants={fadeUp} className="w-full md:w-1/2">
                <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">Pre-K & Kindergarten</span>
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">{cmsData.journey?.early_title || "Early Years"}</h3>
                <p className="text-lg text-stone-600 font-light mb-6 leading-relaxed">
                  <strong className="font-semibold text-stone-800">Focus:</strong> {cmsData.journey?.early_focus || "Foundational literacy, numeracy, and socio-emotional development."}
                </p>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent"/> Curriculum Focus</h4>
                  <p className="text-stone-600 font-light leading-relaxed">{cmsData.journey?.early_curriculum || "Play-based learning, phonics, fine/gross motor skill development, and creative expression through art and music."}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* 2. Primary School */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="flex flex-col md:flex-row-reverse gap-12 items-center">
              <motion.div variants={fadeUp} className="w-full md:w-1/2 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src={cmsData.journey?.primary_image || "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop"} alt="Primary School Students" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <motion.div variants={fadeUp} className="w-full md:w-1/2">
                <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Grades 1 to 5</span>
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">{cmsData.journey?.primary_title || "Primary School"}</h3>
                <p className="text-lg text-stone-600 font-light mb-6 leading-relaxed">
                  <strong className="font-semibold text-stone-800">Focus:</strong> {cmsData.journey?.primary_focus || "Building strong academic fundamentals and fostering curiosity."}
                </p>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary"/> Curriculum Focus</h4>
                  <p className="text-stone-600 font-light leading-relaxed">{cmsData.journey?.primary_curriculum || "Core subjects (Mathematics, Sciences, Languages) introduced through project-based learning. Introduction to basic computer science, environmental awareness, and structured physical education."}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* 3. Middle School */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="flex flex-col md:flex-row gap-12 items-center">
              <motion.div variants={fadeUp} className="w-full md:w-1/2 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src={cmsData.journey?.middle_image || "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"} alt="Middle School Robotics" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
              </motion.div>
              <motion.div variants={fadeUp} className="w-full md:w-1/2">
                <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Grades 6 to 8</span>
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">{cmsData.journey?.middle_title || "Middle School"}</h3>
                <p className="text-lg text-stone-600 font-light mb-6 leading-relaxed">
                  <strong className="font-semibold text-stone-800">Focus:</strong> {cmsData.journey?.middle_focus || "Analytical thinking, independence, and real-world application."}
                </p>
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Microscope className="w-5 h-5 text-secondary"/> Curriculum Focus</h4>
                  <p className="text-stone-600 font-light leading-relaxed">{cmsData.journey?.middle_curriculum || "Advanced sciences (Physics, Chemistry, Biology), Algebra/Geometry, intensive language arts, coding, financial literacy, and debate. Preparation for high-school level rigor."}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* 4. The High School Expansion */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} 
              className="bg-blue-50/50 p-10 md:p-16 rounded-[3rem] border border-blue-200/50 shadow-[0_0_40px_rgba(30,58,138,0.05)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <GraduationCap className="w-48 h-48 text-primary" />
              </div>
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold text-xs uppercase tracking-widest mb-6">Coming Soon</span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">{cmsData.journey?.high_title || "The High School Expansion (Grades 9 to 12)"}</h3>
                <p className="text-xl text-stone-600 font-light mb-8 leading-relaxed">
                  <strong className="font-semibold text-stone-800">Focus:</strong> {cmsData.journey?.high_focus || "Seamless transition to board examinations and university readiness."}
                </p>
                <p className="text-lg text-stone-600 font-light leading-relaxed max-w-3xl mx-auto">
                  {cmsData.journey?.high_desc || "We are currently upgrading our campus infrastructure, including advanced laboratories and specialized faculty, to offer a comprehensive K-12 curriculum. Our middle schoolers will smoothly transition into high school without changing their educational home."}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 4: Beyond the Core (21st-Century Skills) */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">{cmsData.beyond_core?.headline || "Education Beyond the Textbook."}</motion.h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded"></div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* STEM */}
            <motion.div variants={fadeUp} className="group overflow-hidden rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative overflow-hidden">
                <Image src={cmsData.beyond_core?.stem_image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"} alt="STEM" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-6">
                  <h3 className="text-white font-bold text-xl flex items-center gap-2"><Monitor className="w-5 h-5"/> {cmsData.beyond_core?.stem_title || "STEM & Robotics"}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.beyond_core?.stem_desc || "Dedicated maker-spaces where students design, code, and build."}</p>
              </div>
            </motion.div>

            {/* Linguistics */}
            <motion.div variants={fadeUp} className="group overflow-hidden rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative overflow-hidden">
                <Image src={cmsData.beyond_core?.ling_image || "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"} alt="Linguistics" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-6">
                  <h3 className="text-white font-bold text-xl flex items-center gap-2"><Globe className="w-5 h-5"/> {cmsData.beyond_core?.ling_title || "Linguistic Excellence"}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.beyond_core?.ling_desc || "Multi-language options and communication labs for global readiness."}</p>
              </div>
            </motion.div>

            {/* Arts */}
            <motion.div variants={fadeUp} className="group overflow-hidden rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative overflow-hidden">
                <Image src={cmsData.beyond_core?.arts_image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"} alt="Arts" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-6">
                  <h3 className="text-white font-bold text-xl flex items-center gap-2"><Palette className="w-5 h-5"/> {cmsData.beyond_core?.arts_title || "Visual & Performing"}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.beyond_core?.arts_desc || "Unlocking the \"colors\" in our Crayon Box through theater, dance, and fine arts."}</p>
              </div>
            </motion.div>

            {/* PE */}
            <motion.div variants={fadeUp} className="group overflow-hidden rounded-3xl bg-stone-50 border border-stone-100 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative overflow-hidden">
                <Image src={cmsData.beyond_core?.pe_image || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"} alt="Physical Education" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-6">
                  <h3 className="text-white font-bold text-xl flex items-center gap-2"><Dumbbell className="w-5 h-5"/> {cmsData.beyond_core?.pe_title || "Physical Education"}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.beyond_core?.pe_desc || "Fostering discipline, teamwork, and resilience through structured sports programs."}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Assessment & Parent Transparency */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="w-full lg:w-1/2"
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">{cmsData.assessment?.headline || "Continuous Evaluation."} <br/><span className="text-accent">{cmsData.assessment?.subheadline || "Complete Transparency."}</span></motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-blue-100 font-light mb-10 leading-relaxed">
                {cmsData.assessment?.description || "We believe assessments should guide learning, not just grade it. We utilize Continuous and Comprehensive Evaluation (CCE) to track both academic and non-academic growth."}
              </motion.p>
              
              <motion.ul variants={stagger} className="space-y-6">
                {[
                  cmsData.assessment?.point1 || 'Regular formative assessments rather than high-stakes annual exams.',
                  cmsData.assessment?.point2 || 'Real-time gradebook and attendance tracking via our Parent App.',
                  cmsData.assessment?.point3 || 'Detailed, personalized feedback from teachers during interactive PTMs (Parent-Teacher Meetings).'
                ].map((item, idx) => (
                  <motion.li variants={fadeUp} key={idx} className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-50 leading-relaxed font-light">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="relative w-72 h-[600px] bg-stone-900 rounded-[3rem] border-[12px] border-stone-800 shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
                <div className="absolute top-0 inset-x-0 h-6 bg-stone-800 z-20 rounded-b-xl mx-16"></div>
                
                {/* Mockup Screen Content */}
                <div className="flex-1 bg-stone-50 overflow-hidden relative">
                  <div className="bg-primary p-6 pt-12 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">Crayon Box App</h4>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <UserPlus className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-200">Arjun Sharma - Grade 6A</p>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                      <p className="text-xs text-stone-500 font-bold uppercase mb-1">Latest Assessment</p>
                      <h5 className="font-bold text-stone-900">Mathematics Quiz #3</h5>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-secondary"></div>
                        </div>
                        <span className="text-xs font-bold text-secondary">A-</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                      <p className="text-xs text-stone-500 font-bold uppercase mb-1">Attendance</p>
                      <h5 className="font-bold text-stone-900">95% Present</h5>
                      <div className="mt-2 text-xs text-stone-500">Last absent: 12th Oct</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                      <p className="text-xs text-stone-500 font-bold uppercase mb-1">Teacher Feedback</p>
                      <p className="text-xs text-stone-600 leading-relaxed italic">"Arjun showed excellent problem-solving skills in today's robotics lab."</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 6: Action & Resources (Footer/CTA) */}
      <section className="py-24 bg-stone-950 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl font-serif font-bold mb-10">{cmsData.cta?.headline || "Explore Our Curriculum in Detail."}</motion.h2>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> {cmsData.cta?.button1_text || "Download Academic Syllabus"}
              </button>
              <button className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Users className="w-5 h-5" /> {cmsData.cta?.button2_text || "View Faculty Directory"}
              </button>
            </motion.div>
            
            <motion.div variants={fadeUp} className="mt-10">
              <Link href="/admissions" className="inline-block px-10 py-5 bg-accent text-white font-bold text-lg rounded-full shadow-lg shadow-accent/20 hover:bg-orange-800 transition-all hover:-translate-y-1">
                {cmsData.cta?.button3_text || "Begin Admissions Application"}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
