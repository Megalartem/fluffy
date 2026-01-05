export type SortOrder = "desc" | "asc" | "default";

export function cycleSort(order: SortOrder): SortOrder {
  if (order === "desc") return "asc";
  if (order === "asc") return "default";
  return "desc";
}

export function sortByKey<T>(items: T[], key: keyof T, order: SortOrder): T[] {
  if (order === "default") return items;
  const dir = order === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = a[key] as unknown as number | string | Date;
    const vb = b[key] as unknown as number | string | Date;
    // Normalize values
    const na = va instanceof Date ? va.getTime() : (typeof va === "string" ? va : String(va));
    const nb = vb instanceof Date ? vb.getTime() : (typeof vb === "string" ? vb : String(vb));
    if (typeof na === "string" && typeof nb === "string") return (na as string).localeCompare(nb as string) * dir;
    const aNum = Number(na);
    const bNum = Number(nb);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return (aNum - bNum) * dir;
    return 0;
  });
}
