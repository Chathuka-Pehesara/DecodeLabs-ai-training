import json
import os
from app.engine import get_recommendations

def test_recommendations():
    # Construct paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "..", "dataset", "products.json")
    
    # Load products
    print(f"Loading products from: {dataset_path}")
    with open(dataset_path, "r") as f:
        products = json.load(f)
        
    print(f"Loaded {len(products)} products successfully.")
    
    # Mock user profile
    # User rates SaaS highly (5), DevOps high (4), Security very low (1)
    user_interests = {
        "SaaS": 5.0,
        "DevOps": 4.0,
        "Security": 1.0
    }
    # User selects these tags of interest
    user_tags = ["automation", "cloud", "monitoring"]
    
    print("\n--- MOCK USER PROFILE ---")
    print(f"Interests: {user_interests}")
    print(f"Tags of Interest: {user_tags}")
    print("-------------------------\n")
    
    # Generate recommendations
    recs = get_recommendations(
        user_interests=user_interests,
        user_tags=user_tags,
        products=products,
        weight_category=0.50,
        weight_tags=0.30,
        weight_rating=0.20,
        limit=5
    )
    
    print("=== TOP 5 RECOMMENDED ITEMS ===")
    for i, rec in enumerate(recs, 1):
        prod = rec["product"]
        print(f"\n{i}. {prod['name']} (ID: {prod['id']})")
        print(f"   Category: {prod['category']} | Rating: {prod['rating']} stars")
        print(f"   Tags: {prod['tags']}")
        print(f"   Scores -> Cosine: {rec['cosine_score']} | Jaccard: {rec['jaccard_score']} | Rating: {rec['rating_score']}")
        print(f"   Final Weighted Score: {rec['final_score']} | Confidence: {rec['confidence_score']}%")
        print(f"   Explanation: {rec['explanation']}")
    print("===============================")

if __name__ == "__main__":
    test_recommendations()
