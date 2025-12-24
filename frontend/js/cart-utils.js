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
   CART COUNT (NAVBAR)
====================== */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);

  const el = document.getElementById("cartCount");
  if (el) el.innerText = count;
}

/* ======================
   ADD TO CART
====================== */
function addToCart(product) {
  if (!product || !product.id) return;

  let cart = getCart();
  let item = cart.find(p => p.id === product.id);

  if (product.stock <= 0) return;

  if (item) {
    if (item.quantity < product.stock) {
      item.quantity++;
    }
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      image: product.image || "",
      quantity: 1
    });
  }

  saveCart(cart);
}
