import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { setThemePreference, getThemePreference, type ThemePreference } from '../theme';
import { setStyleTheme, getStyleTheme, type StyleTheme } from '../styleTheme';
import { IS_MAC } from '../lib/platform';
import { t, onLocaleChange } from '../i18n';

type OpenMenu = null | 'menu' | 'style' | 'appearance';

/**
 * Implements the WAI ARIA menubar pattern:
 * https://www.w3.org/WAI/tutorials/menus/application-menus/
 * https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@customElement('app-menubar')
export class AppMenubar extends LitElement {
  @state() private open: OpenMenu = null;
  @state() private appearance: ThemePreference = 'auto';
  @state() private styleTheme: StyleTheme = 'modern';
  @state() private alwaysOnTop = false;
  /** Roving-tabindex pointer into the top-level menubar items. */
  @state() private focusedIndex = 0;

  private outsidePointer = (e: MouseEvent) => {
    if (!e.composedPath().includes(this)) this.open = null;
  };

  connectedCallback() {
    super.connectedCallback();

    this.appearance = getThemePreference();
    this.styleTheme = getStyleTheme();

    getCurrentWindow().isAlwaysOnTop().then((v) => {
      this.alwaysOnTop = v;
    });

    document.addEventListener('mousedown', this.outsidePointer);

    listen<string>('appearance-changed', (e) => {
      this.appearance = e.payload as ThemePreference;
    });
    listen<string>('style-theme-changed', (e) => {
      this.styleTheme = e.payload as StyleTheme;
    });
    listen<boolean>('always-on-top-changed', (e) => {
      this.alwaysOnTop = e.payload;
    });

    onLocaleChange(() => {
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mousedown', this.outsidePointer);
  }

  // ===========================================================================
  // Queries / focus helpers
  // ===========================================================================

  private getMenubarItems(): HTMLElement[] {
    return Array.from(
      this.renderRoot.querySelectorAll<HTMLElement>('.menubar-item')
    );
  }

  /** Items inside whatever dropdown is currently open (top-level or submenu). */
  private getDropdownItems(): HTMLElement[] {
    if (this.open === 'style') {
      return Array.from(
        this.renderRoot.querySelectorAll<HTMLElement>(
          '.dropdown.submenu > li > [role^="menuitem"]'
        )
      );
    }
    if (this.open === 'menu') {
      return Array.from(
        this.renderRoot.querySelectorAll<HTMLElement>(
          '.dropdown.from-left > li > [role^="menuitem"]'
        )
      );
    }
    if (this.open === 'appearance') {
      return Array.from(
        this.renderRoot.querySelectorAll<HTMLElement>(
          '.dropdown.appearance > li > [role^="menuitem"]'
        )
      );
    }
    return [];
  }

  private async focusMenubarItem(idx: number) {
    const items = this.getMenubarItems();
    if (items.length === 0) return;
    const wrapped = (idx + items.length) % items.length;
    this.focusedIndex = wrapped;
    await this.updateComplete;
    items[wrapped]?.focus();
  }

  private async focusDropdownItem(idx: number) {
    await this.updateComplete;
    const items = this.getDropdownItems();
    if (items.length === 0) return;
    const wrapped = (idx + items.length) % items.length;
    items[wrapped]?.focus();
  }

  private async closeAndReturnFocus() {
    const wasStyle = this.open === 'style';
    this.open = wasStyle ? 'menu' : null;
    await this.updateComplete;
    if (wasStyle) {
      const styleTrigger = this.renderRoot.querySelector<HTMLElement>(
        '.dropdown.from-left > li:first-child > [role="menuitem"]'
      );
      styleTrigger?.focus();
    } else {
      const items = this.getMenubarItems();
      items[this.focusedIndex]?.focus();
    }
  }

  // ===========================================================================
  // Keyboard handling
  // ===========================================================================

  private onKeydown(e: KeyboardEvent) {
    e.stopPropagation();

    if (e.key === 'Escape') {
      if (this.open) {
        e.preventDefault();
        this.closeAndReturnFocus();
      }
      return;
    }

    if (e.key === 'Tab') {
      if (this.open) this.open = null;
      return;
    }

    const focused = this.shadowRoot?.activeElement as HTMLElement | null;
    if (!focused) return;

    if (focused.classList.contains('menubar-item')) {
      this.handleMenubarKeydown(e, focused);
    } else if (focused.closest('.dropdown')) {
      this.handleDropdownKeydown(e, focused);
    }
  }

  private handleMenubarKeydown(e: KeyboardEvent, focused: HTMLElement) {
    const items = this.getMenubarItems();
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        this.open = null;
        this.focusMenubarItem(this.focusedIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.open = null;
        this.focusMenubarItem(this.focusedIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        this.open = null;
        this.focusMenubarItem(0);
        break;
      case 'End':
        e.preventDefault();
        this.open = null;
        this.focusMenubarItem(items.length - 1);
        break;
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ': {
        const popup = focused.dataset.popup as OpenMenu | undefined;
        if (popup) {
          e.preventDefault();
          this.open = popup;
          this.updateComplete.then(() => {
            const dropdownItems = this.getDropdownItems();
            if (e.key === 'ArrowUp') {
              dropdownItems[dropdownItems.length - 1]?.focus();
            } else {
              dropdownItems[0]?.focus();
            }
          });
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          focused.click();
        }
        break;
      }
    }
  }

  private handleDropdownKeydown(e: KeyboardEvent, focused: HTMLElement) {
    const items = this.getDropdownItems();
    const idx = items.findIndex((el) => el === focused);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusDropdownItem(idx + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusDropdownItem(idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        this.focusDropdownItem(0);
        break;
      case 'End':
        e.preventDefault();
        this.focusDropdownItem(items.length - 1);
        break;
      case 'ArrowRight':
        if (focused.getAttribute('aria-haspopup') === 'menu') {
          e.preventDefault();
          this.open = 'style';
          this.focusDropdownItem(0);
        } else {
          e.preventDefault();
          this.open = null;
          this.focusMenubarItem(this.focusedIndex + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (this.open === 'style') {
          this.open = 'menu';
          this.updateComplete.then(() => {
            const styleTrigger = this.renderRoot.querySelector<HTMLElement>(
              '.dropdown.from-left > li:first-child > [role="menuitem"]'
            );
            styleTrigger?.focus();
          });
        } else {
          this.open = null;
          this.focusMenubarItem(this.focusedIndex - 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        focused.click();
        break;
    }
  }

  // ===========================================================================
  // Click actions
  // ===========================================================================

  private toggle(name: Exclude<OpenMenu, null>) {
    return (e: Event) => {
      e.stopPropagation();
      this.open = this.open === name ? null : name;
    };
  }

  private async handleSettings() {
    this.open = null;
    await invoke('open_settings_window').catch(() => {});
  }

  private async handleAlwaysOnTop() {
    const next = !this.alwaysOnTop;
    this.alwaysOnTop = next;
    await invoke('set_always_on_top', { value: next }).catch(() => {
      this.alwaysOnTop = !next;
    });
  }

  private async pickAppearance(mode: ThemePreference) {
    this.open = null;
    this.appearance = mode;
    setThemePreference(mode);
    await invoke('set_appearance', { appearance: mode }).catch(() => {});
  }

  private async pickStyle(s: StyleTheme) {
    this.open = null;
    this.styleTheme = s;
    setStyleTheme(s);
    await invoke('set_style_theme', { style: s }).catch(() => {});
  }

  private async handleQuit() {
    this.open = null;
    await getCurrentWindow().close();
  }

  private renderAppearanceIcon() {
    const name =
      this.appearance === 'light' ? 'sun' :
      this.appearance === 'dark' ? 'moon' : 'sun-moon';
    return html`<svg-icon name=${name} size="0.9375rem"></svg-icon>`;
  }

  // ===========================================================================
  // Styles
  // ===========================================================================

  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      height: 100%;
      color: var(--text-color-strong, #111);
    }

    nav {
      display: flex;
      align-items: stretch;
      height: 100%;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    ul[role="menubar"] {
      display: flex;
      align-items: stretch;
      height: 100%;
    }

    ul[role="menubar"] > li {
      position: relative;
      display: flex;
      align-items: stretch;
    }

    button {
      background: transparent;
      border: 0;
      padding: 0 0.5rem;
      height: 100%;
      cursor: pointer;
      color: inherit;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font: inherit;
      font-size: 0.78rem;

      &:hover {
        background: color-mix(in srgb, currentColor 10%, transparent);
      }

      &:focus-visible {
        outline: 0.125rem solid currentColor;
        outline-offset: -0.2rem;
      }
    }

    button.active {
      color: var(--color-blue-500, #4f7cff);
    }

    svg-icon {
      flex-shrink: 0;
    }

    /* Dropdown items are stacked vertically; their containing li wraps each row */
    ul.dropdown > li {
      position: relative;
      display: block;
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 0.125rem);
      right: 0;
      min-width: 10rem;
      background: var(--background-color, #fff);
      color: var(--text-color-strong, #111);
      border: 0.0625rem solid color-mix(in srgb, currentColor 15%, transparent);
      border-radius: 0.375rem;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
      padding: 0.25rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;

      &.from-left {
        right: auto;
        left: 0;
      }

      button {
        width: 100%;
        height: auto;
        padding: 0.375rem 0.625rem;
        border-radius: 0.25rem;
        justify-content: flex-start;
        text-align: left;
        white-space: nowrap;
      }
    }

    .submenu {
      position: absolute;
      top: 0;
      right: 100%;
      margin-right: 0.125rem;
      min-width: 7rem; /* override .dropdown's 10rem — narrow window safety */
    }

    li[role="separator"] {
      display: block;
      height: 0.0625rem;
      margin: 0.25rem 0;
      background: color-mix(in srgb, currentColor 15%, transparent);
    }

    [role="menuitemradio"][aria-checked="true"]::after {
      content: '✓';
      margin-left: auto;
      opacity: 0.8;
    }

    /* Submenu indicator: only menuitems inside a [role="menu"] (i.e. dropdown),
       not the top-level menubar items which use their own icons. */
    [role="menu"] [role="menuitem"][aria-haspopup="menu"]::after {
      content: '▸';
      margin-left: auto;
      opacity: 0.8;
    }
  `;

  // ===========================================================================
  // Render
  // ===========================================================================

  render() {
    // Index allocation depends on whether Menu is rendered (Win/Linux only)
    let i = 0;
    const menuIndex = !IS_MAC ? i++ : -1;
    const appearanceIndex = i++;
    const pinIndex = i++;
    const settingsIndex = i++;

    const menuLabel = t('menu.menu');

    return html`
      <nav aria-label=${menuLabel}>
        <ul role="menubar" aria-label=${menuLabel}>
          <!-- Menu dropdown (Win/Linux only — macOS uses the native menu bar) -->
          ${!IS_MAC
            ? html`
                <li role="none">
                  <button
                    type="button"
                    class="menubar-item"
                    role="menuitem"
                    tabindex=${this.focusedIndex === menuIndex ? 0 : -1}
                    data-popup="menu"
                    aria-haspopup="menu"
                    aria-expanded=${this.open === 'menu' || this.open === 'style'}
                    @keydown=${this.onKeydown}
                    @click=${this.toggle('menu')}
                  >
                    <span>${menuLabel}</span>
                    <svg-icon name="chevron-down-thin" size="0.75rem"></svg-icon>
                  </button>
                  ${this.open === 'menu' || this.open === 'style'
                    ? html`
                        <ul class="dropdown from-left" role="menu" @keydown=${this.onKeydown}>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              tabindex="-1"
                              aria-haspopup="menu"
                              aria-expanded=${this.open === 'style'}
                              @click=${this.toggle('style')}
                            >
                              <span>${t('settings.style_theme')}</span>
                            </button>
                            ${this.open === 'style'
                              ? html`
                                  <ul class="dropdown submenu" role="menu" @keydown=${this.onKeydown}>
                                    <li role="none">
                                      <button
                                        type="button"
                                        role="menuitemradio"
                                        tabindex="-1"
                                        aria-checked=${this.styleTheme === 'modern'}
                                        @click=${() => this.pickStyle('modern')}
                                      >
                                        <span>${t('settings.style_modern')}</span>
                                      </button>
                                    </li>
                                    <li role="none">
                                      <button
                                        type="button"
                                        role="menuitemradio"
                                        tabindex="-1"
                                        aria-checked=${this.styleTheme === 'classic'}
                                        @click=${() => this.pickStyle('classic')}
                                      >
                                        <span>${t('settings.style_classic')}</span>
                                      </button>
                                    </li>
                                  </ul>
                                `
                              : nothing}
                          </li>
                          <li role="separator"></li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              tabindex="-1"
                              @click=${this.handleQuit}
                            >
                              <span>${t('menu.quit')}</span>
                            </button>
                          </li>
                        </ul>
                      `
                    : nothing}
                </li>
              `
            : nothing}

          <!-- Appearance icon -->
          <li role="none">
            <button
              type="button"
              class="menubar-item"
              role="menuitem"
              tabindex=${this.focusedIndex === appearanceIndex ? 0 : -1}
              data-popup="appearance"
              aria-haspopup="menu"
              aria-expanded=${this.open === 'appearance'}
              aria-label=${t('menu.appearance')}
              title=${t('menu.appearance')}
              @keydown=${this.onKeydown}
              @click=${this.toggle('appearance')}
            >
              ${this.renderAppearanceIcon()}
            </button>
            ${this.open === 'appearance'
              ? html`
                  <ul class="dropdown appearance" role="menu" @keydown=${this.onKeydown}>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        tabindex="-1"
                        aria-checked=${this.appearance === 'auto'}
                        @click=${() => this.pickAppearance('auto')}
                      >
                        <svg-icon name="sun-moon" size="2ch"></svg-icon>
                        <span>${t('menu.appearance_auto')}</span>
                      </button>
                    </li>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        tabindex="-1"
                        aria-checked=${this.appearance === 'light'}
                        @click=${() => this.pickAppearance('light')}
                      >
                        <svg-icon name="sun" size="2ch"></svg-icon>
                        <span>${t('settings.theme_light')}</span>
                      </button>
                    </li>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        tabindex="-1"
                        aria-checked=${this.appearance === 'dark'}
                        @click=${() => this.pickAppearance('dark')}
                      >
                        <svg-icon name="moon" size="2ch"></svg-icon>
                        <span>${t('settings.theme_dark')}</span>
                      </button>
                    </li>
                  </ul>
                `
              : nothing}
          </li>

          <!-- Always on top toggle -->
          <li role="none">
            <button
              type="button"
              class="menubar-item ${this.alwaysOnTop ? 'active' : ''}"
              role="menuitemcheckbox"
              tabindex=${this.focusedIndex === pinIndex ? 0 : -1}
              aria-checked=${this.alwaysOnTop}
              aria-label=${t('menu.always_on_top')}
              title=${t('menu.always_on_top')}
              @keydown=${this.onKeydown}
              @click=${this.handleAlwaysOnTop}
            >
              <svg-icon name=${this.alwaysOnTop ? 'pin-filled' : 'pin-off'} size="0.9375rem"></svg-icon>
            </button>
          </li>

          <!-- Settings (rightmost) -->
          <li role="none">
            <button
              type="button"
              class="menubar-item"
              role="menuitem"
              tabindex=${this.focusedIndex === settingsIndex ? 0 : -1}
              aria-label=${t('settings.title')}
              title=${t('settings.title')}
              @keydown=${this.onKeydown}
              @click=${this.handleSettings}
            >
              <svg-icon name="settings" size="0.9375rem"></svg-icon>
            </button>
          </li>
        </ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-menubar': AppMenubar;
  }
}
