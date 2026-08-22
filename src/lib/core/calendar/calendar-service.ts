/**
 * CENTRAL WORKING CALENDAR & HOLIDAY EXCEPTION HIERARCHY SERVICE
 * Resolves calendar day operational types dynamically:
 * Trust Calendar -> Institution Calendar -> Campus Calendar -> Wing/Class Exceptions
 */

export type DayOperationalType =
  | 'REGULAR_INSTRUCTIONAL_DAY'
  | 'WORKING_SATURDAY'
  | 'GAZETTED_HOLIDAY'
  | 'RESTRICTED_HOLIDAY'
  | 'VACATION_BREAK'
  | 'EXAMINATION_DAY'
  | 'SPORTS_OR_ANNUAL_EVENT_DAY'
  | 'STAFF_ONLY_DEVELOPMENT_DAY'
  | 'EMERGENCY_WEATHER_CLOSURE';

export interface CalendarEventEntry {
  id: string;
  scope: 'TRUST' | 'INSTITUTION' | 'CAMPUS' | 'WING';
  institutionId?: string; // Optional (null for Trust-wide holidays)
  campusId?: string;
  title: string;
  startDate: string;
  endDate: string;
  dayType: DayOperationalType;
  description: string;
  isAttendanceDisabled: boolean;
  isTransportDisabled: boolean;
  isFeeLateFinePaused: boolean;
}

// Seeded Calendar Events for Session 2026-2027
const SEEDED_CALENDAR_EVENTS: CalendarEventEntry[] = [
  // Trust-Wide Holidays
  {
    id: 'CAL-TR-01',
    scope: 'TRUST',
    title: 'Independence Day National Holiday',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    dayType: 'GAZETTED_HOLIDAY',
    description: 'National holiday across all Vani Educational Trust institutions',
    isAttendanceDisabled: true,
    isTransportDisabled: true,
    isFeeLateFinePaused: true,
  },
  {
    id: 'CAL-TR-02',
    scope: 'TRUST',
    title: 'Diwali & Autumn Festive Break',
    startDate: '2026-10-30',
    endDate: '2026-11-04',
    dayType: 'VACATION_BREAK',
    description: 'Trust-wide festive break for all 4 member schools',
    isAttendanceDisabled: true,
    isTransportDisabled: true,
    isFeeLateFinePaused: true,
  },

  // Institution-Specific Events
  {
    id: 'CAL-CBS-01',
    scope: 'INSTITUTION',
    institutionId: 'ins-cbs',
    title: 'Crayon Box School Annual STEM & Sports Carnival',
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    dayType: 'SPORTS_OR_ANNUAL_EVENT_DAY',
    description: 'Special scholastic event for CBS Shastri Park campus',
    isAttendanceDisabled: false,
    isTransportDisabled: false,
    isFeeLateFinePaused: false,
  },
  {
    id: 'CAL-CBPS-01',
    scope: 'INSTITUTION',
    institutionId: 'ins-cbps',
    title: 'Montessori Toddler Grandparents Discovery Morning',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    dayType: 'REGULAR_INSTRUCTIONAL_DAY',
    description: 'Early childhood sensory discovery session at CBPS',
    isAttendanceDisabled: false,
    isTransportDisabled: false,
    isFeeLateFinePaused: false,
  },
];

export class MasterCalendarService {
  /**
   * Resolve operational status for any date and institution context
   */
  public static getDayStatus(dateStr: string, institutionId?: string, campusId?: string) {
    const targetDate = new Date(dateStr);
    const isSunday = targetDate.getDay() === 0;

    if (isSunday) {
      return {
        date: dateStr,
        dayType: 'GAZETTED_HOLIDAY' as DayOperationalType,
        title: 'Weekly Sunday Closure',
        isInstructionalDay: false,
        isAttendanceActive: false,
        isTransportActive: false,
      };
    }

    // Check specific calendar event
    const matchedEvent = SEEDED_CALENDAR_EVENTS.find((evt) => {
      const matchScope = evt.scope === 'TRUST' || (institutionId && evt.institutionId === institutionId);
      const inDateRange = dateStr >= evt.startDate && dateStr <= evt.endDate;
      return matchScope && inDateRange;
    });

    if (matchedEvent) {
      return {
        date: dateStr,
        dayType: matchedEvent.dayType,
        title: matchedEvent.title,
        isInstructionalDay: matchedEvent.dayType === 'REGULAR_INSTRUCTIONAL_DAY' || matchedEvent.dayType === 'EXAMINATION_DAY',
        isAttendanceActive: !matchedEvent.isAttendanceDisabled,
        isTransportActive: !matchedEvent.isTransportDisabled,
        event: matchedEvent,
      };
    }

    // Default regular working day
    return {
      date: dateStr,
      dayType: 'REGULAR_INSTRUCTIONAL_DAY' as DayOperationalType,
      title: 'Regular Academic Instructional Day',
      isInstructionalDay: true,
      isAttendanceActive: true,
      isTransportActive: true,
    };
  }

  /**
   * Get all upcoming calendar events for an institution
   */
  public static getUpcomingEvents(institutionId?: string): CalendarEventEntry[] {
    return SEEDED_CALENDAR_EVENTS.filter((e) => e.scope === 'TRUST' || !institutionId || e.institutionId === institutionId);
  }
}
