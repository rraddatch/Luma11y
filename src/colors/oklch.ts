// =============================================================================
// colors/oklch.ts - Format OKLCH ("oklch(l c h)")
// colors/oklch.ts - OKLCH format ("oklch(l c h)")
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';

// Accepte "oklch(l c h)" (séparateurs espace ou virgule). Composantes décimales :
// L ∈ [0,1], C chroma (~0-0.4), H teinte en degrés.
// Accepts "oklch(l c h)" (space or comma separators). Decimal components:
// L ∈ [0,1], C chroma (~0-0.4), H hue in degrees.
const OKLCH_RE =
  /^oklch\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*\)$/i;

const inRange = (n: number, min: number, max: number) => n >= min && n <= max;

// OKLCH [l, c, h] → chaîne CSS oklch().
// OKLCH [l, c, h] → CSS oklch() string.
export function oklchToCss(v: number[]): string {
  return `oklch(${v[0]} ${v[1]} ${v[2]})`;
}

// Le frontend extrait et valide l, c, h
//
// The frontend extracts and validates l, c, h
export const oklchFormat: ColorFormat = {
  id: 'oklch',

  parse(input: string): ColorCommit | null {
    const match = input.trim().match(OKLCH_RE);
    if (!match) return null;

    const l = parseFloat(match[1]);
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);

    // Rejette toute composante hors intervalle (L 0-1, C 0-0.5, H 0-360).
    // Reject any component out of range (L 0-1, C 0-0.5, H 0-360).
    if (!inRange(l, 0, 1) || !inRange(c, 0, 0.5) || !inRange(h, 0, 360)) return null;

    return { command: 'update_store_oklch', args: { l, c, h } };
  },
};
