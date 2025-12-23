import jwt
from functools import wraps
from flask import request, jsonify
from database import get_db

JWT_SECRET = "HOTCRAFT_SECRET_KEY"
JWT_ALGO = "HS256"


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            payload = jwt.decode(
                token, JWT_SECRET, algorithms=[JWT_ALGO]
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        request.user = payload
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.user["role"] != "ADMIN":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)

    return decorated
