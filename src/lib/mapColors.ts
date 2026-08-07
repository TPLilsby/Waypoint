/**
 * Decorative, per-place fill colors - see docs/DESIGN.md. Used for
 * countries, US states, and any future map layer. These carry no meaning
 * (unlike the accent colors, which are reserved for status), so a fixed
 * muted palette assigned by a deterministic hash is enough: the same
 * place always gets the same color, without a hand-maintained mapping.
 *
 * Deliberately avoids the accent hues (terracotta, slate) so the visited/
 * want-to-visit indicators still stand out once they're layered on top.
 */
const PALETTE = [
  "#6C7BC4",
  "#4F9A8C",
  "#8C6FB0",
  "#B5854F",
  "#5E8F6B",
  "#B0637F",
  "#5B93AE",
  "#9C7A4E",
  "#6F6FA8",
  "#7FA35C",
  "#A8637A",
  "#4E8FA0",
  "#8A7148",
  "#6B8E6F",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorForPlace(key: string): string {
  return PALETTE[hashString(key) % PALETTE.length];
}
