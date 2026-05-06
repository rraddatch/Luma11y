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

        // Fallback vers l'anglais / Fallback to English
        (_, "about") => "About Luma11y",
        (_, "hide") => "Hide",
        (_, "hide_others") => "Hide Others",
        (_, "show_all") => "Show All",
        (_, "quit") => "Quit",
        (_, "colour_profiles") => "Colour Profiles",
        (_, "language") => "Language",
        (_, "appearance") => "Appearance",
        (_, "appearance_auto") => "Auto",
        (_, "appearance_light") => "Light",
        (_, "appearance_dark") => "Dark",
        (_, "style_theme") => "Style",
        (_, "style_modern") => "Modern",
        (_, "style_classic") => "Classic",
        (_, "settings") => "Settings\u{2026}",
        (_, "settings_title") => "Settings",
        (_, "edit") => "Edit",
        (_, "copy_templates") => "Copy Templates",

        // Clé inconnue / Unknown key
        _ => "?",
    }
}
