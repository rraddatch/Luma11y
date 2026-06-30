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
import { labFormat } from './lab';
import { oklchFormat } from './oklch';

export type { ColorFormat, ColorCommit } from './types';
export { hexFormat } from './hex';
export { rgbFormat } from './rgb';
export { hslFormat } from './hsl';
export { hsvFormat } from './hsv';
export { labFormat } from './lab';
export { oklchFormat } from './oklch';

// Tous les formats disponibles, dans leur ordre de priorité
// All registered formats, in their priority order
export const colorFormats: ColorFormat[] = [hexFormat, rgbFormat, hslFormat, hsvFormat, labFormat, oklchFormat];

// Récupère un format par son identifiant.
// Looks up a format by its identifier.
export function getColorFormat(id: string): ColorFormat | undefined {
  return colorFormats.find((format) => format.id === id);
}

// =============================================================================
// Formats activés dans l'interface
// Enabled formats in the interface
//
// `hex` est toujours actif (non listé). Les autres sont activables par
// l'utilisateur (cf. Settings). Persisté en localStorage.
// `hex` is always on (not listed). The others can be toggled by the user
// (see Settings). Persisted in localStorage.
// =============================================================================

// Activés par défaut / Enabled by default
export const DEFAULT_ENABLED_FORMATS = ['rgb', 'lab', 'oklch'];

// Formats activables (tous sauf hex, toujours actif).
// Toggleable formats (all but hex, which is always on).
export const selectableFormats = colorFormats
  .map((format) => format.id)
  .filter((id) => id !== 'hex');

// Lit les formats activés depuis localStorage,
// ou la valeur par défaut si absent/invalide.
// Reads the enabled formats from localStorage,
// or the default value when missing/invalid.
export function loadEnabledFormats(): string[] {
  try {
    const raw = localStorage.getItem('luma11y-enabled-formats');
    if (raw) {
      const ids = JSON.parse(raw) as string[];
      return ids.filter((id) => selectableFormats.includes(id));
    }
  } catch {
    // fall back to the default.
  }
  return [...DEFAULT_ENABLED_FORMATS];
}

// Tente de parser une saisie avec chaque format, dans l'ordre d'enregistrement.
// Retourne le chemin backend du premier format reconnu, ou null si aucun ne l'est.
// On teste avec tous les formats, pas seulement ceux selectionnés
//
// Tries to parse an input with each format, in registration order.
// Returns the backend path of the first recognized format, or null if none matches.
// We parse all available formats, not only the available ones
export function parseColor(input: string): ColorCommit | null {
  for (const format of colorFormats) {
    const commit = format.parse(input);
    if (commit) return commit;
  }
  return null;
}
