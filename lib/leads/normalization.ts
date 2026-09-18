/**
 * Lead normalization helpers.
 *
 * These functions are intentionally kept independent from Prisma so they can
 * be reused by API routes, server-side validation, and future import tools.
 */

/**
 * Normalizes an email address for duplicate comparison.
 *
 * Example:
 *   " Rahul@Example.COM " -> "rahul@example.com"
 */
export function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }
  
  /**
   * Normalizes an Indian phone number for duplicate comparison.
   *
   * Supported common formats:
   *   +91 98765 43210 -> 919876543210
   *   919876543210    -> 919876543210
   *   09876543210     -> 919876543210
   *   9876543210      -> 919876543210
   *
   * Non-digit characters are removed before normalization.
   *
   * For non-Indian/international numbers, the function preserves the
   * resulting international digits rather than guessing a country code.
   */
  export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, "");
  
    if (!digits) {
      return "";
    }
  
    // Already normalized Indian international number.
    if (digits.startsWith("91") && digits.length === 12) {
      return digits;
    }
  
    // Indian number entered with a leading zero.
    if (digits.length === 11 && digits.startsWith("0")) {
      return `91${digits.slice(1)}`;
    }
  
    // Standard 10-digit Indian mobile number.
    if (digits.length === 10) {
      return `91${digits}`;
    }
  
    // Preserve other international formats without guessing.
    return digits;
  }
  
  /**
   * Returns both normalized identifiers used by duplicate detection.
   */
  export function normalizeLeadIdentifiers({
    email,
    phone,
  }: {
    email: string;
    phone: string;
  }) {
    return {
      email: normalizeEmail(email),
      phone: normalizePhone(phone),
    };
  }
  
  /**
   * Determines which lead identifiers matched.
   */
  export function getMatchedIdentifiers({
    emailMatched,
    phoneMatched,
  }: {
    emailMatched: boolean;
    phoneMatched: boolean;
  }): Array<"email" | "phone"> {
    const matched: Array<"email" | "phone"> = [];
  
    if (emailMatched) {
      matched.push("email");
    }
  
    if (phoneMatched) {
      matched.push("phone");
    }
  
    return matched;
  }