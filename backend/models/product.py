from database import get_db


def create_table():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            description TEXT,
            stock INTEGER,
            images TEXT
        )
    """)
    db.commit()

