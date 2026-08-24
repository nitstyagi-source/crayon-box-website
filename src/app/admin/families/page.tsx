"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Users, ExternalLink, Phone, Mail, MapPin,
  Sparkles, Download, Plus, Filter, RefreshCw, Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';

export default function FamiliesDirectoryPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFamilies = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('guardians')
      .select(`
        id,
        first_name,
        last_name,
        relationship,
        phone,
        email,
        occupation,
        address,
        created_at,
        student_guardians (
          students (
            id,
            first_name,
            last_name,
            admission_no
          )
        )
      `)
      .order('created_at', { ascending: false });

    setFamilies(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleDeleteGuardian = async (guardianId: string) => {
    const supabase = createClient();
    await supabase.from('guardians').delete().eq('id', guardianId);
    fetchFamilies();
  };

  const columns = [
    {
      key: 'name',
      header: 'Guardian / Household Name',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-900 block text-sm">
            {row.first_name} {row.last_name} Household
          </span>
          <span className="text-slate-400 font-mono text-[10px]">{row.id}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Details',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">📞 {row.phone}</span>
          <span className="text-slate-400 text-[10px]">{row.email || 'No email provided'}</span>
        </div>
      ),
    },
    {
      key: 'relation',
      header: 'Relationship',
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-200">
          {row.relationship || 'FATHER'}
        </span>
      ),
    },
    {
      key: 'children',
      header: 'Enrolled Children',
      render: (row: any) => {
        const students = row.student_guardians?.map((sg: any) => sg.students).filter(Boolean) || [];
        if (students.length === 0) return <span className="text-slate-400 text-xs italic">No children linked</span>;
        return (
          <div className="space-y-0.5">
            {students.map((s: any) => (
              <span key={s.id} className="block text-xs font-semibold text-slate-800">
                • {s.first_name} {s.last_name} ({s.admission_no || 'Enrolled'})
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/admin/families/${row.id}`}>
            <Button size="sm" variant="outline">
              Details
            </Button>
          </Link>
          <button
            onClick={() => handleDeleteGuardian(row.id)}
            title="Delete test record (Cleanup)"
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live PostgreSQL Table (`guardians`)
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">{families.length} Households in Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Family 360° Household Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Unified household records linking multi-child sibling relationships across CBS, AVM, AS, and CBPS.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchFamilies} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Live DB
          </Button>
          <Link href="/admin/students">
            <Button variant="secondary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Enroll Student with Guardian
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Families Table with Clean Empty State */}
      <DataTable
        title="Registered Households & Guardians (Live Database)"
        subtitle="Direct records from PostgreSQL `guardians` and `student_guardians` tables"
        columns={columns}
        data={families}
        searchKey="first_name"
        searchPlaceholder="Search guardian name..."
        emptyTitle="No Households Registered in Database"
        emptyDescription="Your database currently has 0 registered family households. When students are enrolled via the Students Master, guardian records will automatically link and appear here."
        addLabel="Go to Students Master to Enroll"
        onAddFirst={() => window.location.href = '/admin/students'}
      />

    </div>
  );
}
