document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) return;

  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyValue = document.getElementById("qtyValue");
  const btn = document.getElementById("addToCartBtn");

  let selectedQty = 1;

  /* =========================
     LOAD MAIN PRODUCT
  ========================= */

  fetch(`${API}/products/${productId}`)
    .then(res => res.json())
    .then(p => {
      document.getElementById("productName").innerText = p.name;
      document.getElementById("productPrice").innerText = `₹${p.price}`;
      document.getElementById("productDescription").innerText = p.description;

      document.getElementById("productStock").innerText =
        p.stock > 0 ? `Only ${p.stock} left` : "Out of stock";

      let images = [];
      if (Array.isArray(p.images)) images = p.images;
      else {
        try { images = JSON.parse(p.images); } catch {}
      }

      document.getElementById("productImage").src =
        images.length
          ? `${API}/uploads/${images[0]}`
          : "https://via.placeholder.com/400";

      qtyValue.innerText = selectedQty;

      qtyMinus.onclick = () => {
        if (selectedQty > 1) {
          selectedQty--;
          qtyValue.innerText = selectedQty;
        }
      };

      qtyPlus.onclick = () => {
        if (selectedQty < p.stock) {
          selectedQty++;
          qtyValue.innerText = selectedQty;
        }
      };

      if (p.stock <= 0) {
        btn.disabled = true;
        btn.innerText = "Out of Stock";
        return;
      }

      btn.onclick = () => {
        addToCart(
          {
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            image: images[0] || ""
          },
          selectedQty
        );

        btn.innerText = "Added ✔";
        setTimeout(() => {
          btn.innerText = "Add to Cart";
        }, 1200);
      };
    });

  /* =========================
     SIMILAR PRODUCTS
  ========================= */

  fetch(`${API}/products`)
    .then(res => res.json())
    .then(products => {
      const grid = document.getElementById("similarGrid");
      if (!grid) return;

      products
        .filter(p => String(p.id) !== String(productId))
        .slice(0, 6)
        .forEach(p => {
          let img = "https://via.placeholder.com/200";

          if (Array.isArray(p.images) && p.images.length > 0) {
            img = `${API}/uploads/${p.images[0]}`;
          }

          const card = document.createElement("a");
          card.className = "similar-card";
          card.href = `product.html?id=${p.id}`;

          card.innerHTML = `
            <img src="${img}" alt="${p.name}">
            <div class="info">
              <h4>${p.name || "Hotcraft Diorama"}</h4>
              <span>₹${p.price}</span>
            </div>
          `;

          grid.appendChild(card);
        });
    });
});
