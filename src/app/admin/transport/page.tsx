"use client";

import { useState } from "react";
import { Search, MapPin, Navigation, AlertTriangle, PhoneCall, Bus, Users, ShieldAlert, CheckCircle2, ChevronRight, X, UserX } from "lucide-react";

type RouteInfo = {
  id: string;
  name: string;
  driver: string;
  phone: string;
  status: "On Time" | "Delayed" | "Emergency";
  speed: string;
  eta: string;
  occupancy: string;
};

const routes: RouteInfo[] = [
  { id: "R-04", name: "Route 4 (South Sector)", driver: "Amit Singh", phone: "+91 9876543210", status: "On Time", speed: "42 km/h", eta: "8:15 AM", occupancy: "34/40" },
  { id: "R-12", name: "Route 12 (North Sector)", driver: "Vikram Patel", phone: "+91 9123456789", status: "Delayed", speed: "12 km/h", eta: "8:35 AM", occupancy: "28/40" },
  { id: "R-07", name: "Route 7 (East Sector)", driver: "Rajesh Kumar", phone: "+91 9988776655", status: "On Time", speed: "38 km/h", eta: "8:20 AM", occupancy: "38/40" },
];

export default function TransportCommandCenter() {
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [manifestOpen, setManifestOpen] = useState(false);

  return (
    <div className={`flex h-[calc(100vh-8rem)] -m-6 overflow-hidden transition-colors duration-500 ${sosActive ? 'bg-red-50' : 'bg-white'}`}>
      
      {/* 65% Map Interface */}
      <div className="flex-1 relative border-r border-slate-200 flex flex-col">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-slate-100 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] z-0 flex items-center justify-center overflow-hidden">
          {/* Map Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-200/80"></div>
          
          {/* Mock Map Elements */}
          <div className={`absolute transition-all duration-1000 ${sosActive ? 'scale-110' : 'scale-100'} flex flex-col items-center justify-center`}>
            {sosActive && (
              <div className="absolute w-64 h-64 bg-red-500/20 rounded-full animate-ping"></div>
            )}
            <div className={`relative w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white z-10 ${sosActive ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}>
              <Bus className="w-6 h-6" />
              {sosActive && <AlertTriangle className="absolute -top-2 -right-2 w-5 h-5 text-red-500 bg-white rounded-full p-0.5" />}
            </div>
            <div className="mt-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 z-10">
              <p className="text-xs font-bold text-slate-800">{sosActive ? 'Route 12 (Emergency)' : 'Route 4'}</p>
              <p className="text-[10px] text-slate-500 font-mono text-center">28.5355° N, 77.3910° E</p>
            </div>
          </div>
        </div>

        {/* Map Header Overlay */}
        <div className="relative z-10 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-xl p-3 pointer-events-auto">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Fleet Tracking</h1>
            <p className="text-xs text-slate-500 font-medium">18 Active Vehicles • 2 Delayed</p>
          </div>
          
          {/* SOS Trigger for testing */}
          <button 
            onClick={() => setSosActive(!sosActive)}
            className={`pointer-events-auto px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center gap-2 ${sosActive ? 'bg-slate-900 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            {sosActive ? 'Resolve Emergency' : 'Trigger SOS Test'}
          </button>
        </div>

        {/* Emergency Checklist Overlay */}
        {sosActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 bg-red-600 text-white rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-4 bg-red-700 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 animate-pulse text-red-200" />
              <div>
                <h2 className="font-black text-lg uppercase tracking-wider">SOS Protocol Active</h2>
                <p className="text-xs text-red-200 font-medium">Route 12 panic button triggered</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full bg-white text-red-700 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-50">
                <PhoneCall className="w-4 h-4" /> Call Driver (Vikram Patel)
              </button>
              <button className="w-full bg-red-800 text-white font-bold py-2 rounded-lg text-sm hover:bg-red-900">
                Dispatch Backup Vehicle
              </button>
              <button className="w-full bg-red-800 text-white font-bold py-2 rounded-lg text-sm hover:bg-red-900">
                Notify Local Authorities
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 35% Sidebar */}
      <div className={`w-[400px] flex flex-col shrink-0 z-10 transition-colors ${sosActive ? 'bg-red-50' : 'bg-slate-50'}`}>
        
        {/* Alerts Panel */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Critical Alerts</h2>
          {sosActive ? (
            <div className="bg-red-600 text-white p-3 rounded-lg flex gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">SOS TRIGGERED</p>
                <p className="text-xs text-red-100">Route 12 driver has activated the panic button at 08:32 AM.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-100 border border-amber-200 text-amber-800 p-3 rounded-lg flex gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Route 12 Delayed</p>
                <p className="text-xs text-amber-700 mt-0.5">Heavy traffic reported on Sector 18 road. ETA delayed by 15 mins.</p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search routes, drivers..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        {/* Route List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {routes.map(route => {
            const isEmergency = sosActive && route.id === "R-12";
            return (
              <div 
                key={route.id} 
                className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${isEmergency ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-200 hover:border-blue-300'}`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${isEmergency ? 'bg-red-600' : 'bg-slate-900'}`}>
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{route.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isEmergency ? 'bg-red-100 text-red-700' : route.status === 'On Time' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {isEmergency ? 'Emergency' : route.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-lg p-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Speed</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{route.speed}</p>
                    </div>
                    <div className="border-l border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">ETA</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{route.eta}</p>
                    </div>
                    <div className="border-l border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Pax</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{route.occupancy}</p>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Details */}
                {selectedRoute?.id === route.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                          {route.driver.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{route.driver}</p>
                          <p className="text-[10px] text-slate-500">{route.phone}</p>
                        </div>
                      </div>
                      <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-blue-50 text-blue-600 transition-colors">
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setManifestOpen(true)}
                      className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Users className="w-4 h-4" /> View Live Student Manifest
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Manifest Drawer */}
      {manifestOpen && selectedRoute && (
        <div className="absolute inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform animate-in slide-in-from-right flex flex-col">
          <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Manifest</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">{selectedRoute.name}</p>
            </div>
            <button onClick={() => setManifestOpen(false)} className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 border-b border-slate-200 grid grid-cols-3 gap-2">
            <div className="bg-green-50 p-3 rounded-xl text-center border border-green-100">
              <h3 className="text-2xl font-black text-green-700">34</h3>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Boarded</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-200">
              <h3 className="text-2xl font-black text-slate-700">4</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-center border border-red-100">
              <h3 className="text-2xl font-black text-red-700">2</h3>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Absent</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {[
              { name: "Aarav Sharma", grade: "Grade 4", stop: "Sector 14 Gate", status: "boarded" },
              { name: "Neha Gupta", grade: "Grade 6", stop: "Sector 14 Gate", status: "boarded" },
              { name: "Kunal Singh", grade: "Pre-K", stop: "Sector 15 Main", status: "pending" },
              { name: "Diya Patel", grade: "Grade 8", stop: "Sector 15 Main", status: "absent" },
            ].map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                  <p className="text-xs text-slate-500">{student.grade} • {student.stop}</p>
                </div>
                <div>
                  {student.status === 'boarded' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {student.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300"></div>}
                  {student.status === 'absent' && <UserX className="w-5 h-5 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
