"use client";

import { useState, useEffect } from "react";
import { QrCode, CheckCircle2, Coffee, Plus, Minus, Search, Trash2, ArrowRight } from "lucide-react";
import { searchCanteenStudentAction, chargeCanteenAccountAction, CanteenStudent } from "@/app/actions/canteen-actions";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

const CANTEEN_MENU: MenuItem[] = [
  { id: "M1", name: "Healthy Balanced Thali / Combo", category: "Meals", price: 100 },
  { id: "M2", name: "Whole Wheat Veggie Wrap", category: "Meals", price: 60 },
  { id: "M3", name: "Grilled Paneer Sandwich", category: "Snacks", price: 45 },
  { id: "M4", name: "Fresh Seasonal Fruit Bowl", category: "Snacks", price: 35 },
  { id: "M5", name: "Fresh Cold-Pressed Apple Juice", category: "Beverages", price: 25 },
  { id: "M6", name: "Organic Flavored Milk (Badam)", category: "Beverages", price: 30 },
];

export default function CanteenPOS() {
  const [cart, setCart] = useState<Array<{ item: MenuItem; qty: number }>>([
    { item: CANTEEN_MENU[0], qty: 1 },
    { item: CANTEEN_MENU[4], qty: 1 }
  ]);
  const [scanMode, setScanMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedStudent, setScannedStudent] = useState<CanteenStudent | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [chargeSuccessMsg, setChargeSuccessMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  const totalAmount = cart.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(e => e.item.id === item.id);
      if (existing) {
        return prev.map(e => e.item.id === item.id ? { ...e, qty: e.qty + 1 } : e);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(e => e.item.id === itemId ? { ...e, qty: Math.max(0, e.qty + delta) } : e)
        .filter(e => e.qty > 0);
    });
  };

  const handleLookupStudent = async (term?: string) => {
    const query = term || searchQuery;
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchCanteenStudentAction(query);
      if (res.success && res.student) {
        setScannedStudent(res.student);
        setScanMode(false);
      } else {
        setSearchError(res.error || "Student not found");
      }
    } catch (e: any) {
      setSearchError(e.message || "Failed to search student");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCharge = async () => {
    if (!scannedStudent || totalAmount <= 0) return;
    if (scannedStudent.balance < totalAmount) {
      setSearchError(`Insufficient balance (₹${scannedStudent.balance.toFixed(2)}). Total is ₹${totalAmount.toFixed(2)}.`);
      return;
    }

    setIsProcessing(true);
    setSearchError(null);
    try {
      const res = await chargeCanteenAccountAction({
        studentId: scannedStudent.id,
        admissionNo: scannedStudent.admissionNo,
        amount: totalAmount,
        items: cart.map(c => ({ name: c.item.name, qty: c.qty, price: c.item.price }))
      });

      if (res.success) {
        setChargeSuccessMsg(res.message || `✓ ₹${totalAmount.toFixed(2)} successfully deducted from Smart Wallet!`);
        setScannedStudent(prev => prev ? { ...prev, balance: prev.balance - totalAmount } : null);
        setTimeout(() => {
          setChargeSuccessMsg(null);
          setScannedStudent(null);
          setScanMode(true);
          setCart([
            { item: CANTEEN_MENU[0], qty: 1 }
          ]);
        }, 3000);
      } else {
        setSearchError(res.error || "Transaction failed");
      }
    } catch (e: any) {
      setSearchError(e.message || "Failed to complete transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Kiosk Header */}
      <header className="bg-black/40 border-b border-white/10 p-6 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Campus Canteen POS</h1>
            <p className="text-slate-400 text-sm">Smart Wallet Terminal • Authentic Student POS</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono text-white">{currentTime || "12:45 PM"}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
        {/* Menu & Cart Column */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {/* Quick Menu Selection */}
          <div className="bg-slate-800/80 rounded-3xl p-5 border border-white/10 flex-1 flex flex-col">
            <h3 className="text-white font-bold text-sm mb-3">Add Items to Meal Order</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 overflow-y-auto max-h-[260px] pr-1">
              {CANTEEN_MENU.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-slate-700/60 hover:bg-slate-700 border border-white/5 rounded-2xl p-3 text-left transition flex flex-col justify-between group"
                >
                  <span className="text-white font-semibold text-xs line-clamp-2">{item.name}</span>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                    <span className="text-emerald-400 font-bold font-mono text-xs">₹{item.price}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart View */}
          <div className="bg-white rounded-3xl p-6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-lg font-bold text-slate-800">Current Order ({cart.reduce((s, c) => s + c.qty, 0)} items)</h2>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-rose-600 font-bold flex items-center gap-1 hover:underline">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 max-h-[200px] pr-1">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-6 text-center">Cart is empty. Select items from the menu above.</p>
              ) : (
                cart.map(c => (
                  <div key={c.item.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-xs">{c.item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">₹{c.item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(c.item.id, -1)} className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center">{c.qty}</span>
                      <button onClick={() => updateQty(c.item.id, 1)} className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700">
                        <Plus className="w-3 h-3" />
                      </button>
                      <p className="font-black text-slate-900 text-xs w-14 text-right font-mono">
                        ₹{(c.item.price * c.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mt-3">
              <div className="flex justify-between items-center text-2xl font-black text-slate-900">
                <span>Total:</span>
                <span className="text-emerald-600 font-mono">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner & Student Verification View */}
        <div className="w-full lg:w-1/2 bg-slate-800 rounded-3xl border border-white/10 p-8 flex flex-col justify-center items-center relative">
          {scanMode && (
            <div className="w-full max-w-md flex flex-col items-center">
              {/* Tap ID Card Button */}
              <button 
                onClick={() => handleLookupStudent("CBS")}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-4 border-emerald-500 rounded-3xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-slate-900/50">
                  <QrCode className="w-24 h-24 sm:w-28 sm:h-28 text-emerald-400 opacity-60 group-hover:opacity-100 transition" />
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] animate-[ping_1.5s_ease-in-out_infinite]"></div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Tap Student ID Card</h2>
                <p className="text-slate-400 mt-1 text-sm text-center">Tap NFC badge or enter admission number below</p>
              </button>

              {/* Search Bar for manual entry */}
              <div className="w-full mt-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLookupStudent()}
                      placeholder="Enter Admission No or Student Name..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => handleLookupStudent()}
                    disabled={isSearching}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center gap-1"
                  >
                    {isSearching ? "Searching..." : <>Find <ArrowRight className="w-3 h-3" /></>}
                  </button>
                </div>

                {searchError && (
                  <p className="text-rose-400 text-xs text-center mt-2 font-bold">{searchError}</p>
                )}
              </div>
            </div>
          )}

          {scannedStudent && (
            <div className="bg-white p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-300 max-w-md w-full">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mb-4 text-2xl font-black text-emerald-800">
                {scannedStudent.name.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-0.5">{scannedStudent.name}</h2>
              <p className="text-xs text-slate-400 font-mono mb-1">Badge / Admission: {scannedStudent.admissionNo}</p>
              <p className="text-xs font-bold text-slate-600 mb-4">{scannedStudent.grade}</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Wallet Balance</span>
                <span className="text-xl font-mono font-black text-emerald-600">₹{scannedStudent.balance.toFixed(2)}</span>
              </div>

              {chargeSuccessMsg ? (
                <div className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold py-3.5 px-4 rounded-2xl mb-4 text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{chargeSuccessMsg}</span>
                </div>
              ) : (
                <>
                  {searchError && (
                    <p className="text-rose-600 text-xs font-bold mb-3">{searchError}</p>
                  )}
                  <button 
                    onClick={handleCharge}
                    disabled={isProcessing || totalAmount <= 0}
                    className="w-full bg-emerald-500 text-white text-lg font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-600 transition disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : `Charge ₹${totalAmount.toFixed(2)}`}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => { setScannedStudent(null); setScanMode(true); setSearchError(null); }} 
                className="mt-4 text-slate-400 font-bold hover:text-slate-600 text-xs"
              >
                Cancel / Return to Scanner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
