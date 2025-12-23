from flask import Blueprint, request, jsonify
from database import get_db
import json

orders = Blueprint("orders", __name__)

@orders.route("/orders", methods=["POST"])
def place_order():
    data = request.json
    db = get_db()

    db.execute("""
        INSERT INTO orders 
        (customer_name, phone, address, pincode, items, total)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data["name"],
        data["phone"],
        data["address"],
        data["pincode"],
        json.dumps(data["items"]),
        data["total"]
    ))

    db.commit()
    return jsonify({"message": "Order placed successfully"})
