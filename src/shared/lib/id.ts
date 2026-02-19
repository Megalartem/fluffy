/**
 * Generate a unique ID with a prefix
 * 
 * Uses crypto.randomUUID() when available (browser/Node 19+),
 * falls back to timestamp + random for compatibility
 * 
 * @param prefix - Prefix for the ID (e.g., "tx", "cat", "bdg")
 * @returns ID in format: `{prefix}_{uuid}`
 * 
 * @example
 * makeId("tx") // "tx_550e8400-e29b-41d4-a716-446655440000"
 * makeId("cat") // "cat_1709654321_a7b3c9d2e5f8"
 */
export function makeId(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${uuid}`;
}
