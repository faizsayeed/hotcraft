/* =======================
   AUTH & NOTIFICATIONS
======================= */
function getAuthHeaders(isJson = false) {
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Admin not logged in", "error");
    throw new Error("No token found");
  }
  const headers = { Authorization: "Bearer " + token };
  if (isJson) headers["Content-Type"] = "application/json";
  return headers;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message.toUpperCase();
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

/* =======================
   PRODUCTS LOGIC
======================= */
function loadProducts() {
  fetch(`${API}/admin/products`, { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(products => {
      const list = document.getElementById("productList");
      list.innerHTML = "";
      products.forEach(p => {
        list.innerHTML += `
          <div class="product">
            <div class="product-info">
              <strong>${p.name}</strong>
              <span style="color:#666; font-size:10px">₹${p.price}</span>
              ${p.stock < 5 ? `<span class="low-alert">LOW STOCK</span>` : ""}
            </div>
            
            <div class="stock-stepper">
              <div class="stock-value" id="stock-val-${p.id}">${p.stock}</div>
              <div class="arrow-controls">
                <button class="arrow-btn" onclick="stepStock(${p.id}, ${p.price}, 1)">▲</button>
                <button class="arrow-btn" onclick="stepStock(${p.id}, ${p.price}, -1)">▼</button>
              </div>
            </div>

            <button class="delete-btn" onclick="removeProduct(${p.id})">REMOVE</button>
          </div>`;
      });
    })
    .catch(() => showToast("Failed to load products", "error"));
}

function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const stock = document.getElementById("stock").value;
  const desc = document.getElementById("description").value;
  const images = document.getElementById("images").files;

  if (!name || !price) return showToast("Name and Price required", "error");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("description", desc);
  for (let file of images) formData.append("images", file);

  fetch(`${API}/admin/add-product`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    showToast("PRODUCT UPLOADED SUCCESSFULLY", "success");
    loadProducts();
    // Reset Form
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("description").value = "";
    document.getElementById("images").value = "";
  })
  .catch(() => showToast("Add product failed", "error"));
}

function stepStock(id, price, change) {
  const el = document.getElementById(`stock-val-${id}`);
  let newStock = parseInt(el.innerText) + change;
  if (newStock < 0) return;
  
  el.innerText = newStock; // Instant UI update
  
  fetch(`${API}/admin/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ price, stock: newStock })
  })
  .then(() => showToast("STOCK UPDATED", "success"))
  .catch(() => showToast("Update failed", "error"));
}

function removeProduct(id) {
  if (!confirm("DELETE PRODUCT?")) return;
  fetch(`${API}/admin/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
  .then(() => {
    showToast("PRODUCT DELETED", "error");
    loadProducts();
  });
}

/* =======================
   UI NAVIGATION
======================= */
function showProducts() {
  document.getElementById("productsSection").style.display = "grid";
  document.getElementById("ordersSection").style.display = "none";
  document.getElementById("btnProducts").classList.add("active");
  document.getElementById("btnOrders").classList.remove("active");
}

function showOrders() {
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("ordersSection").style.display = "block";
  document.getElementById("btnOrders").classList.add("active");
  document.getElementById("btnProducts").classList.remove("active");
  loadOrders();
}

// ... Keep your existing LoadOrders / FilterOrders logic here ...
// They will work perfectly with the new Toast and Auth helpers above.

loadProducts();