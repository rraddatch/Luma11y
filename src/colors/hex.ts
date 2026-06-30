// =============================================================================
// colors/hex.ts - Format hexadécimal (#abc / #aabbcc)
// colors/hex.ts - Hexadecimal format (#abc / #aabbcc)
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';

// Notation courte (#abc) et notation longue (#aabbcc), le # est optionnel.
// Short notation (#abc) and long notation (#aabbcc), the # is optional.
const SHORT = /^[0-9a-fA-F]{3}$/;
const LONG = /^[0-9a-fA-F]{6}$/;

// Le frontend valide la notation et transmet la chaîne hex
// The frontend validates the notation and forwards the hex string
export const hexFormat: ColorFormat = {
  id: 'hex',

  parse(input: string): ColorCommit | null {
    const cleaned = input.replace(/^#/, '').trim();

    if (SHORT.test(cleaned) || LONG.test(cleaned)) {
      return { command: 'update_store_hex', args: { hex: cleaned } };
    }

    return null;
  },
};
