This document lists all files involved in the add-to-cart functionality and cart refresh mechanism in this Shopify theme.

**Core JavaScript Files**
-------------------------

### **1\. product-form.js**

*   **Location**: product-form.js
    
*   **Purpose**: Main handler for add-to-cart button clicks on Product Detail Pages (PDP)
    
*   **Key Functions**:
    
    *   handleSubmit() - Intercepts form submission, prevents default, handles AJAX add-to-cart
        
    *   updateCartIcon() - Updates cart icon count in header
        
    *   Dispatches custom events: on:cart:add, on:line-item:change, on:cart:error
        
*   **Critical for**: Understanding how products are added to cart
    

### **2\. cart-drawer.js**

*   **Location**: cart-drawer.js
    
*   **Purpose**: Manages the cart drawer (side panel) functionality
    
*   **Key Functions**:
    
    *   renderContents() \- Updates cart drawer HTML after add-to-cart
        
    *   refresh() \- Refreshes cart drawer contents
        
    *   open() - Opens the cart drawer
        
*   **Critical for:** Understanding how cart UI updates after add-to-cart
    

### **3\. cart-items.js**

*   **Location**: cart-items.js
    
*   **Purpose**: Manages cart items, quantity updates, and cart refresh
    
*   **Key Functions:**
    
    *   refresh() - Refreshes cart items HTML
        
    *   updateQuantity() **-** Updates line item quantities
        
    *   Dispatches custom events: on:line-item:change, on:cart:error
        
*   **Critical for:** Understanding cart item updates and refresh mechanism
    

### **4\. quick-add.js**

*   **Location:** quick-add.js
    
*   **Purpose:** Handles quick-add-to-cart from product cards/collections
    
*   **Key Functions:**
    
    *   open() - Opens quick-add drawer
        
    *   addedToCart() - Called after successful add-to-cart
        
*   **Critical for:** Understanding quick-add functionality (used in "bought together" widgets)
    

### **5\. quantity-input.js**

*   **Location:** quantity-input.js
    
*   **Purpose:** Handles quantity input controls (+/- buttons)
    
*   **Key Functions:**
    
    *   handleClick() - Handles quantity button clicks
        
*   **Note:** Less critical but may be relevant for quantity changes
    

### **6\. side-drawer.js (Base Class)**

*   **Location:** side-drawer.js
    
*   **Purpose:** Base class for drawer components (cart-drawer and quick-add-drawer extend this)
    
*   **Key Functions:**
    
    *   open() - Base drawer open functionality
        
    *   close() - Base drawer close functionality
        
*   **Note:** Provides base functionality for drawers
    

### **7\. main-extracted-for-cart.js (Extracted Utilities)**

*   **Location:** main-extracted-for-cart.js
    
*   **Purpose:** Essential utility functions extracted from main.js
    
*   **Contains:**
    
    *   SideDrawer class - Base class for drawer components
        
    *   trapFocus() and removeTrapFocus() functions - Focus management for drawers
        
    *   debounce() function - Debounce utility
        
    *   Documentation about theme.routes and theme.settings (defined in theme.liquid)
        
*   **Note:** This is a clean extraction of only the necessary parts from main.js (2000+ lines)
    

**Custom Events Dispatched**
----------------------------

The theme dispatches these custom events that Limespot may need to listen to:

1.  **on:cart:add -** Fires when a new variant is added to cart
    
    *   Detail: { cart, variantId }
        
2.  **on:line-item:change -** Fires when quantity of existing item changes
    
    *   Detail: { cart, variantId, oldQuantity, newQuantity }
        
3.  **on:cart:error -** Fires when cart operation fails
    
    *   Detail: { error }
        
4.  **dispatch:cart-drawer:refresh -** Can be dispatched to trigger cart refresh
    
    *   Usage: document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh'))
        
5.  **dispatch:cart-drawer:open -** Can be dispatched to open cart drawer
    
    *   Usage: document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:open'))
        

**Theme Configuration**
-----------------------

The theme uses these configuration objects (defined in layout/theme.liquid, NOT in main.js):

*   **theme.routes.cart -** Cart page URL
    
*   **theme.routes.cartAdd -** Add to cart endpoint
    
*   **theme.routes.cartChange -** Change cart endpoint
    
*   **theme.settings.afterAtc -** Behavior after add-to-cart ('drawer', 'page', or 'no-js')
    
*   **theme.settings.vibrateOnATC -** Haptic feedback setting
    

**Flow Summary**
----------------

1.  User clicks "Add to Cart" button
    
2.  product-form.js intercepts the form submit
    
3.  Makes AJAX POST to theme.routes.cartAdd
    
4.  Updates cart icon bubble
    
5.  Refreshes cart drawer (if open) or opens it (based on settings)
    
6.  Dispatches on:cart:add or on:line-item:change event
    
7.  Cart drawer calls cart-items.refresh() to update cart contents
    

**Integration Points**
----------------------

**Bought Together** widget should:

*   Listen to cart events:
    
```
document.addEventListener('on:cart:add', (event) => {

  // Update widget after item added

  const { cart, variantId } = event.detail;

});
```

*   Trigger cart refresh (if needed):
```
document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh'));
```
    
*   Use same add-to-cart mechanism:
    
    *   Use custom element
        
    *   Or trigger form submission on existing product forms
        
    *   Ensure proper variant selection
        
*   Handle cart drawer opening:
```
document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:open'));
```
    

**Notes**
---------

*   The theme uses Web Components (custom elements)
    
*   Cart operations use Shopify's AJAX Cart API
    
*   Section-based rendering for cart updates
    
*   Custom events for extensibility