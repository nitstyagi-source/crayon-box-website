"use client";

import React, { useState, useEffect } from 'react';
import {
  KeyRound, ShieldCheck, Lock, UserCheck, Check,
  X, RefreshCw, Save, ShieldAlert, Sparkles, Building2,
  Search, Filter, CheckSquare, Square, Eye, PlusCircle,
  Edit, Trash2, Download, ArrowRight, Layers, Smartphone,
  AlertOctagon, Info
} from 'lucide-react';
import { getLiveRbacMatrix, updateLiveRolePermission } from '@/app/actions/rbac-actions';
import { ERP_MODULES_REGISTRY, getAllCategories, ErpModuleDefinition } from '@/lib/core/security/erp-modules-registry';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function IdentityAccessManagementPage() {
  const [roles, setRoles] = useState<any[]>([
    { code: 'SUPER_ADMIN', name: 'Super Administrator' },
    { code: 'PRINCIPAL', name: 'Principal / Head of School' },
    { code: 'TEACHER', name: 'Classroom Teacher / Faculty' },
    { code: 'ACCOUNTS', name: 'Accounts & Billing Officer' },
    { code: 'STAFF', name: 'Administrative Support Staff' },
    { code: 'PARENT_STUDENT', name: 'Parent & Student (Mobile App Only)' }
  ]);
  
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('TEACHER');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = ['ALL', ...getAllCategories()];

  const fetchMatrix = async () => {
    setIsLoading(true);
    const res = await getLiveRbacMatrix();
    if (res.success) {
      if (res.roles && res.roles.length > 0) {
        // Ensure PARENT_STUDENT is unified in the role list
        const filtered = res.roles.filter((r: any) => r.code !== 'PARENT' && r.code !== 'STUDENT');
        if (!filtered.find((r: any) => r.code === 'PARENT_STUDENT')) {
          filtered.push({ code: 'PARENT_STUDENT', name: 'Parent & Student (Mobile App Only)' });
        }
        setRoles(filtered);
      }
      setPermissions(res.permissions || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = async (moduleCode: string, field: string, currentValue: boolean) => {
    if (selectedRole === 'PARENT_STUDENT') return; // Parents/Students are Mobile Only with zero web ERP access
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

  const getPermValue = (moduleCode: string, field: string, defaultRoles: string[]) => {
    if (selectedRole === 'SUPER_ADMIN') return true; // Super admin has root access to everything
    if (selectedRole === 'PARENT_STUDENT') return false; // Parent & Student have ZERO access to web ERP
    const perm = permissions.find((p) => p.role_code === selectedRole && p.module_code === moduleCode);
    if (perm && perm[field] !== undefined) {
      return Boolean(perm[field]);
    }
    // Fallback to default canonical roles
    if (field === 'can_view') {
      return defaultRoles.includes(selectedRole as any);
    }
    return defaultRoles.includes(selectedRole as any) && field !== 'can_delete';
  };

  // Filter modules by Category and Search
  const filteredModules = ERP_MODULES_REGISTRY.filter((mod) => {
    const matchesCat = selectedCategory === 'ALL' || mod.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const isParentStudentRole = selectedRole === 'PARENT_STUDENT';

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Dynamic RBAC Selector
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">
              {ERP_MODULES_REGISTRY.length} Enterprise Modules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-indigo-600" />
            Identity &amp; Access Management (IAM Policy Matrix)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Super Administrator can configure which modules and operational actions each faculty role can access. Parents &amp; Students share a unified Mobile-Only profile.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" /> Saved to Database
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchMatrix} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Matrix
          </Button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Select Role to Configure:
          </span>
          <span className="text-xs font-bold text-indigo-600">
            Active Persona: {roles.find(r => r.code === selectedRole)?.name || selectedRole}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {roles.map((r) => (
            <button
              key={r.code}
              onClick={() => setSelectedRole(r.code)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedRole === r.code
                  ? (r.code === 'PARENT_STUDENT' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 text-white shadow-md')
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {r.code === 'PARENT_STUDENT' ? (
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SPECIAL NOTICE FOR PARENT & STUDENT (MOBILE ONLY) */}
      {isParentStudentRole && (
        <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-sm">
            <Smartphone className="w-5 h-5 text-amber-600" />
            <span>Unified Household Policy: Mobile App Only (Zero Online Web ERP Access)</span>
          </div>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Parents and Students share a single common household persona. By institutional policy, this persona has <strong>zero access</strong> to the Online Admin Web ERP Console (`/admin/*`). All parent and student operations are delivered exclusively through the <strong>Crayon Box Mobile App</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            <div className="bg-white p-3 rounded-2xl border border-amber-200 text-xs">
              <span className="font-bold text-slate-800 block">📱 Mobile Roll-Call &amp; Diary</span>
              <span className="text-[11px] text-slate-500">Live attendance &amp; daily homework</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200 text-xs">
              <span className="font-bold text-slate-800 block">💳 UPI Fee Pay &amp; Receipts</span>
              <span className="text-[11px] text-slate-500">Instant digital fee clearance</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200 text-xs">
              <span className="font-bold text-slate-800 block">🚌 Live GPS Bus Telematics</span>
              <span className="text-[11px] text-slate-500">Real-time bus radar &amp; route ETA</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200 text-xs">
              <span className="font-bold text-slate-800 block">🪪 Digital Escort &amp; ID Pass</span>
              <span className="text-[11px] text-slate-500">Authorized gate pickup QR passes</span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search all modules by name, code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 ENTERPRISE MODULE PERMISSIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Granular Operational Rights for: <span className="text-indigo-600">{roles.find(r => r.code === selectedRole)?.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isParentStudentRole 
                ? 'Web Admin ERP access is completely disabled for Parent & Student persona.'
                : 'Click any checkbox to grant or revoke specific privileges in real time.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredModules.length} of {ERP_MODULES_REGISTRY.length} Modules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3.5 px-6">Module Name &amp; Description</th>
                <th className="py-3.5 px-4">Functional Category</th>
                <th className="py-3.5 px-4 text-center">👁️ View / Read</th>
                <th className="py-3.5 px-4 text-center">➕ Create / Add</th>
                <th className="py-3.5 px-4 text-center">✏️ Edit / Modify</th>
                <th className="py-3.5 px-4 text-center">🗑️ Delete / Archive</th>
                <th className="py-3.5 px-4 text-center">📊 Export Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map((mod) => {
                const canView = getPermValue(mod.code, 'can_view', mod.defaultRoles);
                const canCreate = getPermValue(mod.code, 'can_create', mod.defaultRoles);
                const canEdit = getPermValue(mod.code, 'can_edit', mod.defaultRoles);
                const canDelete = getPermValue(mod.code, 'can_delete', mod.defaultRoles);
                const canExport = getPermValue(mod.code, 'can_export', mod.defaultRoles);

                const isSuperAdminRole = selectedRole === 'SUPER_ADMIN';

                return (
                  <tr key={mod.code} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 block text-xs">{mod.name}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {mod.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{mod.description}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {mod.category}
                      </span>
                    </td>

                    {/* Can View */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        disabled={isSuperAdminRole || isParentStudentRole || !mod.supportsActions.includes('can_view')}
                        onClick={() => handleToggle(mod.code, 'can_view', canView)}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                          canView ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {canView ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Can Create */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        disabled={isSuperAdminRole || isParentStudentRole || !mod.supportsActions.includes('can_create')}
                        onClick={() => handleToggle(mod.code, 'can_create', canCreate)}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                          canCreate ? 'bg-indigo-500 text-white shadow-xs' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {canCreate ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Can Edit */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        disabled={isSuperAdminRole || isParentStudentRole || !mod.supportsActions.includes('can_edit')}
                        onClick={() => handleToggle(mod.code, 'can_edit', canEdit)}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                          canEdit ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {canEdit ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Can Delete */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        disabled={isSuperAdminRole || isParentStudentRole || !mod.supportsActions.includes('can_delete')}
                        onClick={() => handleToggle(mod.code, 'can_delete', canDelete)}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                          canDelete ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {canDelete ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Can Export */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        disabled={isSuperAdminRole || isParentStudentRole || !mod.supportsActions.includes('can_export')}
                        onClick={() => handleToggle(mod.code, 'can_export', canExport)}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                          canExport ? 'bg-blue-500 text-white shadow-xs' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {canExport ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
