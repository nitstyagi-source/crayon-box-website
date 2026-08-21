"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  BookOpen, Trophy, Sparkles, Award, Bell, Plus, 
  Filter, Search, ChevronLeft, ChevronRight, Check, 
  Trash2, Download, Paperclip, MessageSquare, AlertCircle,
  School, HeartHandshake, Eye, Send, CheckCircle2
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getSchoolCalendarEvents, 
  createCalendarEvent, 
  deleteCalendarEvent 
} from "@/app/actions/school-calendar";
import { 
  getTodaysAndUpcomingBirthdays, 
  sendBirthdayWish 
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

export default function SchoolCalendarPage() {
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

  // Add Event Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      const [eventsRes, bdayRes] = await Promise.all([
        getSchoolCalendarEvents({
          campusId: activeCampusId,
          eventType: selectedEventType,
          className: activeTab === "class_calendar" ? selectedClass : "All"
        }),
        getTodaysAndUpcomingBirthdays({
          campusId: activeCampusId,
          role: "Admin",
          targetMonth: currentMonth
        })
      ]);

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
      if (bdayRes.success && bdayRes.data) {
        setBirthdayData(bdayRes.data);
      }
    } catch (e) {
      console.error("Error loading calendar events:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenWishModal(person: any, type: "Student" | "Teacher") {
    setSelectedRecipient(person);
    setRecipientType(type);
    const defaultText = type === "Student"
      ? `🎂 Happy Birthday, ${person.fullName}! Wishing you a wonderful day filled with happiness and learning! From Crayon Box School family 🎉`
      : `🎉 Wishing our esteemed educator ${person.fullName} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School!`;
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
        recipientClass: selectedRecipient.classDisplay || "",
        senderName: "Director & School Management",
        senderRole: "Management",
        message: wishMessage,
        channel: wishChannel
      });

      if (res.success) {
        alert(`🎉 ${res.message}`);
        setIsWishModalOpen(false);
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
        alert(res.message);
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
      } else {
        alert("Error creating event: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Event Deletion
  async function handleDeleteEvent(id: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}" from the calendar?`)) return;
    const res = await deleteCalendarEvent(id);
    if (res.success) {
      loadEvents();
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
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> [ + Add Event / Holiday ]
        </button>
      </div>

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
          
          {/* Today's Special Birthday Banner */}
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
                    <p className="text-[11px] text-stone-400">Visible only to class teacher &amp; management</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-xl">
                  {birthdayData?.todaysBirthdays?.students?.length || 2} Celebrations Today
                </span>
              </div>

              <div className="space-y-3">
                {(birthdayData?.todaysBirthdays?.students?.length ? birthdayData.todaysBirthdays.students : [
                  { id: "stu-bday-1", fullName: "Aadya Sanwal", classDisplay: "Grade 5-A", dateFormatted: "Today" },
                  { id: "stu-bday-2", fullName: "Ananya Gupta", classDisplay: "Grade 3-B", dateFormatted: "Today" }
                ]).map((stu: any) => (
                  <div key={stu.id} className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-200 text-pink-800 font-black flex items-center justify-center text-sm">
                        {stu.fullName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-stone-900 font-bold text-xs block">{stu.fullName}</strong>
                        <span className="text-[11px] text-pink-800 font-semibold">{stu.classDisplay} • 🎈 Birthday Today</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenWishModal(stu, "Student")}
                      className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>🎂</span> Wish
                    </button>
                  </div>
                ))}
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
                    <p className="text-[11px] text-stone-400">Visible to faculty colleagues &amp; leadership</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                  {birthdayData?.todaysBirthdays?.teachers?.length || 1} Celebration Today
                </span>
              </div>

              <div className="space-y-3">
                {(birthdayData?.todaysBirthdays?.teachers?.length ? birthdayData.todaysBirthdays.teachers : [
                  { id: "staff-bday-1", fullName: "Bhawna Tyagi", designation: "Senior Kindergarten Educator", department: "Early Childhood", dateFormatted: "Today" }
                ]).map((t: any) => (
                  <div key={t.id} className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-900 font-black flex items-center justify-center text-sm">
                        {t.fullName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-stone-900 font-bold text-xs block">{t.fullName}</strong>
                        <span className="text-[11px] text-purple-800 font-semibold">{t.designation} ({t.department})</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenWishModal(t, "Teacher")}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>🎉</span> Send Birthday Wish
                    </button>
                  </div>
                ))}
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
                { name: "Aadya Sanwal", role: "Student (Grade 5-A)", date: "24 August", isToday: true, type: "Student" },
                { name: "Bhawna Tyagi", role: "Faculty (Kindergarten)", date: "30 August", isToday: false, type: "Teacher" },
                { name: "Amishi Chaurasia", role: "Student (Grade 1-B)", date: "04 July", isToday: false, type: "Student" },
                { name: "Charu Sharma", role: "Faculty (Mathematics)", date: "04 December", isToday: false, type: "Teacher" },
                { name: "Aadvika", role: "Student (UKG Uranus)", date: "09 December", isToday: false, type: "Student" }
              ].map((b, i) => (
                <div key={i} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{b.type === "Student" ? "🎂" : "🎉"}</span>
                    <div>
                      <strong className="text-stone-900 font-bold block">{b.name}</strong>
                      <span className="text-[11px] text-stone-500">{b.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                    b.isToday ? "bg-pink-100 text-pink-900" : "bg-white border border-stone-200 text-stone-700"
                  }`}>
                    {b.isToday ? "Today!" : b.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Birthday Settings & Privacy Panel */}
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                ⚙️ Birthday Privacy &amp; Notification Settings
              </h3>
              <p className="text-stone-500 text-[11px]">
                Control role-based birthday visibility and prevent exposing sensitive student DOB to other parents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
                <div>
                  <strong className="text-stone-900 font-bold block">Enable Student Birthdays</strong>
                  <span className="text-[10px] text-stone-500">Show to Class Teacher &amp; Management</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
                <div>
                  <strong className="text-stone-900 font-bold block">Enable Teacher Birthdays</strong>
                  <span className="text-[10px] text-stone-500">Show to Staff &amp; Leadership</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
                <div>
                  <strong className="text-stone-900 font-bold block">Hide Full DOB from Users</strong>
                  <span className="text-[10px] text-emerald-700 font-semibold">Shows only &apos;Birthday Today&apos;</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
                <div>
                  <strong className="text-stone-900 font-bold block">Allow Birthday Wishes</strong>
                  <span className="text-[10px] text-stone-500">Enable 1-Click Wish buttons</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-purple-600 rounded" />
                <div>
                  <strong className="text-stone-900 font-bold block">Allow Classmates to Wish</strong>
                  <span className="text-[10px] text-stone-500">Disabled by default for privacy</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600 rounded" />
                <div>
                  <strong className="text-stone-900 font-bold block">WhatsApp Birthday Card</strong>
                  <span className="text-[10px] text-stone-500">Auto-dispatch card at 08:00 AM</span>
                </div>
              </label>
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
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            className="text-stone-400 hover:text-red-600 p-1"
                            title="Remove event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
              onClick={() => alert("Downloading official CBSE Academic Calendar 2026-2027 (PDF)...")}
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

                <span className={`text-[10px] font-black px-3 py-1 rounded-xl shrink-0 ${
                  ev.is_holiday
                    ? "bg-red-100 text-red-900"
                    : ev.is_exam
                    ? "bg-blue-100 text-blue-900"
                    : "bg-emerald-100 text-emerald-900"
                }`}>
                  Audience: {ev.target_audience}
                </span>
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
                  <span className="text-[10px] font-bold bg-white border border-stone-200 px-2 py-0.5 rounded">
                    {ev.event_type}
                  </span>
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
                <span className="text-[10px] font-bold bg-stone-100 text-stone-800 px-2.5 py-1 rounded-xl">
                  {ev.event_type}
                </span>
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
                  <strong className="text-stone-900 font-bold text-sm">{hol.title}</strong>
                  <span className="text-[10px] font-bold bg-red-100 text-red-900 px-2 py-0.5 rounded">
                    {hol.holiday_type || "Holiday"}
                  </span>
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
