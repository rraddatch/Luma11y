// =============================================================================
// store.ts - Configuration du store Alpine.js
// store.ts - Alpine.js store configuration
// =============================================================================

// Import de la fonction invoke pour appeler les commandes Tauri
// Import invoke function to call Tauri commands
import { invoke } from "@tauri-apps/api/core";

// Import du module i18n
// Import i18n module
import { t as i18nT, setLocale } from './i18n';

// Import du parseur de couleur et du registre des formats
// Import the color parser and the format registry
import { parseColor, colorFormats } from './colors';

// Format de couleur et sa valeur
// Color format and its value
export interface ColorFormatValue {
  // Identifiant du format (hex, rgb, hsl, ...), sert de valeur au radio
  // Format identifier (hex, rgb, hsl, ...), used as the radio value
  id: string;

  label: string;
  value: string;
}

// Construit la map id -> valeur affichée. `rgb` arrive sous forme "r, g, b"
// (représentation interne) et est présenté en "rgb(r, g, b)" pour l'affichage.
// Builds the id -> displayed value map. `rgb` comes in as "r, g, b" (internal
// representation) and is presented as "rgb(r, g, b)" for display.
function colorValues(hex: string, rgb: string, hsl: string): Record<string, string> {
  return { hex, rgb: `rgb(${rgb})`, hsl };
}

// Interface pour le store Tauri (état global côté backend)
// Interface for Tauri store (global state on backend side)
export interface BackendStore {
  // Platform
  platform: string;

  // Couleur de premier plan au format RGB [r, g, b]
  // Foreground color in RGB format [r, g, b]
  foreground_rgb: [number, number, number];

  // Couleur de premier plan au format Hexa
  // Foreground color in Hexa format
  foreground_hex: string;

  // Couleur de premier plan au format HSL "hsl(h, s%, l%)"
  // Foreground color in HSL format "hsl(h, s%, l%)"
  foreground_hsl: string;

  /// Si la couleur est sombre
  /// If the colour is dark
  foreground_is_dark: boolean;

  // Couleur d'arrière-plan au format RGB [r, g, b]
  // Background color in RGB format [r, g, b]
  background_rgb: [number, number, number];

  // Couleur d'arrière-plan au format Hexa
  // Background color in Hexa format
  background_hex: string;

  // Couleur d'arrière-plan au format HSL "hsl(h, s%, l%)"
  // Background color in HSL format "hsl(h, s%, l%)"
  background_hsl: string;

  /// Si la couleur est sombre
  /// If the colour is dark
  background_is_dark: boolean;

  // Contrast Ratio (Arrondi)
  // Contrast Ratio (Rounded)
  contrast_ratio_rounded: number;

  // Ratio de contraste entre l'arrière-plan et le blanc / noir
  // Contrast ratio between background and white / black
  background_contrast_with_white: number;
  background_contrast_with_black: number;

  // Indique si le mode continu est activé
  // Indicates if continue mode is enabled
  continue_mode: boolean;
}

// Interface pour le store Alpine.js du color picker (état local côté frontend)
// Interface for Alpine.js color picker store (local state on frontend side)
export interface UIStore {
  // Platform
  platform: string;

  // Locale courante / Current locale
  locale: string;

  // Traduction / Translation
  t(key: string, ...args: (string | number)[]): string;

  // Changement de locale / Switch locale
  switchLocale(locale: string): void;

  // Indique si une sélection de couleur est en cours
  // Indicates if a color selection is in progress
  isPicking: boolean;

  // Couleur de premier plan au format RGB "r, g, b" pour affichage
  // Foreground color in RGB format "r, g, b" for display
  foregroundRgb: string;

  // Couleur de premier plan au format hexadécimal
  // Foreground color in hexadecimal format
  foregroundHex: string;

  // Couleur de premier plan au format HSL "hsl(h, s%, l%)"
  // Foreground color in HSL format "hsl(h, s%, l%)"
  foregroundHsl: string;

  // Nom CSS de la couleur de premier plan (vide si pas de correspondance exacte)
  // CSS name of foreground color (empty if no exact match)
  foregroundName: string;

  /// Si la couleur est sombre
  /// If the colour is dark
  foregroundIsDark: boolean;

  // Couleur d'arrière-plan au format RGB "r, g, b" pour affichage
  // Background color in RGB format "r, g, b" for display
  backgroundRgb: string;

  // Couleur d'arrière-plan au format hexadécimal
  // Background color in hexadecimal format
  backgroundHex: string;

  // Couleur d'arrière-plan au format HSL "hsl(h, s%, l%)"
  // Background color in HSL format "hsl(h, s%, l%)"
  backgroundHsl: string;

  // Nom CSS de la couleur d'arrière-plan (vide si pas de correspondance exacte)
  // CSS name of background color (empty if no exact match)
  backgroundName: string;

  /// Si la couleur est sombre
  /// If the colour is dark
  backgroundIsDark: boolean;

  // Contrast Ratio Rounded
  contrastRatio: string;

  // Ratios de contraste arrière-plan vs blanc et vs noir
  // Background contrast ratios vs white and vs black
  backgroundContrastWithWhite: number;
  backgroundContrastWithBlack: number;

  // Thème courant ('light' | 'dark'), mis à jour par theme.ts
  // Current theme, kept in sync from theme.ts
  currentTheme: 'light' | 'dark';

  // Contraste arrière-plan vs la couleur de fond entourante de l'app
  // (white en theme clair, black en theme sombre)
  // Background contrast vs the app's surrounding background color
  // (white in light theme, black in dark theme)
  backgroundContrastWithSurrounding: number;

  // Liste des formats disponibles et leurs valeurs, pour chaque couleur
  // List of available formats and their values, for each color
  foregroundFormats: ColorFormatValue[];
  backgroundFormats: ColorFormatValue[];

  // Format sélectionné (id) pour l'affichage dans le color preview de chaque couleur
  // Selected format (id) for display in each color's preview
  foregroundFormat: string;
  backgroundFormat: string;

  // Valeur à afficher dans le color preview, selon le format sélectionné
  // Value to show in the color preview, depending on the selected format
  foregroundDisplayValue: string;
  backgroundDisplayValue: string;

  // Change le format affiché pour une couleur ('foreground' | 'background')
  // Changes the displayed format for a color ('foreground' | 'background')
  setColorFormat(key: 'foreground' | 'background', format: string): void;

  // Message d'erreur affiché si la saisie hex est invalide (vide sinon)
  // Error message shown when the typed hex is invalid (empty otherwise)
  foregroundHexError: string;
  backgroundHexError: string;

  // Profil ICC actuellement sélectionné
  // Currently selected ICC profile
  currentICCProfile: string;

  // Mode d'affichage des barres de progression ('levels' ou 'ratios')
  // Progress bar display mode ('levels' or 'ratios')
  progressLabels: 'levels' | 'ratios';

  // Basculer le mode d'affichage des barres de progression
  // Toggle progress bar display mode
  toggleProgressLabels(): void;

  // WCAG Levels
  level143Regular: boolean;
  level143Large: boolean;
  level146Regular: boolean;
  level146Large: boolean;
  level1411: boolean;

  // Méthode pour lancer le sélecteur de couleur
  // Method to launch the color picker
  pickColor(fg: boolean): Promise<void>;

  // Méthode pour intervertir les couleurs de premier plan et d'arrière-plan
  // Method to swap foreground and background colors
  switchColor(): Promise<void>;

  // Applique un changement de couleur émis par les sliders
  // Applies a color change emitted by the sliders
  applyColorChange(key: 'foreground' | 'background', detail: { command: string; args: Record<string, number> }): Promise<void>;

  // Méthode pour mettre à jour une couleur depuis une saisie texte libre
  // Update a color from a free-typed text input
  updateColorFromText(key: 'foreground' | 'background', text: string, live?: boolean): Promise<void>;

  // Méthode pour mettre à jour le store Alpine depuis le store Tauri
  // Method to update Alpine store from Tauri store
  updateFromTauriStore(store: BackendStore): void;
}

// =============================================================================
// CONFIGURATION DU STORE
// STORE CONFIGURATION
// =============================================================================

// Configuration du store Alpine.js exportée pour utilisation dans main.ts
// Alpine.js store configuration exported for use in main.ts
export const UIStore = {
  platform: 'unknown',

  // Locale courante (initialisée par main.ts)
  // Current locale (initialized by main.ts)
  locale: 'en',

  // Traduction : lit this.locale pour créer une dépendance réactive Alpine
  // Translation: reads this.locale to create an Alpine reactive dependency
  t(this: UIStore, key: string, ...args: (string | number)[]): string {
    // Lire this.locale crée une dépendance Alpine, ce qui force le re-render
    // Reading this.locale creates an Alpine dependency, forcing re-render
    void this.locale;
    return i18nT(key, ...args);
  },

  // Changement de locale depuis le frontend
  // Switch locale from the frontend
  switchLocale(_this: UIStore, locale: string): void {
    setLocale(locale);
  },

  // État initial : aucune sélection en cours
  // Initial state: no selection in progress
  isPicking: false,

  // État initial : RGB de premier plan vide
  // Initial state: empty foreground RGB
  foregroundRgb: '',

  // État initial : aucune couleur de premier plan
  // Initial state: no foreground color
  foregroundHex: '',

  // État initial : HSL de premier plan vide
  // Initial state: empty foreground HSL
  foregroundHsl: '',

  // Nom CSS de la couleur de premier plan
  // CSS name of foreground color
  foregroundName: '',

  /// Si la couleur est sombre
  /// If the colour is dark
  foregroundIsDark: true,

  // État initial : RGB d'arrière-plan vide
  // Initial state: empty background RGB
  backgroundRgb: '',

  // État initial : aucune couleur d'arrière-plan
  // Initial state: no background color
  backgroundHex: '',

  // État initial : HSL d'arrière-plan vide
  // Initial state: empty background HSL
  backgroundHsl: '',

  // Nom CSS de la couleur d'arrière-plan
  // CSS name of background color
  backgroundName: '',

  /// Si la couleur est sombre
  /// If the colour is dark
  backgroundIsDark: false,

  // Initial state: Contrast ratio
  contrastRatio: '0',

  // Ratios de contraste arrière-plan vs blanc / vs noir
  // Background contrast ratios vs white / vs black
  // (Fixes #9)
  backgroundContrastWithWhite: 1,
  backgroundContrastWithBlack: 1,

  // Thème courant (mis à jour par main.ts via onThemeChange)
  // Current theme (updated from main.ts via onThemeChange)
  currentTheme: 'light' as 'light' | 'dark',

  // Contraste contre le fond ambiant de l'app, suivant le thème
  // Background contrast against the app surrounding bg, depending on theme
  get backgroundContrastWithSurrounding(): number {
    const self = this as unknown as UIStore;
    return self.currentTheme === 'dark'
      ? self.backgroundContrastWithBlack
      : self.backgroundContrastWithWhite;
  },

  // Liste {label, valeur} des formats disponibles pour chaque couleur, dérivée
  // du registre colorFormats
  // List of {label, value} for the available formats of each color, derived from
  // the colorFormats registry
  get foregroundFormats(): ColorFormatValue[] {
    const self = this as unknown as UIStore;
    const values = colorValues(self.foregroundHex, self.foregroundRgb, self.foregroundHsl);
    return colorFormats.map((f) => ({ id: f.id, label: self.t(`color.${f.id}`), value: values[f.id] ?? '' }));
  },

  get backgroundFormats(): ColorFormatValue[] {
    const self = this as unknown as UIStore;
    const values = colorValues(self.backgroundHex, self.backgroundRgb, self.backgroundHsl);
    return colorFormats.map((f) => ({ id: f.id, label: self.t(`color.${f.id}`), value: values[f.id] ?? '' }));
  },

  // Valeur affichée dans le color preview, selon le format radio sélectionné.
  // Value shown in the color preview, depending on the selected format radio.
  get foregroundDisplayValue(): string {
    const self = this as unknown as UIStore;
    const values = colorValues(self.foregroundHex, self.foregroundRgb, self.foregroundHsl);
    return values[self.foregroundFormat] ?? self.foregroundHex;
  },

  get backgroundDisplayValue(): string {
    const self = this as unknown as UIStore;
    const values = colorValues(self.backgroundHex, self.backgroundRgb, self.backgroundHsl);
    return values[self.backgroundFormat] ?? self.backgroundHex;
  },

  // État initial : format affiché par défaut (hexadécimal)
  // Initial state: default displayed format (hexadecimal)
  foregroundFormat: 'hex',
  backgroundFormat: 'hex',

  // Change le format affiché pour une couleur
  // Changes the displayed format for a color
  setColorFormat(this: UIStore, key: 'foreground' | 'background', format: string) {
    if (key === 'foreground') this.foregroundFormat = format;
    else this.backgroundFormat = format;
  },

  // Messages d'erreur de saisie hex (vides quand la valeur est valide)
  // Hex input error messages (empty when the value is valid)
  foregroundHexError: '',
  backgroundHexError: '',

  // État initial : profil ICC par défaut (Auto)
  // Initial state: default ICC profile (Auto)
  currentICCProfile: 'Auto',

  // Mode d'affichage des barres de progression
  // Progress bar display mode
  progressLabels: (localStorage.getItem('luma11y-progress-labels') === 'ratios' ? 'ratios' : 'levels') as 'levels' | 'ratios',

  // Basculer le mode d'affichage
  // Toggle display mode
  toggleProgressLabels(this: UIStore) {
    this.progressLabels = this.progressLabels === 'levels' ? 'ratios' : 'levels';
    localStorage.setItem('luma11y-progress-labels', this.progressLabels);
  },

  // WCAG Levels
  level143Regular: true,
  level143Large: true,
  level146Regular: true,
  level146Large: true,
  level1411: true,

  // Méthode asynchrone pour lancer le sélecteur de couleur
  // Asynchronous method to launch the color picker
  async pickColor(this: UIStore, fg: boolean = true) {
    // Empêche l'ouverture de multiples eyedropper (via raccourcis) si l'un est déjà actif (Fixes #39)
    // Prevent opening a second eyedropper (via shortcuts) when one is already active (Fixes #39)
    if (this.isPicking) return;

    // Active l'indicateur de sélection en cours (désactive le bouton)
    // Enable picking indicator (disables button)
    this.isPicking = true;

    try {
      // Appelle la commande Tauri pick_color avec le paramètre fg (true = foreground, false = background)
      // L'appel met automatiquement à jour le store Tauri côté backend
      // et émet l'événement "store-updated" qui sera capturé par le listener ci-dessous
      // Calls Tauri pick_color command with fg parameter (true = foreground, false = background)
      // The call automatically updates Tauri store on backend side
      // and emits "store-updated" event which will be captured by the listener below
      await invoke('pick_color', { fg });
    } catch (error) {
      // Affiche l'erreur dans la console si la sélection échoue
      // Display error in console if selection fails
      console.error('Error:', error);
    } finally {
      // Désactive l'indicateur de sélection (réactive le bouton)
      // Disable picking indicator (re-enable button)
      this.isPicking = false;
    }
  },

  // Méthode pour intervertir les couleurs de premier plan et d'arrière-plan
  // Method to swap foreground and background colors
  async switchColor(this: UIStore) {
    // Sauvegarde les valeurs RGB actuelles du premier plan
    // Save current foreground RGB values
    const fgRgb = this.foregroundRgb;
    const bgRgb = this.backgroundRgb;

    // Parse les valeurs RGB depuis les chaînes "r, g, b"
    // Parse RGB values from "r, g, b" strings
    const [fr, fg, fb] = fgRgb.split(',').map(v => parseInt(v.trim()));
    const [br, bg, bb] = bgRgb.split(',').map(v => parseInt(v.trim()));

    try {
      // Met à jour le foreground avec les anciennes valeurs du background
      // Update foreground with old background values
      await invoke('update_store_rgb', { key: 'foreground', r: br, g: bg, b: bb });

      // Met à jour le background avec les anciennes valeurs du foreground
      // Update background with old foreground values
      await invoke('update_store_rgb', { key: 'background', r: fr, g: fg, b: fb });
    } catch (error) {
      console.error('Error switching colors:', error);
    }
  },

  // Applique un changement émis par les sliders.
  // Applies a change emitted by the sliders.
  async applyColorChange(this: UIStore, key: 'foreground' | 'background', detail: { command: string; args: Record<string, number> }) {
    try {
      await invoke(detail.command, { key, ...detail.args });
    } catch (error) {
      console.error('Error updating color:', error);
    }
  },

  // Met à jour une couleur depuis une saisie texte libre.
  // Essaie chaque format enregistré (hex, rgb, ...) via parseColor.
  // Renseigne le champ d'erreur correspondant si aucun format valide n'est trouvé.
  // Update a color from a free-typed text input.
  // Tries each registered format (hex, rgb, ...) via parseColor.
  // Sets the matching error field when no format recognizes the format.
  async updateColorFromText(this: UIStore, key: 'foreground' | 'background', text: string, live = false) {
    const errorKey = key === 'foreground' ? 'foregroundHexError' : 'backgroundHexError';

    // Saisie vide : pas une erreur.
    // Empty input: not an error.
    if (text.trim() === '') {
      if (!live) this[errorKey] = '';
      return;
    }

    // Délègue le parsing au registre des formats (cf. src/colors/index.ts).
    // Le format renvoie le chemin backend à invoquer pour l'application et la conversion.
    // Delegates parsing to the format registry (see src/colors/index.ts).
    // The format returns the backend path to invoke for commit and conversion.
    const commit = parseColor(text);
    if (!commit) {
      // On ignore les états intermédiaires invalides (ex. "255,"
      // pendant la saisie d'un rgb) ; l'erreur n'apparaît qu'à la validation.
      // We ignore invalid intermediate states (e.g. "255," while
      // typing an rgb); the error only shows on commit.
      if (!live) this[errorKey] = this.t('color.invalid_value');
      return;
    }

    this[errorKey] = '';
    try {
      await invoke(commit.command, { key, ...commit.args });
    } catch (error) {
      console.error('Error updating color from text:', error);
    }
  },

  // Méthode pour synchroniser le store Alpine avec le store Tauri
  // Method to synchronize Alpine store with Tauri store
  updateFromTauriStore(this: UIStore, store: BackendStore) {
    this.platform = store.platform;

    // Déstructure le tuple RGB de la couleur de premier plan
    // Destructure RGB tuple of foreground color
    const [fr, fg, fb] = store.foreground_rgb;

    // Stocke la version RGB pour l'affichage
    // Store RGB version for display
    this.foregroundRgb = `${fr}, ${fg}, ${fb}`;

    // Met à jour la couleur de premier plan (format hex)
    // Update foreground color (hex format)
    this.foregroundHex = store.foreground_hex;

    // Met à jour la couleur de premier plan (format HSL)
    // Update foreground color (HSL format)
    this.foregroundHsl = store.foreground_hsl;

    // Recherche le nom CSS exact / Look up exact CSS name
    invoke<string>('get_color_name', { r: fr, g: fg, b: fb }).then((name) => {
      this.foregroundName = name;
    });

    /// Si la couleur est sombre
    /// If the colour is dark
    this.foregroundIsDark = store.foreground_is_dark;

    // Déstructure le tuple RGB de la couleur d'arrière-plan
    // Destructure RGB tuple of background color
    const [br, bg, bb] = store.background_rgb;

    // Stocke la version RGB pour l'affichage
    // Store RGB version for display
    this.backgroundRgb = `${br}, ${bg}, ${bb}`;

    // Met à jour la couleur d'arrière-plan (format hex)
    // Update background color (hex format)
    this.backgroundHex = store.background_hex;

    // Met à jour la couleur d'arrière-plan (format HSL)
    // Update background color (HSL format)
    this.backgroundHsl = store.background_hsl;

    // Recherche le nom CSS exact / Look up exact CSS name
    invoke<string>('get_color_name', { r: br, g: bg, b: bb }).then((name) => {
      this.backgroundName = name;
    });

    /// Si la couleur est sombre
    /// If the colour is dark
    this.backgroundIsDark = store.background_is_dark;

    this.contrastRatio = `${store.contrast_ratio_rounded}`;
    this.backgroundContrastWithWhite = store.background_contrast_with_white;
    this.backgroundContrastWithBlack = store.background_contrast_with_black;

    // Niveaux WCAG depuis la valeur de ratio RAW
    // WCAG levels from the raw ratio value
    this.level143Regular = true;
    this.level143Large = true;
    this.level146Regular = true;
    this.level146Large = true;
    this.level1411 = true;

    if (store.contrast_ratio_rounded < 7) {
      this.level146Regular = false;
    }
    if (store.contrast_ratio_rounded < 4.5) {
      this.level143Regular = false;
      this.level146Large = false;
    }
    if (store.contrast_ratio_rounded < 3) {
      this.level143Large = false;
      this.level1411 = false;
    }
  }
};