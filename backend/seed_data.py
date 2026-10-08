import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.seed.seed_data import seed_database

if __name__ == "__main__":
    print("[VERTICAD] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        print("[VERTICAD] Database seeding completed successfully.")
    finally:
        db.close()
