"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudSync, ShieldAlert } from 'lucide-react';
import { getOfflineTapCount, flushOfflineTaps } from '@/lib/offline-sync';

export function OfflineAttendanceIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsOnline(navigator.onLine);
    const count = await getOfflineTapCount();
    setPendingCount(count);
  };

  useEffect(() => {
    checkStatus();

    const handleOnline = async () => {
      setIsOnline(true);
      await triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-offline-attendance.js').catch(() => {});
    }

    const interval = setInterval(checkStatus, 4000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    setIsSyncing(true);
    const res = await flushOfflineTaps();
    if (res.flushedCount > 0) {
      setSyncNotice(`✓ Synced ${res.flushedCount} offline scans to cloud`);
      setTimeout(() => setSyncNotice(null), 4000);
    }
    await checkStatus();
    setIsSyncing(false);
  };

  if (isOnline && pendingCount === 0 && !syncNotice) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
        <Wifi className="w-3 h-3 text-emerald-600" />
        <span>Online & Synced</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-xs bg-amber-50 text-amber-900 border border-amber-300">
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-rose-600" />
          <span>Offline Mode ({pendingCount} Queued)</span>
        </>
      ) : (
        <>
          <CloudSync className={`w-3.5 h-3.5 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{syncNotice || `${pendingCount} Taps Pending Sync`}</span>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="ml-1 px-1.5 py-0.5 rounded bg-amber-200/80 text-[10px] hover:bg-amber-300 text-amber-950 cursor-pointer"
          >
            Sync
          </button>
        </>
      )}
    </div>
  );
}
