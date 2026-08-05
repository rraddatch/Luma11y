// =============================================================================
// colors/rgb.ts - Format RGB ("r, g, b" ou "rgb(r, g, b)")
// colors/rgb.ts - RGB format ("r, g, b" or "rgb(r, g, b)")
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';
import { ALPHA_TAIL, alphaArgs } from './alpha';

// Accepte "r, g, b", "r g b", "rgb(r, g, b)" et "rgba(r, g, b, a)", avec un alpha optionnel
// Accepts "r, g, b", "r g b", "rgb(r, g, b)" and "rgba(r, g, b, a)", with an optional alpha
const RGB_RE = new RegExp(
  `^(?:rgba?\\(\\s*)?(\\d{1,3})\\s*[,\\s]\\s*(\\d{1,3})\\s*[,\\s]\\s*(\\d{1,3})${ALPHA_TAIL}\\s*\\)?$`,
  'i',
);

// Une composante valide tient dans l'intervalle 0-255.
// A valid component lies within the 0-255 range.
const inRange = (n: number) => n >= 0 && n <= 255;

// RGB [r, g, b] → chaîne CSS rgb(). Retourne la couleur en valeur css
// RGB [r, g, b] → CSS rgb() string. Return color in css value
export function rgbToCss(v: number[]): string {
  return `rgb(${v[0]}, ${v[1]}, ${v[2]})`;
}

// RGB: aucune conversion, on passe par le chemin RGB direct
// RGB: no conversion, it goes through the direct RGB path
export const rgbFormat: ColorFormat = {
  id: 'rgb',

  parse(input: string): ColorCommit | null {
    const match = input.trim().match(RGB_RE);
    if (!match) return null;

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    // Rejette toute composante hors de l'intervalle 0-255.
    // Reject any component outside the 0-255 range.
    if (!inRange(r) || !inRange(g) || !inRange(b)) return null;

    // Alpha optionnel (virgule ou slash)
    // Optional alpha (comma or slash)
    const alpha = alphaArgs(match[4]);
    if (alpha === null) return null;

    return { command: 'update_store_rgb', args: { r, g, b, ...alpha } };
  },
};
