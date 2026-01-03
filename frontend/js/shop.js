/* =====================================================
   SHOP.JS — SESSION STORAGE + PRODUCTION SAFE (CACHED)
===================================================== */

/* =========================
   NAVBAR SCROLL EFFECT
========================= */
const navbar = document.querySelector(".shop-navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* =========================
   SCROLL REVEAL
========================= */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  }
);

/* =========================
   PRODUCT CACHE CONFIG (ADDED)
========================= */
const PRODUCT_CACHE_KEY = "hotcraft_products_cache";
const PRODUCT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/* =========================
   RENDER PRODUCTS (EXTRACTED, SAME LOGIC)
========================= */
function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  if (!Array.isArray(products) || products.length === 0) {
    grid.innerHTML = `
      <p style="text-align:center; opacity:0.6; grid-column:1/-1;">
        No products available
      </p>`;
    return;
  }

  // ✅ STORE ALL PRODUCTS FOR PRODUCT PAGE
  sessionStorage.setItem("allProducts", JSON.stringify(products));

  products.forEach(p => {
    /* =========================
       IMAGE SAFE HANDLING
    ========================= */
    let img = "https://via.placeholder.com/300?text=Hotcraft";
    let images = [];

    if (p.images) {
      if (Array.isArray(p.images)) {
        images = p.images;
      } else if (typeof p.images === "string") {
        try {
          images = JSON.parse(p.images);
        } catch {
          images = [];
        }
      }
    }

    if (images.length > 0 && typeof images[0] === "string") {
      img = images[0];
    }

    /* =========================
       CREATE PRODUCT CARD
    ========================= */
    const card = document.createElement("a");
    card.className = "product-card";
    card.href = `product.html?id=${p.id}`;

    // ✅ SAVE CLICKED PRODUCT
    card.addEventListener("click", () => {
      sessionStorage.setItem("selectedProduct", JSON.stringify(p));
    });

    card.innerHTML = `
      <div class="image-wrap">
        <img src="${img}" alt="${p.name || "Product"}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${p.name || "Hotcraft Diorama"}</h3>
        <p>Handmade · Limited Edition</p>
        <span class="price">₹${p.price}</span>
      </div>
    `;

    grid.appendChild(card);
    observer.observe(card);
  });
}

/* =========================
   LOAD PRODUCTS (CACHED)
========================= */
(async function loadProducts() {
  const cached = JSON.parse(localStorage.getItem(PRODUCT_CACHE_KEY));

  // ✅ INSTANT LOAD FROM CACHE
  if (cached && Date.now() - cached.time < PRODUCT_CACHE_TTL) {
    renderProducts(cached.data);
  }

  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    // ✅ UPDATE CACHE
    localStorage.setItem(
      PRODUCT_CACHE_KEY,
      JSON.stringify({
        data: products,
        time: Date.now()
      })
    );

    renderProducts(products);
  } catch (err) {
    console.error("Error loading products:", err);

    // ❗ FALLBACK IF API FAILS BUT CACHE EXISTS
    if (cached && cached.data) {
      renderProducts(cached.data);
      return;
    }

    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `
        <p style="text-align:center; color:#ff4d4d; grid-column:1/-1;">
          Failed to load products. Please refresh.
        </p>`;
    }
  }
})();

/* =========================
   CART COUNT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
});
