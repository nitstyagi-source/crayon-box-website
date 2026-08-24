"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Users, ArrowLeft, Phone, Mail, ShieldAlert, CreditCard,
  ExternalLink, Download, CheckCircle2, UserCheck, Plus, Sparkles, RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Family360Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [family, setFamily] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFamily();
  }, [resolvedParams.id]);

  async function fetchFamily() {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
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
            admission_no,
            status
          )
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (data) {
      setFamily(data);
    } else {
      setFamily(null);
    }
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-600">Querying live database for family record...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pt-8">
        <Link href="/admin/families" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="w-4 h-4" /> Back to Family 360 Master
        </Link>
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title="Family Record Not Found in Live Database"
          description={`No registered household with ID "${resolvedParams.id}" exists in the PostgreSQL database.`}
          actionLabel="View All Households"
          onAction={() => window.location.href = '/admin/families'}
        />
      </div>
    );
  }

  const linkedStudents = family.student_guardians?.map((sg: any) => sg.students).filter(Boolean) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      <Link href="/admin/families" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="w-4 h-4" /> Back to Family 360 Master
      </Link>

      {/* Household Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xl">
            {family.first_name?.[0] || 'F'}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {family.first_name} {family.last_name} Household
            </h1>
            <p className="text-xs font-medium text-slate-500">
              📞 {family.phone} • ✉️ {family.email || 'No email'} • {family.relationship}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
          {linkedStudents.length} Linked Sibling{linkedStudents.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Linked Children Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Enrolled Sibling Children</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {linkedStudents.map((child: any) => (
            <Card key={child.id} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{child.first_name} {child.last_name}</h3>
                  <span className="font-mono text-[10px] text-slate-400">Admission No: {child.admission_no}</span>
                </div>
                <Link href={`/admin/students/${child.id}`}>
                  <Button size="sm" variant="outline">
                    View Dossier
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
