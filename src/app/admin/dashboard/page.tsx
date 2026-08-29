"use client";

import React from 'react';
import { 
  Users, UserPlus, FileBadge, CalendarCheck, IndianRupee, Clock, BookOpen, 
  Bus, FileText, Megaphone, MoreHorizontal, ChevronRight, CalendarDays, MapPin 
} from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';

export default function AdminDashboard() {
  const { selectedInstitutionObj } = useInstitution();

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Overview Section */}
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-[17px] font-bold text-slate-900">Overview</h3>
         <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
           <span>Today, 20 May 2025</span>
           <CalendarDays className="w-3.5 h-3.5" />
         </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-500" />} 
          bg="bg-blue-50" 
          value="1,248" 
          label="Total Students" 
          trend="↑ 12 from yesterday"
          trendColor="text-green-500"
        />
        <StatCard 
          icon={<Users className="w-5 h-5 text-green-500" />} 
          bg="bg-green-50" 
          value="118" 
          label="Total Staff" 
          trend="↑ 2 from yesterday"
          trendColor="text-green-500"
        />
        <StatCard 
          icon={<CalendarCheck className="w-5 h-5 text-purple-500" />} 
          bg="bg-purple-50" 
          value="92%" 
          label="Attendance" 
          trend="Today"
          trendColor="text-slate-400"
        />
        <StatCard 
          icon={<IndianRupee className="w-5 h-5 text-orange-500" />} 
          bg="bg-orange-50" 
          value="₹ 12.45L" 
          label="Fee Collection" 
          trend="This Month"
          trendColor="text-slate-400"
        />
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-slate-700" />
            <h3 className="text-[16px] font-bold text-slate-900">Announcements</h3>
          </div>
          <button className="text-blue-600 text-[13px] font-semibold hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          <AnnouncementItem 
            color="bg-red-500" 
            title="Annual Day Celebration" 
            desc="Annual Day will be held on 30 May 2025." 
            time="10:30 AM" 
          />
          <AnnouncementItem 
            color="bg-green-500" 
            title="Summer Vacation" 
            desc="School will remain closed from 25 May to 15 June." 
            time="09:15 AM" 
          />
          <AnnouncementItem 
            color="bg-yellow-500" 
            title="Parent Teacher Meeting" 
            desc="PTM for Class 1 to 5 on 24 May 2025." 
            time="Yesterday" 
          />
        </div>
        <button className="w-full mt-5 py-2.5 flex items-center justify-center gap-2 text-blue-600 font-semibold text-[13px] rounded-xl hover:bg-blue-50 transition">
          <span className="text-lg leading-none">+</span> Add Announcement
        </button>
      </div>

      {/* Quick Access */}
      <h3 className="text-[17px] font-bold text-slate-900 mb-4">Quick Access</h3>
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <QuickButton icon={<Users className="w-6 h-6 text-purple-500" />} label="Student Profile" />
        <QuickButton icon={<UserPlus className="w-6 h-6 text-green-500" />} label="Add Student" />
        <QuickButton icon={<Users className="w-6 h-6 text-orange-500" />} label="Staff Directory" />
        <QuickButton icon={<CalendarCheck className="w-6 h-6 text-blue-500" />} label="Mark Attendance" />
        
        <QuickButton icon={<IndianRupee className="w-6 h-6 text-green-500" />} label="Fee Collection" />
        <QuickButton icon={<Clock className="w-6 h-6 text-purple-500" />} label="Time Table" />
        <QuickButton icon={<BookOpen className="w-6 h-6 text-rose-500" />} label="Homework Diary" />
        <QuickButton icon={<Bus className="w-6 h-6 text-yellow-500" />} label="Transport Tracking" />
        
        <QuickButton icon={<FileBadge className="w-6 h-6 text-blue-500" />} label="ID Card Generator" />
        <QuickButton icon={<FileText className="w-6 h-6 text-yellow-500" />} label="Document Center" />
        <QuickButton icon={<Megaphone className="w-6 h-6 text-teal-500" />} label="Circulars" />
        <QuickButton icon={<MoreHorizontal className="w-6 h-6 text-slate-400" />} label="More" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Fee Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-[15px] font-bold text-slate-900 mb-6">Fee Collection (May 2025)</h3>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-32 h-32 shrink-0">
               {/* Donut Chart SVG Placeholder */}
               <svg viewBox="0 0 36 36" className="w-full h-full circular-chart">
                 <path className="text-red-500 stroke-current" strokeWidth="4" strokeDasharray="10, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 <path className="text-orange-400 stroke-current" strokeWidth="4" strokeDasharray="38, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 <path className="text-green-500 stroke-current" strokeWidth="4" strokeDasharray="62, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-[15px] font-extrabold text-slate-900 leading-none">₹ 12.45L</span>
                 <span className="text-[10px] text-slate-500 font-medium">Collected</span>
               </div>
            </div>
            <div className="flex-1 space-y-3">
              <LegendItem color="bg-green-500" label="Collected" value="62%" />
              <LegendItem color="bg-orange-400" label="Pending" value="28%" />
              <LegendItem color="bg-red-500" label="Overdue" value="10%" />
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between text-blue-600">
             <span className="text-[13px] font-semibold">View Fee Report</span>
             <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-slate-900">Attendance Overview</h3>
            <span className="text-[12px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md">This Week</span>
          </div>
          <div className="flex-1 flex items-end justify-between px-2 pt-8 pb-4 relative">
             {/* Line Chart Placeholder */}
             <div className="absolute inset-x-2 bottom-6 top-8">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0,70 L20,60 L40,65 L60,40 L80,50 L100,20 L100,100 L0,100 Z" fill="rgba(34, 197, 94, 0.1)" />
                   <path d="M0,70 L20,60 L40,65 L60,40 L80,50 L100,20" fill="none" stroke="#22c55e" strokeWidth="2" />
                   <circle cx="0" cy="70" r="3" fill="#22c55e" />
                   <circle cx="20" cy="60" r="3" fill="#22c55e" />
                   <circle cx="40" cy="65" r="3" fill="#22c55e" />
                   <circle cx="60" cy="40" r="3" fill="#22c55e" />
                   <circle cx="80" cy="50" r="3" fill="#22c55e" />
                   <circle cx="100" cy="20" r="3" fill="#22c55e" />
                </svg>
             </div>
             {/* X Axis Labels */}
             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1 z-10 w-8">
                  <span className="text-[10px] font-bold text-slate-700 absolute -top-4">{[89, 91, 92, 90, 93, 94][i]}%</span>
                  <span className="text-[11px] text-slate-400 font-medium mt-12">{day}</span>
                </div>
             ))}
          </div>
          <div className="mt-auto flex items-center justify-between text-blue-600 border-t border-slate-50 pt-4">
             <span className="text-[13px] font-semibold">View Attendance Report</span>
             <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Today's Events */}
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-[17px] font-bold text-slate-900">Today's Events</h3>
         <button className="text-blue-600 text-[13px] font-semibold hover:underline">View Calendar</button>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <EventTimeline 
          time="09:00 AM" 
          endTime="10:30 AM" 
          title="PTM - Class 1 to 5" 
          location="Seminar Hall" 
          status="Upcoming" 
          statusColor="text-green-600 bg-green-50" 
        />
        <div className="ml-[52px] h-6 border-l-2 border-dashed border-slate-200 my-1"></div>
        <EventTimeline 
          time="11:00 AM" 
          endTime="12:00 PM" 
          title="Career Guidance Session - Class 10" 
          location="Auditorium" 
          status="Scheduled" 
          statusColor="text-blue-600 bg-blue-50" 
        />
      </div>

    </div>
  );
}

// Components
const StatCard = ({ icon, bg, value, label, trend, trendColor }: any) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <h2 className="text-[22px] font-extrabold text-slate-900 leading-tight mb-1">{value}</h2>
    <p className="text-[12px] text-slate-500 font-medium mb-3">{label}</p>
    <span className={`text-[11px] font-semibold ${trendColor}`}>{trend}</span>
  </div>
);

const AnnouncementItem = ({ color, title, desc, time }: any) => (
  <div className="flex items-start gap-3">
    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`} />
    <div className="flex-1">
      <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{title}</h4>
      <p className="text-[12px] text-slate-500 leading-snug mt-0.5 pr-4">{desc}</p>
    </div>
    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pt-0.5">{time}</span>
  </div>
);

const QuickButton = ({ icon, label }: any) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-3 hover:border-slate-300 hover:shadow-md cursor-pointer transition">
    {icon}
    <span className="text-[12px] font-semibold text-slate-700 leading-tight px-1">{label}</span>
  </div>
);

const LegendItem = ({ color, label, value }: any) => (
  <div className="flex items-center justify-between text-[13px]">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-sm ${color}`} />
      <span className="text-slate-600 font-medium">{label}</span>
    </div>
    <span className="font-bold text-slate-900">{value}</span>
  </div>
);

const EventTimeline = ({ time, endTime, title, location, status, statusColor }: any) => (
  <div className="flex items-start gap-4">
    <div className="w-[45px] text-right shrink-0">
      <div className="text-[12px] font-bold text-slate-900 leading-none">{time}</div>
      <div className="text-[10px] font-medium text-slate-400 mt-1">{endTime}</div>
    </div>
    <div className="w-3 h-3 rounded-full bg-blue-500 border-[3px] border-white ring-1 ring-blue-200 mt-0.5 shrink-0" />
    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
      <div>
        <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{title}</h4>
        <div className="flex items-center gap-1 mt-1 text-slate-500">
          <MapPin className="w-3 h-3" />
          <span className="text-[12px] font-medium">{location}</span>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${statusColor}`}>
        {status}
      </span>
    </div>
  </div>
);
