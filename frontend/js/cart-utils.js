/* =====================================================
   CART UTILS — PRODUCTION SAFE (IMAGE COMPATIBLE)
===================================================== */

const CART_KEY = "hotcraft_cart";

/* ======================
   GET CART
====================== */
function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/* ======================
   SAVE CART
====================== */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* ======================
   CART COUNT
====================== */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const el = document.getElementById("cartCount");
  if (el) el.innerText = count;
}

/* ======================
   NORMALIZE IMAGE
====================== */
function normalizeImage(image) {
  if (!image || typeof image !== "string") {
    return "";
  }

  // Cloudinary / full URL
  if (image.startsWith("http")) {
    return image;
  }

  // Legacy upload
  return `${API}/uploads/${image}`;
}

/* ======================
   ADD TO CART (SINGLE SOURCE OF TRUTH)
====================== */
function addToCart(product, qty = 1) {
  if (!product || !product.id) return;

  let cart = getCart();
  let item = cart.find(p => String(p.id) === String(product.id));

  if (Number(product.stock) <= 0) return;

  const image = normalizeImage(product.image);

  if (item) {
    item.quantity = Math.min(
      Number(item.quantity) + Number(qty),
      Number(item.stock)
    );
  } else {
    cart.push({
      id: product.id,
      name: product.name || "Hotcraft Product",
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      image: image,
      quantity: Number(qty)
    });
  }

  saveCart(cart);
}

/* ======================
   REMOVE ITEM
====================== */
function removeFromCart(id) {
  const cart = getCart().filter(p => String(p.id) !== String(id));
  saveCart(cart);
}

/* ======================
   UPDATE QUANTITY
====================== */
function updateQuantity(id, qty) {
  let cart = getCart();
  let item = cart.find(p => String(p.id) === String(id));
  if (!item) return;

  const newQty = Number(qty);

  if (newQty <= 0) {
    removeFromCart(id);
  } else if (newQty <= Number(item.stock)) {
    item.quantity = newQty;
    saveCart(cart);
  }
}
