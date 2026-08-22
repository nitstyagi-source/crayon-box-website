"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Users, ExternalLink, Phone, Mail, MapPin,
  Sparkles, Download, Plus, Filter
} from 'lucide-react';

export default function FamiliesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [families, setFamilies] = useState([
    {
      id: 'fam-012',
      familyName: 'Sharma Household',
      primaryGuardian: 'Rajesh Sharma (Father)',
      phone: '+91 98100 12345',
      email: 'rajesh.sharma@techcorp.com',
      childrenCount: 2,
      childrenNames: ['Aarav Sharma (Grade 4B)', 'Anaya Sharma (Grade 1A)'],
      address: 'Flat 402, Evergreen Heights, Sector 62, Noida',
      feeStatus: 'Settled (₹0 Due)',
      siblingDiscountActive: true,
    },
    {
      id: 'fam-015',
      familyName: 'Gupta Household',
      primaryGuardian: 'Amit Gupta (Father)',
      phone: '+91 98111 55667',
      email: 'amit.gupta@finserve.in',
      childrenCount: 1,
      childrenNames: ['Vihaan Gupta (Grade 7A)'],
      address: 'House 14, Block C, Sector 50, Noida',
      feeStatus: 'Settled (₹0 Due)',
      siblingDiscountActive: false,
    },
    {
      id: 'fam-018',
      familyName: 'Verma Household',
      primaryGuardian: 'Dr. Sunita Verma (Mother)',
      phone: '+91 98222 33445',
      email: 'dr.sunita@medicare.org',
      childrenCount: 2,
      childrenNames: ['Rohan Verma (Grade 9A)', 'Riya Verma (Grade 6B)'],
      address: 'Villa 8, Palm Greens, Expressway, Greater Noida',
      feeStatus: 'Q2 Fee Pending (₹45,000)',
      siblingDiscountActive: true,
    },
  ]);

  const filteredFamilies = families.filter(
    (f) =>
      f.familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.primaryGuardian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery) ||
      f.childrenNames.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Household Master
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Family 360° Master Directory</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Central household management, multi-child sibling linkages, and consolidated family statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Directory
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by family name, guardian name, student name, or mobile number..."
          className="w-full text-xs font-semibold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-stone-400 hover:text-stone-600">
            Clear
          </button>
        )}
      </div>

      {/* Families Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFamilies.map((fam) => (
          <div
            key={fam.id}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:border-purple-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  {fam.id}
                </span>
                <h3 className="text-base font-black text-stone-900">{fam.familyName}</h3>
                <p className="text-xs text-stone-500 font-medium">{fam.primaryGuardian}</p>
              </div>
              <Link
                href={`/admin/families/${fam.id}`}
                className="p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition"
                title="Open Family 360°"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600">
              <p className="flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5 text-stone-400" /> {fam.phone}</p>
              <p className="flex items-center gap-1.5 font-medium"><Mail className="w-3.5 h-3.5 text-stone-400" /> {fam.email}</p>
              <p className="flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5 text-stone-400" /> {fam.address}</p>
            </div>

            {/* Enrolled Sibling Tags */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-stone-400">
                Enrolled Children ({fam.childrenCount})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fam.childrenNames.map((cn, i) => (
                  <span key={i} className="text-[11px] font-bold bg-white text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                    {cn}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className={`font-bold ${fam.feeStatus.includes('Pending') ? 'text-amber-600' : 'text-emerald-600'}`}>
                {fam.feeStatus}
              </span>
              {fam.siblingDiscountActive && (
                <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  Sibling Discount Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
