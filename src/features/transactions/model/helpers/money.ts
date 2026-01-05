

export function toMinor(amount: string, decimals = 2): number | null {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * Math.pow(10, decimals));
}
export function fromMinor(amountMinor: number, decimals = 2): string {
  return (amountMinor / Math.pow(10, decimals)).toFixed(decimals);
}