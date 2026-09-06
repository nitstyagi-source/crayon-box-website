/**
 * Universal Data Formatters
 * Crayon Box School Web ERP
 *
 * Implements Pillar 4 of the Enterprise Dynamic Architecture.
 * Standardizes localized currency (₹ INR), date formats, and sensitive data masking.
 */

/**
 * Formats an amount into Indian Rupees (INR) currency representation.
 */
export function formatINR(amount: number | string, includeSymbol: boolean = true): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);

  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Formats a date into human-readable Indian standard format (DD MMM YYYY).
 */
export function formatDisplayDate(dateInput: string | Date | null | undefined, includeTime: boolean = false): string {
  if (!dateInput) return "—";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "—";

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  };

  return new Intl.DateTimeFormat("en-IN", options).format(d);
}

/**
 * Masks a 10-digit mobile number for privacy (e.g. +91 98*** **044).
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length < 8) return phone;
  const start = cleaned.slice(0, 5);
  const end = cleaned.slice(-3);
  return `${start}*****${end}`;
}
