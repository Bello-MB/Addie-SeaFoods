// ================================
// ADDIE & LOBSTERS - CONFIG
// ================================
const CONFIG = {
  // Replace with your Paystack PUBLIC key from your dashboard.
  // Never put your Paystack SECRET key in this file.
  paystackPublicKey: 'pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY',

  // Nigerian WhatsApp number in international format, without + or spaces.
  whatsappNumber: '2347015010461',

  currency: 'NGN',
};

const products = [
  { id: 'prawns', name: 'Tiger Prawns', unit: 'pack', price: 12500, emoji: '🦐', description: 'Premium cleaned prawns, ready to cook.' },
  { id: 'catfish', name: 'Fresh Catfish', unit: 'kg', price: 7500, emoji: '🐟', description: 'Fresh catfish, cleaned and ready for delivery.' },
  { id: 'crab', name: 'Blue Crab', unit: 'kg', price: 10500, emoji: '🦀', description: 'Fresh blue crab selected for quality.' },
  { id: 'tilapia', name: 'Fresh Tilapia', unit: 'kg', price: 8500, emoji: '🐠', description: 'Whole fresh tilapia, cleaned on request.' },
  { id: 'salmon', name: 'Salmon Fillet', unit: 'pack', price: 18000, emoji: '🍣', description: 'Premium salmon portions for easy cooking.' },
  { id: 'lobster', name: 'Lobster', unit: 'piece', price: 22000, emoji: '🦞', description: 'Fresh lobster for special meals and events.' },
  { id: 'calamari', name: 'Calamari', unit: 'pack', price: 9500, emoji: '🦑', description: 'Tender cleaned squid, packed for cooking.' },
  { id: 'mussels', name: 'Mussels', unit: 'pack', price: 9000, emoji: '🐚', description: 'Fresh mussels, carefully selected and packed.' },
];

const cart = Object.fromEntries(products.map(p => [p.id, 0]));
const money = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: CONFIG.currency, maximumFractionDigits: 0 }).format(amount);

function getSelectedItems() {
  return products
    .filter(p => cart[p.id] > 0)
    .map(p => ({ ...p, quantity: cart[p.id], lineTotal: p.price * cart[p.id] }));
}

function getCartTotal() {
  return getSelectedItems().reduce((sum, item) => sum + item.lineTotal, 0);
}

function getCartCount() {
  return getSelectedItems().reduce((sum, item) => sum + item.quantity, 0);
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image" aria-hidden="true">${product.emoji}</div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-meta">${product.description}</div>
        <div class="price-row">
          <span class="price">${money(product.price)} <small>/ ${product.unit}</small></span>
          <div class="qty-control" aria-label="Quantity for ${product.name}">
            <button type="button" onclick="changeQty('${product.id}', -1)" aria-label="Decrease ${product.name}">−</button>
            <span id="qty-${product.id}">0</span>
            <button type="button" onclick="changeQty('${product.id}', 1)" aria-label="Increase ${product.name}">+</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, cart[id] + delta);
  document.getElementById(`qty-${id}`).textContent = cart[id];
  updateCartBar();
  renderOrderPreview();
}

function updateCartBar() {
  const count = getCartCount();
  const total = getCartTotal();
  document.getElementById('itemCount').textContent = count;
  document.getElementById('cartTotal').textContent = money(total);
  document.getElementById('checkoutBtn').disabled = count === 0;
}

function renderOrderPreview() {
  const items = getSelectedItems();
  const box = document.getElementById('orderPreview');
  if (!items.length) {
    box.innerHTML = '<p style="margin:0;color:#627d98">Your cart is empty.</p>';
  } else {
    box.innerHTML = items.map(item => `
      <div class="order-line">
        <span>${item.name} × ${item.quantity}</span>
        <strong>${money(item.lineTotal)}</strong>
      </div>
    `).join('');
  }
  document.getElementById('modalTotal').textContent = money(getCartTotal());
}

function openModal() {
  if (!getCartCount()) return;
  renderOrderPreview();
  document.getElementById('checkoutModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function buildOrderMessage(customer = {}) {
  const items = getSelectedItems();
  const lines = items.map(item => `• ${item.name} x${item.quantity} = ${money(item.lineTotal)}`).join('\n');
  return `Hello Addie & Lobsters, I want to confirm this seafood order.\n\n${lines}\n\nTotal: ${money(getCartTotal())}\nCustomer: ${customer.name || '-'}\nPhone: ${customer.phone || '-'}\nEmail: ${customer.email || '-'}\nDelivery address: ${customer.address || '-'}\n\nPlease confirm availability and delivery details.`;
}

function openWhatsApp(customer = {}) {
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(customer))}`;
  window.open(url, '_blank', 'noopener');
}

function validateConfig() {
  if (CONFIG.paystackPublicKey.includes('REPLACE_WITH_YOUR_PUBLIC_KEY')) {
    throw new Error('Add your Paystack PUBLIC key in script.js before accepting payments.');
  }
}

function makeReference() {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `OB-${Date.now()}-${random}`;
}

function collectCustomer() {
  return {
    name: document.getElementById('customerName').value.trim(),
    email: document.getElementById('customerEmail').value.trim(),
    phone: document.getElementById('customerPhone').value.trim(),
    address: document.getElementById('customerAddress').value.trim(),
  };
}

function startPayment(customer) {
  validateConfig();
  if (typeof PaystackPop === 'undefined') {
    alert('Paystack could not load. Check your internet connection and try again.');
    return;
  }

  const popup = new PaystackPop();
  const items = getSelectedItems();

  popup.checkout({
    key: CONFIG.paystackPublicKey,
    email: customer.email,
    amount: Math.round(getCartTotal() * 100), // NGN is sent in kobo.
    currency: CONFIG.currency,
    firstName: customer.name.split(' ')[0],
    phone: customer.phone,
    reference: makeReference(),
    metadata: {
      custom_fields: [
        { display_name: 'Customer', variable_name: 'customer_name', value: customer.name },
        { display_name: 'Phone', variable_name: 'customer_phone', value: customer.phone },
        { display_name: 'Delivery Address', variable_name: 'delivery_address', value: customer.address },
        { display_name: 'Order Items', variable_name: 'order_items', value: items.map(i => `${i.name} x${i.quantity}`).join(', ') },
      ],
    },
    onSuccess: (transaction) => {
      const message = `${buildOrderMessage(customer)}\n\nPAYMENT REFERENCE: ${transaction.reference}\nPayment completed in checkout. Please confirm my order.`;
      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      alert(`Payment submitted successfully. Reference: ${transaction.reference}\n\nWhatsApp will open so you can send the order details to the store.`);
    },
    onCancel: () => {
      alert('Payment was cancelled. Your cart is still saved.');
    },
    onError: (error) => {
      console.error(error);
      alert('There was a payment error. Please try again or order through WhatsApp.');
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartBar();
  renderOrderPreview();

  const generalWhatsApp = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello Addie & Lobsters, I would like to make an enquiry.')}`;
  document.getElementById('navWhatsApp').href = generalWhatsApp;
  document.getElementById('contactWhatsApp').href = generalWhatsApp;

  document.getElementById('checkoutBtn').addEventListener('click', openModal);
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));

  document.getElementById('checkoutForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const customer = collectCustomer();
    if (!customer.name || !customer.email || !customer.phone || !customer.address) return;
    try {
      startPayment(customer);
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('whatsappOrderBtn').addEventListener('click', () => {
    const customer = collectCustomer();
    openWhatsApp(customer);
  });
});
