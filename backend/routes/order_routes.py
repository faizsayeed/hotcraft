from flask import Blueprint, request, jsonify
from database import get_db
import json

# 🔐 AUTH
from utils.auth import token_required, admin_required

orders = Blueprint("orders", __name__)

# ------------------------------------------------
# PLACE ORDER (PUBLIC)
# ------------------------------------------------
@orders.route("/orders", methods=["POST"])
def place_order():
    data = request.json
    db = get_db()

    db.execute("""
        INSERT INTO orders
        (customer_name, phone, address, pincode, items, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["name"],
        data["phone"],
        data["address"],
        data["pincode"],
        json.dumps(data["items"]),
        data["total"],
        "PLACED"
    ))

    db.commit()
    return jsonify({"message": "Order placed successfully"}), 201


# ------------------------------------------------
# UPDATE ORDER STATUS (ADMIN ONLY)
# ------------------------------------------------
@orders.route("/admin/orders/<int:order_id>", methods=["PUT"])
@token_required
@admin_required
def update_order_status(order_id):
    data = request.json
    status = data.get("status", "").upper()

    allowed = ["PLACED", "PROCESSING", "COMPLETED", "CANCELLED"]

    if status not in allowed:
        return jsonify({"error": "Invalid status"}), 400

    db = get_db()
    db.execute(
        "UPDATE orders SET status = ? WHERE id = ?",
        (status, order_id)
    )
    db.commit()

    return jsonify({"message": "Order status updated"})


# ------------------------------------------------
# DELETE ORDER (ADMIN ONLY) ✅ NEW
# ------------------------------------------------
@orders.route("/admin/orders/<int:order_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_order(order_id):
    db = get_db()

    db.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    db.commit()

    return jsonify({"message": "Order deleted"})
