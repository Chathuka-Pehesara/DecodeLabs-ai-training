import math
from typing import List, Dict, Any, Set

def calculate_cosine_similarity(user_interests: Dict[str, float], product_category: str) -> float:
    """
    Computes Cosine Similarity between the user's category preference vector 
    and the product's category membership (represented as a one-hot vector).
    
    Formula:
      DotProduct(U, P) = U[product_category] (since P has 1.0 at product_category and 0.0 elsewhere)
      Magnitude(U) = sqrt(sum(rating^2) for all user rated categories)
      Magnitude(P) = 1.0 (since it is a unit one-hot vector)
      Cosine = DotProduct(U, P) / (Magnitude(U) * Magnitude(P))
    """
    if not user_interests:
        return 0.0
    
    # Dot product is the user's explicit preference rating for this product's category
    dot_product = user_interests.get(product_category, 0.0)
    if dot_product == 0.0:
        return 0.0
    
    # Calculate Magnitude of User interest vector: L2 Norm
    user_magnitude = math.sqrt(sum(val ** 2 for val in user_interests.values()))
    if user_magnitude == 0.0:
        return 0.0
        
    # Magnitude of Product one-hot vector is always 1.0 because it only has one active category.
    product_magnitude = 1.0
    
    return dot_product / (user_magnitude * product_magnitude)

def calculate_jaccard_similarity(user_tags: List[str], product_tags: List[str]) -> float:
    """
    Computes Jaccard Similarity between user's preferred tags and product's tags.
    
    Formula:
      Jaccard = Size(Intersection) / Size(Union)
    """
    user_set: Set[str] = {t.strip().lower() for t in user_tags if t.strip()}
    product_set: Set[str] = {t.strip().lower() for t in product_tags if t.strip()}
    
    if not user_set or not product_set:
        return 0.0
        
    intersection = user_set.intersection(product_set)
    union = user_set.union(product_set)
    
    return len(intersection) / len(union)

def get_recommendations(
    user_interests: Dict[str, float],
    user_tags: List[str],
    products: List[Dict[str, Any]],
    weight_category: float = 0.50,
    weight_tags: float = 0.30,
    weight_rating: float = 0.20,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Evaluates similarity for all products against the user's profile,
    ranks them by a weighted match score, and formats explanations.
    """
    recommendations = []
    
    for prod in products:
        category = prod.get("category", "")
        tags = prod.get("tags", [])
        rating = prod.get("rating", 0.0)
        
        # Calculate individual similarities
        cosine_sim = calculate_cosine_similarity(user_interests, category)
        jaccard_sim = calculate_jaccard_similarity(user_tags, tags)
        
        # Normalize rating from [1.0, 5.0] range to [0.0, 1.0] range
        normalized_rating = rating / 5.0
        
        # Compute final weighted score
        final_score = (
            (weight_category * cosine_sim) + 
            (weight_tags * jaccard_sim) + 
            (weight_rating * normalized_rating)
        )
        
        # Format confidence score (0 to 100%)
        confidence_score = round(final_score * 100, 1)
        
        # Generate algorithmic explanation
        explanations = []
        
        # 1. Category check
        if cosine_sim > 0.0:
            user_rating = user_interests.get(category, 0.0)
            explanations.append(
                f"Strong match in category '{category}' which you rated {user_rating}/5 (Category similarity: {round(cosine_sim, 2)})"
            )
        else:
            explanations.append(
                f"Category '{category}' has no preference rating in your profile"
            )
            
        # 2. Tags check
        user_set = {t.strip().lower() for t in user_tags if t.strip()}
        product_set = {t.strip().lower() for t in tags if t.strip()}
        overlapping_tags = user_set.intersection(product_set)
        
        if overlapping_tags:
            tag_list = ", ".join(sorted(overlapping_tags))
            explanations.append(
                f"Matches {len(overlapping_tags)} of your tag interests: [{tag_list}] (Tag similarity: {round(jaccard_sim, 2)})"
            )
        elif user_set:
            explanations.append("No tag overlap found with your selected interest keywords")
            
        # 3. Quality score
        explanations.append(f"Highly rated product with an average of {rating}/5.0 stars")
        
        explanation_text = ". ".join(explanations) + "."
        
        recommendations.append({
            "product": prod,
            "cosine_score": round(cosine_sim, 3),
            "jaccard_score": round(jaccard_sim, 3),
            "rating_score": round(normalized_rating, 3),
            "final_score": round(final_score, 3),
            "confidence_score": confidence_score,
            "explanation": explanation_text
        })
        
    # Sort recommendations by final score descending, and then by rating descending in case of ties
    recommendations.sort(key=lambda x: (x["final_score"], x["rating_score"]), reverse=True)
    
    return recommendations[:limit]
