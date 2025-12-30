from flask import Blueprint, request, jsonify
from database import get_db
import json
import os

import cloudinary
import cloudinary.uploader
import cloudinary.api

from utils.auth import token_required, admin_required

# ------------------------------------------------
# CLOUDINARY CONFIG
# ------------------------------------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

admin = Blueprint("admin", __name__)

# ------------------------------------------------
# ADD PRODUCT (ADMIN ONLY)
# ------------------------------------------------
@admin.route("/admin/add-product", methods=["POST"])
@token_required
@admin_required
def add_product():
    try:
        name = request.form.get("name")
        price = request.form.get("price")
        stock = request.form.get("stock")
        description = request.form.get("description")

        files = request.files.getlist("images")
        image_urls = []

        # ✅ UPLOAD TO CLOUDINARY
        for file in files:
            if file:
                result = cloudinary.uploader.upload(
                    file,
                    folder="hotcraft/products"
                )
                image_urls.append(result["secure_url"])

        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO products (name, price, description, stock, images)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            name,
            price,
            description,
            stock,
            json.dumps(image_urls)
        ))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Product added successfully"}), 201

    except Exception as e:
        print("🔥 ADD PRODUCT ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


# ------------------------------------------------
# PUBLIC PRODUCTS (SHOP)
# ------------------------------------------------
@admin.route("/products", methods=["GET"])
def get_products():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    db.close()

    response = jsonify([
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

    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    return response


# ------------------------------------------------
# ADMIN PRODUCTS VIEW
# ------------------------------------------------
@admin.route("/admin/products", methods=["GET"])
@token_required
@admin_required
def admin_get_products():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    db.close()

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
# DELETE PRODUCT
# ------------------------------------------------
@admin.route("/admin/products/<int:pid>", methods=["DELETE"])
@token_required
@admin_required
def delete_product(pid):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT images FROM products WHERE id = %s", (pid,))
    product = cursor.fetchone()

    # OPTIONAL: delete from cloudinary
    if product and product["images"]:
        try:
            for url in json.loads(product["images"]):
                public_id = url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"hotcraft/products/{public_id}")
        except Exception as e:
            print("Cloudinary delete error:", e)

    cursor.execute("DELETE FROM products WHERE id = %s", (pid,))
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Product deleted"})


# ------------------------------------------------
# UPDATE PRODUCT
# ------------------------------------------------
@admin.route("/admin/products/<int:pid>", methods=["PUT"])
@token_required
@admin_required
def update_product(pid):
    data = request.json
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        UPDATE products
        SET price = %s, stock = %s
        WHERE id = %s
    """, (data["price"], data["stock"], pid))

    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Product updated"})


# ------------------------------------------------
# ADMIN ORDERS
# ------------------------------------------------
@admin.route("/admin/orders", methods=["GET"])
@token_required
@admin_required
def get_orders():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
    orders = cursor.fetchall()
    cursor.close()
    db.close()

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
