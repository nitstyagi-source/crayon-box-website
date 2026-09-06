"use client";

import React, { useRef } from "react";
import { Printer, X, Building2, Scissors } from "lucide-react";
import { convertAmountToWords } from "@/lib/number-to-words";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { printIsolatedElement } from "@/lib/printUtils";

interface PaymentVoucherA5Props {
  expense: {
    id: string;
    expense_date: string;
    department: string;
    category: string;
    expense_head: string;
    vendor_payee: string;
    description: string;
    particulars?: { item: string; amount: number }[] | string;
    amount: number;
    payment_mode: string;
    payment_ref_no?: string;
    bill_no?: string;
    bill_date?: string;
    bank_name?: string;
    cheque_no?: string;
    remarks?: string;
    vendor_address?: string;
    voucher_no?: string;
  };
  onClose: () => void;
}

export default function PaymentVoucherA5({ expense, onClose }: PaymentVoucherA5Props) {
  const { selectedInstitutionObj } = useInstitution();
  const schoolName = selectedInstitutionObj?.name || "CRAYON BOX ACADEMY";
  const schoolAddress = selectedInstitutionObj?.address || "Main Campus | Delhi NCR";
  const schoolPhone = selectedInstitutionObj?.phone || "+91 9911102027";
  const schoolEmail = selectedInstitutionObj?.principalEmail || "accounts@crayonboxschool.com";
  const schoolWebsite = selectedInstitutionObj?.websiteUrl || "www.crayonboxschool.com";

  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (printRef.current) {
      printIsolatedElement(printRef.current, `Payment-Voucher-${expense.voucher_no || expense.id.slice(0, 6)}`, {
        pageSize: "A5 landscape",
        margin: "3mm"
      });
    } else {
      window.print();
    }
  }

  // Parse particulars
  let items: { item: string; amount: number }[] = [];
  if (typeof expense.particulars === "string") {
    try {
      items = JSON.parse(expense.particulars);
    } catch {
      items = [{ item: expense.description || expense.expense_head, amount: Number(expense.amount) }];
    }
  } else if (Array.isArray(expense.particulars)) {
    items = expense.particulars;
  } else {
    items = [{ item: expense.description || expense.expense_head, amount: Number(expense.amount) }];
  }

  // Ensure up to 3 lines in debit section to match sample
  const debitLines = [...items];
  while (debitLines.length < 3) {
    debitLines.push({ item: debitLines.length === 1 && expense.remarks ? expense.remarks : "—", amount: 0 });
  }

  const formattedDate = expense.expense_date
    ? new Date(expense.expense_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-GB");

  const totalAmount = Number(expense.amount || 0);
  const amountInWords = convertAmountToWords(totalAmount);
  const voucherNo = expense.voucher_no || `PV-${new Date().getFullYear()}-${expense.id.slice(0, 4).toUpperCase()}`;
  const transactionNo = expense.payment_ref_no || expense.cheque_no || "TXN-COUNTER-01";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-stone-100 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-lg">
              A5 Standard Landscape (210 × 148 mm)
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Statutory Double-Entry Format with Left Perforated Counterfoil &amp; Sanskrit Motto
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> [ Print A5 Payment Voucher ]
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 bg-stone-50 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHYSICAL VOUCHER CANVAS (EXACT PIXEL MATCH TO A-5 REFERENCE IMAGE) */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-300 shadow-md mx-auto overflow-x-auto">
          
          <div 
            ref={printRef}
            className="voucher-page relative flex flex-row border-2 border-black w-full min-w-[760px] max-w-[840px] mx-auto text-black bg-white"
            style={{ 
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              boxSizing: 'border-box'
            }}
          >
            
            {/* --------------------------------------------------------------------- */}
            {/* 1. LEFT COUNTERFOIL / RECEIPT STRIP (WITH ROTATED TEXT & CUTTING LINE) */}
            {/* --------------------------------------------------------------------- */}
            <div className="w-[19%] border-r-2 border-dashed border-black relative p-2 flex flex-col justify-between text-[8.5px] bg-[#FAF7F2]/20">
              
              {/* Rotated Vertical Counterfoil Content */}
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
                    ₹ {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="space-y-1.5 text-[8.5px] leading-relaxed">
                  <p className="font-medium text-stone-800">
                    Received with thanks from <strong className="font-black text-stone-950 uppercase">{schoolName}</strong>
                  </p>
                  <p className="text-stone-800">
                    the sum of Rupees <span className="font-serif italic font-bold text-stone-950">{amountInWords}</span>
                  </p>
                  <p className="text-stone-800">
                    on account of <span className="border-b border-dotted border-black font-semibold text-stone-950">{expense.description || expense.expense_head}</span>
                  </p>
                  <p className="text-stone-800">
                    by {expense.payment_mode} (Transaction No: <span className="font-mono font-bold text-stone-950">{transactionNo}</span>)
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 text-[8px]">
                  <span>Date: <strong className="font-mono">{formattedDate}</strong></span>
                  <div className="border-t border-black pt-0.5 text-center min-w-[80px]">
                    <span className="font-bold">Receiver's Signature</span>
                  </div>
                </div>
              </div>

              {/* Scissors Tear Indicator at Bottom */}
              <div className="absolute -right-3 -bottom-3 flex items-center gap-0.5 bg-white px-1 z-10">
                <Scissors className="w-3 h-3 text-stone-700 rotate-90" />
                <span className="text-[6.5px] text-stone-600 italic font-mono">Please tear here</span>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* 2. MAIN VOUCHER RIGHT BODY */}
            {/* --------------------------------------------------------------------- */}
            <div className="w-[81%] flex flex-col justify-between p-3.5 space-y-2">
              
              {/* TOP LETTERHEAD: LOGO | SCHOOL NAME & SANSKRIT MOTTO | CONTACT INFO */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-300">
                
                {/* Left Logo Crest */}
                <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-stone-300 pr-3">
                  <div className="w-12 h-12 rounded-full border border-stone-400 flex flex-col items-center justify-center p-1 bg-stone-50">
                    <Building2 className="w-5 h-5 text-stone-900" />
                  </div>
                  <span className="text-[7.5px] font-black uppercase tracking-tight text-stone-900 mt-1">
                    SCHOOL LOGO
                  </span>
                  <span className="text-[6px] text-stone-500 italic">LEARNING FOR A BRIGHTER TOMORROW</span>
                </div>

                {/* Center School Name & Sanskrit Motto */}
                <div className="flex-1 text-center px-3">
                  <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-stone-950 uppercase leading-none">
                    {schoolName}
                  </h1>
                  <p className="text-[9.5px] font-semibold text-stone-700 uppercase tracking-widest mt-0.5">
                    {schoolAddress}
                  </p>
                  
                  {/* Sanskrit Motto: विद्या ददाति विनयं */}
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

                {/* Right School Contact Block */}
                <div className="border-l border-stone-300 pl-3 min-w-[160px] text-[8px] text-stone-700 space-y-0.5 font-mono">
                  <p className="truncate">📍 {schoolAddress.split('|')[0] || "Campus Road"}</p>
                  <p>📞 {schoolPhone}</p>
                  <p className="truncate">✉️ {schoolEmail}</p>
                  <p className="truncate">🌐 {schoolWebsite}</p>
                </div>

              </div>

              {/* PAYMENT VOUCHER TITLE BADGE & VOUCHER META BOX */}
              <div className="flex items-center justify-between gap-2">
                {/* Center Header Pill */}
                <div className="bg-[#E5E7EB] border border-black rounded-lg px-8 py-1">
                  <h2 className="text-sm sm:text-base font-black tracking-widest text-stone-950 uppercase font-sans">
                    PAYMENT VOUCHER
                  </h2>
                </div>

                {/* Right Voucher No & Date Box */}
                <div className="border border-black text-[9px] font-mono min-w-[200px]">
                  <div className="flex justify-between px-2 py-0.5 border-b border-black">
                    <span className="font-bold text-stone-700">VOUCHER NO.</span>
                    <span className="font-black text-stone-950">: {voucherNo}</span>
                  </div>
                  <div className="flex justify-between px-2 py-0.5 bg-stone-50">
                    <span className="font-bold text-stone-700">DATE</span>
                    <span className="font-black text-stone-950">: {formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* VENDOR & PAYMENT PARTICULARS GRID */}
              <div className="grid grid-cols-2 text-[9.5px] border border-black p-2 gap-x-4 gap-y-1 font-mono">
                {/* Left Column */}
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-24 text-stone-600 font-sans font-medium">Paid To (Name)</span>
                    <span className="font-bold text-stone-950 uppercase">: {expense.vendor_payee || "Vendor / Payee"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-stone-600 font-sans font-medium">Address</span>
                    <span className="font-medium text-stone-900">: {expense.vendor_address || "Local Supplier / Contractor"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-stone-600 font-sans font-medium">Purpose</span>
                    <span className="font-medium text-stone-900">: {expense.description || expense.expense_head}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1 border-l border-stone-300 pl-3">
                  <div className="flex">
                    <span className="w-28 text-stone-600 font-sans font-medium">Payment Mode</span>
                    <span className="font-bold text-stone-950">: {expense.payment_mode || "Bank Transfer"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-stone-600 font-sans font-medium">Transaction No.</span>
                    <span className="font-bold text-stone-950 truncate">: {transactionNo}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-stone-600 font-sans font-medium">Reference</span>
                    <span className="font-bold text-stone-950">: {expense.bill_no ? `BILL-${expense.bill_no}` : `REF-${expense.id.slice(0, 5).toUpperCase()}`}</span>
                  </div>
                </div>
              </div>

              {/* DOUBLE-ENTRY ACCOUNTING TABLES */}
              <div className="space-y-2 text-[9px]">
                
                {/* 1. DEBIT TABLE */}
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
                      {debitLines.map((item, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="py-0.5 px-2 border-r border-black text-center text-stone-600">
                            {item.item !== "—" ? idx + 1 : ""}
                          </td>
                          <td className="py-0.5 px-2 border-r border-black font-sans text-stone-900 truncate">
                            {item.item}
                          </td>
                          <td className="py-0.5 px-2 text-right font-bold text-stone-950">
                            {item.amount > 0 ? formatCurrency(item.amount) : (idx === 0 ? formatCurrency(totalAmount) : "")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-black bg-[#E5E7EB] font-bold text-[9px]">
                        <td colSpan={2} className="py-0.5 px-2 text-right border-r border-black uppercase font-black">
                          TOTAL (A)
                        </td>
                        <td className="py-0.5 px-2 text-right font-mono font-black text-stone-950">
                          ₹ {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 2. CREDIT TABLE */}
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
                          By {expense.payment_mode || "Bank Transfer"} {expense.bank_name ? `(${expense.bank_name})` : "- School Account"}
                        </td>
                        <td className="py-0.5 px-2 text-right font-bold text-stone-950">
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                      <tr className="h-5">
                        <td className="py-0.5 px-2 border-r border-black text-center text-stone-600"></td>
                        <td className="py-0.5 px-2 border-r border-black font-sans text-stone-500 italic">—</td>
                        <td className="py-0.5 px-2 text-right font-bold text-stone-950"></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-black bg-[#E5E7EB] font-bold text-[9px]">
                        <td colSpan={2} className="py-0.5 px-2 text-right border-r border-black uppercase font-black">
                          TOTAL (B)
                        </td>
                        <td className="py-0.5 px-2 text-right font-mono font-black text-stone-950">
                          ₹ {formatCurrency(totalAmount)}
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
                  : {amountInWords}
                </span>
              </div>

              {/* NOTES & AUTHORISED SIGNATORY SECTION */}
              <div className="flex justify-between items-end pt-1 gap-4">
                <div className="text-[9px] text-stone-700 flex-1">
                  <span className="font-bold">Notes (if any):</span>
                  <span className="italic pl-1">
                    {expense.remarks || "Being payment approved and released towards verified school operations."}
                  </span>
                </div>

                {/* Authorised Signatory Box */}
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

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5 landscape;
            margin: 3mm;
          }
          body * {
            visibility: hidden;
          }
          .voucher-page, .voucher-page * {
            visibility: visible;
          }
          .voucher-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}
