import Link from "next/link";
import Image from "next/image";
import { User, CreditCard } from "lucide-react";
import { getPageContent } from "@/app/actions/cms";

const NAV_LINKS = [
  { name: "About", href: "/about" },
  { name: "Academics", href: "/academics" },
  { name: "Campus Life", href: "/campus-life" },
  { name: "News & Media", href: "/news" },
  { name: "Faculty", href: "/faculty" },
  { name: "Admissions", href: "/admissions" },
  { name: "Contact", href: "/contact" },
];

export default async function Header() {
  const globalRes = await getPageContent("global");
  const globalData = globalRes.data || {};
  
  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Section 1: Logo */}
          <Link href="/" className="flex items-center shrink-0">
            {globalData.brand?.logo_primary_url ? (
              <img src={globalData.brand.logo_primary_url} alt="Crayon Box School Logo" className="w-16 h-16 object-contain hover:scale-105 transition-transform mix-blend-multiply" />
            ) : (
              <Image src="/logo.jpg" alt="Crayon Box School Logo" width={64} height={64} className="w-16 h-16 object-contain hover:scale-105 transition-transform" />
            )}
          </Link>

          {/* Section 1: Center Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-semibold text-stone-600 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Section 1: Right Utility */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
              <Link href="/login" className="flex items-center gap-2 hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>Parent Portal Login</span>
              </Link>
              <Link href="/pay-fees" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <CreditCard className="h-4 w-4" />
                <span>Pay Fees</span>
              </Link>
            </div>
            
            {/* Primary High-Contrast Button */}
            <Link 
              href="/admissions/apply" 
              className="bg-accent text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-800 transition-colors shadow-md hover:shadow-lg"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
