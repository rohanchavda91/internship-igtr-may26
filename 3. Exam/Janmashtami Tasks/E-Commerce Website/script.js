/* Small shared interactions used by every Volt page. */
document.addEventListener('DOMContentLoaded', () => {
  let cartTotal = Number(localStorage.getItem('voltCartCount')) || 0;
  let toastTimer;

  function showToast(message) {
    const toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function updateCart() {
    document.querySelectorAll('.cart-count').forEach((count) => {
      count.textContent = cartTotal;
    });
    localStorage.setItem('voltCartCount', cartTotal);
  }

  updateCart();

  document.querySelectorAll('.add-to-cart:not(#product-add-to-cart)').forEach((button) => {
    button.addEventListener('click', () => {
      cartTotal += 1;
      updateCart();
      showToast(`${button.dataset.product} added to cart.`);
    });
  });

  document.querySelectorAll('.wish-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const isSaved = button.classList.toggle('is-saved');
      button.textContent = isSaved ? '♥' : '♡';
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  menuButton?.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', isOpen);
  });

  const searchButton = document.querySelector('.search-toggle');
  const searchPanel = document.querySelector('.search-panel');
  searchButton?.addEventListener('click', () => {
    searchPanel.classList.toggle('is-open');
    document.querySelector('#site-search')?.focus();
  });

  document.querySelector('.search-submit')?.addEventListener('click', () => {
    const search = document.querySelector('#site-search').value.trim();
    if (search) window.location.href = `products.html?search=${encodeURIComponent(search)}`;
  });

  document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    showToast('You are on the Volt list!');
  });

  document.querySelector('#forgot-password')?.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('તો યાદ રાખજે, હવે નવું ખાતું બનાવી જા.');
  });

  document.querySelector('#login-submit')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.querySelector('#register-submit')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  const accountChoiceButtons = document.querySelectorAll('[data-account-mode]');
  const accountPanels = document.querySelectorAll('[data-account-panel]');
  const accountSwitchButtons = document.querySelectorAll('[data-switch-account]');

  function switchAccountMode(mode) {
    accountChoiceButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.accountMode === mode);
    });

    accountPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.accountPanel === mode);
    });
  }

  accountChoiceButtons.forEach((button) => {
    button.addEventListener('click', () => switchAccountMode(button.dataset.accountMode));
  });

  accountSwitchButtons.forEach((button) => {
    button.addEventListener('click', () => switchAccountMode(button.dataset.switchAccount));
  });

  const checkoutForm = document.querySelector('#checkout-form');
  if (checkoutForm) {
    const shippingLabel = document.querySelector('#checkout-shipping');
    const totalLabel = document.querySelector('#checkout-total');
    const subtotal = 7498;
    const discount = 500;

    function updateCheckoutTotal() {
      const shipping = Number(document.querySelector('input[name="delivery"]:checked')?.value || 0);
      shippingLabel.textContent = shipping ? `₹${shipping}` : 'FREE';
      totalLabel.textContent = `₹${(subtotal - discount + shipping).toLocaleString('en-IN')}`;
    }

    document.querySelectorAll('input[name="delivery"]').forEach((option) => {
      option.addEventListener('change', updateCheckoutTotal);
    });

    checkoutForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showToast('Order placed successfully!');
    });
  }

  // Product details page: gallery, colour and quantity controls.
  const detailAddButton = document.querySelector('#product-add-to-cart');
  if (detailAddButton) {
    let quantity = 1;
    const quantityOutput = document.querySelector('#product-quantity');

    document.querySelectorAll('.quantity-button').forEach((button) => {
      button.addEventListener('click', () => {
        quantity = Math.min(10, Math.max(1, quantity + Number(button.dataset.change)));
        quantityOutput.textContent = quantity;
      });
    });

    detailAddButton.addEventListener('click', () => {
      cartTotal += quantity;
      updateCart();
      showToast(`${quantity} × Nova Pods Pro added to cart.`);
    });

    const detailImage = document.querySelector('#detail-image');
    document.querySelectorAll('.gallery-thumb').forEach((button) => {
      button.addEventListener('click', () => {
        detailImage.src = button.dataset.image;
        detailImage.alt = button.dataset.alt;
        document.querySelectorAll('.gallery-thumb').forEach((thumb) => thumb.classList.remove('active'));
        button.classList.add('active');
      });
    });

    document.querySelectorAll('.colour-button').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.colour-button').forEach((colour) => colour.classList.remove('active'));
        button.classList.add('active');
        document.querySelector('#selected-colour').textContent = button.dataset.colour;
      });
    });
  }

  // Products page: search, category filters and sort.
  const productGrid = document.querySelector('[data-product-grid]');
  if (!productGrid) return;

  const products = [...productGrid.querySelectorAll('.product-card')];
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const productSearch = document.querySelector('#product-search');
  const sortProducts = document.querySelector('#sort-products');
  const resultsCount = document.querySelector('#results-count');
  const emptyResults = document.querySelector('.empty-results');
  const params = new URLSearchParams(window.location.search);
  let activeCategory = params.get('category') || 'all';

  if (params.get('search')) productSearch.value = params.get('search');

  function updateProducts() {
    const searchTerm = productSearch.value.toLowerCase().trim();
    let visibleProducts = 0;

    products.forEach((product) => {
      const matchesCategory = activeCategory === 'all' || product.dataset.category === activeCategory;
      const matchesSearch = product.dataset.name.toLowerCase().includes(searchTerm);
      product.hidden = !matchesCategory || !matchesSearch;
      if (!product.hidden) visibleProducts += 1;
    });

    resultsCount.textContent = visibleProducts;
    emptyResults.hidden = visibleProducts !== 0;
    filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === activeCategory));
  }

  function sortVisibleProducts() {
    const orderedProducts = [...products].sort((first, second) => {
      if (sortProducts.value === 'low') return first.dataset.price - second.dataset.price;
      if (sortProducts.value === 'high') return second.dataset.price - first.dataset.price;
      if (sortProducts.value === 'name') return first.dataset.name.localeCompare(second.dataset.name);
      return products.indexOf(first) - products.indexOf(second);
    });
    productGrid.append(...orderedProducts);
  }

  filterButtons.forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    updateProducts();
  }));
  productSearch.addEventListener('input', updateProducts);
  sortProducts.addEventListener('change', sortVisibleProducts);
  document.querySelector('.clear-filters').addEventListener('click', () => {
    activeCategory = 'all';
    productSearch.value = '';
    sortProducts.value = 'featured';
    sortVisibleProducts();
    updateProducts();
  });

  updateProducts();
});
