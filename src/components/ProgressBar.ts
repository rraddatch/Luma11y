import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '../i18n';

@customElement('progress-bar')
export class ProgressBar extends LitElement {
  @property({ type: Number }) position = 30;
  @property({ type: Number }) split1 = 10;
  // We accepte Number or undefined
  @property({ type: Number }) split2?: number;
  @property({ type: String }) labels: 'levels' | 'ratios' = 'levels';

  static aaColor: string = 'var(--progress-aa)';
  static aaaColor: string = 'var(--progress-aaa)';
  static failColor: string = 'var(--progress-fail)';

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      min-width: 0;
      height: 3.4rem;
      overflow: visible;
      margin: 20px 0;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .progress-bar {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 0.5rem;
      border-radius: 0.3rem;
      overflow: visible;
      transform: translateY(-50%);
    }

    /* white separator */
    .divider {
      position: absolute;
      top: 0;
      width: 2px;
      height: 100%;
      background-color: var(--progress-divider);
      z-index: 1;
    }

    .position-value {
      position: absolute;
      bottom: 100%;
      margin-bottom: 0;
      transform: translateX(-50%);
      font-size: 13px;
      font-weight: bold;
      color: var(--text-color);
      white-space: nowrap;
      z-index: 3;
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .position-chevron {
      font-size: 10px;
      line-height: 1;
      color: var(--background-color-inverted);
    }

    .labels-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      width: 100%;
    }

    .label-ratio {
      position: absolute;
      left: 0;
      transform: translateX(-50%);
      font-size: 13px;
      font-weight: bold;
      color: var(--text-color);
      letter-spacing: 0.5px;
      white-space: nowrap;
      &.border {
        border: 1px solid var(--border-color-light);
        border-radius: 3px;
      }

      &.end {
        transform: translateX(-100%);
      }

      &.above {
        bottom: 100%;
        margin-bottom: 4px;
      }

      &.below {
        top: 100%;
        margin-top: 4px;
      }
    }
  `;

  // Convertit une valeur sur l'échelle 1-21 en pourcentage
  private toPercent(value: number): number {
    return ((value - 1) / 20) * 100;
  }

  render() {
    const posPercent = this.toPercent(this.position);
    const s1Percent = this.toPercent(this.split1);
    const s2Percent = this.split2 != null ? this.toPercent(this.split2) : 100;

    // Dégradé dynamique : Si pas de split2, on ne passe que du rouge au jaune/vert
    const gradient = this.split2 != null
      ? `linear-gradient(to right,
          var(--progress-fail) 0%, var(--progress-fail) ${s1Percent}%,
          var(--progress-aa) ${s1Percent}%, var(--progress-aa) ${s2Percent}%,
          var(--progress-aaa) ${s2Percent}%, var(--progress-aaa) 100%)`
      : `linear-gradient(to right,
          var(--progress-fail) 0%, var(--progress-fail) ${s1Percent}%,
          var(--progress-aaa) ${s1Percent}%, var(--progress-aaa) 100%)`;

    return html`
      <div class="progress-bar" style="background: ${gradient}" aria-hidden="true">
        <div class="divider" style="left: ${s1Percent}%"></div>

        ${this.split2 != null && s2Percent < 100
          ? html`<div class="divider" style="left: ${s2Percent}%"></div>`
          : ''}

        <span class="position-value" style="left: ${posPercent}%">
          <span>${this.position}</span>
          <span class="position-chevron">▼</span>
        </span>

        ${this.labels === 'ratios'
          ? html`
            <span class="label-ratio border below" style="left: ${s1Percent}%">${this.split1}</span>
            ${this.split2 != null
              ? html`<span class="label-ratio border below" style="left: ${s2Percent}%">${this.split2}</span>`
              : ''}
            <span class="label-ratio below end" style="left: 100%">${t('results.ratio')}</span>
          `
          : ''}
      </div>

      ${this.labels === 'levels'
        ? html`
          <div class="labels-container">
            <div class="label-item" style="width: ${s1Percent}%"></div>
            ${this.split2 != null
              ? html`
                  <div class="label-item" style="width: ${s2Percent - s1Percent}%">AA</div>
                  <div class="label-item" style="width: ${100 - s2Percent}%">AAA</div>
                `
              : html`
                  <div class="label-item" style="width: ${100 - s1Percent}%">AA</div>
                `
            }
          </div>`
        : ''
      }
    `;
  }
}

// Optionnel : déclaration du type pour l'IntelliSense dans JSX/TSX
declare global {
  interface HTMLElementTagNameMap {
    'progress-bar': ProgressBar;
  }
}