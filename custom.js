/**
 * JAVASCRIPT DEVELOPER DOCUMENTATION
 *
 * Enterprise is a powerful and customizable theme designed for large-scale e-commerce stores. Built
 * using Web Components, it offers a highly modular architecture that makes customization and
 * maintenance easier than ever. In addition, Enterprise is optimized for speed, ensuring that your
 * store runs as fast as possible to provide your customers with a seamless shopping experience.
 *
 * If you would like to add your own JS to Enterprise, we recommend using this file and referencing
 * it using Theme Settings > Advanced > Custom HTML.
 *
 * As a brief overview, Enterprise:
 *  - Broadcasts many JS events.
 *  - Is built using Web Components.
 *  - Follows a 'code splitting' architecture.
 *  - Is completely custom built (no JS libraries other than instant.page)
 *  - Has a number of JS utilities.
 *
 *
 *
 * =================================================================================================
 * Custom JavaScript Events
 * =================================================================================================
 *
 * Enterprise broadcasts many custom events for ease of extensibility, detailed in this section.
 *
 * When in the Theme Editor, the details of each custom event will be logged out in the Dev Tools
 * console everytime it is triggered.
 *
 * Events are named in the following convention: ["on/dispatch"]:[subject]:[action] (where
 * 'dispatch' will trigger an event to occur, and 'on' indicates an event has occurred).
 *
 * All 'Return data' detailed in this section is returned within the 'event.detail' object.
 *
 * The available events are:
 *  1.  on:variant:change
 *  2.  on:cart:add
 *  3.  on:cart:error
 *  4.  on:line-item:change
 *  5.  on:cart-drawer:before-open
 *  6.  on:cart-drawer:after-open
 *  7.  on:cart-drawer:after-close
 *  8.  on:quickbuy:before-open
 *  9.  on:quickbuy:after-open
 *  10. on:quickbuy:after-close
 *  11. dispatch:cart-drawer:open
 *  12. dispatch:cart-drawer:refresh
 *  13. dispatch:cart-drawer:close
 *  14. on:debounced-resize
 *  15. on:breakpoint-change
 *
 * -------------------------------------------------------------------------------------------------
 * 1) on:variant:change
 * -------------------------------------------------------------------------------------------------
 * Fires whenever a variant is selected (e.g. Product page, Quickbuy, Featured Product etc).
 *
 * How to listen:
 * document.addEventListener('on:variant:change', (event) => {
 *  // your code here
 * });
 *
 * Returned data:
 *  - form: the product form content
 *  - variant: the selected variant object
 *  - product: the product object (includes a list of all variants)
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 2) on:cart:add
 * -------------------------------------------------------------------------------------------------
 * Fires when a variant has been added to the cart, where it didn't exist in the cart before. This
 * event does not fire when the added variant was already in the cart. To listen for this, see the
 * on:line-item:change event.
 *
 * How to listen:
 * document.addEventListener('on:cart:add', (event) => {
 *   // your code here
 * });
 *
 * Returned data:
 *   - cart: the new cart object after the variant was added
 *   - variantId: id of the variant that was just added to the cart
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 3) on:line-item:change
 * -------------------------------------------------------------------------------------------------
 * Fires when the quantity of an item already in the cart is updated. Note, if the 'newQuantity' is
 * 0, this indicates the item was removed from that cart.
 *
 * Note, when adding a variant to the cart - this event will fire if that variant is already in the
 * cart (i.e. the quantity is incremented). In this situation, 'on:cart:add' will not fire.
 *
 * How to listen:
 * document.addEventListener('on:line-item:change', (event) => {
 *   // your code here
 * });
 *
 * Returned data:
 *   - cart: the new cart object after the quantity change was completed
 *   - variantId: id of the variant that was just updated
 *   - newQuantity: new quantity of the line item
 *   - oldQuantity: old quantity of the line item
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 4) on:cart:error
 * -------------------------------------------------------------------------------------------------
 * Fires when an action related to the cart has failed, for example adding too much quantity of an
 * item to the cart.
 *
 * How to listen:
 * document.addEventListener('on:cart:error', (event) => {
 *   // your code here
 * });
 *
 * Returned data:
 *   - error: the error message
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 5) on:cart-drawer:before-open
 * -------------------------------------------------------------------------------------------------
 * Fires before the cart drawer opens.
 *
 * How to listen:
 * document.addEventListener('on:cart-drawer:before-open', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 6) on:cart-drawer:after-open
 * -------------------------------------------------------------------------------------------------
 * Fires after the cart drawer has finished opening.
 *
 * How to listen:
 * document.addEventListener('on:cart-drawer:after-open', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 7) on:cart-drawer:after-close
 * -------------------------------------------------------------------------------------------------
 * Fires after the cart drawer has finished closing.
 *
 * How to listen:
 * document.addEventListener('on:cart-drawer:after-close', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 8) on:quickbuy:before-open
 * -------------------------------------------------------------------------------------------------
 * Fires before the quick buy drawer opens.
 *
 * How to listen:
 * document.addEventListener('on:quickbuy:before-open', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 9) on:quickbuy:after-open
 * -------------------------------------------------------------------------------------------------
 * Fires after the quick buy drawer has finished opening.
 *
 * How to listen:
 * document.addEventListener('on:quickbuy:after-open', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 10) on:quickbuy:after-close
 * -------------------------------------------------------------------------------------------------
 * Fires after the quick buy drawer has finished closing.
 *
 * How to listen:
 * document.addEventListener('on:quickbuy:after-close', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 11) dispatch:cart-drawer:open
 * -------------------------------------------------------------------------------------------------
 * Opens the cart drawer (if enabled in the Theme Settings).
 *
 * How to trigger:
 * document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:open'));
 *
 * You can optionally pass in a 'detail' object with a property of 'opener', which specifies the DOM
 * element that should be focussed on when the drawer is closed.
 *
 * Example:
 * document.getElementById('header-search').addEventListener('keydown', (evt) => {
 *   if (evt.keyCode === 67) {
 *     evt.preventDefault();
 *     document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:open', {
 *       detail: {
 *         opener: evt.target
 *       }
 *     }));
 *   }
 * });
 *
 * In this example, we attach a keydown listener to the search input in the header. If the user
 * presses the 'c' key, it prevents the default behavior (which would be to type the letter 'c' in
 * the input) and dispatches the 'dispatch:cart-drawer:open' event with a 'detail' object that
 * specifies the search input as the opener. When the cart drawer is closed, focus is returned to
 * the search input.
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 12) dispatch:cart-drawer:refresh
 * -------------------------------------------------------------------------------------------------
 * Refreshes the contents of the cart drawer.
 *
 * This event is useful when you are adding variants to the cart and would like to instruct the
 * theme to re-render the cart drawer.
 *
 * How to trigger:
 * document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh', {
 *   bubbles: true
 * }));
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 13) dispatch:cart-drawer:close
 * -------------------------------------------------------------------------------------------------
 * Closes the cart drawer.
 *
 * How to trigger:
 * document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:close'));
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 14) on:debounced-resize
 * -------------------------------------------------------------------------------------------------
 * Fires when the viewport finishes resizing (debounced to 300ms by default).
 *
 * How to listen:
 * window.addEventListener('on:debounced-resize', (event) => {
 *   // your code here
 * });
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 15) on:breakpoint-change
 * -------------------------------------------------------------------------------------------------
 * Fires when the breakpoint of the viewport changes. See the 'Media Queries' section in this file
 * for more.
 *
 * Example:
 * window.addEventListener('on:breakpoint-change', (event) => {
 *  if (theme.mediaMatches.md) {
 *   console.log('we are not on mobile');
 *  }
 * });
 *
 *
 *
 * =================================================================================================
 * Web Components
 * =================================================================================================
 *
 * Enterprise utilizes Web Components to the fullest.
 *
 * Web Components are a set of standardized APIs that allow developers to create custom, reusable
 * HTML elements that can be used across different web pages and applications.
 * Web Components consist of three main technologies: Custom Elements, Shadow DOM and HTML
 * Templates.
 *
 * See Mozilla for more: https://developer.mozilla.org/en-US/docs/Web/Web_Components
 *
 *
 *
 * =================================================================================================
 * Third-Party JavaScript Dependencies
 * =================================================================================================
 *
 * Enterprise only has one third-party dependency: instant.page (https://instant.page/).
 *
 * It's included locally and is only active if it has been enabled in
 * 'Theme Settings > Advanced > Preload links on hover'.
 *
 * Instant.page is a JavaScript library that speeds up page loads by preloading links as soon as the
 * customer hovers over them.
 *
 *
 *
 * =================================================================================================
 * Code Splitting
 * =================================================================================================
 * We followed the ‘code splitting’ technique when building Enterprise.
 *
 * Code splitting consists in writing JavaScript (and CSS)in a modularized way within typically
 * small, more manageable files that can be loaded on-demand, as needed. The idea is to improve the
 * performance of our theme by reducing the amount of code that needs to be loaded upfront.
 *
 * If the customer is visiting a specific page of the theme that requires certain JavaScript
 * functionality, only the code needed for that page will be loaded, rather than one large
 * JavaScript file containing largely unused code. For example, the file media-gallery.js will
 * only be loaded if there is a media gallery on the page.
 *
 * Shopify uses HTTP/2, which is the newer version of the HTTP protocol used to deliver web content.
 * HTTP/2 supports multiplexing, which means that multiple requests can be sent over a single
 * connection at the same time - meaning multiple JS files are essentially served at the speed of a
 * single file.
 *
 * The only JS file which is served on every page in Enterprise is 'main.js'. Main.js contains
 * utility JS which is likely to be needed by many scripts. This is outlined more in the next
 * section.
 *
 *
 *
 * =================================================================================================
 * Utilities
 * =================================================================================================
 * Enterprise provides a few utility utilities, contained in main.js. Some of the key ones are
 * outlined below. See main.js for more.
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 1) Lazy Loading
 * -------------------------------------------------------------------------------------------------
 * Lazy loading is a technique for delaying the loading of certain elements until they are needed,
 * which can help improve page load times.
 *
 * We use three functions used for lazy loading images and scripts in our theme:
 *
 *  - setImageSources function - copies the data-src and data-srcset attributes of lazy loaded
 *    images to their src and srcset attributes.
 *  - initLazyScript function - only loads a script when a specific element is scrolled into view.
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 2) Cookies
 * -------------------------------------------------------------------------------------------------
 * Cookies are small pieces of data that can be stored on a user's computer. They can be useful for
 * tracking user activity, remembering user preferences or other similar purposes.
 *
 * We use three functions to manage cookies:
 *
 *  - setCookie function - sets a cookie with a given name, value and number of days until it
 *  should expire.
 *  - getCookie function - takes in the name of a cookie to retrieve its value.
 *  - deleteCookie function - takes in the name of a cookie to delete it.
 *
 *
 * -------------------------------------------------------------------------------------------------
 * 3) Media Queries
 * -------------------------------------------------------------------------------------------------
 * The theme creates a theme.mediaMatches object (in theme.liquid) for several key screen sizes
 * specified in our theme, and adds listeners for each media query.
 *
 * These are:
 *
 * mediaQueries: {
 *  sm: '(min-width: 600px)',
 *  md: '(min-width: 769px)',
 *  lg: '(min-width: 1024px)',
 *  xl: '(min-width: 1280px)',
 *  xxl: '(min-width: 1536px)',
 *  portrait: '(orientation: portrait)'
 * }
 *
 * If a breakpoint is crossed, the mediaMatches values are updated and an 'on:breakpoint-change'
 * event is dispatched.
 *
 * You can request the entire theme.mediaMatches object to check which media queries are currently
 * matched. In this case, the returned data will be an object with the names of the media queries as
 * keys, and boolean values indicating whether they are currently matched or not.
 *
 * Example:
 *
 * {
 *  sm: true,
 *  md: true,
 *  lg: true,
 *  xl: true,
 *  xxl: false,
 *  portrait: false
 * }
 *
 * You can reference a specific media query to check if it's currently matched by using:
 * theme.mediaMatches.lg.
 *
 * To check if you're on mobile you can use:
 * !theme.mediaMatches.md
 *
 * If you want to perform some action when the breakpoint changes, you can listen for the
 * breakpoint-change event on the window object.
 *
 * Example:
 * window.addEventListener('on:breakpoint-change', (event) => {
 *  // your code here
 * });
 *
 * =================================================================================================
 *
 * Have fun! - The Clean Canvas Development Team.
 */


// document.addEventListener('on:variant:change', (event) => {
//     const variantId = event.detail.variant.id;
//     const variantObj = event.detail.variant;
//     const variantAvailable = variantObj.available;
//     console.log(variantObj);
//    updateShippingStatus(variantId, variantAvailable);
// });

//  const messageMap = {
//     "Made For You": "Delivery in 8-10 weeks",
//     "Arriving Soon": "Delivery in 3-5 weeks",
//     "Ready to Dispatch": "Delivery in 5-10 working days"
//   };

  // function updateShippingStatus(variantId, isAvailable) {
  //   const metafieldValue = variantShippingMessages[variantId];
  //   let message = "";
  //   console.log(isAvailable);

  //   if (!isAvailable) {
  //     message = "Currently product is out of stock.";
  //   } else {
  //     message = messageMap[metafieldValue] || "";
  //   }
  //   document.getElementById('shippingStatus').textContent = message;

  //   const divElement = document.querySelector('#shipping-msg');
  //   if (divElement) {
  //     divElement.value = message;
  //   }
  // }




// tooltip on hover & click pdp compare table
// JavaScript approach
document.addEventListener('DOMContentLoaded', function() {
  const tooltipIcon = document.querySelector('.tooltip_icon');
  const tooltipText = document.querySelector('.tooltip .tooltipText');

  // Only enable click behavior on mobile
  if (window.innerWidth < 768 && tooltipIcon && tooltipText) {
      tooltipIcon.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent click bubbling
          tooltipText.classList.toggle('show');
      });

      // Close the tooltip if clicking outside
      document.addEventListener('click', function(event) {
          if (!tooltipIcon.contains(event.target)) {
              tooltipText.classList.remove('show');
          }
      });
  }

  //megamenu
  if (isTabletOrSmallDesktop) {
    document.querySelectorAll('.mega_menu_coumns_ctm .child-nav details').forEach(detail => {
      detail.removeAttribute('open');
      detail.classList.remove('is-open');
    });
  }
   

 // custom size product redirected to home page
  if (window.location.pathname === '/products/custom-size') {
    window.location.href = '/'; 
  }

  //inventory loading
  preloadInventoryData();
});


// home page tabbing section

$(document).ready(function () {
  var activateFirst = $(`.filter-bttn.active`)[0];
  if (activateFirst) {
    filter(activateFirst);
  }
});
if ($(".my-slick-slider").length > 0) {
  $(".my-slick-slider").slick({
    centerMode: false,
    centerPadding: "20px",
    slidesToShow: 4,
    infinite: true,
    arrows: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  });
}

const filter = (element) => {
  let target = element.dataset.filtertarget;
  console.log(element);
  resetFilterButtons();
  setFilterButtonActive(target);
  $(".my-slick-slider").slick("slickUnfilter");
  if (target !== "ALL") {
    $(".my-slick-slider").slick("slickFilter", `.${target}`);
  }
};
const resetFilterButtons = () => {
  document.querySelectorAll(".filter-bttn ").forEach((filterBttn) => {
    filterBttn.classList.remove("active");
  });
};
const setFilterButtonActive = (target) => {
  console.log(target);
  document
    .querySelector(`[data-filtertarget=${target}]`)
    .classList.add("active");
};



let allVariantsData = [];

function preloadInventoryData() {
    const productForm = document.querySelector('product-form');

    if (!productForm) {
        console.warn("Product form not found!");
        return;
    }

    const productId = productForm.querySelector('[name="product-id"]')?.value;
    if (!productId) {
        console.warn("Product ID is empty!");
        return;
    }

    const API_BASE = "https://fableroom-inventary-git-c61085-chintan-joshis-projects-fea129e0.vercel.app";

    fetch(`${API_BASE}/api/get-variant-detail?product_ids=${productId}`)
        .then(response => response.json())
        .then(data => {
            allVariantsData = data.flatMap(product => product.variants);
            updateMessageForCurrentVariant(); // Initial call
        })
        .catch(error => console.error("API Fetch Error:", error));
}

function updateMessageForCurrentVariant() {
    const productForm = document.querySelector('product-form');
    if (!productForm || allVariantsData.length === 0) return;

    const variantId = productForm.querySelector('[name="id"]')?.value;
    if (!variantId) return;

    const matchedVariant = allVariantsData.find(v => v.variant_id === variantId);
    

    if (matchedVariant) {
      console.log(matchedVariant.inventoryLocations, "matchedVariant.inventoryLocations");
        // const inventoryMessage = getInventoryMessage(matchedVariant.inventoryLocations);
        const { inventoryMessage, inStockQty } = getInventoryMessage(matchedVariant.inventoryLocations);

        // const spanElement = document.querySelector('.inventory_location_days span#shippingStatus');
        // const spanElementMob = document.querySelector('.inventory_location_days span#shippingStatusMob');
        // if (spanElement) {
        //     spanElement.innerHTML = inventoryMessage;
        // }
        // if (spanElementMob) {
        //     spanElementMob.innerHTML = inventoryMessage;
        // }

        // product lineitem property
        // const divElement = document.querySelector('#shipping-msg');
        // if (divElement) {
        //     divElement.value = inventoryMessage;
        // }

        // Append "Pre order" badge if variant is under production
        if (inventoryMessage === 'Delivery in 3-5 weeks') {
            appendPreOrderBadge();
        }else {
            removePreOrderBadge();
        }

        // Handle "Few Left" badge
        console.log(inventoryMessage, "inventoryMessage");
        const fewLeftBadge = document.querySelector('.few_left_badge');
        if (fewLeftBadge) {
            if (inventoryMessage === 'Delivery in 5-10 working days' && inStockQty > 0 && inStockQty <= 5) {
                fewLeftBadge.classList.remove('hidden'); // Show badge
            } else {
                fewLeftBadge.classList.add('hidden'); // Hide badge
            }
        }
    }
}
// product `Pre order` badge
function appendPreOrderBadge() {
    const badgeWrapper = document.querySelector('.product_badge_wrp');
    if (!badgeWrapper) return;

    // First, remove all existing "Pre order" badges to prevent duplicates
    const existingBadges = badgeWrapper.querySelectorAll('.product_badge_inner');
    existingBadges.forEach(badge => {
        if (badge.textContent.trim().toLowerCase() === 'pre order') {
            badge.remove();
        }
    });

    // Then append a fresh one
    const preOrderBadge = document.createElement('li');
    preOrderBadge.classList.add('product_badge_inner');
    preOrderBadge.textContent = 'Pre order';
    badgeWrapper.appendChild(preOrderBadge);
}

function removePreOrderBadge() {
    const badgeWrapper = document.querySelector('.product_badge_wrp');
    if (!badgeWrapper) return;

    const preOrderBadge = Array.from(badgeWrapper.querySelectorAll('.product_badge_inner'))
        .find(badge => badge.textContent.trim() === 'Pre order');

    if (preOrderBadge) {
        preOrderBadge.remove();
    }
}


// const getInventoryMessage = (inventoryLocation) => {
//     if (!inventoryLocation || inventoryLocation.length === 0) {
//         return "Currently product is out of stock.";
//     }

//     let inStock = null;
//     let underProduction = null;
//     let madeToOrder = null;

//     for (const level of inventoryLocation) {
//         const locationName = level.location_name;
//         const availableQuantity = level.available_quantity;

//         if (availableQuantity > 0) {
//             switch (locationName) {
//                 case "In Stock":
//                     inStock = availableQuantity;
//                     break;
//                 case "Under Production":
//                     underProduction = availableQuantity;
//                     break;
//                 case "Made to Order":
//                     madeToOrder = availableQuantity;
//                     break;
//             }
//         }
//     }

//     if (inStock !== null) return `Delivery in 5-10 working days`;
//     if (underProduction !== null) return `Delivery in 3-5 weeks`;
//     if (madeToOrder !== null) return `Delivery in 8-10 weeks`;

//     return "Currently product is out of stock.";
// };


const getInventoryMessage = (inventoryLocation) => {
    if (!inventoryLocation || inventoryLocation.length === 0) {
        return {
            inventoryMessage: "Currently product is out of stock.",
            inStockQty: 0
        };
    }

    let inStock = null;
    let underProduction = null;
    let madeToOrder = null;
    let bufferStock = null;

    for (const level of inventoryLocation) {
        const locationName = level.location_name;
        const availableQuantity = level.available_quantity;

        if (availableQuantity > 0) {
            switch (locationName) {
                case "In Stock":
                    inStock = availableQuantity;
                    break;
                case "Under Production":
                    underProduction = availableQuantity;
                    break;
                case "Made to Order":
                    madeToOrder = availableQuantity;
                    break;
                case "Buffer Stock":
                    bufferStock = availableQuantity;
                    break;
            }
        }
    }

    if (inStock !== null) {
        return {
            inventoryMessage: "Delivery in 5-10 working days",
            inStockQty: inStock
        };
    }
    if (underProduction !== null) {
        return {
            inventoryMessage: "Delivery in 3-5 weeks",
            inStockQty: 0
        };
    }
    if (madeToOrder !== null) {
        return {
            inventoryMessage: "Delivery in 8-10 weeks",
            inStockQty: 0
        };
    }
    if (bufferStock !== null) {
        return {
            inventoryMessage: "Delivery in 12+ weeks",
            inStockQty: 0
        };
    }

    return {
        inventoryMessage: "Currently product is out of stock.",
        inStockQty: 0
    };
};


// Listen to variant change
let variantUpdateInProgress = false;

document.addEventListener('on:variant:change', async (event) => {
  if (variantUpdateInProgress) return; // prevent recursive loops
  variantUpdateInProgress = true;

  try {
    const variant = event.detail.variant;
    if (!variant) return;

    const url = new URL(window.location);
    url.searchParams.set("variant", variant.id);

    const productElement = document.querySelector('.pdp_inner_wrp');
    if (productElement) {
      const sectionValue = productElement.getAttribute('data-section');
      url.searchParams.append("section_id", sectionValue);
    }

    await fetchUpdatedVariantInfo(url.toString());
    updateMessageForCurrentVariant();
  } finally {
    setTimeout(() => { variantUpdateInProgress = false; }, 50);
  }
});


async function fetchUpdatedVariantInfo(variantUrl) {
    try {
        let response = await fetch(variantUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let text = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");

        let updatedInfo = doc.querySelector("#variant-info");
        let existingInfo = document.querySelector("#variant-info");

        if (updatedInfo && existingInfo) {
            // existingInfo.innerHTML = updatedInfo.innerHTML;
            existingInfo.replaceChildren(...updatedInfo.childNodes);
            console.log("Product info updated successfully!");
        }
    } catch (error) {
        console.error("Error fetching updated product info:", error);
    }
}
// old code with old inventory logic
// cart open inventory status check
// document.addEventListener('on:cart-drawer:after-open', async () => {
//     console.log("Cart drawer opened — validating shipping messages...");

//     try {
//         const cartRes = await fetch('/cart.js');
//         const cart = await cartRes.json();

//         // Step 1: Collect all unique product IDs in the cart
//         const uniqueProductIds = [...new Set(cart.items.map(item => item.product_id))];

//         // Step 2: Fetch variant data for all product IDs
//         const allVariantsData = await fetchVariantsDataByProductIds(uniqueProductIds);

//         // Step 3: Loop over cart items and update shipping message if needed
//         for (const item of cart.items) {
//             const variantId = String(item.variant_id);
//             const currentMsg = item.properties?.["_shipping msg"] || "";
//             const matchedVariant = allVariantsData.find(v => v.variant_id === variantId);

//             if (!matchedVariant) continue;

//             const correctMsg = getInventoryMessage(matchedVariant.inventoryLocations);
//             var correctInventoryMsg = correctMsg.inventoryMessage;
//             var currentInventoryMsg = currentMsg.inventoryMessage;
//             console.log(correctMsg);
//             console.log(currentMsg);
//             if (correctInventoryMsg !== currentInventoryMsg) {
//                 await fetch('/cart/change.js', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         id: item.key,
//                         quantity: item.quantity,
//                         properties: {
//                             ...item.properties,
//                             "_shipping msg": correctInventoryMsg
//                         }
//                     }),
//                 });
//                 console.log(`Updated _shipping msg for variant ${variantId}`);
//                 document.dispatchEvent(
//                   new CustomEvent('dispatch:cart-items:refresh', { bubbles: true })
//                 );
                
//             }
//         }

//         // Optional: reload cart drawer if UI doesn't auto-update
//         // document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh', {
//         //   bubbles: true
//         // }));

//     } catch (err) {
//         console.error("Error updating cart messages:", err);
//     }
// });



// new code with new api logic
// Helper: format date
// function formatDate(dateStr) {
//   const d = new Date(dateStr);
//   const day = d.getDate();

//   // Determine suffix
//   const suffix =
//     day % 10 === 1 && day !== 11 ? "st" :
//     day % 10 === 2 && day !== 12 ? "nd" :
//     day % 10 === 3 && day !== 13 ? "rd" : "th";

//   // Always return exactly 3-letter month
//   const month = d.toLocaleString('en-US', { month: 'short' }).slice(0, 3);

//   return `${day}${suffix} ${month}`;
// }

// // Helper: fetch EDD message by SKU
// async function fetchEDDMessage(sku) {
//   try {
//     const res = await fetch(`https://api.trampolinestore.uk/fableroom/edd/?format=json&sku=${sku}`);
//     const data = await res.json();
//     // 🚫 Skip if API returns error
//     if (data.error) {
//       console.warn(`EDD skipped for SKU ${sku}: ${data.error}`);
//       return "";
//     }

//     let message = "";
//     if (data.message) {
//       message = data.message;
//     } else if (data.min_edd && data.max_edd) {
//       const minDate = formatDate(data.min_edd);
//       const maxDate = formatDate(data.max_edd);
//       message = `Delivery between ${minDate} to ${maxDate}`;
//     }
//     return message || "";
//   } catch (err) {
//     console.error("EDD API Error:", err);
//     return "";
//   }
// }


// // Replace old inventory logic with new EDD message check (optimized version)
// document.addEventListener("on:cart-drawer:after-open", async () => {
//   console.log("🛒 Cart drawer opened — validating EDD messages...");

//   try {
//     const cartRes = await fetch("/cart.js");
//     const cart = await cartRes.json();

//     if (!cart.items?.length) {
//       console.log("🟡 No items in cart — skipping EDD check.");
//       return;
//     }

//     // Process all items concurrently for better performance
//     const eddResults = await Promise.allSettled(
//       cart.items.map(async (item) => {
//         if (!item.sku) return;

//         const eddMessage = await fetchEDDMessage(item.sku);
//         if (!eddMessage) return;

//         const currentMsg = item.properties?.["_shipping msg"] || "";

//         // Only update if message has changed
//         if (eddMessage !== currentMsg) {
//           await fetch("/cart/change.js", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               id: item.key,
//               quantity: item.quantity,
//               properties: {
//                 ...item.properties,
//                 "_shipping msg": eddMessage,
//               },
//             }),
//           });
//           console.log(`✅ Updated _shipping msg for SKU ${item.sku}`);
//           return true;
//         } else {
//           console.log(`ℹ️ No change for SKU ${item.sku}`);
//           return false;
//         }
//       })
//     );

//     // Check if any items were updated before refreshing the cart UI
//     const updated = eddResults.some((r) => r.status === "fulfilled" && r.value);
//     if (updated) {
//       document.dispatchEvent(
//         new CustomEvent("dispatch:cart-items:refresh", { bubbles: true })
//       );
//       console.log("🔄 Cart items refreshed after EDD update");
//     } else {
//       console.log("🟢 No EDD updates required.");
//     }
//   } catch (err) {
//     console.error("❌ Error updating EDD messages in cart:", err);
//   }
// });

async function fetchVariantsDataByProductIds(productIds) {
    const API_BASE = "https://fableroom-inventary-git-c61085-chintan-joshis-projects-fea129e0.vercel.app";
    const url = `${API_BASE}/api/get-variant-detail?product_ids=${productIds.join(',')}`;
    
    const response = await fetch(url);
    const data = await response.json();

    const allVariants = data.flatMap(product => product.variants.map(v => ({
        variant_id: String(v.variant_id),
        inventoryLocations: v.inventoryLocations
    })));

    return allVariants;
}



// cart drawer couppn code script to copy clipboard
var cpnBtn = document.querySelector(".cpnBtn");
var cpnCode = document.querySelector(".cpnCode");
if(cpnBtn){
  cpnBtn.onclick = function(){
      navigator.clipboard.writeText(cpnCode.innerHTML);
      cpnBtn.innerHTML ="COPIED";
      setTimeout(function(){
          cpnBtn.innerHTML="COPY CODE";
      }, 3000);
  }
}

document.addEventListener('on:cart-drawer:after-open', () => {
  // Delegate click event to the document for dynamically loaded elements
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('cpnBtn')) {
      const cpnCode = document.querySelector(".cpnCode");
      if (cpnCode) {
        navigator.clipboard.writeText(cpnCode.innerText || cpnCode.textContent);
        e.target.innerHTML = "COPIED";
        setTimeout(() => {
          e.target.innerHTML = "COPY CODE";
        }, 3000);
      }
    }
  }, { once: true }); // Bind this only once after drawer opens
});




const isTabletOrSmallDesktop = window.matchMedia('(min-width: 767px) and (max-width: 1366px)').matches;

document.addEventListener('click', function (event) {

  if (isTabletOrSmallDesktop) {
    if (event.target.closest('.js-back')) {
      const backButton = event.target.closest('.js-back');

      // Remove no-focus class
      const menuContent = document.querySelector('.main-menu__content');
      if (menuContent?.classList.contains('main-menu__content--no-focus')) {
        menuContent.classList.remove('main-menu__content--no-focus');
      }

      // Remove open + is-open from parent <details>
      const detailsParent = backButton.closest('details');
      if (detailsParent) {
        detailsParent.classList.remove('is-open');
        detailsParent.removeAttribute('open');
      }

      // Remove is-visible from overlay--nav
      const overlay = document.querySelector('.overlay--nav.js-overlay');
      if (overlay?.classList.contains('is-visible')) {
        overlay.classList.remove('is-visible');
      }
    }


    if (event.target.closest('.mega_menu_coumns_ctm  .child-nav__item--toggle')) {
      const nestedMenu = event.target.closest('.mega_menu_coumns_ctm .child-nav__item--toggle');

      // Find parent <details> element
      const nestedDetailsParent = nestedMenu.closest('details');
      if (nestedDetailsParent) {
      
      
        if (nestedDetailsParent.hasAttribute('open')) {
          nestedDetailsParent.removeAttribute('open');
        } else {
          nestedDetailsParent.setAttribute('open', 'open');
        }
      }
    }
  }
});







// ---------- Format date helper ----------
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();

  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";

  const month = d.toLocaleString("en-US", { month: "short" }).slice(0, 3);
  return `${day}${suffix} ${month}`;
}

// ---------- Create formatted EDD message ----------
function createEddMessage(apiData, requiredQty) {
  let remaining = requiredQty;
  const parts = [];

  for (const item of apiData) {
    if (remaining <= 0) break;

    const usedQty = Math.min(item.available_quantity, remaining);
    remaining -= usedQty;

    parts.push({
      qty: usedQty,
      min: formatDate(item.min_edd),
      max: formatDate(item.max_edd),
    });
  }

  // 🟢 If only one delivery window is used → show simple message
  if (parts.length === 1) {
    const p = parts[0];
    return `Delivery between ${p.min} to ${p.max}`;
  }

  // 🟡 Otherwise, show detailed messages separated by new lines
  return parts
    .map((p) => {
      const qtyText = p.qty === 1 ? "Delivery of 1 unit between" : `Delivery of ${p.qty} units between`;
      return `${qtyText} ${p.min} to ${p.max}`;
    })
    .join("\n");
}


// ---------- Fetch and build EDD message by SKU ----------
async function fetchEDDMessage(sku, qty) {
  try {
    const res = await fetch(`https://apivi.trampolinestore.uk/fableroom/v2/edd/?format=json&sku=${sku}`);
    const data = await res.json();

    if (!Array.isArray(data) || !data.length) {
      console.warn(`No valid EDD data for SKU: ${sku}`);
      return "";
    }

    return createEddMessage(data, qty);
  } catch (err) {
    console.error("EDD API Error:", err);
    return "";
  }
}

// ---------- Update EDD messages for all cart items ----------
async function updateCartEddMessages(retryCount = 0) {
  console.log("🔍 Checking EDD messages for all cart items...");

  try {
    const cartRes = await fetch("/cart.js");
    const cart = await cartRes.json();

    if (!cart.items?.length) {
      console.log("🟡 No items in cart — skipping EDD check.");
      return;
    }

    // Check if any items are missing SKUs (might happen when products are just added)
    const itemsWithoutSku = cart.items.filter(item => !item.sku);
    if (itemsWithoutSku.length > 0 && retryCount < 2) {
      console.log(`⏳ ${itemsWithoutSku.length} item(s) missing SKU, retrying in 500ms...`);
      setTimeout(() => updateCartEddMessages(retryCount + 1), 500);
      return;
    }

    const eddResults = await Promise.allSettled(
      cart.items.map(async (item) => {
        if (!item.sku) {
          console.warn(`⚠️ Item ${item.variant_id} missing SKU, skipping EDD update`);
          return false;
        }

        const eddMessage = await fetchEDDMessage(item.sku, item.quantity);
        if (!eddMessage) {
          console.log(`ℹ️ No EDD message for SKU ${item.sku}`);
          return false;
        }

        const currentMsg = item.properties?.["_shipping msg"] || "";

        if (eddMessage !== currentMsg) {
          await fetch("/cart/change.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: item.key,
              quantity: item.quantity,
              properties: {
                ...item.properties,
                "_shipping msg": eddMessage,
              },
            }),
          });

          console.log(`✅ Updated _shipping msg for SKU ${item.sku}`);
          return true;
        } else {
          console.log(`ℹ️ No change for SKU ${item.sku}`);
          return false;
        }
      })
    );

    const updated = eddResults.some((r) => r.status === "fulfilled" && r.value);
    if (updated) {
      document.dispatchEvent(
        new CustomEvent("dispatch:cart-items:refresh", { bubbles: true })
      );
      console.log("🔄 Cart items refreshed after EDD update");
    } else {
      console.log("🟢 No EDD updates required.");
    }
  } catch (err) {
    console.error("❌ Error updating EDD messages in cart:", err);
  }
}

// ---------- Triggers ----------
document.addEventListener("on:cart-drawer:after-open", updateCartEddMessages);
document.addEventListener("on:line-item:change", updateCartEddMessages);

// Also trigger EDD update after cart drawer refresh completes (for bundle products)
// This ensures EDD messages are updated even when products are added via bundles
let cartRefreshTimeout = null;
document.addEventListener("dispatch:cart-drawer:refresh", () => {
  // Clear any existing timeout
  if (cartRefreshTimeout) {
    clearTimeout(cartRefreshTimeout);
  }
  
  // Wait for cart refresh to complete, then update EDD messages
  // Using a longer delay to ensure all bundle products are fully processed
  cartRefreshTimeout = setTimeout(() => {
    updateCartEddMessages();
  }, 800);
});

// Also listen for cart:add event to update EDD messages
document.addEventListener("on:cart:add", () => {
  // Small delay to ensure cart is fully updated
  setTimeout(() => {
    updateCartEddMessages();
  }, 500);
});
