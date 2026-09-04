"use client";

import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  ShieldCheck,
  Radio,
  Cpu,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Unlock,
  QrCode,
  UserCheck,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Activity,
  Sliders,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getTurnstileTelemetryAction,
  simulateTurnstileTapAction,
  setTurnstileEmergencyModeAction,
  TurnstileDevice,
  TurnstileAccessLog
} from '@/app/actions/turnstile-gate-actions';

export function TurnstileHardwareSyncDesk() {
  const [devices, setDevices] = useState<TurnstileDevice[]>([]);
  const [accessLogs, setAccessLogs] = useState<TurnstileAccessLog[]>([]);
  const [stats, setStats] = useState({
    onlineGatesCount: 4,
    totalPassagesToday: 1145,
    avgLatencyMs: 165,
    activeSafetyMode: 'NORMAL' as 'NORMAL' | 'FREE_EGRESS' | 'LOCKDOWN'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulation State
  const [selectedDeviceId, setSelectedDeviceId] = useState('dev-turnstile-01');
  const [selectedUserName, setSelectedUserName] = useState('Aarav Sharma');
  const [selectedUserType, setSelectedUserType] = useState<'STUDENT' | 'STAFF' | 'VISITOR'>('STUDENT');
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<'UHF_RFID_TAP' | 'FACE_BIOMETRIC' | 'QR_PASS'>('UHF_RFID_TAP');
  const [selectedDirection, setSelectedDirection] = useState<'IN' | 'OUT'>('IN');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [activeUnlockedDeviceId, setActiveUnlockedDeviceId] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    const res = await getTurnstileTelemetryAction();
    if (res.success) {
      setDevices(res.devices);
      setAccessLogs(res.accessLogs);
      setStats(res.stats);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSimulateTap = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const res = await simulateTurnstileTapAction({
      deviceId: selectedDeviceId,
      userName: selectedUserName,
      userType: selectedUserType,
      authMethod: selectedAuthMethod,
      direction: selectedDirection
    });

    if (res.success) {
      setSimulationResult(res.message);
      setActiveUnlockedDeviceId(selectedDeviceId);
      setAccessLogs((prev) => [res.createdLog, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalPassagesToday: prev.totalPassagesToday + 1
      }));

      setTimeout(() => {
        setActiveUnlockedDeviceId(null);
      }, 3500);
    }
    setIsSimulating(false);
  };

  const handleEmergencyModeChange = async (mode: 'NORMAL' | 'FREE_EGRESS' | 'LOCKDOWN') => {
    const res = await setTurnstileEmergencyModeAction(mode);
    if (res.success) {
      setStats((prev) => ({ ...prev, activeSafetyMode: res.currentMode }));
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFC8]/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800">
              <Radio className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Turnstile UHF-RFID Gate Hardware Controller &amp; Biometric Sync
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Autonomous physical gate access controller syncing TCP/IP tripod turnstiles and MQTT optical flap barriers with student/staff biometric attendance and visitor QR passes in under 200ms.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTelemetry}
          className="border-[#E8DFC8] text-stone-700 hover:bg-stone-50 gap-1.5 text-xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Hardware Mesh
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-[#E8DFC8] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Gate Controllers Online</span>
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">{stats.onlineGatesCount} / {devices.length || 4}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">100% Mesh</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">TCP/IP &amp; MQTT brokers synced</p>
        </Card>

        <Card className="p-4 bg-white border-[#E8DFC8] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Passages Logged Today</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-900">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">{stats.totalPassagesToday}</span>
            <span className="text-xs font-medium text-stone-500">Tap-ins &amp; Exits</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Direct attendance ledger sync</p>
        </Card>

        <Card className="p-4 bg-white border-[#E8DFC8] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Auth Verification Latency</span>
            <div className="p-2 bg-purple-100 rounded-xl text-purple-900">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">{stats.avgLatencyMs}ms</span>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">&lt;300ms SLA</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Edge RFID &amp; face inference</p>
        </Card>

        <Card
          className={`p-4 rounded-2xl border transition-all ${
            stats.activeSafetyMode === 'LOCKDOWN'
              ? 'bg-rose-50 border-rose-300'
              : stats.activeSafetyMode === 'FREE_EGRESS'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">Safety Compliance Mode</span>
            <div className="p-2 bg-white rounded-xl shadow-2xs">
              {stats.activeSafetyMode === 'LOCKDOWN' ? (
                <Lock className="w-4 h-4 text-rose-700" />
              ) : stats.activeSafetyMode === 'FREE_EGRESS' ? (
                <Unlock className="w-4 h-4 text-amber-700" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-stone-900">
              {stats.activeSafetyMode === 'NORMAL'
                ? 'Active Controlled'
                : stats.activeSafetyMode === 'FREE_EGRESS'
                ? 'Free Fire Egress'
                : 'Emergency Lockdown'}
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">National Building Code Compliant</p>
        </Card>
      </div>

      {/* Emergency Mode Override Bar */}
      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-stone-900">Perimeter Gate Hardware Master Controls</h4>
            <p className="text-[11px] text-stone-600">Instantly switch physical gate barrier modes across all connected campus turnstiles.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleEmergencyModeChange('NORMAL')}
            className={`text-xs ${
              stats.activeSafetyMode === 'NORMAL'
                ? 'bg-stone-900 text-amber-400'
                : 'bg-white border border-[#E8DFC8] text-stone-700 hover:bg-stone-50'
            }`}
          >
            Normal Controlled Mode
          </Button>
          <Button
            size="sm"
            onClick={() => handleEmergencyModeChange('FREE_EGRESS')}
            className={`text-xs ${
              stats.activeSafetyMode === 'FREE_EGRESS'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-50'
            }`}
          >
            🔥 Fire Free Egress
          </Button>
          <Button
            size="sm"
            onClick={() => handleEmergencyModeChange('LOCKDOWN')}
            className={`text-xs ${
              stats.activeSafetyMode === 'LOCKDOWN'
                ? 'bg-rose-700 text-white font-bold'
                : 'bg-white border border-rose-300 text-rose-900 hover:bg-rose-50'
            }`}
          >
            🚨 Perimeter Lockdown
          </Button>
        </div>
      </div>

      {/* Main Grid: Hardware Devices & Interactive Tap Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Devices Fleet (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-700" />
            Physical Turnstile &amp; Flap Barrier Fleet
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map((device) => {
              const isUnlockedNow = activeUnlockedDeviceId === device.id;

              return (
                <Card
                  key={device.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    isUnlockedNow
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                      : 'border-[#E8DFC8] bg-white'
                  }`}
                >
                  {isUnlockedNow && (
                    <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-bold text-center py-0.5 flex items-center justify-center gap-1 animate-pulse">
                      <Unlock className="w-3 h-3" /> BARRIER UNLOCKED (FREE ROTATION)
                    </div>
                  )}

                  <div className={`flex items-start justify-between ${isUnlockedNow ? 'mt-3' : ''}`}>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {device.protocol}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 mt-1.5">{device.device_name}</h4>
                      <p className="text-[11px] text-stone-500">{device.gate_zone}</p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" /> ONLINE
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500">IP Socket</div>
                      <div className="font-mono text-[11px] font-semibold text-stone-800 truncate" title={device.ip_address}>
                        {device.ip_address}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500">Ping Latency</div>
                      <div className="font-mono text-[11px] font-semibold text-stone-800">{device.latency_ms}ms</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500">Passages</div>
                      <div className="font-mono text-[11px] font-semibold text-stone-800">{device.total_passages_today}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Real-time Telemetry Access Log Table */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs mt-6">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E8DFC8] flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-amber-700" />
                Live Turnstile Access Audit Stream
              </h4>
              <span className="text-[11px] text-stone-500">Last 20 entries verified</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFC8] text-[10px] font-bold text-stone-500 uppercase tracking-wider bg-white">
                    <th className="py-2.5 px-4">User &amp; Type</th>
                    <th className="py-2.5 px-4">Gate Lane</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Direction</th>
                    <th className="py-2.5 px-4">Verification</th>
                    <th className="py-2.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]/50">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-stone-900">{log.user_name}</div>
                        <div className="text-[10px] text-stone-500">{log.user_id}</div>
                      </td>
                      <td className="py-2.5 px-4 text-stone-700 text-[11px]">
                        {log.device_name}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          {log.auth_method === 'UHF_RFID_TAP'
                            ? '💳 RFID Card'
                            : log.auth_method === 'FACE_BIOMETRIC'
                            ? '👤 Face Bio'
                            : '📱 QR Gate Pass'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {log.direction === 'IN' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> Entry
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" /> Exit
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-stone-600">
                        {log.verification_latency_ms}ms
                      </td>
                      <td className="py-2.5 px-4 text-right text-stone-500 text-[11px] font-mono">
                        {new Date(log.passed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Interactive Telemetry Simulator Panel (1 Col) */}
        <div className="space-y-4">
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-700" />
            Hardware Tap Simulator
          </h3>

          <Card className="p-5 rounded-2xl border border-[#E8DFC8] bg-white shadow-xs space-y-4">
            <div>
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                Target Turnstile Lane
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full text-xs font-semibold text-stone-800 px-3 py-2 rounded-xl bg-stone-50 border border-[#E8DFC8] focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.device_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                User Credential
              </label>
              <select
                value={selectedUserName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUserName(val);
                  if (val.includes('Student')) setSelectedUserType('STUDENT');
                  else if (val.includes('Teacher') || val.includes('Staff')) setSelectedUserType('STAFF');
                  else setSelectedUserType('VISITOR');
                }}
                className="w-full text-xs font-semibold text-stone-800 px-3 py-2 rounded-xl bg-stone-50 border border-[#E8DFC8] focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Aarav Sharma (Student - Class 10)">Aarav Sharma (Student - Class 10)</option>
                <option value="Smt. Priya Sharma (Teacher - Science)">Smt. Priya Sharma (Teacher - Science)</option>
                <option value="Nitin Tyagi (Admin / Trustee)">Nitin Tyagi (Admin / Trustee)</option>
                <option value="Dr. Rajesh Khanna (Parent Visitor #401)">Dr. Rajesh Khanna (Parent Visitor #401)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                Authentication Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UHF_RFID_TAP', label: 'RFID Tap' },
                  { id: 'FACE_BIOMETRIC', label: 'Face AI' },
                  { id: 'QR_PASS', label: 'QR Pass' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedAuthMethod(m.id as any)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                      selectedAuthMethod === m.id
                        ? 'border-amber-600 bg-amber-500/15 text-amber-900 ring-1 ring-amber-500'
                        : 'border-[#E8DFC8] bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['IN', 'OUT'] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setSelectedDirection(dir)}
                    className={`py-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                      selectedDirection === dir
                        ? 'border-stone-900 bg-stone-900 text-amber-300'
                        : 'border-[#E8DFC8] bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {dir === 'IN' ? '⬇ Entry (IN)' : '⬆ Egress (OUT)'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSimulateTap}
              disabled={isSimulating}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white text-xs gap-1.5 py-2.5 rounded-xl shadow-xs"
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'fill-white'}`} />
              {isSimulating ? 'Authenticating Sensor...' : 'Simulate Sensor Tap & Unlock Gate'}
            </Button>

            {simulationResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Gate Barrier Unlocked</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">{simulationResult}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
