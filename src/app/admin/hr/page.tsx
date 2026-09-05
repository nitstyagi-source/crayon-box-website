"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, CreditCard, ShieldCheck, Download,
  Plus, Search, Filter, Calendar, Award, ArrowRight,
  RefreshCw, Trash2, Building2, ChevronRight, ArrowLeft,
  CheckCircle2, Mail, Phone, MapPin, Briefcase, IndianRupee, Edit3
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { deleteFacultyAction } from '@/app/actions/master-data-actions';
import { enrollFacultyTransactionalAction, FacultyEnrollmentInput } from '@/app/actions/faculty-enrollment-actions';
import { createClient } from '@/lib/supabase/client';
import { useInstitution } from '@/components/providers/InstitutionContext';

export default function HumanResourcesPayrollPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions, institutionsList } = useInstitution();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FacultyEnrollmentInput>({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '1988-06-15',
    gender: 'Female',
    bloodGroup: 'O+',
    panNo: '',
    aadhaarNo: '',
    photoUrl: '',

    institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
    academicSession: '2026-2027',
    department: 'Academics',
    designation: 'PGT Senior Faculty',
    workloadPercentage: 100,
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',

    email: '',
    phone: '',
    alternatePhone: '',
    address: '',

    epfUanNo: '',
    esicNo: '',
    bankName: 'State Bank of India',
    bankAccountNo: '',
    bankIfsc: 'SBIN0001234',
    salaryGrade: 'Grade A (Senior Faculty)',
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
    }));
  }, [currentInstitution]);

  const fetchStaff = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('staff')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone_number,
        designation,
        department,
        status,
        photo_url,
        employee_assignments (
          institution_code,
          designation,
          department,
          workload_percentage
        )
      `)
      .order('created_at', { ascending: false });

    let list = data || [];
    if (currentInstitution !== 'ALL') {
      list = list.filter((s: any) =>
        s.employee_assignments?.some((a: any) => a.institution_code === currentInstitution)
      );
    }

    setStaffList(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [currentInstitution]);

  const handleEnrollSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill all required faculty fields.');
      return;
    }

    setIsSubmitting(true);
    const res = await enrollFacultyTransactionalAction(formData);
    if (res.success) {
      setIsEnrollModalOpen(false);
      setWizardStep(1);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '1988-06-15',
        gender: 'Female',
        bloodGroup: 'O+',
        panNo: '',
        aadhaarNo: '',
        photoUrl: '',

        institutionCode: currentInstitution === 'ALL' ? 'CBS' : currentInstitution,
        academicSession: '2026-2027',
        department: 'Academics',
        designation: 'PGT Senior Faculty',
        workloadPercentage: 100,
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'FULL_TIME',

        email: '',
        phone: '',
        alternatePhone: '',
        address: '',

        epfUanNo: '',
        esicNo: '',
        bankName: 'State Bank of India',
        bankAccountNo: '',
        bankIfsc: 'SBIN0001234',
        salaryGrade: 'Grade A (Senior Faculty)',
      });
      fetchStaff();
    } else {
      alert(`Enrollment Failed: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (staffId: string) => {
    if (confirm('Delete this faculty record from live database?')) {
      setDeletingId(staffId);
      await deleteFacultyAction(staffId);
      await fetchStaff();
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Faculty Member & Universal UUID',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-slate-200 shadow-xs">
            {row.photo_url ? (
              <img src={row.photo_url} alt={row.first_name} className="w-full h-full object-cover" />
            ) : (
              <span>{row.first_name?.[0]}{row.last_name?.[0]}</span>
            )}
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-sm">{row.first_name} {row.last_name}</span>
            <span className="text-slate-400 font-mono text-[10px]">{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation & Department',
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">{row.designation || 'Faculty'}</span>
          <span className="text-indigo-600 font-semibold text-[11px]">{row.department || 'Academics'}</span>
        </div>
      ),
    },
    {
      key: 'assignment',
      header: 'Institutional Assignment',
      render: (row: any) => {
        const asg = row.employee_assignments?.[0];
        return (
          <div>
            <span className="font-bold text-slate-800 text-xs block">
              🏫 {asg?.institution_code || 'CBS'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {asg?.workload_percentage || 100}% Workload • Active
            </span>
          </div>
        );
      },
    },
    {
      key: 'contact',
      header: 'Official Contact',
      render: (row: any) => (
        <div>
          <span className="font-medium text-slate-800 block text-xs">📞 {row.phone_number || 'N/A'}</span>
          <span className="text-slate-500 text-[10px] font-mono">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          {row.status || 'ACTIVE'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/faculty/${row.id}`}
            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl font-bold text-xs transition"
            title="Edit & View 360° Profile"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            disabled={deletingId === row.id}
            title="Delete test record (Cleanup)"
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner with Dynamic Scope */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAllInstitutions ? 'All Trust Institutions' : `${selectedInstitutionObj?.name} (${selectedInstitutionObj?.code})`}
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">{staffList.length} Faculty Members in Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAllInstitutions ? 'Universal Faculty & Staff Master Directory' : `${selectedInstitutionObj?.name} Faculty`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage teacher profiles, institutional workload assignments, and statutory payroll records across Trust schools.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchStaff} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button variant="secondary" size="md" onClick={() => { setWizardStep(1); setIsEnrollModalOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>
            Enroll New Faculty
          </Button>
        </div>
      </div>

      {/* Live Staff DataTable */}
      <DataTable
        title={`Faculty & Staff (${isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name})`}
        subtitle="Direct records from PostgreSQL `staff` and `employee_assignments` tables"
        columns={columns}
        data={staffList}
        searchKey="first_name"
        searchPlaceholder="Search faculty name, department..."
        emptyTitle={`No Staff Members Found for ${isAllInstitutions ? 'Database' : selectedInstitutionObj?.name}`}
        emptyDescription={`Your database currently has 0 staff records assigned to ${isAllInstitutions ? 'any institution' : selectedInstitutionObj?.name}. Click 'Enroll New Faculty' to register a faculty member.`}
        addLabel="Enroll First Faculty Member"
        onAddFirst={() => { setWizardStep(1); setIsEnrollModalOpen(true); }}
      />

      {/* 🌟 4-STEP FACULTY ENROLLMENT WIZARD MODAL */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Faculty & Staff Enrollment Wizard"
        description="Creates permanent employee master identity and institutional assignment in PostgreSQL."
        maxWidth="xl"
      >
        <div className="space-y-5 font-sans">
          
          {/* Progress Steps */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-3">
            {[
              { step: 1, label: '1. Identity & Bio' },
              { step: 2, label: '2. School & Dept' },
              { step: 3, label: '3. Contact & Address' },
              { step: 4, label: '4. Payroll & Commit' },
            ].map((s) => (
              <div
                key={s.step}
                className={`py-1.5 rounded-xl transition ${
                  wizardStep === s.step
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : wizardStep > s.step
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>

          {/* STEP 1: Personal Demographics */}
          {wizardStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1 — Faculty Demographics & Bio</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="First Name *"
                  placeholder="e.g. Dr. Ananya"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Middle Name"
                  placeholder="e.g. Kumar"
                  value={formData.middleName || ''}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
                <Input
                  label="Last Name *"
                  placeholder="e.g. Roy"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
                <Select
                  label="Gender *"
                  options={[
                    { value: 'Female', label: 'Female' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
                <Select
                  label="Blood Group"
                  options={[
                    { value: 'O+', label: 'O+' },
                    { value: 'A+', label: 'A+' },
                    { value: 'B+', label: 'B+' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'O-', label: 'O-' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB-', label: 'AB-' },
                  ]}
                  value={formData.bloodGroup || 'O+'}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Aadhaar Number"
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.aadhaarNo || ''}
                  onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                />
                <Input
                  label="PAN Card Number"
                  placeholder="ABCDE1234F"
                  value={formData.panNo || ''}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!formData.firstName || !formData.lastName) {
                      alert('Please provide faculty first and last name.');
                      return;
                    }
                    setWizardStep(2);
                  }}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Continue to Institutional Assignment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Institutional Assignment */}
          {wizardStep === 2 && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2 — Institutional & Academic Assignment</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Assigned Institution *"
                  options={institutionsList.map(inst => ({
                    value: inst.code,
                    label: `${inst.code} (${inst.name})`
                  }))}
                  value={formData.institutionCode}
                  onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value })}
                />
                <Select
                  label="Academic Session *"
                  options={[
                    { value: '2026-2027', label: '2026–2027 (Active Session)' },
                    { value: '2025-2026', label: '2025–2026 (Previous)' },
                  ]}
                  value={formData.academicSession}
                  onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Department *"
                  options={[
                    { value: 'Academics', label: 'Academics & Teaching' },
                    { value: 'Mathematics', label: 'Mathematics' },
                    { value: 'Science & Laboratories', label: 'Science & Laboratories' },
                    { value: 'Languages', label: 'Languages (English / Hindi / Sanskrit)' },
                    { value: 'Social Sciences', label: 'Social Sciences' },
                    { value: 'Early Childhood Education', label: 'Early Childhood Education (Montessori)' },
                    { value: 'Sports & Athletics', label: 'Sports & Physical Education' },
                    { value: 'Leadership & Administration', label: 'Leadership & Administration' },
                    { value: 'Finance & Accounts', label: 'Finance & Accounts' },
                    { value: 'Transport Operations', label: 'Transport & Fleet Logistics' },
                  ]}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
                <Select
                  label="Designation / Role *"
                  options={[
                    { value: 'Principal / Head of Institution', label: 'Principal / Head of Institution' },
                    { value: 'Vice Principal / Academic Dean', label: 'Vice Principal / Academic Dean' },
                    { value: 'PGT Senior Faculty', label: 'PGT Senior Secondary Faculty' },
                    { value: 'TGT Secondary Faculty', label: 'TGT Secondary Faculty' },
                    { value: 'PRT Primary Faculty', label: 'PRT Primary Faculty' },
                    { value: 'Lead Montessori Educator', label: 'Lead Montessori Educator' },
                    { value: 'Director of Physical Education & Sports', label: 'Director of Physical Education & Sports' },
                    { value: 'Senior Accounts Officer', label: 'Senior Accounts Officer' },
                    { value: 'Transport & Fleet Supervisor', label: 'Transport & Fleet Supervisor' },
                    { value: 'Campus Pediatric Care Nurse', label: 'Campus Pediatric Care Nurse' },
                  ]}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Joining Date *"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
                <Select
                  label="Employment Type"
                  options={[
                    { value: 'FULL_TIME', label: 'Full-Time Regular' },
                    { value: 'PART_TIME', label: 'Part-Time' },
                    { value: 'CONTRACT', label: 'Contractual / Visiting' },
                  ]}
                  value={formData.employmentType || 'FULL_TIME'}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                />
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="outline" onClick={() => setWizardStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="secondary" onClick={() => setWizardStep(3)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue to Contact & Address
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Contact & Address */}
          {wizardStep === 3 && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 3 — Official Contact & Permanent Address</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Official School Email *"
                  type="email"
                  placeholder="e.g. ananya.roy@school.edu.in"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Primary Mobile Phone *"
                  placeholder="e.g. 9811000001"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Alternate Emergency Phone"
                  placeholder="e.g. 9811000099"
                  value={formData.alternatePhone || ''}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                />
                <Input
                  label="Residential City / Area"
                  placeholder="e.g. Burari, Delhi NCR"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="outline" onClick={() => setWizardStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="secondary" onClick={() => setWizardStep(4)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue to Statutory & Payroll
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Payroll & Final Commit */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 4 — Statutory Profile & Final Review</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="EPF UAN Number"
                  placeholder="100XXXXXXXXX"
                  value={formData.epfUanNo || ''}
                  onChange={(e) => setFormData({ ...formData, epfUanNo: e.target.value })}
                />
                <Input
                  label="ESIC Insurance Number"
                  placeholder="200XXXXXXXXX"
                  value={formData.esicNo || ''}
                  onChange={(e) => setFormData({ ...formData, esicNo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Salary Grade / Scale"
                  value={formData.salaryGrade || 'Grade A (Senior Faculty)'}
                  onChange={(e) => setFormData({ ...formData, salaryGrade: e.target.value })}
                />
                <Input
                  label="Bank IFSC Code"
                  value={formData.bankIfsc || 'SBIN0001234'}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                />
              </div>

              {/* Visual Summary Card */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">Enrollment Summary</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
                  <div><strong>Institution:</strong> {formData.institutionCode}</div>
                  <div><strong>Designation:</strong> {formData.designation}</div>
                  <div><strong>Department:</strong> {formData.department}</div>
                  <div><strong>Official Email:</strong> {formData.email}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="outline" onClick={() => setWizardStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEnrollSubmit}
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Commit Faculty Enrollment
                </Button>
              </div>
            </div>
          )}

        </div>
      </Modal>

    </div>
  );
}
