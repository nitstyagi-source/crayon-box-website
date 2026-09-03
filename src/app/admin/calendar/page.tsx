"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  BookOpen, Trophy, Sparkles, Award, Bell, Plus, 
  Filter, Search, ChevronLeft, ChevronRight, Check, 
  Trash2, Download, Paperclip, MessageSquare, AlertCircle,
  School, HeartHandshake, Eye, Send, CheckCircle2, Pencil, Edit2,
  Zap, Settings, MessageCircle, Smartphone, CheckCircle, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getSchoolCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent,
  deleteCalendarEvent 
} from "@/app/actions/school-calendar";
import { 
  getTodaysAndUpcomingBirthdays, 
  sendBirthdayWish,
  autoSendTodaysBirthdayWishes,
  getBirthdayWishesLog,
  updateBirthdaySettings
} from "@/app/actions/birthdays";

const EVENT_TYPES = [
  "🏫 School Event",
  "📚 Exam",
  "🎉 Celebration",
  "🏖 Holiday",
  "👨‍👩‍👧 Parent Meeting",
  "🏆 Sports",
  "🎭 Annual Function",
  "📢 Important Notice",
  "📝 Assessment",
  "👩‍🏫 Teacher Meeting"
];

const ALL_CLASSES = ["All", "Grade 5", "Grade 4", "Grade 3", "Grade 2", "Grade 1", "UKG", "Nursery"];

export function SchoolCalendarDesk() {
  const { activeCampusId } = useCampusContext();

  // Simple ERP Menu Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "school_calendar" | "academic_calendar" | "class_calendar" | "teacher_calendar" | "exam_calendar" | "holidays" | "birthdays" | "reminders"
  >("school_calendar");

  // Date Navigation State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // August (1-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(24);

  // Filters
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedEventType, setSelectedEventType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Events Data State
  const [events, setEvents] = useState<any[]>([]);
  const [birthdayData, setBirthdayData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wish Modal State
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [recipientType, setRecipientType] = useState<"Student" | "Teacher">("Student");
  const [wishMessage, setWishMessage] = useState("");
  const [wishChannel, setWishChannel] = useState<"App" | "WhatsApp" | "SMS">("App");
  const [isSendingWish, setIsSendingWish] = useState(false);

  // Birthday Automation States
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [isSavingBirthdaySettings, setIsSavingBirthdaySettings] = useState(false);
  const [wishesLog, setWishesLog] = useState<any[]>([]);
  const [bdaySettings, setBdaySettings] = useState<any>({
    enable_student_birthdays: true,
    enable_teacher_birthdays: true,
    auto_send_wishes_enabled: true,
    auto_send_students: true,
    auto_send_faculty: true,
    auto_send_time: "08:00 AM",
    enable_whatsapp_wishes: true,
    enable_app_notifications: true,
    enable_sms_wishes: false,
    show_on_dashboard: true,
    show_in_calendar: true,
    allow_birthday_wishes: true,
    allow_classmates_to_wish: false,
    allow_parents_to_wish: true,
    hide_dob_from_users: true,
    custom_student_message: "🎂 Happy Birthday, {NAME}! Wishing you a wonderful day filled with happiness, joy, and learning! From Crayon Box School family 🎉",
    custom_teacher_message: "🎉 Wishing our esteemed educator {NAME} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School family!"
  });

  // Add Event Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Event Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEvent, setEditingEvent] = useState({
    id: "",
    title: "",
    eventType: "🏫 School Event",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    targetAudience: "All" as any,
    applicableClasses: ["All"] as string[],
    venue: "Main Auditorium",
    description: "",
    attachmentName: "",
    attachmentUrl: "",
    isHoliday: false,
    isExam: false,
    holidayType: "Full Day",
    reminderDaysBefore: [7, 3, 1, 0],
    notificationChannels: ["App", "WhatsApp"]
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    eventType: "🏫 School Event",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    targetAudience: "All" as any,
    applicableClasses: ["All"],
    venue: "Main Auditorium",
    description: "",
    attachmentName: "",
    attachmentUrl: "",
    isHoliday: false,
    isExam: false,
    holidayType: "Full Day",
    reminderDaysBefore: [7, 3, 1, 0],
    notificationChannels: ["App", "WhatsApp"]
  });

  useEffect(() => {
    loadEvents();
  }, [activeCampusId, currentYear, currentMonth, selectedEventType, selectedClass]);

  async function loadEvents() {
    setIsLoading(true);
    try {
      const [eventsRes, bdayRes, logsRes] = await Promise.all([
        getSchoolCalendarEvents({
          campusId: activeCampusId,
          eventType: selectedEventType,
          className: activeTab === "class_calendar" ? selectedClass : "All"
        }),
        getTodaysAndUpcomingBirthdays({
          campusId: activeCampusId,
          role: "Admin",
          targetMonth: currentMonth
        }),
        getBirthdayWishesLog({ campusId: activeCampusId, limit: 30 })
      ]);

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
      if (bdayRes.success && bdayRes.data) {
        setBirthdayData(bdayRes.data);
        if (bdayRes.data.settings) {
          setBdaySettings((prev: any) => ({ ...prev, ...bdayRes.data.settings }));
        }
      }
      if (logsRes.success && logsRes.data) {
        setWishesLog(logsRes.data);
      }
    } catch (e) {
      console.error("Error loading calendar events:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // 1-Click Run Auto Wishes Now for Today's Students and Faculty
  async function handleRunAutoWishesNow() {
    setIsAutoSending(true);
    try {
      const res = await autoSendTodaysBirthdayWishes({ campusId: activeCampusId, forceAll: true });
      if (res.success) {
        setToastMessage(res.message || "🎉 Birthday wishes sent successfully!");
        const [bdayRes, logsRes] = await Promise.all([
          getTodaysAndUpcomingBirthdays({ campusId: activeCampusId, role: "Admin", targetMonth: currentMonth }),
          getBirthdayWishesLog({ campusId: activeCampusId, limit: 30 })
        ]);
        if (bdayRes.success && bdayRes.data) setBirthdayData(bdayRes.data);
        if (logsRes.success && logsRes.data) setWishesLog(logsRes.data);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert("Error dispatching birthday wishes: " + res.error);
      }
    } finally {
      setIsAutoSending(false);
    }
  }

  // Save Birthday Settings
  async function handleSaveBirthdaySettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSavingBirthdaySettings(true);
    try {
      const res = await updateBirthdaySettings({
        campusId: activeCampusId,
        enableStudentBirthdays: bdaySettings.enable_student_birthdays,
        enableTeacherBirthdays: bdaySettings.enable_teacher_birthdays,
        autoSendWishesEnabled: bdaySettings.auto_send_wishes_enabled,
        autoSendStudents: bdaySettings.auto_send_students,
        autoSendFaculty: bdaySettings.auto_send_faculty,
        autoSendTime: bdaySettings.auto_send_time,
        enableWhatsappWishes: bdaySettings.enable_whatsapp_wishes,
        enableAppNotifications: bdaySettings.enable_app_notifications,
        enableSmsWishes: bdaySettings.enable_sms_wishes,
        showOnDashboard: bdaySettings.show_on_dashboard,
        showInCalendar: bdaySettings.show_in_calendar,
        allowBirthdayWishes: bdaySettings.allow_birthday_wishes,
        allowClassmatesToWish: bdaySettings.allow_classmates_to_wish,
        allowParentsToWish: bdaySettings.allow_parents_to_wish,
        hideDobFromUsers: bdaySettings.hide_dob_from_users,
        customStudentMessage: bdaySettings.custom_student_message,
        customTeacherMessage: bdaySettings.custom_teacher_message
      });

      if (res.success) {
        setToastMessage("✓ Automated Birthday & Privacy Settings Saved Successfully!");
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert("Error saving settings: " + res.error);
      }
    } finally {
      setIsSavingBirthdaySettings(false);
    }
  }

  function handleOpenWishModal(person: any, type: "Student" | "Teacher") {
    setSelectedRecipient(person);
    setRecipientType(type);
    const defaultText = type === "Student"
      ? (bdaySettings.custom_student_message || `🎂 Happy Birthday, {NAME}! Wishing you a wonderful day filled with happiness and learning! From Crayon Box School family 🎉`).replace(/{NAME}/g, person.fullName)
      : (bdaySettings.custom_teacher_message || `🎉 Wishing our esteemed educator {NAME} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School!`).replace(/{NAME}/g, person.fullName);
    setWishMessage(defaultText);
    setIsWishModalOpen(true);
  }

  async function handleSendWishSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRecipient) return;

    setIsSendingWish(true);
    try {
      const res = await sendBirthdayWish({
        campusId: activeCampusId,
        recipientId: selectedRecipient.id,
        recipientType,
        recipientName: selectedRecipient.fullName,
        recipientClass: selectedRecipient.classDisplay || selectedRecipient.department || "",
        senderName: "Director & School Management",
        senderRole: "Management",
        message: wishMessage,
        channel: wishChannel
      });

      if (res.success) {
        setToastMessage(`🎉 Birthday wish sent to ${selectedRecipient.fullName}!`);
        setIsWishModalOpen(false);
        const logsRes = await getBirthdayWishesLog({ campusId: activeCampusId, limit: 30 });
        if (logsRes.success && logsRes.data) setWishesLog(logsRes.data);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert("Error sending wish: " + res.error);
      }
    } finally {
      setIsSendingWish(false);
    }
  }

  // Handle Month Navigation
  function handlePrevMonth() {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  // Handle Event Creation
  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    setIsSaving(true);
    try {
      const res = await createCalendarEvent({
        campusId: activeCampusId,
        academicSession: "2026-2027",
        title: newEvent.title,
        eventType: newEvent.eventType,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        targetAudience: newEvent.targetAudience,
        applicableClasses: newEvent.applicableClasses,
        venue: newEvent.venue,
        description: newEvent.description,
        attachmentName: newEvent.attachmentName || undefined,
        attachmentUrl: newEvent.attachmentUrl || undefined,
        isHoliday: newEvent.eventType.includes("Holiday"),
        isExam: newEvent.eventType.includes("Exam") || newEvent.eventType.includes("Assessment"),
        holidayType: newEvent.holidayType,
        reminderDaysBefore: newEvent.reminderDaysBefore,
        notificationChannels: newEvent.notificationChannels
      });

      if (res.success) {
        setToastMessage(`✓ Event "${newEvent.title}" published successfully!`);
        setIsAddModalOpen(false);
        setNewEvent({
          title: "",
          eventType: "🏫 School Event",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          startTime: "09:00 AM",
          endTime: "01:00 PM",
          targetAudience: "All",
          applicableClasses: ["All"],
          venue: "Main Auditorium",
          description: "",
          attachmentName: "",
          attachmentUrl: "",
          isHoliday: false,
          isExam: false,
          holidayType: "Full Day",
          reminderDaysBefore: [7, 3, 1, 0],
          notificationChannels: ["App", "WhatsApp"]
        });
        loadEvents();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert("Error creating event: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Open Edit Event Modal
  function handleOpenEditModal(ev: any) {
    setEditingEvent({
      id: ev.id,
      title: ev.title || "",
      eventType: ev.event_type || "🏫 School Event",
      startDate: ev.start_date || new Date().toISOString().split("T")[0],
      endDate: ev.end_date || ev.start_date || new Date().toISOString().split("T")[0],
      startTime: ev.start_time || "09:00 AM",
      endTime: ev.end_time || "01:00 PM",
      targetAudience: ev.target_audience || "All",
      applicableClasses: Array.isArray(ev.applicable_classes) && ev.applicable_classes.length > 0 ? ev.applicable_classes : ["All"],
      venue: ev.venue || "Main Auditorium",
      description: ev.description || "",
      attachmentName: ev.attachment_name || "",
      attachmentUrl: ev.attachment_url || "",
      isHoliday: ev.is_holiday ?? false,
      isExam: ev.is_exam ?? false,
      holidayType: ev.holiday_type || "Full Day",
      reminderDaysBefore: ev.reminder_days_before || [7, 3, 1, 0],
      notificationChannels: ev.notification_channels || ["App", "WhatsApp"]
    });
    setIsEditModalOpen(true);
  }

  // Handle Edit Event Submit
  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent.id || !editingEvent.title.trim()) return;

    setIsUpdating(true);
    try {
      const res = await updateCalendarEvent({
        id: editingEvent.id,
        campusId: activeCampusId,
        title: editingEvent.title,
        eventType: editingEvent.eventType,
        startDate: editingEvent.startDate,
        endDate: editingEvent.endDate || editingEvent.startDate,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        targetAudience: editingEvent.targetAudience,
        applicableClasses: editingEvent.applicableClasses,
        venue: editingEvent.venue,
        description: editingEvent.description,
        attachmentName: editingEvent.attachmentName || undefined,
        attachmentUrl: editingEvent.attachmentUrl || undefined,
        isHoliday: editingEvent.isHoliday || editingEvent.eventType.includes("Holiday"),
        isExam: editingEvent.isExam || editingEvent.eventType.includes("Exam") || editingEvent.eventType.includes("Assessment"),
        holidayType: editingEvent.holidayType,
        reminderDaysBefore: editingEvent.reminderDaysBefore,
        notificationChannels: editingEvent.notificationChannels
      });

      if (res.success) {
        setToastMessage(`✓ Event "${editingEvent.title}" updated successfully!`);
        setIsEditModalOpen(false);
        loadEvents();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert("Error updating event: " + res.error);
      }
    } finally {
      setIsUpdating(false);
    }
  }

  // Handle Event Deletion
  async function handleDeleteEvent(id: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}" from the calendar?`)) return;
    const res = await deleteCalendarEvent(id);
    if (res.success) {
      setToastMessage(`Event "${title}" deleted.`);
      loadEvents();
      setTimeout(() => setToastMessage(null), 3000);
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar Grid Calculation
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday

  const currentMonthEvents = events.filter(ev => {
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    return ev.start_date?.startsWith(prefix) || ev.end_date?.startsWith(prefix);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-purple-600" /> Unified Calendar Module
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Session 2026-2027
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            School, Academic, Teacher &amp; Parent Calendar
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Admin broadcasts events $\rightarrow$ Automatically synced to Teacher timetable, Student classroom, and Parent apps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> [ + Add Event / Holiday ]
        </button>
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-sm">✕</button>
        </div>
      )}

      {/* Simple ERP Menu Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("school_calendar")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "school_calendar" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🏫 School Calendar
        </button>

        <button
          onClick={() => setActiveTab("academic_calendar")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "academic_calendar" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🎓 Academic Calendar (2026-27)
        </button>

        <button
          onClick={() => setActiveTab("class_calendar")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "class_calendar" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          👥 Class Calendar
        </button>

        <button
          onClick={() => setActiveTab("teacher_calendar")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "teacher_calendar" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          👩‍🏫 Teacher Calendar
        </button>

        <button
          onClick={() => setActiveTab("exam_calendar")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "exam_calendar" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📚 Exam Calendar
        </button>

        <button
          onClick={() => setActiveTab("holidays")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "holidays" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🏖 Holidays
        </button>

        <button
          onClick={() => setActiveTab("birthdays")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "birthdays" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🎂 Birthdays
        </button>

        <button
          onClick={() => setActiveTab("reminders")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "reminders" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🔔 Reminders &amp; Alerts
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🎂 BIRTHDAYS VIEW (ROLE-BASED & PRIVATE VISIBILITY) */}
      {/* ========================================================================= */}
      {activeTab === "birthdays" && (
        <div className="space-y-6">
          
          {/* Executive Auto-Dispatch Control Banner */}
          <div className="bg-linear-to-r from-pink-950 via-purple-950 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-purple-800/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-pink-400" />
                  Automated Birthday Greeting Broadcast Engine
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                  bdaySettings.auto_send_wishes_enabled 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {bdaySettings.auto_send_wishes_enabled ? `🟢 Active • Daily at ${bdaySettings.auto_send_time || "08:00 AM"}` : "⏸ Automation Paused"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>🎂</span>
                Student &amp; Faculty Birthday Automation
              </h2>
              <p className="text-xs text-purple-200/80 max-w-2xl">
                Automatically dispatches warm personalized birthday cards and wishes to students, parents, and teachers at your configured time via WhatsApp circulars, mobile app notifications, and SMS.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleRunAutoWishesNow}
                disabled={isAutoSending}
                className="px-5 py-2.5 bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                {isAutoSending ? "Dispatching Wishes..." : "⚡ Send Today's Birthday Wishes Now"}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Today&apos;s Students</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-stone-900">
                  {birthdayData?.todaysBirthdays?.students?.length || 0}
                </span>
                <span className="text-xl">🎓</span>
              </div>
              <p className="text-[10px] text-pink-600 font-semibold">Student Celebrants</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Today&apos;s Faculty</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-stone-900">
                  {birthdayData?.todaysBirthdays?.teachers?.length || 0}
                </span>
                <span className="text-xl">👩‍🏫</span>
              </div>
              <p className="text-[10px] text-purple-600 font-semibold">Educators &amp; Staff</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Delivery Channels</span>
              <div className="flex items-center gap-1.5 py-1">
                {bdaySettings.enable_whatsapp_wishes && <span className="text-xs" title="WhatsApp">💬</span>}
                {bdaySettings.enable_app_notifications && <span className="text-xs" title="App">🔔</span>}
                {bdaySettings.enable_sms_wishes && <span className="text-xs" title="SMS">📱</span>}
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold">Multi-Channel Active</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Wishes Sent</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-stone-900">
                  {wishesLog.length}
                </span>
                <span className="text-xl">📬</span>
              </div>
              <p className="text-[10px] text-stone-500 font-semibold">All-Time Dispatched</p>
            </div>
          </div>

          {/* Today's Special Birthday Celebrants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Birthdays Today */}
            <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
                    🎂
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">Today&apos;s Student Birthdays</h3>
                    <p className="text-[11px] text-stone-400">Class teacher &amp; parent notification active</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-xl">
                  {birthdayData?.todaysBirthdays?.students?.length || 0} Celebrations Today
                </span>
              </div>

              <div className="space-y-3">
                {(!birthdayData?.todaysBirthdays?.students || birthdayData.todaysBirthdays.students.length === 0) ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    No student birthdays recorded for today.
                  </div>
                ) : (
                  birthdayData.todaysBirthdays.students.map((stu: any) => {
                    const isAlreadyWished = wishesLog.some(w => w.recipient_id === stu.id && w.sent_at?.startsWith(new Date().toISOString().split("T")[0]));
                    return (
                      <div key={stu.id} className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-200 text-pink-800 font-black flex items-center justify-center text-sm shrink-0">
                            {stu.fullName.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-stone-900 font-bold text-xs block">{stu.fullName}</strong>
                            <span className="text-[11px] text-pink-800 font-semibold">{stu.classDisplay} • 🎈 Birthday Today</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAlreadyWished ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Wish Sent
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenWishModal(stu, "Student")}
                              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>🎂</span> Send Wish
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Teacher / Staff Birthdays Today */}
            <div className="bg-white p-6 rounded-3xl border border-purple-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">Today&apos;s Faculty Birthdays</h3>
                    <p className="text-[11px] text-stone-400">Staff greetings &amp; leadership circular active</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                  {birthdayData?.todaysBirthdays?.teachers?.length || 0} Celebrations Today
                </span>
              </div>

              <div className="space-y-3">
                {(!birthdayData?.todaysBirthdays?.teachers || birthdayData.todaysBirthdays.teachers.length === 0) ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    No faculty birthdays recorded for today.
                  </div>
                ) : (
                  birthdayData.todaysBirthdays.teachers.map((t: any) => {
                    const isAlreadyWished = wishesLog.some(w => w.recipient_id === t.id && w.sent_at?.startsWith(new Date().toISOString().split("T")[0]));
                    return (
                      <div key={t.id} className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-900 font-black flex items-center justify-center text-sm shrink-0">
                            {t.fullName.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-stone-900 font-bold text-xs block">{t.fullName}</strong>
                            <span className="text-[11px] text-purple-800 font-semibold">{t.designation} ({t.department})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAlreadyWished ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Wish Sent
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenWishModal(t, "Teacher")}
                              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>🎉</span> Send Wish
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* ⚙️ AUTOMATED BIRTHDAY BROADCAST & PRIVACY SETTINGS */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  Automated Birthday Wish &amp; Privacy Configuration
                </h3>
                <p className="text-stone-500 text-[11px]">
                  Configure automatic daily dispatch schedules, notification channels, and custom message templates for students and faculty.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveBirthdaySettings()}
                disabled={isSavingBirthdaySettings}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {isSavingBirthdaySettings ? "Saving Settings..." : "Save Automation Settings"}
              </button>
            </div>

            {/* Master Toggle & Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <label className="flex items-start gap-3 p-4 bg-purple-50/70 rounded-2xl border border-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdaySettings.auto_send_wishes_enabled}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, auto_send_wishes_enabled: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-purple-600 rounded"
                />
                <div>
                  <strong className="text-stone-900 font-bold block text-xs">Automated Daily Dispatch</strong>
                  <span className="text-[11px] text-purple-900">Auto-send greetings every morning</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdaySettings.auto_send_students}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, auto_send_students: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-purple-600 rounded"
                />
                <div>
                  <strong className="text-stone-900 font-bold block text-xs">🎓 Auto-Wish Students</strong>
                  <span className="text-[11px] text-stone-500">Send greeting to student &amp; parents</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdaySettings.auto_send_faculty}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, auto_send_faculty: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-purple-600 rounded"
                />
                <div>
                  <strong className="text-stone-900 font-bold block text-xs">👩‍🏫 Auto-Wish Faculty &amp; Staff</strong>
                  <span className="text-[11px] text-stone-500">Send greeting to educator &amp; team</span>
                </div>
              </label>

            </div>

            {/* Channels & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              
              <div className="space-y-1">
                <label className="font-bold text-stone-800 block text-[11px]">Scheduled Daily Time</label>
                <select
                  value={bdaySettings.auto_send_time || "08:00 AM"}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, auto_send_time: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900"
                >
                  <option value="07:00 AM">07:00 AM (Early Morning)</option>
                  <option value="08:00 AM">08:00 AM (Standard School Opening)</option>
                  <option value="09:00 AM">09:00 AM (Morning Assembly)</option>
                  <option value="10:00 AM">10:00 AM</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdaySettings.enable_whatsapp_wishes}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, enable_whatsapp_wishes: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <div>
                  <strong className="text-stone-900 font-bold block text-xs">💬 WhatsApp Circular</strong>
                  <span className="text-[10px] text-stone-500">Direct message card</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdaySettings.enable_app_notifications}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, enable_app_notifications: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <div>
                  <strong className="text-stone-900 font-bold block text-xs">🔔 App Push Alert</strong>
                  <span className="text-[10px] text-stone-500">Mobile app notification</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bdaySettings.enable_sms_wishes}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, enable_sms_wishes: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <div>
                  <strong className="text-stone-900 font-bold block text-xs">📱 SMS Message</strong>
                  <span className="text-[10px] text-stone-500">SMS gateway alert</span>
                </div>
              </label>

            </div>

            {/* Custom Message Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Student Template */}
              <div className="space-y-2 p-4 bg-pink-50/40 rounded-2xl border border-pink-200">
                <div className="flex justify-between items-center">
                  <strong className="text-stone-900 font-bold text-xs flex items-center gap-1.5">
                    <span>🎓</span> Student Greeting Template
                  </strong>
                  <span className="text-[10px] text-pink-700 font-mono font-bold">Auto-Interpolated</span>
                </div>
                <textarea
                  rows={3}
                  value={bdaySettings.custom_student_message || ""}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, custom_student_message: e.target.value })}
                  placeholder="e.g. 🎂 Happy Birthday, {NAME}! Wishing you a wonderful day filled with happiness and learning! From Crayon Box School family 🎉"
                  className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                />
                <div className="flex items-center gap-1 text-[10px] text-stone-500 flex-wrap">
                  <span className="font-bold text-stone-700">Tags:</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-pink-200 font-mono text-pink-800">{'{NAME}'}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-pink-200 font-mono text-pink-800">{'{FIRST_NAME}'}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-pink-200 font-mono text-pink-800">{'{CLASS}'}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-pink-200 font-mono text-pink-800">{'{SCHOOL_NAME}'}</span>
                </div>
              </div>

              {/* Faculty Template */}
              <div className="space-y-2 p-4 bg-purple-50/40 rounded-2xl border border-purple-200">
                <div className="flex justify-between items-center">
                  <strong className="text-stone-900 font-bold text-xs flex items-center gap-1.5">
                    <span>👩‍🏫</span> Faculty &amp; Staff Greeting Template
                  </strong>
                  <span className="text-[10px] text-purple-700 font-mono font-bold">Auto-Interpolated</span>
                </div>
                <textarea
                  rows={3}
                  value={bdaySettings.custom_teacher_message || ""}
                  onChange={(e) => setBdaySettings({ ...bdaySettings, custom_teacher_message: e.target.value })}
                  placeholder="e.g. 🎉 Wishing our esteemed educator {NAME} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School family!"
                  className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex items-center gap-1 text-[10px] text-stone-500 flex-wrap">
                  <span className="font-bold text-stone-700">Tags:</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono text-purple-800">{'{NAME}'}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono text-purple-800">{'{DESIGNATION}'}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono text-purple-800">{'{DEPARTMENT}'}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono text-purple-800">{'{SCHOOL_NAME}'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Monthly Upcoming Birthday Roster (DOB Masked for Privacy) */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Upcoming Birthdays ({monthNames[currentMonth - 1]} {currentYear})
                </h3>
                <p className="text-xs text-stone-500">
                  Full date of birth is securely stored in SIS Master. Display strictly masks birth year and age.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-500">Filter Month:</span>
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                ...(birthdayData?.thisMonthBirthdays?.students || []).map((s: any) => ({
                  name: s.fullName,
                  role: `Student (${s.classDisplay})`,
                  date: `${s.birthDay} ${monthNames[currentMonth - 1]}`,
                  isToday: s.isToday,
                  type: "Student"
                })),
                ...(birthdayData?.thisMonthBirthdays?.teachers || []).map((t: any) => ({
                  name: t.fullName,
                  role: `Faculty (${t.designation || t.department || 'Academics'})`,
                  date: `${t.birthDay} ${monthNames[currentMonth - 1]}`,
                  isToday: t.isToday,
                  type: "Teacher"
                }))
              ].slice(0, 12).map((b, i) => (
                <div key={i} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{b.type === "Student" ? "🎂" : "🎉"}</span>
                    <div>
                      <strong className="text-stone-900 font-bold block">{b.name}</strong>
                      <span className="text-[11px] text-stone-500">{b.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                    b.isToday ? "bg-pink-100 text-pink-900 font-black" : "bg-white border border-stone-200 text-stone-700"
                  }`}>
                    {b.isToday ? "Today!" : b.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 📜 RECENT BIRTHDAY WISHES & AUTOMATED DISPATCH AUDIT LOG */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden text-xs">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center">
              <div>
                <strong className="font-black text-stone-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Birthday Delivery &amp; Dispatch Audit Log
                </strong>
                <p className="text-stone-400 text-[11px]">Real-time history of automated and manual birthday wishes sent to students and faculty.</p>
              </div>
              <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-xl">
                {wishesLog.length} Records Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Sent Timestamp</th>
                    <th className="p-3.5">Recipient</th>
                    <th className="p-3.5">Type &amp; Cohort</th>
                    <th className="p-3.5">Channel</th>
                    <th className="p-3.5">Dispatch Mode</th>
                    <th className="p-3.5">Delivery Status</th>
                    <th className="p-3.5">Message Excerpt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {wishesLog.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400 text-xs">
                        No birthday wishes dispatched yet. Click &quot;⚡ Send Today&apos;s Birthday Wishes Now&quot; to test.
                      </td>
                    </tr>
                  ) : (
                    wishesLog.map((log: any) => (
                      <tr key={log.id} className="hover:bg-stone-50/70">
                        <td className="p-3.5 font-mono text-[11px] text-stone-600">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : "Just now"}
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          {log.recipient_name}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            log.recipient_type === "Student" 
                              ? "bg-pink-100 text-pink-900" 
                              : "bg-purple-100 text-purple-900"
                          }`}>
                            {log.recipient_type} {log.recipient_class ? `• ${log.recipient_class}` : ""}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-stone-700">
                          {log.channel || "App"}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            log.is_automated 
                              ? "bg-amber-100 text-amber-900 font-mono" 
                              : "bg-stone-100 text-stone-700"
                          }`}>
                            {log.is_automated ? "⚡ Auto-Broadcast" : "👤 Manual"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3 text-emerald-600" /> {log.delivery_status || "DELIVERED"}
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-500 max-w-xs truncate" title={log.wish_message}>
                          {log.wish_message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SCHOOL CALENDAR VIEW (INTERACTIVE MONTH GRID + EVENTS LIST) */}
      {/* ========================================================================= */}
      {activeTab === "school_calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Interactive Month Grid */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            
            {/* Month Header Navigation */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-stone-900">
                  {monthNames[currentMonth - 1]} {currentYear}
                </h2>
                <span className="text-xs font-mono font-bold bg-purple-50 text-purple-900 px-2.5 py-0.5 rounded-lg">
                  {currentMonthEvents.length} Events
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 text-stone-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentMonth(8); setCurrentYear(2026); }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-700"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 text-stone-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 text-center font-bold text-[11px] text-stone-400 uppercase tracking-wider py-1 border-b border-stone-100">
              <span className="text-red-500">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-amber-700">Sat</span>
            </div>

            {/* Month Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Blank cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="h-20 bg-stone-50/40 rounded-2xl border border-transparent" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = events.filter(e => e.start_date === dateStr || (e.start_date <= dateStr && e.end_date >= dateStr));
                const isSelected = selectedDay === day;
                const isSunday = (firstDayOfWeek + i) % 7 === 0;
                const isSaturday = (firstDayOfWeek + i) % 7 === 6;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-20 p-1.5 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-purple-50 border-purple-500 shadow-2xs"
                        : dayEvents.length > 0
                        ? "bg-stone-50/90 border-stone-300 hover:border-purple-300"
                        : "bg-white border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={`font-black ${isSunday ? "text-red-500" : isSaturday ? "text-amber-700" : "text-stone-800"}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                      )}
                    </div>

                    {/* Mini event tags */}
                    <div className="space-y-0.5 overflow-hidden max-h-12">
                      {dayEvents.slice(0, 2).map((ev: any) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-bold px-1 py-0.5 rounded truncate ${
                            ev.is_holiday
                              ? "bg-red-100 text-red-900"
                              : ev.is_exam
                              ? "bg-blue-100 text-blue-900"
                              : "bg-purple-100 text-purple-900"
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-stone-400 font-bold block">+ {dayEvents.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right: Selected Day Events Details */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <strong className="text-stone-900 font-black text-xs uppercase tracking-wider">
                  Events on {selectedDay} {monthNames[currentMonth - 1]}
                </strong>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                  {currentYear}
                </span>
              </div>

              {(() => {
                const targetDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                const matchedEvents = events.filter(e => e.start_date === targetDate || (e.start_date <= targetDate && e.end_date >= targetDate));

                if (matchedEvents.length === 0) {
                  return (
                    <div className="py-8 text-center text-stone-400 text-xs">
                      No special school events or examinations scheduled for this date.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {matchedEvents.map((ev: any) => (
                      <div key={ev.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-purple-700 block">{ev.event_type}</span>
                            <strong className="text-stone-900 font-bold text-sm block mt-0.5">{ev.title}</strong>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(ev)}
                              className="text-stone-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition cursor-pointer"
                              title="Edit event"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Remove event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-stone-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{ev.start_time} - {ev.end_time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{ev.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-stone-400" />
                            <span>Audience: <strong>{ev.target_audience}</strong></span>
                          </div>
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-stone-500 bg-white p-2 rounded-xl border border-stone-200/60">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACADEMIC CALENDAR (SESSION 2026-27 FULL ROADMAP) */}
      {/* ========================================================================= */}
      {activeTab === "academic_calendar" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Academic Session 2026–2027 Master Calendar</h3>
              <p className="text-xs text-stone-500">Official yearly schedule including school opening, vacations, exams, and annual day.</p>
            </div>
            <button
              type="button"
              onClick={() => alert("Downloading official Academic Calendar 2026-2027 (PDF)...")}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Academic Planner (PDF)
            </button>
          </div>

          {/* Chronological Timeline Roadmap */}
          <div className="space-y-4">
            {events.map((ev: any, idx: number) => (
              <div key={ev.id} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex flex-col items-center justify-center shrink-0">
                    <span className="font-black text-sm">{ev.start_date.split("-")[2]}</span>
                    <span className="text-[9px] font-bold uppercase">{monthNames[parseInt(ev.start_date.split("-")[1]) - 1].slice(0, 3)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.2 rounded">
                        {ev.event_type}
                      </span>
                      <span className="text-stone-400 text-[10px]">•</span>
                      <span className="text-stone-500 font-mono text-[10px]">{ev.start_time}</span>
                    </div>
                    <strong className="text-stone-900 font-bold text-sm block mt-0.5">{ev.title}</strong>
                    <p className="text-[11px] text-stone-500 mt-0.5">{ev.description || ev.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-xl shrink-0 ${
                    ev.is_holiday
                      ? "bg-red-100 text-red-900"
                      : ev.is_exam
                      ? "bg-blue-100 text-blue-900"
                      : "bg-emerald-100 text-emerald-900"
                  }`}>
                    Audience: {ev.target_audience}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(ev)}
                    className="p-1.5 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                    title="Edit Event"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Remove Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLASS CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === "class_calendar" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">{selectedClass} — Class Specific Calendar</h3>
              <p className="text-xs text-stone-500">Curated schedule of tests, sports activities, PTMs, and class events.</p>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs font-bold text-stone-900"
            >
              {ALL_CLASSES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {events.filter(ev => {
              const classes = Array.isArray(ev.applicable_classes) ? ev.applicable_classes : [];
              return classes.includes("All") || classes.includes(selectedClass);
            }).map((ev: any) => (
              <div key={ev.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-purple-700 font-bold">{ev.start_date}</span>
                    <strong className="text-stone-900 font-bold block text-sm mt-0.5">{ev.title}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold bg-white border border-stone-200 px-2 py-0.5 rounded">
                      {ev.event_type}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(ev)}
                      className="p-1 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded transition cursor-pointer"
                      title="Edit event"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Remove event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">{ev.description || "Class activity on school campus."}</p>
                <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2 pt-1 border-t border-stone-200/60">
                  <span>📍 {ev.venue}</span>
                  <span>⏰ {ev.start_time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TEACHER CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === "teacher_calendar" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Faculty Academic &amp; Staff Calendar</h3>
              <p className="text-xs text-stone-500">Staff meetings, question paper submission deadlines, exam duties, and development days.</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
              Academic Session 2026-27
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {events.filter(e => e.target_audience === "All" || e.target_audience === "Teachers").map((ev: any) => (
              <div key={ev.id} className="py-3.5 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 font-black flex items-center justify-center shrink-0">
                    {ev.start_date.split("-")[2]}
                  </div>
                  <div>
                    <strong className="text-stone-900 font-bold block">{ev.title}</strong>
                    <span className="text-[11px] text-stone-500">{ev.start_date} • {ev.start_time} • {ev.venue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-stone-100 text-stone-800 px-2.5 py-1 rounded-xl">
                    {ev.event_type}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(ev)}
                    className="p-1.5 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                    title="Edit event"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Remove event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EXAM CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === "exam_calendar" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center text-xs">
            <div>
              <strong className="font-black text-stone-900 text-sm">Official Examination Calendar 2026–2027</strong>
              <p className="text-stone-400 text-[11px]">Connected with the Examination Module.</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl">
              Term 1 &amp; Annuals
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Exam Title</th>
                  <th className="p-3.5">Applicable Classes</th>
                  <th className="p-3.5">Timing</th>
                  <th className="p-3.5">Venue</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {events.filter(e => e.is_exam || e.event_type.includes("Exam")).map((ev: any) => (
                  <tr key={ev.id} className="hover:bg-stone-50/70">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{ev.start_date}</td>
                    <td className="p-3.5 font-bold text-purple-950">{ev.title}</td>
                    <td className="p-3.5 font-semibold text-stone-700">
                      {(ev.applicable_classes || []).join(", ")}
                    </td>
                    <td className="p-3.5 text-stone-600 font-mono">{ev.start_time} - {ev.end_time}</td>
                    <td className="p-3.5 text-stone-600">{ev.venue}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-lg">
                        Scheduled
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(ev)}
                          className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Exam"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. HOLIDAYS VIEW */}
      {/* ========================================================================= */}
      {activeTab === "holidays" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">List of School Holidays &amp; Breaks</h3>
              <p className="text-xs text-stone-500">Gazetted festival holidays, winter/autumn vacations, and second/fourth Saturdays.</p>
            </div>
            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-3 py-1 rounded-xl">
              2026–2027
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {events.filter(e => e.is_holiday).map((hol: any) => (
              <div key={hol.id} className="p-4 bg-red-50/50 rounded-2xl border border-red-200/70 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-stone-900 font-bold text-sm block">{hol.title}</strong>
                    <span className="text-[10px] font-bold bg-red-100 text-red-900 px-2 py-0.5 rounded inline-block mt-1">
                      {hol.holiday_type || "Holiday"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(hol)}
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-100/60 rounded-lg transition cursor-pointer"
                      title="Edit Holiday"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(hol.id, hol.title)}
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-100/60 rounded-lg transition cursor-pointer"
                      title="Delete Holiday"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-stone-600 font-mono text-[11px]">
                  📅 {hol.start_date} {hol.end_date && hol.end_date !== hol.start_date ? `to ${hol.end_date}` : ''}
                </div>
                <p className="text-[11px] text-stone-500 italic">{hol.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. REMINDERS & NOTIFICATION TRIGGERS */}
      {/* ========================================================================= */}
      {activeTab === "reminders" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Automated Calendar Reminders &amp; WhatsApp Alerts</h3>
            <p className="text-xs text-stone-500">Configure automated alert cadences for parents, teachers, and students.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-900 uppercase">7 Days Before</span>
              <h4 className="text-base font-black text-purple-950">Advance Notice</h4>
              <p className="text-[11px] text-purple-800">Sent via Push Notification &amp; WhatsApp circular.</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase">3 Days Before</span>
              <h4 className="text-base font-black text-blue-950">Preparation Alert</h4>
              <p className="text-[11px] text-blue-800">Includes syllabus topics and dress codes.</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase">1 Day Before</span>
              <h4 className="text-base font-black text-amber-950">Eve Reminder</h4>
              <p className="text-[11px] text-amber-800">Final confirmation and venue instructions.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase">Morning of Event</span>
              <h4 className="text-base font-black text-emerald-950">Same Day Alert</h4>
              <p className="text-[11px] text-emerald-800">07:00 AM broadcast to parent handsets.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 ADD NEW EVENT MODAL (BROADCAST TO AUDIENCE) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-bold">
                  Broadcast Calendar Event
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">
                  Add Event / Holiday / Examination
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              
              {/* Event Name */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Parent-Teacher Meeting (PTM)"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                />
              </div>

              {/* Event Type & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Event Type *</label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  >
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Target Audience *</label>
                  <select
                    value={newEvent.targetAudience}
                    onChange={(e) => setNewEvent({ ...newEvent, targetAudience: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  >
                    <option value="All">🏫 Entire School (All)</option>
                    <option value="Class">👥 Specific Class(es)</option>
                    <option value="Parents">👨‍👩‍👧 Parents Only</option>
                    <option value="Teachers">👩‍🏫 Teachers Only</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 01:00 PM"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium / Respective Classrooms"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">Description &amp; Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Provide details, uniform instructions, agenda items..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSaving ? "Publishing..." : "Broadcast Event"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 EDIT EVENT MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-bold">
                  Edit Calendar Entry
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-purple-600" />
                  Edit Event / Holiday / Examination
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              
              {/* Event Name */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Event Type & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Event Type *</label>
                  <select
                    value={editingEvent.eventType}
                    onChange={(e) => setEditingEvent({ ...editingEvent, eventType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Target Audience *</label>
                  <select
                    value={editingEvent.targetAudience}
                    onChange={(e) => setEditingEvent({ ...editingEvent, targetAudience: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="All">🏫 Entire School (All)</option>
                    <option value="Class">👥 Specific Class(es)</option>
                    <option value="Parents">👨‍👩‍👧 Parents Only</option>
                    <option value="Teachers">👩‍🏫 Teachers Only</option>
                  </select>
                </div>
              </div>

              {/* Class Selection pills if TargetAudience is Class */}
              {editingEvent.targetAudience === "Class" && (
                <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200/70 space-y-2">
                  <label className="font-bold text-purple-900 block text-[11px]">Select Applicable Classes:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CLASSES.map(cls => {
                      const isSel = (editingEvent.applicableClasses || []).includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => {
                            if (cls === "All") {
                              setEditingEvent({ ...editingEvent, applicableClasses: ["All"] });
                            } else {
                              const curr = (editingEvent.applicableClasses || []).filter(c => c !== "All");
                              const next = curr.includes(cls) ? curr.filter(c => c !== cls) : [...curr, cls];
                              setEditingEvent({ ...editingEvent, applicableClasses: next.length ? next : ["All"] });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                            isSel 
                              ? "bg-purple-600 text-white shadow-2xs" 
                              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {isSel ? "✓ " : ""}{cls}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editingEvent.startDate}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingEvent.endDate}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 01:00 PM"
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium text-stone-900"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium / Respective Classrooms"
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium text-stone-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">Description &amp; Guidelines</label>
                <textarea
                  rows={3}
                  placeholder="Provide details, uniform instructions, agenda items..."
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-medium text-stone-900"
                />
              </div>

              {/* Holiday & Exam Flags */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="flex items-center gap-2 font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.isHoliday}
                    onChange={(e) => setEditingEvent({ ...editingEvent, isHoliday: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>🏖 Mark as School Holiday</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.isExam}
                    onChange={(e) => setEditingEvent({ ...editingEvent, isExam: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>📚 Mark as Examination</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex justify-between items-center border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    handleDeleteEvent(editingEvent.id, editingEvent.title);
                  }}
                  className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Event
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isUpdating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 1-CLICK BIRTHDAY WISH MODAL */}
      {/* ========================================================================= */}
      {isWishModalOpen && selectedRecipient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-xl shrink-0">
                  🎂
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-pink-600 font-bold block">
                    Birthday Greeting Card
                  </span>
                  <h3 className="text-base font-black text-stone-900">
                    Wish {selectedRecipient.fullName}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWishModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendWishSubmit} className="space-y-4">
              <div className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-200/80 space-y-1">
                <span className="text-[10px] font-bold text-pink-800 uppercase block">Recipient Details:</span>
                <strong className="text-stone-900 block text-xs">{selectedRecipient.fullName}</strong>
                <span className="text-[11px] text-stone-500">
                  {selectedRecipient.classDisplay || selectedRecipient.designation || "Crayon Box Family"}
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Personalized Wish Message *</label>
                <textarea
                  rows={4}
                  required
                  value={wishMessage}
                  onChange={(e) => setWishMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Delivery Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["App", "WhatsApp", "SMS"] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setWishChannel(ch)}
                      className={`py-2 rounded-xl font-bold text-xs transition border ${
                        wishChannel === ch
                          ? "bg-pink-600 text-white border-pink-600 shadow-2xs"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {ch === "WhatsApp" ? "💬 WhatsApp" : ch === "SMS" ? "📱 SMS" : "🔔 App Alert"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsWishModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingWish}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>🎈</span>
                  {isSendingWish ? "Sending..." : "Send Birthday Wish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SchoolCalendarPage() {
  redirect('/admin/faculty?tab=calendar');
}
