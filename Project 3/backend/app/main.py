import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Initialize FastAPI with project metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Algorithmic Recommendation Engine using Cosine Similarity, Jaccard Similarity, and Weighted Score Matching.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware to allow the frontend to access endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins like ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API prefix routing
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Visit /docs for Swagger documentation."
    }

@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    """
    Standard health check endpoint to verify backend service state.
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "project": settings.PROJECT_NAME,
        "api_version": "1.0.0",
        "configuration": {
            "weight_category": settings.WEIGHT_CATEGORY,
            "weight_tags": settings.WEIGHT_TAGS,
            "weight_rating": settings.WEIGHT_RATING
        }
    }
