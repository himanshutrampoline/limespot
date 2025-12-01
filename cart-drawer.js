/**
 * Loads a script.
 * @param {string} src - Url of script to load.
 * @returns {Promise}
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

/* global DetailsDisclosure, trapFocus, removeTrapFocus */

if (!customElements.get('cart-drawer-disclosure')) {
  class CartDrawerDisclosure extends DetailsDisclosure {
    constructor() {
      super();
      this.openBtn = this.querySelector('summary');
      this.closeBtn = this.querySelector('.js-close');
      this.overlay = document.getElementById('cart-drawer').querySelector('.overlay');
    }

    /**
     * Handles 'click' events on the custom element.
     * @param {object} evt - Event object.
     */
    handleClick(evt) {
      if (!evt.target.matches('.js-close')) return;
      this.close();
    }

    /**
     * Opens the details element.
     */
    open() {
      this.overlay.classList.add('is-visible');
      super.open();
      trapFocus(this);
      


      // Create event handler variables (so the bound event listeners can be removed).
      this.clickHandler = this.clickHandler || this.handleClick.bind(this);
      this.keyupHandler = (evt) => evt.key === 'Escape' && this.close();

      // Add event listeners (for while disclosure is open).
      this.addEventListener('click', this.clickHandler);
      this.addEventListener('keyup', this.keyupHandler);
      this.overlay.addEventListener('click', this.clickHandler);
    }

    /**
     * Closes the details element.
     */
    close() {
      this.overlay.classList.remove('is-visible');
      super.close();
      removeTrapFocus(this.openBtn);

      this.removeEventListener('click', this.clickHandler);
      this.removeEventListener('keyup', this.keyupHandler);
      this.overlay.removeEventListener('click', this.clickHandler);
    }
  }

  customElements.define('cart-drawer-disclosure', CartDrawerDisclosure);
}

/* global SideDrawer */

if (!customElements.get('cart-drawer')) {
  class CartDrawer extends SideDrawer {
    constructor() {
      super();

      this.cartSummary = this.querySelector('.cart-drawer__summary');
      this.init();
      this.bindEvents();
    }

    disconnectedCallback() {
      document.removeEventListener('dispatch:cart-drawer:refresh', this.refreshHandler);
      document.removeEventListener('on:bfcache:load-restore', this.refreshHandler);
      document.removeEventListener('dispatch:cart-drawer:open', this.openDrawerViaEventHandler);
      document.removeEventListener('dispatch:cart-drawer:close', this.closeDrawerViaEventHandler);

      if (Shopify.designMode) {
        document.removeEventListener('shopify:section:select', this.sectionSelectHandler);
        document.removeEventListener('shopify:section:deselect', this.sectionDeselectHandler);
      }

      if (this.dcbLoadedHandler) {
        document.removeEventListener('shopify:payment_button:loaded', this.dcbLoadedHandler);
      }
    }

    init() {
      const cartIcon = document.getElementById('cart-icon');
      if (cartIcon) {
        cartIcon.setAttribute('role', 'button');
        cartIcon.setAttribute('aria-haspopup', 'dialog');

        cartIcon.addEventListener('click', (evt) => {
          evt.preventDefault();
          this.open(cartIcon);
        });

        cartIcon.addEventListener('keydown', (evt) => {
          if (evt.key !== ' ') return;
          evt.preventDefault();
          this.open(cartIcon);
        });
      }
    }

    bindEvents() {
      if (Shopify.designMode) {
        this.sectionSelectHandler = this.handleSectionSelect.bind(this);
        this.sectionDeselectHandler = this.handleSectionDeselect.bind(this);
        document.addEventListener('shopify:section:select', this.sectionSelectHandler);
        document.addEventListener('shopify:section:deselect', this.sectionDeselectHandler);
      }

      this.openDrawerViaEventHandler = this.handleDrawerOpenViaEvent.bind(this);
      this.closeDrawerViaEventHandler = this.close.bind(this, null);
      document.addEventListener('dispatch:cart-drawer:open', this.openDrawerViaEventHandler);
      document.addEventListener('dispatch:cart-drawer:close', this.closeDrawerViaEventHandler);

      if (this.cartSummary.classList.contains('cart-drawer--checkout--sticky-true')) {
        this.dcbLoadedHandler = this.dcbLoadedHandler || CartDrawer.recalculateCssVarHeights;
        document.addEventListener('shopify:payment_button:loaded', this.dcbLoadedHandler);
      }

      this.refreshHandler = this.refresh.bind(this);
      document.addEventListener('dispatch:cart-drawer:refresh', this.refreshHandler);
      document.addEventListener('on:bfcache:load-restore', this.refreshHandler);
    }

    /**
     * Handle when the section is selected in the Theme Editor
     * @param {object} evt - Event object.
     */
    handleSectionSelect(evt) {
      if (evt.target === this.closest('.shopify-section')) this.open();
    }

    /**
     * Handle when the section is de-selected in the Theme Editor
     * @param {object} evt - Event object.
     */
    handleSectionDeselect(evt) {
      if (evt.target === this.closest('.shopify-section')) this.close();
    }

    /**
     * Handle when the drawer is opened via an event
     * @param {object} evt - Event object.
     */
    handleDrawerOpenViaEvent(evt) {
      this.open(evt.detail ? evt.detail.opener : null);
    }

    /**
     * Opens the drawer.
     * @param {Element} [opener] - Element that triggered opening of the drawer.
     * @param {Element} [elementToFocus] - Element to focus after drawer opened.
     */
    open(opener, elementToFocus) {
      // Get the quick add drawer web component, if it's currently open and close it
      const quickAddDrawer = document.querySelector('quick-add-drawer[aria-hidden="false"]');
      const overlay = document.querySelector('.js-overlay.is-visible');

      if (quickAddDrawer) {
        if (overlay) overlay.style.transitionDelay = '200ms';
        quickAddDrawer.close();
        
          
      }

      // If the cart drawer is open, wait a few ms for a more optimal ux/animation
      setTimeout(() => {
        super.open(opener, elementToFocus, () => {
          if (this.cartSummary.classList.contains('cart-drawer--checkout--sticky-true')) {
            CartDrawer.recalculateCssVarHeights();
          }
        });

        if (this.cartSummary.classList.contains('cart-drawer--checkout--sticky-true')) {
          CartDrawer.recalculateCssVarHeights();
        }

        if (overlay) overlay.style.transitionDelay = '';
      }, quickAddDrawer ? 200 : 0);
    }

    /**
     * Attempts to refresh any cart items (if present). Failing that, it refreshes the entire cart
     * drawer
     * @param {boolean} [dontRefreshCartItems=false] - Prevents the refresh of cart items, and does
     * a straight refresh of the whole cart
     */
    async refresh(dontRefreshCartItems) {
      try {
        const cartItems = this.querySelector('cart-items');
        if (cartItems && !dontRefreshCartItems) {
          await cartItems.refresh();
          
          // After refresh, update cart drawer state based on cart items
          const hasItems = cartItems.querySelector('.cart-item:first-child') !== null;
          this.updateCartDrawerState(hasItems);
        } else {
          const response = this.getSectionsToRender().map((section) => section.section);
          const cartResponse = await fetch(`?sections=${response.join(',')}`);
          
          if (!cartResponse.ok) {
            throw new Error(`Cart refresh failed: ${cartResponse.status}`);
          }
          
          const sections = await cartResponse.json();
          this.renderContents({ sections }, false);
          
          // Update cart drawer state after full refresh
          const cartItemsAfterRefresh = this.querySelector('cart-items');
          const hasItems = cartItemsAfterRefresh && cartItemsAfterRefresh.querySelector('.cart-item:first-child') !== null;
          this.updateCartDrawerState(hasItems);
          
          CartDrawer.recalculateCssVarHeights();
        }
      } catch (error) {
        console.log(error); // eslint-disable-line
        this.dispatchEvent(new CustomEvent('on:cart:error', {
          bubbles: true,
          detail: {
            error: this.errorMsg?.textContent || error.message
          }
        }));
      }
    }

    /**
     * Updates cart drawer UI state based on whether cart has items
     * @param {boolean} hasItems - Whether the cart has items
     */
    updateCartDrawerState(hasItems) {
      const cartDrawerContent = this.querySelector('.drawer__content');
      const cartDrawerContentInner = this.querySelector('.cart-drawer__content');
      const checkoutButton = this.querySelector('button[name="checkout"]');
      
      if (cartDrawerContent) {
        cartDrawerContent.classList.toggle('drawer__content--flex', !hasItems);
      }
      
      if (cartDrawerContentInner) {
        cartDrawerContentInner.classList.toggle('grow', !hasItems);
        cartDrawerContentInner.classList.toggle('flex', !hasItems);
        cartDrawerContentInner.classList.toggle('items-center', !hasItems);
      }
      
      if (checkoutButton) {
        if (hasItems) {
          checkoutButton.removeAttribute('disabled');
        } else {
          checkoutButton.setAttribute('disabled', 'disabled');
        }
      }
    }

    /**
     * Renders the contents of the specified sections to update.
     * @param {object} data - Cart data object.
     * @param {boolean} [openDrawer=true] - Open the cart drawer after rendering sections.
     */
    async renderContents(data, openDrawer = true) {
      if (!this.scriptsLoaded) {
        if (!document.querySelector(`script[src="${theme.scripts.cartItems}"]`)) {
          await loadScript(theme.scripts.cartItems);
        }

        if (!document.querySelector(`script[src="${theme.scripts.shippingCalculator}"]`) && this.dataset.shippingCalculator) {
          await loadScript(theme.scripts.countryProvinceSelector);
          await loadScript(theme.scripts.shippingCalculator);
        }

        this.scriptsLoaded = true;
      }

      // this.getSectionsToRender().forEach((section) => {
      //   const el = document.getElementById(section.id);
      //   if (el) {
      //     el.innerHTML = CartDrawer.getElementHTML(
      //       data.sections[section.section],
      //       section.selector
      //     );
      //   }
      // });

      this.getSectionsToRender().forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) {
          const html = this.constructor.getElementHTML(
            data.sections[section.section],
            section.selector
          );
          // Only update if we got valid HTML back
          if (html !== null && html !== undefined) {
            el.innerHTML = html;
          }
        }
      });

      if (openDrawer && this.getAttribute('open') === null) {
        setTimeout(() => this.open());
      }
    }

    /**
     * Returns an array of objects containing required section details.
     * @returns {Array}
     */
    getSectionsToRender() {
      return [
        {
          id: 'cart-drawer',
          section: this.closest('.shopify-section').id.replace('shopify-section-', ''),
          selector: 'cart-drawer'
        },
        {
          id: 'cart-icon-bubble',
          section: 'cart-icon-bubble',
          selector: '.shopify-section'
        }
      ];
    }

    /**
     * Dispatches an event to recalculate the data-css-var-heights on the page. Useful for
     * updating the height of the sticky cart buttons
     */
    static recalculateCssVarHeights() {
      window.requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('on:css-var-height:update'));
      });
    }

    /**
     * Gets the innerHTML of an element.
     * @param {string} html - Section HTML.
     * @param {string} selector - CSS selector for the element.
     * @returns {string}
    //  */
    // static getElementHTML(html, selector) {
    //   const tmpl = document.createElement('template');
    //   tmpl.innerHTML = html;

    //   return tmpl.content.querySelector(selector).innerHTML;
    // }
    static getElementHTML(html, selector) {
      // Handle empty or missing HTML from section response
      if (!html || html.trim() === '') {
        console.warn('Cart section returned empty HTML for:', selector);
        return null;
      }
  
      const tmpl = document.createElement('template');
      tmpl.innerHTML = html;
  
      const element = tmpl.content.querySelector(selector);
      if (!element) {
        console.warn('Cart section selector not found:', selector);
        return null;
      }

      return element.innerHTML;
    }
  }

  customElements.define('cart-drawer', CartDrawer);
}
