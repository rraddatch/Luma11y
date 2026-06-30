// =============================================================================
// colors/lab.ts - Format CIE L*a*b* ("lab(l, a, b)")
// colors/lab.ts - CIE L*a*b* format ("lab(l, a, b)")
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';

// Accepte "lab(l, a, b)". L* tient dans 0-100 ; a* et b* peuvent être négatifs.
// Accepts "lab(l, a, b)". L* lies in 0-100; a* and b* may be negative.
const LAB_RE =
  /^lab\(\s*(\d{1,3})\s*[,\s]\s*(-?\d{1,3})\s*[,\s]\s*(-?\d{1,3})\s*\)$/i;

// L* tient dans 0-100 ; a* et b* dans environ -128..128 (gamut sRGB).
// L* lies in 0-100; a* and b* in roughly -128..128 (sRGB gamut).
const inL = (n: number) => n >= 0 && n <= 100;
const inAB = (n: number) => n >= -128 && n <= 128;

// Lab [l, a, b] → chaîne CSS lab(). Utilisé pour les dégradés des sliders.
// (Syntaxe CSS Color 4 : composantes séparées par des espaces.)
// Lab [l, a, b] → CSS lab() string. Used for the slider gradients.
// (CSS Color 4 syntax: space-separated components.)
export function labToCss(v: number[]): string {
  return `lab(${v[0]} ${v[1]} ${v[2]})`;
}

// Le frontend extrait et valide l, a, b
//
// The frontend extracts and validates l, a, b
export const labFormat: ColorFormat = {
  id: 'lab',

  parse(input: string): ColorCommit | null {
    const match = input.trim().match(LAB_RE);
    if (!match) return null;

    const l = parseInt(match[1], 10);
    const a = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    // Rejette toute composante hors intervalle (L 0-100, a/b -128..128).
    // Reject any component out of range (L 0-100, a/b -128..128).
    if (!inL(l) || !inAB(a) || !inAB(b)) return null;

    return { command: 'update_store_lab', args: { l, a, b } };
  },
};
