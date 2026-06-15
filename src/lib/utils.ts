import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date-only string (YYYY-MM-DD) as DD/MM/YYYY without timezone shifts.
 * Avoids `new Date(str)` which interprets bare ISO dates as UTC midnight and
 * can roll back a day in negative-offset locales (e.g. Brazil UTC-3).
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return "";
  const iso = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return String(dateStr);
}
