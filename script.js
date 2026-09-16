const products = [
  {
    id: 1,
    name: "NovaSound Pro",
    category: "tech",
    categoryLabel: "טכנולוגיה",
    price: 129,
    oldPrice: 199,
    rating: "4.9",
    badge: "BEST SELLER",
    description: "אוזניות אלחוטיות בעיצוב נקי עם כריות רכות וזמן שימוש ארוך.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 2,
    name: "Pulse Watch",
    category: "tech",
    categoryLabel: "טכנולוגיה",
    price: 149,
    oldPrice: 219,
    rating: "4.8",
    badge: "חדש",
    description: "שעון חכם מינימליסטי למעקב יומיומי, התראות וסגנון מודרני.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 3,
    name: "Urban Carry",
    category: "lifestyle",
    categoryLabel: "לייף סטייל",
    price: 99,
    oldPrice: 139,
    rating: "4.7",
    badge: "מומלץ",
    description: "תיק יום‑יום נוח עם חלוקה חכמה ללימודים, עבודה ונסיעות.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 4,
    name: "AirDots Mini",
    category: "tech",
    categoryLabel: "טכנולוגיה",
    price: 89,
    oldPrice: 129,
    rating: "4.8",
    badge: "חם עכשיו",
    description: "אוזניות TWS קומפקטיות עם קופסת טעינה קטנה לשימוש יומיומי.",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 5,
    name: "MechaKeys 65",
    category: "tech",
    categoryLabel: "טכנולוגיה",
    price: 179,
    oldPrice: 249,
    rating: "4.9",
    badge: "גיימינג",
    description: "מקלדת קומפקטית במראה נקי לעמדת מחשב מודרנית.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 6,
    name: "Glow Desk Lamp",
    category: "home",
    categoryLabel: "בית",
    price: 79,
    oldPrice: 119,
    rating: "4.6",
    badge: "לבית",
    description: "מנורת שולחן מעוצבת לאווירה נעימה ולפינת עבודה מסודרת.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  }
];

const state = {
  cart: JSON.parse(localStorage.getItem("yahavCart") || "{}"),
  coupon: localStorage.getItem("yahavCoupon") === "YAHAV10"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const productsGrid = $("#productsGrid");
const cartDrawer = $("#cartDrawer");
const overlay = $("#overlay");
const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const couponInput = $("#couponInput");
const couponMessage = $("#couponMessage");

function money(value) {
  return `₪${Math.round(value)}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function renderProducts(filter = "all") {
  const filtered = filter === "all"
    ? products
    : products.filter((p) => p.category === filter);

  productsGrid.innerHTML = filtered.map((p) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-badge">${p.badge}</span>
      </div>
      <div class="product-content">
        <div class="product-topline">
          <span>${p.categoryLabel}</span>
          <span>⭐ ${p.rating}</span>
        </div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-bottom">
          <div class="product-price">
            <strong>${money(p.price)}</strong>
            <del>${money(p.oldPrice)}</del>
          </div>
          <button class="btn btn-primary small-btn add-to-cart" data-product-id="${p.id}">הוסף לעגלה</button>
        </div>
      </div>
    </article>
  `).join("");

  bindAddButtons();
}

function bindAddButtons() {
  $$(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.productId);
      addToCart(id);
    });
  });
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  persist();
  renderCart();
  showToast("המוצר נוסף לעגלה 🛒");
}

function updateQty(id, delta) {
  state.cart[id] = (state.cart[id] || 0) + delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  persist();
  renderCart();
}

function removeFromCart(id) {
  delete state.cart[id];
  persist();
  renderCart();
}

function persist() {
  localStorage.setItem("yahavCart", JSON.stringify(state.cart));
  localStorage.setItem("yahavCoupon", state.coupon ? "YAHAV10" : "");
}

function getCartRows() {
  return Object.entries(state.cart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === Number(id));
      return product ? { product, qty } : null;
    })
    .filter(Boolean);
}

function renderCart() {
  const rows = getCartRows();
  const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);
  cartCount.textContent = totalQty;

  if (!rows.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div>
          <span>🛍️</span>
          <strong>העגלה עדיין ריקה</strong>
          <p>תוסיף משהו מגניב ונראה אותו כאן.</p>
        </div>
      </div>
    `;
  } else {
    cartItems.innerHTML = rows.map(({ product, qty }) => `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <div class="cart-item-price">${money(product.price)}</div>
          <div class="qty-control">
            <button data-action="inc" data-id="${product.id}" aria-label="הוספת כמות">+</button>
            <span>${qty}</span>
            <button data-action="dec" data-id="${product.id}" aria-label="הפחתת כמות">−</button>
          </div>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${product.id}" aria-label="הסרת מוצר">✕</button>
      </div>
    `).join("");
  }

  $$("#cartItems [data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "inc") updateQty(id, 1);
      if (action === "dec") updateQty(id, -1);
      if (action === "remove") removeFromCart(id);
    });
  });

  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.qty, 0);
  const discount = state.coupon ? subtotal * 0.10 : 0;
  const shipping = subtotal === 0 || subtotal >= 199 ? 0 : 19;
  const total = Math.max(0, subtotal - discount + shipping);

  $("#subtotal").textContent = money(subtotal);
  $("#discount").textContent = `−${money(discount)}`;
  $("#shipping").textContent = shipping === 0 ? "חינם" : money(shipping);
  $("#total").textContent = money(total);

  if (state.coupon) {
    couponInput.value = "YAHAV10";
    couponMessage.textContent = "✓ הקופון הופעל: 10% הנחה";
  } else {
    couponMessage.textContent = "";
  }
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

function openModal() {
  $("#checkoutModal").classList.add("open");
  $("#checkoutModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeModal() {
  $("#checkoutModal").classList.remove("open");
  $("#checkoutModal").setAttribute("aria-hidden", "true");
  if (!cartDrawer.classList.contains("open")) {
    document.body.classList.remove("no-scroll");
  }
}

$("#openCartBtn").addEventListener("click", openCart);
$("#closeCartBtn").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

$("#applyCouponBtn").addEventListener("click", () => {
  const code = couponInput.value.trim().toUpperCase();
  if (code === "YAHAV10") {
    state.coupon = true;
    couponMessage.textContent = "✓ הקופון הופעל: 10% הנחה";
    persist();
    renderCart();
    showToast("הקופון הופעל 🎉");
  } else {
    state.coupon = false;
    couponMessage.textContent = "הקוד לא תקין. נסה YAHAV10";
    couponMessage.style.color = "var(--danger)";
    setTimeout(() => {
      couponMessage.style.color = "";
    }, 1800);
    persist();
    renderCart();
  }
});

$("#checkoutBtn").addEventListener("click", () => {
  if (!getCartRows().length) {
    showToast("העגלה ריקה.");
    return;
  }
  closeCart();
  openModal();
});

$("#closeModalBtn").addEventListener("click", closeModal);
$("#modalOkBtn").addEventListener("click", closeModal);
$("#checkoutModal").addEventListener("click", (e) => {
  if (e.target.id === "checkoutModal") closeModal();
});

$$(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

$("#mobileMenuBtn").addEventListener("click", () => {
  $("#mobileNav").classList.toggle("open");
});

$$(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => $("#mobileNav").classList.remove("open"));
});

$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("yahavTheme", isDark ? "dark" : "light");
  $("#themeBtn").textContent = isDark ? "☀" : "☾";
});

if (localStorage.getItem("yahavTheme") === "dark") {
  document.body.classList.add("dark");
  $("#themeBtn").textContent = "☀";
}

$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("נרשמת בדמו ✅ (לא נשלח מידע)");
  $("#newsletterEmail").value = "";
});

$$("[data-toast]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showToast(el.dataset.toast);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeModal();
  }
});

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
