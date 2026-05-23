// =============================================================================
// theme.ts - Gestion du thème light/dark/auto
// theme.ts - Light/dark/auto theme management
// =============================================================================

export type ThemePreference = 'auto' | 'light' | 'dark';
export type CurrentTheme = 'light' | 'dark';

const STORAGE_KEY = 'luma11y-theme';

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

type ThemeChangeCallback = (theme: CurrentTheme) => void;
const callbacks = new Set<ThemeChangeCallback>();

/** Retourne la préférence sauvegardée / Returns saved preference */
export function getThemePreference(): ThemePreference {
  return (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'auto';
}

/** Sauvegarde la préférence / Save preference */
export function setThemePreference(pref: ThemePreference): void {
  localStorage.setItem(STORAGE_KEY, pref);
  applyTheme(pref);
}

/** Retourne le thème courant à partir des préférences
 *  Returns the current theme from preferences */
function computeCurrentTheme(pref: ThemePreference): CurrentTheme {
  if (pref === 'auto') {
    return mediaQuery.matches ? 'dark' : 'light';
  }
  return pref;
}

/** Retourne le thème courant / Returns the current theme */
export function getCurrentTheme(): CurrentTheme {
  return computeCurrentTheme(getThemePreference());
}

/** S'abonne aux changements de thème courant / Subscribe to current theme changes */
export function onThemeChange(cb: ThemeChangeCallback): void {
  callbacks.add(cb);
}

/** Applique le thème sur le document / Apply theme to document */
export function applyTheme(pref?: ThemePreference): void {
  const current = computeCurrentTheme(pref ?? getThemePreference());
  document.documentElement.setAttribute('data-theme', current);
  for (const cb of callbacks) cb(current);
}

/** Initialise le thème et écoute les changements système / Init theme and listen for system changes */
export function initTheme(): void {
  applyTheme();
  mediaQuery.addEventListener('change', () => {
    if (getThemePreference() === 'auto') {
      applyTheme('auto');
    }
  });
}
