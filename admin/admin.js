

/* =======================
   AUTH HELPER
======================= */

function getAuthHeaders(isJson = false) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("Admin not logged in", "error");
    throw new Error("No token found");
  }

  const headers = {
    Authorization: "Bearer " + token
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

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

  setTimeout(() => toast.remove(), 3500);
}

/* =======================
   PRODUCTS SECTION
======================= */

function loadProducts() {
  fetch(`${API}/admin/products`, {
    headers: getAuthHeaders()
  })
    .then(res => res.json())
    .then(products => {
      const list = document.getElementById("productList");
      list.innerHTML = "";

      products.forEach(p => {
        list.innerHTML += `
          <div class="product">
            <strong>${p.name}</strong><br>
            ₹${p.price} | Stock:
            <input type="number" value="${p.stock}"
              onchange="updateProduct(${p.id}, ${p.price}, this.value)">
            ${p.stock < 3 ? `<span class="low">LOW</span>` : ""}
            <br>
            <button onclick="removeProduct(${p.id})">Delete</button>
          </div>
        `;
      });
    })
    .catch(() => showToast("Failed to load products", "error"));
}

function addProduct() {
  const formData = new FormData();

  formData.append("name", name.value);
  formData.append("price", price.value);
  formData.append("stock", stock.value);
  formData.append("description", description.value);

  for (let file of images.files) {
    formData.append("images", file);
  }

  fetch(`${API}/admin/add-product`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message || "Product added", "success");
      loadProducts();
    })
    .catch(() => showToast("Add product failed", "error"));
}

function removeProduct(id) {
  fetch(`${API}/admin/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
    .then(() => {
      showToast("Product deleted", "error");
      loadProducts();
    });
}

function updateProduct(id, price, stock) {
  fetch(`${API}/admin/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ price, stock })
  })
    .then(() => showToast("Product updated", "info"));
}

/* =======================
   ADMIN NAVIGATION
======================= */

function showProducts() {
  productsSection.style.display = "block";
  ordersSection.style.display = "none";
}

function showOrders() {
  productsSection.style.display = "none";
  ordersSection.style.display = "block";
  loadOrders();
}

/* =======================
   ORDERS SECTION
======================= */

let allOrders = [];

function loadOrders() {
  fetch(`${API}/admin/orders`, {
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

  allOrders
    .filter(o => o.status === status)
    .forEach(o => {
      const items = JSON.parse(o.items);

      list.innerHTML += `
        <div class="order-card">
          <h3>Order #${o.id}</h3>
          <p><strong>${o.name}</strong> — ${o.phone}</p>
          <p>${o.date}</p>

          <ul>
            ${items.map(i => `<li>${i.name} × ${i.quantity}</li>`).join("")}
          </ul>

          <p>Total: ₹${o.total}</p>

          <div class="order-actions">
            <select onchange="updateOrderStatus(${o.id}, this.value)">
              <option value="PLACED" ${o.status === "PLACED" ? "selected" : ""}>PLACED</option>
              <option value="PROCESSING" ${o.status === "PROCESSING" ? "selected" : ""}>PROCESSING</option>
              <option value="COMPLETED" ${o.status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
              <option value="CANCELLED" ${o.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
            </select>

            ${o.status !== "COMPLETED"
              ? `<button onclick="cancelOrder(${o.id})">Cancel</button>`
              : ""
            }

            <button onclick="deleteOrder(${o.id})" class="danger">
              Delete
            </button>
          </div>
        </div>
      `;
    });
}

/* =======================
   ORDER ACTIONS
======================= */

function updateOrderStatus(id, status) {
  fetch(`${API}/admin/orders/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status })
  })
    .then(() => {
      showToast("Order updated", "success");
      loadOrders();
    });
}

function cancelOrder(id) {
  updateOrderStatus(id, "CANCELLED");
}

function deleteOrder(id) {
  if (!confirm("Delete this order permanently?")) return;

  fetch(`${API}/admin/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
    .then(() => {
      showToast("Order deleted", "error");
      loadOrders();
    });
}

/* =======================
   INITIAL LOAD
======================= */

loadProducts();
showProducts();
