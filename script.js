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
}