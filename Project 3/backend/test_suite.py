import unittest
import math
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models, schemas, crud
from app.database import Base
from app.engine import (
    calculate_cosine_similarity,
    calculate_jaccard_similarity,
    get_recommendations
)
from app.main import list_products, generate_matches, read_product

class TestRecommendationEngine(unittest.TestCase):
    """
    Tests pure Python similarity matching algorithms.
    """
    
    def test_cosine_similarity(self):
        # 1. Matching category is rated
        user_interests = {"SaaS": 5.0, "DevOps": 3.0}
        # Cosine = 5.0 / (sqrt(25 + 9) * 1.0) = 5.0 / sqrt(34) = 5.0 / 5.83095 = 0.85749
        sim = calculate_cosine_similarity(user_interests, "SaaS")
        self.assertAlmostEqual(sim, 0.8574929, places=5)
        
        # 2. Category not rated (orthogonal vector)
        sim_zero = calculate_cosine_similarity(user_interests, "Marketing")
        self.assertEqual(sim_zero, 0.0)
        
        # 3. Empty user profile
        sim_empty = calculate_cosine_similarity({}, "SaaS")
        self.assertEqual(sim_empty, 0.0)

    def test_jaccard_similarity(self):
        # 1. Partial overlap
        user_tags = ["automation", "cloud", "reporting"]
        product_tags = ["cloud", "monitoring"]
        # Intersection = {"cloud"} (1), Union = {"automation", "cloud", "reporting", "monitoring"} (4)
        # Jaccard = 1 / 4 = 0.25
        sim = calculate_jaccard_similarity(user_tags, product_tags)
        self.assertEqual(sim, 0.25)
        
        # 2. Perfect overlap
        sim_perfect = calculate_jaccard_similarity(["cloud"], ["cloud"])
        self.assertEqual(sim_perfect, 1.0)
        
        # 3. Disjoint sets
        sim_disjoint = calculate_jaccard_similarity(["auth"], ["logging"])
        self.assertEqual(sim_disjoint, 0.0)
        
        # 4. Empty inputs
        sim_empty = calculate_jaccard_similarity([], ["cloud"])
        self.assertEqual(sim_empty, 0.0)


class TestAPIAndDatabase(unittest.TestCase):
    """
    Tests CRUD transactions and API router functions using an in-memory SQLite database.
    """
    
    def setUp(self):
        # Create isolated in-memory SQLite database for test case
        self.engine = create_engine("sqlite:///:memory:")
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create all tables
        Base.metadata.create_all(bind=self.engine)
        self.db = self.SessionLocal()
        
        # Insert seed products
        self.seed_products = [
            schemas.ProductCreate(
                id="p1", name="Product One", description="CRM description", 
                category="SaaS", tags=["crm", "cloud"], rating=4.5
            ),
            schemas.ProductCreate(
                id="p2", name="Product Two", description="Pipeline tool", 
                category="DevOps", tags=["automation", "testing"], rating=4.0
            ),
            schemas.ProductCreate(
                id="p3", name="Product Three", description="Auth supervisor", 
                category="Security", tags=["auth", "cloud"], rating=4.8
            )
        ]
        for p in self.seed_products:
            crud.create_product(self.db, p)

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_database_crud(self):
        # Verify seeding
        prods = crud.get_products(self.db)
        self.assertEqual(len(prods), 3)
        
        # Fetch by ID
        p1 = crud.get_product(self.db, "p1")
        self.assertIsNotNone(p1)
        self.assertEqual(p1.name, "Product One")
        
        # Delete item
        crud.delete_product(self.db, "p1")
        self.assertEqual(crud.get_product(self.db, "p1"), None)

    def test_list_products_endpoint(self):
        # Test routing function for search query
        res = list_products(q="supervisor", db=self.db)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].id, "p3")
        
        # Test routing function for category filter
        res_cat = list_products(category="DevOps", db=self.db)
        self.assertEqual(len(res_cat), 1)
        self.assertEqual(res_cat[0].id, "p2")

    def test_generate_recommendations_endpoint(self):
        # Run recommendation route function
        payload = schemas.UserPreferenceRequest(
            interests={"SaaS": 5.0, "Security": 3.0},
            tags=["cloud"],
            limit=2,
            weight_category=0.6,
            weight_tags=0.3,
            weight_rating=0.1
        )
        
        recs = generate_matches(payload, db=self.db)
        self.assertEqual(len(recs), 2)
        
        # Product p1 (SaaS) should rank first because category matches SaaS (rated 5/5) and tags match cloud
        self.assertEqual(recs[0]["product"]["id"], "p1")
        self.assertGreater(recs[0]["confidence_score"], recs[1]["confidence_score"])

    def test_weights_normalization(self):
        # Test routing handles weights that do not sum to 1.0 (e.g. 0.8 + 0.8 + 0.8 = 2.4)
        # The route handler scales weights to sum to 1.0 (0.33, 0.33, 0.33)
        payload = schemas.UserPreferenceRequest(
            interests={"SaaS": 5.0},
            tags=["cloud"],
            limit=2,
            weight_category=0.8,
            weight_tags=0.8,
            weight_rating=0.8
        )
        recs = generate_matches(payload, db=self.db)
        self.assertGreater(len(recs), 0)
        # Confidence scores must be scaled correctly and remain in range [0.0, 100.0]
        for r in recs:
            self.assertTrue(0.0 <= r["confidence_score"] <= 100.0)


class TestEdgeCasesAndPerformance(unittest.TestCase):
    """
    Tests algorithm normalization edge cases and evaluates latency limits.
    """

    def test_performance_latency(self):
        # Generate 500 mock products in a list
        mock_catalog = []
        categories = ["SaaS", "DevOps", "Security", "Marketing", "Finance"]
        tags_pool = ["cloud", "automation", "reporting", "invoicing", "auth", "logging"]
        
        for i in range(500):
            mock_catalog.append({
                "id": f"mock_{i}",
                "name": f"Mock Product {i}",
                "description": f"Detailed description for mock item {i} to calculate latency.",
                "category": categories[i % len(categories)],
                "tags": [tags_pool[i % len(tags_pool)], tags_pool[(i + 1) % len(tags_pool)]],
                "rating": 3.0 + (i % 20) / 10.0  # rating in [3.0, 4.9]
            })
            
        # User interests
        user_interests = {"SaaS": 5.0, "DevOps": 4.0, "Security": 2.0}
        user_tags = ["automation", "cloud", "auth"]
        
        # Evaluate speed of 500 calculations
        start_time = time.perf_counter()
        recs = get_recommendations(
            user_interests=user_interests,
            user_tags=user_tags,
            products=mock_catalog,
            limit=10
        )
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000
        
        print(f"\n[PERFORMANCE] Computed recommendations for 500 items in {latency_ms:.2f} ms")
        
        # Assert that dynamic matching across 500 items takes less than 15ms
        self.assertLess(latency_ms, 15.0)

if __name__ == "__main__":
    unittest.main()
