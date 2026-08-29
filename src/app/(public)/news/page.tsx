"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Download, Calendar, MapPin, PlayCircle, Newspaper, FileText, Search, Filter, Smartphone } from "lucide-react";

// Inline SVGs for social icons (lucide-react removed brand icons)
const Facebook = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Twitter = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Instagram = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const Linkedin = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
import { motion } from "framer-motion";
import { getPageContent } from "@/app/actions/cms";
import { useLivePreview } from "@/hooks/useLivePreview";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function NewsMedia() {
  const [activeGalleryTab, setActiveGalleryTab] = useState("All");
  const [articles, setArticles] = useState<any[]>([]);
  const cmsData = useLivePreview("news");
  const supabase = createClient();

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase.from('news_articles').select('*').eq('is_published', true).order('published_date', { ascending: false });
      if (data) setArticles(data);
    }
    fetchNews();
  }, [supabase]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Section 1: Featured Story (The Hero Header) */}
      <section className="pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[70vh] min-h-[500px] flex items-end group">
            <Image 
              src={cmsData.hero?.image_url || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop"} 
              alt="Featured Story" 
              fill sizes="(max-width: 768px) 100vw, 50vw" 
              className="object-cover group-hover:scale-105 transition-transform duration-1000" 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
            
            <div className="relative z-10 p-10 md:p-16 max-w-4xl">
              <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 bg-accent text-white font-bold text-xs uppercase tracking-widest rounded-full mb-6">
                {cmsData.hero?.tag || "Campus Expansion"}
              </motion.span>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                {cmsData.hero?.headline || "Breaking Ground: The Road to our K-12 Senior Wing Begins."}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-stone-300 font-light mb-8 leading-relaxed max-w-2xl">
                {cmsData.hero?.description || "Director Nitin Tyagi officially laid the foundation stone for our new state-of-the-art Senior Secondary Science and Robotics Block, marking the beginning of our highly anticipated K-12 expansion."}
              </motion.p>
              <motion.div variants={fadeUp}>
                <button className="px-8 py-4 bg-white text-stone-900 font-bold rounded-full hover:bg-stone-200 transition-colors flex items-center gap-2">
                  Read Full Story <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: The Digital Noticeboard (Circulars & Announcements) */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2">Digital Noticeboard</h2>
                <p className="text-stone-600 font-light">Official circulars, academic schedules, and holiday announcements.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search notices..." className="pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 shadow-sm" />
                </div>
                <button className="px-4 py-3 bg-white border border-stone-200 rounded-full text-stone-600 flex items-center gap-2 hover:bg-stone-100 transition-colors shadow-sm">
                  <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filter</span>
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3 shadow-sm">
              <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-relaxed font-light">
                <strong className="font-semibold">Note:</strong> For real-time push notifications regarding emergency closures or transport delays, ensure your Crayon Box Parent App is updated.
              </p>
            </motion.div>

            {/* Digital Noticeboard Mockup */}
            <motion.div variants={fadeUp} className="bg-[#fcfbf9] rounded-[2rem] border-2 border-[#e6e2d8] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative">
              {/* Noticeboard Header/Pin */}
              <div className="absolute top-0 left-0 w-full h-8 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] border-b-2 border-[#e6e2d8]/60 flex items-center justify-center opacity-70">
                <div className="w-32 h-1 bg-stone-300 rounded-full"></div>
              </div>
              
              <div className="overflow-x-auto mt-8 p-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse border-spacing-y-2">
                  <thead className="sticky top-0 bg-[#fcfbf9] z-10 shadow-sm">
                    <tr className="text-stone-500 text-xs uppercase tracking-widest">
                      <th className="p-6 font-bold w-32">Date</th>
                      <th className="p-6 font-bold">Notice Title</th>
                      <th className="p-6 font-bold w-48">Audience</th>
                      <th className="p-6 font-bold text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-4">
                    {(cmsData.notices || [
                      { date: 'Aug 18, 2026', title: 'Winter Uniform Guidelines for K-8', aud: 'Grades Pre-K to 8', tag: 'General', new: true },
                      { date: 'Aug 15, 2026', title: 'Term 1 Examination Schedule Published', aud: 'Grades 6 to 8', tag: 'Academics', new: false },
                      { date: 'Aug 10, 2026', title: 'Transport Route Changes for Sector 4', aud: 'Bus Route 04 Parents', tag: 'Transport', new: false },
                      { date: 'Aug 05, 2026', title: 'Call for Registrations: Inter-School MUN', aud: 'Grades 7 to 8', tag: 'Co-Curricular', new: false },
                      { date: 'Jul 30, 2026', title: 'Parent-Teacher Meeting (PTM) Setup', aud: 'All Grades', tag: 'Events', new: false },
                    ]).map((notice: any, idx: number) => (
                      <tr key={idx} className="bg-white hover:bg-orange-50/50 transition-colors group shadow-sm border border-stone-100 rounded-xl relative">
                        <td className="p-6 text-sm text-stone-500 whitespace-nowrap align-top">
                          {notice.date}
                        </td>
                        <td className="p-6 align-top">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-stone-900 font-bold">{notice.title}</p>
                            {notice.new && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full animate-pulse">New</span>}
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs border border-stone-200">{notice.tag}</span>
                        </td>
                        <td className="p-6 text-sm text-stone-600 align-top">{notice.aud}</td>
                        <td className="p-6 text-right align-top">
                          <button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-primary hover:bg-primary hover:text-white transition-colors shadow-sm">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Upcoming Events (Interactive Calendar) */}
      <section className="py-24 bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="flex flex-col lg:flex-row gap-16">
            
            <motion.div variants={fadeUp} className="w-full lg:w-1/3">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">Upcoming Events</h2>
              <p className="text-stone-600 font-light mb-8">Stay up to date with the latest workshops, cultural fests, and academic symposiums.</p>
              
              {/* Interactive Visual Mini-Calendar Mockup */}
              <div className="bg-white border border-stone-200 shadow-xl rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold text-lg text-stone-900 font-serif">August 2026</h4>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors">&lt;</button>
                    <button className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors">&gt;</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm">
                  {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-stone-400 font-bold text-xs">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const isEvent = [15, 22, 28].includes(i+1);
                    return (
                      <div key={i} className={`relative py-2 rounded-full cursor-pointer transition-all duration-300 ${isEvent ? 'bg-primary text-white font-bold shadow-md hover:scale-110 hover:bg-blue-800' : 'text-stone-700 hover:bg-stone-100 font-medium'}`}>
                        {i+1}
                        {isEvent && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-4 text-xs font-medium text-stone-500">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full"></div> School Event</span>
                  <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-stone-300 rounded-full"></div> Holiday</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={stagger} className="w-full lg:w-2/3 space-y-6">
              {(cmsData.events || [
                { date: 'AUG 15', title: 'Independence Day Flag Hoisting', time: '08:00 AM - 10:00 AM', loc: 'Main Sports Ground' },
                { date: 'AUG 22', title: 'Inter-House Debate Competition', time: '09:00 AM - 01:00 PM', loc: 'School Auditorium' },
                { date: 'AUG 28', title: 'Annual Science Exhibition (Grades 5-8)', time: '10:00 AM - 02:00 PM', loc: 'Science Block' },
                { date: 'SEP 05', title: 'Teacher\'s Day Cultural Celebration', time: '11:00 AM - 01:30 PM', loc: 'Open Air Theater' },
              ]).map((evt: any, idx: number) => (
                <motion.div variants={fadeUp} key={idx} className="bg-white border border-stone-200 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                  <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-blue-50 text-primary shrink-0 border border-blue-100 group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                    <span className="text-xs font-bold uppercase tracking-widest">{evt.date.split(' ')[0]}</span>
                    <span className="text-3xl font-black leading-none mt-1">{evt.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold font-serif text-stone-900 mb-3 group-hover:text-primary transition-colors">{evt.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-stone-500 mb-6">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-stone-400"/> {evt.time}</span>
                      <span className="hidden sm:block text-stone-300">|</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-400"/> {evt.loc}</span>
                    </div>
                    <div className="flex gap-3">
                      <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-blue-900 border border-primary/20 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors">Add to Calendar +</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              <motion.div variants={fadeUp} className="pt-8 text-center md:text-left">
                <button className="text-stone-500 font-bold hover:text-primary transition-colors flex items-center gap-2 mx-auto md:mx-0 px-6 py-3 border border-stone-200 rounded-full hover:border-primary">
                  View Full Academic Calendar <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Section 4: The Crayon Box Gallery Link */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">The Crayon Box Gallery</h2>
            <p className="text-xl text-stone-600 font-light mb-10">
              Explore the vibrant moments, events, and milestones that shape our school community in our new dedicated gallery.
            </p>
            <Link href="/gallery" className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-orange-800 transition-colors shadow-lg hover:shadow-xl">
              View Full Gallery <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Voices of Crayon Box (School Blog & Newsletters) */}
      <section className="py-24 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Voices of Crayon Box</motion.h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Blog Posts Grid */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((blog, idx) => (
                <motion.div variants={fadeUp} key={blog.id || idx} className="group cursor-pointer">
                  <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-sm">
                    <Image src={blog.image_url || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent mb-3 block">{blog.category || "General"}</span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3 group-hover:text-primary transition-colors">{blog.title}</h3>
                  <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">{blog.published_date || new Date(blog.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
              {articles.length === 0 && (
                <div className="col-span-2 text-center py-12 text-stone-500">
                  Loading latest news and articles...
                </div>
              )}
            </motion.div>

            {/* Newsletter Archive Sidebar */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:col-span-1">
              <div className="bg-stone-50 border border-stone-200 rounded-[2rem] p-8 sticky top-24">
                <div className="w-12 h-12 bg-white border border-stone-200 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <Newspaper className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Newsletter Archive</h3>
                <p className="text-stone-600 font-light text-sm mb-8">Download previous editions of our monthly digital newsletter.</p>
                
                <ul className="space-y-4">
                  {['July 2026 Edition', 'June 2026 Edition', 'May 2026 Edition'].map((nl, idx) => (
                    <li key={idx}>
                      <button className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-primary hover:text-primary transition-colors group">
                        <span className="font-bold text-sm text-stone-700 group-hover:text-primary">{nl}</span>
                        <Download className="w-4 h-4 text-stone-400 group-hover:text-primary" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 6: Press & Recognition (Trust Signals) */}
      <section className="py-24 bg-stone-900 text-white border-b border-stone-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center">
            <motion.h3 variants={fadeUp} className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-12">Press & Recognition</motion.h3>
            
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { pub: "The Education Times", quote: "Ranked Top 10 Emerging Schools for Digital Innovation in the region." },
                { pub: "National Parent Review", quote: "A gold standard in campus safety and holistic student well-being." },
                { pub: "Future Schools Board", quote: "Awarded Excellence in Co-Curricular & STEM Education 2025." }
              ].map((press, idx) => (
                <div key={idx} className="p-8 bg-stone-800/50 rounded-3xl border border-stone-700/50 hover:bg-stone-800 transition-colors">
                  <div className="flex justify-center mb-6 text-stone-500">
                    <FileText className="w-10 h-10" />
                  </div>
                  <p className="font-serif italic text-lg leading-relaxed mb-6 text-stone-300">"{press.quote}"</p>
                  <p className="font-bold text-accent uppercase tracking-widest text-xs">{press.pub}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 7: Stay Connected (Footer Call to Action) */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold mb-6">Don't Miss a Moment.</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-blue-100 font-light leading-relaxed mb-10">
              Subscribe to our digital newsletter or follow our social channels to see the colors of Crayon Box School unfold every day.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex max-w-md mx-auto mb-12">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-white/10 border border-white/20 rounded-l-full px-6 py-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button className="bg-accent text-white px-8 py-4 rounded-r-full font-bold hover:bg-orange-800 transition-colors shrink-0">
                Subscribe
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex justify-center gap-6">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:-translate-y-1 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
