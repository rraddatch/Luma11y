// =============================================================================
// colors/hsv.ts - Format HSV ("hsv(h, s%, v%)")
// colors/hsv.ts - HSV format ("hsv(h, s%, v%)")
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';
import { ALPHA_TAIL, alphaArgs } from './alpha';

// Accepte "hsv(h, s%, v%)" et l'alias "hsva(...)" (le signe % est optionnel),
// avec un alpha optionnel
// Accepts "hsv(h, s%, v%)" and the "hsva(...)" alias (the % sign is optional),
// with an optional alpha
const HSV_RE = new RegExp(
  `^hsva?\\(\\s*(\\d{1,3})\\s*[,\\s]\\s*(\\d{1,3})%?\\s*[,\\s]\\s*(\\d{1,3})%?${ALPHA_TAIL}\\s*\\)$`,
  'i',
);

// Teinte 0-360, saturation et valeur 0-100.
// Hue 0-360, saturation and value 0-100.
const inHue = (n: number) => n >= 0 && n <= 360;
const inPercent = (n: number) => n >= 0 && n <= 100;

// HSV [h:0-360, s:0-100, v:0-100] → chaîne CSS via hsl(), car CSS n'a pas de
// fonction hsv(). Retourne la couleur en valeur css.
//
// HSV [h:0-360, s:0-100, v:0-100] → CSS string via hsl(), since CSS has no hsv()
// function. Return color in css value
export function hsvToCss(v: number[]): string {
  const s = v[1] / 100;
  const value = v[2] / 100;
  const l = value * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (value - l) / Math.min(l, 1 - l);
  return `hsl(${v[0]}, ${Math.round(sl * 100)}%, ${Math.round(l * 100)}%)`;
}

// Extrait et valide h, s, v
//
// Extracts and validates h, s, v
export const hsvFormat: ColorFormat = {
  id: 'hsv',

  parse(input: string): ColorCommit | null {
    const match = input.trim().match(HSV_RE);
    if (!match) return null;

    const h = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    const v = parseInt(match[3], 10);

    // Rejette toute composante hors intervalle (teinte 0-360, s/v 0-100).
    // Reject any component out of range (hue 0-360, s/v 0-100).
    if (!inHue(h) || !inPercent(s) || !inPercent(v)) return null;

    // Alpha optionnel (virgule ou slash)
    // Optional alpha (comma or slash)
    const alpha = alphaArgs(match[4]);
    if (alpha === null) return null;

    return { command: 'update_store_hsv', args: { h, s, v, ...alpha } };
  },
};
