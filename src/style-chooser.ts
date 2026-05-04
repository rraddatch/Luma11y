// =============================================================================
// style-chooser.ts - Point d'entrée de la fenêtre de choix de style
// style-chooser.ts - Style chooser window entry point
//
// Affichée au premier lancement si aucun style n'a été choisi.
// Shown on first launch if no style has been chosen yet.
// =============================================================================

import { getCurrentWindow } from "@tauri-apps/api/window";
import { emit } from "@tauri-apps/api/event";
import Alpine from 'alpinejs';
import { locale as getSystemLocale } from '@tauri-apps/plugin-os';
import { initLocale, t as i18nT } from './i18n';
import { initTheme } from './theme';

// =============================================================================
// STORE ALPINE
// =============================================================================

Alpine.store('chooser', {
  locale: 'en',

  // Traduction réactive / Reactive translation
  t(key: string): string {
    void (this as any).locale;
    return i18nT(key);
  },

  // Sélectionne un style, sauvegarde et ferme la fenêtre
  // Select a style, save and close the window
  async choose(style: 'modern' | 'classic'): Promise<void> {
    localStorage.setItem('luma11y-style-theme', style);
    await emit('style-chosen', style);
    getCurrentWindow().close();
  },
});

// =============================================================================
// INITIALISATION
// =============================================================================

Alpine.start();
initTheme();

(async () => {
  // Détecte la locale système / Detect system locale
  let systemLocale: string | undefined;
  try {
    systemLocale = (await getSystemLocale()) ?? undefined;
  } catch {}

  const detectedLocale = initLocale(systemLocale);
  const store = Alpine.store('chooser') as any;
  store.locale = detectedLocale;
})();
