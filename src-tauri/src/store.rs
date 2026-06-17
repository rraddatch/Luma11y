// =============================================================================
// store.rs - Store management module
// =============================================================================

use tauri::{AppHandle, Emitter};
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use crate::config;
use crate::picker;
use crate::color;
use crate::color_names;

// =============================================================================
// STORE - État global partagé
// STORE - Shared global state
// =============================================================================

/// Structure du store - contient toutes les données réactives
/// Store structure - contains all reactive data
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ResultStore {
    /// Plateforme actuelle (macos, windows, linux)
    /// Current platform (macos, windows, linux)
    pub platform: &'static str,

    /// Couleur de premier plan au format RGB (r, g, b)
    /// Foreground color in RGB format (r, g, b)
    pub foreground_rgb: (u8, u8, u8),

    /// Couleur de premier plan au format hexadécimal
    /// Foreground color in hexadecimal format
    pub foreground_hex: String,

    /// Couleur de premier plan au format HSL "hsl(h, s%, l%)"
    /// Foreground color in HSL format "hsl(h, s%, l%)"
    pub foreground_hsl: String,

    /// Si la couleur est sombre
    /// If the colour is dark
    pub foreground_is_dark: bool,

    /// Couleur d'arrière-plan au format RGB (r, g, b)
    /// Background color in RGB format (r, g, b)
    pub background_rgb: (u8, u8, u8),

    /// Couleur d'arrière-plan au format hexadécimal
    /// Background color in hexadecimal format
    pub background_hex: String,

    /// Couleur d'arrière-plan au format HSL "hsl(h, s%, l%)"
    /// Background color in HSL format "hsl(h, s%, l%)"
    pub background_hsl: String,

    /// Si la couleur est sombre
    /// If the colour is dark
    pub background_is_dark: bool,

    /// Mode continue activé
    /// Continue mode enabled
    pub continue_mode: bool,

    // Contast Ratio value, not rounded
    // Valeur du Ratio de Contraste, non arrondi
    #[serde(skip)]
    pub contrast_ratio_raw: f64,

    // Contast Ratio value, rounded
    // Valeur du Ratio de Contraste, arrondi
    pub contrast_ratio_rounded: f64,

    /// Ratio de contraste entre l'arrière-plan et le blanc / noir.
    /// Contrast ratio between background and white / black.
    /// (Fixes #9)
    pub background_contrast_with_white: f64,
    pub background_contrast_with_black: f64,
}

impl Default for ResultStore {
    fn default() -> Self {
        let (fr, fg, fb) = config::DEFAULT_FOREGROUND_RGB;
        let (br, bg, bb) = config::DEFAULT_BACKGROUND_RGB;
        let contrast_ratio_raw = color::contrast_ratio((fr, fg, fb), (br, bg, bb));
        let contrast_ratio_rounded = color::floor_ratio(contrast_ratio_raw);
        let background_contrast_with_white = color::contrast_ratio((br, bg, bb), (255, 255, 255));
        let background_contrast_with_black = color::contrast_ratio((br, bg, bb), (0, 0, 0));
        Self {
            // Plateforme détectée à la compilation
            // Platform detected at compile time
            #[cfg(target_os = "macos")]
            platform: "macos",
            #[cfg(target_os = "windows")]
            platform: "windows",
            #[cfg(target_os = "linux")]
            platform: "linux",
            #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
            platform: "unknown",
            foreground_rgb: config::DEFAULT_FOREGROUND_RGB,
            foreground_hex: format!("#{:02X}{:02X}{:02X}", fr, fg, fb),
            foreground_hsl: color::rgb_to_hsl_string((fr, fg, fb)),
            foreground_is_dark: color::is_dark((fr, fg, fb)),
            background_rgb: config::DEFAULT_BACKGROUND_RGB,
            background_hex: format!("#{:02X}{:02X}{:02X}", br, bg, bb),
            background_hsl: color::rgb_to_hsl_string((br, bg, bb)),
            background_is_dark: color::is_dark((br, bg, bb)),
            continue_mode: false,
            contrast_ratio_raw,
            contrast_ratio_rounded,
            background_contrast_with_white,
            background_contrast_with_black,
        }
    }
}

/// Modèle de copie (template + raccourci)
/// Copy template (template + shortcut)
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CopyTemplate {
    #[serde(default)]
    pub name: String,
    pub template: String,
    pub shortcut: String,
}

/// État de l'application wrappé dans un Mutex pour thread-safety
/// Application state wrapped in Mutex for thread-safety
pub struct AppState {
    pub store: Mutex<ResultStore>,
    pub locale: Mutex<String>,
    pub templates: Mutex<Vec<CopyTemplate>>,
    pub appearance: Mutex<String>,
    pub style_theme: Mutex<String>,
    pub always_on_top: Mutex<bool>,
}

// =============================================================================
// COMMANDES TAURI
// TAURI COMMANDS
// =============================================================================

/// Récupère l'état actuel du store
/// Gets the current store state
#[tauri::command]
pub fn get_store(state: tauri::State<AppState>) -> ResultStore {
    // Verrouille le mutex et clone le contenu
    // Lock the mutex and clone the content
    state.store.lock().unwrap().clone()
}

/// Lance le color picker et met à jour le store automatiquement
/// Launches the color picker and automatically updates the store
#[tauri::command]
pub fn pick_color(app: AppHandle, state: tauri::State<AppState>, fg: bool) {
    // Lance le picker natif
    // Launch the native picker
    let result = picker::run(fg);

    // Met à jour le store avec les couleurs sélectionnées
    // Update the store with selected colors
    {
        // Verrouille le mutex
        // Lock the mutex
        let mut store = state.store.lock().unwrap();

        // Met à jour les couleurs à partir du résultat du picker
        // Update colors from picker result
        color::update_results_from_picker(&mut store, &result);

        // Met à jour le mode continue
        // Update continue mode
        store.continue_mode = result.continue_mode;

        // Émet l'événement "store-updated" avec le nouveau state
        // Emit "store-updated" event with the new state
        let _ = app.emit("store-updated", store.clone());
    }
}

/// Applique une couleur RGB à la clé donnée puis recalcule les dérivés
/// (hex, hsl, sombre, ratios de contraste). Retourne false si la clé est inconnue.
///
/// Applies an RGB color to the given key then recomputes the derived values
/// (hex, hsl, dark, contrast ratios). Returns false on an unknown key.
fn apply_color(store: &mut ResultStore, key: &str, rgb: (u8, u8, u8)) -> bool {
    let (r, g, b) = rgb;
    match key {
        "foreground" => {
            store.foreground_rgb = rgb;
            store.foreground_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
            store.foreground_hsl = color::rgb_to_hsl_string(rgb);
            store.foreground_is_dark = color::is_dark(rgb);
        }
        "background" => {
            store.background_rgb = rgb;
            store.background_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
            store.background_hsl = color::rgb_to_hsl_string(rgb);
            store.background_is_dark = color::is_dark(rgb);
        }
        _ => return false, // Clé inconnue / Unknown key
    }

    // Recalcule le ratio de contraste (brut + arrondi vers le bas)
    // Recalculate the contrast ratio (raw + floor-rounded)
    store.contrast_ratio_raw = color::contrast_ratio(store.foreground_rgb, store.background_rgb);
    store.contrast_ratio_rounded = color::floor_ratio(store.contrast_ratio_raw);

    // Recalcule les contrastes arrière-plan vs blanc / noir
    // Recalculate background-vs-white / black contrasts
    store.background_contrast_with_white = color::contrast_ratio(store.background_rgb, (255, 255, 255));
    store.background_contrast_with_black = color::contrast_ratio(store.background_rgb, (0, 0, 0));

    true
}

/// Met à jour une couleur depuis des composantes RGB (chemin RGB et inversion).
/// Updates a color from RGB components (RGB path and swap).
#[tauri::command]
pub fn update_store_rgb(app: AppHandle, state: tauri::State<AppState>, key: String, r: u8, g: u8, b: u8) {
    let mut store = state.store.lock().unwrap();
    if apply_color(&mut store, &key, (r, g, b)) {
        let _ = app.emit("store-updated", store.clone());
    }
}

/// Met à jour une couleur depuis des composantes HSL ; conversion via `palette`.
/// Updates a color from HSL components; conversion delegated to `palette`.
#[tauri::command]
pub fn update_store_hsl(app: AppHandle, state: tauri::State<AppState>, key: String, h: u16, s: u8, l: u8) {
    let rgb = color::hsl_to_rgb(h, s, l);
    let mut store = state.store.lock().unwrap();
    if apply_color(&mut store, &key, rgb) {
        let _ = app.emit("store-updated", store.clone());
    }
}

/// Met à jour une couleur depuis une saisie hexadécimale ; conversion côté Rust.
/// Updates a color from a hexadecimal input; conversion done on the Rust side.
#[tauri::command]
pub fn update_store_hex(app: AppHandle, state: tauri::State<AppState>, key: String, hex: String) {
    let Some(rgb) = color::hex_to_rgb(&hex) else { return };
    let mut store = state.store.lock().unwrap();
    if apply_color(&mut store, &key, rgb) {
        let _ = app.emit("store-updated", store.clone());
    }
}

/// Retourne le nom de couleur CSS exact pour une valeur RGB, ou vide
/// Returns the exact CSS color name for a given RGB value, or empty
#[tauri::command]
pub fn get_color_name(r: u8, g: u8, b: u8) -> String {
    color_names::exact_color_name(r, g, b)
        .unwrap_or("")
        .to_string()
}

/// Efface le store
/// Clears the store
#[tauri::command]
pub fn clear_store(app: AppHandle, state: tauri::State<AppState>) {
    {
        let mut store = state.store.lock().unwrap();
        *store = ResultStore::default();
        let _ = app.emit("store-updated", store.clone());
    }
}
