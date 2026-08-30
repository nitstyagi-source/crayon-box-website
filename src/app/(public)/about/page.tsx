"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Beaker, Laptop, Heart, Users, ArrowRight } from "lucide-react";
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

export default function AboutUs() {
  const cmsData = useLivePreview("about");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Section 1: The Hero Header */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"} 
            alt="Campus Architecture" 
            fill sizes="(max-width: 768px) 100vw, 50vw" 
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/70 to-transparent mix-blend-multiply" />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              {cmsData.hero?.headline || "Shaping Minds."} <br/><span className="text-accent italic">{cmsData.hero?.subtext || "Coloring the Future."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-stone-200 font-light leading-relaxed border-l-4 border-accent pl-6">
              {cmsData.hero?.description || "More than a school—a canvas where every student discovers their unique potential."}
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative z-10 pb-12 flex flex-col items-center text-white/70"
        >
          <span className="text-xs uppercase tracking-widest font-bold mb-4">Explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 2: Our Philosophy (The "Crayon Box" Metaphor) */}
      <section className="py-32 bg-background relative z-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-12 relative inline-block">
              {cmsData.philosophy?.heading || "Why \"Crayon Box\"?"}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded"></div>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-2xl md:text-3xl font-serif italic text-stone-600 leading-relaxed font-light">
              {cmsData.philosophy?.quote || "“A crayon box holds an array of distinct colors, each unique, yet together capable of creating masterpieces. At Crayon Box School, we view our students through this exact lens. We don't believe in a one-size-fits-all education. Whether a child is an analytical thinker, a creative artist, or a natural athlete, our ecosystem is designed to nurture their individual brilliance and equip them for a dynamic world.”"}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Vision & Mission */}
      <section className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Vision - Left Side (Jewel-tone) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 bg-primary text-white p-16 md:p-24 flex flex-col justify-center relative overflow-hidden"
          style={{ backgroundColor: cmsData.vision_mission?.vision_bg_color || "#1e3a8a" }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 max-w-lg ml-auto">
            <h2 className="text-5xl font-serif font-bold mb-8 text-accent">{cmsData.vision_mission?.vision_headline || "Our Vision"}</h2>
            <p className="text-2xl font-light leading-relaxed text-blue-50">
              {cmsData.vision_mission?.vision_description || "To be a globally recognized institution that blends technological innovation with deep-rooted human values, empowering students to lead with empathy and intellect."}
            </p>
          </div>
        </motion.div>

        {/* Mission - Right Side (Crisp White) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 bg-white text-stone-900 p-16 md:p-24 flex flex-col justify-center"
          style={{ backgroundColor: cmsData.vision_mission?.mission_bg_color || "#ffffff" }}
        >
          <div className="max-w-lg mr-auto">
            <h2 className="text-5xl font-serif font-bold mb-8 text-primary">{cmsData.vision_mission?.mission_headline || "Our Mission"}</h2>
            <p className="text-2xl font-light leading-relaxed text-stone-600">
              {cmsData.vision_mission?.mission_description || "To provide a secure, inclusive, and challenging K-12 environment where modern pedagogy, robust infrastructure, and dedicated mentorship converge to build the leaders of tomorrow."}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Section 4: Leadership Desk (Building Trust) */}
      <section className="py-32 bg-stone-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full lg:w-5/12"
            >
              <div className="aspect-[3/4] relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.15)] bg-slate-900">
                <Image 
                  src={cmsData.director?.image_url || "/nitin-tyagi.jpg"} 
                  alt="Nitin Tyagi, Director" 
                  fill sizes="(max-width: 768px) 100vw, 50vw" 
                  className="object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="w-full lg:w-7/12"
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8">{cmsData.director?.headline || "A Message from the Director"}</motion.h2>
              
              <motion.div variants={fadeUp} className="space-y-6 text-lg font-light text-stone-700 leading-relaxed mb-12">
                <p>{cmsData.director?.p1 || "Welcome to Crayon Box School."}</p>
                <p>{cmsData.director?.p2 || "Education is not merely about imparting knowledge; it is about discovering the unique potential within every child. When we envisioned Crayon Box School, our goal was to create a vibrant, dynamic ecosystem—much like a box of crayons—where diverse talents, thoughts, and abilities are nurtured to create something truly extraordinary."}</p>
                <p>{cmsData.director?.p3 || "Currently, as a premier K-8 institution, we take immense pride in laying a robust foundation for our students during their most formative years. We have cultivated an environment that balances academic rigor with socio-emotional well-being, ensuring our primary and middle schoolers feel secure, challenged, and deeply understood. Through our integration of modern technology, experiential learning, and dedicated mentorship, we ensure every child is equipped with the critical thinking skills needed for a rapidly evolving world."}</p>
                <p>{cmsData.director?.p4 || "But our journey, much like your child’s, continues to grow. I am thrilled to share our active vision of expanding into a comprehensive K-12 institution. We are currently scaling our infrastructure, developing advanced scientific and digital laboratories, and broadening our exceptional faculty to accommodate senior secondary education. This strategic evolution ensures that the students who join our family today will enjoy a seamless, uninterrupted transition through high school, right here in the environment they trust."}</p>
                <p>{cmsData.director?.p5 || "We consider it a profound privilege to partner with parents in this educational journey. Together, let us continue to shape resilient, compassionate minds and color the future with purpose and brilliance."}</p>
              </motion.div>

              <motion.div variants={fadeUp} className="pt-2">
                {cmsData.director?.signature_url ? (
                  <Image src={cmsData.director.signature_url} alt="Director Signature" width={120} height={48} className="opacity-80 mb-2" />
                ) : (
                  <div className="text-2xl font-serif italic text-primary/80 font-bold tracking-wider mb-2 select-none">
                    Nitin Tyagi
                  </div>
                )}
                <h4 className="font-bold text-xl text-stone-900 font-serif">{cmsData.director?.author_name || "Nitin Tyagi"}</h4>
                <p className="text-secondary font-semibold text-sm tracking-widest uppercase">{cmsData.director?.author_role || "Director, Crayon Box School"}</p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 5: Our Journey & The Road to K-12 */}
      <section className="py-32 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-24">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">{cmsData.journey?.headline || "Our Journey & The Road to K-12"}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-stone-500 font-light max-w-2xl mx-auto">{cmsData.journey?.description || "A legacy of excellence, rooted in primary education, expanding to shape the leaders of tomorrow."}</motion.p>
          </motion.div>

          <div className="space-y-12">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row gap-8 items-start relative group">
              <div className="md:w-1/3 pt-6 text-left md:text-right">
                <span className="text-accent font-bold tracking-widest uppercase text-sm block mb-2">Past</span>
                <h3 className="text-3xl font-serif font-bold text-stone-900">{cmsData.journey?.past_title || "The Foundation"}</h3>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center pt-8">
                <div className="w-4 h-4 rounded-full bg-stone-300 group-hover:bg-accent transition-colors"></div>
                <div className="w-px h-full bg-stone-200 absolute top-12 bottom-0"></div>
              </div>
              <div className="md:w-2/3 bg-stone-50 p-10 rounded-3xl border border-stone-100 group-hover:shadow-lg transition-shadow">
                <p className="text-lg text-stone-600 font-light leading-relaxed">
                  {cmsData.journey?.past_desc || "Crayon Box School opens its doors with a mission to redefine early and primary education, establishing a reputation for safety, care, and foundational excellence."}
                </p>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row gap-8 items-start relative group">
              <div className="md:w-1/3 pt-6 text-left md:text-right">
                <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-2">Present</span>
                <h3 className="text-3xl font-serif font-bold text-stone-900">{cmsData.journey?.present_title || "Mastering Middle School"}</h3>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center pt-8">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(30,58,138,0.5)]"></div>
                <div className="w-px h-full bg-stone-200 absolute top-12 bottom-0"></div>
              </div>
              <div className="md:w-2/3 bg-stone-50 p-10 rounded-3xl border border-stone-100 shadow-md border-l-4 border-l-primary group-hover:shadow-xl transition-shadow">
                <p className="text-lg text-stone-600 font-light leading-relaxed">
                  {cmsData.journey?.present_desc || "Currently operating as a premier K-8 institution. We have integrated smart classrooms, AI-driven learning tools, and comprehensive sports facilities to nurture pre-teens during their most crucial developmental years."}
                </p>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row gap-8 items-start relative group">
              <div className="md:w-1/3 pt-6 text-left md:text-right">
                <span className="text-secondary font-bold tracking-widest uppercase text-sm block mb-2">The Near Future</span>
                <h3 className="text-3xl font-serif font-bold text-stone-900">{cmsData.journey?.future_title || "K-12 Campus Expansion"}</h3>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center pt-8">
                <div className="w-4 h-4 rounded-full bg-stone-300 group-hover:bg-secondary transition-colors"></div>
              </div>
              <div className="md:w-2/3 bg-secondary p-10 rounded-3xl text-white shadow-lg group-hover:shadow-2xl transition-shadow">
                <p className="text-lg text-blue-50 font-light leading-relaxed">
                  {cmsData.journey?.future_desc || "Actively upgrading our infrastructure, advanced science laboratories, and senior faculty recruitment. Students joining us today will have the distinct advantage of seamlessly transitioning into high school within the ecosystem they trust."}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 6: Our Core Pillars (How We Teach) */}
      <section className="py-32 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-20">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">{cmsData.pillars?.headline || "How We Teach"}</motion.h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded"></div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Beaker className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">{cmsData.pillars?.p1_title || "Experiential Learning"}</h3>
              <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.pillars?.p1_desc || "Moving beyond textbooks with hands-on labs, robotics, and project-based assessments."}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">{cmsData.pillars?.p2_title || "Tech-Enabled Campus"}</h3>
              <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.pillars?.p2_desc || "From our Parent App to Smart Boards, we use technology to enhance transparency and learning, not replace human connection."}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">{cmsData.pillars?.p3_title || "Holistic Well-being"}</h3>
              <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.pillars?.p3_desc || "Dedicated focus on socio-emotional health, physical fitness, and the arts."}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-stone-100 text-stone-800 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">{cmsData.pillars?.p4_title || "Exceptional Faculty"}</h3>
              <p className="text-stone-600 font-light text-sm leading-relaxed">{cmsData.pillars?.p4_desc || "Rigorously selected educators who undergo continuous professional development to stay ahead of global teaching standards."}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Call to Action (The Next Step) */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={cmsData.cta?.image_url || "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"}
            alt="Teacher interacting with smiling student"
            fill sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">{cmsData.cta?.headline || "Come See the Difference Yourself."}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-blue-100 font-light mb-12 leading-relaxed">
              {cmsData.cta?.description || "Words can only say so much. We invite you to walk our corridors, meet our faculty, and experience the energy of Crayon Box School."}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="px-8 py-4 bg-accent text-white font-bold rounded-full shadow-xl hover:bg-orange-800 transition-colors flex items-center justify-center gap-2">
                {cmsData.cta?.button_1_text || "Book a Campus Tour"} <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/admissions" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold rounded-full shadow-lg hover:bg-white/20 transition-colors">
                {cmsData.cta?.button_2_text || "Begin Admissions Process"}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
