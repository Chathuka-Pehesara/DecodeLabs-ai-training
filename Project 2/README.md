# Project 2: Data Classification Using AI

This project implements a supervised machine learning classification pipeline using the classic Iris dataset (150 samples, 3 target classes, 4 features) and a K-Nearest Neighbors (KNN) classifier.

The code adheres to the **Input-Process-Output (IPO)** framework and is structured in a highly modular, decoupled fashion.

---

## 📁 Project Structure

- **`main.py`** — The entry point that orchestrates and runs the pipeline.
- **`data_loader.py`** — Logic for loading the dataset and standardizing features.
- **`model.py`** — Logic for train-test splitting, KNN hyperparameter tuning, and fitting models.
- **`evaluate.py`** — Logic for generating reports and plotting/saving visualizations.
- **`requirements.txt`** — Project dependencies.
- **`ml_concepts.md`** — Comprehensive theoretical reference guide for the ML concepts used in this project.
- **`outputs/`** — Folder containing generated plots:
  - `elbow_chart.png` — Visualizes Error Rate vs. K neighbors (Elbow Method).
  - `confusion_matrix.png` — Seaborn heatmap representing classification successes and errors.

---

## 🚀 How to Run the Project

1. **Navigate to the Project 2 directory:**
   ```bash
   cd "Project 2"
   ```

2. **Install requirements:**
   ```bash
   python -m pip install -r requirements.txt
   ```

3. **Run the pipeline:**
   ```bash
   python main.py
   ```

---

## 📊 Pipeline Overview

- **Input:** Loads the Iris dataset, outputs basic descriptive statistics, shuffles and splits data into an 80/20 train/test split, and applies `StandardScaler` to normalize features (preventing features with larger scales from dominating the distance calculation).
- **Process:** Tests K values from 1 to 20, computes test error rates ($1 - \text{Accuracy}$), plots the Elbow curve, automatically selects the K value with the lowest error rate, and retrains the final KNN classifier with this optimal K.
- **Output:** Outputs overall test accuracy, generates a classification report with Precision, Recall, and F1-Score per class, and saves visualization heatmaps and charts.

---

## 📖 Theoretical Reference

For a deeper dive into the educational machine learning concepts such as **feature scaling**, **data leakage**, **the Accuracy Mirage**, **confusion matrices**, and **hyperparameter tuning**, check out the standalone guide:
👉 **[ml_concepts.md](./ml_concepts.md)**
