# AI Recommendation Logic System

A complete content-based recommendation system built from scratch. This application recommends items based on user interest profiles using algorithmic similarity matching (Cosine Similarity, Jaccard Similarity, and Weighted Score Matching) instead of machine learning models.

---

## 🚀 Project Overview

The system allows users to select interests, rate categories, and search products, while dynamically computing recommendations with real-time confidence scores and explanations of *why* each item was recommended. It also features an Admin panel for product management and an Analytics dashboard to visualize recommendation metrics and popular categories.

---

## 🛠️ Tech Stack

### Backend
*   **FastAPI** (Python 3.10+) - Fast, high-performance API framework.
*   **SQLite** - Local development database.
*   **SQLAlchemy** - Python SQL toolkit and Object Relational Mapper (ORM).
*   **Uvicorn** - ASGI server implementation.

### Frontend
*   **React 19** - Dynamic UI construction.
*   **Vite** - Build tool and local server.
*   **Tailwind CSS** - Modern, custom dark-themed UI styling.
*   **TypeScript** - Static typing for frontend components.

### Core Recommendation Logic
*   **Cosine Similarity**: Measures directional similarity between category preference vectors.
*   **Jaccard Similarity**: Measures overlapping sets of categorical interest tags.
*   **Weighted Score Matching**: Combines Cosine and Jaccard scores with general item ratings for final ranking.

---

## 📂 Project Structure

```
Project 3/
├── dataset/         # Seeding, import, and export datasets
├── backend/         # FastAPI, SQLite, and recommendation logic
├── frontend/        # React 19, TypeScript, and Tailwind dashboard
├── docs/            # Architecture specifications & formulas
└── README.md        # This documentation
```

---

## 🗺️ Roadmap & Phases

- [ ] **Phase 1: Project Planning** (Current)
- [ ] **Phase 2: Backend Setup**
- [ ] **Phase 3: Frontend Setup**
- [ ] **Phase 4: Dataset Generation**
- [ ] **Phase 5: Recommendation Algorithms**
- [ ] **Phase 6: API Implementation**
- [ ] **Phase 7: Frontend Integration**
- [ ] **Phase 8: Analytics Dashboard**
- [ ] **Phase 9: Testing**
- [ ] **Phase 10: Docker & Deployment**
