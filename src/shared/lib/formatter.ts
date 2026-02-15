

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export function formatDate(dateKey: string): string {
  try {
    const date = new Date(dateKey);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: dateKey.startsWith(new Date().getFullYear().toString()) ? undefined : "numeric",
    }).format(date);
  } catch {
    return dateKey;
  }
}

/**
 * Returns a stable day key for grouping (local-first MVP).
 * Accepts either "YYYY-MM-DD" or an ISO datetime.
 */
export function toDateKey(value: string): string {
  if (!value) return "";

  // If already date-only
  if (value.length >= 10 && value[4] === "-" && value[7] === "-") {
    return value.slice(0, 10);
  }

  // Fallback: try to parse
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}