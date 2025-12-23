const API = "http://127.0.0.1:5000";

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
      console.log("SHOP PRODUCT:", p); // debug (keep)

      // ---------- IMAGE HANDLING ----------
      let img = "https://via.placeholder.com/300?text=Hotcraft";

      // p.images may be string or array
      let images = [];

      if (Array.isArray(p.images)) {
        images = p.images;
      } else if (typeof p.images === "string") {
        try {
          images = JSON.parse(p.images);
        } catch (e) {
          images = [];
        }
      }

      if (images.length > 0) {
        img = `${API}/uploads/${images[0]}`;
      }

      // ---------- PRODUCT CARD ----------
      const card = document.createElement("a");
      card.className = "product-card";
      card.href = `/frontend/pages/product.html?id=${p.id}`;

      card.innerHTML = `
  <div class="image-wrap">
    <img src="${img}" alt="${p.name}">
  </div>

  <div class="product-info">
    <h3>${p.name}</h3>
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
