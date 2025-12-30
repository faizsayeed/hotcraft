/* =======================
   AUTH HELPER
======================= */


function getAuthHeaders(isJson = false) {
  const token = localStorage.getItem("hotcraft_token");

  if (!token) {
    showToast("Admin not logged in", "error");
    throw new Error("No token found");
  }
  const headers = { "Authorization": "Bearer " + token };
  if (isJson) headers["Content-Type"] = "application/json";
  return headers;
}

/* =======================
   TOAST NOTIFICATIONS
======================= */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

/* =======================
   PRODUCTS SECTION
======================= */
function loadProducts() {
  // PRODUCTION FIX: Added timestamp to bypass Cloudflare cache
  fetch(`${API}/admin/products?t=${new Date().getTime()}`, {
    headers: getAuthHeaders()
  })
    .then(res => res.json())
    .then(products => {
      const list = document.getElementById("productList");
      list.innerHTML = "";
      products.forEach((p, index) => {
        const productDiv = document.createElement("div");
        productDiv.className = "product";
        // Staggered animation delay
        productDiv.style.animationDelay = `${index * 0.05}s`;
        
        productDiv.innerHTML = `
          <div>
            <strong>${p.name}</strong>
            <div style="font-size: 11px; color: #888; margin-top:4px;">
              ₹${p.price} | Stock: ${p.stock}
              ${p.stock < 3 ? `<span class="low">LOW STOCK</span>` : ""}
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="number" value="${p.stock}" 
                   style="width: 60px; margin-bottom:0;"
                   onchange="updateProduct(${p.id}, ${p.price}, this.value)">
            <button class="danger" onclick="removeProduct(${p.id})" 
                    style="background: #ff3b3b; padding: 8px 12px;">Delete</button>
          </div>
        `;
        list.appendChild(productDiv);
      });
    })
    .catch(() => showToast("Failed to load products", "error"));
}

function addProduct() {
  const btn = document.querySelector(".add button");
  const originalText = btn.innerText;
  
  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const stockInput = document.getElementById("stock");
  const descInput = document.getElementById("description");
  const imagesInput = document.getElementById("images");

  if (!nameInput.value.trim()) {
    showToast("Product name is required", "error");
    return;
  }

  // Visual feedback: Loading state
  btn.innerText = "UPLOADING...";
  btn.disabled = true;

  const formData = new FormData();
  formData.append("name", nameInput.value.trim());
  formData.append("price", priceInput.value);
  formData.append("stock", stockInput.value);
  formData.append("description", descInput.value);

  for (let file of imagesInput.files) {
    formData.append("images", file);
  }

  fetch(`${API}/admin/add-product`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message || "Product added successfully", "success");
      loadProducts();
      // Clear inputs
      [nameInput, priceInput, stockInput, descInput, imagesInput].forEach(i => i.value = "");
    })
    .catch(() => showToast("Add product failed", "error"))
    .finally(() => {
      btn.innerText = originalText;
      btn.disabled = false;
    });
}

function removeProduct(id) {
  if(!confirm("Are you sure you want to delete this product?")) return;
  
  fetch(`${API}/admin/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
    .then(() => {
      showToast("Product removed", "error");
      loadProducts();
    });
}

function updateProduct(id, price, stock) {
  fetch(`${API}/admin/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ price, stock })
  })
    .then(() => showToast("Stock updated", "success"))
    .catch(() => showToast("Update failed", "error"));
}

/* =======================
   ORDERS SECTION
======================= */
let allOrders = [];

function loadOrders() {
  fetch(`${API}/admin/orders?t=${new Date().getTime()}`, {
    headers: getAuthHeaders()
  })
    .then(res => res.json())
    .then(data => {
      allOrders = data;
      filterOrders("PLACED");
    })
    .catch(() => showToast("Failed to load orders", "error"));
}

function filterOrders(status) {
  const list = document.getElementById("ordersList");
  list.innerHTML = "";
  
  // Update filter buttons UI
  document.querySelectorAll('.filters button').forEach(btn => {
      btn.classList.toggle('active', btn.innerText === status);
  });

  allOrders
    .filter(o => o.status === status)
    .forEach((o, index) => {
      const items = JSON.parse(o.items);
      const card = document.createElement("div");
      card.className = "order-card";
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <h3>Order #${o.id}</h3>
        <p><strong>${o.name}</strong> — ${o.phone}</p>
        <p style="font-size: 11px; color: #555;">${o.date}</p>
        <ul style="margin: 15px 0; border-top: 1px solid #1a1a1a; padding-top:10px;">
          ${items.map(i => `<li>${i.name} × ${i.quantity}</li>`).join("")}
        </ul>
        <p style="font-weight: 800; border-top: 1px solid #1a1a1a; padding-top:10px;">Total: ₹${o.total}</p>
        <div class="order-actions" style="margin-top:15px; display:flex; gap:10px;">
          <select onchange="updateOrderStatus(${o.id}, this.value)" style="margin-bottom:0;">
            <option value="PLACED" ${o.status === "PLACED" ? "selected" : ""}>PLACED</option>
            <option value="PROCESSING" ${o.status === "PROCESSING" ? "selected" : ""}>PROCESSING</option>
            <option value="COMPLETED" ${o.status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
            <option value="CANCELLED" ${o.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
          </select>
          <button onclick="deleteOrder(${o.id})" style="background:#ff3b3b; font-size:10px;">Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
}

function updateOrderStatus(id, status) {
  fetch(`${API}/admin/orders/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status })
  })
    .then(() => {
      showToast("Status: " + status, "success");
      loadOrders();
    });
}

function deleteOrder(id) {
  if (!confirm("Delete order permanently?")) return;
  fetch(`${API}/admin/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
    .then(() => {
      showToast("Order Deleted", "error");
      loadOrders();
    });
}

/* =======================
   ADMIN NAVIGATION
======================= */
function showProducts() {
  document.getElementById("productsSection").style.display = "grid";
  document.getElementById("ordersSection").style.display = "none";
}

function showOrders() {
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("ordersSection").style.display = "grid";
  loadOrders();
}

// Initial Load
loadProducts();