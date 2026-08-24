"use client";

import React, { useState, useEffect } from 'react';
import {
  KeyRound, ShieldCheck, Lock, UserCheck, Check,
  X, RefreshCw, Save, ShieldAlert, Sparkles, Building2
} from 'lucide-react';
import { getLiveRbacMatrix, updateLiveRolePermission } from '@/app/actions/rbac-actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function IdentityAccessManagementPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('TEACHER');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const modules = [
    { code: 'STUDENTS', name: 'Universal Students Master' },
    { code: 'CLASSES', name: 'Classes, Sections & Rooms' },
    { code: 'ADMISSIONS', name: 'Admissions CRM & Funnel' },
    { code: 'FINANCE', name: 'Executive Finance & Ledgers' },
    { code: 'HR_PAYROLL', name: 'HR & Statutory Payroll' },
    { code: 'TIMETABLE', name: 'Master Timetable & Scheduling' },
    { code: 'CURRICULUM', name: 'Curriculum & Syllabus Radar' },
    { code: 'INCIDENTS_POCSO', name: 'Child Safeguarding & Safety Log' },
    { code: 'HEALTH_CLINIC', name: 'Campus Health Infirmary' },
    { code: 'BROADCASTS', name: 'Omnichannel Broadcasts' },
  ];

  const fetchMatrix = async () => {
    setIsLoading(true);
    const res = await getLiveRbacMatrix();
    if (res.success) {
      setRoles(res.roles);
      setPermissions(res.permissions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = async (moduleCode: string, field: string, currentValue: boolean) => {
    setIsSaving(true);
    const newValue = !currentValue;
    
    // Optimistic UI update
    setPermissions((prev) => {
      const idx = prev.findIndex((p) => p.role_code === selectedRole && p.module_code === moduleCode);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [field]: newValue };
        return updated;
      } else {
        return [...prev, { role_code: selectedRole, module_code: moduleCode, [field]: newValue }];
      }
    });

    await updateLiveRolePermission(selectedRole, moduleCode, field, newValue);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const getPermValue = (moduleCode: string, field: string) => {
    const perm = permissions.find((p) => p.role_code === selectedRole && p.module_code === moduleCode);
    return perm ? Boolean(perm[field]) : false;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live PostgreSQL RBAC Engine
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">4D Security Model: Role + Scope + Module + Action</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Identity & Access Management (IAM Matrix)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure fine-grained module access and permissions across all user roles directly in the live database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" /> Saved to PostgreSQL
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchMatrix} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Matrix
          </Button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold uppercase text-slate-400 px-3 tracking-wider">Select Role:</span>
        {roles.map((r) => (
          <button
            key={r.code}
            onClick={() => setSelectedRole(r.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedRole === r.code
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Live Permissions Matrix Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Module Permissions for <span className="text-indigo-600 font-black">{roles.find(r => r.code === selectedRole)?.name || selectedRole}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click any toggle to immediately update access rules in PostgreSQL.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {roles.find(r => r.code === selectedRole)?.description}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">ERP Functional Module</th>
                <th className="py-3.5 px-4 text-center">View</th>
                <th className="py-3.5 px-4 text-center">Create</th>
                <th className="py-3.5 px-4 text-center">Edit</th>
                <th className="py-3.5 px-4 text-center">Delete</th>
                <th className="py-3.5 px-4 text-center">Approve</th>
                <th className="py-3.5 px-4 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {modules.map((mod) => {
                const canView = getPermValue(mod.code, 'can_view');
                const canCreate = getPermValue(mod.code, 'can_create');
                const canEdit = getPermValue(mod.code, 'can_edit');
                const canDelete = getPermValue(mod.code, 'can_delete');
                const canApprove = getPermValue(mod.code, 'can_approve');
                const canExport = getPermValue(mod.code, 'can_export');

                return (
                  <tr key={mod.code} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{mod.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">{mod.code}</span>
                      </div>
                    </td>

                    {/* Checkbox columns */}
                    {[
                      { field: 'can_view', val: canView },
                      { field: 'can_create', val: canCreate },
                      { field: 'can_edit', val: canEdit },
                      { field: 'can_delete', val: canDelete },
                      { field: 'can_approve', val: canApprove },
                      { field: 'can_export', val: canExport },
                    ].map((item) => (
                      <td key={item.field} className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggle(mod.code, item.field, item.val)}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition ${
                            item.val
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {item.val ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
