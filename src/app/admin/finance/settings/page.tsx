"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, AlertOctagon, RefreshCw, Upload, Download, 
  Building2, Phone, Mail, MapPin, Hash, CheckCircle2, ShieldCheck, 
  FileText, IndianRupee, Printer, AlertCircle, Clock
} from "lucide-react";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getFinanceSettings, saveFinanceSettings } from "@/app/actions/finance-core";
import { resetFinanceData } from "@/app/actions/fee-heads";

export default function SettingsModule() {
  const { currentInstitution } = useInstitution();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    institution_name: "Crayon Box School",
    school_id: "1253481",
    udise_code: "07124100151",
    contact_phone: "9811102008",
    contact_email: "crayonboxdelhi@gmail.com",
    address: "Burari, Sant Nagar, Delhi - 110084",
    receipt_prefix: "CBS-REC-",
    invoice_prefix: "INV-2026-",
    default_due_day: 10,
    late_fee_per_day: 25,
    max_late_fee: 500,
    paper_format: "A5 (148 x 210 mm) - 1 Page Standard",
    allow_partial_admin: true,
    allow_partial_parent: false,
    enforce_rte_exemption: true
  });

  useEffect(() => {
    loadSettings();
  }, [currentInstitution]);

  async function loadSettings() {
    setIsLoading(true);
    try {
      const res = await getFinanceSettings(currentInstitution);
      if (res.success && res.data) {
        setFormData({
          institution_name: res.data.institution_name || "Crayon Box School",
          school_id: res.data.school_id || "1253481",
          udise_code: res.data.udise_code || "07124100151",
          contact_phone: res.data.contact_phone || "9811102008",
          contact_email: res.data.contact_email || "crayonboxdelhi@gmail.com",
          address: res.data.address || "Burari, Sant Nagar, Delhi - 110084",
          receipt_prefix: res.data.receipt_prefix || "CBS-REC-",
          invoice_prefix: res.data.invoice_prefix || "INV-2026-",
          default_due_day: res.data.default_due_day || 10,
          late_fee_per_day: res.data.late_fee_per_day || 25,
          max_late_fee: res.data.max_late_fee || 500,
          paper_format: res.data.paper_format || "A5 (148 x 210 mm) - 1 Page Standard",
          allow_partial_admin: res.data.allow_partial_admin ?? true,
          allow_partial_parent: res.data.allow_partial_parent ?? false,
          enforce_rte_exemption: res.data.enforce_rte_exemption ?? true
        });
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveConfiguration(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.institution_name.trim()) {
      setNotification({ type: "error", message: "Please enter the official institution name." });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const res = await saveFinanceSettings({
        institution_code: currentInstitution,
        institution_name: formData.institution_name.trim(),
        school_id: formData.school_id.trim(),
        udise_code: formData.udise_code.trim(),
        contact_phone: formData.contact_phone.trim(),
        contact_email: formData.contact_email.trim(),
        address: formData.address.trim(),
        receipt_prefix: formData.receipt_prefix.trim(),
        invoice_prefix: formData.invoice_prefix.trim(),
        default_due_day: Number(formData.default_due_day),
        late_fee_per_day: Number(formData.late_fee_per_day),
        max_late_fee: Number(formData.max_late_fee)
      });

      if (res.success) {
        setNotification({
          type: "success",
          message: "🎉 Fee Configuration & School Master Credentials saved successfully!"
        });
        loadSettings();
      } else {
        setNotification({ type: "error", message: res.error || "Failed to save configuration." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetDB() {
    const confirmation = prompt("DANGER: This will delete fee templates, ledgers, and transactions for this campus. Type 'RESET' to confirm.");
    if (confirmation === 'RESET') {
      setIsResetting(true);
      const res = await resetFinanceData(currentInstitution);
      if (res.success) {
        alert("Finance Database successfully reset to a clean state.");
      } else {
        alert("Error resetting database: " + res.error);
      }
      setIsResetting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              System Master Settings
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
             <Settings className="w-8 h-8 text-stone-700" />
             Fee Settings & School Master
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Configure official school credentials, receipt & invoice numbering, A5 layout rules, and late fee penalties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
            : "bg-red-50 text-red-900 border-red-200"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          {notification.message}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveConfiguration} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Official School Identity & Contact (Used in all A5 Receipts & Invoices) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              1. Official Institution Credentials (A5 Headers)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              These details are printed at the top of all official A5 fee receipts, demand invoices, and payment slips.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Institution Legal Name *</label>
              <input
                type="text"
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. CRAYON BOX SCHOOL"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">School ID *</label>
                <input
                  type="text"
                  value={formData.school_id}
                  onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  placeholder="e.g. 1253481"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">UDISE Code of School *</label>
                <input
                  type="text"
                  value={formData.udise_code}
                  onChange={(e) => setFormData({ ...formData, udise_code: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  placeholder="e.g. 07124100151"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold text-stone-900"
                  placeholder="e.g. 9811102008"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Contact Email *</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                  placeholder="e.g. crayonboxdelhi@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Campus Physical Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                placeholder="e.g. Burari, Sant Nagar, Delhi - 110084"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Invoice, Receipt & Penalty Policies */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              2. Numbering Series & Billing Policies
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Prefix sequences, default payment due days, and late fine calculation policies.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Receipt Number Prefix</label>
                <input
                  type="text"
                  value={formData.receipt_prefix}
                  onChange={(e) => setFormData({ ...formData, receipt_prefix: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  placeholder="CBS-REC-"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={formData.invoice_prefix}
                  onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  placeholder="INV-2026-"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Due Day of Month</label>
                <input
                  type="number"
                  value={formData.default_due_day}
                  onChange={(e) => setFormData({ ...formData, default_due_day: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  min="1"
                  max="31"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Late Fee (₹/Day)</label>
                <input
                  type="number"
                  value={formData.late_fee_per_day}
                  onChange={(e) => setFormData({ ...formData, late_fee_per_day: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  min="0"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Max Late Fine (₹)</label>
                <input
                  type="number"
                  value={formData.max_late_fee}
                  onChange={(e) => setFormData({ ...formData, max_late_fee: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900"
                  min="0"
                />
              </div>
            </div>

            {/* Strict Regulatory Policies Info Box */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-[11.5px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                RTE Section 12(1)(c) Compliance: 100% Free Quota Enforced
              </div>
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Printer className="w-4 h-4 text-blue-600" />
                Print Standard: Isolated Single-Page A5 Layout
              </div>
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <IndianRupee className="w-4 h-4 text-purple-600" />
                Parent Portal Rule: Full-Due Settlement Only (No Partial Payments on Parent Portal)
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-2xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving Configuration..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Database Management & Danger Zone */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-black text-stone-900 text-lg mb-1 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" /> Data Maintenance & Export
          </h3>
          <p className="text-xs text-stone-400">Export student fee ledgers, receipts, and invoices for audit compliance.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <strong className="text-stone-900 block">Export Financial Reports</strong>
            <p className="text-stone-500">Download complete ledger transactions, collection journals, and defaulters lists in CSV format.</p>
            <a
              href="/admin/finance/reports"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition"
            >
              <Download className="w-3.5 h-3.5" /> Go to Reports & Export
            </a>
          </div>

          <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 space-y-2 text-xs">
            <strong className="text-red-900 flex items-center gap-1.5 font-black">
              <AlertOctagon className="w-4 h-4 text-red-600" /> Danger Zone
            </strong>
            <p className="text-red-800/80">Wipe transactional fee data for this campus. This action is irreversible.</p>
            <button 
              type="button"
              onClick={handleResetDB} 
              disabled={isResetting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {isResetting ? 'Resetting...' : 'Factory Reset Finance Database'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
