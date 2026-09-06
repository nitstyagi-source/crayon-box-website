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
  const [amount, setAmount] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Voucher Modal State
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherEditMode, setVoucherEditMode] = useState<"edit" | "preview">("preview");
  const [voucherData, setVoucherData] = useState<PaymentVoucherData>({
    voucher_no: "VCH-" + new Date().getFullYear() + "-001",
    voucher_date: new Date().toISOString().split('T')[0],
    institution_name: selectedInstitutionObj?.name || (isAllInstitutions ? "Vani Multi-Campus Trust HQ" : "School Administration"),
    institution_address: selectedInstitutionObj?.address || "Institutional Campus, Delhi NCR",
    school_id: selectedInstitutionObj?.affiliationNumber || selectedInstitutionObj?.code || "SCH-01",
    vendor_name: "",
    on_account_of: "",
    payment_mode: "Cheque / NEFT",
    cheque_or_txn_no: "",
    cheque_date: new Date().toISOString().split('T')[0],
    debit_lines: [],
    credit_lines: [],
    total_amount: 0,
    amount_in_words: "Zero Rupees Only",
    receiver_signature_name: "",
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

          {/* Printable A5 Voucher Canvas (Matches Sample Design with Counterfoil) */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-300 shadow-md max-w-4xl mx-auto overflow-x-auto print:m-0 print:p-0 print:border-none">
            <div 
              ref={printVoucherRef}
              className="relative flex flex-row border-2 border-black w-full min-w-[760px] max-w-[840px] mx-auto text-black bg-white"
              style={{ 
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxSizing: 'border-box'
              }}
            >
              {/* 1. LEFT COUNTERFOIL STRIP */}
              <div className="w-[19%] border-r-2 border-dashed border-black relative p-2 flex flex-col justify-between text-[8.5px] bg-[#FAF7F2]/20">
                <div 
                  className="w-full h-full flex flex-col justify-between py-1"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    letterSpacing: "0.2px"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-700">Rs.</span>
                    <span className="font-mono font-black text-[10px] border-b border-black pb-0.5 min-w-[90px] text-stone-950">
                      ₹ {formatCurrency(voucherData.total_amount || 0)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[8.5px] leading-relaxed">
                    <p className="font-medium text-stone-800">
                      Received with thanks from <strong className="font-black text-stone-950 uppercase">{voucherData.institution_name || selectedInstitutionObj?.name || "CRAYON BOX ACADEMY"}</strong>
                    </p>
                    <p className="text-stone-800">
                      the sum of Rupees <span className="font-serif italic font-bold text-stone-950">{voucherData.amount_in_words || "Zero Rupees Only"}</span>
                    </p>
                    <p className="text-stone-800">
                      on account of <span className="border-b border-dotted border-black font-semibold text-stone-950">{voucherData.on_account_of || "Operational Procurement"}</span>
                    </p>
                    <p className="text-stone-800">
                      by {voucherData.payment_mode || "Bank Transfer"} (Transaction No: <span className="font-mono font-bold text-stone-950">{voucherData.cheque_or_txn_no || "TXN-001"}</span>)
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[8px]">
                    <span>Date: <strong className="font-mono">{voucherData.voucher_date}</strong></span>
                    <div className="border-t border-black pt-0.5 text-center min-w-[80px]">
                      <span className="font-bold">Receiver's Signature</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 -bottom-3 flex items-center gap-0.5 bg-white px-1 z-10">
                  <span className="text-[6.5px] text-stone-600 italic font-mono">✂ Please tear here</span>
                </div>
              </div>

              {/* 2. MAIN VOUCHER RIGHT BODY */}
              <div className="w-[81%] flex flex-col justify-between p-3.5 space-y-2">
                
                {/* Header: Logo | School Name & Sanskrit Motto | Contact */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-300">
                  <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-stone-300 pr-3">
                    <div className="w-12 h-12 rounded-full border border-stone-400 flex flex-col items-center justify-center p-1 bg-stone-50">
                      <Building2 className="w-5 h-5 text-stone-900" />
                    </div>
                    <span className="text-[7.5px] font-black uppercase tracking-tight text-stone-900 mt-1">
                      SCHOOL LOGO
                    </span>
                    <span className="text-[6px] text-stone-500 italic">LEARNING FOR A BRIGHTER TOMORROW</span>
                  </div>

                  <div className="flex-1 text-center px-3">
                    <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-stone-950 uppercase leading-none">
                      {voucherData.institution_name || selectedInstitutionObj?.name || "CRAYON BOX ACADEMY"}
                    </h1>
                    <p className="text-[9.5px] font-semibold text-stone-700 uppercase tracking-widest mt-0.5">
                      {voucherData.institution_address || selectedInstitutionObj?.address || "Main Campus | Delhi NCR"}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 my-1">
                      <div className="h-[1px] bg-amber-800/60 w-12"></div>
                      <span className="text-xs font-serif font-black text-amber-900 tracking-wider">
                        विद्या ददाति विनयम्
                      </span>
                      <div className="h-[1px] bg-amber-800/60 w-12"></div>
                    </div>
                    <p className="text-[8px] font-serif uppercase tracking-widest text-stone-600 font-medium">
                      KNOWLEDGE LEADS TO HUMILITY
                    </p>
                  </div>

                  <div className="border-l border-stone-300 pl-3 min-w-[160px] text-[8px] text-stone-700 space-y-0.5 font-mono">
                    <p className="truncate">📍 {(voucherData.institution_address || selectedInstitutionObj?.address || "Main Campus").split('|')[0]}</p>
                    <p>📞 {selectedInstitutionObj?.phone || "+91 9911102027"}</p>
                    <p className="truncate">✉️ {selectedInstitutionObj?.principalEmail || "accounts@crayonboxschool.com"}</p>
                    <p className="truncate">🌐 {selectedInstitutionObj?.websiteUrl || "www.crayonboxschool.com"}</p>
                  </div>
                </div>

                {/* Title Badge & Voucher Meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="bg-[#E5E7EB] border border-black rounded-lg px-8 py-1">
                    <h2 className="text-sm sm:text-base font-black tracking-widest text-stone-950 uppercase font-sans">
                      PAYMENT VOUCHER
                    </h2>
                  </div>

                  <div className="border border-black text-[9px] font-mono min-w-[200px]">
                    <div className="flex justify-between px-2 py-0.5 border-b border-black">
                      <span className="font-bold text-stone-700">VOUCHER NO.</span>
                      <span className="font-black text-stone-950">: {voucherData.voucher_no}</span>
                    </div>
                    <div className="flex justify-between px-2 py-0.5 bg-stone-50">
                      <span className="font-bold text-stone-700">DATE</span>
                      <span className="font-black text-stone-950">: {voucherData.voucher_date}</span>
                    </div>
                  </div>
                </div>

                {/* Particulars Grid */}
                <div className="grid grid-cols-2 text-[9.5px] border border-black p-2 gap-x-4 gap-y-1 font-mono">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-24 text-stone-600 font-sans font-medium">Paid To (Name)</span>
                      <span className="font-bold text-stone-950 uppercase">: {voucherData.vendor_name || "Vendor / Supplier"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-stone-600 font-sans font-medium">Address</span>
                      <span className="font-medium text-stone-900">: Local Supplier / Contractor</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-stone-600 font-sans font-medium">Purpose</span>
                      <span className="font-medium text-stone-900">: {voucherData.on_account_of || "Operational Procurement"}</span>
                    </div>
                  </div>

                  <div className="space-y-1 border-l border-stone-300 pl-3">
                    <div className="flex">
                      <span className="w-28 text-stone-600 font-sans font-medium">Payment Mode</span>
                      <span className="font-bold text-stone-950">: {voucherData.payment_mode || "Bank Transfer"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-stone-600 font-sans font-medium">Transaction No.</span>
                      <span className="font-bold text-stone-950 truncate">: {voucherData.cheque_or_txn_no || "TXN-001"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-stone-600 font-sans font-medium">Reference</span>
                      <span className="font-bold text-stone-950">: PO-{voucherData.voucher_no.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                {/* Double-Entry Tables */}
                <div className="space-y-2 text-[9px]">
                  {/* DEBIT TABLE */}
                  <div className="border border-black">
                    <div className="bg-[#E5E7EB] border-b border-black px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] text-stone-900">
                      DEBIT
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black bg-stone-50 text-[8.5px] font-bold text-stone-800 uppercase">
                          <th className="py-0.5 px-2 border-r border-black w-10 text-center">S.No.</th>
                          <th className="py-0.5 px-2 border-r border-black">Account Head / Description</th>
                          <th className="py-0.5 px-2 text-right w-28">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 font-mono text-[9px]">
                        {(voucherData.debit_lines.length > 0 ? voucherData.debit_lines : [{ particulars: voucherData.on_account_of || "Procurement Ledger", amount: voucherData.total_amount }]).map((item, idx) => (
                          <tr key={idx} className="h-5">
                            <td className="py-0.5 px-2 border-r border-black text-center text-stone-600">{idx + 1}</td>
                            <td className="py-0.5 px-2 border-r border-black font-sans text-stone-900 truncate">{item.particulars}</td>
                            <td className="py-0.5 px-2 text-right font-bold text-stone-950">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-black bg-[#E5E7EB] font-bold text-[9px]">
                          <td colSpan={2} className="py-0.5 px-2 text-right border-r border-black uppercase font-black">
                            TOTAL (A)
                          </td>
                          <td className="py-0.5 px-2 text-right font-mono font-black text-stone-950">
                            ₹ {formatCurrency(voucherData.total_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* CREDIT TABLE */}
                  <div className="border border-black">
                    <div className="bg-[#E5E7EB] border-b border-black px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] text-stone-900">
                      CREDIT
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black bg-stone-50 text-[8.5px] font-bold text-stone-800 uppercase">
                          <th className="py-0.5 px-2 border-r border-black w-10 text-center">S.No.</th>
                          <th className="py-0.5 px-2 border-r border-black">Account Head / Description</th>
                          <th className="py-0.5 px-2 text-right w-28">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 font-mono text-[9px]">
                        <tr className="h-5">
                          <td className="py-0.5 px-2 border-r border-black text-center text-stone-600">1</td>
                          <td className="py-0.5 px-2 border-r border-black font-sans text-stone-900">
                            By {voucherData.payment_mode || "Bank Transfer"} - Official School Account
                          </td>
                          <td className="py-0.5 px-2 text-right font-bold text-stone-950">
                            {formatCurrency(voucherData.total_amount)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-black bg-[#E5E7EB] font-bold text-[9px]">
                          <td colSpan={2} className="py-0.5 px-2 text-right border-r border-black uppercase font-black">
                            TOTAL (B)
                          </td>
                          <td className="py-0.5 px-2 text-right font-mono font-black text-stone-950">
                            ₹ {formatCurrency(voucherData.total_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* RUPEES (IN WORDS) BAR */}
                <div className="bg-[#E5E7EB] border border-black p-1.5 flex items-center gap-2 text-[9.5px]">
                  <span className="font-black uppercase tracking-wider text-stone-950 shrink-0">
                    RUPEES (IN WORDS)
                  </span>
                  <span className="font-serif italic font-bold text-stone-900">
                    : {voucherData.amount_in_words || "Zero Rupees Only"}
                  </span>
                </div>

                {/* NOTES & SIGNATORY */}
                <div className="flex justify-between items-end pt-1 gap-4">
                  <div className="text-[9px] text-stone-700 flex-1">
                    <span className="font-bold">Notes (if any):</span>
                    <span className="italic pl-1">
                      Being payment authorized towards statutory school procurement &amp; operational expenses.
                    </span>
                  </div>

                  <div className="border border-black px-6 py-3 text-center min-w-[160px] bg-stone-50/50">
                    <div className="h-4"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider block border-t border-black pt-1">
                      Authorised Signatory
                    </span>
                  </div>
                </div>

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
