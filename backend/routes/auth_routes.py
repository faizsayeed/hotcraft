from flask import Blueprint, request, jsonify
from models.user import create_user, verify_user
import jwt
import datetime

JWT_SECRET = "HOTCRAFT_SECRET_KEY"
JWT_ALGO = "HS256"

auth = Blueprint("auth", __name__, url_prefix="/auth")


# -----------------------------
# REGISTER
# -----------------------------
@auth.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    try:
        # adjust args if your create_user uses (email, password, is_admin)
        create_user(email, password, is_admin=False)
    except Exception:
        return jsonify({"error": "Email already exists"}), 409

    return jsonify({"message": "User registered successfully"}), 201


# -----------------------------
# LOGIN
# -----------------------------
@auth.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email & password required"}), 400

    user = verify_user(email, password)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "id": user["id"],
            "email": user["email"],
            "is_admin": user["is_admin"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
        },
        JWT_SECRET,
        algorithm=JWT_ALGO
    )

    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "is_admin": user["is_admin"]
        }
    })


# -----------------------------
# TEMP CREATE ADMIN (DELETE LATER)
# -----------------------------
@auth.route("/create-admin", methods=["POST"])
def create_admin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    create_user(email, password, is_admin=True)
    return jsonify({"message": "Admin created"}), 201
