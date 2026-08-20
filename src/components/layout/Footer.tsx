import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { getPageContent } from "@/app/actions/cms";

export default async function Footer() {
  const globalRes = await getPageContent("global");
  const globalData = globalRes.data || {};

  return (
    <footer className="bg-primary text-blue-50 border-t border-blue-950">
      
      {/* Top Banner: Newsletter Capture */}
      <div className="bg-blue-950 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto bg-primary/30 p-8 rounded-3xl border border-blue-800/50">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-serif font-bold text-white mb-2">Subscribe for Updates</h3>
              <p className="text-sm text-blue-200">Get notified about our K-12 expansion, upcoming campus events, and admissions dates.</p>
            </div>
            <div className="w-full md:w-1/2 flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-white/10 border border-blue-800 rounded-full px-6 py-3 text-sm text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button className="bg-accent text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-orange-800 transition-colors flex items-center justify-center shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              {globalData.brand?.logo_inverse_url ? (
                <img src={globalData.brand.logo_inverse_url} alt="Crayon Box School Logo" className="w-24 h-24 object-contain rounded-full bg-white border-2 border-white/20 shadow-lg p-1 hover:scale-105 transition-transform" />
              ) : (
                <Image src="/logo.png" alt="Crayon Box School Logo" width={96} height={96} className="w-24 h-24 object-contain rounded-full bg-white border-2 border-white/20 shadow-lg p-1 hover:scale-105 transition-transform" />
              )}
            </Link>
            <p className="text-sm leading-relaxed text-blue-200">
              {globalData.footer?.description || "A modern, holistic learning ecosystem designed to help your child thrive in a rapidly evolving world. Inspiring Excellence, Nurturing Tomorrow."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Quick Links</h3>
            <ul className="space-y-4">
              {['Admissions', 'Careers (HRMS)', 'Privacy Policy', 'Mandatory Disclosures'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-accent group-hover:translate-x-1 transition-transform" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Parent Resources */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Parent Resources</h3>
            <ul className="space-y-4">
              {['Student Login', 'Digital Fee Payment', 'Live Bus Tracking', 'Grievance Helpdesk'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-accent group-hover:translate-x-1 transition-transform" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Visit */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Contact & Visit</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed text-blue-200">
                  {globalData.contact?.address || "123 Education Boulevard, Knowledge Park, Cityville, 10001"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-blue-200">{globalData.contact?.phone || "+1 (555) 123-4567"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-blue-200">{globalData.contact?.email || "admissions@crayonbox.edu"}</span>
              </li>
            </ul>
            
            {/* Interactive Map Embed */}
            <div className="w-full h-32 rounded-xl mb-4 overflow-hidden border border-blue-800 relative shadow-inner">
              <iframe 
                src="https://maps.google.com/maps?q=Crayon+Box+School,+Nathupura,+Burari,+New+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>

            <div className="bg-blue-950 p-4 rounded-xl border border-blue-900">
              <p className="text-xs text-blue-200 leading-relaxed">
                <strong className="text-accent">Visitor Notice:</strong> {globalData.footer?.visitor_notice || "All campus visits must be pre-registered via our Smart Visitor Kiosk."}
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-blue-900 bg-blue-950">
        <div className="container mx-auto px-4 py-6 flex flex-col items-center text-center">
          <p className="text-xs text-blue-400">
            &copy; {new Date().getFullYear()} Crayon Box School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
