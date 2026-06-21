# AgriMindAI — Troubleshooting Guide

## Quick Diagnostics

| Symptom | Likely Cause | Quick Fix |
|---|---|---|
| `Cannot find module` errors | Missing dependencies | Run `npm run install-all` from project root |
| "Network error" on login | Backend not running | Start backend: `cd backend && npm run dev` |
| "Incorrect email or password" for demo user | Database not seeded or double-hashed | Re-run `node backend/src/scripts/runSeed.js` |
| ML predictions fail with 503 | Flask ML service not running | Start: `cd ml && python ml_api.py` |
| Market prices show simulated data | Missing `DATA_GOV_API_KEY` | Set key in `.env` |
| Weather shows fallback data | Missing `WEATHER_API_KEY` | Set key in `.env` |
| Frontend shows blank page | Vite build failed or missing deps | Run `cd frontend && npm install && npm run build` |
| CORS errors in browser | Backend not running on expected port | Check Vite proxy config and backend port |

---

## Common Issues & Solutions

### 1. Demo User Login Fails: "Incorrect email or password"

**Root Cause:** The database either hasn't been seeded, or the demo user's password was double-hashed. The Mongoose pre-save hook hashes passwords automatically — if the seeder passes an already-hashed password, it gets hashed again, making the stored hash unmatchable.

**Solution:**
```bash
# Re-run the seeder (it deletes old demo users first)
cd backend/src/scripts
node runSeed.js
```

The seeder passes raw plaintext passwords and lets the Mongoose hook hash them exactly once.

**Source:** [dbSeeder.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/utils/dbSeeder.js) — uses `User.create()` with raw passwords.

---

### 2. ML Service Unavailable (503 Error)

**Symptom:** `POST /api/recommend` returns:
```json
{
  "status": "fail",
  "message": "Prediction service temporarily unavailable. Please try again later.",
  "code": "ML_SERVICE_UNAVAILABLE"
}
```

**Root Cause:** The Flask ML service on port 5001 is not running, or the circuit breaker has opened due to repeated failures.

**Diagnostic Steps:**
```bash
# 1. Check if Flask is running
curl http://localhost:5001/api/health

# 2. If not running, start it
cd ml
python ml_api.py

# 3. If running but failing, check model files exist
ls -la ml/models/
# Required files: crop_model.pkl, scaler.pkl, label_encoder.pkl,
#                 yield_model.pkl, yield_label_encoder.pkl
```

**Circuit Breaker Recovery:** The circuit breaker auto-resets after 30 seconds. Wait 30s and retry.

**Source:** Circuit breaker config in [recommendController.js#L18-L24](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L18-L24)

---

### 3. Missing ML Model Files

**Symptom:** Flask starts but logs `ERROR loading model: [Errno 2] No such file or directory`

**Root Cause:** Model pickle files are missing from `ml/models/`. These files are >60 MB and may be excluded from git due to `.gitignore`.

**Solution:**
```bash
# Check if models exist
ls -la ml/models/

# If missing, retrain the crop model (requires Kaggle dataset):
cd ml/notebooks
jupyter notebook model_training.ipynb
# Run all cells → generates crop_model.pkl, scaler.pkl, label_encoder.pkl

# Retrain yield model:
cd ml/src/preprocessing
python source_real_data.py          # Generate training data
cd ../training
python train_yield_model.py          # Train and export model

# Retrain price model:
cd ml/notebooks
python train_price_lstm.py           # Train LSTM → lstm_price_model.h5
```

---

### 4. MongoDB Connection Errors

**Symptom:** Backend starts but API calls return 500 errors. Console logs show:
```
MongoDB Connection Error: MongooseServerSelectionError: ...
```

**Root Cause:** Invalid `MONGODB_URI` or network connectivity issues to MongoDB Atlas.

**Diagnostic Steps:**
```bash
# 1. Verify MONGODB_URI in .env
cat backend/.env | grep MONGODB_URI

# 2. Test MongoDB connectivity
mongosh "your-mongodb-uri"

# 3. Common issues:
#    - IP whitelist: Add your current IP to MongoDB Atlas Network Access
#    - Expired credentials: Rotate database user password
#    - DNS resolution: Try using the direct connection string instead of SRV
```

---

### 5. Vite Proxy Not Working (API 404s in Browser)

**Symptom:** Frontend loads but all API calls to `/api/*` return 404 or CORS errors.

**Root Cause:** The Vite dev server proxy requires the Express backend to be running on port 5000.

**Solution:**
1. Ensure backend is running: `cd backend && npm run dev`
2. Verify proxy config in [vite.config.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/vite.config.ts):
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```
3. If using a different backend port, update the proxy target.

---

### 6. TensorFlow Import Errors (LSTM Model)

**Symptom:** Flask logs:
```
WARNING: TensorFlow load failed: No module named 'tensorflow'
```

**Root Cause:** TensorFlow is not installed in the Python environment. The LSTM price model is optional — the system degrades gracefully without it.

**Impact:** Price trend forecasting returns "Stable" for all crops. Crop recommendation and yield estimation still work normally.

**Solution:**
```bash
pip install tensorflow
# Or for a lighter install:
pip install tensorflow-cpu
```

> [!NOTE]
> TensorFlow is ~500 MB. If you don't need price forecasting, you can skip this dependency. The system will use static fallback prices instead.

---

### 7. Rate Limiting on Recommendation Endpoint

**Symptom:** `POST /api/recommend` returns 429 after 10 requests within a minute.

**Root Cause:** The endpoint is rate-limited to 10 requests per 60 seconds per IP address.

**Explanation:** This is intentional to prevent excessive ML service calls. In development, you can temporarily increase the limit:

**Source:** [recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) — `rateLimit({ windowMs: 60000, max: 10 })`

---

### 8. Docker Build Fails at Python Step

**Symptom:** Docker build fails with pip install errors during the Python venv setup.

**Common Causes:**
- ARM architecture (Apple M1/M2) incompatibility with prebuilt wheels
- Network timeout during pip downloads

**Solutions:**
```bash
# For ARM Macs:
docker build --platform linux/amd64 -t agrimind-ai .

# For network issues:
docker build --network host -t agrimind-ai .
```

---

### 9. Data.gov.in API Returns No Records

**Symptom:** Market prices show simulated data even with `DATA_GOV_API_KEY` set.

**Root Cause:** The Data.gov.in API may:
- Return empty `records` array on weekends/holidays
- Throttle requests
- Have changed API resource IDs

**Diagnostic:**
```bash
# Test the API directly
curl "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&limit=5"
```

**Fallback Behavior:** When API calls fail, the system uses static 2024 mandi averages from [price_scraper.py#L11-L18](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/utils/price_scraper.py#L11-L18) with ±2-5% random fluctuation. The response still returns valid prices — they just aren't live.

---

### 10. Frontend Build TypeScript Errors

**Symptom:** `npm run build` fails with TypeScript errors.

**Solution:**
```bash
# 1. Check for type errors
cd frontend
npx tsc --noEmit

# 2. Common fix: ensure all peer dependencies are installed
npm install

# 3. If path alias errors (@/src/...), verify tsconfig.json paths:
# "paths": { "@/*": ["./*"] }
```

**Source:** [tsconfig.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/tsconfig.json)

---

### 11. Weather Widget Shows Hardcoded Data

**Symptom:** Weather always shows "Ludhiana, PB" and partially static data.

**Root Cause:** This is by design — the weather widget hardcodes coordinates to `lat=30.9000&lon=75.8500` (Ludhiana, Punjab):

**Source:** [WeatherWidget.tsx#L17](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/WeatherWidget.tsx#L17)

Additionally, the 4-day forecast, wind speed, and UV index are hardcoded in the component and not fetched from the API. Only `temp` and `humidity` are dynamic.

---

### 12. Gemini AI Features Not Working

**Symptom:** Disease Detection shows mock results. Chatbot returns generic error.

**Root Cause:** The `GEMINI_API_KEY` environment variable is not set or the Gemini API is unreachable.

**For Disease Detection:** The current implementation **always uses mock data** regardless of API key:
```typescript
// DiseaseDetection.tsx line 64
await new Promise(resolve => setTimeout(resolve, 3000));
// Mock result returned instead of actual Gemini call
```

**For AI Consultant:** The chatbot does make real Gemini API calls. Ensure `GEMINI_API_KEY` is valid.

**Source:** [DiseaseDetection.tsx#L51-L115](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/DiseaseDetection.tsx#L51-L115), [AgriConsultant.tsx#L63-L71](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AgriConsultant.tsx#L63-L71)

---

## Debugging Tools

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### ML Service Health Check
```bash
curl http://localhost:5001/api/health
```

### Test ML Prediction Directly
```bash
curl -X POST http://localhost:5001/api/predict \
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":40,"K":40,"temperature":28,"humidity":80,"ph":6.5,"rainfall":200}'
```

### Diagnostic Endpoint (dist/ file listing)
```bash
curl http://localhost:5000/api/diag
```

### Check Database Connection
```bash
# Via the app — if /api/health returns OK but /api/auth/me returns 500,
# the database connection is failing
curl http://localhost:5000/api/auth/me
```

### View Backend Logs
The Express server logs to stdout. Key log prefixes:
- `MongoDB Connected Successfully` — DB connection OK
- `Server is running on port 5000` — Express started
- `SUCCESS: Original models loaded` — Flask models loaded
- `WARNING: TensorFlow load failed` — LSTM model unavailable
- `Cache HIT` / `Cache MISS` — LRU cache activity
