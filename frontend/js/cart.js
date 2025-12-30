/* =====================================================
   CART.JS — PRODUCTION SAFE (IMAGE FIXED)
===================================================== */

function renderCart() {
  const container = document.getElementById("cartContainer");
  const totalEl = document.getElementById("cartTotal");
  const finalEl = document.getElementById("cartTotalFinal");

  if (!container || !totalEl) return;

  const cart = getCart();
  container.innerHTML = "";

  /* ======================
     EMPTY CART
  ====================== */
  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalEl.innerText = "0";
    if (finalEl) finalEl.innerText = "0";
    updateCartCount();
    return;
  }

  let total = 0;

  /* ======================
     RENDER ITEMS
  ====================== */
  cart.forEach(p => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.price) || 0;
    if (qty <= 0) return;

    /* ======================
       IMAGE FIX (CRITICAL)
    ====================== */
    let image = "https://via.placeholder.com/120?text=Hotcraft";

    if (p.image && typeof p.image === "string") {
      image = p.image.startsWith("http")
        ? p.image
        : `${API}/uploads/${p.image}`;
    }

    total += price * qty;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${image}" alt="${p.name}">
        <div class="info">
          <h4>${p.name}</h4>
          <p>₹${price}</p>

          <div class="qty">
            <button onclick="updateQuantity(${p.id}, ${qty - 1}); renderCart()">−</button>
            <span>${qty}</span>
            <button onclick="updateQuantity(${p.id}, ${qty + 1}); renderCart()">+</button>
          </div>

          <button class="remove"
            onclick="removeFromCart(${p.id}); renderCart()">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  /* ======================
     TOTALS
  ====================== */
  totalEl.innerText = total;
  if (finalEl) finalEl.innerText = total;

  updateCartCount();
}

/* ======================
   INIT
====================== */
document.addEventListener("DOMContentLoaded", renderCart);
