"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Send,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

export default function PushNotificationsAdminPage() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [testTitle, setTestTitle] = useState('School Bus Approaching');
  const [testBody, setTestBody] = useState('Bus DL-01-CB-1001 is 500m away from Indirapuram stop (ETA 4 mins).');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support native push notifications.');
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        setNotice('✓ Push notification permission granted! Instant alerts enabled.');
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSubscribing(false);
    }
  };

  const sendTestNotification = () => {
    if (permission !== 'granted') {
      alert('Please enable push notifications first.');
      return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(testTitle, {
          body: testBody,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200]
        } as any);
      });
    } else {
      new Notification(testTitle, {
        body: testBody,
        icon: '/logo.png'
      });
    }
    setNotice(`✓ Dispatched test push: "${testTitle}"`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <VastuModuleBanner
        badgeText="LOW-LATENCY REAL-TIME TELEMETRICS"
        title="Native Mobile & Web Push Notification Center"
        description="Deliver zero-cost, instant device push alerts for bus geofence arrivals, turnstile gate clearances, and unscheduled closures."
      />

      {notice && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Registration Status */}
        <Card className="p-5 border-stone-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600" /> Push Protocol Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-semibold text-stone-700">Browser / OS Permission</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : permission === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {permission}
              </span>
            </div>

            <p className="text-stone-500 text-[11px] leading-relaxed">
              Native Push bypasses SMS gateway fees and WhatsApp template approval delays, triggering alerts directly on parent Android, iOS (PWA), and desktop screens.
            </p>

            <Button
              onClick={requestPushPermission}
              disabled={permission === 'granted' || isSubscribing}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              {permission === 'granted' ? 'Notifications Active on This Device' : 'Enable Native Push Notifications'}
            </Button>
          </div>
        </Card>

        {/* Live Push Dispatcher Simulator */}
        <Card className="p-5 border-stone-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" /> Broadcast Push Alert Simulator
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Notification Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Payload Body Text</label>
              <textarea
                rows={2}
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>

            <Button
              onClick={sendTestNotification}
              disabled={permission !== 'granted'}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Trigger Instant Local Push Notification
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
