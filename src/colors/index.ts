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

import type { ColorFormat, ColorCommit } from './types';
import { hexFormat } from './hex';
import { rgbFormat } from './rgb';
import { hslFormat } from './hsl';
import { hsvFormat } from './hsv';

export type { ColorFormat, ColorCommit } from './types';
export { hexFormat } from './hex';
export { rgbFormat } from './rgb';
export { hslFormat } from './hsl';
export { hsvFormat } from './hsv';

// Tous les formats disponibles, dans leur ordre de priorité
// All registered formats, in their priority order
export const colorFormats: ColorFormat[] = [hexFormat, rgbFormat, hslFormat, hsvFormat];

// Récupère un format par son identifiant.
// Looks up a format by its identifier.
export function getColorFormat(id: string): ColorFormat | undefined {
  return colorFormats.find((format) => format.id === id);
}

// Tente de parser une saisie avec chaque format, dans l'ordre d'enregistrement.
// Retourne le chemin backend du premier format reconnu, ou null si aucun ne l'est.
//
// Tries to parse an input with each format, in registration order.
// Returns the backend path of the first recognized format, or null if none matches.
export function parseColor(input: string): ColorCommit | null {
  for (const format of colorFormats) {
    const commit = format.parse(input);
    if (commit) return commit;
  }
  return null;
}
