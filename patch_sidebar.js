const fs = require('fs');

let code = fs.readFileSync('/Users/vaani/Desktop/crayon box/web/src/components/layout/SidebarNav.tsx', 'utf8');

code = code.replace(/bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 font-sans border-r border-slate-800/, "w-64 bg-[#0A1A44] text-slate-200 flex flex-col h-full shrink-0 font-sans shadow-xl rounded-r-3xl z-20");
code = code.replace(/border-slate-800/g, "border-white/10");
code = code.replace(/text-slate-400/g, "text-white/60");
code = code.replace(/bg-indigo-600/g, "bg-white text-[#0A1A44]");
code = code.replace(/text-white shadow-xs/g, "text-[#0A1A44] shadow-md");
code = code.replace(/text-slate-200/g, "text-white");
code = code.replace(/hover:bg-slate-800\/60/g, "hover:bg-white/10");
code = code.replace(/bg-slate-950\/40/g, "bg-transparent");
code = code.replace(/bg-slate-800\/80/g, "bg-white/10");
code = code.replace(/border-slate-700\/60/g, "border-white/10");
code = code.replace(/bg-indigo-950/g, "bg-white/10");
code = code.replace(/text-indigo-300/g, "text-white");
code = code.replace(/border-indigo-800/g, "border-transparent");

// Change active icon color
code = code.replace(/Icon className=\{\`w-4 h-4 shrink-0 \$\{isActive \? 'text-white' : 'text-white\/60'\}\`\} \/>/g, 
  "Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0A1A44]' : 'text-white/60 group-hover:text-white'}`} strokeWidth={isActive ? 2.5 : 2} />");
code = code.replace(/isActive \? 'bg-white text-\\[#0A1A44\\] text-\\[#0A1A44\\] shadow-md' : 'text-white\/60 hover:text-white hover:bg-white\/10'/g, 
  "isActive ? 'bg-white text-[#0A1A44] shadow-md font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'");

fs.writeFileSync('/Users/vaani/Desktop/crayon box/web/src/components/layout/SidebarNav.tsx', code);
