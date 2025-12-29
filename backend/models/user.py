import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db


def create_users_table(db):
    cursor = db.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE
        )
    """)
    db.commit()
    cursor.close()


def create_user(username, password, is_admin=False):
    db = get_db()
    cursor = db.cursor()

    hashed = generate_password_hash(password)

    cursor.execute("""
        INSERT INTO users (username, password, is_admin)
        VALUES (%s, %s, %s)
        RETURNING id
    """, (username, hashed, is_admin))

    user_id = cursor.fetchone()["id"]
    db.commit()
    cursor.close()
    db.close()

    return user_id


def verify_user(username, password):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT * FROM users WHERE username = %s
    """, (username,))

    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user:
        return None

    if not check_password_hash(user["password"], password):
        return None

    return user
