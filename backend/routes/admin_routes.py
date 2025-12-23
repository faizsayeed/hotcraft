from flask import Blueprint, request, jsonify
from database import get_db
import os
import json
from werkzeug.utils import secure_filename

# 🔐 AUTH
from utils.auth import token_required, admin_required

# ------------------------------------------------
# PATH CONFIG (FIXED)
# ------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.normpath(
    os.path.join(BASE_DIR, "..", "static", "uploads", "products")
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


admin = Blueprint("admin", __name__)

# ------------------------------------------------
# ADD PRODUCT (ADMIN ONLY)
# ------------------------------------------------
@admin.route("/admin/add-product", methods=["POST"])
@token_required
@admin_required
def add_product():
    name = request.form.get("name")
    price = request.form.get("price")
    stock = request.form.get("stock")
    description = request.form.get("description")

    files = request.files.getlist("images")
    saved_images = []

    db = get_db()

    cursor = db.execute(
        """
        INSERT INTO products (name, price, description, stock, images)
        VALUES (?, ?, ?, ?, ?)
        """,
        (name, price, description, stock, "[]")
    )
    product_id = cursor.lastrowid

    for idx, file in enumerate(files):
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit(".", 1)[1].lower()
            filename = f"product_{product_id}_{idx}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            saved_images.append(filename)

    db.execute(
        "UPDATE products SET images = ? WHERE id = ?",
        (json.dumps(saved_images), product_id)
    )

    db.commit()
    return jsonify({"message": "Product added with images"}), 201


# ------------------------------------------------
# PUBLIC PRODUCTS (SHOP)
# ------------------------------------------------
@admin.route("/products", methods=["GET"])
def get_products():
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()

    return jsonify([
        {
            "id": p["id"],
            "name": p["name"],
            "price": p["price"],
            "description": p["description"],
            "stock": p["stock"],
            "images": json.loads(p["images"]) if p["images"] else []
        }
        for p in products
    ])


# ------------------------------------------------
# SINGLE PRODUCT (PUBLIC)
# ------------------------------------------------
@admin.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    db = get_db()
    p = db.execute(
        "SELECT * FROM products WHERE id = ?",
        (product_id,)
    ).fetchone()

    if not p:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "id": p["id"],
        "name": p["name"],
        "price": p["price"],
        "description": p["description"],
        "stock": p["stock"],
        "images": json.loads(p["images"]) if p["images"] else []
    })


# ------------------------------------------------
# ADMIN PRODUCTS VIEW
# ------------------------------------------------
@admin.route("/admin/products", methods=["GET"])
@token_required
@admin_required
def admin_get_products():
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()

    return jsonify([
        {
            "id": p["id"],
            "name": p["name"],
            "price": p["price"],
            "stock": p["stock"],
            "images": json.loads(p["images"]) if p["images"] else []
        }
        for p in products
    ])


# ------------------------------------------------
# DELETE PRODUCT (ADMIN ONLY)
# ------------------------------------------------
@admin.route("/admin/products/<int:pid>", methods=["DELETE"])
@token_required
@admin_required
def delete_product(pid):
    db = get_db()

    product = db.execute(
        "SELECT images FROM products WHERE id = ?",
        (pid,)
    ).fetchone()

    if product and product["images"]:
        try:
            images = json.loads(product["images"])
            for img in images:
                img_path = os.path.join(UPLOAD_FOLDER, img)
                if os.path.exists(img_path):
                    os.remove(img_path)
        except Exception as e:
            print("Image delete error:", e)

    db.execute("DELETE FROM products WHERE id = ?", (pid,))
    db.commit()

    return jsonify({"message": "Product and images deleted"})


# ------------------------------------------------
# UPDATE PRODUCT (ADMIN ONLY)
# ------------------------------------------------
@admin.route("/admin/products/<int:pid>", methods=["PUT"])
@token_required
@admin_required
def update_product(pid):
    data = request.json
    db = get_db()

    db.execute(
        """
        UPDATE products
        SET price = ?, stock = ?
        WHERE id = ?
        """,
        (data["price"], data["stock"], pid)
    )

    db.commit()
    return jsonify({"message": "Product updated"})


# ------------------------------------------------
# ADMIN ORDERS VIEW
# ------------------------------------------------
@admin.route("/admin/orders", methods=["GET"])
@token_required
@admin_required
def get_orders():
    db = get_db()
    orders = db.execute(
        "SELECT * FROM orders ORDER BY created_at DESC"
    ).fetchall()

    return jsonify([
        {
            "id": o["id"],
            "name": o["customer_name"],
            "phone": o["phone"],
            "total": o["total"],
            "status": o["status"],
            "items": o["items"],
            "date": o["created_at"]
        }
        for o in orders
    ])
