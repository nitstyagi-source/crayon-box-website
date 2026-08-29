"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Filter, Calendar, ArrowRight, ShieldCheck, Heart, Stethoscope, ChevronRight, GraduationCap, BookOpen, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageContent } from "@/app/actions/cms";
import { useLivePreview } from "@/hooks/useLivePreview";
import { getPublicFacultyMembers } from "@/app/actions/faculty";

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
  const [isLoading, setIsLoading] = useState(true);
  const cmsData = useLivePreview("faculty");

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true);
      try {
        const res = await getPublicFacultyMembers();
        if (res.success && res.data) {
          setFacultyMembers(res.data);
        }
      } catch (e) {
        console.error("Failed to load public faculty:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const leadershipMembers = facultyMembers.filter(f => f.is_leadership);
  
  const filteredTeachingFaculty = facultyMembers.filter(faculty => {
    if (faculty.is_leadership) return false;
    
    // Search match
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const fullName = `${faculty.first_name} ${faculty.middle_name || ''} ${faculty.last_name}`.toLowerCase();
      const match = (
        fullName.includes(term) ||
        (faculty.designation && faculty.designation.toLowerCase().includes(term)) ||
        (faculty.subjects_taught && faculty.subjects_taught.toLowerCase().includes(term)) ||
        (faculty.department && faculty.department.toLowerCase().includes(term))
      );
      if (!match) return false;
    }

    // Wing match
    if (selectedWing !== "All") {
      if (faculty.wing !== selectedWing && faculty.wing !== "All Wings") {
        return false;
      }
    }

    // Department match
    if (selectedDept !== "All") {
      if (faculty.department !== selectedDept) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      
      {/* Section 1: The Hero Header */}
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

      {/* Section 2: Search & Filters Bar */}
      <section className="sticky top-20 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-200 shadow-sm py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-1/2">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by mentor name, subject, or specialization..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm font-medium"
                />
              </div>
              
              <div className="relative w-full md:w-auto">
                <Filter className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select 
                  value={selectedWing}
                  onChange={(e) => setSelectedWing(e.target.value)}
                  className="w-full md:w-auto pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm appearance-none text-stone-700 font-bold"
                >
                  <option value="All">Filter by Wing</option>
                  <option value="Early Years">Early Years</option>
                  <option value="Primary (1-5)">Primary (1-5)</option>
                  <option value="Middle School (6-8)">Middle School (6-8)</option>
                  <option value="Senior Secondary">Senior Secondary (Upcoming K-12)</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mr-2">Departments:</span>
              {["All", "Sciences & Robotics", "Mathematics", "Early Childhood Education", "Languages", "Arts & Humanities", "Sports & Physical Education", "Student Welfare"].map(dept => (
                <button 
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedDept === dept 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white text-stone-600 border-stone-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Leadership Team */}
      {leadershipMembers.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">The Leadership Team</motion.h2>
              <div className="w-16 h-1 bg-secondary mx-auto rounded"></div>
              <p className="text-stone-500 text-sm mt-3 max-w-md mx-auto">Guiding institutional excellence and nurturing lifelong learners.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {leadershipMembers.map((leader) => (
                <motion.div 
                  variants={fadeUp} 
                  key={leader.id} 
                  className="bg-stone-50 rounded-[2.5rem] border border-stone-100 p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative w-36 h-36 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md">
                    <img 
                      src={leader.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop"} 
                      alt={`${leader.first_name} ${leader.last_name}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h3 className="text-2xl font-serif font-bold text-stone-900">{leader.first_name} {leader.last_name}</h3>
                      <span className="bg-amber-100 text-amber-800 p-1 rounded-full text-xs" title="Institutional Leader">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </span>
                    </div>
                    <p className="text-accent font-bold uppercase tracking-widest text-xs mb-3">{leader.designation || leader.role}</p>
                    
                    {leader.qualification && (
                      <p className="text-stone-500 font-medium text-xs mb-2 flex items-center justify-center sm:justify-start gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                        {leader.qualification}
                      </p>
                    )}

                    {leader.bio && (
                      <p className="text-stone-600 text-xs font-light leading-relaxed mb-4">
                        {leader.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Section 4: The Faculty & Mentors Grid */}
      <section className="py-20 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded"></span> Teaching Faculty & Mentors
              </h2>
              <p className="text-stone-500 text-sm">Showing {filteredTeachingFaculty.length} educators specialized in progressive learning.</p>
            </div>

            {selectedDept !== "All" && (
              <button 
                onClick={() => { setSelectedDept("All"); setSelectedWing("All"); setSearchQuery(""); }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {filteredTeachingFaculty.map((faculty) => (
              <motion.div 
                variants={fadeUp} 
                key={faculty.id} 
                className="bg-white rounded-[2rem] overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                    <img 
                      src={faculty.photo_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"} 
                      alt={`${faculty.first_name} ${faculty.last_name}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {faculty.wing || 'Academics'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <Link 
                        href="/contact"
                        className="w-full bg-accent hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-lg"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book Parent Appointment
                      </Link>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-serif">{faculty.first_name} {faculty.last_name}</h3>
                      <p className="text-primary text-xs font-bold uppercase tracking-wider">{faculty.designation || faculty.role}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                      <p className="font-medium text-stone-800 text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                        {faculty.department}
                      </p>

                      {faculty.qualification && (
                        <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                          <GraduationCap className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{faculty.qualification}</span>
                        </p>
                      )}

                      {faculty.subjects_taught && (
                        <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{faculty.subjects_taught}</span>
                        </p>
                      )}

                      {faculty.is_class_teacher && faculty.class_teacher_for && (
                        <span className="inline-block bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-100 mt-1">
                          In-Charge: {faculty.class_teacher_for}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredTeachingFaculty.length === 0 && (
              <div className="col-span-4 text-center py-16 bg-white rounded-3xl border border-stone-200">
                <p className="text-stone-500 font-bold text-sm">No educators found matching this filter.</p>
                <button 
                  onClick={() => { setSelectedDept("All"); setSelectedWing("All"); setSearchQuery(""); }}
                  className="mt-2 text-xs font-bold text-primary hover:underline"
                >
                  Reset filters to view all faculty
                </button>
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* Section 5: Student Welfare & Support Staff */}
      <section className="py-20 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Student Welfare & Support</motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-stone-600 font-light max-w-2xl mx-auto">
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

      {/* Section 6: Future-Ready Expansion */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-4">We Are Expanding. Join Our Vision.</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-blue-100 font-light leading-relaxed mb-8">
              As Crayon Box School prepares for our comprehensive K-12 campus expansion, we are actively seeking passionate educators and subject matter experts to join our growing family.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/careers" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-full shadow-xl hover:bg-stone-100 transition-colors text-sm">
                View Open Positions <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Parent Communication Policy */}
      <section className="py-10 bg-stone-950 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs text-stone-400 font-light leading-relaxed">
            At Crayon Box School, we value open communication. For staff security, direct phone numbers are not listed publicly. Current parents can schedule appointments or communicate directly via the Crayon Box Parent Portal messaging hub.
          </p>
        </div>
      </section>

    </div>
  );
}
