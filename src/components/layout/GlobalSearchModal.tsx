"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, User, Users, CreditCard, Receipt, AlertTriangle,
  ExternalLink, ArrowRight, CornerDownLeft, Sparkles
} from 'lucide-react';
import { GlobalSearchEngine, SearchResultItem } from '@/lib/core/search/global-search';

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          setResults([]);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      GlobalSearchEngine.search(query).then(setResults);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const handleSelectResult = (route: string) => {
    onClose();
    router.push(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden font-sans">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-stone-200">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, families, staff, invoices, receipts (e.g. 'Aarav', 'Sharma', 'INV-2026')..."
            className="w-full text-sm font-semibold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1 divide-y divide-stone-100">
          {results.length === 0 && query.trim().length >= 2 && (
            <div className="p-8 text-center text-stone-400 text-xs font-semibold">
              No matching records found for "{query}". Try searching by Student Name, Admission No, or Invoice ID.
            </div>
          )}

          {results.length === 0 && query.trim().length < 2 && (
            <div className="p-8 text-center text-stone-400 text-xs font-medium space-y-2">
              <p>Type at least 2 characters to search across all institutional records.</p>
              <div className="flex justify-center gap-2 text-[11px] font-bold text-stone-500">
                <span className="px-2 py-0.5 bg-stone-100 rounded-md">Aarav Sharma</span>
                <span className="px-2 py-0.5 bg-stone-100 rounded-md">Sharma Family</span>
                <span className="px-2 py-0.5 bg-stone-100 rounded-md">INV-2026</span>
              </div>
            </div>
          )}

          {results.map((res) => (
            <button
              key={res.id}
              onClick={() => handleSelectResult(res.route)}
              className="w-full text-left p-3.5 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between group transition"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    res.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                    res.badgeColor === 'purple' ? 'bg-purple-100 text-purple-800' :
                    res.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {res.badge}
                  </span>
                  <h4 className="text-sm font-black text-stone-900 group-hover:text-blue-600 transition">
                    {res.title}
                  </h4>
                </div>
                <p className="text-xs text-stone-500 font-medium">{res.subtitle}</p>
              </div>

              <div className="flex items-center gap-1 text-stone-400 group-hover:text-blue-600 transition text-xs font-bold shrink-0">
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400 font-semibold px-4">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded shadow-2xs font-mono text-[10px]">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded shadow-2xs font-mono text-[10px]">↵</kbd> to select</span>
          </div>
          <span className="text-stone-500">Crayon Box Global Index</span>
        </div>

      </div>
    </div>
  );
}
