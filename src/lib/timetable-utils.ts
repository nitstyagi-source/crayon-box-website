/**
 * Timetable Utility Functions & Interfaces
 */

export interface PeriodTimingConfig {
  periodNumber: number;
  periodLabel: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isBreak?: boolean;
  breakType?: 'None' | 'Assembly' | 'Short Break' | 'Lunch Break';
}

export interface TimetableSettingsInput {
  institutionCode: string;
  academicSession?: string;
  schoolStartTime: string;
  schoolEndTime: string;
  assemblyStartTime: string;
  assemblyEndTime: string;
  workingDays: string[];
  periodsPerDay: number;
  periodDurationMinutes: number;
  periodTimings: PeriodTimingConfig[];
}

export interface MotherTeacherAllocationInput {
  institutionCode: string;
  academicSession?: string;
  className: string;
  sectionName: string;
  motherTeacherId: string;
  motherTeacherName: string;
  subjectsTaught: string[];
  specialistAssignments?: { subject: string; teacherId: string; teacherName: string }[];
}

export interface SlotConflictCheckInput {
  slotId?: string;
  institutionCode?: string;
  academicSession?: string;
  className: string;
  sectionName: string;
  dayOfWeek: string;
  periodNumber: number;
  teacherId?: string;
  teacherName?: string;
  roomNumber?: string;
}

export interface AutoGenerateTimetableInput {
  institutionCode: string;
  academicSession?: string;
  scope: 'SINGLE_CLASS' | 'ALL_CLASSES';
  className?: string;
  sectionName?: string;
  targetWorkingDays?: string[];
  periodsPerDay?: number;
}

// Parse 12-hour or 24-hour time string into minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 8 * 60 + 30; // Default 08:30 AM
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    // Try 24h format HH:MM
    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    return 8 * 60 + 30;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + (isNaN(minutes) ? 0 : minutes);
}

// Format minutes from midnight to standard 12-hour AM/PM string
export function formatMinutesToTime(totalMinutes: number): string {
  const normMins = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours24 = Math.floor(normMins / 60);
  const mins = normMins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

// Calculate duration in minutes between start and end time
export function calculateDuration(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  let end = parseTimeToMinutes(endTime);
  if (end < start) end += 24 * 60; // Cross midnight
  return Math.max(0, end - start);
}

// Add minutes to a time string
export function addMinutesToTime(startTime: string, minutesToAdd: number): string {
  const start = parseTimeToMinutes(startTime);
  return formatMinutesToTime(start + minutesToAdd);
}

// Default standard period timings generator
export function getDefaultPeriodTimings(periodCount = 8, startHour = 8, startMin = 30, periodDuration = 40): PeriodTimingConfig[] {
  const timings: PeriodTimingConfig[] = [];
  let currentMin = startHour * 60 + startMin;

  for (let i = 1; i <= periodCount; i++) {
    // Insert Short Recess after Period 3
    if (i === 4) {
      const breakStart = currentMin;
      const breakEnd = currentMin + 15;
      timings.push({
        periodNumber: 0,
        periodLabel: 'Recess Break',
        startTime: formatMinutesToTime(breakStart),
        endTime: formatMinutesToTime(breakEnd),
        durationMinutes: 15,
        isBreak: true,
        breakType: 'Short Break'
      });
      currentMin = breakEnd;
    }

    // Insert Lunch Break after Period 5
    if (i === 6) {
      const lunchStart = currentMin;
      const lunchEnd = currentMin + 30;
      timings.push({
        periodNumber: 0,
        periodLabel: 'Lunch Break',
        startTime: formatMinutesToTime(lunchStart),
        endTime: formatMinutesToTime(lunchEnd),
        durationMinutes: 30,
        isBreak: true,
        breakType: 'Lunch Break'
      });
      currentMin = lunchEnd;
    }

    const pStart = currentMin;
    const pEnd = currentMin + periodDuration;
    timings.push({
      periodNumber: i,
      periodLabel: `Period ${i}`,
      startTime: formatMinutesToTime(pStart),
      endTime: formatMinutesToTime(pEnd),
      durationMinutes: periodDuration,
      isBreak: false,
      breakType: 'None'
    });
    currentMin = pEnd;
  }

  return timings;
}

// Recalculate cascading start & end times based on each period's duration
export function recalculateCascadingTimings(
  timings: PeriodTimingConfig[],
  initialStartTime?: string
): PeriodTimingConfig[] {
  let currentMin = initialStartTime ? parseTimeToMinutes(initialStartTime) : (8 * 60 + 30);

  return timings.map((pt, idx) => {
    const dur = pt.durationMinutes > 0 ? pt.durationMinutes : 40;
    const pStart = currentMin;
    const pEnd = currentMin + dur;
    currentMin = pEnd;

    return {
      ...pt,
      startTime: formatMinutesToTime(pStart),
      endTime: formatMinutesToTime(pEnd),
      durationMinutes: dur
    };
  });
}
