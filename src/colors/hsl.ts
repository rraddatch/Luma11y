// =============================================================================
// colors/hsl.ts - Format HSL ("hsl(h, s%, l%)")
// colors/hsl.ts - HSL format ("hsl(h, s%, l%)")
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';

// Accepte la notation "hsl(h, s%, l%)" (le signe % est optionnel).
// Accepts the "hsl(h, s%, l%)" notation (the % sign is optional).
const HSL_RE =
  /^hsl\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%?\s*[,\s]\s*(\d{1,3})%?\s*\)$/i;

// Teinte 0-360, saturation et luminosité 0-100.
// Hue 0-360, saturation and lightness 0-100.
const inHue = (n: number) => n >= 0 && n <= 360;
const inPercent = (n: number) => n >= 0 && n <= 100;

// HSL [h, s, l] → chaîne CSS hsl(). Retourne la couleur en valeur css
// HSL [h, s, l] → CSS hsl() string. Return color in css value
export function hslToCss(v: number[]): string {
  return `hsl(${v[0]}, ${v[1]}%, ${v[2]}%)`;
}

// Extrait et valide h, s, l
// Extracts and validates h, s, l
export const hslFormat: ColorFormat = {
  id: 'hsl',

  parse(input: string): ColorCommit | null {
    const match = input.trim().match(HSL_RE);
    if (!match) return null;

    const h = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    const l = parseInt(match[3], 10);

    // Rejette toute composante hors intervalle (teinte 0-360, s/l 0-100).
    // Reject any component out of range (hue 0-360, s/l 0-100).
    if (!inHue(h) || !inPercent(s) || !inPercent(l)) return null;

    return { command: 'update_store_hsl', args: { h, s, l } };
  },
};
