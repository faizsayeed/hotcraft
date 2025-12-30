document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     GET PRODUCT FROM STORAGE
  ========================= */

  const stored = sessionStorage.getItem("selectedProduct");

  if (!stored) {
    // User opened product page directly
    window.location.href = "shop.html";
    return;
  }

  const p = JSON.parse(stored);

  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyValue = document.getElementById("qtyValue");
  const btn = document.getElementById("addToCartBtn");
  const mainImg = document.getElementById("productImage");

  let selectedQty = 1;

  /* =========================
     RENDER PRODUCT
  ========================= */

  document.getElementById("productName").innerText = p.name || "Hotcraft Product";
  document.getElementById("productPrice").innerText = `₹${p.price}`;
  document.getElementById("productDescription").innerText =
    p.description || "Handcrafted premium product.";

  document.getElementById("productStock").innerText =
    p.stock > 0 ? `Only ${p.stock} left` : "Out of stock";

  /* =========================
     IMAGE (100% SAFE)
  ========================= */

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

  let imageSrc = "https://via.placeholder.com/400?text=Hotcraft";

  if (images.length > 0 && typeof images[0] === "string") {
    imageSrc = images[0];
  }

  mainImg.src = imageSrc;
  mainImg.style.display = "block";
  mainImg.style.opacity = "1";

  mainImg.onerror = () => {
    mainImg.src = "https://via.placeholder.com/400?text=Image+Error";
  };

  /* =========================
     QUANTITY
  ========================= */

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

  /* =========================
     ADD TO CART
  ========================= */

  if (p.stock <= 0) {
    btn.disabled = true;
    btn.innerText = "Out of Stock";
  } else {
    btn.onclick = () => {
      addToCart(
        {
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          image: imageSrc
        },
        selectedQty
      );

      btn.innerText = "Added ✔";
      setTimeout(() => (btn.innerText = "Add to Cart"), 1200);
    };
  }

  /* =========================
     SIMILAR PRODUCTS (FROM STORAGE LIST)
  ========================= */

  const grid = document.getElementById("similarGrid");
  const allProducts = JSON.parse(sessionStorage.getItem("allProducts") || "[]");

  if (grid && allProducts.length > 0) {
    allProducts
      .filter(x => String(x.id) !== String(p.id))
      .slice(0, 6)
      .forEach(sp => {
        let img = "https://via.placeholder.com/200";

        if (sp.images) {
          let imgs = [];
          if (Array.isArray(sp.images)) imgs = sp.images;
          else {
            try { imgs = JSON.parse(sp.images); } catch {}
          }
          if (imgs.length > 0) img = imgs[0];
        }

        const card = document.createElement("a");
        card.className = "similar-card";
        card.href = `product.html?id=${sp.id}`;

        card.onclick = () => {
          sessionStorage.setItem("selectedProduct", JSON.stringify(sp));
        };

        card.innerHTML = `
          <img src="${img}" alt="${sp.name}">
          <div class="info">
            <h4>${sp.name}</h4>
            <span>₹${sp.price}</span>
          </div>
        `;

        grid.appendChild(card);
      });
  }
});
