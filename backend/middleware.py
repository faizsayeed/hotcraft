from flask import request, jsonify
import jwt
from functools import wraps
import os

JWT_SECRET = "HOTCRAFT_SECRET_KEY"

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            # Format: "Bearer <token>"
            token = request.headers["Authorization"].split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            if not data.get("is_admin"):
                return jsonify({"error": "Admin privileges required"}), 403
        except Exception as e:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated