"use client";

import { Users, BookOpen, Clock, AlertTriangle, ChevronRight, CheckSquare, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function StaffDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Good morning, Sarah!</h1>
          <p className="text-emerald-100">You have 2 classes today. 100% of your students are present in Homeroom.</p>
        </div>
        <div className="shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1 text-right">Current Term</p>
          <p className="text-2xl font-black">Term 2 <span className="text-lg font-normal opacity-80">(Week 14)</span></p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">My Students</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">42</h3>
            <p className="text-sm text-slate-500 mt-1">Across 2 assigned classes</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Classes Today</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">2</h3>
            <p className="text-sm text-slate-500 mt-1">Next: Math (10:00 AM)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Tasks</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">4</h3>
            <p className="text-sm text-amber-600 mt-1 font-medium">Report cards due Friday</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Absent Today</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">0</h3>
            <p className="text-sm text-slate-500 mt-1">Perfect attendance!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
            <button className="text-sm text-emerald-600 font-bold hover:text-emerald-700">View Full Calendar</button>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                <div className="w-24 shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">08:30 AM</p>
                  <p className="text-xs text-slate-500">45 Mins</p>
                </div>
                <div className="w-1 h-12 bg-emerald-500 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Homeroom & Attendance</h3>
                  <p className="text-sm text-slate-500">Grade 4A • Room 102</p>
                </div>
                <Link href="/staff/attendance" className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
                  Take Attendance
                </Link>
              </div>
              <div className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                <div className="w-24 shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">10:00 AM</p>
                  <p className="text-xs text-slate-500">60 Mins</p>
                </div>
                <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Mathematics (Fractions)</h3>
                  <p className="text-sm text-slate-500">Grade 4A • Room 102</p>
                </div>
              </div>
              <div className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors opacity-50 bg-slate-50">
                <div className="w-24 shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">11:00 AM</p>
                  <p className="text-xs text-slate-500">30 Mins</p>
                </div>
                <div className="w-1 h-12 bg-slate-300 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Lunch Break</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/staff/attendance" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Take Attendance</h3>
                  <p className="text-xs text-slate-500">Mark students present or absent</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link href="/staff/communications" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Broadcast Message</h3>
                  <p className="text-xs text-slate-500">Send an update to parents</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link href="/staff/grades" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Update Grades</h3>
                  <p className="text-xs text-slate-500">Term 2 assessments</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
