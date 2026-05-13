// =============================================================================
// color.rs - Color manipulation and store update functions
// =============================================================================

use bigcolor::BigColor;
use crate::store::ResultStore;
use crate::picker::common::ColorPickerResult;
use crate::config;

/// Considère une couleur comme sombre si son contraste avec le noir est < 4.5
/// A color is considered dark when its contrast against black is < 4.5
pub fn is_dark(color: &BigColor) -> bool {
    let black = BigColor::from_rgb(0, 0, 0, 1.0);
    color.get_contrast_ratio(&black) < 4.5
}

/// Met à jour les résultats du store à partir du résultat du picker
/// Updates the store results from picker result
///
/// # Arguments
/// * `store` - Le store à mettre à jour / The store to update
/// * `result` - Le résultat du color picker / The color picker result
pub fn update_results_from_picker(store: &mut ResultStore, result: &ColorPickerResult) {
    // Met à jour foreground si sélectionné
    // Update foreground if selected
    if let Some((r, g, b)) = result.foreground {
        store.foreground_rgb = (r, g, b);
        store.foreground_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
        store.foreground = BigColor::from_rgb(r, g, b, 1.0);
        store.foreground_is_dark = is_dark(&store.foreground);
    }

    // Met à jour background si sélectionné
    // Update background if selected
    if let Some((r, g, b)) = result.background {
        store.background_rgb = (r, g, b);
        store.background_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
        store.background = BigColor::from_rgb(r, g, b, 1.0);
        store.background_is_dark = is_dark(&store.background);
    }

    // Calcule le ratio de contraste
    // Calculate contrast ratio
    store.contrast_ratio_raw = store.foreground.get_contrast_ratio(&store.background);

    // Round the contrast ratio, to 3 decimal
    store.contrast_ratio_rounded = (store.contrast_ratio_raw * config::ROUNDING_FACTOR).round() / config::ROUNDING_FACTOR;

    // Calcule le ratio de contraste entre l'arrière-plan et le blanc
    // Calculate contrast ratio between background and white
    let white = BigColor::from_rgb(255, 255, 255, 1.0);
    store.background_contrast_with_white = store.background.get_contrast_ratio(&white);
}
