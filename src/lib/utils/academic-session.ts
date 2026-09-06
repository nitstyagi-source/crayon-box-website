/**
 * Universal Academic Session & Fiscal Cycle Engine
 * Crayon Box School Web ERP
 *
 * Implements Pillar 1 & Pillar 4 of the Enterprise Dynamic Architecture.
 * Standardizes dynamic academic session calculation across all school modules.
 */

/**
 * Returns the dynamic academic session string (e.g. "2026-2027").
 * In Indian schooling systems, the academic year runs from April 1 to March 31.
 */
export function getDefaultAcademicSession(date: Date = new Date()): string {
  const year = date.getFullYear();
  // If month is April (3 in 0-indexed) or later, session is year - (year + 1)
  // If month is Jan-Mar (0-2 in 0-indexed), session is (year - 1) - year
  const startYear = date.getMonth() >= 3 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

/**
 * Returns the short-form academic session string (e.g. "2026-27").
 */
export function getDefaultAcademicSessionShort(date: Date = new Date()): string {
  const session = getDefaultAcademicSession(date);
  const [startYear, endYear] = session.split("-");
  const shortEnd = String(Number(endYear) % 100).padStart(2, "0");
  return `${startYear}-${shortEnd}`;
}

/**
 * Returns the ISO date range for an academic session.
 * Defaults to April 1 of start year to March 31 of end year.
 */
export function getSessionDateRange(session?: string): { startDate: string; endDate: string } {
  const targetSession = session || getDefaultAcademicSession();
  const [startYearStr, endYearStr] = targetSession.split("-");
  const startYear = parseInt(startYearStr, 10) || new Date().getFullYear();
  const endYear = parseInt(endYearStr, 10) || startYear + 1;

  return {
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
  };
}

/**
 * Evaluates current academic quarter (Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar).
 */
export function getAcademicQuarter(date: Date = new Date()): {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  name: string;
  session: string;
} {
  const month = date.getMonth(); // 0 to 11
  const session = getDefaultAcademicSession(date);

  if (month >= 3 && month <= 5) {
    return { quarter: "Q1", name: "Quarter 1 (Apr - Jun)", session };
  } else if (month >= 6 && month <= 8) {
    return { quarter: "Q2", name: "Quarter 2 (Jul - Sep)", session };
  } else if (month >= 9 && month <= 11) {
    return { quarter: "Q3", name: "Quarter 3 (Oct - Dec)", session };
  } else {
    return { quarter: "Q4", name: "Quarter 4 (Jan - Mar)", session };
  }
}

/**
 * Generates an array of academic year options centered on the current session.
 * Useful for UI select dropdowns.
 */
export function getAcademicYearOptions(pastYears: number = 2, futureYears: number = 3): string[] {
  const currentStartYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const options: string[] = [];

  for (let i = -pastYears; i <= futureYears; i++) {
    const yr = currentStartYear + i;
    options.push(`${yr}-${yr + 1}`);
  }

  return options;
}
