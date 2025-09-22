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
}