const CART_KEY = "hotcraft_cart";

/* ======================
   GET CART
====================== */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
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
  const count = cart.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

  const el = document.getElementById("cartCount");
  if (el) el.innerText = count;
}

/* ======================
   ADD TO CART ✅ SINGLE SOURCE OF TRUTH
====================== */
function addToCart(product, qty = 1) {
  if (!product || !product.id) return;

  let cart = getCart();
  let item = cart.find(p => p.id === product.id);

  if (product.stock <= 0) return;

  if (item) {
    item.quantity = Math.min(item.quantity + qty, product.stock);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: Number(product.stock),
      image: product.image || "",
      quantity: qty
    });
  }

  saveCart(cart);
}

/* ======================
   REMOVE ITEM
====================== */
function removeFromCart(id) {
  saveCart(getCart().filter(p => p.id !== id));
}

/* ======================
   UPDATE QUANTITY
====================== */
function updateQuantity(id, qty) {
  let cart = getCart();
  let item = cart.find(p => p.id === id);
  if (!item) return;

  if (qty <= 0) {
    removeFromCart(id);
  } else if (qty <= item.stock) {
    item.quantity = qty;
    saveCart(cart);
  }
}
