// STATE DATABASE APLIKASI
let products = [
  { id: 1, name: 'Kopi Susu Aren Pro', price: 18000, category: 'minuman' },
  { id: 2, name: 'Nasi Goreng Spesial', price: 25000, category: 'makanan' },
  { id: 3, name: 'Roti Bakar Keju', price: 16000, category: 'snack' }
];

let cart = [];
let transactions = [];
let selectedPayment = 'Cash';

// FUNGSI MODUL POS (KASIR)
function renderPOSProducts(items = products) {
  const list = document.getElementById('posProductList');
  if (!list) return;
  list.innerHTML = items.map(p => `
    <div class="card-product" onclick="addToCart(${p.id})">
      <div class="product-name">${p.name}</div>
      <div style="font-size:0.75rem; color:var(--text-sub); text-transform:capitalize;">${p.category}</div>
      <div class="product-price">Rp ${p.price.toLocaleString('id-ID')}</div>
    </div>
  `).join('');
}

function addToCart(id) {
  const p = products.find(prod => prod.id === id);
  const inCart = cart.find(item => item.id === id);
  if (inCart) { inCart.qty += 1; } 
  else { cart.push({ ...p, qty: 1 }); }
  updateCartView();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  updateCartView();
}

function resetCart() { cart = []; updateCartView(); }

function updateCartView() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-sub); margin-top:50px;">Keranjang kosong</p>';
    document.getElementById('txtSubtotal').innerText = 'Rp 0';
    document.getElementById('txtTax').innerText = 'Rp 0';
    document.getElementById('txtTotal').innerText = 'Rp 0';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    subtotal += item.price * item.qty;
    return `
      <div class="cart-item">
        <div>
          <div style="font-weight:700; font-size:0.85rem;">${item.name}</div>
          <div style="color:var(--primary); font-size:0.8rem; font-weight:700;">Rp ${item.price.toLocaleString('id-ID')}</div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>
          <span style="font-weight:700;">${item.qty}</span>
          <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  document.getElementById('txtSubtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
  document.getElementById('txtTax').innerText = `Rp ${tax.toLocaleString('id-ID')}`;
  document.getElementById('txtTotal').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function setCategory(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
  renderPOSProducts(filtered);
}

function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  renderPOSProducts(products.filter(p => p.name.toLowerCase().includes(q)));
}

function setPayment(m, el) {
  selectedPayment = m;
  document.querySelectorAll('.pay-opt').forEach(opt => opt.classList.remove('active'));
  el.classList.add('active');
}

function processCheckout() {
  if (cart.length === 0) return alert('Pilih produk dulu!');
  const sub = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const total = sub * 1.1;
  const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);

  transactions.push({
    time: new Date().toLocaleTimeString('id-ID'),
    method: selectedPayment,
    details: cart.map(i => `${i.name} (${i.qty})`).join(', '),
    total: total,
    qty: totalQty
  });

  alert('Transaksi Berhasil Disimpan!');
  resetCart();
}

// FUNGSI MODUL INVENTORI
function renderProductTable() {
  const tbody = document.getElementById('tableProductBody');
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td><strong>${p.name}</strong></td>
      <td style="text-transform:capitalize;">${p.category}</td>
      <td>Rp ${p.price.toLocaleString('id-ID')}</td>
      <td><button style="background:var(--danger); color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;" onclick="deleteProduct(${p.id})">Hapus</button></td>
    </tr>
  `).join('');
}

function addNewProduct() {
  const name = document.getElementById('newProdName').value;
  const price = parseFloat(document.getElementById('newProdPrice').value);
  const cat = document.getElementById('newProdCat').value;

  if (!name || isNaN(price)) return alert('Isi nama dan harga dengan benar!');

  products.push({ id: Date.now(), name: name, price: price, category: cat });
  document.getElementById('newProdName').value = '';
  document.getElementById('newProdPrice').value = '';
  
  renderProductTable();
  alert('Produk Berhasil Ditambahkan!');
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  renderProductTable();
}

// FUNGSI MODUL LAPORAN
function renderReportView() {
  const omset = transactions.reduce((acc, t) => acc + t.total, 0);
  const itemsCount = transactions.reduce((acc, t) => acc + t.qty, 0);

  const elOmset = document.getElementById('statOmset');
  if (elOmset) elOmset.innerText = `Rp ${omset.toLocaleString('id-ID')}`;
  
  const elCount = document.getElementById('statCount');
  if (elCount) elCount.innerText = transactions.length;
  
  const elItems = document.getElementById('statItems');
  if (elItems) elItems.innerText = `${itemsCount} pcs`;

  const tbody = document.getElementById('tableReportBody');
  if (!tbody) return;
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${t.time}</td>
      <td><span style="background:#e6f8f0; color:var(--primary); padding:4px 8px; border-radius:6px; font-weight:700;">${t.method}</span></td>
      <td>${t.details}</td>
      <td><strong>Rp ${t.total.toLocaleString('id-ID')}</strong></td>
    </tr>
  `).join('');
}
