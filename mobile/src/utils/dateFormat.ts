/**
 * Shared date/time formatting utilities for handling Jackson LocalDate/LocalTime
 * serialization formats (arrays like [2026, 7, 2] and [10, 0]).
 *
 * Hermes JS engine doesn't reliably parse "YYYY-MM-DD" strings, so we must
 * manually construct Date objects from parts.
 */

/**
 * Parse a Jackson LocalDate value (array [Y,M,D] or string "YYYY-MM-DD")
 * into a formatted Turkish date string.
 */
export function formatLocalDate(val: any, options?: Intl.DateTimeFormatOptions): string {
  if (!val) return "Belirtilmemiş";

  const dateOptions = options || { day: "numeric", month: "long", year: "numeric" } as const;

  if (Array.isArray(val)) {
    return new Date(val[0], val[1] - 1, val[2]).toLocaleDateString("tr-TR", dateOptions);
  }

  if (typeof val === "string") {
    const parts = val.split("-").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("tr-TR", dateOptions);
    }
    // Fallback: try native parse (may give wrong results on Hermes)
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("tr-TR", dateOptions);
  }

  return "Belirtilmemiş";
}

/**
 * Parse a Jackson LocalDate value into a short "DD.MM.YYYY" string.
 */
export function formatLocalDateShort(val: any): string {
  return formatLocalDate(val, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Parse a Jackson LocalTime value (array [H,M] or string "HH:MM:SS")
 * into a "HH:MM" formatted string.
 */
export function formatLocalTime(val: any): string {
  if (!val) return "";

  if (Array.isArray(val)) {
    const h = String(val[0]).padStart(2, "0");
    const m = String(val[1] ?? 0).padStart(2, "0");
    return `${h}:${m}`;
  }

  if (typeof val === "string") {
    // "10:00:00" → "10:00" or already "10:00" → "10:00"
    return val.slice(0, 5);
  }

  return String(val);
}

/**
 * Format a time range from two Jackson LocalTime values.
 * Returns "HH:MM - HH:MM"
 */
export function formatTimeRange(start: any, end: any): string {
  return `${formatLocalTime(start)} - ${formatLocalTime(end)}`;
}

/**
 * Formats a message ISO datetime string with fallback offset check for Hermes
 */
export function formatMessageTime(createdAt: string): string {
  if (!createdAt) return "";
  try {
    // Extract raw HH:MM directly from "2026-07-03T03:25:00" or "2026-07-03 03:25:00"
    const match = createdAt.match(/[T ](\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    // Fallback to local time of the parsed Date object
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return "";
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}
