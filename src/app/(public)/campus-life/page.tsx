"use client";

import Image from "next/image";
import Link from "next/link";
import { Laptop, BookOpen, Trophy, Construction, Code, Music, Speech, Leaf, CreditCard, Stethoscope, ShieldCheck, Bus, Cctv, Fingerprint, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getPageContent } from "@/app/actions/cms";
import { useLivePreview } from "@/hooks/useLivePreview";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function CampusLife() {
  const cmsData = useLivePreview("campus-life");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Section 1: The Hero Header (Energy & Engagement) */}
      <section className="py-24 pt-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto mb-16">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-stone-900 mb-6 tracking-tight">
              {cmsData.hero?.headline || "A Canvas for"} <span className="text-accent italic">{cmsData.hero?.subtext || "Every Talent."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-stone-600 font-light leading-relaxed">
              {cmsData.hero?.description || "At Crayon Box School, education doesn't stop when the bell rings. Discover a vibrant, secure, and inclusive campus where every student finds their space to shine."}
            </motion.p>
          </motion.div>

          {/* Masonry-style photo grid */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]"
          >
            <div className="md:col-span-2 relative rounded-[2rem] overflow-hidden group">
              <Image src={cmsData.hero?.image_1 || "https://images.unsplash.com/photo-1543269664-56d5d37dfcb6?q=80&w=2070&auto=format&fit=crop"} alt="Students laughing" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative h-1/2 rounded-[2rem] overflow-hidden group">
                <Image src={cmsData.hero?.image_2 || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"} alt="Sports" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="relative h-1/2 rounded-[2rem] overflow-hidden group">
                <Image src={cmsData.hero?.image_3 || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"} alt="Arts" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 1.5: 360 Virtual Tour */}
      <section className="py-24 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Take a 360° Virtual Tour</motion.h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded mb-6"></div>
            <motion.p variants={fadeUp} className="text-xl text-stone-600 font-light max-w-2xl mx-auto">
              Explore our beautiful campus from the comfort of your home. Navigate through classrooms, play areas, and facilities interactively.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
            className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl border border-stone-200"
          >
            <iframe 
              src="https://app.cloudpano.com/tours/Vy9N5qtnN_IM?sceneId=KDJnCrxzwA" 
              width="100%" 
              height="100%" 
              style={{ border: "none" }} 
              allow="vr; gyroscope; accelerometer; fullscreen" 
              allowFullScreen={true}
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Campus Infrastructure */}
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Spaces Designed for Discovery.</motion.h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded"></div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Card 1 */}
            <motion.div variants={fadeUp} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-shadow group">
              <div className="h-64 relative overflow-hidden">
                <Image src={cmsData.facilities?.smart_classrooms_img || "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"} alt="Smart Classrooms" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">Smart Classrooms & Maker Spaces</h3>
                </div>
                <p className="text-stone-600 font-light leading-relaxed">
                  Ergonomic seating, interactive smartboards, and flexible layouts that encourage collaboration and peer-to-peer learning.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeUp} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-shadow group">
              <div className="h-64 relative overflow-hidden">
                <Image src={cmsData.facilities?.knowledge_hub_img || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"} alt="Knowledge Hub" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">The Knowledge Hub</h3>
                </div>
                <p className="text-stone-600 font-light leading-relaxed">
                  A naturally lit, quiet sanctuary housing thousands of physical books, digital e-readers, and a seamless OPAC system for check-outs via Smart IDs.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeUp} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-shadow group">
              <div className="h-64 relative overflow-hidden">
                <Image src={cmsData.facilities?.sports_complex_img || "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2070&auto=format&fit=crop"} alt="Sports Complex" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">Sports & Athletics Complex</h3>
                </div>
                <p className="text-stone-600 font-light leading-relaxed">
                  Professional-grade courts for basketball, badminton, and a sprawling green field for football and track. We believe physical resilience builds mental fortitude.
                </p>
              </div>
            </motion.div>

            {/* Card 4 - K-12 Expansion */}
            <motion.div variants={fadeUp} className="bg-blue-50/50 rounded-[2rem] overflow-hidden shadow-sm border border-blue-100 hover:shadow-xl transition-shadow group relative">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Construction className="w-32 h-32 text-primary" />
              </div>
              <div className="p-8 h-full flex flex-col justify-center">
                <div className="inline-flex px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full w-max mb-6">Coming Soon</div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <h3 className="text-2xl font-serif font-bold text-stone-900">The K-12 Expansion</h3>
                </div>
                <p className="text-stone-600 font-light leading-relaxed relative z-10">
                  Currently under construction: We are expanding our footprint to include advanced Senior Secondary Science Labs (Physics, Chemistry, Biology), an upgraded robotics center, and a larger auditorium to support our growing K-12 student body.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Co-Curriculars & Clubs (The Colors of our Crayon Box) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Discover Your True Colors.</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-stone-600 font-light max-w-3xl mx-auto">
              We encourage students to explore beyond their comfort zones. Our diverse clubs ensure that every child—whether an artist, an athlete, or an engineer—finds their tribe.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Innovators */}
            <motion.div variants={fadeUp} className="text-center group cursor-pointer">
              <div className="w-40 h-40 mx-auto rounded-full bg-blue-50 relative overflow-hidden mb-6 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Image src={cmsData.clubs?.tech_img || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"} alt="Tech" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Code className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">The Tech Innovators</h3>
              <p className="text-sm text-stone-500 font-light">Coding, Robotics, and 3D Printing.</p>
            </motion.div>

            {/* Performers */}
            <motion.div variants={fadeUp} className="text-center group cursor-pointer">
              <div className="w-40 h-40 mx-auto rounded-full bg-orange-50 relative overflow-hidden mb-6 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Image src={cmsData.clubs?.performers_img || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop"} alt="Performers" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-accent/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Music className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">The Performers</h3>
              <p className="text-sm text-stone-500 font-light">Classical & contemporary dance, theater, and instrumental music.</p>
            </motion.div>

            {/* Orators */}
            <motion.div variants={fadeUp} className="text-center group cursor-pointer">
              <div className="w-40 h-40 mx-auto rounded-full bg-emerald-50 relative overflow-hidden mb-6 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Image src={cmsData.clubs?.orators_img || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"} alt="Orators" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Speech className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">The Orators</h3>
              <p className="text-sm text-stone-500 font-light">Model United Nations (MUN), debate club, and creative writing.</p>
            </motion.div>

            {/* Eco-Warriors */}
            <motion.div variants={fadeUp} className="text-center group cursor-pointer">
              <div className="w-40 h-40 mx-auto rounded-full bg-green-50 relative overflow-hidden mb-6 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Image src={cmsData.clubs?.eco_img || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"} alt="Eco" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-green-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">The Eco-Warriors</h3>
              <p className="text-sm text-stone-500 font-light">Sustainability club, campus gardening, and environmental drives.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Health, Nutrition & The Smart Campus */}
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-24">
            
            {/* Feature 1 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
              className="flex flex-col md:flex-row gap-12 items-center"
            >
              <motion.div variants={fadeUp} className="w-full md:w-1/2 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src={cmsData.services?.cafeteria_img || "https://images.unsplash.com/photo-1574880946059-fa64bfb422a5?q=80&w=2072&auto=format&fit=crop"} alt="Cashless Cafeteria" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </motion.div>
              <motion.div variants={fadeUp} className="w-full md:w-1/2">
                <div className="w-16 h-16 bg-white border border-stone-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-accent">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-6">The Cashless Cafeteria</h3>
                <p className="text-lg text-stone-600 font-light leading-relaxed">
                  Nutritious, hygienically prepared meals are a priority. With our Smart Wallet system, the campus is entirely cashless. Parents can top-up their child’s digital wallet, set daily spending limits, and even restrict certain allergens directly from the Parent App.
                </p>
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
              className="flex flex-col md:flex-row-reverse gap-12 items-center"
            >
              <motion.div variants={fadeUp} className="w-full md:w-1/2 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src={cmsData.services?.clinic_img || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"} alt="Wellness Clinic" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </motion.div>
              <motion.div variants={fadeUp} className="w-full md:w-1/2">
                <div className="w-16 h-16 bg-white border border-stone-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-secondary">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-6">The Wellness Clinic</h3>
                <p className="text-lg text-stone-600 font-light leading-relaxed">
                  A fully equipped, on-campus clinic staffed by a certified pediatric nurse. Through our digital health system, parents are instantly notified of any clinic visits, and all student allergy profiles and medical histories are securely maintained.
                </p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 5: Uncompromising Safety & Security */}
      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')] opacity-10 mix-blend-overlay" />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-16">Your Child’s Safety is Our Highest Priority.</motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 text-left">
              <motion.div variants={fadeUp} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Fingerprint className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2">Smart Gate Security</h4>
                  <p className="text-blue-200 font-light text-sm leading-relaxed">Multi-modal biometric/RFID check-ins and instant push notifications to parents upon campus entry and exit.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2">Visitor Management Kiosk</h4>
                  <p className="text-blue-200 font-light text-sm leading-relaxed">A strict, zero-unauthorized-entry policy utilizing our tablet-based digital visitor and host-approval system.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Bus className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2">Live Transport Tracking</h4>
                  <p className="text-blue-200 font-light text-sm leading-relaxed">GPS-enabled, AC school buses with dedicated attendants, allowing parents to track routes live on the school app.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Cctv className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2">360° CCTV Surveillance</h4>
                  <p className="text-blue-200 font-light text-sm leading-relaxed">Comprehensive, secure monitoring across all corridors, play areas, and campus perimeters.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 6: Traditions & Community (The School Spirit) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Traditions & Community</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-stone-600 font-light max-w-3xl mx-auto mb-16">
              From the exhilaration of Annual Sports Day to the creativity of our Cultural Fest and Science Exhibitions, we celebrate milestones that build lifelong memories and a deep sense of community among students, teachers, and parents.
            </motion.p>
            
            {/* Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div variants={fadeUp} className="aspect-square relative rounded-2xl overflow-hidden group">
                <Image src={cmsData.traditions?.sports_img || "https://images.unsplash.com/photo-1546410531-bea4cadafd56?q=80&w=2070&auto=format&fit=crop"} alt="Sports Day" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
              <motion.div variants={fadeUp} className="aspect-square relative rounded-2xl overflow-hidden group">
                <Image src={cmsData.traditions?.yoga_img || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop"} alt="Yoga" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
              <motion.div variants={fadeUp} className="aspect-square relative rounded-2xl overflow-hidden group">
                <Image src={cmsData.traditions?.fest_img || "https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=2070&auto=format&fit=crop"} alt="Cultural Fest" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
              <motion.div variants={fadeUp} className="aspect-square relative rounded-2xl overflow-hidden group">
                <Image src={cmsData.traditions?.exhibition_img || "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop"} alt="Exhibition" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Call to Action (Experience It) */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
            alt="School Campus Wide Shot"
            fill sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/80 mix-blend-multiply" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Step Into Our World.</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-stone-300 font-light mb-12 leading-relaxed">
              Experience the energy, safety, and innovation of Crayon Box School firsthand.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="px-8 py-4 bg-accent text-white font-bold rounded-full shadow-xl hover:bg-orange-800 transition-colors flex items-center justify-center gap-2">
                Book a Campus Tour <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/admissions" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold rounded-full shadow-lg hover:bg-white/20 transition-colors">
                Explore Admissions
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
