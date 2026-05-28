import { LitElement, html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { IS_MAC } from '../lib/platform';

type Direction =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'NorthEast'
  | 'NorthWest'
  | 'SouthEast'
  | 'SouthWest';

@customElement('window-resize-grips')
export class WindowResizeGrips extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
    }

    .grip {
      position: absolute;
      pointer-events: auto;
    }

    .n {
      top: 0;
      left: 8px;
      right: 8px;
      height: 4px;
      cursor: n-resize;
    }
    .s {
      bottom: 0;
      left: 8px;
      right: 8px;
      height: 4px;
      cursor: s-resize;
    }
    .w {
      top: 8px;
      bottom: 8px;
      left: 0;
      width: 4px;
      cursor: w-resize;
    }
    .e {
      top: 8px;
      bottom: 8px;
      right: 0;
      width: 4px;
      cursor: e-resize;
    }
    .nw {
      top: 0;
      left: 0;
      width: 8px;
      height: 8px;
      cursor: nw-resize;
    }
    .ne {
      top: 0;
      right: 0;
      width: 8px;
      height: 8px;
      cursor: ne-resize;
    }
    .sw {
      bottom: 0;
      left: 0;
      width: 8px;
      height: 8px;
      cursor: sw-resize;
    }
    .se {
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      cursor: se-resize;
    }
  `;

  private startResize(direction: Direction) {
    return async (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      await getCurrentWindow().startResizeDragging(direction as any);
    };
  }

  render() {
    if (IS_MAC) return nothing;
    return html`
      <div class="grip n" @mousedown=${this.startResize('North')}></div>
      <div class="grip s" @mousedown=${this.startResize('South')}></div>
      <div class="grip w" @mousedown=${this.startResize('West')}></div>
      <div class="grip e" @mousedown=${this.startResize('East')}></div>
      <div class="grip nw" @mousedown=${this.startResize('NorthWest')}></div>
      <div class="grip ne" @mousedown=${this.startResize('NorthEast')}></div>
      <div class="grip sw" @mousedown=${this.startResize('SouthWest')}></div>
      <div class="grip se" @mousedown=${this.startResize('SouthEast')}></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'window-resize-grips': WindowResizeGrips;
  }
}
