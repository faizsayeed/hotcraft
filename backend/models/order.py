def create_orders_table(db):
    db.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        pincode TEXT,
        items TEXT,
        total INTEGER,
        status TEXT DEFAULT 'PLACED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    db.commit()
