// =============================================================================
// colors/hex.ts - Format hexadécimal (#abc / #abcd / #aabbcc / #aabbccdd)
// colors/hex.ts - Hexadecimal format (#abc / #abcd / #aabbcc / #aabbccdd)
// =============================================================================

import type { ColorFormat, ColorCommit } from './types';

// Notations 3/6 chiffres (sans alpha) et 4/8 chiffres (avec alpha), le # optionnel.
// L'alpha éventuel est porté par la chaîne hex elle-même (décodé côté Rust).
// 3/6-digit (no alpha) and 4/8-digit (with alpha) notations, the # is optional.
// Any alpha is carried by the hex string itself (decoded on the Rust side).
const HEX = /^[0-9a-fA-F]{3,4}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/;

// Le frontend valide la notation et transmet la chaîne hex
// The frontend validates the notation and forwards the hex string
export const hexFormat: ColorFormat = {
  id: 'hex',

  parse(input: string): ColorCommit | null {
    const cleaned = input.replace(/^#/, '').trim();

    if (HEX.test(cleaned)) {
      return { command: 'update_store_hex', args: { hex: cleaned } };
    }

    return null;
  },
};
