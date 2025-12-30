/* =====================================================
   SHOP.JS — SESSION STORAGE + PRODUCTION SAFE
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
   LOAD PRODUCTS
========================= */

fetch(`${API}/products`)
  .then(res => res.json())
  .then(products => {
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
          <img src="${img}" alt="${p.name || "Product"}">
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
  })
  .catch(err => {
    console.error("Error loading products:", err);
    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `
        <p style="text-align:center; color:#ff4d4d; grid-column:1/-1;">
          Failed to load products. Please refresh.
        </p>`;
    }
  });

/* =========================
   CART COUNT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
});
