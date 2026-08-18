"use client";

import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { Bus, Phone, MapPin, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function TransportHub() {
  const { activeSibling } = useSiblingContext();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-8">
      
      {/* Absolute Full Map Mockup */}
      <div className="relative flex-1 bg-stone-200">
        <Image 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
          alt="Map" 
          fill sizes="(max-width: 768px) 100vw, 50vw" 
          className="object-cover opacity-60 mix-blend-luminosity" 
        />
        
        {/* Route Line Mockup */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 20 80 Q 40 40 80 20" fill="none" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="1 1" />
        </svg>

        {/* GPS Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary absolute -left-6 -top-12 z-20">
              <Bus className="w-5 h-5 text-primary" />
            </div>
            <div className="w-4 h-4 bg-primary rounded-full absolute -left-2 -top-2 animate-ping opacity-50"></div>
          </div>
        </div>

        {/* Top Floating Status (Desktop) / Static (Mobile) */}
        <div className="absolute top-6 left-6 right-6 md:right-auto md:w-96 z-20">
          <div className="bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Bus 4 - On Route to School</h2>
                <p className="text-sm text-slate-600">Arriving at <strong className="text-slate-800">Sector 42 Gate</strong> in ~10 mins</p>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Driver Card */}
        <div className="absolute bottom-20 md:bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-20">
          <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border border-slate-700">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Assigned Personnel</h3>
            
            <div className="flex items-center gap-4 mb-5">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop" alt="Driver" className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover" />
              <div>
                <p className="font-bold text-sm">Ramesh Kumar</p>
                <p className="text-xs text-slate-400">Lead Driver • Bus 4</p>
              </div>
              <button className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center ml-auto transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 border-t border-slate-800 pt-5">
              <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=100&auto=format&fit=crop" alt="Attendant" className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" />
              <div>
                <p className="font-bold text-sm">Sunita Devi</p>
                <p className="text-xs text-slate-400">Bus Attendant (Female)</p>
              </div>
            </div>

            <div className="mt-5 bg-slate-800 rounded-xl p-3 flex gap-3 items-start border border-slate-700">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">For security, calls are masked. Driver will only pick up during active transit hours.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
