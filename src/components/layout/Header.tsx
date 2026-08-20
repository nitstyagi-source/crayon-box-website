import Link from "next/link";
import Image from "next/image";
import { User, CreditCard, Search, Globe, ChevronDown } from "lucide-react";
import { getPageContent } from "@/app/actions/cms";

const NAV_LINKS = [
  { name: "About", href: "/about" },
  { 
    name: "Academics", 
    href: "/academics",
    megaMenu: [
      { name: "Early Years", href: "/academics#early-years" },
      { name: "Primary", href: "/academics#primary" },
      { name: "Middle School", href: "/academics#middle" },
      { name: "Syllabus", href: "/academics" },
    ]
  },
  { name: "Campus Life", href: "/campus-life" },
  { name: "Gallery", href: "/gallery" },
  { name: "News & Media", href: "/news" },
  { name: "Faculty", href: "/faculty" },
  { name: "Admissions", href: "/admissions" },
  { name: "Contact", href: "/contact" },
];

export default async function Header() {
  const globalRes = await getPageContent("global");
  const globalData = globalRes.data || {};
  
  return (
    <header className="sticky top-0 z-40 w-full glass-nav bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-200">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Section 1: Logo */}
          <Link href="/" className="flex items-center shrink-0">
            {globalData.brand?.logo_primary_url ? (
              <img src={globalData.brand.logo_primary_url} alt="Crayon Box School Logo" className="w-16 h-16 object-contain hover:scale-105 transition-transform" />
            ) : (
              <Image src="/logo.png" alt="Crayon Box School Logo" width={64} height={64} className="w-16 h-16 object-contain hover:scale-105 transition-transform" priority />
            )}
          </Link>

          {/* Section 2: Center Navigation with Mega Menu */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <div key={link.name} className="relative group">
                <Link 
                  href={link.href}
                  className="flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-primary transition-colors py-8"
                >
                  {link.name}
                  {link.megaMenu && <ChevronDown className="w-4 h-4" />}
                </Link>
                {link.megaMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-xl border border-stone-100 p-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="grid grid-cols-1 gap-2">
                      {link.megaMenu.map(subItem => (
                        <Link key={subItem.name} href={subItem.href} className="px-4 py-2 text-sm text-stone-600 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors">
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Section 3: Right Utility (Search, Lang, Actions) */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Predictive Search Mockup */}
            <div className="hidden md:flex relative group items-center">
              <input type="text" placeholder="Search..." className="w-0 opacity-0 group-hover:w-48 group-hover:opacity-100 transition-all duration-300 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary absolute right-8" />
              <button className="p-2 text-stone-600 hover:text-primary transition-colors relative z-10 bg-white rounded-full">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher Mockup */}
            <div className="hidden md:flex items-center gap-1 text-stone-600 hover:text-primary cursor-pointer border border-stone-200 rounded-full px-3 py-1.5 text-xs font-bold transition-colors">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </div>

            <div className="hidden xl:flex items-center gap-4 text-sm font-semibold text-stone-600 ml-2">
              <Link href="/login" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>Portal</span>
              </Link>
            </div>
            
            <Link 
              href="/admissions/apply" 
              className="bg-accent text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-800 transition-colors shadow-md hover:shadow-lg ml-2"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
