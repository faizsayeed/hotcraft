// 1. Navbar Scroll Effect
    const navbar = document.querySelector('.shop-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animation for Product Cards
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the card is visible
        rootMargin: '0px 0px -50px 0px' // Slight offset so it feels more natural
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a slight stagger delay based on the index if you want
                // entry.target.style.transitionDelay = `${(index % 4) * 0.1}s`; 
                entry.target.classList.add('reveal');
                // Stop observing once revealed (optional)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observer to all product cards
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });

fetch(`${API}/products`)
  .then(res => res.json())
  .then(products => {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = "<p>No products available.</p>";
      return;
    }

    products.forEach(p => {
      console.log("SHOP PRODUCT:", p);

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

      const card = document.createElement("a");
      card.className = "product-card";

      // ✅ RELATIVE LINK (CRITICAL)
      card.href = `product.html?id=${p.id}`;

      card.innerHTML = `
        <div class="image-wrap">
          <img src="${img}" alt="${p.name}">
        </div>

        <div class="product-info">
          <h3>${
              !p.name || p.name === "undefined"
              ? "Hotcraft Diorama"
                : p.name
          }</h3>

          <p>Handmade · Limited Edition</p>
          <span class="price">₹${p.price}</span>
        </div>
      `;

      grid.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Error loading products", err);
    document.getElementById("productGrid").innerHTML =
      "<p>Failed to load products.</p>";
  });

  document.addEventListener("DOMContentLoaded", () => {
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
});
