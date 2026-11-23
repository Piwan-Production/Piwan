
// --- VOS IDENTIFIANTS ADMINISTRATEUR ---
const ADMIN_EMAIL = "ndongpierrewaly03@gmail.com";
const ADMIN_PASS = "piwan_savons221";

const defaults = [
  {id:'carotte',name:'Savon Carotte',short:'Doux, purifiant & revitalisant',price:1500,weight:'250 g',img:'assets/carotte-pot-clean.jpg',label:'assets/carotte-label.jpg',ingredient:'assets/carotte-ingredient.jpg',badge:'À la carotte',stock:10},
  {id:'nebeday',name:'Savon Nébéday',short:'Frais, nourrissant & apaisant',price:1500,weight:'250 g',img:'assets/nebeday-pot-clean.jpg',label:'assets/nebeday-label.jpg',ingredient:'assets/moringa.jpg',badge:'Au moringa',stock:10},
  {id:'mbeurbeuf',name:'Savon Mbeurbeuf',short:'Purifiant, anti-imperfections & éclat',price:1500,weight:'250 g',img:'assets/mbeurbeuf-pot-clean.jpg',label:'assets/mbeurbeuf-label.jpg',ingredient:'assets/mbeurbeuf-plant.jpg',badge:'Au Mbeurbeuf',stock:10}
];

let products = JSON.parse(localStorage.getItem('piwanProducts') || 'null') || defaults;
let orders = JSON.parse(localStorage.getItem('piwanOrders') || '[]');
let cart = {};
let isAdminLoggedIn = sessionStorage.getItem('piwanAdminAuth') === 'true';

function money(n) {
  return Number(n).toLocaleString('fr-FR') + ' FCFA';
}

// --- AFFICHAGE DES PRODUITS ---
function renderProducts() {
  document.getElementById('products').innerHTML = products.map(p => `
    <article class="card">
      <div class="productvisual">
        <img class="pot" src="${p.img}" alt="${p.name}, pot de savon">
        <img class="productlabel" src="${p.label||''}" alt="Étiquette ${p.name}" onerror="this.style.display='none'">
        <img class="ingredient" src="${p.ingredient}" alt="Ingrédient associé" onerror="this.style.display='none'">
      </div>
      <div class="cardbody">
        <span class="tag">${p.badge || 'Savon artisanal'}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.short}</p>
        <div class="price">${money(p.price)}</div>
        <span class="weight">${p.weight || '250 g'} · Préparé à la main</span>
        <button class="add" onclick="add('${p.id}')">Ajouter au panier +</button>
      </div>
    </article>
  `).join('');
}

// --- GESTION DU PANIER ---
function add(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  toast('Ajouté au panier 🌿');
}

function adjust(id, n) {
  cart[id] = (cart[id] || 0) + n;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function total() {
  return products.reduce((s, p) => s + (p.price * (cart[p.id] || 0)), 0);
}

function renderCart() {
  let count = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById('cartcount').textContent = count;
  document.getElementById('carttotal').textContent = total().toLocaleString('fr-FR');
  document.getElementById('totalprice').textContent = money(total());
  document.getElementById('cartitems').innerHTML = count ? products.filter(p => cart[p.id]).map(p => `
    <div class="cartrow">
      <div><b>${p.name}</b><small>${money(p.price)} · ${p.weight}</small></div>
      <div class="qty">
        <button onclick="adjust('${p.id}',-1)">−</button>
        <b>${cart[p.id]}</b>
        <button onclick="adjust('${p.id}',1)">+</button>
      </div>
    </div>
  `).join('') : '<p style="color:#777">Votre panier est vide. Choisissez un savon pour commencer.</p>';
}

function openCart() {
  closePanels();
  document.getElementById('cart').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}

function closePanels() {
  document.getElementById('cart').classList.remove('open');
  document.getElementById('admin').classList.remove('show');
  document.getElementById('loginModal').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

// --- ENREGISTREMENT DE LA COMMANDE (SANS SORTIR VERS WHATSAPP) ---
function submitOrder() {
  if (!total()) {
    toast('Votre panier est vide');
    return;
  }
  
  const name = document.getElementById('customername').value;
  const phone = document.getElementById('customerphone').value;
  const email = document.getElementById('customeremail').value;
  const city = document.getElementById('customerlocation').value;
  
  const itemsList = products.filter(p => cart[p.id]).map(p => ({
    name: p.name,
    qty: cart[p.id],
    subtotal: p.price * cart[p.id]
  }));

  const newOrder = {
    id: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
    customer: { name, phone, email, city },
    items: itemsList,
    total: total()
  };

  // Sauvegarde de la commande
  orders.unshift(newOrder);
  localStorage.setItem('piwanOrders', JSON.stringify(orders));

  // Vider le panier et fermer
  cart = {};
  renderCart();
  document.querySelector('.checkout').reset();
  closePanels();
  
  toast('✅ Commande enregistrée ! Nous vous contacterons très vite.');
}

function waveInfo() {
  toast('Numéro Wave : 77 666 11 87 (Piwan Production)');
}

function toast(t) {
  let el = document.getElementById('toast');
  el.textContent = t;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

// --- CONNEXION & ESPACE ADMIN ---
function openLogin() {
  closePanels();
  if (isAdminLoggedIn) {
    openAdmin();
  } else {
    document.getElementById('loginModal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
  }
}

function handleLogin() {
  const email = document.getElementById('adminEmail').value.trim();
  const pass = document.getElementById('adminPass').value.trim();

  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    isAdminLoggedIn = true;
    sessionStorage.setItem('piwanAdminAuth', 'true');
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPass').value = '';
    openAdmin();
    toast('Connexion réussie 🌿');
  } else {
    toast('❌ E-mail ou mot de passe incorrect');
  }
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  sessionStorage.removeItem('piwanAdminAuth');
  closePanels();
  toast('Déconnecté de l\'espace gestion');
}

function openAdmin() {
  closePanels();
  document.getElementById('admin').classList.add('show');
  document.getElementById('overlay').classList.add('show');
  renderOrders();
  renderAdmin();
}

function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).style.display = 'block';
  btnElement.classList.add('active');
}

function renderOrders() {
  document.getElementById('orderCountBadge').textContent = orders.length;
  const container = document.getElementById('ordersList');
  
  if (orders.length === 0) {
    container.innerHTML = '<p style="color:#777;font-size:14px;">Aucune commande enregistrée pour le moment.</p>';
    return;
  }

  container.innerHTML = orders.map((o, index) => {
    const itemsText = o.items.map(i => `${i.qty}x ${i.name} (${money(i.subtotal)})`).join('<br>');
    const waMessage = `Bonjour ${o.customer.name}, c'est Piwan Production concernant votre commande ${o.id} d'un montant de ${money(o.total)}.`;
    const cleanPhone = o.customer.phone.replace(/\s+/g, '');

    return `
      <div class="order-card">
        <div class="order-header">
          <span>${o.id} — ${o.customer.name}</span>
          <span>${money(o.total)}</span>
        </div>
        <div style="font-size:12px;color:#666;">📅 ${o.date} · 📞 <b>${o.customer.phone}</b> · 📍 ${o.customer.city}</div>
        <div class="order-items">${itemsText}</div>
        <div class="order-actions">
          <a href="https://wa.me/221${cleanPhone}?text=${encodeURIComponent(waMessage)}" target="_blank" class="btn-wa-small">Contacter sur WhatsApp ↗</a>
          <button onclick="deleteOrder(${index})" class="btn-del-small">Marquer comme traitée / Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteOrder(index) {
  if (confirm('Voulez-vous supprimer cette commande de la liste ?')) {
    orders.splice(index, 1);
    localStorage.setItem('piwanOrders', JSON.stringify(orders));
    renderOrders();
    toast('Commande supprimée');
  }
}

function renderAdmin() {
  document.getElementById('adminrows').innerHTML = products.map(p => `
    <div class="adminrow">
      <div><b>${p.name}</b><small style="display:block;color:#777;margin-top:4px">Prix actuel : ${money(p.price)}</small></div>
      <label style="font-size:12px;">Prix (FCFA)<input type="number" min="0" id="price-${p.id}" value="${p.price}"></label>
      <label style="font-size:12px;">Stock<input type="number" min="0" id="stock-${p.id}" value="${p.stock ?? 0}"></label>
      <button class="deleteproduct" onclick="deleteProduct('${p.id}')">Supprimer</button>
    </div>
  `).join('');
}

function saveAdmin() {
  products = products.map(p => ({
    ...p,
    price: Number(document.getElementById('price-' + p.id).value),
    stock: Number(document.getElementById('stock-' + p.id).value)
  }));
  localStorage.setItem('piwanProducts', JSON.stringify(products));
  renderProducts();
  toast('Modifications enregistrées !');
}

function deleteProduct(id) {
  if (confirm('Supprimer ce produit de la boutique ?')) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('piwanProducts', JSON.stringify(products));
    renderAdmin();
    renderProducts();
    toast('Produit supprimé');
  }
}

async function fileData(input) {
  if (!input.files || !input.files[0]) return '';
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(input.files[0]);
  });
}

document.getElementById('addproductform').addEventListener('submit', async e => {
  e.preventDefault();
  const id = 'custom-' + Date.now();
  const img = await fileData(document.getElementById('newphoto'));
  const ingredient = await fileData(document.getElementById('newingredient'));
  
  products.push({
    id,
    name: document.getElementById('newname').value,
    short: document.getElementById('newdesc').value,
    price: Number(document.getElementById('newprice').value),
    weight: document.getElementById('newweight').value || '250 g',
    img: img || 'assets/carotte-pot-clean.jpg',
    label: '',
    ingredient: ingredient || 'assets/moringa.jpg',
    badge: document.getElementById('newbadge').value || 'Savon artisanal',
    stock: 10
  });
  
  localStorage.setItem('piwanProducts', JSON.stringify(products));
  renderAdmin();
  renderProducts();
  e.target.reset();
  toast('Nouveau produit ajouté !');
});

// Lancement initial
renderProducts();
renderCart();
