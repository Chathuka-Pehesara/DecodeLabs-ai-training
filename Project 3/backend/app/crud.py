import json
import os
import time
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas

# ==========================================
# PRODUCT CATALOG CRUD
# ==========================================

def get_products(
    db: Session, 
    q: Optional[str] = None, 
    category: Optional[str] = None, 
    tag: Optional[str] = None
):
    """
    Fetches products matching optional search term, category, or tag filters.
    """
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category == category)
        
    if tag:
        # Search for tag within comma-separated string
        query = query.filter(models.Product.tags.like(f"%{tag}%"))
        
    if q:
        # Search term matches name or description
        search_filter = f"%{q}%"
        query = query.filter(
            (models.Product.name.like(search_filter)) | 
            (models.Product.description.like(search_filter))
        )
        
    return query.all()

def get_product(db: Session, product_id: str):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate):
    # Convert tags list into a comma-separated string for DB storage
    db_prod = models.Product(
        id=product.id,
        name=product.name,
        description=product.description,
        category=product.category,
        tags=",".join(product.tags),
        rating=product.rating
    )
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

def update_product(db: Session, product_id: str, product_in: schemas.ProductUpdate):
    db_prod = get_product(db, product_id)
    if not db_prod:
        return None
        
    update_data = product_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if key == "tags" and value is not None:
            db_prod.tags = ",".join(value)
        else:
            setattr(db_prod, key, value)
            
    db.commit()
    db.refresh(db_prod)
    return db_prod

def delete_product(db: Session, product_id: str):
    db_prod = get_product(db, product_id)
    if not db_prod:
        return None
    db.delete(db_prod)
    db.commit()
    return db_prod

# ==========================================
# DATABASE SEEDING
# ==========================================

def seed_database_if_empty(db: Session):
    """
    Inspects products inventory. If empty, loads dataset/products.json and seeds database.
    """
    product_count = db.query(models.Product).count()
    if product_count > 0:
        return
        
    # Walk path to locate products.json
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "..", "..", "dataset", "products.json")
    
    if not os.path.exists(dataset_path):
        # Alternative path format fallback
        dataset_path = os.path.join(base_dir, "dataset", "products.json")
        if not os.path.exists(dataset_path):
            return
            
    try:
        with open(dataset_path, "r") as f:
            items = json.load(f)
            
        for item in items:
            db_prod = models.Product(
                id=item["id"],
                name=item["name"],
                description=item["description"],
                category=item["category"],
                tags=",".join(item["tags"]),
                rating=item["rating"]
            )
            db.add(db_prod)
        db.commit()
    except Exception as e:
        print(f"Error seeding database from JSON: {e}")

# ==========================================
# ANALYTICS LOGGING
# ==========================================

def log_recommendation_event(
    db: Session, 
    interests: dict, 
    tags: list, 
    top_product_id: str, 
    top_confidence: float
):
    """
    Inserts a record of a calculated recommendation check for analytics tracking.
    """
    categories_str = ",".join(interests.keys())
    tags_str = ",".join(tags)
    
    db_log = models.RecommendationLog(
        timestamp=time.time(),
        categories=categories_str,
        tags=tags_str,
        top_product_id=top_product_id,
        top_confidence=top_confidence
    )
    db.add(db_log)
    db.commit()
    return db_log

def get_analytics(db: Session) -> dict:
    """
    Gathers metrics summaries from the database logs.
    """
    total_recs = db.query(models.RecommendationLog).count()
    total_prods = db.query(models.Product).count()
    
    # Calculate average confidence of top recommendation matches
    avg_conf_row = db.query(func.avg(models.RecommendationLog.top_confidence)).first()
    avg_confidence = float(avg_conf_row[0]) if avg_conf_row and avg_conf_row[0] else 0.0
    
    # Track category query frequencies
    popular_categories = {}
    logs = db.query(models.RecommendationLog.categories).all()
    for log in logs:
        if log[0]:
            categories = [c.strip() for c in log[0].split(",") if c.strip()]
            for cat in categories:
                popular_categories[cat] = popular_categories.get(cat, 0) + 1
                
    # Sort popular categories descending
    sorted_popularity = dict(sorted(popular_categories.items(), key=lambda x: x[1], reverse=True))
    
    # Calculate similarity score distribution
    distribution = {"90s": 0, "80s": 0, "70s": 0, "below_70": 0}
    confidences = db.query(models.RecommendationLog.top_confidence).all()
    for row in confidences:
        conf = row[0]
        if conf >= 90.0:
            distribution["90s"] += 1
        elif conf >= 80.0:
            distribution["80s"] += 1
        elif conf >= 70.0:
            distribution["70s"] += 1
        else:
            distribution["below_70"] += 1
            
    return {
        "total_recommendations": total_recs,
        "total_products": total_prods,
        "popular_categories": sorted_popularity,
        "avg_confidence": round(avg_confidence, 1),
        "similarity_distribution": distribution
    }
