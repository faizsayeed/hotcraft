import os
import psycopg2
from psycopg2.extras import RealDictCursor

# ------------------------------------------------
# PostgreSQL connection (Render compatible)
# ------------------------------------------------
DATABASE_URL = os.getenv("postgresql://hotcraft_db_user:ylrXYdrgqbKXr8PBSiDViFM0j7iGZJ0L@dpg-d594qcbuibrs73b2ulj0-a/hotcraft_db")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

def get_db():
    """
    Returns a PostgreSQL connection.
    Compatible with existing sqlite-style usage:
    - db.execute(...)
    - db.commit()
    - fetchone(), fetchall()
    """
    conn = psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )
    return conn
