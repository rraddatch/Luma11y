// =============================================================================
// colors/rgb.ts - Format RGB ("r, g, b" ou "rgb(r, g, b)")
// colors/rgb.ts - RGB format ("r, g, b" or "rgb(r, g, b)")
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';

// Accepte "r, g, b", "r g b" et "rgb(r, g, b)" (séparateurs : virgule ou espace).
// Accepts "r, g, b", "r g b" and "rgb(r, g, b)" (separators: comma or space).
const RGB_RE = /^(?:rgb\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/i;

// Une composante valide tient dans l'intervalle 0-255.
// A valid component lies within the 0-255 range.
const inRange = (n: number) => n >= 0 && n <= 255;

// RGB: aucune conversion, on passe par le chemin RGB direct (update_store_rgb).
//
// RGB: no conversion, it goes through the direct RGB path (update_store_rgb).
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

    return { command: 'update_store_rgb', args: { r, g, b } };
  },
};
