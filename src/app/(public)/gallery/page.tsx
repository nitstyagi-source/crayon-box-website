"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { PlayCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const supabase = createClient();
  const cmsData = useLivePreview("gallery");

  useEffect(() => {
    async function fetchGallery() {
      const { data } = await supabase.from('gallery_media').select('*').eq('is_published', true).order('order_index', { ascending: true });
      if (data) setMediaItems(data);
    }
    fetchGallery();
  }, [supabase]);

  const tabs = ["All", "Sports & Athletics", "Arts & Culture", "Academics & Labs", "Campus Expansion Updates"];

  const filteredMedia = activeTab === "All" ? mediaItems : mediaItems.filter(item => item.category === activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src={cmsData.hero?.backgroundImage || "https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=2070&auto=format&fit=crop"} alt="Gallery Background" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
            <motion.span variants={fadeUp} className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Visual Journey</motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif font-bold mb-6">
              {cmsData.hero?.headline || "The Crayon Box Gallery"}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-stone-300 font-light leading-relaxed">
              {cmsData.hero?.subheadline || "Explore the vibrant moments, events, and milestones that shape our school community."}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Categorization Tabs */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-16">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'}`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          {/* Masonry Grid */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredMedia.map((item, idx) => (
              <motion.div variants={fadeUp} key={item.id} className="relative rounded-3xl overflow-hidden group cursor-pointer break-inside-avoid shadow-sm hover:shadow-xl transition-shadow bg-white">
                <div className="relative w-full" style={{ paddingBottom: idx % 3 === 0 ? '133%' : (idx % 2 === 0 ? '100%' : '75%') }}>
                  <Image 
                    src={item.media_type === 'video' ? (item.thumbnail_url || "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop") : item.url} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-accent text-xs font-bold uppercase tracking-widest mb-1 block">{item.category}</span>
                    <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                  </div>

                  {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-lg border border-white/30">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Click handler overlay */}
                <div 
                  className="absolute inset-0 z-10" 
                  onClick={() => {
                    if (item.media_type === 'video') {
                      setActiveVideo(item.url);
                    }
                  }}
                />
              </motion.div>
            ))}
            
            {filteredMedia.length === 0 && (
              <div className="col-span-full py-20 text-center text-stone-500">
                No media found for the selected category.
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-stone-900/95 backdrop-blur-sm" onClick={() => setActiveVideo(null)} />
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl z-10">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 hover:bg-primary text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe 
              src={activeVideo.includes('?') ? `${activeVideo}&autoplay=1` : `${activeVideo}?autoplay=1`} 
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
}
