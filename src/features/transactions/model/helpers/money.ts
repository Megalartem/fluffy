export function toMinor(amount: string, decimals = 2): number | null {
  if (amount == null) return null;

  // "1 234,56" -> "1234.56"
  const normalized = amount.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;

  // допускаем только цифры и одну точку
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const [intPart, fracRaw = ""] = normalized.split(".");
  const frac = fracRaw.slice(0, decimals).padEnd(decimals, "0");

  const minorStr = intPart + (decimals > 0 ? frac : "");
  const minor = Number(minorStr);

  return Number.isFinite(minor) ? minor : null;
}

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