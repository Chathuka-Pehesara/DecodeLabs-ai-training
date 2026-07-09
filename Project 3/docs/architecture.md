# AI Recommendation Logic System Architecture

This document describes the technical architecture, mathematical algorithms, and database schema for the custom recommendation engine.

---

## 🏛️ System Overview

The system consists of a FastAPI backend serving a React 19 frontend. Instead of storing precalculated recommendations, similarity computations are executed dynamically on-demand when a user requests recommendations or performs searches, which keeps user preferences interactive and updated in real-time.

---

## 📊 Core Data Models & Schemas

### 1. Product (Item)
A product is the entity recommended to users.
*   `id`: unique string/integer identifier
*   `name`: display name of the item
*   `category`: the main category of the item (e.g., "SaaS", "DevOps", "Marketing", "Security", "Finance")
*   `tags`: a list of strings representing specific sub-attributes (e.g., `["analytics", "email", "automation"]`)
*   `rating`: average user rating (0.0 to 5.0)
*   `description`: text details of the item

### 2. User Interest Profile
Represents the user's current interests, which are dynamically configured by the user in the frontend:
*   `interests`: A dictionary mapping categories to numerical preference ratings (1 to 5).
    *   Example: `{"SaaS": 5, "Security": 1, "Marketing": 3}`
*   `tags`: A set of string tags that the user explicitly selects or searches.
    *   Example: `{"automation", "reporting"}`

### 3. Recommendation Response Item
The structure returned to the client:
*   `product`: The matching Product object.
*   `confidence_score`: A percentage float (e.g., `85.4%`) indicating match strength.
*   `explanation`: A generated textual explanation detailing the match (e.g., *"Recommended because you rated SaaS highly (5/5) and this item has 1 overlapping tag: automation"*).

---

## 🧮 Mathematical Formulas & Algorithm Logic

Our algorithmic engine combines two similarity metrics and an item rating component to rank matching items.

### 1. Cosine Similarity (Category Alignment)
We represent category preferences as vectors.
Let $U_c$ be the user's category interest vector and $P_c$ be the product's category membership vector.

If categories are $C = [c_1, c_2, \dots, c_k]$:
*   $U_c[i] = \text{Rating (1 to 5) if user rated } c_i \text{, else } 0$.
*   $P_c[i] = 1.0 \text{ if product is in category } c_i \text{, else } 0$ (one-hot encoding representation).

The similarity between the vectors is calculated as:

$$\text{CosineSimilarity}(U_c, P_c) = \frac{\sum_{i=1}^k U_c[i] \cdot P_c[i]}{\sqrt{\sum_{i=1}^k (U_c[i])^2} \cdot \sqrt{\sum_{i=1}^k (P_c[i])^2}}$$

*This measures the alignment of categories. If a user has a high rating for the product's category, the cosine similarity will be high.*

---

### 2. Jaccard Similarity (Tag Overlap)
Tags represent fine-grained attributes. We compute similarity between the user's preferred tags set ($U_t$) and the product's tag set ($P_t$).

$$\text{JaccardSimilarity}(U_t, P_t) = \frac{|U_t \cap P_t|}{|U_t \cup P_t|}$$

*If both sets are empty, the Jaccard Similarity is defined as $0.0$.*

---

### 3. Weighted Ranking Score
To generate a single sorted recommendation score, we combine Cosine Similarity, Jaccard Similarity, and the normalized product rating:

$$\text{Score} = w_1 \cdot \text{CosineSimilarity} + w_2 \cdot \text{JaccardSimilarity} + w_3 \cdot \frac{\text{ProductRating}}{5.0}$$

Where the weights satisfy:
$$w_1 + w_2 + w_3 = 1.0$$

*   **Default configuration**:
    *   $w_1 = 0.50$ (Category preference weight)
    *   $w_2 = 0.30$ (Tag preference overlap weight)
    *   $w_3 = 0.20$ (Product popularity/rating weight)

### 4. Confidence Score
The `confidence_score` represents the match strength as a percentage:
$$\text{Confidence Score} = \text{Score} \times 100$$

---

## 📈 Recommendation Explanation Generator

To build user trust, the system generates an explicit explanation for each recommendation:
1.  **Category Influence**: *"Highly matches your interest in category '{category}' (rated {rating}/5)"*.
2.  **Tag Overlap**: *"Matches {count} tag(s) you are interested in: {matched_tags}"*.
3.  **General Rating**: *"Highly rated product ({product_rating}/5.0 stars)"*.
