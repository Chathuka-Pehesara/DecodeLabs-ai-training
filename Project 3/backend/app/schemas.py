from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=50)
    tags: List[str] = Field(default=[])
    rating: float = Field(default=0.0, ge=0.0, le=5.0)

class ProductCreate(ProductBase):
    id: str = Field(..., min_length=1, max_length=50)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    rating: Optional[float] = None

class ProductOut(BaseModel):
    id: str
    name: str
    description: str
    category: str
    tags: List[str]
    rating: float

    # Enable ORM serialization
    class Config:
        from_attributes = True

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, value: Any) -> List[str]:
        """
        Parses comma-separated SQLite tags string into a list of tags.
        """
        if isinstance(value, str):
            if not value:
                return []
            return [t.strip() for t in value.split(",") if t.strip()]
        return value

class UserPreferenceRequest(BaseModel):
    interests: Dict[str, float] = Field(default={})  # e.g., {"SaaS": 5.0, "DevOps": 3.0}
    tags: List[str] = Field(default=[])              # e.g., ["automation", "monitoring"]
    limit: int = Field(default=5, ge=1, le=20)
    
    # Custom weight overrides (optional)
    weight_category: Optional[float] = None
    weight_tags: Optional[float] = None
    weight_rating: Optional[float] = None

class RecommendationOut(BaseModel):
    product: ProductOut
    cosine_score: float
    jaccard_score: float
    rating_score: float
    final_score: float
    confidence_score: float
    explanation: str

class AnalyticsOut(BaseModel):
    total_recommendations: int
    total_products: int
    popular_categories: Dict[str, int]
    avg_confidence: float
    similarity_distribution: Dict[str, int]
