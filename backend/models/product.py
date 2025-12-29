from database import get_db

def create_table():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price INTEGER,
            description TEXT,
            stock INTEGER,
            images TEXT
        )
    """)

    db.commit()
    cursor.close()
