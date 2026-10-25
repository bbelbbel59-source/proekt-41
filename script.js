const products = [
  { id: 1, name: "Classic White Tee", cat: "basic", price: 189000, old: 0, img: "tee-white.jpg", rating: 5, label: "Hit", desc: "Har kunlik kiyim uchun ideal oq oversize T-shirt. 220 GSM paxta." },
  { id: 2, name: "Orbit Graphic Tee", cat: "graphic", price: 259000, old: 349000, img: "favicon.jpg", rating: 5, label: "-26%", desc: "Limited drop. Qo'lda chizilgan to'q sariq grafika, qora fon." },
  { id: 3, name: "Olive Heavy Tee", cat: "basic", price: 209000, old: 0, img: "tee-olive.jpg", rating: 4, label: "Yangi", desc: "Zaytun rangidagi og'ir paxta T-shirt. Tabiiy va uslubli." },
  { id: 4, name: "Sunset Street Tee", cat: "graphic", price: 279000, old: 0, img: "hero.jpg", rating: 5, label: "Top", desc: "Ko'cha san'ati ruhidagi grafik T-shirt. Oversize fit." },
  { id: 5, name: "Pure White Sale", cat: "sale", price: 139000, old: 189000, img: "tee-white.jpg", rating: 4, label: "-26%", desc: "Klassik oq T-shirt maxsus narxda. Cheklangan miqdor." },
  { id: 6, name: "Night Orbit Tee", cat: "sale", price: 199000, old: 259000, img: "favicon.jpg", rating: 5, label: "-23%", desc: "Orbit kolleksiyasidan maxsus chegirmadagi model." },
  { id: 7, name: "Army Olive Sale", cat: "sale", price: 159000, old: 209000, img: "tee-olive.jpg", rating: 4, label: "-24%", desc: "Zaytun rangli basic T-shirt chegirmada." },
  { id: 8, name: "Rooftop Graphic", cat: "graphic", price: 289000, old: 0, img: "hero.jpg", rating: 5, label: "Hit", desc: "Shahar tepasida tug'ilgan dizayn. Premium bosma." }
];

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = n => n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";

let cart = JSON.parse(localStorage.getItem("volt_cart") || "[]");
let favs = JSON.parse(localStorage.getItem("volt_favs") || "[]");
let filter = "all";
let query = "";
let discount = 0;
let current = null;
let qty = 1;
let size = "M";

window.addEventListener("load", () => {
  setTimeout(() => {
    $("#loader").classList.add("done");
    document.body.classList.add("loaded");
  }, 1500);
});

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2400);
}

function renderProducts() {
  const list = products.filter(p => (filter === "all" || p.cat === filter) && p.name.toLowerCase().includes(query));
  $("#products").innerHTML = list.map((p, i) => `
    <div class="product" style="animation-delay:${i * 0.07}s">
      <div class="p-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <span class="p-label">${p.label}</span>
        <button class="p-fav ${favs.includes(p.id) ? "on" : ""}" data-fav="${p.id}">♥</button>
        <button class="p-quick" data-quick="${p.id}">Tez ko'rish</button>
      </div>
      <div class="p-body">
        <div class="stars">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)}</div>
        <h3>${p.name}</h3>
        <div class="p-meta">
          <div class="price">${fmt(p.price)}${p.old ? `<s>${fmt(p.old)}</s>` : ""}</div>
          <button class="add" data-add="${p.id}">+</button>
        </div>
      </div>
    </div>`).join("");
  $("#empty").style.display = list.length ? "none" : "block";
}

function save() {
  localStorage.setItem("volt_cart", JSON.stringify(cart));
  localStorage.setItem("volt_favs", JSON.stringify(favs));
}

function bump(el) {
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

function addToCart(id, s = "M", q = 1) {
  const item = cart.find(c => c.id === id && c.size === s);
  if (item) item.qty += q;
  else cart.push({ id, size: s, qty: q });
  save();
  renderCart();
  bump($("#cartCount"));
  toast("✓ Savatga qo'shildi");
}

function renderCart() {
  const count = cart.reduce((a, c) => a + c.qty, 0);
  $("#cartCount").textContent = count;
  $("#favCount").textContent = favs.length;
  if (!cart.length) {
    $("#cartItems").innerHTML = `<div class="cart-empty">Savat bo'sh 🛒<br><br><a href="#shop" class="btn btn-ghost sm" id="goShop">Xarid qilish</a></div>`;
  } else {
    $("#cartItems").innerHTML = cart.map((c, i) => {
      const p = products.find(x => x.id === c.id);
      return `<div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div><h4>${p.name}</h4><small>O'lcham: ${c.size} · ${fmt(p.price)}</small>
          <div class="ci-qty"><button data-dec="${i}">−</button><b>${c.qty}</b><button data-inc="${i}">+</button></div>
        </div>
        <button class="ci-del" data-del="${i}">✕</button>
      </div>`;
    }).join("");
  }
  const sum = cart.reduce((a, c) => a + products.find(p => p.id === c.id).price * c.qty, 0);
  $("#cartTotal").textContent = fmt(Math.round(sum * (1 - discount)));
}

function openCart() {
  $("#cart").classList.add("open");
  $("#overlay").classList.add("show");
  document.body.classList.add("lock");
}

function closeAll() {
  $("#cart").classList.remove("open");
  $("#overlay").classList.remove("show");
  $("#modal").classList.remove("show");
  $("#videoModal").classList.remove("show");
  $("#menu").classList.remove("open");
  $("#burger").classList.remove("open");
  document.body.classList.remove("lock");
}

function openModal(id) {
  current = products.find(p => p.id === id);
  qty = 1;
  size = "M";
  $("#mImg").src = current.img;
  $("#mName").textContent = current.name;
  $("#mCat").textContent = current.cat;
  $("#mPrice").innerHTML = fmt(current.price) + (current.old ? `<s>${fmt(current.old)}</s>` : "");
  $("#mDesc").textContent = current.desc;
  $("#qVal").textContent = qty;
  $("#mSizes").innerHTML = ["S", "M", "L", "XL", "XXL"].map(s => `<button class="${s === size ? "active" : ""}" data-size="${s}">${s}</button>`).join("");
  $("#modal").classList.add("show");
  document.body.classList.add("lock");
}

document.addEventListener("click", e => {
  const t = e.target;
  const add = t.closest("[data-add]");
  const fav = t.closest("[data-fav]");
  const quick = t.closest("[data-quick]");
  if (add) addToCart(+add.dataset.add);
  if (fav) {
    const id = +fav.dataset.fav;
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    fav.classList.toggle("on");
    save();
    renderCart();
    bump($("#favCount"));
    toast(favs.includes(id) ? "♥ Sevimlilarga qo'shildi" : "Sevimlilardan olib tashlandi");
  }
  if (quick) openModal(+quick.dataset.quick);
  if (t.dataset.inc) { cart[+t.dataset.inc].qty++; save(); renderCart(); }
  if (t.dataset.dec) {
    const i = +t.dataset.dec;
    cart[i].qty--;
    if (cart[i].qty < 1) cart.splice(i, 1);
    save(); renderCart();
  }
  if (t.dataset.del) { cart.splice(+t.dataset.del, 1); save(); renderCart(); toast("O'chirildi"); }
  if (t.closest("#mSizes button")) {
    size = t.dataset.size;
    $$("#mSizes button").forEach(b => b.classList.toggle("active", b === t));
  }
  if (t.id === "goShop") closeAll();
});

$$(".filter").forEach(b => b.addEventListener("click", () => {
  $$(".filter").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  filter = b.dataset.filter;
  renderProducts();
}));

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeAll);
$("#overlay").addEventListener("click", closeAll);
$("#closeModal").addEventListener("click", closeAll);
$("#closeVideo").addEventListener("click", closeAll);
$$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) closeAll(); }));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

$("#qPlus").addEventListener("click", () => { qty++; $("#qVal").textContent = qty; });
$("#qMinus").addEventListener("click", () => { if (qty > 1) qty--; $("#qVal").textContent = qty; });
$("#mAdd").addEventListener("click", () => { addToCart(current.id, size, qty); closeAll(); });

$("#favBtn").addEventListener("click", () => {
  if (!favs.length) return toast("Sevimlilar ro'yxati bo'sh");
  filter = "all";
  query = "";
  renderProducts();
  location.hash = "#shop";
  toast(`♥ ${favs.length} ta sevimli mahsulot`);
});

$("#promoBtn").addEventListener("click", () => {
  if ($("#promoInput").value.trim().toUpperCase() === "VOLT10") {
    discount = 0.1;
    toast("🎉 10% chegirma qo'llandi");
  } else {
    discount = 0;
    toast("Promo kod noto'g'ri");
  }
  renderCart();
});

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return toast("Avval savatga mahsulot qo'shing");
  cart = [];
  discount = 0;
  save();
  renderCart();
  closeAll();
  toast("✓ Buyurtma qabul qilindi! Tez orada qo'ng'iroq qilamiz");
});

$("#searchBtn").addEventListener("click", () => {
  $("#searchBar").classList.toggle("open");
  setTimeout(() => $("#searchInput").focus(), 300);
});
$("#searchInput").addEventListener("input", e => {
  query = e.target.value.toLowerCase().trim();
  renderProducts();
  if (query) document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});

$("#burger").addEventListener("click", () => {
  $("#burger").classList.toggle("open");
  $("#menu").classList.toggle("open");
});
$$(".menu a").forEach(a => a.addEventListener("click", () => {
  $("#menu").classList.remove("open");
  $("#burger").classList.remove("open");
}));

$("#videoBtn").addEventListener("click", () => {
  $("#videoModal").classList.add("show");
  document.body.classList.add("lock");
});

$$(".acc-q").forEach(q => q.addEventListener("click", () => {
  const item = q.parentElement;
  const open = item.classList.contains("open");
  $$(".acc-item").forEach(i => { i.classList.remove("open"); i.querySelector(".acc-a").style.maxHeight = null; });
  if (!open) {
    item.classList.add("open");
    const a = item.querySelector(".acc-a");
    a.style.maxHeight = a.scrollHeight + "px";
  }
}));

$("#sizeCalc").addEventListener("submit", e => {
  e.preventDefault();
  const h = +$("#height").value;
  const w = +$("#weight").value;
  const score = h * 0.4 + w * 0.9;
  let s = "S";
  if (score > 128) s = "M";
  if (score > 138) s = "L";
  if (score > 150) s = "XL";
  if (score > 165) s = "XXL";
  $("#sizeResult").innerHTML = `Sizga mos o'lcham: <b>${s}</b>`;
  $$("tbody tr").forEach(r => r.classList.toggle("hl", r.dataset.size === s));
});

$("#newsForm").addEventListener("submit", e => {
  e.preventDefault();
  $("#newsEmail").value = "";
  toast("✓ Obuna bo'ldingiz! Promo kod: VOLT10");
});

$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  toast(`Rahmat, ${$("#cName").value}! Xabaringiz yuborildi`);
  e.target.reset();
});

const slides = $("#slides");
const total = slides.children.length;
let idx = 0;
$("#dots").innerHTML = Array.from({ length: total }, (_, i) => `<button data-dot="${i}"></button>`).join("");
function go(i) {
  idx = (i + total) % total;
  slides.style.transform = `translateX(-${idx * 100}%)`;
  $$("#dots button").forEach((d, j) => d.classList.toggle("active", j === idx));
}
$("#next").addEventListener("click", () => go(idx + 1));
$("#prev").addEventListener("click", () => go(idx - 1));
$$("#dots button").forEach(d => d.addEventListener("click", () => go(+d.dataset.dot)));
let auto = setInterval(() => go(idx + 1), 5000);
$(".slider").addEventListener("mouseenter", () => clearInterval(auto));
$(".slider").addEventListener("mouseleave", () => auto = setInterval(() => go(idx + 1), 5000));
go(0);

const end = Date.now() + 3 * 864e5 + 7 * 36e5;
function tick() {
  const d = Math.max(0, end - Date.now());
  const pad = n => String(Math.floor(n)).padStart(2, "0");
  $("#d").textContent = pad(d / 864e5);
  $("#h").textContent = pad(d / 36e5 % 24);
  $("#m").textContent = pad(d / 6e4 % 60);
  $("#s").textContent = pad(d / 1e3 % 60);
}
tick();
setInterval(tick, 1000);

const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { threshold: 0.15 });
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.1 + "s"; io.observe(el); });

const cio = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target;
  const target = +el.dataset.target;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / 2000, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString("ru-RU") + (target > 1000 ? "+" : "");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  cio.unobserve(el);
}));
$$(".counter").forEach(c => cio.observe(c));

const sections = $$("section[id]");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  $("#header").classList.toggle("scrolled", y > 40);
  $("#toTop").classList.toggle("show", y > 600);
  sections.forEach(s => {
    if (y >= s.offsetTop - 200 && y < s.offsetTop + s.offsetHeight - 200) {
      $$(".menu a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + s.id));
    }
  });
});
$("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const cursor = $("#cursor");
document.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});
document.addEventListener("mouseover", e => {
  cursor.classList.toggle("big", !!e.target.closest("a, button, .product"));
});

const tilt = $("#tilt");
tilt.addEventListener("mousemove", e => {
  const r = tilt.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  tilt.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
});
tilt.addEventListener("mouseleave", () => tilt.style.transform = "");

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();