import time
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.config import settings
from app.database import engine, get_db, SessionLocal
from app.engine import get_recommendations
from app import models, schemas, crud

# Auto-create database tables on application initialization
models.Base.metadata.create_all(bind=engine)

# Auto-seed database from products.json on startup
db = SessionLocal()
try:
    crud.seed_database_if_empty(db)
finally:
    db.close()

# Initialize FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Algorithmic Recommendation Engine using Cosine Similarity, Jaccard Similarity, and Weighted Score Matching.",
    version="1.0.0",
    docs_url="/docs"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# DIAGNOSTICS & SYSTEM ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Visit /docs for Swagger documentation."
    }

@app.get(f"{settings.API_V1_STR}/health")
def health_check(db: Session = Depends(get_db)):
    """
    Standard health check endpoint that also checks database availability.
    """
    db_ok = True
    try:
        db.query(models.Product).first()
    except Exception:
        db_ok = False
        
    return {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": time.time(),
        "project": settings.PROJECT_NAME,
        "database_connected": db_ok,
        "configuration": {
            "weight_category": settings.WEIGHT_CATEGORY,
            "weight_tags": settings.WEIGHT_TAGS,
            "weight_rating": settings.WEIGHT_RATING
        }
    }

# ==========================================
# CATALOG SEARCH & FILTERING ENDPOINTS
# ==========================================

@app.get(f"{settings.API_V1_STR}/products", response_model=List[schemas.ProductOut])
def list_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieves and filters products in the catalog.
    """
    return crud.get_products(db, q=q, category=category, tag=tag)

@app.get(f"{settings.API_V1_STR}/products/{{product_id}}", response_model=schemas.ProductOut)
def read_product(product_id: str, db: Session = Depends(get_db)):
    """
    Fetches details of a single product.
    """
    prod = crud.get_product(db, product_id)
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Product with ID '{product_id}' not found"
        )
    return prod

# ==========================================
# RECOMMENDATION COMPUTATION ENDPOINTS
# ==========================================

@app.post(f"{settings.API_V1_STR}/recommendations", response_model=List[schemas.RecommendationOut])
def generate_matches(
    payload: schemas.UserPreferenceRequest,
    db: Session = Depends(get_db)
):
    """
    Dynamically computes top N recommendations for a user preference vector,
    exposes explanations, and records query statistics in log tables.
    """
    # Fetch all catalog items from SQLite
    products_db = crud.get_products(db)
    
    # Format SQLAlchemy models into dict structures for recommendation engine
    products_list = []
    for prod in products_db:
        # Convert comma-separated string tags back to list for matching engine
        tags_list = [t.strip() for t in prod.tags.split(",") if t.strip()] if prod.tags else []
        products_list.append({
            "id": prod.id,
            "name": prod.name,
            "description": prod.description,
            "category": prod.category,
            "tags": tags_list,
            "rating": prod.rating
        })
        
    # Evaluate weight overrides or default settings configuration
    w_category = payload.weight_category if payload.weight_category is not None else settings.WEIGHT_CATEGORY
    w_tags = payload.weight_tags if payload.weight_tags is not None else settings.WEIGHT_TAGS
    w_rating = payload.weight_rating if payload.weight_rating is not None else settings.WEIGHT_RATING
    
    # Confirm weights sum to 1.0
    weight_sum = w_category + w_tags + w_rating
    if not (0.99 <= weight_sum <= 1.01):
        # Scale weights to sum to 1.0 if not fully matching
        w_category = w_category / weight_sum
        w_tags = w_tags / weight_sum
        w_rating = w_rating / weight_sum

    # Calculate recommendation matches
    recommendations = get_recommendations(
        user_interests=payload.interests,
        user_tags=payload.tags,
        products=products_list,
        weight_category=w_category,
        weight_tags=w_tags,
        weight_rating=w_rating,
        limit=payload.limit
    )
    
    # Log recommendation analytics check if any matches exist
    if recommendations:
        top_rec = recommendations[0]
        crud.log_recommendation_event(
            db, 
            interests=payload.interests, 
            tags=payload.tags, 
            top_product_id=top_rec["product"]["id"], 
            top_confidence=top_rec["confidence_score"]
        )
        
    return recommendations

# ==========================================
# ANALYTICS ENDPOINTS
# ==========================================

@app.get(f"{settings.API_V1_STR}/analytics", response_model=schemas.AnalyticsOut)
def read_system_analytics(db: Session = Depends(get_db)):
    """
    Computes logs aggregations for system stats presentation.
    """
    return crud.get_analytics(db)

# ==========================================
# ADMIN CATALOG MODIFIERS (CRUD & IMPORT/EXPORT)
# ==========================================

@app.post(
    f"{settings.API_V1_STR}/admin/products", 
    response_model=schemas.ProductOut, 
    status_code=status.HTTP_201_CREATED
)
def add_new_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """
    Creates a new product in the SQLite catalog.
    """
    existing = crud.get_product(db, product.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Product with ID '{product.id}' already exists"
        )
    return crud.create_product(db, product)

@app.put(f"{settings.API_V1_STR}/admin/products/{{product_id}}", response_model=schemas.ProductOut)
def update_product_details(
    product_id: str, 
    payload: schemas.ProductUpdate, 
    db: Session = Depends(get_db)
):
    """
    Updates an existing catalog item.
    """
    updated = crud.update_product(db, product_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Product with ID '{product_id}' not found"
        )
    return updated

@app.delete(f"{settings.API_V1_STR}/admin/products/{{product_id}}", response_model=schemas.ProductOut)
def remove_product(product_id: str, db: Session = Depends(get_db)):
    """
    Deletes a product from the database catalog.
    """
    deleted = crud.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Product with ID '{product_id}' not found"
        )
    return deleted

@app.post(f"{settings.API_V1_STR}/admin/import")
def import_json_catalog(catalog: List[schemas.ProductCreate], db: Session = Depends(get_db)):
    """
    Deletes all products and imports a custom list from a JSON payload.
    """
    try:
        # Delete existing items
        db.query(models.Product).delete()
        
        # Insert new items
        for item in catalog:
            db_prod = models.Product(
                id=item.id,
                name=item.name,
                description=item.description,
                category=item.category,
                tags=",".join(item.tags),
                rating=item.rating
            )
            db.add(db_prod)
        db.commit()
        return {"status": "success", "imported_count": len(catalog)}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing dataset catalog: {str(e)}"
        )

@app.get(f"{settings.API_V1_STR}/admin/export")
def export_json_catalog(db: Session = Depends(get_db)):
    """
    Exports the current products table as a list of dictionaries.
    """
    prods = crud.get_products(db)
    catalog = []
    for p in prods:
        tags_list = [t.strip() for t in p.tags.split(",") if t.strip()] if p.tags else []
        catalog.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "tags": tags_list,
            "rating": p.rating
        })
    return catalog
