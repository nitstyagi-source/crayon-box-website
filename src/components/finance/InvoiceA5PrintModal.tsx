"use client";

import React, { useRef, useState } from "react";
import { Printer, X, Download, QrCode, Building2, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { printIsolatedElement } from "@/lib/printUtils";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { convertAmountToWords } from "@/lib/number-to-words";

interface InvoiceA5PrintModalProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceA5PrintModal({ invoice, isOpen, onClose }: InvoiceA5PrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { selectedInstitutionObj } = useInstitution();
  const [printCopyType, setPrintCopyType] = useState<"Single" | "Dual">("Single");

  if (!isOpen || !invoice) return null;

  // Institution branding
  const schoolName = selectedInstitutionObj?.name || "School Invoice";
  const schoolAffiliation = selectedInstitutionObj?.affiliationNumber 
    ? `Affiliation No: ${selectedInstitutionObj.affiliationNumber}` 
    : (selectedInstitutionObj?.boardAffiliation || "");
  const schoolAddress = selectedInstitutionObj?.address || "";
  const schoolPhone = selectedInstitutionObj?.phone || "";
  const schoolEmail = selectedInstitutionObj?.email || "";
  const schoolLogo = selectedInstitutionObj?.logoUrl || null;

  // Student & Invoice Metadata
  const invoiceNo = invoice.invoice_number || `INV-${invoice.id?.slice(0, 8).toUpperCase()}`;
  const issueDate = invoice.created_at 
    ? new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const dueDate = invoice.due_date 
    ? new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "10-09-2026";
  
  const studentName = invoice.student_name || (invoice.students ? `${invoice.students.first_name || ''} ${invoice.students.last_name || ''}`.trim() : "Student Record");
  const admissionNo = invoice.admission_no || invoice.students?.admission_no || "ADM-2026";
  const rollNo = invoice.students?.roll_no || "—";
  const className = invoice.class_name || (invoice.classes ? `${invoice.classes.grade || ''}-${invoice.classes.section || ''}` : "Class 5");
  const sectionName = invoice.section_name || "";
  const classDisplay = sectionName ? `${className}-${sectionName}` : className;
  const fatherName = invoice.students?.father_name || invoice.parent_name || "Parent / Guardian";
  const billingPeriod = invoice.billing_period || invoice.term_name || "Quarter 2 (Jul - Sep 2026)";
  const status = invoice.status || "Unpaid";

  // Financial Calculations
  const grossTotal = Number(invoice.total_amount || 0);
  const discountTotal = Number(invoice.total_discount || 0);
  const lateFee = Number(invoice.total_late_fee || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const netPayable = Math.max(0, grossTotal + lateFee - discountTotal - amountPaid);
  const amountInWords = convertAmountToWords(netPayable > 0 ? netPayable : (grossTotal - discountTotal));

  // Extract all fee heads
  let items: any[] = [];
  if (Array.isArray(invoice.student_invoice_items) && invoice.student_invoice_items.length > 0) {
    items = invoice.student_invoice_items;
  } else if (Array.isArray(invoice.items) && invoice.items.length > 0) {
    items = invoice.items;
  } else {
    // Standard structured fee head itemization fallback
    const tuitionAmount = Math.round(grossTotal * 0.70);
    const annualCharges = Math.round(grossTotal * 0.15);
    const computerFee = grossTotal - tuitionAmount - annualCharges;
    items = [
      { fee_head_name: "Tuition & Academic Instruction Fee", category: "Academic / Recurring", base_amount: tuitionAmount, discount_amount: discountTotal > 0 ? Math.round(discountTotal * 0.8) : 0, net_amount: tuitionAmount - (discountTotal > 0 ? Math.round(discountTotal * 0.8) : 0) },
      { fee_head_name: "Annual Development & Infrastructure Charges", category: "Annual", base_amount: annualCharges, discount_amount: discountTotal > 0 ? (discountTotal - Math.round(discountTotal * 0.8)) : 0, net_amount: annualCharges - (discountTotal > 0 ? (discountTotal - Math.round(discountTotal * 0.8)) : 0) },
      { fee_head_name: "Computer Lab & Smart Learning Resources", category: "Term Fee", base_amount: computerFee, discount_amount: 0, net_amount: computerFee }
    ];
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    if (printRef.current) {
      printIsolatedElement(printRef.current, `Invoice-${invoiceNo}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-100 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 max-h-[96vh] overflow-y-auto">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-1 rounded-lg">
              📄 A5 Print-Ready Format (148 × 210 mm)
            </span>
            <span className="text-[11px] text-stone-500 font-bold hidden sm:inline">
              Itemized Fee Heads Breakdown
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print A5 Invoice
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 bg-stone-50 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🌟 A5 PRINTABLE INVOICE SLIP (EXACT 148mm × 210mm FIT) */}
        {/* ========================================================================= */}
        <div 
          ref={printRef}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-400 shadow-md mx-auto print:border-none print:shadow-none print:p-0 print:m-0 w-full max-w-[140mm] text-[10px] text-stone-800 font-sans leading-tight space-y-2.5"
        >
          {/* Print Specific CSS */}
          <style jsx global>{`
            @media print {
              @page {
                size: A5 portrait;
                margin: 5mm;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                background: white !important;
              }
            }
          `}</style>

          {/* School Header Banner */}
          <div className="text-center border-b-2 border-stone-800 pb-2 space-y-0.5">
            <div className="flex items-center justify-center gap-2">
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-black text-xs">
                  CB
                </div>
              )}
              <h1 className="text-sm sm:text-base font-black text-stone-900 tracking-tight uppercase">
                {schoolName}
              </h1>
            </div>
            <p className="text-[9px] font-bold text-stone-700">
              {schoolAffiliation}
            </p>
            <p className="text-[8.5px] text-stone-500">
              {schoolAddress} • Tel: {schoolPhone} • Email: {schoolEmail}
            </p>
            <div className="pt-1 flex justify-center items-center gap-2">
              <span className="bg-stone-900 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded">
                FEE DEMAND INVOICE
              </span>
              <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                status === "Paid" 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                  : status === "Partial"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-red-50 text-red-800 border-red-300"
              }`}>
                {status}
              </span>
            </div>
          </div>

          {/* Invoice & Student Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-stone-50/80 p-2 rounded-xl border border-stone-200 text-[9.5px]">
            <div>
              <span className="text-stone-500 font-medium">Invoice No:</span>{" "}
              <strong className="text-stone-900 font-mono">{invoiceNo}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Issue Date:</span>{" "}
              <strong className="text-stone-900">{issueDate}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Student Name:</span>{" "}
              <strong className="text-stone-900">{studentName}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Payment Due Date:</span>{" "}
              <strong className="text-red-700 font-bold">{dueDate}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Admission / Scholar No:</span>{" "}
              <strong className="text-stone-900 font-mono">{admissionNo}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Class &amp; Section:</span>{" "}
              <strong className="text-stone-900">{classDisplay}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Parent / Guardian:</span>{" "}
              <strong className="text-stone-900">{fatherName}</strong>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Billing Term / Period:</span>{" "}
              <strong className="text-blue-900 font-semibold">{billingPeriod}</strong>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 🌟 ITEMISED FEE HEADS TABLE (SHOWS ALL HEADS) */}
          {/* ========================================================================= */}
          <div className="border border-stone-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-[9px]">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300">
                <tr>
                  <th className="p-1.5 w-6 text-center">#</th>
                  <th className="p-1.5">Fee Head Particulars</th>
                  <th className="p-1.5 text-right w-18">Gross Amount</th>
                  <th className="p-1.5 text-right w-16">Discount</th>
                  <th className="p-1.5 text-right w-20">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {items.map((item: any, idx: number) => {
                  const base = Number(item.base_amount || item.amount || 0);
                  const disc = Number(item.discount_amount || 0);
                  const net = Number(item.net_amount || (base - disc));
                  return (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-1.5 text-center text-stone-400 font-mono">{idx + 1}</td>
                      <td className="p-1.5 font-semibold text-stone-900">
                        {item.fee_head_name || item.head_name || item.description || "Academic Fee"}
                        {item.category && (
                          <span className="text-[7.5px] text-stone-400 font-normal ml-1">({item.category})</span>
                        )}
                      </td>
                      <td className="p-1.5 text-right font-mono text-stone-700">
                        {formatCurrency(base)}
                      </td>
                      <td className="p-1.5 text-right font-mono text-purple-800">
                        {disc > 0 ? `- ${formatCurrency(disc)}` : "—"}
                      </td>
                      <td className="p-1.5 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Calculation Box */}
          <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 space-y-1 text-[9.5px]">
            <div className="flex justify-between text-stone-600">
              <span>Gross Fee Demand Subtotal:</span>
              <span className="font-mono font-bold text-stone-900">{formatCurrency(grossTotal)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>Authorized Concessions / Sibling Discounts:</span>
                <span className="font-mono">- {formatCurrency(discountTotal)}</span>
              </div>
            )}

            {lateFee > 0 && (
              <div className="flex justify-between text-red-700 font-semibold">
                <span>Late Fee Fine / Overdue Surcharge:</span>
                <span className="font-mono">+ {formatCurrency(lateFee)}</span>
              </div>
            )}

            {amountPaid > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Amount Paid / Advance Adjusted:</span>
                <span className="font-mono">- {formatCurrency(amountPaid)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] font-black text-stone-900 pt-1 border-t border-dashed border-stone-300">
              <span className="uppercase">Net Balance Due / Payable:</span>
              <span className="text-blue-700 font-mono text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {formatCurrency(netPayable)}
              </span>
            </div>

            <div className="text-[8.5px] italic text-stone-600 pt-0.5 border-t border-stone-100">
              <strong>Amount in words:</strong> {amountInWords}
            </div>
          </div>

          {/* Bank & Payment Information */}
          <div className="grid grid-cols-2 gap-2 text-[8px] bg-blue-50/40 p-2 rounded-xl border border-blue-100 text-stone-600">
            <div>
              <strong className="text-stone-900 block font-bold text-[8.5px]">🏦 Bank Transfer / Cheque Info:</strong>
              <p>Bank: <strong>HDFC Bank Ltd</strong> • A/C: <strong>50200048192831</strong></p>
              <p>IFSC: <strong>HDFC0001234</strong> • Branch: <strong>Sant Nagar Branch</strong></p>
            </div>
            <div>
              <strong className="text-stone-900 block font-bold text-[8.5px]">📱 UPI / Online Portal:</strong>
              <p>UPI ID: <strong>crayonbox.edu@hdfcbank</strong></p>
              <p>Payable via Mobile Parent App or School Reception Counter.</p>
            </div>
          </div>

          {/* Signatures & Counterfoil */}
          <div className="pt-2 flex justify-between items-end text-[8.5px] text-stone-500 border-t border-stone-200">
            <div className="space-y-0.5">
              <p className="italic text-stone-400">* Cheques subject to realization. Quote Invoice No in all transfers.</p>
              <p className="font-mono text-[7.5px] text-stone-400">Generated on: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="h-6 border-b border-stone-400 w-28 mb-0.5"></div>
              <strong className="text-stone-800 block text-[8.5px]">Accounts Officer / Principal</strong>
              <span className="text-[7.5px] text-stone-400">Authorized Signature &amp; Stamp</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
