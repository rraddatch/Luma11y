// =============================================================================
// colors/hex.ts - Format hexadécimal (#abc / #aabbcc)
// colors/hex.ts - Hexadecimal format (#abc / #aabbcc)
// =============================================================================

import type { ColorFormat, RGB } from './types';

// Notation courte (#abc) et notation longue (#aabbcc), le # est optionnel.
// Short notation (#abc) and long notation (#aabbcc), the # is optional.
const SHORT = /^[0-9a-fA-F]{3}$/;
const LONG = /^[0-9a-fA-F]{6}$/;

// Convertit une composante en deux chiffres hexadécimaux majuscules.
// Converts a component into two uppercase hexadecimal digits.
const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

export const hexFormat: ColorFormat = {
  id: 'hex',

  parse(input: string): RGB | null {
    const cleaned = input.replace(/^#/, '').trim();

    // Notation courte : chaque chiffre est doublé (#abc -> #aabbcc).
    // Short notation: each digit is doubled (#abc -> #aabbcc).
    if (SHORT.test(cleaned)) {
      return {
        r: parseInt(cleaned[0] + cleaned[0], 16),
        g: parseInt(cleaned[1] + cleaned[1], 16),
        b: parseInt(cleaned[2] + cleaned[2], 16),
      };
    }

    // Notation longue : deux chiffres par composante.
    // Long notation: two digits per component.
    if (LONG.test(cleaned)) {
      return {
        r: parseInt(cleaned.slice(0, 2), 16),
        g: parseInt(cleaned.slice(2, 4), 16),
        b: parseInt(cleaned.slice(4, 6), 16),
      };
    }

    return null;
  },

  format({ r, g, b }: RGB): string {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },
};
