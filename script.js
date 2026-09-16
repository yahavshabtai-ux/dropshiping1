
const products = [
  {
    id:1,name:"NovaSound Pro",category:"tech",categoryLabel:"TECH",price:129,oldPrice:199,rating:"4.9",
    badge:"BEST SELLER",description:"אוזניות אלחוטיות במראה פרימיום עם כריות רכות וחוויית שימוש נקייה.",
    image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id:2,name:"Pulse Watch",category:"tech",categoryLabel:"TECH",price:149,oldPrice:219,rating:"4.8",
    badge:"NEW DROP",description:"שעון חכם מינימליסטי עם מראה מודרני שמתאים לכל יום.",
    image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id:3,name:"Urban Carry",category:"lifestyle",categoryLabel:"LIFESTYLE",price:99,oldPrice:139,rating:"4.7",
    badge:"CURATED",description:"תיק יום‑יום חכם ללימודים, יציאות ונסיעות עם חלוקה נוחה.",
    image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id:4,name:"AirDots Mini",category:"tech",categoryLabel:"TECH",price:89,oldPrice:129,rating:"4.8",
    badge:"TRENDING",description:"אוזניות TWS קטנות עם קופסת טעינה קומפקטית ונוחה.",
    image:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id:5,name:"MechaKeys 65",category:"tech",categoryLabel:"GAMING",price:179,oldPrice:249,rating:"4.9",
    badge:"GAMING",description:"מקלדת קומפקטית למי שאוהב עמדת מחשב נקייה ומודרנית.",
    image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=88"
  },
  {
    id:6,name:"Glow Desk Lamp",category:"home",categoryLabel:"HOME",price:79,oldPrice:119,rating:"4.6",
    badge:"HOME PICK",description:"מנורת שולחן בעיצוב נקי שמוסיפה אווירה לפינת העבודה.",
    image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=88"
  }
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const state = {
  cart: JSON.parse(localStorage.getItem("yahavCartV2") || "{}"),
  coupon: localStorage.getItem("yahavCouponV2") === "YAHAV10",
  filter: "all",
  search: "",
  quickProductId: null
};

function money(v){ return `₪${Math.round(v)}`; }

function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(()=>el.classList.remove("show"),2400);
}

function persist(){
  localStorage.setItem("yahavCartV2",JSON.stringify(state.cart));
  localStorage.setItem("yahavCouponV2",state.coupon ? "YAHAV10" : "");
}

function visibleProducts(){
  return products.filter(p=>{
    const filterOk = state.filter === "all" || p.category === state.filter;
    const q = state.search.trim().toLowerCase();
    const searchOk = !q || `${p.name} ${p.description} ${p.categoryLabel}`.toLowerCase().includes(q);
    return filterOk && searchOk;
  });
}

function renderProducts(){
  const list = visibleProducts();
  const grid = $("#productsGrid");
  grid.innerHTML = list.length ? list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-badge">${p.badge}</span>
        <button class="quick-btn" data-quick="${p.id}" aria-label="תצוגה מהירה">⌕</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${p.categoryLabel}</span><span>★ ${p.rating}</span></div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-foot">
          <div class="product-price"><strong>${money(p.price)}</strong><del>${money(p.oldPrice)}</del></div>
          <button class="product-add add-to-cart" data-product-id="${p.id}" aria-label="הוסף לעגלה">+</button>
        </div>
      </div>
    </article>
  `).join("") : `<div style="grid-column:1/-1;padding:50px;text-align:center;color:var(--muted)">לא מצאתי מוצר שמתאים לחיפוש הזה.</div>`;

  $$(".add-to-cart").forEach(btn=>btn.onclick=()=>addToCart(Number(btn.dataset.productId)));
  $$("[data-quick]").forEach(btn=>btn.onclick=()=>openQuick(Number(btn.dataset.quick)));
}

function addToCart(id){
  state.cart[id]=(state.cart[id]||0)+1;
  persist(); renderCart(); toast("נוסף לעגלה ✦");
}

function rows(){
  return Object.entries(state.cart).map(([id,qty])=>{
    const product=products.find(p=>p.id===Number(id));
    return product ? {product,qty} : null;
  }).filter(Boolean);
}

function updateQty(id,delta){
  state.cart[id]=(state.cart[id]||0)+delta;
  if(state.cart[id]<=0) delete state.cart[id];
  persist();renderCart();
}
function removeItem(id){ delete state.cart[id];persist();renderCart(); }

function renderCart(){
  const data=rows();
  $("#cartCount").textContent=data.reduce((s,r)=>s+r.qty,0);

  $("#cartItems").innerHTML = data.length ? data.map(({product,qty})=>`
    <div class="cart-item">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h4>${product.name}</h4>
        <div class="cart-item-price">${money(product.price)}</div>
        <div class="qty">
          <button data-action="inc" data-id="${product.id}">+</button>
          <span>${qty}</span>
          <button data-action="dec" data-id="${product.id}">−</button>
        </div>
      </div>
      <button class="remove" data-action="remove" data-id="${product.id}">✕</button>
    </div>
  `).join("") : `
    <div class="empty-cart">
      <div><span>◌</span><b>העגלה ריקה</b><p>תוסיף משהו מהדרופ ✦</p></div>
    </div>
  `;

  $$("[data-action]").forEach(btn=>{
    btn.onclick=()=>{
      const id=Number(btn.dataset.id);
      if(btn.dataset.action==="inc") updateQty(id,1);
      if(btn.dataset.action==="dec") updateQty(id,-1);
      if(btn.dataset.action==="remove") removeItem(id);
    }
  });

  const subtotal=data.reduce((s,r)=>s+r.product.price*r.qty,0);
  const discount=state.coupon?subtotal*.10:0;
  const shipping=subtotal===0||subtotal>=199?0:19;
  const total=Math.max(0,subtotal-discount+shipping);

  $("#subtotal").textContent=money(subtotal);
  $("#discount").textContent=`−${money(discount)}`;
  $("#shipping").textContent=shipping===0?"חינם":money(shipping);
  $("#total").textContent=money(total);

  const pct=Math.min(100,Math.round((subtotal/199)*100));
  $("#shippingProgress").style.width=`${pct}%`;
  $("#shippingPercent").textContent=`${pct}%`;
  $("#shippingMessage").textContent=subtotal>=199
    ? "יש לך משלוח חינם ✓"
    : subtotal===0
      ? "הוסף מוצרים כדי לקבל משלוח חינם"
      : `חסרים ${money(199-subtotal)} למשלוח חינם`;

  if(state.coupon){
    $("#couponInput").value="YAHAV10";
    $("#couponMessage").textContent="✓ קוד YAHAV10 פעיל — 10% הנחה";
  }else{
    $("#couponMessage").textContent="";
  }
}

function openCart(){
  $("#cartDrawer").classList.add("open");
  $("#backdrop").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeCart(){
  $("#cartDrawer").classList.remove("open");
  $("#backdrop").classList.remove("open");
  document.body.classList.remove("no-scroll");
}

function openQuick(id){
  const p=products.find(x=>x.id===id);
  if(!p) return;
  state.quickProductId=id;
  $("#quickImage").src=p.image;
  $("#quickImage").alt=p.name;
  $("#quickCategory").textContent=p.categoryLabel;
  $("#quickName").textContent=p.name;
  $("#quickRating").textContent=`${p.rating}/5`;
  $("#quickDescription").textContent=p.description;
  $("#quickPrice").textContent=money(p.price);
  $("#quickOldPrice").textContent=money(p.oldPrice);
  $("#quickModal").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeQuick(){
  $("#quickModal").classList.remove("open");
  document.body.classList.remove("no-scroll");
}

$("#openCartBtn").onclick=openCart;
$("#heroCartBtn").onclick=openCart;
$("#closeCartBtn").onclick=closeCart;
$("#backdrop").onclick=closeCart;

$("#applyCouponBtn").onclick=()=>{
  if($("#couponInput").value.trim().toUpperCase()==="YAHAV10"){
    state.coupon=true;persist();renderCart();toast("10% הנחה הופעלה 🔥");
  }else{
    state.coupon=false;persist();renderCart();
    $("#couponMessage").textContent="הקוד לא תקין — נסה YAHAV10";
    $("#couponMessage").style.color="var(--danger)";
    setTimeout(()=>$("#couponMessage").style.color="",1600);
  }
};

$("#copyCoupon").onclick=async()=>{
  try{ await navigator.clipboard.writeText("YAHAV10");toast("הקוד YAHAV10 הועתק"); }
  catch{ toast("הקוד הוא YAHAV10"); }
};

$$(".filter").forEach(btn=>{
  btn.onclick=()=>{
    $$(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    state.filter=btn.dataset.filter;
    renderProducts();
  }
});

$("#productSearch").oninput=e=>{
  state.search=e.target.value;
  renderProducts();
};

$(".search-toggle").onclick=()=>{
  $("#searchPanel").classList.toggle("open");
  if($("#searchPanel").classList.contains("open")) setTimeout(()=>$("#globalSearch").focus(),200);
};
$("#closeSearch").onclick=()=>$("#searchPanel").classList.remove("open");
$("#globalSearch").oninput=e=>{
  state.search=e.target.value;
  $("#productSearch").value=e.target.value;
  renderProducts();
  document.querySelector("#products").scrollIntoView({behavior:"smooth"});
};

$(".theme-toggle").onclick=()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("yahavThemeV2",document.body.classList.contains("light")?"light":"dark");
};
if(localStorage.getItem("yahavThemeV2")==="light") document.body.classList.add("light");

$("#mobileToggle").onclick=()=>$("#mobileMenu").classList.toggle("open");
$$(".mobile-menu a").forEach(a=>a.onclick=()=>$("#mobileMenu").classList.remove("open"));

$("#quickClose").onclick=closeQuick;
$("#quickModal").onclick=e=>{if(e.target.id==="quickModal")closeQuick()};
$("#quickAddBtn").onclick=()=>{
  if(state.quickProductId) addToCart(state.quickProductId);
  closeQuick();openCart();
};

$("#checkoutBtn").onclick=()=>{
  if(!rows().length){toast("העגלה ריקה");return}
  closeCart();
  $("#checkoutModal").classList.add("open");
  document.body.classList.add("no-scroll");
};
$("#checkoutOk").onclick=()=>{
  $("#checkoutModal").classList.remove("open");
  document.body.classList.remove("no-scroll");
};
$("#checkoutModal").onclick=e=>{
  if(e.target.id==="checkoutModal"){
    $("#checkoutModal").classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
};

$("#newsletterForm").onsubmit=e=>{
  e.preventDefault();
  $("#newsletterEmail").value="";
  toast("נרשמת לדמו ✦");
};

$$("[data-toast]").forEach(a=>a.onclick=e=>{e.preventDefault();toast(a.dataset.toast)});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    closeCart();
    closeQuick();
    $("#searchPanel").classList.remove("open");
    $("#checkoutModal").classList.remove("open");
  }
});

$("#year").textContent=new Date().getFullYear();

renderProducts();
renderCart();
