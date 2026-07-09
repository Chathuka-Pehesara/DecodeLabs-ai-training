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
*   **SQLAlchemy** - Python SQL ORM.
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
├── dataset/         # Seeding, import, and export datasets (products.json)
├── backend/         # FastAPI, SQLite, and recommendation logic test suite
├── frontend/        # React 19, TypeScript, and Tailwind dashboard
├── docker-compose.yml # Docker Compose orchestration configurations
└── README.md        # This documentation
```

---

## 🗺️ Roadmap & Phases

- [x] **Phase 1: Project Planning**
- [x] **Phase 2: Backend Setup**
- [x] **Phase 3: Frontend Setup**
- [x] **Phase 4: Dataset Generation**
- [x] **Phase 5: Recommendation Algorithms**
- [x] **Phase 6: API Implementation**
- [x] **Phase 7: Frontend Integration**
- [x] **Phase 8: Analytics Dashboard**
- [x] **Phase 9: Testing**
- [x] **Phase 10: Docker & Deployment**

---

## 💻 Local Development Setup

### 1. Run Backend Server
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs at `http://127.0.0.1:8000`. Automatic Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Run Test Suite
```bash
cd backend
.\venv\Scripts\python -m unittest test_suite.py
```

### 3. Run Frontend App
```bash
cd frontend
npm install
npm run dev
```
Dashboard runs at `http://localhost:5173`.

---

## 🐳 Containerized Deployment (Docker)

To deploy both backend and frontend services using Docker Compose, navigate to the `Project 3` root folder and execute:

```bash
# Build and boot the services
docker-compose up --build -d
```

*   **SaaS Dashboard**: Served at `http://localhost` (Port 80) via Nginx.
*   **FastAPI backend**: Served at `http://localhost:8000`.

### Environment Configuration Overrides

You can override weights configurations and sqlite connection pools in `docker-compose.yml` or using system environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `RECOMMEND_DATABASE_URL` | SQLite file connection string | `sqlite:///./recommendations.db` |
| `RECOMMEND_WEIGHT_CATEGORY` | Cosine similarity weight component | `0.50` |
| `RECOMMEND_WEIGHT_TAGS` | Jaccard similarity weight component | `0.30` |
| `RECOMMEND_WEIGHT_RATING` | normalized quality rating weight | `0.20` |
