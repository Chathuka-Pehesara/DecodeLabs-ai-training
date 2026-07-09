from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Recommendation Logic System"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./recommendations.db"
    
    # Recommendation Algorithm Default Weights
    # Weight 1: Cosine Similarity of category preference profile (0.50)
    # Weight 2: Jaccard Similarity of user tags and product tags (0.30)
    # Weight 3: Normalized product rating score (0.20)
    # These must sum to 1.0
    WEIGHT_CATEGORY: float = 0.50
    WEIGHT_TAGS: float = 0.30
    WEIGHT_RATING: float = 0.20

    class Config:
        case_sensitive = True
        env_prefix = "RECOMMEND_"

settings = Settings()
