
const products = [
  {
    id:1,
    name:"כיסוי סיליקון בהיר",
    category:"cases",
    categoryLabel:"כיסוי",
    price:14.90,
    oldPrice:19.90,
    badge:"LOW PRICE",
    image:"assets/products/cream-case-alt.jpg",
    description:"כיסוי סיליקון בהיר ונקי עם אזור מצלמות גדול.",
    compatibility:"התאמה משוערת: iPhone Pro / Pro Max מדורות דומים — מומלץ לאשר לפני הזמנה."
  },
  {
    id:2,
    name:"כיסוי שקוף קלאסי",
    category:"cases",
    categoryLabel:"כיסוי",
    price:9.90,
    oldPrice:14.90,
    badge:"BEST VALUE",
    image:"assets/products/clear-case.jpg",
    description:"כיסוי שקוף פשוט למראה נקי ושמירה על העיצוב המקורי של הטלפון.",
    compatibility:"התאמה משוערת: iPhone X / XS או דגם דומה — מומלץ לאשר לפני הזמנה."
  },
  {
    id:3,
    name:"כיסוי עם תא לכרטיס",
    category:"cases",
    categoryLabel:"כיסוי",
    price:19.90,
    oldPrice:29.90,
    badge:"PREMIUM",
    image:"assets/products/card-holder-case.jpg",
    description:"כיסוי שקוף־מעושן מחוזק עם תא אחורי שימושי לכרטיס.",
    compatibility:"התאמה משוערת: iPhone Pro / Pro Max מדורות דומים — מומלץ לאשר לפני הזמנה."
  },
  {
    id:4,
    name:"טבעת אחיזה מתכתית",
    category:"accessories",
    categoryLabel:"אביזר",
    price:4.90,
    oldPrice:7.90,
    badge:"ADD-ON",
    image:"assets/products/ring-holder.jpg",
    description:"טבעת אחיזה קטנה שמודבקת לגב הכיסוי ועוזרת להחזיק את הטלפון.",
    compatibility:"אביזר אוניברסלי בהדבקה — מתאים לרוב הכיסויים עם משטח אחורי שטוח."
  },
  {
    id:5,
    name:"באנדל כיסוי + טבעת",
    category:"accessories",
    categoryLabel:"באנדל",
    price:17.90,
    oldPrice:19.80,
    badge:"BUNDLE",
    image:"assets/products/cream-case-ring.jpg",
    description:"הכיסוי הבהיר יחד עם טבעת אחיזה במחיר נמוך יותר מקנייה בנפרד.",
    compatibility:"התאמת הכיסוי משוערת. הטבעת אוניברסלית בהדבקה."
  }
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = {
  cart: JSON.parse(localStorage.getItem("yahav-v3-cart") || "{}"),
  coupon: localStorage.getItem("yahav-v3-coupon") === "YAHAV10",
  filter:"all",
  search:"",
  quickId:null
};

function money(v){ return `₪${Number(v).toFixed(2).replace(".00","")}`; }
function persist(){
  localStorage.setItem("yahav-v3-cart", JSON.stringify(state.cart));
  localStorage.setItem("yahav-v3-coupon", state.coupon ? "YAHAV10" : "");
}
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove("show"),2200);
}

function visibleProducts(){
  const q=state.search.trim().toLowerCase();
  return products.filter(p=>{
    const f=state.filter==="all" || p.category===state.filter;
    const s=!q || `${p.name} ${p.description} ${p.categoryLabel}`.toLowerCase().includes(q);
    return f && s;
  });
}

function renderProducts(){
  const list=visibleProducts();
  $("#productsGrid").innerHTML = list.length ? list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="badge">${p.badge}</span>
        <button class="quick" data-quick="${p.id}" aria-label="תצוגה מהירה">⌕</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${p.categoryLabel}</span><span>במלאי</span></div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="compat-line">${p.compatibility}</div>
        <div class="product-bottom">
          <div class="price"><strong>${money(p.price)}</strong><del>${money(p.oldPrice)}</del></div>
          <button class="add add-to-cart" data-product-id="${p.id}" aria-label="הוסף לעגלה">+</button>
        </div>
      </div>
    </article>
  `).join("") : `<div style="grid-column:1/-1;padding:45px;text-align:center;color:#888">לא מצאתי מוצר כזה.</div>`;

  $$(".add-to-cart").forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.productId)));
  $$("[data-quick]").forEach(b=>b.onclick=()=>openQuick(Number(b.dataset.quick)));
}

function addToCart(id){
  state.cart[id]=(state.cart[id]||0)+1;
  persist(); renderCart(); toast("נוסף לעגלה ✓");
}
function cartRows(){
  return Object.entries(state.cart).map(([id,qty])=>{
    const product=products.find(p=>p.id===Number(id));
    return product?{product,qty}:null;
  }).filter(Boolean);
}
function changeQty(id,delta){
  state.cart[id]=(state.cart[id]||0)+delta;
  if(state.cart[id]<=0) delete state.cart[id];
  persist(); renderCart();
}
function removeItem(id){ delete state.cart[id]; persist(); renderCart(); }

function renderCart(){
  const rows=cartRows();
  $("#cartCount").textContent=rows.reduce((s,r)=>s+r.qty,0);
  $("#cartItems").innerHTML = rows.length ? rows.map(({product,qty})=>`
    <div class="cart-item">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h4>${product.name}</h4>
        <div class="item-price">${money(product.price)}</div>
        <div class="qty">
          <button data-action="inc" data-id="${product.id}">+</button>
          <span>${qty}</span>
          <button data-action="dec" data-id="${product.id}">−</button>
        </div>
      </div>
      <button class="remove" data-action="remove" data-id="${product.id}">✕</button>
    </div>
  `).join("") : `<div class="empty"><div><span>🛍️</span><b>העגלה ריקה</b><p>בחר מוצר והוסף אותו לכאן.</p></div></div>`;

  $$("[data-action]").forEach(b=>b.onclick=()=>{
    const id=Number(b.dataset.id);
    if(b.dataset.action==="inc") changeQty(id,1);
    if(b.dataset.action==="dec") changeQty(id,-1);
    if(b.dataset.action==="remove") removeItem(id);
  });

  const subtotal=rows.reduce((s,r)=>s+r.product.price*r.qty,0);
  const discount=state.coupon?subtotal*.10:0;
  const shipping=subtotal===0||subtotal>=49?0:9.90;
  const total=Math.max(0,subtotal-discount+shipping);
  $("#subtotal").textContent=money(subtotal);
  $("#discount").textContent=`−${money(discount)}`;
  $("#shipping").textContent=shipping===0?"חינם":money(shipping);
  $("#total").textContent=money(total);

  const pct=Math.min(100,Math.round((subtotal/49)*100));
  $("#shippingBar").style.width=`${pct}%`;
  $("#shippingPct").textContent=`${pct}%`;
  $("#shippingMsg").textContent=subtotal>=49 ? "יש לך משלוח חינם ✓" :
    subtotal===0 ? "הוסף מוצרים למשלוח חינם" : `חסרים ${money(49-subtotal)} למשלוח חינם`;

  if(state.coupon){
    $("#couponInput").value="YAHAV10";
    $("#couponMsg").textContent=`✓ YAHAV10 פעיל — חסכת ${money(discount)}`;
    $("#couponBreakdown").hidden=false;
    $("#couponBefore").textContent=money(subtotal + shipping);
    $("#couponSaved").textContent=`−${money(discount)}`;
    $("#couponAfter").textContent=money(total);
  }else{
    $("#couponMsg").textContent="";
    $("#couponBreakdown").hidden=true;
  }
}

function openCart(){
  $("#cart").classList.add("open"); $("#backdrop").classList.add("open"); document.body.classList.add("no-scroll");
}
function closeCart(){
  $("#cart").classList.remove("open"); $("#backdrop").classList.remove("open"); document.body.classList.remove("no-scroll");
}

function openQuick(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  state.quickId=id;
  $("#quickImage").src=p.image; $("#quickImage").alt=p.name;
  $("#quickCategory").textContent=p.categoryLabel;
  $("#quickName").textContent=p.name;
  $("#quickDescription").textContent=p.description;
  $("#quickCompatibility").textContent=p.compatibility;
  $("#quickPrice").textContent=money(p.price);
  $("#quickOldPrice").textContent=money(p.oldPrice);
  $("#quickModal").classList.add("open"); document.body.classList.add("no-scroll");
}
function closeQuick(){ $("#quickModal").classList.remove("open"); document.body.classList.remove("no-scroll"); }

$("#openCart").onclick=openCart;
$("#heroCart").onclick=openCart;
$("#closeCart").onclick=closeCart;
$("#backdrop").onclick=closeCart;

$("#couponBtn").onclick=()=>{
  if($("#couponInput").value.trim().toUpperCase()==="YAHAV10"){
    state.coupon=true; persist(); renderCart();
    const currentRows=cartRows();
    const currentSubtotal=currentRows.reduce((s,r)=>s+r.product.price*r.qty,0);
    const currentDiscount=currentSubtotal*.10;
    const currentShipping=currentSubtotal===0||currentSubtotal>=49?0:9.90;
    const currentTotal=Math.max(0,currentSubtotal-currentDiscount+currentShipping);
    toast(`הקופון הופעל ✓ לתשלום: ${money(currentTotal)}`);
  }else{
    state.coupon=false; persist(); renderCart();
    $("#couponMsg").textContent="הקוד לא תקין — נסה YAHAV10";
    $("#couponMsg").style.color="#c44";
    setTimeout(()=>$("#couponMsg").style.color="",1500);
  }
};

$$(".filter").forEach(b=>b.onclick=()=>{
  $$(".filter").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); state.filter=b.dataset.filter; renderProducts();
});
$("#productSearch").oninput=e=>{state.search=e.target.value;renderProducts()};
$("#globalSearch").oninput=e=>{
  state.search=e.target.value; $("#productSearch").value=e.target.value; renderProducts();
  document.querySelector("#products").scrollIntoView({behavior:"smooth"});
};

$("#searchBtn").onclick=()=>$("#searchPanel").classList.toggle("open");
$("#closeSearch").onclick=()=>$("#searchPanel").classList.remove("open");
$("#menuBtn").onclick=()=>$("#mobileMenu").classList.toggle("open");
$$(".mobile-menu a").forEach(a=>a.onclick=()=>$("#mobileMenu").classList.remove("open"));

$("#quickClose").onclick=closeQuick;
$("#quickModal").onclick=e=>{if(e.target.id==="quickModal")closeQuick()};
$("#quickAdd").onclick=()=>{
  if(state.quickId) addToCart(state.quickId);
  closeQuick(); openCart();
};

$("#checkout").onclick=()=>{
  if(!cartRows().length){toast("העגלה ריקה");return}
  closeCart(); $("#checkoutModal").classList.add("open"); document.body.classList.add("no-scroll");
};
$("#checkoutOk").onclick=()=>{
  $("#checkoutModal").classList.remove("open"); document.body.classList.remove("no-scroll");
};
$("#checkoutModal").onclick=e=>{
  if(e.target.id==="checkoutModal"){
    $("#checkoutModal").classList.remove("open");document.body.classList.remove("no-scroll");
  }
};

$$("[data-toast]").forEach(a=>a.onclick=e=>{e.preventDefault();toast(a.dataset.toast)});
$("#year").textContent=new Date().getFullYear();

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
  })
},{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    closeCart(); closeQuick(); $("#searchPanel").classList.remove("open");
    $("#checkoutModal").classList.remove("open");
  }
});

renderProducts();
renderCart();
