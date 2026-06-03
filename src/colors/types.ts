// =============================================================================
// colors/types.ts - Types partagés pour les formats de couleur
// colors/types.ts - Shared types for color formats
// =============================================================================

// Une couleur exprimée par ses trois composantes 0-255
// A color expressed by its three 0-255 components
export interface RGB {
  r: number;
  g: number;
  b: number;
}

// Structure commune à tous les formats de couleur (hex, rgb, ...).
//
// Common structure for every color format (hex, rgb, ...).
export interface ColorFormat {
  // Identifiant unique. Sert aussi de clé i18n via `color.${id}`.
  // Unique identifier. Also used as the i18n key via `color.${id}`.
  id: string;

  // Convertit une saisie utilisateur en RGB, ou null si elle est invalide.
  // Converts a user input into RGB, or null if it is invalid.
  parse(input: string): RGB | null;

  // Sérialise une couleur RGB dans ce format.
  // Serializes an RGB color into this format.
  format(rgb: RGB): string;
}
