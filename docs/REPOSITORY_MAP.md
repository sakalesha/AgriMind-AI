# AgriMindAI — Repository Map

## File Index with Annotations

Every source file in the repository with a one-line purpose description. Files are grouped by component.

---

### Root Configuration

| File | Purpose |
|---|---|
| [.dockerignore](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/.dockerignore) | Docker build context exclusions |
| [.gitignore](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/.gitignore) | Git version control exclusions |
| [Dockerfile](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/Dockerfile) | Multi-stage Docker build (Node 20 + Python 3 venv) |
| [package.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/package.json) | Root monorepo scripts (`install-all`, `dev`, `full-stack`) |
| [start.sh](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/start.sh) | Docker entrypoint: starts Flask → polls health → starts Node |
| [.env](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/.env) | Root environment variables |
| [PROBLEM_STATEMENT.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/PROBLEM_STATEMENT.md) | Business problem description |
| [AgriMindAI_Project_Report.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/AgriMindAI_Project_Report.md) | Comprehensive project report (518 lines) |

---

### Backend — Entry Point

| File | Purpose |
|---|---|
| [backend/package.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/package.json) | Backend Node.js dependencies |
| [backend/.env](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/.env) | Backend environment variables (MongoDB, JWT, API keys) |
| [backend/src/app.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/app.js) | **Express server entry point**: MongoDB connection, middleware stack, route mounting, static file serving |

### Backend — Models (Mongoose Schemas)

| File | Purpose |
|---|---|
| [backend/src/models/User.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/User.js) | User schema: auth, profile, inventory, tasks, disease history, preferences |
| [backend/src/models/Recommendation.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Recommendation.js) | Recommendation schema: inputs, prediction, fertilizer, linked to User |
| [backend/src/models/Post.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Post.js) | Community post schema: content, likes, linked to User and Recommendation |
| [backend/src/models/Machinery.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Machinery.js) | Machinery rental schema: name, owner, price, availability |

### Backend — Controllers (Business Logic)

| File | Purpose |
|---|---|
| [backend/src/controllers/authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js) | Register, login, logout, get profile, update profile |
| [backend/src/controllers/recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js) | **Core controller**: ML integration, circuit breaker, LRU cache, fertilizer gap, revenue calculation |
| [backend/src/controllers/weatherController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/weatherController.js) | OpenWeatherMap integration with simulation fallback |
| [backend/src/controllers/marketController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/marketController.js) | Market intelligence: live mandi prices, regional breakdown, exchange rate |
| [backend/src/controllers/postController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/postController.js) | Community feed: create post, list posts, toggle like |
| [backend/src/controllers/historyController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/historyController.js) | Recommendation history: last 30 records per user |
| [backend/src/controllers/machineryController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/machineryController.js) | Machinery marketplace: list, create, rent |

### Backend — Routes

| File | Purpose |
|---|---|
| [backend/src/routes/authRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/authRoutes.js) | Auth route definitions with Zod validation |
| [backend/src/routes/recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) | Recommend route with rate limiter + auth + Zod |
| [backend/src/routes/weatherRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/weatherRoutes.js) | Weather route with query param validation |
| [backend/src/routes/marketRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/marketRoutes.js) | Market price routes (no auth required) |
| [backend/src/routes/postRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/postRoutes.js) | Community post routes with auth + validation |
| [backend/src/routes/historyRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/historyRoutes.js) | History retrieval route |
| [backend/src/routes/machineryRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/machineryRoutes.js) | Machinery CRUD routes |

### Backend — Middleware

| File | Purpose |
|---|---|
| [backend/src/middleware/authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/authMiddleware.js) | JWT verification from cookie or Authorization header |
| [backend/src/middleware/validate.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/validate.js) | Generic Zod schema validation middleware (body, params, query) |

### Backend — Validators (Zod Schemas)

| File | Purpose |
|---|---|
| [backend/src/validators/authValidators.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/validators/authValidators.js) | Register/login input schemas |
| [backend/src/validators/recommendValidators.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/validators/recommendValidators.js) | Soil input schema (N, P, K, temp, humidity, pH, rainfall) |
| [backend/src/validators/postValidators.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/validators/postValidators.js) | Post content + like params validation |
| [backend/src/validators/weatherValidators.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/validators/weatherValidators.js) | Weather query param validation (lat, lon) |

### Backend — Data & Utilities

| File | Purpose |
|---|---|
| [backend/src/data/cropRequirements.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/data/cropRequirements.js) | Optimal NPK values per crop (22 crops lookup table) |
| [backend/src/data/marketPrices.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/data/marketPrices.js) | Baseline USD/ton prices (22 crops fallback data) |
| [backend/src/utils/dbSeeder.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/utils/dbSeeder.js) | Database seeder: creates demo user, machinery, recommendations, posts |
| [backend/src/scripts/runSeed.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/scripts/runSeed.js) | Standalone script to run the database seeder |

---

### Frontend — Entry & Configuration

| File | Purpose |
|---|---|
| [frontend/package.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/package.json) | Frontend dependencies (React, Vite, TailwindCSS, etc.) |
| [frontend/index.html](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/index.html) | HTML entry point for Vite |
| [frontend/vite.config.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/vite.config.ts) | Vite config: TailwindCSS 4, PWA, API proxy to port 5000 |
| [frontend/tsconfig.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/tsconfig.json) | TypeScript configuration with path aliases |
| [frontend/tsconfig.app.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/tsconfig.app.json) | App-specific TypeScript config |
| [frontend/tsconfig.node.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/tsconfig.node.json) | Node.js-specific TypeScript config (for Vite) |
| [frontend/metadata.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/metadata.json) | App metadata: name, description, permissions (geolocation) |
| [frontend/.env](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/.env) | Frontend environment variables (Gemini API key) |

### Frontend — Core Source

| File | Purpose |
|---|---|
| [frontend/src/main.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/main.tsx) | React DOM render entry: initializes i18n, renders App |
| [frontend/src/App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx) | **Root component (711 lines)**: global state, auth gate, tab routing, API calls |
| [frontend/src/types.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/types.ts) | TypeScript interfaces: SoilMetrics, Recommendation, UserProfile, etc. |
| [frontend/src/i18n.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/i18n.ts) | i18next config with EN + HI translations for sidebar labels |
| [frontend/src/index.css](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/index.css) | Global styles, CSS custom properties, TailwindCSS theme, premium card classes |

### Frontend — Components (Reusable)

| File | Purpose |
|---|---|
| [frontend/src/components/SoilInputForm.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/SoilInputForm.tsx) | 7-field soil input form with validation and AI warnings |
| [frontend/src/components/RecommendationCard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/RecommendationCard.tsx) | Crop recommendation display card with revenue, irrigation, health metrics |
| [frontend/src/components/WeatherWidget.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/WeatherWidget.tsx) | Weather display: current temp/humidity (API), forecast (hardcoded) |

### Frontend — Pages

| File | Purpose |
|---|---|
| [frontend/src/pages/AuthPage.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AuthPage.tsx) | Login/Register page with demo login button |
| [frontend/src/pages/DiseaseDetection.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/DiseaseDetection.tsx) | Image upload → AI disease diagnosis (currently mock results) |
| [frontend/src/pages/AgriCalendar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AgriCalendar.tsx) | Farm task scheduler with priority/category management |
| [frontend/src/pages/InventoryManager.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/InventoryManager.tsx) | Farm input inventory CRUD with low-stock alerts |
| [frontend/src/pages/MachineryMarketplace.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/MachineryMarketplace.tsx) | Equipment listing and rental marketplace |
| [frontend/src/pages/IrrigationScheduler.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/IrrigationScheduler.tsx) | Smart irrigation schedule management |
| [frontend/src/pages/YieldSimulator.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/YieldSimulator.tsx) | Interactive yield parameter simulation |
| [frontend/src/pages/AgriConsultant.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AgriConsultant.tsx) | Gemini-powered chatbot for agricultural Q&A |
| [frontend/src/pages/AnalyticsDashboard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AnalyticsDashboard.tsx) | Recharts-based yield, soil health, and financial visualizations |
| [frontend/src/pages/MarketInsights.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/MarketInsights.tsx) | Market intelligence dashboard with price tables and trends |
| [frontend/src/pages/FinancialLedger.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/FinancialLedger.tsx) | Expense tracking and net profit calculation (client-side only) |
| [frontend/src/pages/CommunityFeed.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/CommunityFeed.tsx) | Social post board with like functionality |
| [frontend/src/pages/NotificationCenter.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/NotificationCenter.tsx) | In-app notification management (mark read, delete, clear all) |
| [frontend/src/pages/UserProfile.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/UserProfile.tsx) | Profile editing with farm details and preferences |

### Frontend — Layouts & Libraries

| File | Purpose |
|---|---|
| [frontend/src/layouts/Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) | Navigation sidebar: 14 nav items, mobile toggle, sign out |
| [frontend/src/lib/utils.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/lib/utils.ts) | `cn()` utility: clsx + tailwind-merge for conditional classes |
| [frontend/src/lib/notifications.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/lib/notifications.ts) | Browser push notification permission + dispatch helpers |
| [frontend/src/lib/pdfExport.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/lib/pdfExport.ts) | html2canvas + jsPDF: captures DOM element → PDF file |

---

### ML Service — Core

| File | Purpose |
|---|---|
| [ml/ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py) | **Flask API server**: loads 3 models, serves 4 inference endpoints |
| [ml/requirements.txt](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/requirements.txt) | Python dependencies (flask, scikit-learn, tensorflow, etc.) |

### ML Service — Models (Serialized Artifacts)

| File | Format | Purpose |
|---|---|---|
| `ml/models/crop_model.pkl` | joblib | Random Forest Classifier for crop prediction |
| `ml/models/scaler.pkl` | joblib | StandardScaler for crop model input features |
| `ml/models/label_encoder.pkl` | joblib | LabelEncoder for 22 crop name encoding |
| `ml/models/yield_model.pkl` | joblib | Random Forest Regressor (100 trees) for yield estimation |
| `ml/models/yield_label_encoder.pkl` | joblib | LabelEncoder for yield model crop encoding |
| `ml/models/lstm_price_model.h5` | Keras HDF5 | LSTM neural network for price forecasting |
| `ml/models/price_scaler.pkl` | joblib | MinMaxScaler for price normalization |
| `ml/models/crop_price_history.json` | JSON | Historical 5-month price sequences for LSTM input |

### ML Service — Training & Preprocessing

| File | Purpose |
|---|---|
| [ml/src/utils/data_generator.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/utils/data_generator.py) | Generates 11,000 rows of synthetic yield training data |
| [ml/src/utils/price_scraper.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/utils/price_scraper.py) | Data.gov.in Agmarknet live price fetcher with fallback |
| [ml/src/preprocessing/generate_grounded_data.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/preprocessing/generate_grounded_data.py) | Generates 12,000 rows of ICAR/FAO-grounded yield data |
| [ml/src/preprocessing/source_real_data.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/preprocessing/source_real_data.py) | Generates 8,000 rows of real-world grounded yield data (ICRISAT anchors) |
| [ml/src/preprocessing/calibrate_price_scaler.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/preprocessing/calibrate_price_scaler.py) | Calibrates MinMaxScaler for INR/Ton price range |
| [ml/src/training/train_yield_model.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/training/train_yield_model.py) | Trains Random Forest Regressor on real-world grounded data |
| [ml/src/training/validate_yield_model.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/training/validate_yield_model.py) | Validates yield model against reference data, generates report |
| [ml/src/inference/test_grounded_price.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/inference/test_grounded_price.py) | Tests yield + price pipeline grounding in INR |
| [ml/notebooks/train_price_lstm.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/notebooks/train_price_lstm.py) | LSTM price model training script (60 months synthetic data) |

### ML Service — Notebooks

| File | Purpose |
|---|---|
| `ml/notebooks/model_training.ipynb` | Jupyter notebook for crop recommendation model training |
| `ml/notebooks/train_price_lstm.ipynb` | Jupyter notebook for LSTM price model training |
| `ml/notebooks/train_yield_model.ipynb` | Jupyter notebook for yield model training |

### ML Service — Data

| File | Purpose |
|---|---|
| `ml/data/Crop_recommendation.csv` | Kaggle crop recommendation dataset (training data for crop model) |
| `ml/data/synthetic_yield_data.csv` | Synthetically generated yield data (500 samples × 22 crops) |
| `ml/data/real_world_yield_data.csv` | Real-world grounded yield data (ICRISAT anchors) |
| `ml/data/grounded_yield_data.csv` | ICAR/FAO-grounded yield data |
| `ml/data/real_world_validation.csv` | Validation dataset for yield model stress testing |
