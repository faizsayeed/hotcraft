import jwt
from functools import wraps
from flask import request, jsonify

JWT_SECRET = "HOTCRAFT_SECRET_KEY"
JWT_ALGO = "HS256"


# -----------------------------
# TOKEN REQUIRED (ALL PROTECTED ROUTES)
# -----------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token missing"}), 401

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # attach decoded user to request
        request.user = payload
        return f(*args, **kwargs)

    return decorated


# -----------------------------
# ADMIN REQUIRED
# -----------------------------
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.user.get("is_admin"):
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

