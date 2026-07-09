from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# For SQLite, we add connect_args={"check_same_thread": False}
# This is safe because FastAPI handles concurrent request threads and we use a thread-local session per request.
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency generator that yields a database session 
    and guarantees it closes after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
