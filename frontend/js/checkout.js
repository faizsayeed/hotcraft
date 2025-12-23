updateCartCount();

const cart = getCart();
const itemsDiv = document.getElementById("orderItems");
const totalEl = document.getElementById("orderTotal");

if (cart.length === 0) {
  
  window.location.href = "/frontend/pages/shop.html";
}

let total = 0;

cart.forEach(p => {
  total += p.price * p.quantity;

  itemsDiv.innerHTML += `
    <p>${p.name} × ${p.quantity} — ₹${p.price * p.quantity}</p>
  `;
});

totalEl.innerText = total;

document.getElementById("placeOrderBtn").onclick = () => {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (!name || !phone || !address || !pincode) {
    alert("Please fill all address fields");
    return;
  }

  fetch("http://127.0.0.1:5000/orders", {
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
  window.location.href = "/frontend/pages/shop.html";
});

};
