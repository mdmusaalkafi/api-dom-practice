(() => {
  'use strict';

  const API_BASE = 'https://openapi.programming-hero.com/api';

//   getting elements 
  const categoriesEl = document.getElementById('categories');
  const plantsEl = document.getElementById('plants');
  const spinnerEl = document.getElementById('spinner');
  const noItemsMsgEl = document.getElementById('noItemsMsg');
  const modalContainer = document.getElementById('modal-container');

  const cartSidebarEl = document.getElementById('cart-sidebar');
  const closeCartBtn = document.getElementById('close-cart');
  const cartListEl = document.getElementById('cart-list');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const sortPriceBtn = document.getElementById('sortPrice');

  const plantForm = document.getElementById('plantForm');
  const donorNameEl = document.getElementById('donorName');
  const donorEmailEl = document.getElementById('donorEmail');
  const donationCountEl = document.getElementById('donationCount');

  const yearEl = document.getElementById('year');

  let categories = [];
  let lastPlants = []; 
  let cart = JSON.parse(localStorage.getItem('greenEarthCart_v1') || '[]');
  let sortAsc = true;

  // some quick functions
  function showSpinner() { spinnerEl && spinnerEl.classList.remove('hidden'); }
  function hideSpinner() { spinnerEl && spinnerEl.classList.add('hidden'); }
  function toast(message, ms = 2000) {
    const t = document.createElement('div');
    t.textContent = message;
    t.className = 'fixed right-4 bottom-6 bg-black text-white px-4 py-2 rounded shadow z-50';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  }
  function formatCurrency(n) { return `$${Number(n || 0).toFixed(2)}`; }
  function makeId(seed = '') {
    let s = String(seed) || String(Math.random()) + Date.now();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return 'id_' + Math.abs(h);
  }

  function extractArray(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.data?.plants)) return json.data.plants;
    if (Array.isArray(json.data?.categories)) return json.data.categories;
    if (Array.isArray(json.plants)) return json.plants;
    if (Array.isArray(json.categories)) return json.categories;
    if (Array.isArray(json.items)) return json.items;
    if (Array.isArray(json.results)) return json.results;
    for (const k of Object.keys(json)) if (Array.isArray(json[k])) return json[k];
    return [];
  }

  function safeName(p) {
    return p.name ?? p.plant_name ?? p.common_name ?? p.title ?? 'Unknown Plant';
  }
  function safeImage(p) {
    return p.image ?? p.image_url ?? (Array.isArray(p.images) ? p.images[0] : null) ?? './assets/about.png';
  }
  function shortDesc(p) {
    const s = p.short_description ?? p.description ?? p.plant_description ?? p.detail ?? '';
    return String(s).length > 110 ? String(s).slice(0, 110) + '...' : (s || 'No description available.');
  }

  function getPrice(p) {
    if (!p) return 0;
    const candidates = [p.price, p._price, p.cost, p.amount, p.price_bdt, p.price_usd];
    for (const c of candidates) {
      if (c !== undefined && c !== null && !Number.isNaN(Number(c))) return Number(c);
    }
    // fallback deterministic price
    const seed = (p.id ?? p._id ?? p.slug ?? safeName(p) ?? JSON.stringify(p)).toString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    const price = (Math.abs(hash) % 120) + 20; // 20 - 139
    return price;
  }

  // network wrapper
  async function fetchJSON(url) {
    showSpinner();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error('fetchJSON error', err);
      toast('Failed to fetch data. See console.');
      return null;
    } finally {
      hideSpinner();
    }
  }

//    Categories
  async function loadCategories() {
    const json = await fetchJSON(`${API_BASE}/categories`);
    const arr = extractArray(json);
    categories = (arr || []).map((c, idx) => {
      return {
        id: String(c.id ?? c._id ?? c.category_id ?? makeId(JSON.stringify(c) + idx)),
        name: c.name ?? c.category ?? c.category_name ?? c.title ?? `Category ${idx + 1}`,
        raw: c
      };
    });
    // ensure 'All'
    categories.unshift({ id: 'all', name: 'All' });
    renderCategories();
  }

  function renderCategories() {
    categoriesEl.innerHTML = '';
    categories.forEach((cat, i) => {
      const btn = document.createElement('button');
      // DaisyUI / Tailwind classes
      btn.className = 'btn btn-ghost btn-sm normal-case text-left justify-start';
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.addEventListener('click', () => {
        // highlight
        categoriesEl.querySelectorAll('button').forEach(b => b.classList.remove('bg-emerald-800', 'text-white'));
        btn.classList.add('bg-emerald-800', 'text-white');
        loadPlantsForCategory(cat.id);
      });
      categoriesEl.appendChild(btn);
      // auto-click first (All)
      if (i === 0) btn.classList.add('bg-emerald-800', 'text-white');
    });
  }

  // Plants
  async function loadPlantsForCategory(id = 'all') {
    noItemsMsgEl && noItemsMsgEl.classList.add('hidden');

    const url = id === 'all' ? `${API_BASE}/plants` : `${API_BASE}/category/${id}`;
    const json = await fetchJSON(url);
    const arr = extractArray(json) || [];
    lastPlants = arr.map((p, i) => {
      return {
        __id: String(p.id ?? p._id ?? p.plant_id ?? p.slug ?? makeId(JSON.stringify(p) + i)),
        raw: p,
        name: safeName(p),
        image: safeImage(p),
        description: shortDesc(p),
        category: p.category ?? p.category_name ?? (categories.find(c => c.id === id)?.name ?? 'Various'),
        price: getPrice(p)
      };
    });
    renderPlants(lastPlants);
  }

  function renderPlants(items) {
    plantsEl.innerHTML = '';
    if (!items || items.length === 0) {
      noItemsMsgEl && noItemsMsgEl.classList.remove('hidden');
      return;
    }
    noItemsMsgEl && noItemsMsgEl.classList.add('hidden');

    // sort
    const sorted = [...items].sort((a, b) => sortAsc ? (a.price - b.price) : (b.price - a.price));

    for (const item of sorted) {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow overflow-hidden';

      card.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-40 object-cover" />
        <div class="p-4">
          <button class="plant-name text-left block font-semibold text-lg hover:underline" data-id="${item.__id}">${escapeHtml(item.name)}</button>
          <p class="mt-2 text-sm text-gray-600">${escapeHtml(item.description)}</p>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-sm text-gray-500">Category: ${escapeHtml(item.category)}</div>
            <div class="text-lg font-semibold text-emerald-800">${formatCurrency(item.price)}</div>
          </div>
          <div class="mt-3">
            <button class="add-cart btn btn-success btn-block mt-2" data-id="${item.__id}">Add to Cart</button>
          </div>
        </div>
      `;
      plantsEl.appendChild(card);
    }
  }

  // escape text for safety
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  // delegated events on plants container
  plantsEl.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-cart');
    if (addBtn) {
      const id = addBtn.dataset.id;
      const item = lastPlants.find(x => x.__id === id);
      if (item) addToCart(item);
      return;
    }
    const nameBtn = e.target.closest('.plant-name');
    if (nameBtn) {
      const id = nameBtn.dataset.id;
      const item = lastPlants.find(x => x.__id === id);
      if (item) openModalForItem(item);
    }
  });

  // ----------------------
  // Modal
  // ----------------------
  function openModalForItem(item) {
    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="__modal_overlay">
        <div class="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
          <button id="__close_modal" class="btn btn-ghost btn-sm absolute top-3 right-3">✖</button>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-64 object-cover rounded"/>
            </div>
            <div>
              <h3 class="text-xl font-semibold">${escapeHtml(item.name)}</h3>
              <p class="text-sm text-gray-700 mt-2">${escapeHtml(item.raw.description ?? item.raw.detail ?? item.raw.plant_description ?? '')}</p>
              <div class="mt-4">
                <div class="text-lg font-bold text-emerald-600">${formatCurrency(item.price)}</div>
                <div class="mt-3">
                  <button id="__modal_add" class="btn btn-success">Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const overlay = document.getElementById('__modal_overlay');
    const closeBtn = document.getElementById('__close_modal');
    const modalAdd = document.getElementById('__modal_add');

    function closeModal() { modalContainer.innerHTML = ''; }
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (ev) => { if (ev.target === overlay) closeModal(); });
    modalAdd?.addEventListener('click', () => { addToCart(item); closeModal(); });
  }
  // Cart
  function saveCart() {
    localStorage.setItem('greenEarthCart_v1', JSON.stringify(cart));
    renderCart();
  }

  function addToCart(item) {
    const id = item.__id;
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id, name: item.name, price: item.price, qty: 1 });
    }
    saveCart();
    toast(`${item.name} added to cart`);
  }

  function removeFromCart(id) {
    cart = cart.filter(it => it.id !== id);
    saveCart();
    toast('Item removed');
  }

  function renderCart() {
    cartListEl.innerHTML = '';
    if (!cart.length) {
      cartListEl.innerHTML = '<li class="text-sm text-gray-500">Cart is empty.</li>';
      cartTotalEl.textContent = '$0';
      return;
    }
    let total = 0;
    for (const it of cart) {
      total += it.price * (it.qty || 1);
      const li = document.createElement('li');
      li.className = 'flex justify-between items-start bg-emerald-50 p-3 rounded';
      li.innerHTML = `
        <div>
          <div class="font-medium">${escapeHtml(it.name)}</div>
          <div class="text-xs text-gray-600">${formatCurrency(it.price)} × ${it.qty}</div>
        </div>
        <div>
          <button class="btn btn-ghost btn-sm cart-remove" data-id="${it.id}">✖</button>
        </div>
      `;
      cartListEl.appendChild(li);
    }
    cartTotalEl.textContent = formatCurrency(total);
  }

  // delegated remove
  cartListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-remove');
    if (!btn) return;
    const id = btn.dataset.id;
    removeFromCart(id);
  });

  // checkout button simple behaviour
  checkoutBtn?.addEventListener('click', () => {
    if (!cart.length) { toast('Cart is empty'); return; }
    toast(`Checkout - total ${cartTotalEl.textContent}`);
    cart = [];
    saveCart();
  });

  // allow closing the right sidebar
  closeCartBtn?.addEventListener('click', () => {
    if (cartSidebarEl.style.display === 'none') {
      cartSidebarEl.style.display = '';
    } else {
      cartSidebarEl.style.display = 'none';
    }
  });

  //Form: Plant a Tree

  plantForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = donorNameEl.value?.trim();
    const email = donorEmailEl.value?.trim();
    const number = Number(donationCountEl.value || 0);
    if (!name || !email || !number || number < 1) {
      toast('Please provide valid details.');
      return;
    }
    const existing = JSON.parse(localStorage.getItem('greenEarthDonations') || '[]');
    existing.push({ name, email, number, date: new Date().toISOString() });
    localStorage.setItem('greenEarthDonations', JSON.stringify(existing));
    toast('Thank you! Your plant request is recorded.');
    plantForm.reset();
  });

  // ----------------------
  // Sorting
  // ----------------------
  sortPriceBtn?.addEventListener('click', () => {
    sortAsc = !sortAsc;
    renderPlants(lastPlants);
    sortPriceBtn.textContent = sortAsc ? 'Sort By Price' : 'Sort By Price (desc)';
  });

  // ----------------------
  // Init
  // ----------------------
  (function init() {
    // set year
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // init cart from storage
    cart = JSON.parse(localStorage.getItem('greenEarthCart_v1') || '[]');
    renderCart();

    // load categories and plants
    loadCategories().then(() => loadPlantsForCategory('all'));
  })();

})();