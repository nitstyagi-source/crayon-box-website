"use client";

import React, { useRef } from "react";
import { Printer, Download, X } from "lucide-react";
import { convertAmountToWords } from "@/lib/number-to-words";
import { useInstitution } from "@/components/providers/InstitutionContext";

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
  };
  onClose: () => void;
}

export default function PaymentVoucherA5({ expense, onClose }: PaymentVoucherA5Props) {
  const { selectedInstitutionObj } = useInstitution();
  const schoolName = selectedInstitutionObj?.name || "EDUCATIONAL INSTITUTION";
  const schoolAddress = selectedInstitutionObj?.address || "";
  const schoolIdText = selectedInstitutionObj?.affiliationNumber 
    ? `AFFILIATION / CODE: ${selectedInstitutionObj.affiliationNumber}` 
    : (selectedInstitutionObj?.code ? `CAMPUS CODE: ${selectedInstitutionObj.code}` : "");
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  // Parse particulars
  let items: { item: string; amount: number }[] = [];
  if (typeof expense.particulars === "string") {
    try {
      items = JSON.parse(expense.particulars);
    } catch {
      items = [{ item: expense.description, amount: Number(expense.amount) }];
    }
  } else if (Array.isArray(expense.particulars)) {
    items = expense.particulars;
  } else {
    items = [{ item: expense.description, amount: Number(expense.amount) }];
  }

  const formattedDate = expense.expense_date
    ? new Date(expense.expense_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-GB");

  const amountInWords = convertAmountToWords(Number(expense.amount));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-stone-100 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-900 text-xs font-black px-2.5 py-1 rounded-lg">
              A5 Print-Ready Format (148 × 210 mm)
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Voucher No. is intentionally kept blank/un-numbered per school specification
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> [ Print A5 Voucher ]
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
        {/* PHYSICAL VOUCHER CANVAS (EXACT MATCH TO REFERENCE IMAGE) */}
        {/* ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-stone-800 shadow-md mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
          
          <div 
            ref={printRef}
            className="voucher-page relative flex flex-row border-2 border-black w-full min-h-[520px] text-black font-serif bg-white"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT COUNTERFOIL / RECEIPT STRIP (ROTATED SIDE TEXT) */}
            {/* ------------------------------------------------------------- */}
            <div className="w-[28%] border-r-2 border-black p-3 flex flex-col justify-between text-[11px] leading-relaxed select-text">
              
              <div className="space-y-4 pt-2">
                <p className="font-bold text-[12px] leading-tight">
                  Received with thanks from <span className="font-black uppercase">{schoolName}</span>
                </p>

                <div className="space-y-2">
                  <div>
                    <span className="block text-[11px]">the sum of Rupees:</span>
                    <span className="font-bold border-b border-dotted border-black block min-h-[18px] text-[10px]">
                      {amountInWords}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px]">on account of:</span>
                    <span className="font-semibold border-b border-dotted border-black block min-h-[18px] text-[10px]">
                      {expense.expense_head} ({expense.vendor_payee})
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px]">by Cash/Cheque No.:</span>
                    <span className="font-semibold border-b border-dotted border-black block min-h-[18px] text-[10px]">
                      {expense.payment_mode === "Cheque" ? `Chq #${expense.cheque_no || "—"}` : expense.payment_mode} {expense.payment_ref_no ? `(${expense.payment_ref_no})` : ""} on {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <span>RS.</span>
                    <span className="border-b-2 border-black px-2 py-0.5 font-sans font-black">
                      ₹ {Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 pb-2 text-center">
                <div className="border-t border-dotted border-black pt-1 font-bold text-[11px]">
                  Receivers Signature
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* MAIN VOUCHER RIGHT BODY */}
            {/* ------------------------------------------------------------- */}
            <div className="w-[72%] flex flex-col justify-between p-4 sm:p-5">
              
              <div className="space-y-3">
                {/* Header Title */}
                <div className="text-center space-y-0.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase font-sans">
                    {schoolName}
                  </h1>
                  {schoolAddress && (
                    <p className="text-[11px] font-medium tracking-tight">
                      {schoolAddress}
                    </p>
                  )}
                  {schoolIdText && (
                    <p className="text-xs font-bold underline tracking-wide pt-0.5">
                      {schoolIdText}
                    </p>
                  )}
                  <h2 className="text-sm font-black underline tracking-widest uppercase pt-0.5">
                    PAYMENT VOUCHER
                  </h2>
                </div>

                {/* Voucher No & Date Row (Voucher No is clean & unnumbered) */}
                <div className="flex justify-between items-center text-xs font-bold pt-1 px-1">
                  <div>
                    <span>VOUCHER No:- </span>
                    <span className="inline-block border-b border-black w-28 min-h-[14px]"></span>
                  </div>
                  <div>
                    <span>Dated:- </span>
                    <span className="font-sans font-bold border-b border-black px-2">{formattedDate}</span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* DEBIT / CREDIT TWO-COLUMN ACCOUNTING TABLE */}
                {/* ========================================================= */}
                <div className="border border-black text-xs">
                  
                  {/* Row 1: DEBIT Section */}
                  <div className="flex border-b border-black">
                    <div className="w-[75%] border-r border-black p-2 min-h-[130px] flex flex-col justify-between">
                      <div>
                        <span className="font-black text-xs tracking-wider block mb-1">DEBIT</span>
                        <div className="space-y-1 text-[11px] pl-2">
                          <p className="font-bold text-stone-900">
                            Paid To: <span className="font-normal underline">{expense.vendor_payee}</span>
                          </p>
                          <p className="font-bold text-stone-900">
                            Account Head: <span className="font-normal">{expense.expense_head} ({expense.department})</span>
                          </p>
                          {items.map((it, idx) => (
                            <div key={idx} className="flex justify-between pr-2 text-stone-700">
                              <span>• {it.item}</span>
                              <span className="font-sans font-semibold">₹ {Number(it.amount).toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                          {expense.bill_no && (
                            <p className="text-[10px] text-stone-500 pt-1 italic">
                              Bill Ref: {expense.bill_no} ({expense.bill_date})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-[25%] p-2 flex flex-col justify-end items-end font-sans font-bold text-xs">
                      <span>₹ {Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Row 2: DEBIT TOTAL */}
                  <div className="flex border-b border-black font-bold text-xs bg-stone-50/50">
                    <div className="w-[75%] border-r border-black p-1.5 text-right pr-3 uppercase">
                      TOTAL
                    </div>
                    <div className="w-[25%] p-1.5 text-right font-sans font-black pr-2">
                      ₹ {Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Row 3: CREDIT Section */}
                  <div className="flex border-b border-black">
                    <div className="w-[75%] border-r border-black p-2 min-h-[60px]">
                      <span className="font-black text-xs tracking-wider block mb-0.5">CREDIT</span>
                      <div className="text-[11px] pl-2">
                        <p>
                          By {expense.payment_mode} {expense.bank_name ? `(${expense.bank_name})` : ""}
                          {expense.cheque_no ? ` - Cheque No: ${expense.cheque_no}` : ""}
                          {expense.payment_ref_no ? ` - Ref: ${expense.payment_ref_no}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="w-[25%] p-2 flex flex-col justify-end items-end font-sans font-bold text-xs">
                      <span>₹ {Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Row 4: RUPEES (IN WORDS) + FINAL TOTAL */}
                  <div className="flex font-bold text-xs">
                    <div className="w-[75%] border-r border-black p-2 flex items-center justify-between">
                      <div className="text-[10px] leading-tight">
                        <span className="font-black">RUPEES: </span>
                        <span className="font-normal underline">{amountInWords}</span>
                      </div>
                      <span className="uppercase font-bold text-[11px] shrink-0 pl-2">TOTAL</span>
                    </div>
                    <div className="w-[25%] p-2 text-right font-sans font-black text-xs pr-2 flex items-center justify-end">
                      ₹ {Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Signatures Footer */}
              <div className="pt-10 flex justify-between items-end text-xs font-bold px-2">
                <div className="text-center">
                  <div className="border-t border-black pt-1 w-28 text-[11px]">
                    Prepared By
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black pt-1 w-28 text-[11px]">
                    Checked By
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black pt-1 w-36 text-[11px]">
                    Authorised Signatory
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
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
