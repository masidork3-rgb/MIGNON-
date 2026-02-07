// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // Menu hamburger
  const toggle = document.getElementById('menu-toggle');
  const navList = document.getElementById('nav-list');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    navList?.classList.toggle('open');
  });

  // Cart logic
  const CART_KEY = 'mignon_cart_v1';
  const cartCountEl = document.getElementById('cart-count');

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }
  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
  }
  function updateCartCount() {
    const items = getCart();
    const totalQty = items.reduce((s,i) => s + (i.qty||1), 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;
  }

  // Initialize count
  updateCartCount();

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name || card.querySelector('h3')?.textContent || 'Produit';
      const price = parseFloat(card.dataset.price || card.querySelector('.price')?.textContent?.replace(/[^\d.,]/g,'').replace(',','.') || '0') || 0;
      const img = card.querySelector('img')?.src || '';

      const items = getCart();
      const existing = items.find(i => i.id === id);
      if (existing) existing.qty = (existing.qty || 1) + 1;
      else items.push({ id, name, price, img, qty: 1, addedAt: Date.now() });

      setCart(items);

      // Feedback
      const original = btn.textContent;
      btn.textContent = 'Ajouté ✓';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
    });
  });

  // If we are on cart.html, render cart details
  if (document.body.classList.contains('page-cart')) {
    renderCartPage();
  }

  // Helper: render cart page content
  function renderCartPage() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyMsg = document.getElementById('cart-empty');

    function render() {
      const items = getCart();
      if (!container) return;
      container.innerHTML = '';
      if (items.length === 0) {
        emptyMsg?.classList.remove('hidden');
        totalEl && (totalEl.textContent = '0,00 €');
        return;
      }
      emptyMsg?.classList.add('hidden');
      let total = 0;
      items.forEach(item => {
        total += (item.price || 0) * (item.qty || 1);
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
          <img src="${item.img}" alt="${escapeHtml(item.name)}" />
          <div class="meta">
            <strong>${escapeHtml(item.name)}</strong>
            <div>Prix: ${formatPrice(item.price)}</div>
            <div>
              Qté: 
              <button class="qty-decr" data-id="${item.id}">-</button>
              <span class="qty">${item.qty}</span>
              <button class="qty-incr" data-id="${item.id}">+</button>
            </div>
            <button class="remove" data-id="${item.id}">Supprimer</button>
          </div>
        `;
        container.appendChild(row);
      });
      totalEl && (totalEl.textContent = formatPrice(total));
      attachCartButtons();
    }

    function attachCartButtons() {
      document.querySelectorAll('.remove').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          let items = getCart();
          items = items.filter(i => i.id !== id);
          setCart(items);
          render();
        });
      });
      document.querySelectorAll('.qty-incr').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const items = getCart();
          const it = items.find(i => i.id === id);
          if (it) { it.qty = (it.qty||1) + 1; setCart(items); render(); }
        });
      });
      document.querySelectorAll('.qty-decr').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const items = getCart();
          const it = items.find(i => i.id === id);
          if (it) {
            it.qty = Math.max(1, (it.qty||1) - 1);
            setCart(items); render();
          }
        });
      });
    }

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const items = getCart();
        if (items.length === 0) {
          alert('Votre panier est vide.');
          return;
        }
        const formData = Object.fromEntries(new FormData(checkoutForm).entries());
        // Ici tu peux envoyer la commande à un serveur ou service tiers.
        console.log('Commande envoyée (demo):', { formData, items });
        // Simuler validation / confirmation
        alert('Commande reçue — merci ! (demo)');
        localStorage.removeItem(CART_KEY);
        setCart([]);
        render();
        checkoutForm.reset();
      });
    }

    render();
  }

  // Utilities
  function formatPrice(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
});