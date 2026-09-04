"use client";

import React, { useState } from "react";
import {
  ShieldAlert, Radio, AlertTriangle, CheckCircle2,
  Users, UserCheck, PhoneCall, Send, Lock, VideoOff,
  RefreshCw, Flame, CloudRain, Wind, BellRing, Sparkles
} from "lucide-react";
import { erpEventEngine } from "@/lib/core/events/event-engine";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { Button } from "@/components/ui/Button";

interface EvacuationTally {
  zone: string;
  totalAssigned: number;
  verifiedSafe: number;
  status: "CLEAR" | "IN_PROGRESS" | "CHECKING";
}

export function EmergencyBroadcastDesk() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj } = useInstitution();

  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<"LOCKDOWN" | "FIRE" | "EARTHQUAKE" | "SMOG">("LOCKDOWN");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "EMERGENCY ALERT: Campus lockdown initiated. All students and faculty must remain in secure classrooms with doors locked until all-clear is declared."
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [dispatchedStats, setDispatchedStats] = useState({ parents: 0, staff: 0, drivers: 0 });

  // Evacuation Zones Muster
  const [zones, setZones] = useState<EvacuationTally[]>([
    { zone: "Assembly Ground A (Primary Wing)", totalAssigned: 320, verifiedSafe: 320, status: "CLEAR" },
    { zone: "Assembly Ground B (Middle & Senior)", totalAssigned: 480, verifiedSafe: 462, status: "IN_PROGRESS" },
    { zone: "Indoor Sports Complex (Staff & Admin)", totalAssigned: 65, verifiedSafe: 65, status: "CLEAR" },
    { zone: "Transport Yard (Drivers & Attendants)", totalAssigned: 28, verifiedSafe: 28, status: "CLEAR" },
  ]);

  const handleProtocolChange = (protocol: "LOCKDOWN" | "FIRE" | "EARTHQUAKE" | "SMOG") => {
    setSelectedProtocol(protocol);
    if (protocol === "LOCKDOWN") {
      setBroadcastMessage("EMERGENCY ALERT: Campus lockdown initiated. All students and faculty must remain in secure classrooms with doors locked until all-clear is declared.");
    } else if (protocol === "FIRE") {
      setBroadcastMessage("FIRE ALARM EVACUATION: Immediate evacuation. Follow designated emergency fire escape corridors to Primary Assembly Ground. Do not use lifts.");
    } else if (protocol === "EARTHQUAKE") {
      setBroadcastMessage("EARTHQUAKE PROTOCOL: Drop, Cover, and Hold On under sturdy desks. Await siren before orderly evacuation to open football grounds.");
    } else if (protocol === "SMOG") {
      setBroadcastMessage("GOVT ADVISORY: Severe AQI Air Quality Alert. Immediate suspension of outdoor activities. Air purifiers active in all junior wings.");
    }
  };

  const handleTriggerLockdown = () => {
    setIsLockdownActive(true);
    erpEventEngine.publish({
      eventType: "EMERGENCY_LOCKDOWN_TRIGGERED",
      campusId: activeCampusId || "c3d782a9-a50b-4708-a3fc-6b146f456662",
      actor: { userId: "usr-admin", name: "Principal Desk", role: "Principal" },
      entity: { type: "CAMPUS", id: activeCampusId || "c3d782a9-a50b-4708-a3fc-6b146f456662" },
      metadata: { reason: `${selectedProtocol} Protocol Initiated`, protocol: selectedProtocol },
    });
  };

  const handleReleaseLockdown = () => {
    setIsLockdownActive(false);
    setBroadcastSent(false);
    erpEventEngine.publish({
      eventType: "EMERGENCY_LOCKDOWN_RELEASED",
      campusId: activeCampusId || "c3d782a9-a50b-4708-a3fc-6b146f456662",
      actor: { userId: "usr-admin", name: "Principal Desk", role: "Principal" },
      entity: { type: "CAMPUS", id: activeCampusId || "c3d782a9-a50b-4708-a3fc-6b146f456662" },
      metadata: { reason: "All Clear Declared by Incident Commander" },
    });
  };

  const handleSendBroadcast = async () => {
    setIsBroadcasting(true);
    // Simulate real SMS/WhatsApp dispatcher latency
    await new Promise((r) => setTimeout(r, 1000));
    setDispatchedStats({ parents: 850, staff: 72, drivers: 18 });
    setBroadcastSent(true);
    setIsBroadcasting(false);
  };

  const markZoneClear = (index: number) => {
    setZones((prev) =>
      prev.map((z, i) =>
        i === index ? { ...z, verifiedSafe: z.totalAssigned, status: "CLEAR" } : z
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Threat Indicator */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isLockdownActive
          ? "bg-rose-950 border-rose-600 text-white shadow-2xl animate-pulse"
          : "bg-[#FAF7F2] border-[#E8DFC8] text-[#2D2319] shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                isLockdownActive
                  ? "bg-rose-600 text-white border-rose-400"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}>
                {isLockdownActive ? "RED ALERT ACTIVE" : "CAMPUS READY STATE"}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                {selectedInstitutionObj?.name || "Crayon Box School"}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <ShieldAlert className={`w-7 h-7 ${isLockdownActive ? "text-rose-400" : "text-amber-600"}`} />
              Institutional Emergency & NDMA Disaster Command
            </h2>
            <p className={`text-xs ${isLockdownActive ? "text-rose-200" : "text-stone-600"} max-w-2xl`}>
              Rapid multi-hazard response hub aligned with CBSE & NDMA guidelines: 1-click campus lockdown, parent WhatsApp emergency broadcasts, and live assembly point roll-call.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isLockdownActive ? (
              <button
                onClick={handleReleaseLockdown}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Declare All-Clear
              </button>
            ) : (
              <button
                onClick={handleTriggerLockdown}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Trigger Campus Lockdown
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Selection & Broadcast Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hazard Protocols & Message */}
        <div className="lg:col-span-7 bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#2D2319] uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#D97706]" /> 1. Select Emergency Protocol
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleProtocolChange("LOCKDOWN")}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                selectedProtocol === "LOCKDOWN"
                  ? "bg-rose-50 border-rose-400 text-rose-800 shadow-xs"
                  : "bg-white border-[#E8DFC8] text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Lock className="w-4 h-4 text-rose-600" />
              <span>Lockdown</span>
            </button>
            <button
              onClick={() => handleProtocolChange("FIRE")}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                selectedProtocol === "FIRE"
                  ? "bg-amber-50 border-amber-400 text-amber-800 shadow-xs"
                  : "bg-white border-[#E8DFC8] text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Fire Evac</span>
            </button>
            <button
              onClick={() => handleProtocolChange("EARTHQUAKE")}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                selectedProtocol === "EARTHQUAKE"
                  ? "bg-blue-50 border-blue-400 text-blue-800 shadow-xs"
                  : "bg-white border-[#E8DFC8] text-stone-700 hover:bg-stone-50"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span>Earthquake</span>
            </button>
            <button
              onClick={() => handleProtocolChange("SMOG")}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                selectedProtocol === "SMOG"
                  ? "bg-stone-100 border-stone-400 text-stone-900 shadow-xs"
                  : "bg-white border-[#E8DFC8] text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Wind className="w-4 h-4 text-stone-600" />
              <span>Severe AQI</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span>Multi-Channel Broadcast Text (SMS, WhatsApp, App Push)</span>
              <span className="text-[10px] text-stone-500 font-normal">{broadcastMessage.length} chars</span>
            </label>
            <textarea
              rows={4}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full text-xs font-medium p-3.5 rounded-xl border border-[#E8DFC8] bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-stone-600">
              Targets: <span className="font-bold text-stone-900">All Registered Parents, Teaching Staff & Drivers</span>
            </div>
            <Button
              onClick={handleSendBroadcast}
              isLoading={isBroadcasting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Emergency Red Broadcast
            </Button>
          </div>

          {broadcastSent && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Emergency broadcast dispatched to {dispatchedStats.parents} parents, {dispatchedStats.staff} faculty, and {dispatchedStats.drivers} drivers via SMS &amp; WhatsApp gateway.</span>
            </div>
          )}
        </div>

        {/* Right: Live Evacuation Muster & Roll-Call */}
        <div className="lg:col-span-5 bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFC8] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-[#2D2319] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D97706]" /> 2. Evacuation Assembly Muster
              </h3>
              <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-[#E8DFC8]">
                Real-Time Headcount
              </span>
            </div>

            <div className="space-y-2.5">
              {zones.map((z, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-[#E8DFC8] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-900">{z.zone}</div>
                    <div className="text-[10px] text-stone-500">
                      Headcount: <span className="font-bold text-stone-800">{z.verifiedSafe} / {z.totalAssigned}</span> verified
                    </div>
                  </div>
                  {z.status === "CLEAR" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> All Safe
                    </span>
                  ) : (
                    <button
                      onClick={() => markZoneClear(idx)}
                      className="px-2.5 py-1 rounded text-[10px] font-black uppercase bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                    >
                      Verify Clear
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Class Teachers verify student counts via mobile PWA. Discrepancies alert incident commanders immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
