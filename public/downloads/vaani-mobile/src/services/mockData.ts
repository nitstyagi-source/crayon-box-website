export interface Child {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNo: string;
  avatar: string;
  busNumber: string;
  house: string;
  bloodGroup: string;
  attendancePercent: number;
}

export interface Invoice {
  invoiceNo: string;
  term: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  paidOn: string | null;
  breakdown: {
    tuition: number;
    transport: number;
    lab: number;
    sports: number;
  };
}

export interface Camera {
  id: string;
  name: string;
  room: string;
  status: 'Online' | 'Offline' | 'Paused';
  isStreaming: boolean;
  streamUrl: string;
  fps: number;
  quality: string;
}

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  assignedDate: string;
  teacherName: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  gradeScore?: string;
  description: string;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface ApprovalItem {
  id: string;
  type: string;
  requester: string;
  details: string;
  amount?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'STU-2026-004',
    name: 'Aarav Sharma',
    grade: 'Grade 4',
    section: 'B',
    rollNo: '24',
    avatar: '👨‍🎓',
    busNumber: 'Bus 04',
    house: 'Ruby Phoenix',
    bloodGroup: 'B+',
    attendancePercent: 96.4,
  },
  {
    id: 'STU-2026-018',
    name: 'Anaya Sharma',
    grade: 'Grade 1',
    section: 'A',
    rollNo: '08',
    avatar: '👧',
    busNumber: 'Bus 04',
    house: 'Sapphire Pegasus',
    bloodGroup: 'O+',
    attendancePercent: 98.1,
  },
];

export const INITIAL_CAMERAS: Camera[] = [
  { id: 'cam-01', name: 'Nursery Play Wing', room: 'Nursery A', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/nursery_cam/', fps: 30, quality: '1080p HD' },
  { id: 'cam-02', name: 'Primary Classroom 1', room: '1-A', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/grade1_cam/', fps: 30, quality: '1080p HD' },
  { id: 'cam-03', name: 'Primary Classroom 4', room: '4-B', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/grade4_cam/', fps: 30, quality: '1080p HD' },
  { id: 'cam-04', name: 'Senior Science & Bio Lab', room: 'Science Lab', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/science_lab/', fps: 30, quality: '1080p HD' },
  { id: 'cam-05', name: 'Robotics & AI Innovation Lab', room: 'Tech Hub', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/computer_lab/', fps: 30, quality: '1080p HD' },
  { id: 'cam-06', name: 'Indoor Sports & Activity Hall', room: 'Main Arena', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/activity_hall/', fps: 30, quality: '1080p HD' },
];

export const INITIAL_BUS_DATA = {
  busNumber: 'Bus 04 (Route 12 - Green Park)',
  driverName: 'Rajesh Kumar',
  driverPhone: '+91 98110 44321',
  speedKmH: 34,
  status: 'In Transit',
  currentLocation: 'Sector 62 Crossing, Noida',
  nextStop: 'Apex Tower Gate 2 (Your Stop)',
  etaMinutes: 8,
  latitude: 28.6295,
  longitude: 77.3725,
  stops: [
    { id: '1', name: 'School Campus Main Gate', time: '02:30 PM', completed: true },
    { id: '2', name: 'Sector 62 Metro Station', time: '02:45 PM', completed: true },
    { id: '3', name: 'Apex Tower Gate 2 (Your Stop)', time: '03:00 PM', completed: false, isChildStop: true },
    { id: '4', name: 'Green Park Market', time: '03:15 PM', completed: false },
    { id: '5', name: 'Indirapuram Central Hub', time: '03:30 PM', completed: false },
  ],
};

export const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'HW-01',
    subject: 'Mathematics',
    title: 'Algebraic Expressions & Factorization',
    dueDate: 'Tomorrow, 9:00 AM',
    assignedDate: '2026-08-22',
    teacherName: 'Dr. Meenakshi Sundaram',
    status: 'Pending',
    description: 'Solve questions 1 through 15 on Chapter 4. Document full calculation steps.',
    hasAttachment: true,
    attachmentName: 'algebra_worksheet_aug26.pdf',
  },
  {
    id: 'HW-02',
    subject: 'Science & Robotics',
    title: 'Plant Photosynthesis Experiment Summary',
    dueDate: '25 Aug 2026',
    assignedDate: '2026-08-21',
    teacherName: 'Mr. Arvind Gupta',
    status: 'Submitted',
    gradeScore: 'A+ (98%)',
    description: 'Complete the observation table from the light absorption experiment.',
  },
  {
    id: 'HW-03',
    subject: 'English Literature',
    title: 'Character Essay: Oliver Twist Analysis',
    dueDate: '28 Aug 2026',
    assignedDate: '2026-08-20',
    teacherName: 'Ms. Sarah Jenkins',
    status: 'Pending',
    description: 'Write a 300-word critical essay analyzing the contrasting traits of Oliver and Artful Dodger.',
  },
  {
    id: 'HW-04',
    subject: 'Social Studies',
    title: 'Harappan Architecture & Drainage Systems',
    dueDate: '30 Aug 2026',
    assignedDate: '2026-08-19',
    teacherName: 'Mrs. Kavita Iyer',
    status: 'Graded',
    gradeScore: 'A (92%)',
    description: 'Submit diagrams of the Great Bath and citadel structures.',
  },
];

export const INITIAL_STUDENTS_ROSTER = [
  { id: 'STU-01', rollNo: '01', name: 'Aarav Sharma', status: 'Present' },
  { id: 'STU-02', rollNo: '02', name: 'Aditi Patel', status: 'Present' },
  { id: 'STU-03', rollNo: '03', name: 'Bhavya Verma', status: 'Present' },
  { id: 'STU-04', rollNo: '04', name: 'Devansh Roy', status: 'Absent' },
  { id: 'STU-05', rollNo: '05', name: 'Ishita Kapoor', status: 'Present' },
  { id: 'STU-06', rollNo: '06', name: 'Kabir Singh', status: 'Late' },
  { id: 'STU-07', rollNo: '07', name: 'Manvi Deshmukh', status: 'Present' },
  { id: 'STU-08', rollNo: '08', name: 'Pranav Nair', status: 'Present' },
  { id: 'STU-09', rollNo: '09', name: 'Riya Sen', status: 'Present' },
  { id: 'STU-10', rollNo: '10', name: 'Vihaan Gupta', status: 'Present' },
];

export const INITIAL_TIMETABLE = [
  { period: '1', time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Dr. Sundaram', room: 'Room 402', isCurrent: true },
  { period: '2', time: '09:15 - 10:00 AM', subject: 'Science & Bio', teacher: 'Mr. Arvind', room: 'Lab 1', isCurrent: false },
  { period: '3', time: '10:00 - 10:45 AM', subject: 'English Lit', teacher: 'Ms. Jenkins', room: 'Room 402', isCurrent: false },
  { period: 'Break', time: '10:45 - 11:15 AM', subject: 'Recess & Snacks', teacher: 'Campus Cafeteria', room: 'Dining Hall', isCurrent: false },
  { period: '4', time: '11:15 - 12:00 PM', subject: 'Social Studies', teacher: 'Mrs. Iyer', room: 'Room 402', isCurrent: false },
  { period: '5', time: '12:00 - 12:45 PM', subject: 'AI & Coding', teacher: 'Mr. Prateek', room: 'Tech Lab', isCurrent: false },
  { period: '6', time: '12:45 - 01:30 PM', subject: 'Hindi / Sanskrit', teacher: 'Dr. Sharma', room: 'Room 402', isCurrent: false },
  { period: '7', time: '01:30 - 02:15 PM', subject: 'Robotics & STEAM', teacher: 'Mr. Arvind', room: 'STEAM Zone', isCurrent: false },
  { period: '8', time: '02:15 - 03:00 PM', subject: 'Sports & Swimming', teacher: 'Coach Rakesh', room: 'Aquatic Center', isCurrent: false },
];
