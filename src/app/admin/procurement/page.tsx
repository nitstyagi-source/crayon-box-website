"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Package, ShoppingCart, Truck, CheckCircle2,
  Clock, Plus, RefreshCw, IndianRupee, Building2, X,
  FileText, Printer, Edit3, Eye, Save, SlidersHorizontal, ArrowRight,
  Receipt, Check, HelpCircle, Layers, QrCode, Sparkles, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { useCampusContext } from '@/components/providers/CampusProvider';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  getProcurementPurchaseOrdersAction,
  createPurchaseOrderAction,
  PaymentVoucherData,
  savePaymentVoucherAction
} from '@/app/actions/helpdesk-procurement-actions';
import { numberToWordsINR } from '@/lib/numberUtils';
import { printIsolatedElement } from '@/lib/printUtils';
import { FixedAssetInventoryDesk } from '@/components/finance/FixedAssetInventoryDesk';

type ProcurementTab = 'pos' | 'vouchers' | 'assets' | 'consumables';

function ProcurementHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as ProcurementTab | null;

  const validTabs: ProcurementTab[] = ['pos', 'vouchers', 'assets', 'consumables'];
  const [activeTab, setActiveTab] = useState<ProcurementTab>(
    rawTab && validTabs.includes(rawTab) ? rawTab : 'pos'
  );

  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const { activeCampusId } = useCampusContext();
  const activeInst = currentInstitution || activeCampusId || 'CBS';

  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalOrders: 0, totalSpend: 0, approvedOrders: 0, deliveredOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // New PO Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('IT Infrastructure');
  const [amount, setAmount] = useState('150000');
  const [itemsSummary, setItemsSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Voucher Modal State
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherEditMode, setVoucherEditMode] = useState<"edit" | "preview">("preview");
  const [voucherData, setVoucherData] = useState<PaymentVoucherData>({
    voucher_no: "VCH-2026-089",
    voucher_date: new Date().toISOString().split('T')[0],
    institution_name: selectedInstitutionObj?.name || (isAllInstitutions ? "Vani Multi-Campus Trust HQ" : "School Administration"),
    institution_address: selectedInstitutionObj?.address || "Institutional Campus, Delhi NCR",
    school_id: selectedInstitutionObj?.affiliationNumber || selectedInstitutionObj?.code || "SCH-01",
    vendor_name: "Standard Stationery & Supplies",
    on_account_of: "Purchase of Classroom Stationery & Examination Materials",
    payment_mode: "Cheque / NEFT",
    cheque_or_txn_no: "CHQ-892104",
    cheque_date: new Date().toISOString().split('T')[0],
    debit_lines: [
      { particulars: "Stationery & Examination Material (Class 1 to 10)", amount: 25000 },
      { particulars: "Printing, Binding & Administrative Consumables", amount: 15000 },
      { particulars: "Freight, Handling & Logistics Charges", amount: 2500 }
    ],
    credit_lines: [
      { particulars: "By HDFC Bank A/c No. 502000123456 (Cheque No. 892104)", amount: 42500 }
    ],
    total_amount: 42500,
    amount_in_words: "Forty Two Thousand Five Hundred Rupees Only",
    receiver_signature_name: "Vendor Representative",
    authorised_signatory_name: "Authorised Signatory"
  });

  const printVoucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rawTab && validTabs.includes(rawTab) && rawTab !== activeTab) {
      setActiveTab(rawTab);
    }
  }, [rawTab]);

  const handleTabChange = (tab: ProcurementTab) => {
    setActiveTab(tab);
    router.push(`/admin/procurement?tab=${tab}`, { scroll: false });
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    const res = await getProcurementPurchaseOrdersAction();
    if (res.success) {
      setOrders(res.orders || []);
      setCounts(res.counts || { totalOrders: 0, totalSpend: 0, approvedOrders: 0, deliveredOrders: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'pos' || activeTab === 'vouchers') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !itemsSummary.trim()) return;

    setIsSubmitting(true);
    const res = await createPurchaseOrderAction({
      vendorName,
      category,
      totalAmount: Number(amount),
      itemsSummary
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsNewModalOpen(false);
      setVendorName('');
      setItemsSummary('');
      fetchOrders();
    } else {
      alert("Error: " + res.error);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Sandalwood Vastu Banner */}
      <VastuModuleBanner
        badgeText="Accounts Payable & Capital Assets (CapEx)"
        badgeIcon={<Package className="w-3.5 h-3.5 text-[#D97706]" />}
        institutionText={`Campus: ${activeInst} • Procurement & Fixed Asset Hub`}
        title="Procurement, Vouchers & Asset Inventory Hub"
        titleIcon={<Package className="w-7 h-7 text-[#D97706]" />}
        description="Unified procurement lifecycle uniting Purchase Orders & Vendor Contracts, Official A5 Double-Entry Payment Vouchers, Fixed Asset Depreciation Registers, and Consumables Stockroom."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              isLoading={isLoading}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              className="text-xs font-black shadow-xs bg-[#D97706] hover:bg-[#B45309] text-white"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Create Purchase Order
            </Button>
          </>
        }
      />

      {/* 4 CONSOLIDATED TABS */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('pos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'pos'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-[#D97706]" />
          <span>1. Purchase Orders &amp; Vendors</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
            {counts.totalOrders} POs
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('vouchers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#D97706]" />
          <span>2. School Payment Vouchers</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold">
            A5 Double-Entry
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'assets'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#D97706]" />
          <span>3. Fixed Asset Register &amp; Dep.</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
            NBV &amp; QR Tags
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('consumables')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'consumables'
              ? 'bg-[#FAF7F2] text-[#D97706] border-2 border-[#D97706] shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8]'
          }`}
        >
          <Truck className="w-4 h-4 text-[#D97706]" />
          <span>4. Consumables &amp; Lab Stockroom</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold">
            Reorder Radar
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PURCHASE ORDERS & VENDOR MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="space-y-6">
          
          {/* Telematics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total POs Issued</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalOrders}</span>
              <span className="text-[11px] text-slate-500 font-semibold">Active Financial Year</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Approved Spend</span>
              <span className="text-3xl font-black text-indigo-700 mt-1 block font-mono">{formatCurrency(counts.totalSpend)}</span>
              <span className="text-[11px] text-indigo-800 font-bold">Approved Procurements</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Orders Approved</span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block">{counts.approvedOrders}</span>
              <span className="text-[11px] text-emerald-800 font-bold">Trustee Authorized</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivered &amp; Verified</span>
              <span className="text-3xl font-black text-amber-700 mt-1 block">{counts.deliveredOrders}</span>
              <span className="text-[11px] text-amber-800 font-bold">Goods Received (GRN)</span>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E8DFC8] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  School Purchase Orders Register
                </h3>
                <p className="text-xs text-slate-500">
                  Track vendor requisitions, approval matrices, and delivery confirmations.
                </p>
              </div>

              <Button
                variant="saffron"
                size="sm"
                onClick={() => setIsNewModalOpen(true)}
                className="text-xs font-black shadow-xs bg-[#D97706] hover:bg-[#B45309] text-white"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + New Order
              </Button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                <span>Loading purchase orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No purchase orders recorded. Click "+ New Order" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-[#E8DFC8]">
                      <th className="py-3 px-4">PO Number</th>
                      <th className="py-3 px-4">Vendor &amp; Requisitioner</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Summary of Items</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC8]">
                    {orders.map((po) => (
                      <tr key={po.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{po.po_number}</td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-bold">{po.vendor_name}</strong>
                          <span className="text-[10px] text-slate-400">Req: {po.requested_by || 'Admin'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-bold">
                            {po.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{po.items_summary}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          {formatCurrency(po.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase border ${
                            po.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            po.status === 'Approved' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHOOL PAYMENT VOUCHERS */}
      {/* ========================================================================= */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 font-black text-[10px] uppercase rounded-md">
                Double-Entry Accounting Protocol
              </span>
              <h3 className="text-base font-black text-slate-900">
                Official School Accounts Payment Voucher (A5 Double-Entry Format)
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Statutory audit-ready payment voucher with itemized debit ledger heads, bank credit details, amount in words, and authorized trustee signature stamps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                Print A5 Payment Voucher
              </button>
            </div>
          </div>

          {/* Printable A5 Voucher Canvas */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-300 shadow-md space-y-6 text-slate-900 max-w-3xl mx-auto print:m-0 print:p-0 print:border-none">
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
              <h2 className="text-xl font-black uppercase text-slate-900">
                {voucherData.institution_name || selectedInstitutionObj?.name || "EDUCATIONAL INSTITUTION"}
              </h2>
              <p className="text-[10px] uppercase text-slate-600 font-bold">
                {voucherData.institution_address || selectedInstitutionObj?.address || "Main Campus"} • ID: {voucherData.school_id || selectedInstitutionObj?.code || "SCH"}
              </p>
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 pt-1">PAYMENT VOUCHER</h3>
            </div>

            <div className="flex justify-between items-center text-xs font-bold bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFC8]">
              <div>Voucher No: <span className="font-mono font-black text-slate-950">{voucherData.voucher_no}</span></div>
              <div>Date: <span className="font-mono">{voucherData.voucher_date}</span></div>
              <div>Mode: <span className="font-mono text-emerald-800">{voucherData.payment_mode}</span></div>
            </div>

            <div className="text-xs space-y-1">
              <div>Paid To (Vendor): <strong className="text-slate-900">{voucherData.vendor_name}</strong></div>
              <div>On Account Of: <span className="text-slate-700 italic">{voucherData.on_account_of}</span></div>
            </div>

            <div className="border border-[#E8DFC8] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[10px] font-black uppercase text-slate-600 border-b border-[#E8DFC8]">
                    <th className="py-2 px-3">Particulars / Debit Head</th>
                    <th className="py-2 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]">
                  {voucherData.debit_lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-800">{l.particulars}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{formatCurrency(l.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#FAF7F2] font-black border-t-2 border-[#E8DFC8]">
                    <td className="py-2 px-3 uppercase">Total Disbursed:</td>
                    <td className="py-2 px-3 text-right font-mono text-sm text-indigo-900">{formatCurrency(voucherData.total_amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-xs font-bold text-slate-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              Amount in Words: <span className="italic text-slate-950">{voucherData.amount_in_words}</span>
            </div>

            <div className="pt-8 grid grid-cols-2 text-center text-xs font-black text-slate-700 border-t border-slate-200">
              <div>
                <div className="h-8"></div>
                <span>Receiver's Signature</span>
              </div>
              <div>
                <div className="h-8"></div>
                <span className="text-slate-950 font-black">Authorised Signatory / Trustee</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FIXED ASSET REGISTER & DEPRECIATION */}
      {/* ========================================================================= */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <FixedAssetInventoryDesk embedded={true} defaultTab="assets" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSUMABLES & LAB STOCKROOM */}
      {/* ========================================================================= */}
      {activeTab === 'consumables' && (
        <div className="space-y-6">
          <FixedAssetInventoryDesk embedded={true} defaultTab="consumables" />
        </div>
      )}

      {/* Create PO Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                Issue New Purchase Order
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor / Supplier Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Navneet Education Supplies"
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Procurement Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white"
                >
                  <option value="IT Infrastructure">IT Infrastructure &amp; Smart Class</option>
                  <option value="Stationery & Printing">Stationery, Printing &amp; Books</option>
                  <option value="Science Lab Apparatus">Science Lab Apparatus &amp; Chemicals</option>
                  <option value="Sports Equipment">Sports Equipment &amp; Fitness</option>
                  <option value="Campus Maintenance">Campus Maintenance &amp; Electricals</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Estimated Total Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Summary of Requisitioned Items</label>
                <textarea
                  required
                  rows={3}
                  value={itemsSummary}
                  onChange={(e) => setItemsSummary(e.target.value)}
                  placeholder="e.g. 50 Sets of Student Desks, 2 Whiteboards, 500 Notebooks"
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="saffron" size="sm" type="submit" isLoading={isSubmitting}>
                  Submit PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcurementHubPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        <span>Loading Procurement, Vouchers &amp; Asset Inventory Hub...</span>
      </div>
    }>
      <ProcurementHubContent />
    </Suspense>
  );
}
