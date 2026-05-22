// =============================================================================
// color.rs - Color manipulation and store update functions
// =============================================================================

use palette::Srgb;
use palette::color_difference::Wcag21RelativeContrast;
use crate::store::ResultStore;
use crate::picker::common::ColorPickerResult;
use crate::config;

/// Convertit un tuple RGB u8 en `Srgb<f64>` (composantes [0..1]).
/// Convert a u8 RGB tuple into `Srgb<f64>` (components in [0..1]).
fn srgb_from_u8(rgb: (u8, u8, u8)) -> Srgb<f64> {
    let (r, g, b) = rgb;
    Srgb::<u8>::new(r, g, b).into_format::<f64>()
}

/// Ratio de contraste WCAG entre deux couleurs sRGB.
/// WCAG contrast ratio between two sRGB colors.
pub fn contrast_ratio(fg: (u8, u8, u8), bg: (u8, u8, u8)) -> f64 {
    srgb_from_u8(fg).relative_contrast(srgb_from_u8(bg))
}

/// Considère une couleur comme sombre si son contraste avec le noir est < 4.5
/// A color is considered dark when its contrast against black is < 4.5
pub fn is_dark(rgb: (u8, u8, u8)) -> bool {
    contrast_ratio(rgb, (0, 0, 0)) < 4.5
}

/// Arrondi WCAG vers le bas, à la précision de `config::ROUNDING_FACTOR`.
/// WCAG floor-rounding at `config::ROUNDING_FACTOR` precision.
pub fn floor_ratio(raw: f64) -> f64 {
    (raw * config::ROUNDING_FACTOR as f64).floor() / config::ROUNDING_FACTOR as f64
}

/// Met à jour les résultats du store à partir du résultat du picker
/// Updates the store results from picker result
///
/// # Arguments
/// * `store` - Le store à mettre à jour / The store to update
/// * `result` - Le résultat du color picker / The color picker result
pub fn update_results_from_picker(store: &mut ResultStore, result: &ColorPickerResult) {
    if let Some((r, g, b)) = result.foreground {
        store.foreground_rgb = (r, g, b);
        store.foreground_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
        store.foreground_is_dark = is_dark((r, g, b));
    }

    if let Some((r, g, b)) = result.background {
        store.background_rgb = (r, g, b);
        store.background_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
        store.background_is_dark = is_dark((r, g, b));
    }

    // Ratio de contraste (brut + arrondi vers le bas)
    // Contrast ratio (raw + floor-rounded)
    store.contrast_ratio_raw = contrast_ratio(store.foreground_rgb, store.background_rgb);
    store.contrast_ratio_rounded = floor_ratio(store.contrast_ratio_raw);

    // Ratio de contraste entre l'arrière-plan et le blanc
    // Contrast ratio between background and white
    store.background_contrast_with_white = contrast_ratio(store.background_rgb, (255, 255, 255));
}
