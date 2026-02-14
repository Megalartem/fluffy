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

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  RUB: "₽",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
  VND: "₫",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  HKD: "HK$",
  SGD: "S$",
  THB: "฿",
  IDR: "Rp",
}; 

export type AmountValidationOptions = {
  required?: boolean;
  allowNegative?: boolean;
  maxDecimals?: number;        // если не задано — берём decimals
  minMinor?: number;           // минимальная сумма в minor
  maxMinor?: number;           // лимит в minor
  allowZero?: boolean;         // можно ли 0
  soft?: boolean;              // "мягкая" проверка (для onChange)
};

/** Убираем пробелы, NBSP, приводим запятую к точке. Не форматируем. */
export function normalizeAmountInput(raw: string): string {
  if (raw == null) return "";
  return String(raw)
    .trim()
    .replace(/[\s\u00A0]/g, "") // обычные пробелы + NBSP
    .replace(",", ".");
}

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
export function toMinor(
  amount: string,
  decimals = 2,
  opts?: { allowNegative?: boolean; strictDecimals?: boolean }
): number | null {
  if (amount == null) return null;
  const { allowNegative = false, strictDecimals = false } = opts ?? {};

  const normalized = normalizeAmountInput(amount);
  if (!normalized) return null;

  // Разрешаем минус только в начале
  const signRe = allowNegative ? "-?" : "";
  const re = new RegExp(`^${signRe}\\d+(?:\\.\\d+)?$`);
  if (!re.test(normalized)) return null;

  const neg = normalized.startsWith("-");
  const unsigned = neg ? normalized.slice(1) : normalized;

  const [intPart, fracRaw = ""] = unsigned.split(".");

  if (!/^\d+$/.test(intPart)) return null;

  // decimals=0: дробная часть запрещена, если strictDecimals
  if (decimals === 0) {
    if (strictDecimals && fracRaw.length > 0) return null;
    const n = Number(intPart);
    if (!Number.isFinite(n)) return null;
    return neg ? -n : n;
  }

  // Если strictDecimals — запрещаем больше знаков, чем decimals
  if (strictDecimals && fracRaw.length > decimals) return null;

  const fracDigits = fracRaw.replace(/[^\d]/g, "");
  const frac = fracDigits.slice(0, decimals).padEnd(decimals, "0");

  const minorStr = intPart + frac;

  // простая защита от сверхдлинных чисел
  if (minorStr.length > 18) return null;

  const minor = Number(minorStr);
  if (!Number.isFinite(minor)) return null;

  return neg ? -minor : minor;
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

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[String(currency).toUpperCase()] ?? "";
}

export function getCurrencyDecimals(currency: CurrencyCode): number {
  return CURRENCY_DECIMALS[String(currency).toUpperCase()] ?? 2;
}

/**
 * Format amount with thousands separators and smart abbreviation for large numbers.
 * Examples:
 *  1234.56 USD -> "$ 1,234.56"
 *  2500000 VND -> "₫ 2.5M"
 *  150000 VND -> "₫ 150K"
 *  999 VND -> "₫ 999"
 */
export function shownAmount(amountMinor: number, currency: CurrencyCode): string {
  const decimals = getCurrencyDecimals(currency);
  const symbol = getCurrencySymbol(currency);
  const amount = fromMinor(amountMinor, decimals);
  
  const numValue = parseFloat(amount);
  const absValue = Math.abs(numValue);
  const sign = numValue < 0 ? "-" : "";
  
  // Для очень больших сумм (≥ 1,000,000) используем сокращения
  if (absValue >= 10_000_000) {
    const millions = absValue / 1_000_000;
    // Показываем 2 знака после запятой для миллионов
    const formatted = millions.toFixed(2).replace(/\.0$/, "");
    return `${symbol} ${sign}${formatted}M`;
  }
  
  // Для остальных сумм добавляем разделители тысяч
  const parts = amount.split(".");
  const intPart = parts[0].replace(/^-/, ""); // убираем минус временно
  const fracPart = parts[1];
  
  // Добавляем пробелы как разделители тысяч
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  const formattedInt = sign + withSeparators;
  const formatted = fracPart !== undefined ? `${formattedInt}.${fracPart}` : formattedInt;
  
  return `${symbol} ${formatted}`;
}

export function validateAmountString(
  valueRaw: string,
  decimals: number,
  options: AmountValidationOptions = {}
): true | string {
  const {
    required = true,
    allowNegative = false,
    maxDecimals,
    minMinor,
    maxMinor,
    allowZero = true,
    soft = false,
  } = options;

  const v = normalizeAmountInput(valueRaw);

  if (!v) return required ? "Введите сумму" : true;

  // soft: разрешаем промежуточные состояния при вводе
  // например "-", "0.", "12." (без цифр после точки)
  if (soft) {
    const signRe = allowNegative ? "-?" : "";
    const softRe = new RegExp(`^${signRe}(\\d+)?(\\.\\d*)?$`);
    if (!softRe.test(v)) return "Некорректный формат";
    // Не проверяем лимиты/zero здесь — это сделаем на blur/submit
    return true;
  }

  const d = maxDecimals ?? decimals;

  // строгий формат: цифры, опционально дробь до d
  const signRe = allowNegative ? "-?" : "";
  const strictRe = new RegExp(`^${signRe}\\d+(?:\\.\\d{0,${d}})?$`);
  if (!strictRe.test(v)) return "Некорректный формат суммы";

  const minor = toMinor(v, decimals, { allowNegative, strictDecimals: true });
  if (minor == null) return "Некорректная сумма";

  if (!allowZero && minor === 0) return "Сумма должна быть больше 0";
  if (minMinor !== undefined && minor < minMinor) return "Сумма меньше допустимой";
  if (maxMinor !== undefined && minor > maxMinor) return "Сумма превышает лимит";

  return true;
}

export function validateAmountStringByCurrency(
  valueRaw: string,
  currency: CurrencyCode,
  options: AmountValidationOptions = {}
): true | string {
  const decimals = currencyDecimals(currency);
  return validateAmountString(valueRaw, decimals, { ...options, maxDecimals: options.maxDecimals ?? decimals });
}