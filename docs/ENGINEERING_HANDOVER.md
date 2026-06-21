# AgriMindAI — Engineering Handover

> **Pretend you are handing this project to a new team.** This document contains everything a developer needs to understand, maintain, and extend AgriMindAI without prior context.

---

## 1. What Is This Project?

AgriMindAI is an **AI-powered farmer advisory platform** that helps Indian farmers make data-driven decisions about crop selection, yield estimation, fertilizer usage, and market timing. It combines three ML models (Random Forest Classifier, Random Forest Regressor, LSTM neural network) with a React frontend and Express backend in a monorepo deployed as a single Docker container.

**Repository:** [github.com/sakalesha/AI-Farmer-Advisory](https://github.com/sakalesha/AI-Farmer-Advisory)

**Key Entry Points:**
- **Frontend:** [frontend/src/App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx) — 711-line root component managing all state
- **Backend:** [backend/src/app.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/app.js) — Express server with MongoDB, middleware stack, route mounting
- **ML API:** [ml/ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py) — Flask server hosting 3 ML models
- **Core Controller:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js) — the most complex file; handles ML calls, caching, circuit breaking, fertilizer analysis, revenue calculation

---

## 2. How to Get Running in 10 Minutes

```bash
# Prerequisites: Node.js 20+, Python 3.10+, MongoDB Atlas account

# 1. Clone and install
git clone https://github.com/sakalesha/AI-Farmer-Advisory.git
cd AI-Farmer-Advisory
npm run install-all
cd ml && pip install -r requirements.txt && cd ..

# 2. Configure environment
# Create/edit backend/.env:
#   MONGODB_URI=mongodb+srv://...
#   JWT_SECRET=your-secret-key
#   ML_SERVICE_URL=http://localhost:5001

# 3. Seed the database (creates demo user: demo@agrimind.ai / password123)
cd backend/src/scripts && node runSeed.js && cd ../../..

# 4. Start all 3 services
cd ml && python ml_api.py &          # Terminal 1 (ML service :5001)
cd backend && npm run dev &          # Terminal 2 (API server :5000)
cd frontend && npm run dev           # Terminal 3 (Dev server :3000)

# 5. Open http://localhost:3000 → Click "Login as Demo User"
```

---

## 3. Architecture at a Glance

```
Browser (React SPA on :3000)
    │
    │ HTTP + JWT Cookie
    ▼
Express API Gateway (:5000)
    │
    ├── Auth: JWT verify → bcrypt → MongoDB
    ├── Validation: Zod schemas on all inputs
    ├── Rate Limit: 10 req/min on /api/recommend
    ├── LRU Cache: 200 entries, 24h TTL
    │
    │ axios + opossum circuit breaker
    ▼
Flask ML Service (:5001)
    │
    ├── /api/predict → Random Forest Classifier (crop)
    ├── /api/predict_yield → Random Forest Regressor (yield + P10/P90)
    ├── /api/predict_price_trend → LSTM (price trend)
    └── /api/prices/all → Live mandi prices (Data.gov.in)
    │
    ▼
External APIs:
    ├── Data.gov.in Agmarknet (live commodity prices)
    ├── Frankfurter.app (USD/INR exchange rate)
    ├── OpenWeatherMap (weather)
    └── Google Gemini (chatbot + disease detection)
```

---

## 4. Codebase Mental Model

### The 5 files that control everything:

| File | Lines | What It Does |
|---|---|---|
| `App.tsx` | 711 | All frontend state, routing, API calls, component rendering |
| `recommendController.js` | ~185 | ML integration, caching, circuit breaking, fertilizer calc, revenue |
| `ml_api.py` | 247 | All ML model loading and inference endpoints |
| `app.js` | ~120 | Express server config, MongoDB connection, route mounting |
| `User.js` | ~80 | User schema with preferences, inventory, tasks, disease history |

### State management:

The frontend uses **zero external state management** — all state lives in `App.tsx` via `useState` hooks:
- `isAuthenticated` → gates the auth page
- `activeTab` → drives tab-based navigation (14 tabs)
- `profile` → massive UserProfile object (farm data, preferences, inventory, tasks, analytics)
- `recommendation` → latest ML recommendation result
- `notifications` → hardcoded initial array, client-side only
- `machinery` → fetched from `/api/machinery` on login

State hydration: On login, three `useEffect` hooks fetch from `/api/auth/me`, `/api/history`, and `/api/machinery` to populate the profile and analytics.

State persistence: Profile changes call `saveProfileToDb()` which PUTs to `/api/auth/profile`.

---

## 5. Patterns You Must Know

### Pattern 1: Circuit Breaker (opossum)
Every ML service call goes through `mlBreaker.fire()`. If 50% of calls fail (min 3 attempts), the circuit opens for 30 seconds and all calls immediately fail with a fallback value. This prevents the Express server from hanging on dead ML connections.

**Location:** [recommendController.js#L18-L24](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L18-L24)

### Pattern 2: LRU Cache
The 7 soil input parameters are concatenated into a pipe-separated key. On cache hit, both `/api/predict` and `/api/predict_yield` calls are skipped. The cache holds 200 entries with 24-hour TTL.

**Location:** [recommendController.js#L28-L44](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L28-L44)

### Pattern 3: Validation → Middleware → Controller
Routes compose middleware: `protect` (JWT) → `apiLimiter` (rate limit) → `validate(schema)` (Zod) → controller handler. This is consistent across all protected routes.

### Pattern 4: MongoDB Connection Caching
A module-scope `cachedDb` variable stores the MongoDB connection. The `connectDB()` function returns early if already connected. This pattern supports serverless cold-start environments.

**Location:** [app.js#L16-L30](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/app.js#L16-L30)

### Pattern 5: Frontend Profile-as-Database
Tasks, inventory, and disease history are subdocument arrays inside the User document. The frontend manages them as state, then syncs changes to MongoDB via `PUT /api/auth/profile`. This means the User document is the single source of truth for all user data.

### Pattern 6: Graceful Degradation
Each external dependency has a fallback:
- ML service down → circuit breaker error or default yield
- Data.gov.in down → static 2024 mandi prices with ±2-5% noise
- Frankfurter.app down → cached exchange rate or error
- OpenWeatherMap down → simulated weather data
- Gemini API down → disease detection uses mock results

---

## 6. What's Real vs. Mock

> [!IMPORTANT]
> Not everything in the UI is backed by real functionality. Here's the truth table:

| Feature | Status | Notes |
|---|---|---|
| Crop Recommendation | ✅ Real ML | Random Forest Classifier, 22 crops |
| Yield Estimation | ✅ Real ML | Random Forest Regressor + P10/P90 intervals |
| Price Forecasting | ✅ Real ML | LSTM (if TensorFlow installed), fallback to static |
| Market Prices | ✅ Real API | Data.gov.in live data, with static fallback |
| Auth (Login/Register) | ✅ Real | JWT + bcrypt + MongoDB |
| Profile Sync | ✅ Real | MongoDB persistence via /api/auth/profile |
| Community Posts | ✅ Real | MongoDB + likes |
| Machinery Rental | ❌ Switched Off | MongoDB CRUD, currently commented out in [Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) navigation |
| Weather Widget | ⚠️ Partial | Only temp/humidity from API; forecast/wind/UV hardcoded |
| AI Chatbot | ❌ Switched Off | Real Gemini API calls, but currently commented out in [Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) navigation |
| Disease Detection | ❌ Switched Off | Always returned random mock results, currently commented out in [Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) navigation |
| Voice Input | ❌ Mock | Hardcoded text after 3s timer |
| Financial Ledger | ❌ Client-only | Not persisted, lost on refresh |
| Notifications | ❌ Client-only | Hardcoded initial data, no backend system |
| Google OAuth | ❌ UI-only | Button renders but has no handler |
| Forgot Password | ❌ UI-only | Button renders but has no handler |
| i18n | ⚠️ Partial | Only sidebar labels translated (EN + HI) |

---

## 7. Known Bugs & Technical Debt

| Item | Severity | Description | File |
|---|---|---|---|
| Post content length mismatch | Low | Zod allows 2000 chars, Mongoose limits to 500 | `postValidators.js` vs `Post.js` |
| Financial data not persisted | Medium | Client-side only, lost on refresh | `FinancialLedger.tsx` |
| Hardcoded coordinates | Low | WeatherWidget always fetches Ludhiana weather | `WeatherWidget.tsx#L17` |
| Analytics "coming soon" overlay | Bug | Analytics tab renders both the dashboard AND a "coming soon" overlay on top | `App.tsx#L665-L671` |
| `BASE_DIR` undefined in training script | Bug | `train_yield_model.py` uses `BASE_DIR` without defining it | `train_yield_model.py#L41` |
| Express 5 pre-release | Risk | Express 5 is not yet stable; may have breaking changes | `backend/package.json` |
| 90-day JWT expiry | Risk | Excessively long; no rotation mechanism | `authController.js` |
| No HTTPS | Risk | All traffic in cleartext in production | Deployment config |

---

## 8. How to Add a New Feature

### Adding a New Frontend Page

1. Create `frontend/src/pages/MyFeature.tsx`
2. Import it in `App.tsx`
3. Add a new tab entry in the `activeTab` conditional rendering block (~line 448)
4. Add the tab to the `navItems` array in `Sidebar.tsx` (~line 47)
5. Add translation keys in `i18n.ts` for both `en` and `hi` (optional)

### Adding a New Backend API Endpoint

1. Create controller: `backend/src/controllers/myController.js`
2. Create route: `backend/src/routes/myRoutes.js`
3. Create validator: `backend/src/validators/myValidators.js` (Zod schema)
4. Mount in `app.js`: `app.use('/api/my-feature', myRoutes)`
5. Add auth middleware if needed: `router.use(protect)`

### Adding a New ML Model

1. Train and serialize model: save as `.pkl` or `.h5` in `ml/models/`
2. Load model in `ml_api.py` alongside existing models
3. Add new Flask endpoint: `@app.route('/api/my_prediction', methods=['POST'])`
4. Call from Express controller via `mlBreaker.fire()`

### Adding a New Mongoose Model

1. Create schema: `backend/src/models/MyModel.js`
2. Add references if needed (ObjectId → User, etc.)
3. Create controller + routes as above
4. Consider adding to `dbSeeder.js` for demo data

---

## 9. Performance Characteristics

| Component | Metric | Details |
|---|---|---|
| LRU Cache | 200 entries, 24h TTL | Eliminates redundant ML calls for identical inputs |
| Exchange Rate | 1-hour in-memory TTL | Cached module-scope variable |
| Circuit Breaker | 8s timeout, 30s reset | Auto-recovery from ML service failures |
| Rate Limit | 10 req/60s on `/api/recommend` | Per-IP throttling |
| Yield Model | ~60 MB in memory | Random Forest with 100 estimators |
| LSTM Model | ~150 KB | Lightweight price predictor |
| Flask Startup | 10-30 seconds | Model loading (yield model dominates) |
| MongoDB Connection | Module-scope cached | Single connection per process |

---

## 10. Documentation Index

| Document | Path | Purpose |
|---|---|---|
| Project Overview | [PROJECT_OVERVIEW.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/PROJECT_OVERVIEW.md) | What this project is and why it exists |
| Architecture | [ARCHITECTURE.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/ARCHITECTURE.md) | System design, data flows, Mermaid diagrams |
| Features | [FEATURES.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/FEATURES.md) | Complete feature inventory with limitations |
| API Reference | [API_REFERENCE.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/API_REFERENCE.md) | Every endpoint with request/response formats |
| Data Model | [DATA_MODEL.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/DATA_MODEL.md) | MongoDB schemas, ERD, data flows |
| Deployment | [DEPLOYMENT.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/DEPLOYMENT.md) | Local setup, Docker, env vars, seeding |
| Troubleshooting | [TROUBLESHOOTING.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/TROUBLESHOOTING.md) | 12 common issues with diagnostic steps |
| Repository Map | [REPOSITORY_MAP.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/REPOSITORY_MAP.md) | Every file annotated with purpose |
| Security Review | [SECURITY_REVIEW.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/SECURITY_REVIEW.md) | Security audit with strengths and vulnerabilities |
| Engineering Handover | [ENGINEERING_HANDOVER.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/docs/ENGINEERING_HANDOVER.md) | This document |
| Project Report | [AgriMindAI_Project_Report.md](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/AgriMindAI_Project_Report.md) | Original comprehensive report (518 lines) |

---

## 11. Future Roadmap Suggestions

### High Priority
1. **Implement refresh token rotation** — 90-day JWT is a security risk
2. **Persist financial data** — FinancialLedger is client-side only
3. **Enable HTTPS** — Required for production deployment
4. **Fix analytics overlay bug** — Both dashboard and "coming soon" render simultaneously

### Medium Priority
5. **Replace module caches with Redis** — Required for horizontal scaling
6. **Separate Flask into independent service** — Enables independent ML scaling
7. **Implement real Gemini disease detection** — Currently mock
8. **Add model versioning** — Track which model version generated each recommendation
9. **Extend i18n beyond sidebar** — Currently only sidebar labels translated

### Low Priority
10. **Add unit tests** — No test files exist in the repository
11. **Implement Google OAuth** — Button exists but is non-functional
12. **Add password change/reset flow** — Only UI placeholder exists
13. **Machinery return mechanism** — Rental has no un-rent flow
14. **WeatherWidget dynamic coordinates** — Use user's farm location instead of hardcoded Ludhiana

---

## 12. Contact & Credits

- **Solo Developer:** Rona Dasakalesha
- **GitHub:** [sakalesha](https://github.com/sakalesha)
- **Email:** ronadasakalesha@gmail.com
- **Project Status:** Completed (MVP)
