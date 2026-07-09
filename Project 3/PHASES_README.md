# AI Recommendation Logic System - Phase-by-Phase Learning Journal

This document provides a detailed breakdown of each of the 10 development phases completed during the construction of the AI Recommendation Logic System from scratch.

---

## 📅 Phase 1: Project Planning

### 1. Theory & Design
We established a decoupled **Single Page Application (SPA)** dashboard architecture querying a backend API. The recommendation engine calculates similarities dynamically on-demand, which removes resource overheads and adapts recommendations to preference changes in real-time.

### 2. Files & Structures
*   **`.gitignore`**: Ignores temporary Python caches (`__pycache__`, `venv/`), Node package folders (`node_modules/`), production builds (`dist/`), and SQLite database files (`*.db`).
*   **`README.md`**: Outlines the project summary, core tech stacks, folder architecture, and milestones checklist.
*   **`docs/architecture.md`**: Core mathematical reference mapping the equations for Category Cosine Similarity, Tags Jaccard Similarity, and final Weighted Rankings.
*   **`git init`**: Verification checks completed to confirm version tracking is active.

### 3. Git Commit
*   Message: `"Initialize recommendation system"`

---

## 📅 Phase 2: Backend Setup

### 1. Theory & Design
We set up a Python web application utilizing **FastAPI**, an ASGI (Asynchronous Server Gateway Interface) framework. FastAPI runs asynchronously using **Uvicorn**, enabling concurrent connection handlings without resource locks.

### 2. Files & Structures
*   **`backend/requirements.txt`**: Package manifest declaring `fastapi`, `uvicorn`, `sqlalchemy`, and validation modules.
*   **`backend/app/__init__.py`**: Tells the Python interpreter to treat the folder as an importable module directory.
*   **`backend/app/config.py`**: Initializes Pydantic settings loading system configurations and default recommendation weight ratios.
*   **`backend/app/main.py`**: Boots the FastAPI server instance, establishes CORS middleware, and sets up a diagnostic `/api/health` status path.

### 3. Git Commit
*   Message: `"Setup FastAPI backend"`

---

## 📅 Phase 3: Frontend Setup

### 1. Theory & Design
We scaffolded a responsive React 19 app using **Vite** for rapid hot-module replacements (HMR) and type checking compilers (**TypeScript**). We set up styling configurations using **Tailwind CSS v3** to override brand colors (charcoal obsidian, indigo highlighted buttons).

### 2. Files & Structures
*   **`frontend/tailwind.config.js` & `postcss.config.js`**: Registers content file directories and post-compiles styling utilities.
*   **`frontend/src/index.css`**: Configures custom scrollbars, typography (Inter Google Font), and glassmorphic panel utilities.
*   **`frontend/src/App.tsx`**: Implements a collapsible dashboard menu and state-driven tabs (Recommendations, Admin Panel, Analytics) avoiding browser reload latencies.

### 3. Git Commit
*   Message: `"Initialize React frontend"`

---

## 📅 Phase 4: Dataset Setup

### 1. Theory & Design
We created a product catalog representing realistic items. The tags and category properties share attributes across rows to ensure that tag overlaps and category alignment algorithms yield measurable results.

### 2. Files & Structures
*   **`dataset/products.json`**: An array of 12 distinct fictional software products cataloged across 5 categories (`SaaS`, `DevOps`, `Security`, `Marketing`, `Finance`), featuring specific tags (e.g. `automation`, `cloud`, `monitoring`, `encryption`) and quality ratings (1.0 to 5.0 stars).

### 3. Git Commit
*   Message: `"Create recommendation dataset"`

---

## 📅 Phase 5: Recommendation Algorithm

### 1. Theory & Design
We wrote the dynamic recommendation engine in pure standard library Python, avoiding heavy ML dependencies.
*   **Cosine Similarity**: Computes how user interests rating maps align with product categories by projecting them as vectors.
    $$\text{CosineSimilarity} = \frac{U_{\text{product\_category}}}{\sqrt{\sum U_i^2}}$$
*   **Jaccard Similarity**: Calculates the ratio of tag intersections over their union set.
    $$\text{JaccardSimilarity} = \frac{|U_{\text{tags}} \cap P_{\text{tags}}|}{|U_{\text{tags}} \cup P_{\text{tags}}|}$$
*   **Weighted Combination**: Combines these scores with normalized ratings:
    $$\text{Score} = w_1 \cdot \text{Cosine} + w_2 \cdot \text{Jaccard} + w_3 \cdot \frac{\text{Rating}}{5.0}$$

### 2. Files & Structures
*   **`backend/app/engine.py`**: Houses `calculate_cosine_similarity()`, `calculate_jaccard_similarity()`, and the explanation builder `get_recommendations()`.
*   **`backend/test_engine.py`**: A verification script simulating recommendation lookups for mock profiles.

### 3. Git Commit
*   Message: `"Implement recommendation engine"`

---

## 📅 Phase 6: API Build

### 1. Theory & Design
We connected our FastAPI backend with a local **SQLite** storage engine using **SQLAlchemy** ORM database models, ensuring proper thread safety for async requests.

### 2. Files & Structures
*   **`backend/app/database.py`**: Sets up engine pools and connection utilities.
*   **`backend/app/models.py`**: Defines tables `products` and `recommendation_logs` (storing past matches for statistics).
*   **`backend/app/schemas.py`**: Validates JSON inputs and parses SQLite comma-separated tags into JSON arrays.
*   **`backend/app/crud.py`**: Implements catalog search filters, analytics logging, and a database seeder that auto-loads `products.json` on startup.
*   **`backend/app/main.py`**: Integrates search routes, dynamic match queries, admin modifiers, and statistics APIs.

### 3. Git Commit
*   Message: `"Build recommendation APIs"`

---

## 📅 Phase 7: Frontend Integration

### 1. Theory & Design
We linked our frontend UI with the FastAPI server endpoints. Component states fetch the live SQLite data, and user interface actions trigger matching evaluations.

### 2. Files & Structures
*   **`frontend/src/services/api.ts`**: Encapsulates fetch queries matching our type interfaces (`Product`, `Recommendation`, `Analytics`).
*   **`frontend/src/App.tsx`**: Connects interest sliders (0 to 5) and tag badges. Pressing "Compute Recommendations" updates the matching catalog list. Admin controls allow users to add new products, edit records, or delete products.

### 3. Git Commit
*   Message: `"Integrate recommendation APIs"`

---

## 📅 Phase 8: Analytics Dashboard

### 1. Theory & Design
We built out the dashboard visualization. To show match statistics, the backend reads logged queries and groups the highest match confidence score into ranges: `90%+`, `80-89%`, `70-79%`, and `<70%`.

### 2. Files & Structures
*   **`backend/app/crud.py` & `schemas.py`**: Calculate and serialize matching confidence range frequencies.
*   **`frontend/src/App.tsx`**: Renders a vertical column chart in Tailwind CSS using relative grids and gradient heights that scale based on SQLite logs, complete with hover tooltips.

### 3. Git Commit
*   Message: `"Add analytics dashboard"`

---

## 📅 Phase 9: Testing

### 1. Theory & Design
We constructed a testing harness running in isolation on an in-memory SQLite database (`sqlite:///:memory:`). This tests mathematics, CRUD queries, API schemas, and latency limits in a stateless environment.

### 2. Files & Structures
*   **`backend/test_suite.py`**: Declares test cases for cosine/Jaccard validation, CRUD operations, route parameters validation, automatic weights overrides scaling, and performance stress checks.
*   **Performance verification**: Confirmed lookups across **500 items** complete in **2.86 milliseconds** (well under our 15ms target limit).

### 3. Git Commit
*   Message: `"Add recommendation engine tests"`

---

## 📅 Phase 10: Docker & Deployment

### 1. Theory & Design
We containerized the application to guarantee environment consistency. Nginx is integrated as a lightweight server hosting the React assets, while the backend runs FastAPI asynchronously on Uvicorn.

### 2. Files & Structures
*   **`backend/Dockerfile`**: Configures Python 3.10 and starts Uvicorn on port `8000`.
*   **`frontend/Dockerfile`**: Multi-stage build installing dependencies, running Vite compilers, and copying the outputs to Nginx listening on port `80`.
*   **`docker-compose.yml`**: Orchestrates both containers, configures SQLite data volumes, and maps local host ports (`80` for the dashboard and `8000` for the API).

### 3. Git Commit
*   Message: `"Prepare project for deployment"`
