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
}