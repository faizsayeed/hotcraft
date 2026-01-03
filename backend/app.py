from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# -----------------------------
# Database
# -----------------------------
from database import get_db

# -----------------------------
# Models
# -----------------------------
from models.product import create_table
from models.order import create_orders_table
from models.user import create_users_table   # 🔐 AUTH USERS TABLE

# -----------------------------
# Routes
# -----------------------------
from routes.admin_routes import admin
from routes.order_routes import orders
from routes.auth_routes import auth

# -----------------------------
# App init
# -----------------------------
app = Flask(__name__)
@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}

CORS(app)

# -----------------------------
# Register Blueprints
# -----------------------------
app.register_blueprint(admin)
app.register_blueprint(orders)
app.register_blueprint(auth)

# -----------------------------
# Serve uploaded product images
# -----------------------------
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    upload_dir = os.path.join(
        app.root_path, "static", "uploads", "products"
    )
    return send_from_directory(upload_dir, filename)

# -----------------------------
# Health check
# -----------------------------
@app.route("/")
def home():
    return "Hotcraft backend is running"

# -----------------------------
# Database initialization
# Runs ONCE when container starts
# -----------------------------
def init_db():
    db = get_db()
    try:
        create_table()          # products
        create_orders_table(db) # orders
        create_users_table(db)  # users
    finally:
        db.close()

# Call DB init at import time (Gunicorn-safe)
init_db()
