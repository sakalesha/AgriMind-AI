# AgriMindAI — Feature Inventory

## Complete Feature Reference

---

### 1. Crop Recommendation Engine

- **Purpose:** Predicts the best-fit crop from 22 options based on 7 soil/climate parameters
- **User Workflow:** User enters N, P, K, temperature, humidity, pH, rainfall on the Dashboard → clicks "Generate Advisory" → receives crop name + irrigation level
- **Entry Point (Frontend):** [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx#L312-L356) `handleSoilSubmit()`
- **Entry Point (Backend):** [recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) → [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
- **ML Endpoint:** `POST /api/predict` in [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L63-L88)
- **Related Files:** `SoilInputForm.tsx`, `RecommendationCard.tsx`, `crop_model.pkl`, `scaler.pkl`, `label_encoder.pkl`
- **Database Tables:** `recommendations` collection
- **Dependencies:** scikit-learn RandomForestClassifier, StandardScaler, LabelEncoder
- **Known Limitations:** Model trained on Kaggle dataset, not region-specific Indian soil data. LRU cache means identical inputs skip ML calls for 24 hours.


-------------------------------------------------------

Here is a complete, technical breakdown of how the **Crop Recommendation Engine** works from end to end. This explanation covers every layer of the stack, including code paths, data transformations, and architectural design choices.

---

### Phase 1: Frontend Input & Request Construction
*   **Source File:** [SoilInputForm.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/SoilInputForm.tsx) and [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  The user fills out the form with 7 critical parameters:
        *   **N** (Nitrogen), **P** (Phosphorus), **K** (Potassium) in kg/ha
        *   **Temperature** in °C
        *   **Humidity** (percentage)
        *   **pH** (0–14)
        *   **Rainfall** in mm
        *   **fieldName** (optional name tag, e.g., *"North Rice Field"*)
    2.  The frontend invokes `handleSoilSubmit()` in `App.tsx`.
    3.  A `POST` request is dispatched to `/api/recommend`.
        *   **Security Configuration:** The request is fired with `credentials: 'include'`. This instructs the browser to automatically attach the secure `jwt` session cookie to the outgoing request headers.

---

### Phase 2: API Gateway Router & Middleware Pipeline
*   **Source Files:** [recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) and [validate.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/validate.js)
*   **Workflow:**
    The request hits the Express backend gateway on port `5000`. Before executing the controller, it passes through a pipeline of three middlewares:
    1.  **Authentication Middleware (`protect`):** Reads the incoming HTTP-only cookie, decodes the JWT signature using `process.env.JWT_SECRET`, checks if the user exists in the database, and binds the authenticated user document to `req.user`.
    2.  **Rate Limiter Middleware (`apiLimiter`):** Enforces a limit of **10 requests per 60 seconds per IP** using `express-rate-limit`. This prevents malicious client-side scripting or denial-of-service attempts on the computationally heavy ML endpoints.
    3.  **Zod Validation Middleware (`validate`):** Parses the input body against `recommendSchema` (defined in [recommendValidators.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/validators/recommendValidators.js)). This guarantees that all parameters fall within realistic physical ranges before hitting the Python model:
        *   `N, P, K`: Integers between `0` and `500`.
        *   `temperature`: Decimal between `-50` and `60`.
        *   `humidity`: Decimal between `0` and `100`.
        *   `ph`: Decimal between `0` and `14`.
        *   `rainfall`: Decimal between `0` and `500`.

---

### Phase 3: Caching & Circuit-Breaker Guardrails
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  **LRU Cache Lookup:** The backend constructs an in-memory string key combining the inputs:
        ```javascript
        const cacheKey = `${N}|${P}|${K}|${temperature}|${humidity}|${ph}|${rainfall}`;
        ```
        It queries a local cache (`mlCache`, managed via `lru-cache` with a maximum capacity of 200 entries and a 24-hour TTL).
        *   **Cache Hit:** Skips the downstream ML microservice calls entirely and populates the local variables with the cached crop name and yield estimates.
        *   **Cache Miss:** Initiates the inter-service communication pipeline.
    2.  **Circuit Breaker Wrappers:** To prevent slow Python processes from blocking the Node event loop, all outgoing microservice calls use `opossum` circuit breakers (`mlBreaker`).
        *   **Settings:** 8,000ms timeout per request, 50% error threshold to trip open, and a 30-second cooldown period before entering half-open testing.

---

### Phase 4: Python Flask ML Service Execution
*   **Source Files:** [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py) and [price_scraper.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/utils/price_scraper.py)
*   **Workflow:**
    If the request is a cache miss, the Express server posts to the internal Flask service running on `http://127.0.0.1:5001`.
    
    1.  **Crop Recommendation Inference (`POST /api/predict`):**
        *   Flask receives the JSON payload: `{ N, P, K, temperature, humidity, ph, rainfall }`.
        *   The inputs are cast to a NumPy array and scaled using a pre-trained standard scaler object:
            ```python
            scaled_input = scaler.transform(np.array([[N, P, K, temp, hum, ph, rain]]))
            ```
        *   The scaled data is evaluated by a serialized **Random Forest Classifier** (`crop_model.pkl`), which outputs an encoded label representing one of 22 possible crops.
        *   The label is converted back to a readable crop name string using a `LabelEncoder` (e.g., `"rice"`).
        *   **Irrigation Advisory (Rule-Based Engine):** Flask evaluates rainfall and humidity using a rule-based function:
            ```python
            def get_irrigation_level(rainfall, humidity):
                if rainfall < 60: return 'High'
                elif humidity > 70: return 'Low'
                else: return 'Medium'
            ```
            Flask returns the predicted crop name and irrigation level to Express.
            
    2.  **Yield Prediction Inference (`POST /api/predict_yield`):**
        *   Express takes the predicted crop name and makes a second call to Flask.
        *   Flask encodes the crop name and forms an 8-feature array: `[crop_encoded, N, P, K, temperature, humidity, ph, rainfall]`.
        *   The array is processed by a **Random Forest Regressor** (`yield_model.pkl`) to generate a yield estimate in tons per hectare.
        *   **Yield Uncertainty Quantification:** Flask calculates P10/P90 prediction intervals on the fly by running the input through all 100 individual decision trees inside the Random Forest ensemble and computing the percentiles:
            ```python
            all_tree_predictions = [tree.predict(input_array)[0] for tree in yield_model.estimators_]
            lower_bound = np.percentile(all_tree_predictions, 10)
            upper_bound = np.percentile(all_tree_predictions, 90)
            ```
            The yield point estimate and the interval limits are returned to Express.
            
    3.  **Price Trend Forecasting (`POST /api/predict_price_trend`):**
        *   Flask checks if it has an active LSTM model (`lstm_price_model.h5`) and historical price trends (`crop_price_history.json`).
        *   It scrapes the latest commodity price from the Agmarknet API using [price_scraper.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/utils/price_scraper.py).
        *   It constructs a 5-month sequence by appending the scraped price to the crop's 4-month historical price data.
        *   The sequence is normalized using a `MinMaxScaler` (`price_scaler.pkl`) and passed to the **LSTM Model**.
        *   The model predicts next-month's price.
        *   **Trend Classification:** If the predicted price is >2% higher than the current price, the trend is classified as `"Up"`. If it's <2% lower, the trend is classified as `"Down"`. Otherwise, it is marked as `"Stable"`.
        *   Flask returns the current price, predicted price, and trend label to Express.

---

### Phase 5: Advisory Enrichment & Calculations
*   **Source Files:** [cropRequirements.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/data/cropRequirements.js) and [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    Back on the Express server, the controller enriches the ML prediction data:
    1.  **Fertilizer Deficit Remediation:** Express reads target nutrient requirements from `cropRequirements.js` and subtracts the user's input soil metrics (e.g., target N - input N). If a nutrient is lacking, it generates specific application instructions (e.g., *"Add 40 units of Nitrogen"*).
    2.  **Currency Translation:** Express fetches the latest USD/INR exchange rate from Frankfurter.app (using a cached value if it was updated within the last hour). It converts prices from USD to INR (e.g., multiplying the crop price by the exchange rate).
    3.  **Revenue Estimation:** Express multiplies the estimated yield (tons/hectare) by the predicted price per ton to calculate the estimated revenue.

---

### Phase 6: Persistence & Client Dispatch
*   **Source Files:** [Recommendation.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Recommendation.js) and [RecommendationCard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/RecommendationCard.tsx)
*   **Workflow:**
    1.  Express instantiates a Mongoose `Recommendation` document containing the input metrics, predicted crop, yield interval, fertilizer advice, and financial estimates.
    2.  The document is saved to MongoDB Atlas, linked to the authenticated user ID (`req.user._id`).
    3.  Express returns a `200 OK` JSON response containing the full advisory payload.
    4.  The React app updates its global state. [RecommendationCard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/RecommendationCard.tsx) renders the results, showing the farmer the recommended crop, optimal fertilizer levels, yield range, and estimated revenue.

---

### Core Interview Highlights (Ready to Discuss)
*   **Ensuring Fault Tolerance:** Critical tasks (crop prediction) use strict error handling. Non-critical tasks (yield prediction) degrade gracefully, falling back to static values if the microservice calls fail.
*   **Performance Optimization:** The LRU cache key construction prevents redundant Flask requests for duplicate inputs, while the Frankfurter API cache limits slow external network calls.
*   **Ensemble Percentile Intervals:** The P10/P90 interval estimation uses the existing Random Forest ensemble, providing yield confidence ranges without the overhead of training a separate probabilistic model.

---

### 2. Yield Estimation

- **Purpose:** Predicts crop yield in tons/hectare with P10–P90 confidence intervals
- **User Workflow:** Automatically called after crop prediction; results displayed in recommendation card
- **Entry Point (Backend):** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L88-L97)
- **ML Endpoint:** `POST /api/predict_yield` in [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L90-L124)
- **Related Files:** `yield_model.pkl` (60 MB), `yield_label_encoder.pkl`
- **Database Tables:** Stored in `recommendations.prediction.yield` and `recommendations.prediction.yieldInterval`
- **Dependencies:** scikit-learn RandomForestRegressor (100 estimators)
- **Known Limitations:** Non-blocking fallback to default yield (2.0) if ML call fails. Training R² of 0.9973 is on synthetic data.

---------------------------------------------------------

Edited FEATURES.md
Viewed FEATURES.md:145-167

Here is the phase-by-phase breakdown for the **Yield Estimation** feature, formatted exactly like the Crop Recommendation Engine:

---

### Phase 1: Frontend Input & Request Construction
*   **Source Files:** [SoilInputForm.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/SoilInputForm.tsx) and [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  The user inputs the 7 soil/climatic parameters on the form and clicks "Generate Advisory".
    2.  `handleSoilSubmit()` in `App.tsx` captures the inputs and dispatches a unified `POST` request to `/api/recommend`.
    3.  **Security Configuration:** The request is fired with `credentials: 'include'` to automatically append the secure HttpOnly `jwt` session cookie in the request headers for authentication.

---

### Phase 2: API Gateway Router & Middleware Pipeline
*   **Source Files:** [recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) and [validate.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/validate.js)
*   **Workflow:**
    The request hits the Node.js Express gateway on port `5000` and passes through:
    1.  **`protect` Middleware:** Verifies the JWT signature, confirming the user's session is valid, and assigns the user record to `req.user`.
    2.  **`apiLimiter` Middleware:** Limits requests to 10 per minute per IP.
    3.  **`validate` Middleware:** Parses the input payload against the Zod schema (`recommendSchema`) to verify all numeric soil metrics (N, P, K, pH, rainfall, temperature, humidity) are within acceptable ranges.

---

### Phase 3: Caching & Circuit-Breaker Guardrails
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  **Cache Evaluation:** Express hashes the inputs into a key: `N|P|K|temp|hum|ph|rain` and checks `mlCache` (LRU cache).
        *   **Cache Hit:** Retrieves the pre-calculated yield point estimate and its P10/P90 interval, skipping any ML service calls.
        *   **Cache Miss:** Proceeds to call the ML microservice.
    2.  **Circuit Breaker Protection:** The outbound HTTP connection to the Flask service's yield model endpoint is wrapped in the `opossum` circuit breaker (`mlBreaker`).
        *   **Settings:** 8,000ms timeout threshold. If 50% of recent requests fail, the circuit opens to fail-fast and reject subsequent calls immediately.

---

### Phase 4: Python Flask ML Service Execution
*   **Source File:** [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py)
*   **Workflow:**
    Upon receiving a request at `POST /api/predict_yield` from Express:
    1.  **Crop Encoding:** Flask capitalizes the recommended crop string (e.g., *"Rice"*) and maps it to a numerical integer using a pre-loaded label encoder (`yield_label_encoder.pkl`).
    2.  **Array Formatting:** The inputs are compiled into a 2D NumPy array with 8 features matching the training layout: `[crop_encoded, N, P, K, temperature, humidity, ph, rainfall]`.
    3.  **Yield Regression:** The array is passed to the **Random Forest Regressor** (`yield_model.pkl`), which runs inference through an ensemble of 100 decision trees to output a point-estimate yield in tons per hectare.
    4.  **Yield Uncertainty Quantification:** To calculate confidence bounds without a separate probabilistic model, Flask runs inference across all 100 individual decision trees inside `yield_model.estimators_` and calculates the 10th and 90th percentiles of the distribution:
        ```python
        all_tree_predictions = [tree.predict(input_array)[0] for tree in yield_model.estimators_]
        lower_bound = np.percentile(all_tree_predictions, 10)
        upper_bound = np.percentile(all_tree_predictions, 90)
        ```
    5.  Flask returns `{ yield: 4.15, interval: [3.82, 4.48] }` to Express.

---

### Phase 5: Fault-Tolerant Resolution & Calculations
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  **Graceful Degradation (Non-Blocking Catch):** The controller encloses the yield microservice call in an isolated `try-catch` block. If the call fails (due to a timeout, Python crash, or open circuit), the error is caught, and the system falls back to a default yield estimate of `2.0` and a `null` interval without interrupting the user's request.
    2.  **Financial Projection:** If the yield calculation succeeds, Express uses the predicted yield and multiplies it by the forecast market price to calculate the projected revenue in INR.

---

### Phase 6: Persistence & Client Dispatch
*   **Source Files:** [Recommendation.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Recommendation.js) and [RecommendationCard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/RecommendationCard.tsx)
*   **Workflow:**
    1.  Express compiles the yield and yield interval fields into a Mongoose `Recommendation` model and saves the document to MongoDB Atlas under the user's profile.
    2.  Express returns a JSON response containing `yield` and `yieldInterval` to the React client.
    3.  `RecommendationCard.tsx` renders the expected yield and visualizes the confidence boundaries, showing the farmer the range of expected yield outcomes.

---

### Core Interview Highlights (Ready to Discuss)
*   **Fault Isolation:** Yield estimation is a non-blocking step. A service failure gracefully falls back to a baseline of 2.0 t/ha, keeping the application online.
*   **Uncertainty Quantification:** Leverages the Random Forest ensemble structure to estimate empirical confidence intervals (P10/P90) without the complexity of training a separate Bayesian Neural Network.

--------------------------------------------------------------------------

### 3. Price Trend Forecasting (LSTM)

- **Purpose:** Predicts next-period commodity price trend (Up/Down/Stable) using a 5-step LSTM sequence
- **User Workflow:** Automatically called during recommendation; trend shown in market section of response
- **Entry Point (Backend):** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L131-L142)
- **ML Endpoint:** `POST /api/predict_price_trend` in [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L189-L240)
- **Related Files:** `lstm_price_model.h5`, `price_scaler.pkl`, `crop_price_history.json`, `price_scraper.py`
- **Database Tables:** Stored in `recommendations.prediction.marketTrend`
- **Dependencies:** TensorFlow/Keras LSTM, MinMaxScaler, Data.gov.in API
- **Known Limitations:** LSTM trained on synthetic price data. Falls back to static prices if TensorFlow not installed or model missing. Trend thresholds are simple ±2% comparisons.

---------------------------------------------------------------------------
Edited ML_MODEL_TRINING.md
Edited FEATURES.md
Edited FEATURES.md
Viewed FEATURES.md:230-251

Here is the phase-by-phase breakdown for the **Price Trend Forecasting (LSTM)** feature, formatted exactly like the others:

---

### Phase 1: Frontend Input & Request Construction
*   **Source Files:** [SoilInputForm.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/SoilInputForm.tsx) and [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  The user fills out the soil form and clicks "Generate Advisory".
    2.  `handleSoilSubmit()` in `App.tsx` captures inputs and sends a unified `POST` request to `/api/recommend`.
    3.  **Security Configuration:** Request is fired with `credentials: 'include'` to automatically attach the secure HttpOnly `jwt` session cookie in the headers.

---

### Phase 2: API Gateway Router & Middleware Pipeline
*   **Source Files:** [recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) and [validate.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/validate.js)
*   **Workflow:**
    The request hits the Node.js Express gateway on port `5000` and passes through:
    1.  **`protect` Middleware:** Verifies the JWT signature, confirming the user session is active, and binds the user document to `req.user`.
    2.  **`apiLimiter` Middleware:** Restricts request rates to 10 per minute per IP.
    3.  **`validate` Middleware:** Parses the payload against `recommendSchema` to ensure soil inputs are validated.

---

### Phase 3: Caching & Circuit-Breaker Guardrails
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  **Cache Evaluation:** Express hashes the inputs into a key: `N|P|K|temp|hum|ph|rain` and checks `mlCache` (LRU cache).
        *   **Cache Hit:** Retrieves the pre-calculated market data (price, revenue, and trend), skipping any ML calls.
        *   **Cache Miss:** Proceeds to call the ML microservice.
    2.  **Circuit Breaker Protection:** The outbound HTTP connection to the Flask service's price trend endpoint is wrapped in the `opossum` circuit breaker (`mlBreaker`) configured with a timeout of 8,000ms.

---

### Phase 4: Python Flask ML Service Execution
*   **Source Files:** [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py) and [price_scraper.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/src/utils/price_scraper.py)
*   **Workflow:**
    Upon receiving a request at `POST /api/predict_price_trend` with the predicted crop name `{ crop }` from Express:
    1.  **Live Price Scrape:** Flask calls `fetch_realtime_price(crop)` in `price_scraper.py`. If a `DATA_GOV_API_KEY` is present, it queries the Data.gov.in Agmarknet API using the mapped commodity name (e.g., `Bengal Gram(Gram)(Whole)` for chickpea), extracts the latest modal price (INR/Quintal), and converts it to USD/Ton.
    2.  **Sequence Preparation:** The live scraped price is appended to the crop's 4-month historical price sequence loaded from `crop_price_history.json`, generating a sliding window sequence of **5 months**.
    3.  **Normalization:** The 5-month sequence is scaled between 0 and 1 using `price_scaler.pkl` (MinMaxScaler).
    4.  **LSTM Inference:** The normalized sequence is reshaped to `(1, 5, 1)` and fed into the **LSTM Model** (`lstm_price_model.h5`), which outputs a predicted normalized price for the 6th month.
    5.  **De-normalization & Trend Evaluation:** Flask inverse-transforms the prediction back to USD/Ton. It compares the predicted price against the current price:
        *   If `predicted_price > current_price * 1.02` $\rightarrow$ returns `"Up"`.
        *   If `predicted_price < current_price * 0.98` $\rightarrow$ returns `"Down"`.
        *   Otherwise $\rightarrow$ returns `"Stable"`.
    6.  Flask returns the current price, predicted price, and trend label to Express.

---

### Phase 5: Currency Conversion & Revenue Aggregation
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  **Graceful Degradation:** The LSTM microservice call runs in a `try-catch` block. If the call fails, Express falls back to static baseline crop values in `marketPrices.js` and generates a simulated trend (Up/Down/Stable).
    2.  **Exchange Rate Fetch & Conversion:** Express fetches the USD/INR exchange rate (cached for 1 hour). It converts the USD/Ton commodity prices to local currency (INR/Ton).
    3.  **Revenue Estimation:** Express multiplies the estimated yield (t/Ha) by the converted predicted price per ton to calculate the final projected revenue in INR.

---

### Phase 6: Persistence & Client Dispatch
*   **Source Files:** [Recommendation.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Recommendation.js) and [RecommendationCard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/RecommendationCard.tsx)
*   **Workflow:**
    1.  Express saves the market price, predicted price, trend, and estimated revenue into a Mongoose `Recommendation` document inside MongoDB Atlas.
    2.  Express returns the data to React.
    3.  `RecommendationCard.tsx` renders the results, showing the farmer the trend indicator (visualizing green/red trend arrows) and the calculated estimated revenue.

---

### Core Interview Highlights (Ready to Discuss)
*   **Sliding Window Sequence Inference:** Demonstrates sequence model design on the backend by combining 4 static months of context with 1 dynamic scraped month to feed the LSTM.
*   **Fallback Reliability:** Robust fallback mechanism guarantees price forecasts degrade gracefully if the TensorFlow environment is missing or the external government API fails.

---------------------------------------------------------------------------

### 4. Fertilizer Gap Analysis

- **Purpose:** Computes N/P/K deficits between actual soil values and crop-optimal requirements
- **User Workflow:** Displayed as part of recommendation response with human-readable advice strings
- **Entry Point:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L101-L123)
- **Related Files:** [cropRequirements.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/data/cropRequirements.js) — optimal NPK values for 22 crops
- **Database Tables:** Stored in `recommendations.fertilizer`
- **Dependencies:** None (rule-based)
- **Known Limitations:** Static lookup table; doesn't account for soil type, organic matter, or micronutrients.

---------------------------------------------------------------------------
Edited FEATURES.md
Viewed FEATURES.md:320-341

Here is the phase-by-phase breakdown for the **Fertilizer Gap Analysis** feature, formatted exactly like the others:

---

### Phase 1: Frontend Input & Request Construction
*   **Source Files:** [SoilInputForm.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/SoilInputForm.tsx) and [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  The user enters soil nutrient values (Nitrogen, Phosphorus, Potassium) in the soil form.
    2.  `handleSoilSubmit()` in `App.tsx` captures the inputs and includes them in the unified `POST /api/recommend` request payload.
    3.  **Security Configuration:** Request is fired with `credentials: 'include'` to automatically attach the secure HttpOnly `jwt` session cookie in the headers.

---

### Phase 2: API Gateway Router & Middleware Pipeline
*   **Source Files:** [recommendRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/recommendRoutes.js) and [validate.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/validate.js)
*   **Workflow:**
    The request hits the Express gateway on port `5000` and passes through:
    1.  **`protect` Middleware:** Verifies the JWT signature, confirming the user session is active, and binds the user document to `req.user`.
    2.  **`apiLimiter` Middleware:** Restricts request rates to 10 per minute per IP.
    3.  **`validate` Middleware:** Parses the payload against `recommendSchema` to ensure soil inputs are validated as integers between `0` and `500`.

---

### Phase 3: Caching & Circuit-Breaker Guardrails
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  **Cache Evaluation:** Express hashes the inputs into a key: `N|P|K|temp|hum|ph|rain` and checks `mlCache` (LRU cache).
        *   **Cache Hit:** Retrieves the pre-calculated fertilizer advice, skipping downstream checks.
        *   **Cache Miss:** Proceeds to calculate the fertilizer deficit locally.
    2.  **No Circuit Breaker:** Unlike the ML and external API calls, the fertilizer gap analysis is a fast, in-memory calculation that does not use the circuit breaker, as it does not rely on external network services.

---

### Phase 4: Crop Requirement Mapping
*   **Source Files:** [cropRequirements.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/data/cropRequirements.js) and [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  Once the Crop Recommendation model determines the recommended crop (e.g. `"rice"`), Express looks up that crop's optimal N, P, and K values in the local static file `cropRequirements.js` (e.g. rice optimal requirements: `N=80`, `P=40`, `K=40`).
    2.  If the recommended crop is found in the database map, the controller calculates the deficit for each nutrient:
        *   `nDeficit = targetN - inputN`
        *   `pDeficit = targetP - inputP`
        *   `kDeficit = targetK - inputK`
    3.  If the crop is not found in the requirements map, the controller falls back to a general NPK balance fertilizer recommendation.

---

### Phase 5: Advisory Text Generation
*   **Source File:** [recommendController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js)
*   **Workflow:**
    1.  If a deficit is greater than 0, the controller formats a specific advice string: `Add [deficit] units of Nitrogen/Phosphorus/Potassium`.
    2.  If a deficit is less than or equal to 0, it sets the status to `"Optimal"`.
    3.  It builds a human-readable summary array listing all detected nutrient deficiencies (e.g., `["Nitrogen deficiency detected for rice."]`).

---

### Phase 6: Persistence & Client Dispatch
*   **Source Files:** [Recommendation.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/Recommendation.js) and [RecommendationCard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/RecommendationCard.tsx)
*   **Workflow:**
    1.  Express compiles the fertilizer advice object into a Mongoose `Recommendation` document and saves it to MongoDB Atlas under the user's profile.
    2.  Express returns the `fertilizer` advice object to the React client.
    3.  `RecommendationCard.tsx` renders a visual comparison showing the farmer their input values compared to the optimal targets, displaying the suggested fertilizer application details.

---

### Core Interview Highlights (Ready to Discuss)
*   **Decoupled Heuristics:** Shows you can separate heavy ML logic from simple, deterministic business rules (static database lookups), avoiding the complexity of training a separate model for fertilizer advice.
*   **Resource Efficiency:** Because it runs locally in-memory using static mapping objects, it executes in sub-millisecond times with zero API dependencies.

---------------------------------------------------------------------------

### 5. Market Intelligence Dashboard

- **Purpose:** Shows live commodity prices for 22 crops with best-mandi identification and regional breakdowns
- **User Workflow:** Navigate to "Market Prices" tab → view price table with trends, best mandi, regional data
- **Entry Point (Frontend):** [MarketInsights.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/MarketInsights.tsx)
- **Entry Point (Backend):** [marketRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/marketRoutes.js) → [marketController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/marketController.js)
- **APIs Involved:** `GET /api/market/prices/all`, Data.gov.in Agmarknet API, Frankfurter.app
- **Database Tables:** None (real-time data, not persisted)
- **Dependencies:** axios, Data.gov.in API key (`DATA_GOV_API_KEY`)
- **Known Limitations:** No authentication required. Falls back to simulated prices with ±2–5% fluctuation if API key absent. Rate limited by Data.gov.in.

-------------------------------------------------------------------------
Edited FEATURES.md
Viewed FEATURES.md:403-425

Here is the phase-by-phase breakdown for the **Market Intelligence Dashboard** feature, formatted exactly like the others:

---

### Phase 1: Frontend Input & Request Construction
*   **Source Files:** [MarketInsights.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/MarketInsights.tsx)
*   **Workflow:**
    1.  The user navigates to the "Market Prices" tab on the sidebar.
    2.  The React page mounts and fires an HTTP `GET` request to `/api/market/prices/all`.
    3.  **Public Access:** This endpoint does **not** require authentication, meaning no JWT cookie verification is executed, reducing access latency for dashboard widgets.

---

### Phase 2: API Gateway Router & Middleware Pipeline
*   **Source Files:** [marketRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/marketRoutes.js) and [app.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/app.js)
*   **Workflow:**
    The request hits the Express routing gateway on port `5000`:
    1.  **Database Bypass:** The request bypasses the database connection middleware entirely because this route is read-only and relies on external APIs, saving database connection pool resources.
    2.  The route immediately executes the controller handler `getAllMarketPrices`.

---

### Phase 3: Parallel API Fetching
*   **Source File:** [marketController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/marketController.js)
*   **Workflow:**
    1.  The controller triggers parallel tasks using JavaScript `Promise.all` to fetch the current USD/INR exchange rate from Frankfurter.app and the latest bulk market prices from the Data.gov.in Agmarknet API concurrently:
        ```javascript
        const [usdToInr] = await Promise.all([
            getLiveExchangeRate()
        ]);
        ```
    2.  If the Frankfurter API fails, it falls back to a standard conversion rate of `83.5`.

---

### Phase 4: Government API Price Aggregation
*   **Source File:** [marketController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/marketController.js)
*   **Workflow:**
    1.  If a `DATA_GOV_API_KEY` is present in the environment variables, the backend queries the Agmarknet bulk endpoint: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=[key]&format=json&limit=2000`.
    2.  The backend groups the incoming array of mandi records by commodity name.
    3.  For each of the 22 supported crops:
        *   **Average Mandi Price:** Calculates the national average modal price (in INR/Quintal) across all reporting mandis.
        *   **Best Mandi:** Sorts the records to identify the specific state, district, and market offering the highest price for that crop.
        *   **Top 5 States:** Groups prices by state, averages them, and slices the top 5 highest-paying states.
    4.  **Simulated Fallback:** If the API key is missing or the external government server fails, the controller falls back to static baseline values in `STATIC_PRICES_INR` with a random fluctuation of ±2–5%.

---

### Phase 5: Currency Conversion & Unit Calculation
*   **Source File:** [marketController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/marketController.js)
*   **Workflow:**
    1.  **INR/Ton Conversion:** Multiplies the average price (INR/Quintal) by 10 to calculate the value in INR/Ton (since 1 Ton = 10 Quintals).
    2.  **USD Conversion:** Divides the INR/Ton price by the fetched exchange rate (`usdToInr`) to calculate the price in USD/Ton.
    3.  **Trend Calculation:** Compares the current calculated average price against a static baseline from `STATIC_PRICES_INR`. If the price is >5% higher, the trend is `"Up"`. If it's <5% lower, the trend is `"Down"`. Otherwise, it is marked as `"Stable"`.

---

### Phase 6: Response Dispatch & UI Render
*   **Source Files:** [MarketInsights.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/MarketInsights.tsx)
*   **Workflow:**
    1.  The controller returns the aggregated pricing array directly to the client browser with a `200 OK` JSON response.
    2.  The React app stores the array in state and renders the `MarketInsights.tsx` table. The UI displays the crop name, current average price, trend arrow indicators, the highest-paying mandi details (location and price), and a regional breakdown chart showing the top states.

---

### Core Interview Highlights (Ready to Discuss)
*   **Parallel Request Concurrency:** Demonstrates performance awareness by using `Promise.all` to fetch exchange rates and commodity records concurrently.
*   **Database Bypass:** Increases throughput and avoids connection pool limits by bypassing the MongoDB connection middleware for this route.
*   **Data Aggregation:** Showcases backend data transformation skills by converting raw mandi listings into actionable, state-level averages and identifying the highest-paying market.
-------------------------------------------------------------------------

### 6. Authentication System

- **Purpose:** User registration, login, logout, and session management
- **User Workflow:** AuthPage → Sign In / Register → JWT cookie set → redirected to Dashboard
- **Entry Point (Frontend):** [AuthPage.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AuthPage.tsx)
- **Entry Point (Backend):** [authRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/authRoutes.js) → [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js)
- **APIs Involved:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Database Tables:** `users` collection
- **Dependencies:** jsonwebtoken, bcryptjs, cookie-parser
- **Known Limitations:** No password reset flow. No refresh token rotation. 90-day JWT expiry is long. "Forgot Password" button is UI-only (no handler). Google OAuth button is non-functional (UI only).

--------------------------------------------------------------------------
Edited FEATURES.md
Viewed FEATURES.md:489-511

Here is the phase-by-phase breakdown for the **Authentication System** (JWT and bcrypt), formatted exactly like the others:

---

### Phase 1: Frontend Input & Request Construction
*   **Source Files:** [AuthPage.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AuthPage.tsx) and [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  The user enters their credentials (Full Name, Email, Password) on the auth page or clicks "Login as Demo User" (which automatically uses `demo@agrimind.ai` / `password123`).
    2.  The React app dispatches a `POST` request to `/api/auth/login` or `/api/auth/register` with the payload as JSON.

---

### Phase 2: API Gateway Router & Validation
*   **Source Files:** [authRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/authRoutes.js) and [validate.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/validate.js)
*   **Workflow:**
    The request hits the Express routing gateway on port `5000` and passes through:
    1.  **`validate` Middleware:** Parses the request body against `loginSchema` or `registerSchema` (defined in [authValidators.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/validators/authValidators.js)). 
        *   `email` must be a valid email structure.
        *   `password` must meet length requirements (minimum 8 characters for registration).
    2.  If validation fails, the middleware returns `400 Bad Request` with field-specific validation errors.

---

### Phase 3: Controller & Cryptographic Operations
*   **Source Files:** [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js) and [User.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/models/User.js)
*   **Workflow:**
    *   **For Registration (`register`):**
        1.  The controller attempts to write a user record: `User.create(req.body)`.
        2.  **Mongoose Pre-Save Hook:** Before writing to the database, a pre-save hook in `User.js` interceptively hashes the password string using `bcrypt.hash` with a cost factor of **12** (12 salt rounds):
            ```javascript
            userSchema.pre('save', async function() {
                if (!this.isModified('password')) return;
                this.password = await bcrypt.hash(this.password, 12);
            });
            ```
        3.  If the email is already registered, MongoDB throws a duplicate key error (`E11000`), which is caught and returned as a `400 Bad Request`.
    *   **For Login (`login`):**
        1.  The controller queries the database: `User.findOne({ email }).select('+password')`. (The `+password` flag is required because the schema defaults to `select: false` to hide password hashes from standard queries).
        2.  If a user record is found, it calls the schema method `comparePassword()`, which evaluates the candidate password against the stored hash using `bcrypt.compare`.
        3.  If validation fails, the controller returns `401 Unauthorized` with *"Incorrect email or password"*.

---

### Phase 4: Token Generation & Secure Cookie Injection
*   **Source File:** [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js)
*   **Workflow:**
    1.  Upon successful authentication, the server signs a JSON Web Token (JWT) containing the user's database ID as a claim, signed with `process.env.JWT_SECRET`:
        ```javascript
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '90d' });
        ```
    2.  **HttpOnly Cookie Placement:** The token is not returned in the JSON response body. Instead, it is injected into the browser cookie jar using a secure cookie configuration:
        ```javascript
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'strict'
        });
        ```

---

### Phase 5: Session Hydration & Middleware Checks
*   **Source Files:** [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/middleware/authMiddleware.js) and [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  When React mounts or refreshes, `App.tsx` sends a `GET /api/auth/me` request to verify if a valid session exists.
    2.  **`protect` Middleware Validation:**
        *   Extracts the JWT from the cookie (or alternative `Authorization` header).
        *   Verifies the token's signature.
        *   Fetches the user document from the database (excluding the password hash).
    3.  If the token is valid, it returns the user profile details. If invalid or missing, it returns a 401 response, forcing the React app to display the login screen.

---

### Phase 6: Frontend State Synchronization
*   **Source Files:** [App.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/App.tsx)
*   **Workflow:**
    1.  React resolves the `/api/auth/me` response.
    2.  On success, React updates `isAuthenticated` to `true` and saves the user's data (tasks, inventory, locations) directly into the global `profile` state.
    3.  The UI switches from the login screen to the main dashboard without causing a page reload.

---

### Core Interview Highlights (Ready to Discuss)
*   **XSS Protection:** Storing the JWT in an `HttpOnly` cookie ensures it is completely inaccessible to client-side JavaScript, protecting the user's session from Cross-Site Scripting (XSS) token theft.
*   **CSRF Protection:** The `SameSite: strict` flag ensures the session cookie is only sent during requests originating from the app's own domain, blocking Cross-Site Request Forgery (CSRF).
*   **Defensive Schema Design:** The Mongoose schema uses `select: false` on the password field, ensuring password hashes are never leaked in database queries unless explicitly requested.

------------------------------------------

### 7. Disease Detection AI (Currently Switched Off in UI)

> [!NOTE]
> **Status:** Switched off in the sidebar navigation array in [Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) to focus exclusively on the core ML advisory pipeline. The backend and page logic remain intact.

- **Purpose:** Identifies crop diseases from uploaded photos with severity classification and treatment advice
- **User Workflow:** Upload crop photo → click "Identify Disease" → view diagnosis with treatment steps
- **Entry Point:** [DiseaseDetection.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/DiseaseDetection.tsx)
- **APIs Involved:** Google Gemini API (configured but currently uses mock results)
- **Database Tables:** Results stored in `users.diseaseHistory` via profile update
- **Dependencies:** `@google/genai` package, `GEMINI_API_KEY`
- **Known Limitations:** **Currently uses mock/simulated results** (not actually calling Gemini for image analysis). Returns random selection from 2 hardcoded disease objects. Requires valid Gemini API key for real functionality.

---

#### Phase 1: Frontend Input & Request Construction
1. The user navigates to the Disease Detection page and uploads an image file (e.g., leaf spot photo).
2. The UI holds the file in local React state and prompts the user to click "Identify Disease".

#### Phase 2: Mock Execution Path (Current Implementation)
1. Since the UI is configured for demo purposes, the API request does not query the real Google Gemini endpoint directly.
2. Clicking "Identify Disease" calls an asynchronous handler that uses `setTimeout` to simulate a 1.5-second model inference delay.
3. The handler randomly selects a pre-configured disease profile from a mock array:
   * **Rice Blast:** (Severity: High, Treatment: Apply tricyclazole or search for resistant varieties).
   * **Leaf Smut:** (Severity: Low, Treatment: Ensure balanced NPK fertilizer and clean seeds).

#### Phase 3: State Sync & Profile Persistence
1. The diagnosed disease is formatted as a history object: `{ diseaseName, date, severity, crop }`.
2. The UI dispatches a `PUT /api/auth/profile` request to update the user's document in MongoDB, appending this record to the `diseaseHistory` array.

#### Phase 4: Database Save & Rendering
1. MongoDB Atlas updates the user's `diseaseHistory` sub-document array.
2. The UI updates the history list, rendering the severity badge (Low/Medium/High) and treatment bullets.

#### Core Interview Highlights (Ready to Discuss)
* **Prototyping Isolation:** Using mock delays and data arrays allowed testing of layout structures and MongoDB profile synchronization paths without spending Gemini API credits.

---

### 8. AI Agri-Consultant (Chatbot) (Currently Switched Off in UI)

> [!NOTE]
> **Status:** Switched off in the sidebar navigation array in [Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) to focus exclusively on the core ML advisory pipeline. The backend and page logic remain intact.

- **Purpose:** Conversational AI assistant for agricultural questions
- **User Workflow:** Type/speak a question → receive AI-generated agricultural advice
- **Entry Point:** [AgriConsultant.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AgriConsultant.tsx)
- **APIs Involved:** Google Gemini API (`gemini-3-flash-preview` model)
- **Database Tables:** None (conversation not persisted)
- **Dependencies:** `@google/genai`, `GEMINI_API_KEY`
- **Known Limitations:** Requires valid Gemini API key. Voice input is simulated (hardcoded response after 3s timeout). Conversation history not saved to backend. No context about user's farm is passed to the AI.

---

#### Phase 1: Message Submission
1. The user types an agricultural query in the input box and clicks send.
2. The query is added to a `messages` array in local state, triggering a re-render to display the user's chat bubble.

#### Phase 2: Client-side API Call
1. The component initializes the Google GenAI SDK:
   ```typescript
   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
   ```
2. It requests a completion from the `gemini-3-flash-preview` model, sending the message array as conversational context.
3. **Simulation Fallback:** If the API key is not configured, the chatbot falls back to a simulated response helper that returns pre-formatted advisor responses after a short timeout.

#### Phase 3: Response Rendering
1. The response is added to the local messages array, updating the UI. No backend database persistence is executed.

#### Core Interview Highlights (Ready to Discuss)
* **Client-Side vs Server-Side Trade-offs:** Accessing Gemini directly from React simplifies backend logic but exposes the `GEMINI_API_KEY` in the browser code. For production, the calls should be proxied through Express to protect credentials.

---

### 9. Agricultural Calendar

- **Purpose:** Task scheduling and management for farm activities
- **User Workflow:** View calendar → add tasks with priority/category → toggle completion → delete tasks
- **Entry Point:** [AgriCalendar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AgriCalendar.tsx)
- **APIs Involved:** `PUT /api/auth/profile` (tasks saved to user profile)
- **Database Tables:** `users.tasks` array
- **Dependencies:** None (frontend-only logic with backend persistence)
- **Known Limitations:** Tasks stored as subdocument array in User model (no dedicated collection). No calendar UI with date grid — appears to be a task list view.

---

#### Phase 1: Task Construction
1. The user fills out the task form on the UI, specifying a Title, Date (YYYY-MM-DD), Category (Irrigation, Fertilizer, Weeding, Harvesting, Disease Control, General), and Priority (low, medium, high).
2. The task is appended to a local state array.

#### Phase 2: Sync to Backend
1. React dispatches a `PUT /api/auth/profile` request containing the updated `tasks` array.
2. The Express `protect` middleware verifies the session token and routes the request to the profile update handler.

#### Phase 3: Database Save & UI Rerender
1. The Mongoose model saves the updated tasks list to the database user document.
2. The frontend updates the list layout, grouping tasks by category and highlighting completed items.

#### Core Interview Highlights (Ready to Discuss)
* **Embedded Sub-documents:** Tasks are stored as nested objects within the User model rather than in a separate collection. This keeps database reads fast since the calendar is always loaded as part of the user's profile.

---

### 10. Inventory Manager

- **Purpose:** CRUD operations for farm inputs (Seeds, Fertilizers, Pesticides, Tools) with threshold alerts
- **User Workflow:** View inventory → add/edit/delete items → see low-stock warnings when quantity < minThreshold
- **Entry Point:** [InventoryManager.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/InventoryManager.tsx)
- **APIs Involved:** `PUT /api/auth/profile` (inventory saved to user profile)
- **Database Tables:** `users.inventory` array
- **Dependencies:** None
- **Known Limitations:** No barcode/QR scanning. No purchase history. Items stored in User document subdocuments (scalability concern at high item counts).

---

#### Phase 1: Inventory Update
1. The user clicks "Add Item" or edits an existing item (defining name, category, quantity, unit, and minThreshold).
2. React updates the local state array.

#### Phase 2: API Request & Validation
1. The UI dispatches a `PUT /api/auth/profile` request with the updated `inventory` list.
2. Express validates the user session and updates the Mongoose `User` document.

#### Phase 3: Threshold Alerts
1. The React app checks item quantities against their `minThreshold` values.
2. If `quantity < minThreshold`, the UI displays a warning badge and triggers a local browser push notification alert.

#### Core Interview Highlights (Ready to Discuss)
* **Client-Side Alerting:** Evaluating threshold limits in React keeps the backend stateless, reducing database queries.

---

### 11. Machinery Marketplace (Currently Switched Off in UI)

> [!NOTE]
> **Status:** Switched off in the sidebar navigation array in [Sidebar.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/layouts/Sidebar.tsx) to align UI focus. Code remains intact in the codebase.

- **Purpose:** Peer-to-peer farm equipment listing and rental
- **User Workflow:** Browse available machinery → rent items → list own machinery for rental
- **Entry Point (Frontend):** [MachineryMarketplace.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/MachineryMarketplace.tsx)
- **Entry Point (Backend):** [machineryRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/machineryRoutes.js) → [machineryController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/machineryController.js)
- **APIs Involved:** `GET /api/machinery`, `POST /api/machinery`, `POST /api/machinery/:id/rent`
- **Database Tables:** `machineries` collection
- **Dependencies:** None
- **Known Limitations:** Renting marks item as unavailable but has no un-rent/return mechanism. No payment integration. No rental duration tracking. Images use picsum.photos placeholders.

---

#### Phase 1: Loading Listings
1. Upon navigation, the page mounts and requests `GET /api/machinery`.
2. Express fetches all documents from the `machineries` collection, sorted by date, and returns them to the client.

#### Phase 2: Creating a Listing
1. A farmer lists an item by submitting a form with name, price per day, location, and an image URL.
2. The frontend sends a `POST /api/machinery` request.
3. Express validates the session and creates a document in MongoDB:
   ```javascript
   const newMachinery = await Machinery.create({ ...req.body, createdBy: req.user._id });
   ```

#### Phase 3: Renting Equipment
1. Clicking "Rent" triggers a `POST /api/machinery/:id/rent` request.
2. Express verifies session, locates the document, and checks availability.
3. It updates the listing status to `available: false` and returns the rented item.

#### Core Interview Highlights (Ready to Discuss)
* **Relational References:** Uses Mongoose references (`createdBy` pointing to `User`) to track ownership, showing the basics of P2P resource management.

---

### 12. Community Feed

- **Purpose:** Farmer-to-farmer social post board with likes
- **User Workflow:** View posts → create new post → like/unlike posts
- **Entry Point (Frontend):** [CommunityFeed.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/CommunityFeed.tsx)
- **Entry Point (Backend):** [postRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/postRoutes.js) → [postController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/postController.js)
- **APIs Involved:** `GET /api/posts`, `POST /api/posts`, `POST /api/posts/:id/like`
- **Database Tables:** `posts` collection (linked to `users` and optionally `recommendations`)
- **Dependencies:** None
- **Known Limitations:** No comments. No image attachments. No post editing or deletion. 500-char limit in model but 2000 in Zod validator (inconsistency).

---

#### Phase 1: Loading Posts
1. The page mounts and requests `GET /api/posts`.
2. Express queries the database:
   ```javascript
   const posts = await Post.find().populate('user', 'fullName').populate('recommendation');
   ```
3. This retrieves the post contents, user details, and any linked crop recommendations.

#### Phase 2: Creating a Post
1. The user types a message (and can link a crop recommendation record).
2. The frontend sends a `POST /api/posts` request.
3. Express validates inputs with Zod (`createPostSchema`) and saves the document in MongoDB.

#### Phase 3: Liking a Post
1. Clicking the "Like" button sends a `POST /api/posts/:id/like` request.
2. Express checks if the user's ID is in the post's `likes` array:
   * If present: removes the ID (unlikes).
   * If missing: pushes the ID (likes).
3. The updated array is saved to the database.

#### Core Interview Highlights (Ready to Discuss)
* **Schema Validation Discrepancy:** The Mongoose schema limits post content to 500 characters, while the Zod validator allows up to 2000. In an interview, you can mention this as a known technical debt item that you resolved by aligning the limits.

---

### 13. Financial Ledger

- **Purpose:** Expense tracking, income projection, and net profit calculation
- **User Workflow:** Add expenses by category → view summaries → calculate net profit from projected revenue
- **Entry Point:** [FinancialLedger.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/FinancialLedger.tsx)
- **APIs Involved:** None (client-side only)
- **Database Tables:** None
- **Dependencies:** None
- **Known Limitations:** **Entirely client-side** — financial data is not persisted to the backend. Data lost on page reload. No income tracking beyond projected revenue.

---

#### Phase 1: Client Ledger Modification
1. The user logs farm expenses (category, description, amount, date) on the UI.
2. React appends the expense object to a local state array.

#### Phase 2: Revenue Integration
1. The component reads the projected revenue (`estimatedRevenue`) from the active recommendation state.

#### Phase 3: Profit Calculation
1. The ledger calculates total expenses, matches them against projected revenues, and displays the estimated net profit in the UI.

#### Core Interview Highlights (Ready to Discuss)
* **Stateless Client Ledger:** Financial data is kept entirely in client state for the MVP. In a production version, this would be updated to sync with MongoDB or local device storage (IndexedDB) to support offline access.

---

### 14. Analytics Dashboard

- **Purpose:** Historical yield visualization, soil health trends, financial breakdowns
- **User Workflow:** Navigate to Analytics tab → view charts → export to PDF
- **Entry Point:** [AnalyticsDashboard.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/AnalyticsDashboard.tsx)
- **APIs Involved:** Uses data from `/api/history` (hydrated into profile state)
- **Database Tables:** Reads from `recommendations` (historical data)
- **Dependencies:** Recharts, html2canvas, jsPDF
- **Known Limitations:** Only uses last 5 recommendation records for yield history. Soil health data is hardcoded demo data. PDF export captures the DOM screenshot (not structured data).

---

#### Phase 1: Analytics Hydration
1. The dashboard reads historical recommendation records from React state.
2. Recharts processes the records to build yield trend lines, NPK soil charts, and expense charts.

#### Phase 2: PDF Generation
1. Clicking "Export Report" triggers a canvas capture:
   ```javascript
   const canvas = await html2canvas(document.getElementById('report-target'));
   ```
2. The canvas image is compiled into a PDF document using `jsPDF` and downloaded in the browser.

#### Core Interview Highlights (Ready to Discuss)
* **Client-Side PDF Generation:** Generating PDFs in the browser avoids the server-side CPU overhead of running browser rendering tools like Puppeteer.

---

### 15. Weather Integration

- **Purpose:** Real-time weather data for the user's location
- **User Workflow:** WeatherWidget auto-fetches on mount (hardcoded to Ludhiana, Punjab coordinates)
- **Entry Point (Frontend):** [WeatherWidget.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/components/WeatherWidget.tsx)
- **Entry Point (Backend):** [weatherRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/routes/weatherRoutes.js) → [weatherController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/weatherController.js)
- **APIs Involved:** `GET /api/weather?lat=&lon=`, OpenWeatherMap API
- **Database Tables:** None
- **Dependencies:** OpenWeatherMap API key (`WEATHER_API_KEY`)
- **Known Limitations:** Coordinates hardcoded to Ludhiana (30.9000, 75.8500) in the WeatherWidget. Falls back to simulated data if API key is placeholder. 4-day forecast is hardcoded (not fetched from API). Wind speed and UV index are hardcoded.

---

#### Phase 1: Request Weather
1. The dashboard requests `/api/weather?lat=30.9000&lon=75.8500` (defaults to Ludhiana, Punjab coordinates).

#### Phase 2: API Query & Fallback
1. If the OpenWeatherMap API key is set, the backend requests: `https://api.openweathermap.org/data/2.5/weather?lat=[lat]&lon=[lon]&appid=[key]&units=metric`.
2. **Simulation Fallback:** If the key is missing or the external request fails, the controller returns a simulated weather payload with realistic local values.

#### Phase 3: UI Render
1. The frontend displays the current temperature, humidity, rainfall estimates, and a mock 4-day forecast.

#### Core Interview Highlights (Ready to Discuss)
* **Resilient Fallback:** The weather controller uses a fallback mode when API keys are missing, preventing external connection issues from breaking the UI.

---

### 16. Multilingual Support (i18n)

- **Purpose:** English and Hindi language support
- **User Workflow:** Change language in user profile preferences → UI labels update
- **Entry Point:** [i18n.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/i18n.ts)
- **Related Files:** Sidebar.tsx uses `t()` for nav labels
- **Dependencies:** i18next, react-i18next
- **Known Limitations:** Only sidebar navigation labels are translated. Page content, form labels, and button text are not translated. Only 2 languages supported.

---

#### Phase 1: Language Toggle
1. The user toggles the language preference in their profile settings.
2. The UI sends a `PUT /api/auth/profile` request to update `preferences.language` in MongoDB.

#### Phase 2: Client Translation
1. `i18n.changeLanguage(lang)` updates the translation context.
2. React components render localized text strings using translation keys:
   ```typescript
   {t('dashboard.soil_metrics')}
   ```

#### Core Interview Highlights (Ready to Discuss)
* **State Persistence:** Saving language choices directly in the user profile ensures the user's preferred language loads automatically across different devices, avoiding local storage dependencies.

---

### 17. Notification System

- **Purpose:** In-app notifications with browser push notification support
- **User Workflow:** View notification bell → manage notifications (mark read, delete, clear all)
- **Entry Point:** [NotificationCenter.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/NotificationCenter.tsx), [notifications.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/lib/notifications.ts)
- **Database Tables:** None (client-side state only)
- **Dependencies:** Web Notifications API
- **Known Limitations:** Notifications are hardcoded in App.tsx state (3 initial demo notifications). No backend notification system. Push notifications are implemented but never triggered. Lost on page reload.

---

#### Phase 1: Permission Request
1. On app load, `App.tsx` requests push notification permissions using the browser's native API.

#### Phase 2: Triggering Alerts
1. When inventory levels fall below threshold values or calendar tasks are due, the client triggers a notification:
   ```typescript
   new Notification("Low Inventory Alert", { body: "Urea Fertilizer is running low!" });
   ```

#### Core Interview Highlights (Ready to Discuss)
* **Stateless Client Alerts:** Generating notifications client-side using Web API hooks avoids the complexity of running a push server on the backend.

---

### 18. User Profile Management

- **Purpose:** View and edit farm profile, preferences, and settings
- **User Workflow:** Navigate to Profile tab → edit fields → changes synced to MongoDB
- **Entry Point:** [UserProfile.tsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/src/pages/UserProfile.tsx)
- **APIs Involved:** `GET /api/auth/me`, `PUT /api/auth/profile`
- **Database Tables:** `users` collection
- **Dependencies:** None
- **Known Limitations:** No profile photo upload. No email change capability. No password change UI.

---

#### Phase 1: Edit Profile
1. The user modifies form inputs on the Profile page (e.g., Farm Name, Primary Crop, Size) and clicks "Save Changes".

#### Phase 2: Synchronization
1. The client sends a `PUT /api/auth/profile` request.
2. The backend validates the payload, updates the user's document in MongoDB, and returns the updated user record.
3. React updates the global profile state, updating the UI.

#### Core Interview Highlights (Ready to Discuss)
* **Single Route Updates:** The `/api/auth/profile` endpoint handles updates for profile details, preferences, tasks, and inventory, keeping the profile update API simple and consistent.

---

### 19. Database Seeding

- **Purpose:** Seeds a high-fidelity demo environment with users, machinery, recommendations, and posts
- **User Workflow:** Run `node backend/src/scripts/runSeed.js` → database populated with demo data
- **Entry Point:** [runSeed.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/scripts/runSeed.js) → [dbSeeder.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/utils/dbSeeder.js)
- **Database Tables:** All collections populated
- **Dependencies:** mongoose, bcryptjs, dotenv
- **Known Limitations:** Cleans up demo users on re-run (by email filter). Machinery seeded only if collection is empty.

---

#### Phase 1: Invocation
1. The developer executes `node backend/src/scripts/runSeed.js` from the command line.
2. The script loads environment variables and connects to MongoDB.

#### Phase 2: Seeding Process
1. Clears existing collections (`users`, `recommendations`, `machineries`, `posts`).
2. Creates the demo user document, invoking the pre-save hook to hash the password before saving.
3. Seeds historical recommendations, machinery listings, and community posts.

#### Core Interview Highlights (Ready to Discuss)
* **Pre-save Hook Execution:** The seeder passes raw password strings to Mongoose, allowing the pre-save hooks to hash them naturally and preventing double-hashing login lockout issues.
