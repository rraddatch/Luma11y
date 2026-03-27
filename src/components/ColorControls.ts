// =============================================================================
// ColorControls.ts - Composant de contrôle des couleurs RGB
// ColorControls.ts - RGB color control component
//
// Affiche trois canaux (R, G, B) avec un champ numérique et un slider chacun.
// Displays three channels (R, G, B) with a number input and a slider each.
//
// Propriétés :
//   - rgb    : valeurs RGB sous forme de chaîne "r, g, b"
//   - locale : locale courante, pour la réactivité des traductions
//   - label  : nom de la section ("Foreground" / "Background"), utilisé par
//              aria-describedby pour le contexte des lecteurs d'écran
//
// Événements :
//   - color-change : émis à chaque modification, avec detail { component, value }
//
// Le mode d'affichage des sliders (standard / statique / dynamique) est géré
// en interne via un <select>.
// =============================================================================

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { t } from '../i18n';
import { srOnly } from './shared-styles';

@customElement('color-controls')
export class ColorControls extends LitElement {
  // Valeurs RGB sous forme "r, g, b" / RGB values as "r, g, b"
  @property({ type: String }) rgb = '0, 0, 0';

  // Locale courante — crée une dépendance réactive pour les traductions
  // Current locale — creates a reactive dependency for translations
  @property({ type: String }) locale = 'en';

  // Nom de la section affiché en sr-only pour le contexte a11y
  // Section name displayed as sr-only for a11y context
  @property({ type: String }) label = '';

  // Mode d'affichage des sliders / Slider display mode
  @state() private sliderMode: 'standard' | 'static' | 'dynamic' = 'standard';

  // Parse la chaîne RGB en tableau de trois valeurs numériques
  // Parses the RGB string into an array of three numeric values
  private get rgbValues(): [number, number, number] {
    const parts = this.rgb.split(',').map(v => parseInt(v.trim()));
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  }

  // Émet un événement color-change vers le parent (bubbles à travers le Shadow DOM)
  // Emits a color-change event to the parent (bubbles through Shadow DOM)
  private emitChange(component: 'r' | 'g' | 'b', value: number) {
    this.dispatchEvent(new CustomEvent('color-change', {
      detail: { component, value },
      bubbles: true,
      composed: true,
    }));
  }

  // Appelé lors du glissement du slider (input continu)
  // Called during slider drag (continuous input)
  private onInput(component: 'r' | 'g' | 'b', value: number) {
    this.emitChange(component, value);
  }

  // Appelé à la validation du champ numérique (clamp entre 0 et 255)
  // Called on number input commit (clamped between 0 and 255)
  private onChange(component: 'r' | 'g' | 'b', value: number) {
    this.emitChange(component, Math.min(255, Math.max(0, value)));
  }

  // Shift + flèches sur le slider : incrémente/décrémente de 10
  // Shift + arrow keys on slider: increment/decrement by 10
  private onSliderKeydown(e: KeyboardEvent, component: 'r' | 'g' | 'b', current: number) {
    if (!e.shiftKey) return;
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 10
               : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -10
               : 0;
    if (step === 0) return;
    e.preventDefault();
    this.emitChange(component, Math.min(255, Math.max(0, current + step)));
  }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  static styles = [srOnly, css`
    :host {
      display: block;
      padding: 0.5rem 1rem;
    }

    /* Sélecteur du mode slider, aligné à droite */
    /* Slider mode selector, right-aligned */
    select {
      display: block;
      margin-left: auto;
      background: none;
      border: none;
      color: var(--text-color-light);
      cursor: pointer;
      font-size: 0.75rem;
      font-family: inherit;
    }

    /* Ligne d'un canal RGB (label + input + slider) */
    /* RGB channel row (label + input + slider) */
    .channel {
      margin: 0.3rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;

      span:first-child {
        width: 1ch;
      }
    }

    input[type="range"] {
      flex: 1;
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 3px;
      background: var(--progress-background);
      outline: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid var(--border-color);
        cursor: pointer;
      }
    }

    .rgb-input {
      width: 4.5ch;
      text-align: center;
      font-variant-numeric: tabular-nums;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      border-radius: 3px;
      padding: 0 0.2rem;
      background: transparent;
      -moz-appearance: textfield;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    /* Mode statique : dégradé fixe noir → couleur pure par canal */
    /* Static mode: fixed gradient black → pure color per channel */
    :host(.slider-mode-static) {
      .slider-r { background: linear-gradient(to right, #000, #f00); }
      .slider-g { background: linear-gradient(to right, #000, #0f0); }
      .slider-b { background: linear-gradient(to right, #000, #00f); }
    }

    /* Mode dynamique : dégradé calculé à partir des autres composantes */
    /* Dynamic mode: gradient computed from the other components */
    :host(.slider-mode-dynamic) input[type="range"] {
      background: linear-gradient(to right, var(--slider-from, #000), var(--slider-to, #fff));
    }
  `];

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  // Synchronise la classe CSS du mode slider sur l'élément hôte
  // Syncs the slider mode CSS class on the host element
  private updateHostClass() {
    this.classList.remove('slider-mode-standard', 'slider-mode-static', 'slider-mode-dynamic');
    this.classList.add(`slider-mode-${this.sliderMode}`);
  }

  updated() {
    this.updateHostClass();
  }

  // ---------------------------------------------------------------------------
  // Rendu
  // Rendering
  // ---------------------------------------------------------------------------

  // Rendu d'un canal RGB individuel (R, G ou B)
  // Renders a single RGB channel (R, G, or B)
  private renderChannel(label: string, legendKey: string, component: 'r' | 'g' | 'b', index: number, sliderClass: string) {
    const [r, g, b] = this.rgbValues;
    const value = [r, g, b][index];

    // Pour le mode dynamique, calculer les couleurs from/to
    // For dynamic mode, compute the from/to colors
    let dynamicStyle = '';
    if (this.sliderMode === 'dynamic') {
      const fromParts = [r, g, b];
      const toParts = [r, g, b];
      fromParts[index] = 0;
      toParts[index] = 255;
      dynamicStyle = `--slider-from: rgb(${fromParts.join(',')}); --slider-to: rgb(${toParts.join(',')})`;
    }

    const channelLabel = t(legendKey);

    return html`
      <div class="channel" role="group" aria-label="${channelLabel}">
        <span aria-hidden="true">${label}</span>
        <input
          aria-label="${t('color.component_value')}"
          aria-describedby="section-label"
          type="number" min="0" max="255" class="rgb-input"
          .value="${String(value)}"
          @change="${(e: Event) => this.onChange(component, +(e.target as HTMLInputElement).value)}"
        />
        <input
          aria-label="${t('color.component_slider')}"
          aria-describedby="section-label"
          type="range" min="0" max="255" class="${sliderClass}"
          .value="${String(value)}"
          @input="${(e: Event) => this.onInput(component, +(e.target as HTMLInputElement).value)}"
          @keydown="${(e: KeyboardEvent) => this.onSliderKeydown(e, component, value)}"
          style="${dynamicStyle}"
        />
      </div>
    `;
  }

  render() {
    // Lire this.locale pour forcer le re-render quand la locale change
    // Read this.locale to force re-render when locale changes
    void this.locale;

    return html`
      <span id="section-label" class="sr-only">${this.label}</span>
      <select
        aria-label="${t('color.slider_mode')}"
        .value="${this.sliderMode}"
        @change="${(e: Event) => this.sliderMode = (e.target as HTMLSelectElement).value as any}"
      >
        <option value="standard">${t('color.slider_standard')}</option>
        <option value="static">${t('color.slider_colored')}</option>
        <option value="dynamic">${t('color.slider_dynamic')}</option>
      </select>
      ${this.renderChannel('R', 'color.red', 'r', 0, 'slider-r')}
      ${this.renderChannel('G', 'color.green', 'g', 1, 'slider-g')}
      ${this.renderChannel('B', 'color.blue', 'b', 2, 'slider-b')}
    `;
  }
}

// Déclaration du type pour l'IntelliSense
// Type declaration for IntelliSense
declare global {
  interface HTMLElementTagNameMap {
    'color-controls': ColorControls;
  }
}
