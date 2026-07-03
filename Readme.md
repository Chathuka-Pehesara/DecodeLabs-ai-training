# DecodeLabs AI Engineering Training — 2026 Batch

This repository documents my progress through DecodeLabs' Artificial Intelligence
Industrial Training Kit — a 4-project track designed to build AI engineering skills
from the ground up, starting with deterministic logic and progressing toward more
advanced, intelligent systems.

Each project lives in its own folder, with its own code and a short README
explaining what it does and how to run it.

---

## 🎯 Program Overview

The track is structured as a progressive skill-building journey:

| # | Project | Status |
|---|---------|--------|
| 1 | Rule-Based AI Chatbot | ✅ Complete |
| 2 | Data Classification Using AI | ✅ Complete |
| 3 | *Coming soon* | ⬜ Not started |
| 4 | *Coming soon* | ⬜ Not started |

Each project builds on the foundation laid by the one before it — starting with
core control flow and logic, and gradually moving toward more advanced AI
concepts as the track progresses.

---

## 📁 Repository Structure

```
decodelabs-ai-training/
├── README.md                          ← you are here
├── Project 1/
│   └── chatbot.py
├── Project 2/
│   ├── main.py
│   ├── data_loader.py
│   ├── model.py
│   ├── evaluate.py
│   ├── requirements.txt
│   ├── ml_concepts.md
│   ├── README.md
│   └── outputs/
│       ├── elbow_chart.png
│       └── confusion_matrix.png
```

---

## ✅ Project 1: Rule-Based AI Chatbot

A terminal-based chatbot built using pure control flow and logic — no machine
learning involved. Focuses on input sanitization, dictionary-based intent
matching, and clean program architecture.

**Key skills:** control flow, decision-making logic, basic AI concepts

📂 [View Project 1](./project-1-rule-based-chatbot)

---

## ✅ Project 2: Data Classification Using AI

A supervised machine learning classification pipeline built using the Iris dataset (150 samples, 3 classes, 4 features) and a K-Nearest Neighbors (KNN) classifier. Highlights hyperparameter tuning (Elbow Chart method), standardized feature scaling, model validation (train/test splitting), and evaluation reporting (Accuracy, Precision, Recall, F1-Score, and Seaborn Confusion Matrix Heatmap).

**Key skills:** Data Preprocessing, Hyperparameter Tuning, Classification Metrics, Modular ML Pipeline Design

📂 [View Project 2](./Project%202)

## 🚧 Project 3

*Details to be added as this project begins.*

## 🚧 Project 4

*Details to be added as this project begins.*

---

## 🛠️ How to Run

Each project folder contains its own instructions. In general:

**Project 1:**
```bash
cd "Project 1"
python chatbot.py
```

**Project 2:**
```bash
cd "Project 2"
python -m pip install -r requirements.txt
python main.py
```

---

## 👤 Author

Built as part of the DecodeLabs Industrial Training Kit — Batch 2026.

🌎 [decodelabs.tech](https://www.decodelabs.tech)