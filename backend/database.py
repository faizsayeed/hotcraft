import os
import psycopg2
from psycopg2.extras import RealDictCursor

# ------------------------------------------------
# PostgreSQL connection (Render compatible)
# ------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

def get_db():
    """
    Returns a PostgreSQL connection.
    """
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )
