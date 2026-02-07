

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