
// --- VOS IDENTIFIANTS ADMINISTRATEUR ---
const ADMIN_EMAIL = "ndongpierrewaly03@gmail.com";
const ADMIN_PASS = "piwan_savons221";

// --- CATALOGUE OFFICIEL PIWAN PRODUCTION ---
const defaults = [
  {
    id: 'carotte',
    name: 'Savon Carotte',
    short: 'Doux, purifiant & revitalisant',
    price: 1500,
    weight: '250 g · Préparé à la main',
    img: 'pot-carotte.webp',
    badge: 'À LA CAROTTE',
    stock: 10
  },
  {
    id: 'nebeday',
    name: 'Savon Nébéday',
    short: 'Frais, nourrissant & apaisant',
    price: 1500,
    weight: '250 g · Préparé à la main',
    img: 'pot-nebeday.webp',
    badge: 'AU MORINGA',
    stock: 10
  },
  {
    id: 'mbeurbeuf',
    name: 'Savon Mbeurbeuf',
    short: 'Purifiant, anti-imperfections & éclat',
    price: 1500,
    weight: '250 g · Préparé à la main',
    img: 'pot-mbeurbeuf.webp',
    badge: 'À LA MARGOSE',
    stock: 10
  },
  {
    id: 'pack',
    name: 'Pack Découverte',
    short: 'Les 3 savons réunis à prix préférentiel',
    price: 4000,
    weight: '3 x 250 g · Coffret complet',
    img: 'hero-trio.webp',
    badge: 'Offre spéciale',
    stock: 15
  }
];

// Initialisation du localStorage si vide
if (!localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify(defaults));
}

// Fonction de formatage des prix en FCFA
function money(amount) {
  return amount.toLocaleString() + ' FCFA';
}

// Fonction d'affichage des produits dans la boutique
function renderProducts() {
  const container = document.getElementById('product-grid');
  if (!container) return;
  
  const products = JSON.parse(localStorage.getItem('products')) || defaults;
  
  container.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="cardimg">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <div class="cardbody">
        <span class="tag">${p.badge || 'Savon artisanal'}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.short}</p>
        <div class="price">${money(p.price)}</div>
        <span class="weight">${p.weight || '250 g'}</span>
        <button class="add" onclick="add('${p.id}')">Ajouter au panier +</button>
      </div>
    </article>
  `).join('');
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
});
