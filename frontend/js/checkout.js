updateCartCount();

const cart = getCart();
const itemsDiv = document.getElementById("orderItems");
const totalEl = document.getElementById("orderTotal");
const btn = document.getElementById("placeOrderBtn");

if (!cart.length) {
  window.location.href = "./shop.html";
}

let total = 0;

// Render items
cart.forEach(p => {
  total += p.price * p.quantity;

  itemsDiv.innerHTML += `
    <p>${p.name} × ${p.quantity} — ₹${p.price * p.quantity}</p>
  `;
});

totalEl.innerText = total;

// PLACE ORDER
btn.onclick = () => {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (!name || !phone || !address || !pincode) {
    alert("Please fill all address fields");
    return;
  }

  fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      address,
      pincode,
      items: cart,
      total
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Order placed successfully!");
    localStorage.removeItem("hotcraft_cart");
    window.location.href = "./shop.html";
  })
  .catch(() => {
    alert("Order failed. Try again.");
  });
};
