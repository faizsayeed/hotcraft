const API = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    console.error("No product ID in URL");
    return;
  }

  // ✅ NEW: Quantity elements
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyValue = document.getElementById("qtyValue");

  let selectedQty = 1;

  fetch(`${API}/products/${productId}`)
    .then(res => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    })
    .then(p => {
      console.log("PRODUCT DATA:", p);

      // --------------------
      // BASIC DETAILS
      // --------------------
      document.getElementById("productName").innerText =
        p.name || "Unnamed Product";

      document.getElementById("productPrice").innerText =
        `₹${p.price || 0}`;

      document.getElementById("productDescription").innerText =
        p.description || "No description available.";

      const stockEl = document.getElementById("productStock");
      if (p.stock > 0) {
        stockEl.innerText = `Only ${p.stock} left`;
      } else {
        stockEl.innerText = "Out of stock";
      }

      // --------------------
      // IMAGE HANDLING
      // --------------------
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

      const mainImage = document.getElementById("productImage");
      mainImage.src =
        images.length > 0
          ? `${API}/uploads/${images[0]}`
          : "https://via.placeholder.com/400?text=Hotcraft";

      // --------------------
      // QUANTITY CONTROLS ✅
      // --------------------
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

      // --------------------
      // ADD TO CART (UPDATED)
      // --------------------
      const btn = document.getElementById("addToCartBtn");

      if (p.stock <= 0) {
        btn.disabled = true;
        btn.innerText = "Out of Stock";
        return;
      }

      btn.onclick = () => {
        for (let i = 0; i < selectedQty; i++) {
          addToCart({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            image: images.length > 0 ? images[0] : null
          });
        }

        alert(`Added ${selectedQty} item(s) to cart`);
      };
    })
    .catch(err => {
      console.error("Error loading product:", err);
      document.body.innerHTML = "<h2>Product not found</h2>";
    });
});
