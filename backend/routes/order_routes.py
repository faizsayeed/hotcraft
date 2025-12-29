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
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO orders
        (customer_name, phone, address, pincode, items, total, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data["name"],
            data["phone"],
            data["address"],
            data["pincode"],
            json.dumps(data["items"]),
            data["total"],
            "PLACED"
        )
    )

    db.commit()
    cursor.close()

    return jsonify({"message": "Order placed successfully"}), 201


# ------------------------------------------------
# GET ALL ORDERS (ADMIN ONLY)
# ------------------------------------------------
@orders.route("/admin/orders", methods=["GET"])
@token_required
@admin_required
def get_all_orders():
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT * FROM orders ORDER BY created_at DESC"
    )
    rows = cursor.fetchall()
    cursor.close()

    return jsonify([
        {
            "id": o["id"],
            "name": o["customer_name"],
            "phone": o["phone"],
            "address": o["address"],
            "pincode": o["pincode"],
            "items": o["items"],
            "total": o["total"],
            "status": o["status"],
            "date": o["created_at"]
        }
        for o in rows
    ])


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
    cursor = db.cursor()

    cursor.execute(
        "UPDATE orders SET status = %s WHERE id = %s",
        (status, order_id)
    )

    db.commit()
    cursor.close()

    return jsonify({"message": "Order status updated"})


# ------------------------------------------------
# DELETE ORDER (ADMIN ONLY)
# ------------------------------------------------
@orders.route("/admin/orders/<int:order_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_order(order_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM orders WHERE id = %s",
        (order_id,)
    )

    db.commit()
    cursor.close()

    return jsonify({"message": "Order deleted"})
