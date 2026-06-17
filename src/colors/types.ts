// =============================================================================
// colors/types.ts - Types partagés pour les formats de couleur
// colors/types.ts - Shared types for color formats
// =============================================================================

// Chaque format déclare la commande à appeler et les composantes extraites.

// Each format declares the command to call and the extracted components.
export interface ColorCommit {
  // Nom de la commande Tauri qui convertit puis met à jour le store.
  // Name of the Tauri command that converts then updates the store.
  command: string;

  // Composantes extraites, transmises telles quelles à la commande.
  // Extracted components, forwarded as-is to the command.
  args: Record<string, string | number>;
}

// Structure commune à tous les formats de couleur (hex, rgb, hsl, ...).
//
// Common structure for every color format (hex, rgb, hsl, ...).
export interface ColorFormat {
  // Identifiant unique. Sert aussi de clé i18n via `color.${id}`.
  // Unique identifier. Also used as the i18n key via `color.${id}`.
  id: string;

  // Reconnaît et valide une saisie, et renvoie le chemin backend (commande +
  // composantes) à invoquer, ou null si la saisie est invalide.
  //
  // Recognizes and validates an input, and returns the backend path (command +
  // components) to invoke, or null if the input is invalid.
  parse(input: string): ColorCommit | null;
}
