export const COLLEGE_ID_REGEX = /^[0-9]{2}1FA[A-Z0-9]{5}$/;

export function sanitizeCollegeId(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidCollegeId(input: string): boolean {
  const sanitized = sanitizeCollegeId(input);
  return COLLEGE_ID_REGEX.test(sanitized);
}

export function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  const byteLength = new TextEncoder().encode(password).length;
  if (byteLength > 72) {
    return { valid: false, reason: "Password cannot exceed 72 bytes." };
  }
  return { valid: true };
}

export function getCollegeEmail(collegeId: string): string {
  const sanitized = sanitizeCollegeId(collegeId);
  return `${sanitized.toLowerCase()}@vignan.ac.in`;
}
