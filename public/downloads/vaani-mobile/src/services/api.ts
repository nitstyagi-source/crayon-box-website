import axios from 'axios';

// Default endpoint connects to the Next.js ERP Mobile API
export const API_BASE_URL = 'http://localhost:3000/api/mobile';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'Vaani-Mobile-App',
    'X-App-Version': '2.1.0'
  },
});

export const MobileApi = {
  // Universal Sync Endpoint
  syncState: async (params: { userId?: string; role?: string; childId?: string }) => {
    return apiClient.get('/sync', { params });
  },

  // Auth & Profile
  login: async (credentials: any) => {
    return apiClient.post('/auth/login', credentials);
  },
  switchProfile: async (payload: { role: string; childId?: string }) => {
    return apiClient.post('/auth/switch-profile', payload);
  },

  // Attendance
  verifyGeofence: async (coords: { latitude: number; longitude: number; accuracy?: number }) => {
    return apiClient.post('/attendance/geofence', coords);
  },
  submitAttendanceRegister: async (payload: any) => {
    return apiClient.post('/attendance/register', payload);
  },

  // Fees & Payments
  getFees: async (studentId: string) => {
    return apiClient.get('/fees', { params: { studentId } });
  },
  createFeeOrder: async (payload: { studentId: string; invoiceNo: string; amount: number }) => {
    return apiClient.post('/fees', payload);
  },

  // CCTV Live Stream
  getLiveToken: async (cameraId: string) => {
    return apiClient.get('/live-stream/token', { params: { cameraId } });
  },

  // Homework & Academics
  getHomework: async (grade: string) => {
    return apiClient.get('/academics/homework', { params: { grade } });
  },
  publishHomework: async (payload: any) => {
    return apiClient.post('/academics/homework', payload);
  },

  // Approvals (Admin)
  getApprovals: async () => {
    return apiClient.get('/approvals');
  },
  triageApproval: async (payload: { id: string; action: 'APPROVE' | 'REJECT'; remarks?: string }) => {
    return apiClient.post('/approvals', payload);
  },

  // Transport & Driver Telematics
  getBusTelematics: async () => {
    return apiClient.get('/transport/telematics');
  },
  sendDriverGps: async (payload: { latitude: number; longitude: number; speed?: number; vehicleId?: string }) => {
    return apiClient.post('/transport/telematics', payload);
  },

  // Digital Library Desk
  searchLibraryBooks: async (search?: string) => {
    return apiClient.get('/library', { params: { search } });
  },
  renewLibraryBook: async (loanId: string) => {
    return apiClient.post('/library', { loanId });
  },

  // Notifications
  getNotifications: async (userId: string) => {
    return apiClient.get('/notifications', { params: { userId } });
  },
};
