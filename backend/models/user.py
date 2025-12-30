from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash


# -----------------------------
# CREATE USERS TABLE (SAFE)
# -----------------------------
def create_users_table(db):
    cur = db.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            is_admin BOOLEAN DEFAULT FALSE
        )
    """)
    db.commit()
    cur.close()


# -----------------------------
# CREATE USER
# -----------------------------
def create_user(db, name, email, password, is_admin=False):
    cur = db.cursor()
    hashed = generate_password_hash(password)

    # username = email (simple + consistent)
    cur.execute("""
        INSERT INTO users (username, email, password, name, is_admin)
        VALUES (%s, %s, %s, %s, %s)
    """, (email, email, hashed, name, is_admin))

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
