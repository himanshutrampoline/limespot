/**
 * EXTRACTED FROM main.js - Essential Functions for Add-to-Cart Functionality
 *
 * This file contains only the essential parts from main.js that are required
 * for the add-to-cart and cart refresh functionality to work properly.
 *
 * These functions and classes are dependencies for:
 * - product-form.js
 * - cart-drawer.js
 * - cart-items.js
 * - quick-add.js
 */

/**
 * Returns a function that as long as it continues to be invoked, won't be triggered.
 * @param {Function} fn - Callback function.
 * @param {number} [wait=300] - Delay (in milliseconds).
 * @returns {Function}
 */
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Focus trap handlers object (shared across all focus trap instances).
 */
const trapFocusHandlers = {};

/**
 * Removes focus trap event listeners and optionally focuses an element.
 * @param {Element} [elementToFocus=null] - Element to focus when trap is removed.
 */
function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

/**
 * Traps focus within a container, e.g. modal or side drawer.
 * @param {Element} container - Container element to trap focus within.
 * @param {Element} [elementToFocus=container] - Initial element to focus when trap is applied.
 */
function trapFocus(container, elementToFocus = container) {
  const focusableEls = Array.from(
    container.querySelectorAll(
      'summary, a[href], area[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), object, iframe, audio[controls], video[controls], [tabindex]:not([tabindex^="-"])'
    )
  );

  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (evt) => {
    if (
      evt.target !== container &&
      evt.target !== lastEl &&
      evt.target !== firstEl
    )
      return;
    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = () => {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = (evt) => {
    if (evt.code !== "Tab") return;

    // If tab pressed on last focusable element, focus the first element.
    if (evt.target === lastEl && !evt.shiftKey) {
      evt.preventDefault();
      firstEl.focus();
    }

    //  If shift + tab pressed on the first focusable element, focus the last element.
    if ((evt.target === container || evt.target === firstEl) && evt.shiftKey) {
      evt.preventDefault();
      lastEl.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  (elementToFocus || container).focus();
}

/**
 * Base class for side drawer components (cart drawer, quick-add drawer, etc.)
 * This class provides the core open/close functionality for drawer components.
 */
class SideDrawer extends HTMLElement {
  constructor() {
    super();
    this.overlay = document.querySelector(".js-overlay");
  }

  /**
   * Handles a 'click' event on the drawer.
   * @param {object} evt - Event object.
   */
  handleClick(evt) {
    if (evt.target.matches(".js-close-drawer") || evt.target === this.overlay) {
      this.close();
    }
  }

  /**
   * Opens the drawer.
   * @param {Element} [opener] - Element that triggered opening of the drawer.
   * @param {Element} [elementToFocus] - Element to focus after drawer opened.
   * @param {Function} [callback] - Callback function to trigger after the open has completed
   */
  open(opener, elementToFocus, callback) {
    this.dispatchEvent(
      new CustomEvent(`on:${this.dataset.name}:before-open`, {
        bubbles: true,
      })
    );

    // Prevent page behind from scrolling when side drawer is open.
    this.scrollY = window.scrollY;
    document.body.classList.add("fixed");
    document.body.style.top = `-${this.scrollY}px`;
    document.documentElement.style.height = "100svh";

    this.overlay.classList.add("is-visible");
    this.setAttribute("open", "");
    this.setAttribute("aria-hidden", "false");
    this.opener = opener;

    trapFocus(this, elementToFocus);

    // Create event handler variables (so the bound event listeners can be removed).
    this.clickHandler = this.clickHandler || this.handleClick.bind(this);
    this.keyupHandler = (evt) => {
      if (evt.key !== "Escape" || evt.target.closest(".cart-drawer-popup"))
        return;
      this.close();
    };

    // Add event listeners (for while drawer is open).
    this.addEventListener("click", this.clickHandler);
    this.addEventListener("keyup", this.keyupHandler);
    this.overlay.addEventListener("click", this.clickHandler);

    // Handle events after the drawer opens
    const transitionDuration = parseFloat(
      getComputedStyle(this).getPropertyValue("--longest-transition-in-ms")
    );
    setTimeout(() => {
      if (callback) callback();
      this.dispatchEvent(
        new CustomEvent(`on:${this.dataset.name}:after-open`, {
          bubbles: true,
        })
      );
    }, transitionDuration);
  }

  /**
   * Closes the drawer.
   * @param {Function} [callback] - Call back function to trigger after the close has completed
   */
  close(callback) {
    this.dispatchEvent(
      new CustomEvent(`on:${this.dataset.name}:before-close`, {
        bubbles: true,
      })
    );

    this.removeAttribute("open");
    this.setAttribute("aria-hidden", "true");
    this.overlay.classList.remove("is-visible");

    removeTrapFocus(this.opener);

    // Restore page position and scroll behaviour.
    document.documentElement.style.height = "";
    document.body.style.top = "";
    document.body.classList.remove("fixed");
    window.scrollTo(0, this.scrollY);

    // Remove event listeners added on drawer opening.
    this.removeEventListener("click", this.clickHandler);
    this.removeEventListener("keyup", this.keyupHandler);
    this.overlay.removeEventListener("click", this.clickHandler);

    // Handle events after the drawer closes
    const transitionDuration = parseFloat(
      getComputedStyle(this).getPropertyValue("--longest-transition-in-ms")
    );
    setTimeout(() => {
      if (callback) callback();
      this.dispatchEvent(
        new CustomEvent(`on:${this.dataset.name}:after-close`, {
          bubbles: true,
        })
      );
    }, transitionDuration);
  }
}

// Register the SideDrawer custom element
customElements.define("side-drawer", SideDrawer);

/**
 * NOTE: theme.routes and theme.settings are NOT defined in main.js
 *
 * They are defined in layout/theme.liquid (around line 512-600) as:
 *
 * window.theme = {
 *   routes: {
 *     cart: '{{ routes.cart_url }}',
 *     cartAdd: '{{ routes.cart_add_url }}',
 *     cartChange: '{{ routes.cart_change_url }}',
 *     cartUpdate: '{{ routes.cart_update_url }}',
 *     predictiveSearch: '{{ routes.predictive_search_url }}'
 *   },
 *   settings: {
 *     moneyFormat: {{ shop.money_format | json }},
 *     moneyWithCurrencyFormat: {{ shop.money_with_currency_format | json }},
 *     currencyCode: {{ cart.currency.iso_code | default: shop.currency | json }},
 *     locale: {{ request.locale.iso_code | json }},
 *     vibrateOnATC: {{ settings.vibrate_on_atc | json }},
 *     afterAtc: {{ settings.after_add_to_cart | json }},  // 'drawer', 'page', or 'no-js'
 *     cartType: {{ settings.cart_type | json }},
 *     // ... other settings
 *   },
 *   strings: {
 *     cartError: '{{ "cart.general.error" | t }}',
 *     // ... other strings
 *   },
 *   scripts: {
 *     cartItems: '{{ "cart-items.js" | asset_url }}',
 *     // ... other script URLs
 *   }
 * };
 */
