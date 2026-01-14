export type CurrencyCode = "USD" | "EUR" | "RUB" | "VND" | string;

export const CURRENCY_DECIMALS: Record<string, number> = {
  VND: 0,
  JPY: 0,
  KRW: 0,

  USD: 2,
  EUR: 2,
  RUB: 2,
  GBP: 2,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  CNY: 2,
  HKD: 2,
  SGD: 2,
  THB: 2,
  IDR: 2,
};

export function currencyDecimals(code: CurrencyCode): number {
  return CURRENCY_DECIMALS[String(code).toUpperCase()] ?? 2;
}

/**
 * Convert amount string (major units) -> integer minor units
 * Examples (decimals=2):
 *  "12.34" -> 1234
 *  "12,34" -> 1234
 *  "1 234.5" -> 123450
 * Examples (decimals=0):
 *  "12000" -> 12000
 */
export function toMinor(amount: string, decimals = 2): number | null {
  if (amount == null) return null;

  // Normalize: trim, remove spaces, comma -> dot
  const normalized = amount.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;

  // Only digits with optional one dot part
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const [intPart, fracRaw = ""] = normalized.split(".");

  // Guard: int part must be digits (regex already does it, but keep explicit)
  if (!/^\d+$/.test(intPart)) return null;

  if (decimals === 0) {
    const n = Number(intPart);
    return Number.isFinite(n) ? n : null;
  }

  const fracDigits = fracRaw.replace(/[^\d]/g, "");
  const frac = fracDigits.slice(0, decimals).padEnd(decimals, "0");

  const minorStr = intPart + frac;
  const minor = Number(minorStr);

  return Number.isFinite(minor) ? minor : null;
}

/**
 * Convert integer minor units -> amount string in major units.
 * Keeps a stable string form, avoids floating point issues.
 */
export function fromMinor(amountMinor: number, decimals = 2): string {
  if (!Number.isFinite(amountMinor)) return (0).toFixed(decimals);

  const sign = amountMinor < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(amountMinor));

  if (decimals === 0) return sign + String(abs);

  const base = 10 ** decimals;
  const intPart = Math.floor(abs / base);
  const fracPart = String(abs % base).padStart(decimals, "0");

  return `${sign}${intPart}.${fracPart}`;
}

/**
 * Convenience: parse major string -> minor using currency code.
 */
export function toMinorByCurrency(amount: string, currency: CurrencyCode): number | null {
  return toMinor(amount, currencyDecimals(currency));
}

/**
 * Convenience: minor -> major string using currency code.
 */
export function fromMinorByCurrency(amountMinor: number, currency: CurrencyCode): string {
  return fromMinor(amountMinor, currencyDecimals(currency));
}