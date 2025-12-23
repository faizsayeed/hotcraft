import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

def create_users_table(db):
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'USER',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()


def create_user(db, name, email, password, role="USER"):
    password_hash = generate_password_hash(password)

    db.execute("""
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    """, (name, email, password_hash, role))

    db.commit()


def verify_user(db, email, password):
    user = db.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if user and check_password_hash(user["password_hash"], password):
        return user

    return None
