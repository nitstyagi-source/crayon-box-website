"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, BellRing, Check, CheckCheck, Trash2, ExternalLink,
  Wallet, GraduationCap, AlertTriangle, Calendar, ShieldCheck,
  RotateCcw, Sparkles, X, Volume2, VolumeX, RefreshCw, Send,
  ChevronRight, Circle
} from 'lucide-react';
import {
  getLiveNotificationsAction,
  toggleNotificationReadAction,
  markAllNotificationsReadAction,
  clearAllNotificationsAction,
  dispatchTestNotificationAction,
  AppNotificationItem
} from '@/app/actions/notification-actions';

interface NotificationCenterProps {
  variant?: 'light' | 'dark';
  role?: string;
  institutionCode?: string;
}

export function NotificationCenter({
  variant = 'light',
  role = 'SUPER_ADMIN',
  institutionCode = 'ALL'
}: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'FINANCE' | 'ADMISSIONS' | 'SAFETY' | 'ACADEMIC'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await getLiveNotificationsAction(role, institutionCode);
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh notifications every 45 seconds
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [role, institutionCode]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleToggleRead = async (e: React.MouseEvent, notif: AppNotificationItem) => {
    e.stopPropagation();
    const nextReadState = !notif.unread ? false : true;
    
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, unread: !nextReadState } : n))
    );
    setUnreadCount(prev => (nextReadState ? Math.max(0, prev - 1) : prev + 1));

    await toggleNotificationReadAction(notif.id, nextReadState);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => n.unread).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
    await markAllNotificationsReadAction(unreadIds);
    showToast('All notifications marked as read');
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await clearAllNotificationsAction();
    showToast('All notifications cleared');
  };

  const handleNotificationClick = async (notif: AppNotificationItem) => {
    if (notif.unread) {
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, unread: false } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await toggleNotificationReadAction(notif.id, true);
    }

    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  const handleSendTestAlert = async () => {
    const alertTemplates = [
      {
        title: '🚨 Immediate Gate Pass Verification',
        message: 'Student Aarav Sharma escort verified at CBS North Security Gate.',
        category: 'SAFETY' as const,
        priority: 'URGENT' as const,
        link: '/admin/operations'
      },
      {
        title: '💳 High-Value Fee Payment Received',
        message: 'Online payment of ₹45,000 received via Razorpay Smart POS for Term-2.',
        category: 'FINANCE' as const,
        priority: 'HIGH' as const,
        link: '/admin/finance/collections'
      },
      {
        title: '🎓 Online Admission Application',
        message: 'New application received for Class 1 (CBSE) with full document attestations.',
        category: 'ADMISSIONS' as const,
        priority: 'HIGH' as const,
        link: '/admin/admissions'
      }
    ];

    const randomTemplate = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
    const res = await dispatchTestNotificationAction(randomTemplate);
    if (res.success && res.notification) {
      setNotifications(prev => [res.notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showToast('Live push notification dispatched!');
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return n.unread;
    if (filter === 'FINANCE') return n.category === 'FINANCE';
    if (filter === 'ADMISSIONS') return n.category === 'ADMISSIONS';
    if (filter === 'SAFETY') return n.category === 'SAFETY';
    if (filter === 'ACADEMIC') return n.category === 'ACADEMIC';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FINANCE':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'ADMISSIONS':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'SAFETY':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'ACADEMIC':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'GOVERNANCE':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'FINANCE':
        return 'bg-emerald-50 border-emerald-200';
      case 'ADMISSIONS':
        return 'bg-blue-50 border-blue-200';
      case 'SAFETY':
        return 'bg-amber-50 border-amber-200';
      case 'ACADEMIC':
        return 'bg-purple-50 border-purple-200';
      case 'GOVERNANCE':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* 🌟 BELL TRIGGER BUTTON */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Live System Notifications"
        aria-label="Notifications"
        className={`p-2 rounded-xl transition-all relative flex items-center justify-center ${
          variant === 'dark'
            ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
        }`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-indigo-600 animate-bounce" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Live Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 🌟 FLYOUT NOTIFICATION POPOVER */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 md:w-[420px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-tight">Notification Center</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Real-time alerts & action triggers</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => fetchNotifications()}
                title="Refresh Feed"
                className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ${isLoading ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action Filter Chips & Mark All Read */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
            <div className="flex items-center gap-1">
              {(['ALL', 'UNREAD', 'FINANCE', 'ADMISSIONS', 'SAFETY'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap capitalize ${
                    filter === tab
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 whitespace-nowrap flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-indigo-50"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="font-bold text-xs text-slate-800">You're all caught up!</h4>
                <p className="text-[11px] text-slate-400 mt-1">No unread alerts in this category.</p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 sm:p-4 transition cursor-pointer flex items-start gap-3 group relative ${
                    notif.unread
                      ? 'bg-indigo-50/40 hover:bg-indigo-50/70'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryBg(notif.category)}`}>
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs leading-snug truncate ${notif.unread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 animate-pulse" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notif.timeAgo}
                      </span>
                      {notif.link && (
                        <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                          View details <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Read on Hover */}
                  <button
                    onClick={(e) => handleToggleRead(e, notif)}
                    title={notif.unread ? 'Mark as Read' : 'Mark as Unread'}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition shrink-0"
                  >
                    {notif.unread ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Utility Actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <button
              onClick={handleSendTestAlert}
              className="text-[11px] font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs transition"
            >
              <Send className="w-3 h-3 text-indigo-600" /> Send Test Alert
            </button>

            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
              <Link
                href="/admin/calendar"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                All Events <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* Floating Action Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-2xl border border-indigo-500/50 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
