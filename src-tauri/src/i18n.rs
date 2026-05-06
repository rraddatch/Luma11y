// =============================================================================
// i18n.rs - Traductions des menus natifs
// i18n.rs - Native menu translations
// =============================================================================

/// Retourne la traduction d'une clé de menu pour une locale donnée
/// Returns the translation of a menu key for a given locale
pub fn menu_t(locale: &str, key: &str) -> &'static str {
    match (locale, key) {
        // === English ===
        ("en", "about") => "About Luma11y",
        ("en", "hide") => "Hide",
        ("en", "hide_others") => "Hide Others",
        ("en", "show_all") => "Show All",
        ("en", "quit") => "Quit",
        ("en", "colour_profiles") => "Colour Profiles",
        ("en", "language") => "Language",
        ("en", "appearance") => "Appearance",
        ("en", "appearance_auto") => "Auto",
        ("en", "appearance_light") => "Light",
        ("en", "appearance_dark") => "Dark",
        ("en", "style_theme") => "Style",
        ("en", "style_modern") => "Modern",
        ("en", "style_classic") => "Classic",
        ("en", "settings") => "Settings\u{2026}",
        ("en", "settings_title") => "Settings",
        ("en", "edit") => "Edit",
        ("en", "copy_templates") => "Copy Templates",
        // Clé inconnue en anglais / Unknown English key
        ("en", _) => "?",

        // === Français ===
        ("fr", "about") => "À propos de Luma11y",
        ("fr", "hide") => "Masquer",
        ("fr", "hide_others") => "Masquer les autres",
        ("fr", "show_all") => "Tout afficher",
        ("fr", "quit") => "Quitter",
        ("fr", "colour_profiles") => "Profils de couleurs",
        ("fr", "language") => "Langue",
        ("fr", "appearance") => "Apparence",
        ("fr", "appearance_auto") => "Auto",
        ("fr", "appearance_light") => "Clair",
        ("fr", "appearance_dark") => "Sombre",
        ("fr", "style_theme") => "Style",
        ("fr", "style_modern") => "Moderne",
        ("fr", "style_classic") => "Classique",
        ("fr", "settings") => "Pr\u{00e9}f\u{00e9}rences\u{2026}",
        ("fr", "settings_title") => "Pr\u{00e9}f\u{00e9}rences",
        ("fr", "edit") => "\u{00c9}dition",
        ("fr", "copy_templates") => "Mod\u{00e8}les de copie",

        // Locale inconnue ou clé manquante : fallback vers l'anglais
        // Unknown locale or missing key: fall back to English
        (_, k) => menu_t("en", k),
    }
}
