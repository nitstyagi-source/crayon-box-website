import { create } from 'zustand';
import { MobileApi } from '../services/api';
import {
  Child,
  Invoice,
  Camera,
  HomeworkItem,
  ApprovalItem,
  INITIAL_CAMERAS,
  INITIAL_BUS_DATA,
  INITIAL_TIMETABLE,
} from '../services/mockData';

export type UserRole = 'Parent' | 'Faculty' | 'Admin' | 'Student' | 'Driver';

interface AppState {
  // Authentication & Persona
  isAuthenticated: boolean;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  activeChildId: string;
  children: Child[];
  
  // Real-time Synchronisation State
  isSyncing: boolean;
  lastSyncedTimestamp: string;
  isOnline: boolean;
  
  // Modules State
  invoices: Invoice[];
  cameras: Camera[];
  busData: typeof INITIAL_BUS_DATA;
  homeworkList: HomeworkItem[];
  studentRoster: any[];
  timetable: typeof INITIAL_TIMETABLE;
  approvals: ApprovalItem[];
  libraryBooks: any[];
  
  // Faculty Attendance & Geofence
  isClockedIn: boolean;
  clockInTime: string | null;
  geofenceVerified: boolean;
  geofenceDistanceMeters: number;

  // Driver Telematics
  isBroadcastingGps: boolean;
  driverSpeed: number;
  driverRoute: any[];

  // Actions
  login: (role?: UserRole, name?: string, email?: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setActiveChild: (childId: string) => void;
  
  // Synchronisation
  syncWithBackend: () => Promise<void>;
  
  // Module Actions
  payInvoice: (invoiceNo: string) => Promise<boolean>;
  toggleStudentAttendance: (studentId: string) => void;
  submitClassAttendance: (grade: string, section: string, period: string) => Promise<boolean>;
  clockInGeofence: (coords?: { latitude: number; longitude: number }) => Promise<boolean>;
  clockOutGeofence: () => void;
  publishNewHomework: (item: Partial<HomeworkItem>) => Promise<boolean>;
  triageApprovalItem: (id: string, action: 'APPROVE' | 'REJECT', remarks?: string) => Promise<boolean>;
  
  // Driver Actions
  toggleGpsBroadcast: (enabled: boolean) => void;
  updateDriverGps: (coords: { latitude: number; longitude: number; speed?: number }) => Promise<boolean>;
  markRouteStopCompleted: (stopIndex: number) => void;
  
  // Library Actions
  renewBookLoan: (loanId: string) => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: true,
  userRole: 'Admin',
  userName: 'Nitin Tyagi (Executive Director)',
  userEmail: 'nits.tyagi@gmail.com',
  activeChildId: 'CBS-2026-0001',
  children: [
    { id: 'CBS-2026-0001', name: 'Aarav Sharma', grade: 'Grade 5', section: 'A', rollNo: '04', avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150', busNumber: 'Bus 04', house: 'Ruby Tigers', bloodGroup: 'O+', attendancePercent: 96.4 },
    { id: 'CBS-2026-0002', name: 'Ananya Sharma', grade: 'Grade 2', section: 'B', rollNo: '11', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', busNumber: 'Bus 04', house: 'Emerald Falcons', bloodGroup: 'B+', attendancePercent: 98.2 }
  ],
  
  isSyncing: false,
  lastSyncedTimestamp: new Date().toLocaleTimeString(),
  isOnline: true,
  
  invoices: [],
  cameras: INITIAL_CAMERAS,
  busData: INITIAL_BUS_DATA,
  homeworkList: [],
  studentRoster: [],
  timetable: INITIAL_TIMETABLE,
  approvals: [],
  libraryBooks: [],
  
  isClockedIn: false,
  clockInTime: null,
  geofenceVerified: true,
  geofenceDistanceMeters: 25,

  isBroadcastingGps: false,
  driverSpeed: 0,
  driverRoute: [
    { name: 'School Campus Main Gate', time: '02:30 PM', completed: true },
    { name: 'Sector 62 Metro Station', time: '02:45 PM', completed: true },
    { name: 'Apex Tower Gate 2', time: '03:00 PM', completed: false, isChildStop: true },
    { name: 'Green Park Market', time: '03:15 PM', completed: false },
    { name: 'Indirapuram Hub', time: '03:30 PM', completed: false }
  ],

  login: (role = 'Admin', name = 'Nitin Tyagi', email = 'nits.tyagi@gmail.com') => {
    set({
      isAuthenticated: true,
      userRole: role,
      userName: name,
      userEmail: email
    });
    get().syncWithBackend();
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  setRole: (role: UserRole) => {
    set({ userRole: role });
    get().syncWithBackend();
  },

  setActiveChild: (childId: string) => {
    set({ activeChildId: childId });
    get().syncWithBackend();
  },

  syncWithBackend: async () => {
    set({ isSyncing: true });
    try {
      const { userRole, activeChildId } = get();
      const response = await MobileApi.syncState({ role: userRole, childId: activeChildId });
      if (response.data && response.data.success) {
        const syncData = response.data.data.syncModules;
        if (syncData.liveCameras) set({ cameras: syncData.liveCameras });
        if (syncData.busTelemetry) set({ busData: syncData.busTelemetry });
        if (syncData.fees?.invoices && syncData.fees.invoices.length > 0) set({ invoices: syncData.fees.invoices });
        if (syncData.digitalDiary && syncData.digitalDiary.length > 0) set({ homeworkList: syncData.digitalDiary });
        if (syncData.approvals && syncData.approvals.length > 0) set({ approvals: syncData.approvals });
      }
    } catch (e) {
      console.log('[VAANI SYNC] Working with local state cache.');
    } finally {
      set({ isSyncing: false, lastSyncedTimestamp: new Date().toLocaleTimeString() });
    }
  },

  payInvoice: async (invoiceNo: string) => {
    const { invoices, activeChildId } = get();
    const updated = invoices.map(inv =>
      inv.invoiceNo === invoiceNo
        ? { ...inv, status: 'PAID' as const, paidOn: new Date().toISOString().split('T')[0] }
        : inv
    );
    set({ invoices: updated });

    try {
      await MobileApi.createFeeOrder({
        studentId: activeChildId,
        invoiceNo,
        amount: 45000,
      });
    } catch (e) {}
    return true;
  },

  toggleStudentAttendance: (studentId: string) => {
    const { studentRoster } = get();
    const updated = studentRoster.map(s => {
      if (s.id !== studentId) return s;
      const nextStatus = s.status === 'Present' ? 'Absent' : s.status === 'Absent' ? 'Late' : 'Present';
      return { ...s, status: nextStatus };
    });
    set({ studentRoster: updated });
  },

  submitClassAttendance: async (grade: string, section: string, period: string) => {
    const { studentRoster } = get();
    try {
      await MobileApi.submitAttendanceRegister({
        grade,
        section,
        period,
        date: new Date().toISOString().split('T')[0],
        attendanceList: studentRoster,
        teacherId: 'FAC-2026-001',
      });
    } catch (e) {}
    return true;
  },

  clockInGeofence: async (coords = { latitude: 28.6295, longitude: 77.3725 }) => {
    try {
      await MobileApi.verifyGeofence(coords);
    } catch (e) {}
    set({
      isClockedIn: true,
      clockInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      geofenceVerified: true,
      geofenceDistanceMeters: 25,
    });
    return true;
  },

  clockOutGeofence: () => {
    set({ isClockedIn: false, clockInTime: null });
  },

  publishNewHomework: async (item: Partial<HomeworkItem>) => {
    const newItem: HomeworkItem = {
      id: `HW-${Date.now().toString().slice(-3)}`,
      subject: item.subject || 'General',
      title: item.title || 'Untitled Assignment',
      dueDate: item.dueDate || 'Tomorrow, 9:00 AM',
      assignedDate: new Date().toISOString().split('T')[0],
      teacherName: get().userName || 'Faculty',
      status: 'Pending',
      description: item.description || '',
      hasAttachment: item.hasAttachment || false,
    };

    set({ homeworkList: [newItem, ...get().homeworkList] });

    try {
      await MobileApi.publishHomework({
        ...newItem,
        targetClass: 'Grade 5-A',
        teacherId: 'FAC-2026-001',
      });
    } catch (e) {}
    return true;
  },

  triageApprovalItem: async (id: string, action: 'APPROVE' | 'REJECT', remarks?: string) => {
    const updated = get().approvals.map(app =>
      app.id === id ? { ...app, status: action === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const } : app
    );
    set({ approvals: updated });

    try {
      await MobileApi.triageApproval({ id, action, remarks });
    } catch (e) {}
    return true;
  },

  toggleGpsBroadcast: (enabled: boolean) => {
    set({ isBroadcastingGps: enabled });
  },

  updateDriverGps: async (coords: { latitude: number; longitude: number; speed?: number }) => {
    set({ driverSpeed: coords.speed || 34 });
    try {
      await MobileApi.sendDriverGps({
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: coords.speed || 34
      });
    } catch (e) {}
    return true;
  },

  markRouteStopCompleted: (stopIndex: number) => {
    const { driverRoute } = get();
    const updated = driverRoute.map((stop, idx) => 
      idx === stopIndex ? { ...stop, completed: true } : stop
    );
    set({ driverRoute: updated });
  },

  renewBookLoan: async (loanId: string) => {
    try {
      await MobileApi.renewLibraryBook(loanId);
    } catch (e) {}
    return true;
  }
}));
