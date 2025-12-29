from flask import Blueprint, request, jsonify
from database import get_db
from models.user import create_user, verify_user
import jwt
import datetime

JWT_SECRET = "HOTCRAFT_SECRET_KEY"
JWT_ALGO = "HS256"

auth = Blueprint("auth", __name__, url_prefix="/auth")

# -----------------------------
# REGISTER USER
# -----------------------------
@auth.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    db = get_db()
    try:
        create_user(db, name, email, password, role="user")
        db.commit()
    except Exception as e:
        return jsonify({"error": "Email already exists"}), 409
    finally:
        db.close()

    return jsonify({"message": "User registered"}), 201


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

    db = get_db()
    user = verify_user(db, email, password)
    db.close()

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

    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    })


# -----------------------------
# CREATE ADMIN (ONE TIME)
# -----------------------------
@auth.route("/create-admin", methods=["POST"])
def create_admin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    db = get_db()
    create_user(db, "Admin", email, password, role="admin")
    db.commit()
    db.close()

    return jsonify({"message": "Admin created"}), 201
