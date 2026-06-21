# AgriMindAI — Project Overview

## Project Purpose

AgriMindAI is an **AI-powered farmer advisory platform** designed to help small-scale and mid-scale farmers in India make data-driven decisions about crop selection, yield estimation, fertilizer usage, and market timing. It replaces fragmented, intuition-based farming decisions with a unified, intelligent decision-support system.

## Business Problem Solved

Farmers face a **"Triple Crisis"** of decision-making:

1. **Agronomic Uncertainty** — Lack of precise soil nutrient data (N, P, K, pH) leads to incompatible crop selection, poor yields, and long-term soil degradation.
2. **Climate Unpredictability** — Increasing rainfall/temperature variability makes traditional planting cycles unreliable.
3. **Market Volatility** — Without access to price trend forecasting, farmers grow oversupplied crops and sell at a loss.

Existing digital tools are fragmented (soil, weather, market data in separate silos), require high technical literacy, and rarely offer forward-looking predictions.

**Source:** [PROBLEM_STATEMENT.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/AgriMindAI/PROBLEM_STATEMENT.md)

## Target Users

- Small-scale farmers in India (5–50 acre operations)
- Mid-scale agricultural operators
- Agricultural extension officers and advisors
- AgriTech researchers and students

## Core Value Proposition

A **single platform** that integrates:
- ML-based crop recommendation from soil parameters
- Yield estimation with confidence intervals
- LSTM-driven price trend forecasting
- Live mandi (market) price intelligence from government APIs
- Fertilizer gap analysis with actionable advice
- Revenue estimation (yield × predicted price)

## Major Features

> [!NOTE]
> The platform's primary focus is on **crop selection, yield estimation, price trend forecasting, and fertilizer gap analysis**. To align the UI with these core ML capabilities, the **Disease Detection AI**, **AI Agri-Consultant (chatbot)**, and **Machinery Marketplace** features have been switched off in the sidebar navigation (though their backend/frontend code remains intact in the codebase).

### Core ML/AI Features
| Feature | Description | Model |
|---|---|---|
| **Crop Recommendation** | Predicts the best-fit crop from 22 options given 7 soil/climate parameters | Random Forest Classifier |
| **Yield Estimation** | Predicts yield (tons/hectare) with P10–P90 confidence intervals | Random Forest Regressor (100 trees) |
| **Price Trend Forecasting** | Predicts next-period commodity price trend (Up/Down/Stable) | LSTM Neural Network (Keras) |
| **Fertilizer Gap Analysis** | Calculates N/P/K deficits vs. crop-optimal requirements | Rule-based lookup table |
| **Revenue Estimation** | Computes `yield × predictedPrice × exchangeRate` | Aggregation pipeline |
| **Disease Detection AI** | Image-based crop disease identification with treatment advice | Google Gemini API (configured) **(Currently Disabled in UI)** |
| **AI Agri-Consultant** | Conversational chatbot for agricultural questions | Google Gemini API **(Currently Disabled in UI)** |

### User & Platform Features
| Feature | Description |
|---|---|
| **JWT Authentication** | Register/Login with bcrypt + HttpOnly cookie sessions |
| **Demo User Quick Login** | One-click pre-seeded demo account for evaluation |
| **Market Intelligence Dashboard** | Live mandi prices for 22 crops from Data.gov.in |
| **Financial Ledger** | Expense tracking with category management and net profit calculation |
| **Agricultural Calendar** | Task scheduling with priority levels and categories |
| **Inventory Manager** | CRUD for seeds, fertilizers, pesticides with low-stock alerts |
| **Machinery Marketplace** | Peer-to-peer farm equipment listing and rental **(Currently Disabled in UI)** |
| **Community Feed** | Social post board with likes for farmer-to-farmer advice |
| **Analytics Dashboard** | Historical yield charts, soil health trends, financial breakdowns |
| **Notification Center** | In-app notification management |
| **PDF Export** | Analytics reports exported as PDF via html2canvas + jsPDF |
| **Multilingual UI** | English and Hindi via i18next |
| **Dark/Light Theme** | CSS variable-based theming with user preference persistence |
| **PWA Support** | Progressive Web App manifest configured via vite-plugin-pwa |

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, TailwindCSS 4, Motion (Framer Motion), Recharts, Lucide Icons, i18next |
| **Backend** | Node.js, Express 5, Mongoose 9, Zod (data validation and schema declaration library), JWT, bcryptjs, opossum (circuit breaker), lru-cache (LRU - Least Recently Used) |
| **ML Service** | Python 3, Flask, scikit-learn, TensorFlow/Keras, joblib, NumPy, Pandas |
| **Database** | MongoDB Atlas (via Mongoose ODM) |
| **External APIs** | Data.gov.in Agmarknet, Frankfurter.app (exchange rates), OpenWeatherMap, Google Gemini |
| **Deployment** | Docker (multi-stage), bash orchestration |
| **AI/LLM** | Google Gemini (disease detection, chatbot) |

## High-Level Architecture

The system follows a **two-service monorepo architecture** deployed in a single Docker container:

```
┌────────────────────────────────────────────────────────────────┐
│                     Docker Container                           │
│                                                                │
│  ┌──────────────────────────────────┐  ┌─────────────────────┐│
│  │   Express Node.js (port 5000)    │  │  Flask ML Service   ││
│  │                                  │  │  (port 5001)        ││
│  │  • REST API Gateway              │  │                     ││
│  │  • Auth (JWT + bcrypt)           │  │  • /api/predict     ││
│  │  • Business Logic                │◄─┤  • /api/predict_    ││
│  │  • MongoDB Persistence     axios │  │    yield            ││
│  │  • Static SPA Serving      +     │  │  • /api/predict_    ││
│  │  • Circuit Breaker       opossum │  │    price_trend      ││
│  │  • LRU Cache                     │  │  • /api/prices/all  ││
│  └────────────┬─────────────────────┘  └─────────────────────┘│
│               │                                                │
└───────────────┼────────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │   MongoDB Atlas       │
    │                       │
    │  • users              │
    │  • recommendations    │
    │  • posts              │
    │  • machineries        │
    └───────────────────────┘
```

## Project Status

**Completed (MVP)** — All core features are implemented and functional. The system is deployable via Docker. No production deployment is currently active (Live Demo: N/A).

**Source:** [AgriMindAI_Project_Report.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/AgriMindAI/AgriMindAI_Project_Report.md)

## Quick Start Summary

```bash
# 1. Clone the repository
git clone https://github.com/sakalesha/AI-Farmer-Advisory.git
cd AI-Farmer-Advisory

# 2. Install all dependencies (root, backend, frontend)
npm run install-all

# 3. Set up environment variables
#    - Copy backend/.env with MongoDB URI, JWT secret, API keys
#    - Copy frontend/.env with GEMINI_API_KEY (optional)

# 4. Start the full stack (backend + frontend + ML service)
npm run full-stack

# 5. Access the application
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:5000
#    ML Service: http://localhost:5001

# Demo credentials:
#    Email: demo@agrimind.ai
#    Password: password123
```

> [!NOTE]
> The ML service requires Python 3 with `flask`, `scikit-learn`, `tensorflow`, `joblib`, `numpy`, `pandas`, `beautifulsoup4`, and `requests` installed. See `ml/requirements.txt` for the complete list.
