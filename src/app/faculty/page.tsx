"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Filter, Calendar, ArrowRight, ShieldCheck, Heart, Stethoscope, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageContent } from "@/app/actions/cms";
import { useLivePreview } from "@/hooks/useLivePreview";
import { createClient } from "@/lib/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function FacultyDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWing, setSelectedWing] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);
  const cmsData = useLivePreview("faculty");
  const supabase = createClient();

  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase.from('faculty_members').select('*').order('order_index', { ascending: true });
      if (data) setFacultyMembers(data);
    }
    fetchMembers();
  }, [supabase]);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      
      {/* Section 1: The Hero Header (The Mentors) */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"} 
            alt="Teachers collaborating" 
            fill sizes="(max-width: 768px) 100vw, 50vw" 
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent mix-blend-multiply" />
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              {cmsData.hero?.headline || "The Mentors Behind the"} <span className="text-accent italic">{cmsData.hero?.subtext || "Masterpieces."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-stone-200 font-light leading-relaxed border-l-4 border-accent pl-6">
              {cmsData.hero?.description || "Meet the dedicated educators, innovators, and guides who bring the colors of Crayon Box School to life every single day."}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 2: The Smart Search & Filter Bar */}
      <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200 shadow-sm py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by name, subject, or department..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              />
            </div>
            
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative w-full md:w-auto">
                <Filter className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select 
                  value={selectedWing}
                  onChange={(e) => setSelectedWing(e.target.value)}
                  className="w-full md:w-auto pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm appearance-none text-stone-600 font-bold"
                >
                  <option value="All">Filter by Wing</option>
                  <option value="Early Years">Early Years</option>
                  <option value="Primary (1-5)">Primary (1-5)</option>
                  <option value="Middle School (6-8)">Middle School (6-8)</option>
                  <option value="Senior Secondary">Senior Secondary (Upcoming K-12)</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
              
              <div className="relative w-full md:w-auto">
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full md:w-auto pl-6 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm appearance-none text-stone-600 font-bold"
                >
                  <option value="All">Filter by Department</option>
                  <option value="Languages">Languages</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                  <option value="Sports & Physical Education">Sports & PE</option>
                  <option value="Student Welfare">Student Welfare</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Leadership Team */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">The Leadership Team</motion.h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded"></div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { name: "Mr. Nitin Tyagi", title: "Director", credentials: "M.A. Education, B.Ed", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop" },
              { name: "Dr. Ananya Sharma", title: "Principal", credentials: "Ph.D. Child Psychology, M.Ed", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" }
            ].map((leader, idx) => (
              <motion.div variants={fadeUp} key={idx} className="bg-stone-50 rounded-[2.5rem] border border-stone-100 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative w-40 h-40 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-lg">
                  <Image src={leader.img} alt={leader.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-serif font-bold text-stone-900 mb-2">{leader.name}</h3>
                  <p className="text-accent font-bold uppercase tracking-widest text-sm mb-4">{leader.title}</p>
                  <p className="text-stone-500 font-light text-sm mb-6 flex items-center justify-center md:justify-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-stone-300 inline-block"></span>
                    {leader.credentials}
                  </p>
                  <button className="text-primary font-bold hover:text-blue-900 transition-colors flex items-center justify-center md:justify-start gap-2 mx-auto md:mx-0">
                    Read Full Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 4: The Faculty Grid */}
      <section className="py-24 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2 flex items-center gap-4">
              <span className="w-8 h-1 bg-primary rounded"></span> Teaching Staff
            </h2>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {facultyMembers.map((faculty, idx) => (
              <motion.div variants={fadeUp} key={faculty.id || idx} className="bg-white rounded-[2rem] overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300 group">
                <div className="relative aspect-[4/5] bg-stone-200 overflow-hidden">
                  <Image src={faculty.image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"} alt={faculty.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-orange-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
                      <Calendar className="w-4 h-4" /> Book PTM
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-1 font-serif">{faculty.name}</h3>
                  <p className="text-primary text-xs font-bold uppercase tracking-wider mb-4">{faculty.title}</p>
                  <p className="text-sm text-stone-600 font-medium mb-1">{faculty.department}</p>
                  <p className="text-xs text-stone-400">{faculty.bio}</p>
                </div>
              </motion.div>
            ))}
            
            {facultyMembers.length === 0 && (
              <div className="col-span-4 text-center py-12 text-stone-500">
                Loading faculty members from database...
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* Section 5: Student Welfare & Support Staff */}
      <section className="py-24 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Student Welfare & Support</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-stone-600 font-light max-w-2xl mx-auto">
              Our holistic care ecosystem ensures that every child is safe, healthy, and emotionally supported throughout their journey.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Counselors */}
            <motion.div variants={fadeUp} className="bg-stone-50 rounded-3xl p-8 border border-stone-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Counseling & SEN</h3>
              <p className="text-stone-500 font-light text-sm mb-6">Special Educators & Mental Health</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" alt="Counselor" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900 text-sm">Dr. Ritu Verma</p>
                    <p className="text-xs text-stone-500">Lead School Counselor</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Health & Wellness */}
            <motion.div variants={fadeUp} className="bg-stone-50 rounded-3xl p-8 border border-stone-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Health & Wellness</h3>
              <p className="text-stone-500 font-light text-sm mb-6">Resident Medical Staff</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop" alt="Nurse" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900 text-sm">Sister Mary Joseph</p>
                    <p className="text-xs text-stone-500">Pediatric Nurse</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeUp} className="bg-stone-50 rounded-3xl p-8 border border-stone-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-stone-200 text-stone-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Campus Security</h3>
              <p className="text-stone-500 font-light text-sm mb-6">Safety & Transport Management</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" alt="Security Head" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900 text-sm">Col. Vikram Singh (Retd.)</p>
                    <p className="text-xs text-stone-500">Head of Security & Transport</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Section 6: Future-Ready Expansion (Call for Educators) */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-6">We Are Expanding. Join Our Vision.</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-blue-100 font-light leading-relaxed mb-10">
              As Crayon Box School prepares for our comprehensive K-12 campus expansion, we are actively seeking passionate, highly qualified Senior Secondary educators and subject matter experts to join our growing family.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/careers" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-primary font-bold rounded-full shadow-xl hover:bg-stone-100 transition-colors">
                View Open Positions <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Parent Communication Policy (Footer Note) */}
      <section className="py-12 bg-stone-950 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs text-stone-400 font-light leading-relaxed">
            At Crayon Box School, we value open communication. For the security and privacy of our staff, direct phone numbers are not listed publicly. Current parents can communicate directly with teachers and schedule appointments via the Crayon Box Parent App messaging hub.
          </p>
        </div>
      </section>

    </div>
  );
}
