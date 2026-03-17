/**
 * Generate semester dropdown options based on the current date.
 * Uses Thai Buddhist calendar (BE = CE + 543).
 *
 * Thai academic calendar:
 * - Term 1: June - October
 * - Term 2: November - March
 * - Term 3 (summer): April - May
 *
 * Returns recent semesters (newest first), e.g.:
 * ["2/2568", "1/2568", "3/2567", "2/2567", "1/2567", "3/2566"]
 */
export function generateSemesterOptions(): string[] {
  const now = new Date();
  const ceYear = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const beYear = ceYear + 543;

  // Determine current academic year and term
  let currentAcademicYear: number;
  let currentTerm: number;

  if (month >= 6 && month <= 10) {
    // Term 1: June-October
    currentAcademicYear = beYear;
    currentTerm = 1;
  } else if (month >= 11 || month <= 3) {
    // Term 2: November-March
    // If Nov-Dec, academic year is current BE year
    // If Jan-Mar, academic year is previous BE year
    currentAcademicYear = month >= 11 ? beYear : beYear - 1;
    currentTerm = 2;
  } else {
    // Term 3 (summer): April-May
    currentAcademicYear = beYear - 1;
    currentTerm = 3;
  }

  const options: string[] = [];

  // Generate from current term backwards for 2 academic years
  let year = currentAcademicYear;
  let term = currentTerm;

  for (let i = 0; i < 6; i++) {
    options.push(`${term}/${year}`);
    term--;
    if (term < 1) {
      term = 3;
      year--;
    }
  }

  return options;
}
