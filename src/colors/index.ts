// =============================================================================
// colors/index.ts - Registre des formats de couleur
// colors/index.ts - Color format registry
//
// Point d'entrée unique du module. Pour ajouter un nouveau format :
//   1. créez un fichier dédié (ex. colors/hsl.ts) exportant un ColorFormat,
//   2. ajoutez-le au tableau colorFormats ci-dessous.
//
// Single entry point of the module. To add a new format:
//   1. create a dedicated file (e.g. colors/hsl.ts) exporting a ColorFormat,
//   2. add it to the colorFormats array below.
// =============================================================================

import type { ColorFormat, RGB } from './types';
import { hexFormat } from './hex';
import { rgbFormat } from './rgb';

export type { ColorFormat, RGB } from './types';
export { hexFormat } from './hex';
export { rgbFormat } from './rgb';

// Tous les formats disponibles, dans leur ordre de priorité
// All registered formats, in their priority order
export const colorFormats: ColorFormat[] = [hexFormat, rgbFormat];

// Récupère un format par son identifiant.
// Looks up a format by its identifier.
export function getColorFormat(id: string): ColorFormat | undefined {
  return colorFormats.find((format) => format.id === id);
}

// Tente de parser une saisie avec chaque format, dans l'ordre d'enregistrement.
// Retourne la première valeur obtenue en RGB, ou null si aucun format n'est reconnu'.
//
// Tries to parse an input with each format, in registration order.
// Returns the first value detected in RGB, or null if no format has been found.
export function parseColor(input: string): RGB | null {
  for (const format of colorFormats) {
    const rgb = format.parse(input);
    if (rgb) return rgb;
  }
  return null;
}
