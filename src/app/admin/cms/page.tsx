"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { getPageContent, updateContentBlock, clearAllCaches } from "@/app/actions/cms";
import { 
  LayoutTemplate, Save, CheckCircle2, AlertCircle, RefreshCw, 
  ChevronRight, ChevronDown, Settings, Monitor, Tablet, Smartphone, Globe, 
  History, Eye, PlaySquare, Building2, Sparkles
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { VastuModuleBanner } from "@/components/common/VastuModuleBanner";

function CMSDashboardContent() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions, institutionsList, setInstitution } = useInstitution();

  const CAMPUSES = [
    "All Branches (Global)",
    ...(institutionsList && institutionsList.length > 0
      ? institutionsList.map((i: any) => i.name)
      : ["Delhi Main Branch", "South Campus", "Gurugram Prep"])
  ];

  const [activeCampus, setActiveCampus] = useState(selectedInstitutionObj?.name || "Delhi Main Branch");
  const [activePage, setActivePage] = useState("about");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  const [content, setContent] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error" | "draft_saved">("idle");
  const [showHistory, setShowHistory] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const PAGES = [
    { slug: "global_theme", title: "Global Theme & Settings" },
    { slug: "home", title: "Landing Page" },
    { slug: "about", title: "About Us" },
    { slug: "academics", title: "Academics" },
    { slug: "admissions", title: "Admissions Hub" },
    { slug: "contact", title: "Contact Us" },
    { slug: "faculty", title: "Faculty Directory" },
    { slug: "campus-life", title: "Campus Life" },
    { slug: "news", title: "News & Events" },
    { slug: "alumni", title: "Alumni Network" },
  ];

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const res = await getPageContent(activePage);
      if (res.success && res.data) {
        setContent(res.data);
      } else {
        setContent({});
      }
      setIsLoading(false);
    };
    fetchContent();
  }, [activePage, activeCampus]);

  // Send postMessage to iframe whenever content changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "CMS_UPDATE_PREVIEW",
        pageSlug: activePage,
        content: content
      }, "*");
    }
  }, [content, activePage]);

  const handleInputChange = (section: string, key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setSaveStatus("idle");
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const promises: Promise<any>[] = [];
      Object.entries(content).forEach(([section, sectionData]) => {
        Object.entries(sectionData).forEach(([key, value]) => {
          promises.push(updateContentBlock(activePage, section, key, value as string));
        });
      });
      await Promise.all(promises);
      await clearAllCaches();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    // In a real app, this would save to a draft state in the DB
    setSaveStatus("draft_saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const getPreviewUrl = () => {
    if (activePage === "global_theme") return "/";
    if (activePage === "home") return "/";
    return `/${activePage}`;
  };

  const viewportWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px"
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8 bg-stone-100 overflow-hidden text-slate-900">
      
      {/* Top Header Bar */}
      <div className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between shrink-0 z-10">
        
        {/* Left: Branding & Campus Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <LayoutTemplate className="w-5 h-5" /> Content Studio
          </div>
          
          <div className="h-6 w-px bg-stone-200"></div>
          
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg transition-colors">
              <Building2 className="w-4 h-4 text-stone-500" />
              {activeCampus}
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-stone-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest px-3 mb-2 mt-2">Switch Context</div>
                {CAMPUSES.map(campus => (
                  <button 
                    key={campus}
                    onClick={() => setActiveCampus(campus)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCampus === campus ? 'bg-primary/10 text-primary font-bold' : 'text-stone-700 hover:bg-stone-100'}`}
                  >
                    {campus}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Page Selector */}
        <div className="flex items-center">
          <select 
            value={activePage} 
            onChange={(e) => setActivePage(e.target.value)}
            className="appearance-none bg-stone-100 border border-stone-200 text-stone-800 text-sm font-bold rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
          >
            {PAGES.map(p => <option key={p.slug} value={p.slug}>Editing: {p.title}</option>)}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            title="Version History"
          >
            <History className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-stone-200 mx-1"></div>
          
          <button 
            onClick={handleSaveDraft}
            className="text-stone-600 hover:text-stone-900 font-semibold text-sm px-4 py-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button 
            onClick={handlePublish}
            disabled={isSaving || isLoading}
            className="bg-primary hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Publish Live
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Pane: Builder (Form) */}
        <div className="w-[450px] bg-white border-r border-stone-200 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
          
          {/* Status Toasts */}
          {saveStatus === "success" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 z-50">
              <CheckCircle2 className="w-4 h-4" /> Published
            </div>
          )}
          {saveStatus === "draft_saved" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 z-50">
              <Save className="w-4 h-4" /> Draft Saved
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-stone-300" />
            </div>
          ) : Object.keys(content).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <PlaySquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No editable blocks configured.</p>
              <p className="text-sm mt-1">This page relies on static templates or needs to be wired to the CMS.</p>
            </div>
          ) : (
            <BuilderTabs content={content} handleInputChange={handleInputChange} />
          )}
        </div>

        {/* Right Pane: Live Preview */}
        <div className="flex-1 bg-stone-200 flex flex-col relative">
          
          {/* Preview Header / Viewport Toggles */}
          <div className="h-14 bg-stone-100 border-b border-stone-300 flex items-center justify-center gap-2 shrink-0 shadow-sm z-10">
            <div className="bg-white rounded-lg p-1 border border-stone-200 shadow-sm flex">
              <button 
                onClick={() => setViewport("desktop")}
                className={`p-2 rounded-md transition-colors ${viewport === "desktop" ? "bg-stone-100 text-primary shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                title="Desktop Preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewport("tablet")}
                className={`p-2 rounded-md transition-colors ${viewport === "tablet" ? "bg-stone-100 text-primary shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                title="Tablet Preview"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewport("mobile")}
                className={`p-2 rounded-md transition-colors ${viewport === "mobile" ? "bg-stone-100 text-primary shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                title="Mobile Preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            <div className="ml-4 flex items-center gap-2 text-xs font-mono text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              <Globe className="w-3 h-3" /> localhost:3000{getPreviewUrl()}
            </div>
          </div>

          {/* Iframe Container */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center pattern-grid-lg text-stone-100">
            <div 
              className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out border border-stone-300 relative"
              style={{ 
                width: viewportWidths[viewport], 
                height: "100%",
                maxWidth: "100%"
              }}
            >
              {/* Browser Mock Chrome for aesthetic */}
              {viewport !== "desktop" && (
                <div className="h-6 bg-stone-800 w-full flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-stone-600 rounded-full"></div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={getPreviewUrl()}
                className="w-full h-full border-none bg-white"
                title="Live Preview"
              />
            </div>
          </div>
        </div>

        {/* Version History Overlay Panel */}
        {showHistory && (
          <div className="absolute top-0 bottom-0 right-0 w-80 bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-stone-800 flex items-center gap-2"><History className="w-4 h-4" /> Version History</h3>
              <button onClick={() => setShowHistory(false)} className="text-stone-400 hover:text-stone-600">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3 border border-primary/30 bg-primary/5 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Current</span>
                  <span className="text-xs text-stone-500">Just now</span>
                </div>
                <p className="text-sm font-medium text-stone-800">Unpublished Draft</p>
                <p className="text-xs text-stone-500 mt-1">Edited by You</p>
              </div>

              <div className="p-3 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Live</span>
                  <span className="text-xs text-stone-500">2 hours ago</span>
                </div>
                <p className="text-sm font-medium text-stone-800">Updated Hero Copy</p>
                <p className="text-xs text-stone-500 mt-1">Published by Nitin Tyagi</p>
                <button className="mt-3 w-full py-1.5 bg-stone-100 text-stone-600 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-200">
                  Restore this version
                </button>
              </div>

              <div className="p-3 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Archived</span>
                  <span className="text-xs text-stone-500">Yesterday</span>
                </div>
                <p className="text-sm font-medium text-stone-800">Initial Setup</p>
                <p className="text-xs text-stone-500 mt-1">Published by System</p>
                <button className="mt-3 w-full py-1.5 bg-stone-100 text-stone-600 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-200">
                  Restore this version
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Sub-component: BuilderTabs (The Left Pane Form)
function BuilderTabs({ content, handleInputChange }: { content: any, handleInputChange: (s: string, k: string, v: string) => void }) {
  const [activeTab, setActiveTab] = useState("Content");

  const CATEGORIES = ["Basic", "Layout", "Typography", "Media", "Components", "Content", "Advanced"];

  const getCategory = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("color") || k.includes("bg") || k.includes("theme")) return "Layout";
    if (k.includes("font") || k.includes("size") || k.includes("weight")) return "Typography";
    if (k.includes("image") || k.includes("url") || k.includes("video") || k.includes("photo") || k.includes("logo")) return "Media";
    if (k.includes("meta") || k.includes("seo") || k.includes("analytics")) return "Advanced";
    if (k.includes("title") || k.includes("headline") || k.includes("description") || k.includes("text") || k.includes("subtext") || k.includes("quote") || k.includes("desc") || k.includes("author") || k.includes("role") || k.includes("notice") || k.includes("heading") || k.includes("tag") || k.includes("curriculum") || k.includes("focus")) return "Content";
    return "Basic";
  };

  const groupedFields: Record<string, { section: string, key: string, value: any }[]> = {};
  CATEGORIES.forEach(c => groupedFields[c] = []);

  Object.entries(content).forEach(([section, sectionData]: [string, any]) => {
    Object.entries(sectionData).forEach(([key, value]) => {
      const cat = getCategory(key);
      if (groupedFields[cat]) {
        groupedFields[cat].push({ section, key, value });
      } else {
        groupedFields["Basic"].push({ section, key, value });
      }
    });
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Category Tabs */}
      <div className="flex gap-2 p-4 border-b border-stone-200 overflow-x-auto no-scrollbar shrink-0">
        {CATEGORIES.map(cat => {
          const count = groupedFields[cat].length;
          if (count === 0) return null; // Only show tabs that have fields
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === cat ? 'bg-stone-800 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
              <span className={`px-1.5 py-0.5 rounded-sm text-[9px] ${activeTab === cat ? 'bg-stone-600 text-stone-300' : 'bg-stone-200 text-stone-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Group fields by section for visual clarity */}
        {Array.from(new Set(groupedFields[activeTab]?.map(f => f.section))).map(section => (
          <div key={section} className="space-y-4">
            <h4 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2 capitalize flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-primary" /> {section.replace(/_/g, " ")} Block
            </h4>
            
            {groupedFields[activeTab].filter(f => f.section === section).map((field, idx) => {
              const isTextArea = field.key.includes("description") || field.key.includes("subtext") || field.key.includes("quote") || field.key.includes("notice") || field.key.includes("curriculum");
              const isImage = field.key.includes("url") || field.key.includes("image");
              const isColor = field.key.includes("color");

              return (
                <div key={`${field.section}-${field.key}-${idx}`} className="group">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                    {field.key.replace(/_/g, " ")}
                  </label>
                  
                  {isImage ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={field.value as string} 
                          onChange={(e) => handleInputChange(field.section, field.key, e.target.value)}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm text-stone-700 transition-colors"
                          placeholder="https://..."
                        />
                        <button className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-md text-xs font-bold transition-colors">
                          Library
                        </button>
                      </div>
                      {field.value && (
                        <div className="h-32 rounded-lg border border-stone-200 bg-stone-100 overflow-hidden relative group-hover:border-stone-300 transition-colors">
                          <img src={field.value as string} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Change Asset</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isColor ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={field.value as string} 
                        onChange={(e) => handleInputChange(field.section, field.key, e.target.value)}
                        className="w-10 h-10 p-0.5 border border-stone-200 rounded cursor-pointer bg-white"
                      />
                      <input 
                        type="text" 
                        value={field.value as string} 
                        onChange={(e) => handleInputChange(field.section, field.key, e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm font-mono text-stone-700 uppercase transition-colors"
                      />
                    </div>
                  ) : isTextArea ? (
                    <textarea 
                      value={field.value as string} 
                      onChange={(e) => handleInputChange(field.section, field.key, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm text-stone-700 leading-relaxed resize-y transition-colors"
                    />
                  ) : (
                    <input 
                      type="text" 
                      value={field.value as string} 
                      onChange={(e) => handleInputChange(field.section, field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-stone-900 transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {groupedFields[activeTab]?.length === 0 && (
           <p className="text-stone-400 text-sm italic">No fields in this category.</p>
        )}
      </div>
    </div>
  );
}

export default function CMSDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-stone-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#D97706]" />
          <span>Loading Website CMS & News Portal Hub...</span>
        </div>
      }
    >
      <CMSDashboardContent />
    </Suspense>
  );
}

