import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash


# -----------------------------
# CREATE USERS TABLE
# -----------------------------
def create_users_table(db):
    cur = db.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()
    cur.close()


# -----------------------------
# CREATE USER
# -----------------------------
def create_user(db, name, email, password, role="user"):
    cur = db.cursor()
    hashed = generate_password_hash(password)

    cur.execute("""
        INSERT INTO users (name, email, password, role)
        VALUES (%s, %s, %s, %s)
    """, (name, email, hashed, role))

    db.commit()
    cur.close()


# -----------------------------
# VERIFY USER (LOGIN)
# -----------------------------
def verify_user(db, email, password):
    cur = db.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT * FROM users WHERE email = %s
    """, (email,))

    user = cur.fetchone()
    cur.close()

    if not user:
        return None

    if not check_password_hash(user["password"], password):
        return None

    return user
