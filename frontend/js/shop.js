/* =====================================================
   SHOP.JS — PRODUCTION READY (CACHE-FIXED)
===================================================== */

// 1. Navbar Scroll Effect
const navbar = document.querySelector('.shop-navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 2. Scroll Reveal Animation Logic
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

/* =====================================================
   PRODUCT LOADING LOGIC
===================================================== */

// PRODUCTION FIX: Adding a timestamp (?t=...) prevents Cloudflare/Browser caching
fetch(`${API}/products?t=${new Date().getTime()}`, {
    method: 'GET',
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
})
  .then(res => res.json())
  .then(products => {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = "<p style='text-align:center; opacity: 0.5; width: 100%; grid-column: 1/-1;'>No products available.</p>";
      return;
    }

    products.forEach((p, index) => {
      // Image Handling Logic
      let img = "https://via.placeholder.com/300?text=Hotcraft";
      let images = [];
      
      if (Array.isArray(p.images)) {
        images = p.images;
      } else if (typeof p.images === "string") {
        try {
          images = JSON.parse(p.images);
        } catch {
          images = [];
        }
      }

      if (images.length > 0) {
        img = `${API}/uploads/${images[0]}`;
      }

      // Create Card
      const card = document.createElement("a");
      card.className = "product-card";
      card.href = `product.html?id=${p.id}`;

      card.innerHTML = `
        <div class="image-wrap">
          <img src="${img}" alt="${p.name || 'Product'}">
        </div>
        <div class="product-info">
          <h3>${(!p.name || p.name === "undefined") ? "Hotcraft Diorama" : p.name}</h3>
          <p>Handmade · Limited Edition</p>
          <span class="price">₹${p.price}</span>
        </div>
      `;

      grid.appendChild(card);

      // Start observing the new card for the reveal animation
      observer.observe(card);
    });
  })
  .catch(err => {
    console.error("Error loading products:", err);
    const grid = document.getElementById("productGrid");
    if(grid) {
        grid.innerHTML = "<p style='text-align:center; color: #ff3b3b; grid-column: 1/-1;'>Failed to load products. Please refresh.</p>";
    }
  });

document.addEventListener("DOMContentLoaded", () => {
    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
});