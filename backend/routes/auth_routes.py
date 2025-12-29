from flask import Blueprint, request, jsonify
from database import get_db
from models.user import create_user, verify_user
import jwt, datetime

JWT_SECRET = "HOTCRAFT_SECRET_KEY"
JWT_ALGO = "HS256"

auth = Blueprint("auth", __name__, url_prefix="/auth")


@auth.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    db = get_db()
    user = verify_user(db, email, password)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
        },
        JWT_SECRET,
        algorithm=JWT_ALGO
    )

    return jsonify({"token": token})


@auth.route("/create-admin", methods=["POST"])
def create_admin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    db = get_db()
    create_user(db, "Admin", email, password, role="admin")

    return jsonify({"message": "Admin created"}), 201
