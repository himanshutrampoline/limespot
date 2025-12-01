/* global debounce, trapFocus */

if (!customElements.get('cart-items')) {
  class CartItems extends HTMLElement {
    constructor() {
      super();
      if (this.dataset.empty === 'false') this.init();
    }

    init() {
      this.fetchRequestOpts = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      };

      this.cartDrawer = document.getElementById('cart-drawer');
      this.itemStatus = document.getElementById('cart-line-item-status');
      this.currentTotalItemCount = Array.from(this.querySelectorAll('[name="updates[]"]')).reduce(
        (total, quantityInput) => total + parseInt(quantityInput.value, 10),
        0
      );

      this.currentQuantities = [];
      this.querySelectorAll('.cart-item').forEach((item) => {
        this.currentQuantities[item.dataset.variantId] = Number(item.querySelector('.qty-input__input').value);
      });

      this.addEventListener('click', this.handleClick.bind(this));
      this.addEventListener('change', debounce(this.handleChange.bind(this)));
    }

    /**
     * Handles 'click' events on the cart items element.
     * @param {object} evt - Event object.
     */
    handleClick(evt) {
      if (!evt.target.matches('.js-remove-item')) return;
      evt.preventDefault();
      this.updateQuantity(evt.target.dataset.index, 0);
    }

    /**
     * Handles 'change' events on the cart items element.
     * @param {object} evt - Event object.
     */
    handleChange(evt) {
      this.updateQuantity(evt.target.dataset.index, evt.target.value, document.activeElement.name);
    }

    /**
     * Updates the quantity of a line item.
     * @param {number} line - Line item index.
     * @param {number} quantity - Quantity to set.
     * @param {string} name - Active element name.
     */
    async updateQuantity(line, quantity, name) {
      const cartDrawerContent = this.cartDrawer ? this.cartDrawer.querySelector('.drawer__content') : null;
      const cartDrawerContentScroll = cartDrawerContent ? cartDrawerContent.scrollTop : 0;
      const cartDrawerScroll = this.cartDrawer ? this.cartDrawer.scrollTop : 0;

      this.enableLoading(line);

      // clear all errors except this line's (which will be refreshed after this update)
      const lineErrorsId = `line-item-error-${line}`;
      const lineErrors = document.getElementById(lineErrorsId);
      document.querySelectorAll(`.cart-errors, .cart-item__error:not([id="${lineErrorsId}"])`).forEach((el) => {
        el.innerHTML = '';
        el.hidden = true;
      });

      const sections = this.getSectionsToRender().map((section) => section.section);
      this.fetchRequestOpts.body = JSON.stringify({
        line,
        quantity,
        sections: [...new Set(sections)],
        sections_url: window.location.pathname
      });

      try {
        const lineItem = document.getElementById(`cart-item-${line}`);
        const variantId = Number(lineItem.dataset.variantId);
        const oldTotalQuantity = this.currentTotalItemCount;
        const response = await fetch(theme.routes.cartChange, this.fetchRequestOpts);
        const data = await response.json();

        if (!response.ok) throw new Error(data.errors || response.status);

        const newTotalQuantity = data.item_count;

        if (this.cartDrawer) {
          cartDrawerContent.classList.toggle('drawer__content--flex', newTotalQuantity === 0);

          if (newTotalQuantity === 0) {
            const recommendations = this.cartDrawer.querySelector('product-recommendations');
            if (recommendations) recommendations.remove();
          }
        } else if (newTotalQuantity === 0) {
          // We're on the Cart page
          const cartTitle = this.closest('.cc-main-cart').querySelector('.js-cart-title');
          if (cartTitle) cartTitle.style.textAlign = 'center';

          const cartSummaryCss = document.getElementById('cart-summary-css');
          if (cartSummaryCss) cartSummaryCss.remove();

          const cartSummary = document.getElementById('cart-summary');
          if (cartSummary) cartSummary.hidden = true;
        }

        this.getSectionsToRender().forEach((section) => {
          const sectionEl = document.getElementById(section.id);
          if (!sectionEl) return;

          const { selector } = section;
          const el = sectionEl.querySelector(selector) || sectionEl;
          const html = CartItems.getElementHTML(data.sections[section.section], selector);
          // Only update if we got valid HTML back
          if (html !== null && html !== undefined) {
            el.innerHTML = html;
          }
        });

        if (this.cartDrawer && newTotalQuantity === 0) {
          cartDrawerContent.classList.add('grow', 'flex', 'items-center');

          if (this.cartDrawer.querySelector('promoted-products')) {
            this.cartDrawer
              .querySelector('.drawer__content')
              .classList.toggle('drawer__empty-with-promotions', newTotalQuantity === 0);
          }

          // Clear and hide the free-shipping-notice when cart becomes empty
          const freeShippingNotice = document.getElementById('free-shipping-notice');
          if (freeShippingNotice) {
            freeShippingNotice.innerHTML = '';
            freeShippingNotice.style.display = 'none';
          }
        } else if (newTotalQuantity > 0) {
          // When cart has items, ensure the notice is visible (if it exists)
          const freeShippingNotice = document.getElementById('free-shipping-notice');
          if (freeShippingNotice) {
            freeShippingNotice.style.display = '';
          }
        }

        this.updateRecommendations(data.item_count > 0 ? data.items[0].product_id : null);
        this.updateLiveRegions();
        this.setFocus(line, newTotalQuantity, name);
        this.dataset.empty = newTotalQuantity === 0;
        this.currentTotalItemCount = newTotalQuantity;

        // Fire the on:line-item:change event if the line item quantity has changed
        if (oldTotalQuantity !== newTotalQuantity) {
          this.dispatchEvent(new CustomEvent('on:line-item:change', {
            bubbles: true,
            detail: {
              cart: data,
              variantId,
              oldQuantity: this.currentQuantities[variantId],
              newQuantity: Number(quantity)
            }
          }));
        }

        this.currentQuantities[variantId] = Number(quantity);

        lineErrors.innerHTML = '';
        lineErrors.hidden = true;
      } catch (error) {
        if (/^[0-9]+$/.test(error.message)) {
          lineErrors.textContent = theme.strings.cartError;
        } else {
          lineErrors.textContent = error.message;
        }
        lineErrors.hidden = false;
        console.log(error); // eslint-disable-line

        this.querySelectorAll('.cart-item__loader').forEach((loader) => {
          loader.hidden = true;
        });

        this.dispatchEvent(new CustomEvent('on:cart:error', {
          bubbles: true,
          detail: {
            error: error.message
          }
        }));

        const input = document.getElementById(`quantity-${line}`);
        input.value = input.dataset.initialValue;
        input.closest('quantity-input').currentQty = input.dataset.initialValue;
      } finally {
        this.classList.remove('pointer-events-none');

        // Attempt to maintain the same scroll position in the cart drawer
        if (cartDrawerContent) {
          requestAnimationFrame(() => { cartDrawerContent.scrollTop = cartDrawerContentScroll; });
          setTimeout(() => { cartDrawerContent.scrollTop = cartDrawerContentScroll; }, 0);
          requestAnimationFrame(() => { this.cartDrawer.scrollTop = cartDrawerScroll; });
          setTimeout(() => { this.cartDrawer.scrollTop = cartDrawerScroll; }, 0);
        }
      }
    }

    /**
     * Refreshes the cart by rerendering its sections and updating its product recommendations.
     */
    async refresh(retryCount = 0) {
      // If element wasn't initialized (cart was empty), initialize it first
      if (!this.fetchRequestOpts) {
        this.init();
      }

      const errors = document.getElementById('cart-errors');
      if (errors) {
        errors.innerHTML = '';
        errors.hidden = true;
      }

      try {
        const sections = this.getSectionsToRender().map((section) => section.section);
        const response = await fetch(`?sections=${[...new Set(sections)]}`);

        // The status is 400, refresh the whole cart and stop
        if (response.status === 400 && this.cartDrawer) {
          this.cartDrawer.refresh(true);
          return;
        }

        if (!response.ok) {
          // If response is not ok, try refreshing the whole cart drawer
          if (this.cartDrawer) {
            this.cartDrawer.refresh(true);
            return;
          }
          throw new Error(response.status);
        }

        const data = await response.json();

        // Check if we got valid data - if cart was empty and we're adding items,
        // Shopify might need a moment to process. Retry once after a short delay.
        const wasEmpty = this.dataset.empty === 'true';
        const hasValidCartData = data && Object.keys(data).length > 0;
        const hasValidCartItems = this.getSectionsToRender().some(section => {
          const html = CartItems.getElementHTML(data[section.section], section.selector);
          return html !== null && html !== undefined && html.trim() !== '';
        });

        if (wasEmpty && (!hasValidCartData || !hasValidCartItems) && retryCount < 1) {
          // Wait a bit for Shopify to process the cart update, then retry
          await new Promise(resolve => setTimeout(resolve, 300));
          return this.refresh(retryCount + 1);
        }

        // Update sections
        this.getSectionsToRender().forEach((section) => {
          const sectionEl = document.getElementById(section.id);
          if (!sectionEl) return;

          const el = sectionEl.querySelector(section.selector) || sectionEl;
          const html = CartItems.getElementHTML(data[section.section], section.selector);
          
          // Update if we got valid HTML back (including empty strings to clear content)
          if (html !== null && html !== undefined) {
            el.innerHTML = html;
          }
        });

        // Check if cart is now empty or has items
        const hasItems = this.querySelector('.cart-item:first-child') !== null;
        this.dataset.empty = hasItems ? 'false' : 'true';

        // If cart is empty, explicitly clear/hide the free-shipping-notice element
        // The liquid template conditionally renders it, but we need to ensure it's cleared
        if (!hasItems) {
          const freeShippingNotice = document.getElementById('free-shipping-notice');
          if (freeShippingNotice) {
            // Clear the content - when cart is empty, the liquid template won't render the notice
            freeShippingNotice.innerHTML = '';
            // Also hide it to be safe
            freeShippingNotice.style.display = 'none';
          }
        } else {
          // When cart has items, ensure the notice is visible (if it exists)
          const freeShippingNotice = document.getElementById('free-shipping-notice');
          if (freeShippingNotice) {
            freeShippingNotice.style.display = '';
          }
        }

        // Update cart drawer content classes based on empty state
        if (this.cartDrawer) {
          const cartDrawerContent = this.cartDrawer.querySelector('.drawer__content');
          const cartDrawerContentInner = this.cartDrawer.querySelector('.cart-drawer__content');
          
          if (cartDrawerContent) {
            cartDrawerContent.classList.toggle('drawer__content--flex', !hasItems);
            cartDrawerContent.classList.toggle('drawer__empty-with-promotions', !hasItems && this.cartDrawer.querySelector('promoted-products'));
          }
          
          if (cartDrawerContentInner) {
            cartDrawerContentInner.classList.toggle('grow', !hasItems);
            cartDrawerContentInner.classList.toggle('flex', !hasItems);
            cartDrawerContentInner.classList.toggle('items-center', !hasItems);
          }

          // Update checkout button disabled state
          const checkoutButton = this.cartDrawer.querySelector('button[name="checkout"]');
          if (checkoutButton) {
            if (hasItems) {
              checkoutButton.removeAttribute('disabled');
            } else {
              checkoutButton.setAttribute('disabled', 'disabled');
            }
          }
        }

        // Update recommendations
        const firstCartItem = this.querySelector('.cart-item:first-child');
        this.updateRecommendations(firstCartItem ? firstCartItem.dataset.productId : null);

        // Update current quantities for initialized cart
        if (hasItems && this.fetchRequestOpts) {
          this.currentQuantities = [];
          this.querySelectorAll('.cart-item').forEach((item) => {
            const qtyInput = item.querySelector('.qty-input__input');
            if (qtyInput) {
              this.currentQuantities[item.dataset.variantId] = Number(qtyInput.value);
            }
          });
          
          this.currentTotalItemCount = Array.from(this.querySelectorAll('[name="updates[]"]')).reduce(
            (total, quantityInput) => total + parseInt(quantityInput.value, 10),
            0
          );
        }

        if (errors) {
          errors.innerHTML = '';
          errors.hidden = true;
        }
      } catch (error) {
        if (errors) {
          errors.textContent = theme.strings.cartError;
          errors.hidden = false;
        }
        console.log(error); // eslint-disable-line

        this.dispatchEvent(new CustomEvent('on:cart:error', {
          bubbles: true,
          detail: {
            error: error.message
          }
        }));
      }
    }

    /**
     * Returns an array of objects containing required section details.
     * @returns {Array}
     */
    getSectionsToRender() {
      let sections = [
        {
          id: 'cart-icon-bubble',
          section: 'cart-icon-bubble',
          selector: '.shopify-section'
        },
        {
          id: 'free-shipping-notice',
          section: 'free-shipping-notice',
          selector: '.free-shipping-notice'
        }
      ];

      if (this.cartDrawer) {
        const cartDrawerId = this.cartDrawer.closest('.shopify-section').id.replace('shopify-section-', '');
        sections = [
          ...sections,
          {
            id: 'cart-items',
            section: cartDrawerId,
            selector: 'cart-items'
          },
          {
            id: 'cart-promoted-products',
            section: cartDrawerId,
            selector: '#cart-promoted-products'
          },
          {
            id: 'cart-drawer',
            section: cartDrawerId,
            selector: '.cart-drawer__summary'
          },
          {
            id: 'cart-drawer-media-promotion',
            section: cartDrawerId,
            selector: '#cart-drawer-media-promotion'
          }
        ];
      } else {
        sections = [
          ...sections,
          {
            id: 'cart-items',
            section: this.dataset.section,
            selector: 'cart-items'
          },
          {
            id: 'cart-summary',
            section: document.getElementById('cart-summary').dataset.section,
            selector: '.cart__summary'
          }
        ];
      }

      return sections;
    }

    /**
     * Gets the innerHTML of an element.
     * @param {string} html - Section HTML.
     * @param {string} selector - CSS selector for the element to get the innerHTML of.
     * @returns {string|null}
     */
    static getElementHTML(html, selector) {
      // Handle empty or missing HTML from section response
      if (!html || html.trim() === '') {
        console.warn('Cart section returned empty HTML for:', selector);
        return null;
      }

      const tmpl = document.createElement('template');
      tmpl.innerHTML = html;

      const el = tmpl.content.querySelector(selector);
      if (!el) {
        console.warn('Cart section selector not found:', selector);
        return null;
      }

      return el.innerHTML;
    }

    /**
     * Shows a loading icon over a line item.
     * @param {string} line - Line item index.
     */
    enableLoading(line) {
      this.classList.add('pointer-events-none');

      const loader = this.querySelector(`#cart-item-${line} .cart-item__loader`);
      if (loader) loader.hidden = false;

      document.activeElement.blur();
      if (this.itemStatus) this.itemStatus.setAttribute('aria-hidden', 'false');
    }

    /**
     * Updates the cart recommendations.
     * @param {string} productId - The product id for which to find recommendations.
     */
    updateRecommendations(productId) {
      this.recommendations = this.recommendations || document.getElementById('cart-recommendations');
      if (!this.recommendations) return;

      if (productId) {
        this.recommendations.dataset.productId = productId;
        this.recommendations.init();
      } else {
        this.recommendations.innerHTML = '';
      }
    }

    /**
     * Updates the live regions.
     */
    updateLiveRegions() {
      this.itemStatus.setAttribute('aria-hidden', 'true');

      const cartStatus = document.getElementById('cart-live-region-text');
      cartStatus.setAttribute('aria-hidden', 'false');

      setTimeout(() => {
        cartStatus.setAttribute('aria-hidden', 'true');
      }, 1000);
    }

    /**
     * Traps focus in the relevant container or focuses the active element.
     * @param {number} line - Line item index.
     * @param {number} itemCount - Item count.
     * @param {string} name - Active element name.
     */
    setFocus(line, itemCount, name) {
      const lineItem = document.getElementById(`cart-item-${line}`);
      let activeEl;

      if (lineItem) {
        activeEl = lineItem.querySelector(`[name="${name}"]`);
      }

      if (this.cartDrawer) {
        if (lineItem && activeEl) {
          trapFocus(this.cartDrawer, activeEl);
        } else if (itemCount === 0) {
          trapFocus(
            this.cartDrawer.querySelector('.js-cart-empty'),
            this.cartDrawer.querySelector('a')
          );
        } else if (this.cartDrawer.querySelector('.cart-item')) {
          trapFocus(this.cartDrawer, document.querySelector('.js-item-name'));
        }
      } else if (lineItem && activeEl) {
        activeEl.focus();
      }
    }
  }

  customElements.define('cart-items', CartItems);
}





// ✅ Put this AFTER the block that defines the element
// Safely expose the constructor (works whether the block ran or not)
window.CartItems = customElements.get('cart-items');

document.addEventListener('dispatch:cart-items:refresh', async () => {
  const cartItemsEl = document.querySelector('cart-items');
  if (!cartItemsEl) return;

  try {
    const sectionName = cartItemsEl.dataset.section; // e.g. "main-cart-drawer"
    const res = await fetch(`?sections=${sectionName}`);
    const data = await res.json();

    // Replace ONLY the cart items HTML
    const html = window.CartItems.getElementHTML(
      data[sectionName],
      'cart-items'
    );
    // Only update if we got valid HTML back
    if (html !== null && html !== undefined) {
      cartItemsEl.innerHTML = html;
    }
  } catch (err) {
    console.error('Cart line items refresh failed:', err);
  }
});


