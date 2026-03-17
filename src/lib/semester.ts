/**
 * Semester utility functions using Thai Buddhist calendar (BE = CE + 543).
 *
 * Thai academic calendar:
 * - Term 1: June - October
 * - Term 2: November - March
 * - Term 3 (summer): April - May
 */

/** Returns current academic BE year based on the current date. */
export function getCurrentAcademicYear(): number {
  const now = new Date();
  const ceYear = now.getFullYear();
  const month = now.getMonth() + 1;
  const beYear = ceYear + 543;

  if (month >= 6 && month <= 10) {
    return beYear;
  } else if (month >= 11) {
    return beYear;
  } else if (month <= 3) {
    return beYear - 1;
  } else {
    // April-May (summer term belongs to previous academic year)
    return beYear - 1;
  }
}

/** Returns array of BE years from current academic year back 10 years. */
export function generateYearOptions(): number[] {
  const currentYear = getCurrentAcademicYear();
  const years: number[] = [];
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push(y);
  }
  return years;
}

/** Parses a semester string like "1/2567" into { term, year }. */
export function parseSemester(semester: string): {
  term: string;
  year: string;
} {
  const [term, year] = semester.split("/");
  return { term: term || "", year: year || "" };
}

/**
 * @deprecated Use generateYearOptions() and separate term/year selects instead.
 */
export function generateSemesterOptions(): string[] {
  const currentYear = getCurrentAcademicYear();
  const now = new Date();
  const month = now.getMonth() + 1;

  let currentTerm: number;
  if (month >= 6 && month <= 10) {
    currentTerm = 1;
  } else if (month >= 11 || month <= 3) {
    currentTerm = 2;
  } else {
    currentTerm = 3;
  }

  const options: string[] = [];
  let year = currentYear;
  let term = currentTerm;

  for (let i = 0; i < 15; i++) {
    options.push(`${term}/${year}`);
    term--;
    if (term < 1) {
      term = 3;
      year--;
    }
  }

  return options;
}
