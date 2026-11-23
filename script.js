
/* ==========================================================
   PIWAN PRODUCTION
   BOUTIQUE - PHOTOS - PANIER - PACK - AVIS - STOCK

   MODIFIER LES PHOTOS DANS LA SECTION PHOTO_PATHS
   ========================================================== */

/* =========================
   1. PHOTOS DU SITE
   ========================= */

const PHOTO_PATHS = {
  carottePot: "assets/pot-carotte.webp",
  carotteIngredient: "assets/ing-carotte.webp",
  carotteLabel: "assets/carotte-label.jpg",

  nebedayPot: "assets/pot-nebeday.webp",
  nebedayIngredient: "assets/ing-moringa.webp",
  nebedayLabel: "assets/nebeday-label.jpg",

  mbeurbeufPot: "assets/pot-mbeurbeuf.webp",
  mbeurbeufIngredient: "assets/ing-mbeurbeuf.webp",
  mbeurbeufLabel: "assets/mbeurbeuf-label.jpg",

  accueil: "assets/moringa.jpg",
  philosophie: "assets/mbeurbeuf-plant.jpg",
  pack: "assets/hero-trio.webp"
};

/* =========================
   2. CONFIGURATION
   ========================= */

const WHATSAPP_NUMBER = "221776661187";
const LOW_STOCK_LIMIT = 5;
const PACK_PRICE_DEFAULT = 4000;
const PACK_ID = "piwan-pack";

/* =========================
   3. PRODUITS
   ========================= */

const defaultProducts = [
  {
    id: "carotte",
    name: "Savon Carotte",
    short: "Un savon artisanal inspiré de la carotte.",
    price: 1500,
    cost: 0,
    weight: "250 g",
    img: PHOTO_PATHS.potcarotte,
    label: PHOTO_PATHS.carotteLabel,
    ingredient: PHOTO_PATHS.carotteIngredient,
    badge: "À la carotte",
    emoji: "🥕",
    stock: 20,
    active: true
  },
  {
    id: "nebeday",
    name: "Savon Nébéday",
    short: "Un savon artisanal inspiré du moringa.",
    price: 1500,
    cost: 0,
    weight: "250 g",
    img: PHOTO_PATHS.potnebeday,
    label: PHOTO_PATHS.nebedayLabel,
    ingredient: PHOTO_PATHS.ingnebeday,
    badge: "Au moringa",
    emoji: "🌿",
    stock: 20,
    active: true
  },
  {
    id: "mbeurbeuf",
    name: "Savon Mbeurbeuf",
    short: "Un savon artisanal inspiré de la plante Mbeurbeuf.",
    price: 1500,
    cost: 0,
    weight: "250 g",
    img: PHOTO_PATHS.potmbeurbeuf,
    label: PHOTO_PATHS.mbeurbeufLabel,
    ingredient: PHOTO_PATHS.ingmbeurbeuf,
    badge: "Au Mbeurbeuf",
    emoji: "🌼",
    stock: 20,
    active: true
  }
];

/* =========================
   4. DONNÉES LOCALES
   ========================= */

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

let products = loadData("piwanProducts", defaultProducts);
let reviews = loadData("piwanReviews", []);
let cart = {};
let packPrice = Number(
  localStorage.getItem("piwanPackPrice") || PACK_PRICE_DEFAULT
);

/* =========================
   5. OUTILS
   ========================= */

function money(value) {
  return Number(value || 0).toLocaleString("fr-FR") + " FCFA";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function saveProducts() {
  localStorage.setItem("piwanProducts", JSON.stringify(products));
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.piwanToastTimer);

  window.piwanToastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2800);
}

/* =========================
   6. PHOTOS DE PRÉSENTATION
   ========================= */

function applyPhotos() {
  document.getElementById("heroPhoto").src = PHOTO_PATHS.accueil;
  document.getElementById("storyPhoto").src = PHOTO_PATHS.philosophie;
  document.getElementById("packPhoto").src = PHOTO_PATHS.pack;
}

/* =========================
   7. STOCK ET PRODUITS
   ========================= */

function renderProducts() {
  const container = document.getElementById("products");

  const visibleProducts = products.filter(p => p.active !== false);

  container.innerHTML = visibleProducts.map(product => {
    const stock = Number(product.stock || 0);
    const outOfStock = stock <= 0;

    return `
      <article class="card">
        <div class="productvisual ${outOfStock ? "out" : ""}">
          <img class="pot"
               src="${escapeHTML(product.img)}"
               alt="${escapeHTML(product.name)}"
               onerror="this.src='assets/placeholder.jpg'">

          ${product.label ? `
            <img class="productlabel"
                 src="${escapeHTML(product.label)}"
                 alt="Étiquette ${escapeHTML(product.name)}"
                 onerror="this.style.display='none'">
          ` : ""}

          ${product.ingredient ? `
            <img class="ingredient"
                 src="${escapeHTML(product.ingredient)}"
                 alt="Ingrédient ${escapeHTML(product.name)}"
                 onerror="this.style.display='none'">
          ` : ""}
        </div>

        <div class="cardbody">
          <span class="tag">${escapeHTML(product.badge || "Savon artisanal")}</span>

          <h3>${escapeHTML(product.name)}</h3>

          <p class="desc">${escapeHTML(product.short || "")}</p>

          <div class="price">${money(product.price)}</div>

          <span class="weight">
            ${escapeHTML(product.weight || "250 g")} · Préparé à la main
          </span>

          <div class="stocklabel ${outOfStock ? "stockout" : ""}">
            ${outOfStock ? "Rupture de stock" :
              stock <= LOW_STOCK_LIMIT ? `Plus que ${stock} en stock` :
              "Disponible"}
          </div>

          <button class="add"
                  ${outOfStock ? "disabled" : ""}
                  onclick="add('${product.id}')">
            ${outOfStock ? "Indisponible" : "Ajouter au panier +"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

/* =========================
   8. PACK DE 3 SAVONS
   ========================= */

function packStock() {
  const activeProducts = products.filter(p =>
    ["carotte", "nebeday", "mbeurbeuf"].includes(p.id)
  );

  if (activeProducts.length < 3) return 0;

  return Math.min(...activeProducts.map(p => Number(p.stock || 0)));
}

function addPack() {
  if (packStock() <= 0) {
    toast("Le pack est momentanément indisponible.");
    return;
  }

  cart[PACK_ID] = (cart[PACK_ID] || 0) + 1;
  renderCart();
  toast("Pack découverte ajouté 🌿");
}

/* =========================
   9. PANIER
   ========================= */

function add(id) {
  const product = products.find(p => p.id === id);

  if (!product || product.stock <= 0) {
    toast("Ce produit est indisponible.");
    return;
  }

  const quantity = cart[id] || 0;

  if (quantity >= product.stock) {
    toast("Stock disponible insuffisant.");
    return;
  }

  cart[id] = quantity + 1;
  renderCart();
  toast("Ajouté au panier 🌿");
}

function adjust(id, amount) {
  const current = cart[id] || 0;
  const next = current + amount;

  if (id === PACK_ID) {
    if (next > packStock()) {
      toast("Stock disponible insuffisant pour ce pack.");
      return;
    }
  } else {
    const product = products.find(p => p.id === id);

    if (product && next > product.stock) {
      toast("Stock disponible insuffisant.");
      return;
    }
  }

  if (next <= 0) {
    delete cart[id];
  } else {
    cart[id] = next;
  }

  renderCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function cartTotal() {
  let sum = 0;

  products.forEach(product => {
    sum += product.price * (cart[product.id] || 0);
  });

  sum += packPrice * (cart[PACK_ID] || 0);

  return sum;
}

function cartLines() {
  const lines = [];

  products.forEach(product => {
    const quantity = cart[product.id] || 0;

    if (quantity > 0) {
      lines.push({
        id: product.id,
        name: product.name,
        quantity,
        price: product.price,
        stock: product.stock
      });
    }
  });

  const packQuantity = cart[PACK_ID] || 0;

  if (packQuantity > 0) {
    lines.push({
      id: PACK_ID,
      name: "Pack découverte (Carotte + Nébéday + Mbeurbeuf)",
      quantity: packQuantity,
      price: packPrice,
      stock: packStock()
    });
  }

  return lines;
}

function renderCart() {
  const count = cartCount();
  const total = cartTotal();

  document.getElementById("cartcount").textContent = count;
  document.getElementById("carttotal").textContent = total.toLocaleString("fr-FR");
  document.getElementById("totalprice").textContent = money(total);

  const container = document.getElementById("cartitems");
  const lines = cartLines();

  if (!lines.length) {
    container.innerHTML = `
      <p class="emptycart">
        Votre panier est vide. Choisissez un savon pour commencer.
      </p>
    `;
    return;
  }

  container.innerHTML = lines.map(line => `
    <div class="cartrow">
      <div>
        <b>${escapeHTML(line.name)}</b>
        <small>${money(line.price)} · ${line.quantity} article(s)</small>
      </div>

      <div class="qty">
        <button onclick="adjust('${line.id}',-1)">−</button>
        <b>${line.quantity}</b>
        <button onclick="adjust('${line.id}',1)">+</button>
      </div>
    </div>
  `).join("");
}

/* =========================
   10. PANELS
   ========================= */

function openCart() {
  document.getElementById("cart").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function closePanels() {
  document.getElementById("cart").classList.remove("open");
  document.getElementById("admin").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
}

function openAdmin() {
  document.getElementById("admin").classList.add("show");
  document.getElementById("overlay").classList.add("show");

  renderAdmin();
}

/* =========================
   11. COMMANDES WHATSAPP
   ========================= */

document.getElementById("checkoutForm").addEventListener("submit", function(event) {
  event.preventDefault();
  sendOrder();
});

function sendOrder() {
  if (!cartCount()) {
    toast("Votre panier est vide.");
    return;
  }

  const name = document.getElementById("customername").value.trim();
  const phone = document.getElementById("customerphone").value.trim();
  const email = document.getElementById("customeremail").value.trim();
  const city = document.getElementById("customerlocation").value.trim();

  if (!name || !phone) {
    toast("Merci de renseigner votre nom et votre téléphone.");
    return;
  }

  const lines = cartLines();

  const orderDetails = lines.map(line =>
    `${line.name} x${line.quantity} — ${money(line.price * line.quantity)}`
  ).join("\n");

  const message =
`Bonjour Piwan Production 🌿

Je souhaite passer une commande :

${orderDetails}

TOTAL : ${money(cartTotal())}

Nom : ${name}
Téléphone : ${phone}${email ? "\nE-mail : " + email : ""}${city ? "\nVille : " + city : ""}

Merci de me préciser les modalités de récupération de ma commande.`;

  const url = "https://wa.me/" + WHATSAPP_NUMBER +
    "?text=" + encodeURIComponent(message);

  window.open(url, "_blank");

  /* Enregistre une demande locale de commande, sans prétendre
     qu'elle est confirmée ou payée. */
  const orderHistory = loadData("piwanOrderHistory", []);

  orderHistory.push({
    date: new Date().toISOString(),
    customer: name,
    phone,
    items: lines,
    total: cartTotal(),
    status: "WhatsApp à confirmer"
  });

  localStorage.setItem("piwanOrderHistory", JSON.stringify(orderHistory));
}

/* =========================
   12. AVIS CLIENTS
   ========================= */

function renderReviews() {
  const container = document.getElementById("reviewsList");

  if (!reviews.length) {
    container.innerHTML = `
      <p class="no-reviews">
        Aucun avis pour le moment. Soyez le premier à partager votre expérience.
      </p>
    `;
    return;
  }

  container.innerHTML = reviews.slice().reverse().map(review => `
    <article class="reviewcard">
      <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
      <p>${escapeHTML(review.text)}</p>
      <small>${escapeHTML(review.name)}</small>
    </article>
  `).join("");
}

document.getElementById("reviewForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("reviewName").value.trim();
  const rating = Number(document.getElementById("reviewRating").value);
  const text = document.getElementById("reviewText").value.trim();

  if (!name || !text) return;

  reviews.push({
    name,
    rating,
    text,
    date: new Date().toISOString()
  });

  localStorage.setItem("piwanReviews", JSON.stringify(reviews));

  this.reset();
  renderReviews();

  toast("Merci pour votre avis ❤️");
});

/* =========================
   13. ADMIN : STOCK ET PRIX
   ========================= */

function renderAdmin() {
  const container = document.getElementById("adminrows");

  container.innerHTML = products.map(product => `
    <div class="adminrow">
      <div class="adminproductname">
        <b>${escapeHTML(product.name)}</b>
        <small>Stock actuel : ${product.stock || 0}</small>
      </div>

      <label>Prix
        <input type="number" min="0"
          id="price-${product.id}" value="${product.price}">
      </label>

      <label>Stock
        <input type="number" min="0"
          id="stock-${product.id}" value="${product.stock || 0}">
      </label>

      <label>Coût de fabrication
        <input type="number" min="0"
          id="cost-${product.id}" value="${product.cost || 0}">
      </label>

      <label class="adminphoto">Photo du pot
        <input id="img-${product.id}" value="${escapeHTML(product.img)}">
      </label>

      <label class="adminphoto">Photo ingrédient
        <input id="ingredient-${product.id}" value="${escapeHTML(product.ingredient || "")}">
      </label>

      <button class="deleteproduct"
        onclick="deleteProduct('${product.id}')">Supprimer</button>
    </div>
  `).join("");

  document.getElementById("packprice").value = packPrice;

  renderStats();
}

function saveAdmin() {
  products = products.map(product => ({
    ...product,
    price: Number(document.getElementById("price-" + product.id).value),
    stock: Math.max(0, Number(document.getElementById("stock-" + product.id).value)),
    cost: Math.max(0, Number(document.getElementById("cost-" + product.id).value)),
    img: document.getElementById("img-" + product.id).value.trim(),
    ingredient: document.getElementById("ingredient-" + product.id).value.trim()
  }));

  saveProducts();
  renderProducts();
  renderAdmin();

  toast("Modifications enregistrées sur ce navigateur.");
}

function savePackPrice() {
  packPrice = Math.max(0, Number(document.getElementById("packprice").value));

  localStorage.setItem("piwanPackPrice", String(packPrice));

  renderCart();

  toast("Prix du pack enregistré.");
}

function deleteProduct(id) {
  if (!confirm("Supprimer ce produit ?")) return;

  products = products.filter(product => product.id !== id);
  delete cart[id];

  saveProducts();
  renderProducts();
  renderCart();
  renderAdmin();

  toast("Produit supprimé.");
}

/* =========================
   14. AJOUT DE PRODUITS
   ========================= */

document.getElementById("addproductform").addEventListener("submit", function(event) {
  event.preventDefault();

  const id = "custom-" + Date.now();

  const product = {
    id,
    name: document.getElementById("newname").value.trim(),
    price: Number(document.getElementById("newprice").value),
    stock: Math.max(0, Number(document.getElementById("newstock").value)),
    cost: 0,
    weight: document.getElementById("newweight").value.trim() || "250 g",
    badge: document.getElementById("newbadge").value.trim() || "Savon artisanal",
    short: document.getElementById("newdesc").value.trim(),
    img: document.getElementById("newimg").value.trim(),
    ingredient: document.getElementById("newingredient").value.trim(),
    label: "",
    active: true
  };

  products.push(product);

  saveProducts();
  renderProducts();
  renderAdmin();

  this.reset();

  toast("Produit ajouté.");
});

/* =========================
   15. STATISTIQUES LOCALES
   ========================= */

function renderStats() {
  const container = document.getElementById("stats");
  const history = loadData("piwanOrderHistory", []);

  const totalOrders = history.length;
  const totalRequested = history.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const lowStockProducts = products.filter(p => Number(p.stock || 0) <= LOW_STOCK_LIMIT);

  container.innerHTML = `
    <div class="statsgrid">
      <div class="statbox">
        <small>Demandes de commande enregistrées</small>
        <strong>${totalOrders}</strong>
      </div>

      <div class="statbox">
        <small>Total des commandes initiées sur ce navigateur</small>
        <strong>${money(totalRequested)}</strong>
      </div>
    </div>

    <h4>Alertes de stock</h4>

    ${lowStockProducts.length ? lowStockProducts.map(p => `
      <div class="stockalert">
        ${escapeHTML(p.name)} : ${p.stock <= 0 ? "Rupture" : p.stock + " pot(s) restant(s)"}
      </div>
    `).join("") : `
      <p>Pas d'alerte de stock.</p>
    `}

    <p class="statsnote">
      Ces statistiques sont locales. Les commandes WhatsApp ne sont pas automatiquement
      confirmées, payées ou synchronisées. Elles ne constituent donc pas un chiffre
      d'affaires réel.
    </p>
  `;
}

/* =========================
   16. INITIALISATION
   ========================= */

applyPhotos();
renderProducts();
renderCart();
renderReviews();
