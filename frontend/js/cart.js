function renderCart() {
  const container = document.getElementById("cartContainer");
  const totalEl = document.getElementById("cartTotal");

  // ✅ Only run on cart page
  if (!container || !totalEl) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalEl.innerText = "0";
    updateCartCount();
    return;
  }

  let total = 0;

  cart.forEach(p => {
    const qty = Number(p.quantity) || 1;
    const price = Number(p.price) || 0;

    total += price * qty;

    const image = p.image
      ? `${API}/uploads/${p.image}`
      : "https://via.placeholder.com/120?text=Hotcraft";

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

  // ✅ FIXED: update total in UI
  totalEl.innerText = total;
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", renderCart);
