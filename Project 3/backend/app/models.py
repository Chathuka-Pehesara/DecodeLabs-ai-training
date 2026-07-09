from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    tags = Column(String(255), nullable=False)  # Comma-separated tags, e.g. "crm,automation,cloud"
    rating = Column(Float, default=0.0)

class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(Float, nullable=False)
    categories = Column(String(255), nullable=False)  # Comma-separated categories queried
    tags = Column(String(255), nullable=False)        # Comma-separated tags queried
    top_product_id = Column(String(50), nullable=False)
    top_confidence = Column(Float, nullable=False)
