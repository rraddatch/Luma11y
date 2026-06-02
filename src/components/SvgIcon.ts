import { LitElement, html, svg, css, nothing, type SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/* !Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */

type PaintMode = 'fill' | 'stroke';

interface IconDef {
  viewBox: string;
  /** SVG inner content (paths, circles, lines, polylines...). */
  body: SVGTemplateResult;
  /**
   * How the SVG primitives should be painted.
   * - 'fill' (default): solid-filled paths (Font Awesome / Material style)
   * - 'stroke': outlined with `currentColor`, `stroke-width: 2`, rounded caps/joins (Lucide / Tabler style)
   */
  paint?: PaintMode;
}

const icons: Record<string, IconDef> = {
  eyedropper: {
    viewBox: '0 0 640 640',
    body: svg`<path d="M405.6 93.2L304 194.8L294.6 185.4C282.1 172.9 261.8 172.9 249.3 185.4C236.8 197.9 236.8 218.2 249.3 230.7L409.3 390.7C421.8 403.2 442.1 403.2 454.6 390.7C467.1 378.2 467.1 357.9 454.6 345.4L445.2 336L546.8 234.4C585.8 195.4 585.8 132.2 546.8 93.3C507.8 54.4 444.6 54.3 405.7 93.3zM119.4 387.3C104.4 402.3 96 422.7 96 443.9L96 486.3L69.4 526.2C60.9 538.9 62.6 555.8 73.4 566.6C84.2 577.4 101.1 579.1 113.8 570.6L153.7 544L196.1 544C217.3 544 237.7 535.6 252.7 520.6L362.1 411.2L316.8 365.9L207.4 475.3C204.4 478.3 200.3 480 196.1 480L160 480L160 443.9C160 439.7 161.7 435.6 164.7 432.6L274.1 323.2L228.8 277.9L119.4 387.3z"/>`,
  },
  swap: {
    viewBox: '0 0 640 640',
    body: svg`<path d="M329.4 169.4L425.4 73.4C437.9 60.9 458.2 60.9 470.7 73.4L566.7 169.4C579.2 181.9 579.2 202.2 566.7 214.7C554.2 227.2 533.9 227.2 521.4 214.7L480 173.3L480 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L224 352L224 466.7L265.4 425.3C277.9 412.8 298.2 412.8 310.7 425.3C323.2 437.8 323.2 458.1 310.7 470.6L214.7 566.6C202.2 579.1 181.9 579.1 169.4 566.6L73.4 470.6C60.9 458.1 60.9 437.8 73.4 425.3C85.9 412.8 106.2 412.8 118.7 425.3L160 466.7L160 352L96 352C78.3 352 64 337.7 64 320C64 302.3 78.3 288 96 288L416 288L416 173.3L374.6 214.7C362.1 227.2 341.8 227.2 329.3 214.7C316.8 202.2 316.8 181.9 329.3 169.4zM480 400L480 544C480 561.7 465.7 576 448 576C430.3 576 416 561.7 416 544L416 400L480 400zM160 240L160 96C160 78.3 174.3 64 192 64C209.7 64 224 78.3 224 96L224 240L160 240z"/>`,
  },
  sliders: {
    viewBox: '0 0 640 640',
    body: svg`<path d="M96 128C78.3 128 64 142.3 64 160C64 177.7 78.3 192 96 192L182.7 192C195 220.3 223.2 240 256 240C288.8 240 317 220.3 329.3 192L544 192C561.7 192 576 177.7 576 160C576 142.3 561.7 128 544 128L329.3 128C317 99.7 288.8 80 256 80C223.2 80 195 99.7 182.7 128L96 128zM96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L342.7 352C355 380.3 383.2 400 416 400C448.8 400 477 380.3 489.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L489.3 288C477 259.7 448.8 240 416 240C383.2 240 355 259.7 342.7 288L96 288zM96 448C78.3 448 64 462.3 64 480C64 497.7 78.3 512 96 512L150.7 512C163 540.3 191.2 560 224 560C256.8 560 285 540.3 297.3 512L544 512C561.7 512 576 497.7 576 480C576 462.3 561.7 448 544 448L297.3 448C285 419.7 256.8 400 224 400C191.2 400 163 419.7 150.7 448L96 448z"/>`,
  },
  'chevron-down': {
    viewBox: '0 0 512 512',
    body: svg`<path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>`,
  },
  'chevron-up': {
    viewBox: '0 0 512 512',
    body: svg`<path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/>`,
  },
  'circle-empty': {
    viewBox: '0 0 512 512',
    body: svg`<path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-width="32"/>`,
  },
  'circle-dot': {
    viewBox: '0 0 512 512',
    body: svg`
      <path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-width="32"/>
      <circle cx="256" cy="256" r="96" fill="currentColor"/>
    `,
  },
  'circle-full': {
    viewBox: '0 0 512 512',
    body: svg`<path d="M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64z"/>`,
  },
  text: {
    viewBox: '0 0 640 640',
    body: svg`<path d="M349.5 115.7C344.6 103.8 332.9 96 320 96C307.1 96 295.4 103.8 290.5 115.7C197.2 339.7 143.8 467.7 130.5 499.7C123.7 516 131.4 534.7 147.7 541.5C164 548.3 182.7 540.6 189.5 524.3L221.3 448L418.6 448L450.4 524.3C457.2 540.6 475.9 548.3 492.2 541.5C508.5 534.7 516.2 516 509.4 499.7C496.1 467.7 442.7 339.7 349.4 115.7zM392 384L248 384L320 211.2L392 384z"/>`,
  },
  'non-text': {
    viewBox: '0 0 576 512',
    body: svg`<path d="M512.4 240l-176 0c-17.7 0-32-14.3-32-32l0-176c0-17.7 14.4-32.2 31.9-29.9 107 14.2 191.8 99 206 206 2.3 17.5-12.2 31.9-29.9 31.9zM222.6 37.2c18.1-3.8 33.8 11 33.8 29.5l0 197.3c0 5.6 2 11 5.5 15.3L394 438.7c11.7 14.1 9.2 35.4-6.9 44.1-34.1 18.6-73.2 29.2-114.7 29.2-132.5 0-240-107.5-240-240 0-115.5 81.5-211.9 190.2-234.8zM477.8 288l64 0c18.5 0 33.3 15.7 29.5 33.8-10.2 48.4-35 91.4-69.6 124.2-12.3 11.7-31.6 9.2-42.4-3.9L374.9 340.4c-17.3-20.9-2.4-52.4 24.6-52.4l78.2 0z"/>`,
  },
  warning: {
    viewBox: '0 0 512 512',
    body: svg`<path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.4 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>`,
  },
  settings: {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    `,
  },
  pin: {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`
      <path d="M12 17v5"/>
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
    `,
  },
  'pin-filled': {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`
      <path d="M12 17v5"/>
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" fill="currentColor"/>
    `,
  },
  'pin-off': {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`
      <path d="M12 17v5"/>
      <path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89"/>
      <path d="m2 2 20 20"/>
      <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12"/>
    `,
  },
  sun: {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    `,
  },
  moon: {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`,
  },
  'sun-moon': {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`
      <path d="M12 2v2"/>
      <path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/>
      <path d="M16 12a4 4 0 0 0-4-4"/>
      <path d="m19 5-1.256 1.256"/>
      <path d="M20 12h2"/>
    `,
  },
  'chevron-down-thin': {
    viewBox: '0 0 24 24',
    paint: 'stroke',
    body: svg`<polyline points="6 9 12 15 18 9"/>`,
  },
};

@customElement('svg-icon')
export class SvgIcon extends LitElement {
  @property({ type: String }) name = '';
  @property({ type: String }) size = '1.5rem';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      display: block;
    }
    svg.paint-fill {
      fill: currentColor;
    }
    svg.paint-stroke {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  render() {
    const icon = icons[this.name];
    if (!icon) return nothing;

    const cls = `paint-${icon.paint ?? 'fill'}`;

    return html`
      <svg xmlns="http://www.w3.org/2000/svg" class=${cls} viewBox="${icon.viewBox}"
        width="${this.size}" height="${this.size}" aria-hidden="true" focusable="false">
        ${icon.body}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'svg-icon': SvgIcon;
  }
}
