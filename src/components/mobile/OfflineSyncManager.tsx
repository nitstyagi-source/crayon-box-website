"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export interface OfflineQueueItem {
  id: string;
  actionType: "attendance" | "diary" | "visitor_scan" | "transport_scan";
  payload: any;
  timestamp: string;
  status: "pending" | "synced" | "error";
}

export default function OfflineSyncManager() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load queued offline items
    try {
      const saved = localStorage.getItem("crayonbox_offline_queue");
      if (saved) setQueue(JSON.parse(saved));
    } catch (e) {}

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    try {
      const saved = localStorage.getItem("crayonbox_offline_queue");
      if (!saved) return;
      const items: OfflineQueueItem[] = JSON.parse(saved);
      if (items.length === 0) return;

      setIsSyncing(true);
      // Simulate sync delay
      await new Promise(r => setTimeout(r, 1200));

      // Mark all as synced and clear queue
      localStorage.removeItem("crayonbox_offline_queue");
      setQueue([]);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSyncing(false);
    } catch (e) {
      setIsSyncing(false);
    }
  };

  // Helper method that other components can call
  const enqueueOfflineAction = (actionType: OfflineQueueItem["actionType"], payload: any) => {
    const newItem: OfflineQueueItem = {
      id: `offline-${Date.now()}`,
      actionType,
      payload,
      timestamp: new Date().toISOString(),
      status: "pending"
    };

    const updated = [...queue, newItem];
    setQueue(updated);
    localStorage.setItem("crayonbox_offline_queue", JSON.stringify(updated));
  };

  if (isOnline && queue.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 shrink-0 select-none animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Wifi className="w-3.5 h-3.5" />
            <span>Online &bull; {queue.length} pending items</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Mode &bull; Auto-syncing when connected</span>
          </div>
        )}
      </div>

      {queue.length > 0 && isOnline && (
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing..." : `Sync (${queue.length})`}</span>
        </button>
      )}
    </div>
  );
}
