# 🧠 Play To Diagnose: XAI-Driven ADHD Detection and Progress Monitoring

> **⚠️ LEGAL NOTICE & PATENT PENDING**
>
> This repository contains proprietary methodologies, algorithms, and workflows pertaining to XAI-driven neurodevelopmental screening and gamified cognitive metric normalization. These concepts are the subject of pending patent applications filed by the affiliated researchers and institute.
>
> **This code is strictly for academic review and evaluation purposes.** Commercial use, monetization, unauthorized modification, or incorporation into proprietary products is explicitly prohibited. See the **Legal & License** section below for full details.

---

# 📌 Project Overview

**Play To Diagnose** is a hardware-agnostic, web-based framework designed to transition ADHD (Attention Deficit Hyperactivity Disorder) screening from subjective questionnaires to objective, data-driven behavioral quantification.

By engaging users in a specialized battery of cognitive games, the platform captures high-frequency neuromuscular interactions. These primitive metrics are normalized into a **12-dimensional feature vector** and analyzed by a Machine Learning inference engine. To ensure clinical transparency, a custom Rule-Based Explainable AI (XAI) engine translates the mathematical weights into human-readable rationales, establishing trust between the AI and the end-user.

## 🎯 Key Objectives Achieved

- **Objective Quantification**
  - Replaces self-reporting with millisecond-precision tracking of reaction time variability, working memory decay, and inhibitory control.

- **White-Box Explainability**
  - Custom XAI engine maps specific gameplay anomalies (e.g., Stroop interference cost) to clinically meaningful explanations.

- **Longitudinal Monitoring**
  - Includes targeted intervention games to monitor pre- and post-intervention cognitive improvements (targeting **≥ 15% improvement**).

---

# 🏗️ System Architecture & Tech Stack

The platform follows a decoupled, highly modular full-stack architecture that enables low-latency gameplay while keeping computationally intensive machine learning inference separate from the client.

## Frontend Layer (Client-Side)

- **Core Technologies**
  - HTML5
  - CSS3
  - Vanilla JavaScript

- **Diagnostic Battery**
  - Shape Dash (Motor Function & Impulsivity)
  - Stroop Task (Selective Attention)
  - Memory Recall (Working Memory)

- **State Management**
  - Browser Session Storage maintains user progress across multiple diagnostic tasks without data fragmentation.

---

## Backend Layer (Server-Side)

- **Framework**
  - Python 3.9
  - FastAPI (Asynchronous REST API)

- **Database**
  - SQLite (`database.db`)
  - Strictly typed relational schema implementing **1:N User → GameResult** cardinality.

---

## Machine Learning & Explainable AI

- **Machine Learning Engine**
  - `scikit-learn`
  - Logistic Regression with L2 Regularization

- **Feature Engineering**
  - Converts raw gameplay interactions into a **12-dimensional behavioral feature vector**.

### Key Engineered Metrics

| Metric | Description |
|---------|-------------|
| **Inconsistency Index (II)** | Standard deviation of reaction times |
| **Precision-Speed Ratio (PSR)** | Accuracy divided by average reaction time |

- **Interpretability**
  - Custom Python Rule-Based Explainable AI engine.
  - No black-box explainability libraries such as SHAP or LIME are used.

---

# 🚀 Local Setup & Installation

Follow these steps to run the project locally for academic review or evaluation.

## 1. Prerequisites

Ensure the following are installed:

- Python 3.9+
- Git

---

## 2. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/play-to-diagnose.git
cd play-to-diagnose
```

---

## 3. Create a Virtual Environment

```bash
python -m venv venv
```

### Activate the Environment

**Windows**

```bash
venv\Scripts\activate
```

**macOS / Linux**

```bash
source venv/bin/activate
```

---

## 4. Install Dependencies

```bash
pip install fastapi uvicorn scikit-learn joblib sqlmodel
```

---

## 5. Run the Server

Ensure the following files are present in the project root:

- `adhd_model.joblib`
- `database.db`

Start the FastAPI application:

```bash
uvicorn main:app --reload
```

---

## Access the Application

### Web Application

```
http://127.0.0.1:8000
```

### Swagger API Documentation

```
http://127.0.0.1:8000/docs
```

---

# ⚖️ Legal & License

## Academic Research and Evaluation License

**All Rights Reserved**

---

### Permission to View

Permission is hereby granted, free of charge, to any individual or academic institution to download, view, compile, and run this software **solely for educational, academic research, and evaluation purposes.**

---

### Restrictions

You **may NOT**:

- Use this software for any commercial purpose.
- Monetize any part of this software.
- Incorporate any portion of its architecture into proprietary products.
- Redistribute modified versions.
- Publish modified versions.
- Sublicense this software.

without explicit written permission from the copyright holders.

---

### Patent Reservation

**Nothing in this repository shall be construed as granting, explicitly or by implication, any license, immunity, or right under any patent or pending patent application held by the researchers or the affiliated institution.**

---

### Disclaimer

This software is provided **"as is"**, without warranty of any kind, express or implied.

In no event shall the copyright holders be liable for any claim, damages, or other liability arising from, out of, or in connection with the software or its use.
