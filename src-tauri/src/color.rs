// =============================================================================
// color.rs - Color manipulation and store update functions
// =============================================================================

use palette::{FromColor, Hsl, Srgb};
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

/// Sérialise une couleur RGB en chaîne HSL CSS "hsl(h, s%, l%)".
///
/// Serializes an RGB color into a CSS HSL string "hsl(h, s%, l%)".
pub fn rgb_to_hsl_string(rgb: (u8, u8, u8)) -> String {
    let hsl = Hsl::from_color(srgb_from_u8(rgb));
    // Teinte ramenée dans [0, 360), saturation et luminosité en pourcentage.
    // Hue brought back into [0, 360), saturation and lightness as percentages.
    let h = (hsl.hue.into_positive_degrees().round() as u16) % 360;
    let s = (hsl.saturation * 100.0).round() as u8;
    let l = (hsl.lightness * 100.0).round() as u8;
    format!("hsl({}, {}%, {}%)", h, s, l)
}

/// Convertit une couleur HSL (h: 0-360, s/l: 0-100) en composantes RGB.
///
/// Converts an HSL color (h: 0-360, s/l: 0-100) into RGB components.
pub fn hsl_to_rgb(h: u16, s: u8, l: u8) -> (u8, u8, u8) {
    let hsl = Hsl::new(h as f64, s as f64 / 100.0, l as f64 / 100.0);
    let rgb = Srgb::from_color(hsl).into_format::<u8>();
    (rgb.red, rgb.green, rgb.blue)
}

/// Convertit une saisie hexadécimale (#abc / #aabbcc, le # est optionnel) en RGB.
/// Retourne None si la chaîne n'est pas une notation hex valide.
///
/// Converts a hexadecimal input (#abc / #aabbcc, the # is optional) into RGB.
/// Returns None when the string is not a valid hex notation.
pub fn hex_to_rgb(hex: &str) -> Option<(u8, u8, u8)> {
    let cleaned = hex.trim().trim_start_matches('#');
    let byte = |s: &str| u8::from_str_radix(s, 16).ok();

    match cleaned.len() {
        // Notation courte : chaque chiffre est doublé (#abc -> #aabbcc).
        // Short notation: each digit is doubled (#abc -> #aabbcc).
        3 => {
            let c: Vec<char> = cleaned.chars().collect();
            Some((
                byte(&format!("{0}{0}", c[0]))?,
                byte(&format!("{0}{0}", c[1]))?,
                byte(&format!("{0}{0}", c[2]))?,
            ))
        }
        // Notation longue : deux chiffres par composante.
        // Long notation: two digits per component.
        6 => Some((byte(&cleaned[0..2])?, byte(&cleaned[2..4])?, byte(&cleaned[4..6])?)),
        _ => None,
    }
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
        store.foreground_hsl = rgb_to_hsl_string((r, g, b));
        store.foreground_is_dark = is_dark((r, g, b));
    }

    if let Some((r, g, b)) = result.background {
        store.background_rgb = (r, g, b);
        store.background_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
        store.background_hsl = rgb_to_hsl_string((r, g, b));
        store.background_is_dark = is_dark((r, g, b));
    }

    // Ratio de contraste (brut + arrondi vers le bas)
    // Contrast ratio (raw + floor-rounded)
    store.contrast_ratio_raw = contrast_ratio(store.foreground_rgb, store.background_rgb);
    store.contrast_ratio_rounded = floor_ratio(store.contrast_ratio_raw);

    // Ratio de contraste entre l'arrière-plan et le blanc / noir
    // Contrast ratio between background and white / black
    store.background_contrast_with_white = contrast_ratio(store.background_rgb, (255, 255, 255));
    store.background_contrast_with_black = contrast_ratio(store.background_rgb, (0, 0, 0));
}
