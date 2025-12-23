function renderCart() {
  const container = document.getElementById("cartContainer");
  const totalEl = document.getElementById("cartTotal");

  // ✅ Run ONLY on cart page
  if (!container || !totalEl) return;

  const cart = getCart();
  container.innerHTML = "";

  if (!cart || cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalEl.innerText = "0";
    updateCartCount();
    return;
  }

  let total = 0;

  cart.forEach(p => {
    const qty = Number(p.quantity) || 1;
    const price = Number(p.price) || 0;
    const image = p.image
      ? `http://127.0.0.1:5000/uploads/${p.image}`
      : "/frontend/assets/images/placeholder.png";

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

          <button class="remove" onclick="removeFromCart(${p.id}); renderCart()">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = total;

const finalEl = document.getElementById("cartTotalFinal");
if (finalEl) finalEl.innerText = total;

  updateCartCount();
}

// ✅ Safe auto-run
document.addEventListener("DOMContentLoaded", renderCart);
