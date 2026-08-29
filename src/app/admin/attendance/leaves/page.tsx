"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getStudentLeaveRequests, approveStudentLeaveRequest } from '@/app/actions/leave-actions';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { Calendar, Check, X, Clock, FileText } from 'lucide-react';

export default function LeaveApprovalsDesk() {
  const { currentInstitution } = useInstitution();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchLeaves();
  }, [currentInstitution, filter]);

  const fetchLeaves = async () => {
    setLoading(true);
    const res = await getStudentLeaveRequests(currentInstitution, filter);
    if (res.success) {
      setLeaves(res.data);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await approveStudentLeaveRequest(id, status, 'dummy-staff-id'); // TODO: get real staff ID from auth context
    if (res.success) {
      fetchLeaves();
    } else {
      alert('Error updating leave request');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Approvals Desk</h1>
          <p className="text-slate-500">Manage student leave requests across your institution.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading leave requests...</div>
      ) : leaves.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Leave Requests</h3>
          <p>There are currently no {filter.toLowerCase()} leave requests for this institution.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <Card key={leave.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${leave.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {leave.status === 'PENDING' ? <Clock className="h-6 w-6" /> : leave.status === 'APPROVED' ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {leave.first_name} {leave.last_name}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="font-medium text-blue-600">{leave.class_name} - {leave.section_name}</span>
                    &bull;
                    <span>{leave.leave_type} Leave</span>
                  </p>
                  <p className="text-sm mt-2 font-medium">Reason: {leave.reason}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>From {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {leave.status === 'PENDING' && (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleApprove(leave.id, 'REJECTED')}>
                    <X className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(leave.id, 'APPROVED')}>
                    <Check className="h-4 w-4 mr-2" /> Approve
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
