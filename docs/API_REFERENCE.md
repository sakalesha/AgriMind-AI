# AgriMindAI — API Reference

## Base URLs

| Service | URL | Description |
|---|---|---|
| Backend API | `http://localhost:5000/api` | Express Node.js server |
| ML Service | `http://localhost:5001/api` | Flask Python ML service (internal only) |

## Authentication

All protected endpoints require a JWT token sent as:
- **Cookie:** `jwt=<token>` (primary method, set automatically by login/register)
- **Header:** `Authorization: Bearer <token>` (alternative)

---

## Backend API Endpoints

### Health & Diagnostics

---

#### `GET /api/health`

**Description:** Health check endpoint for monitoring and startup verification.

**Authentication:** None required

**Response:**
```json
{
  "status": "ok",
  "message": "Render Unified Server is running",
  "uptime": 123.456,
  "timestamp": "2026-06-01T12:00:00.000Z"
}
```

**Source:** [app.js#L77-L84](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/app.js#L77-L84)

---

#### `GET /api/diag`

**Description:** Diagnostic endpoint that lists files in the `dist/` directory.

**Authentication:** None required

**Response:**
```json
{
  "status": "ok",
  "distPath": "/app/backend/dist",
  "files": ["index.html", "assets/"]
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "message": "ENOENT: no such file or directory",
  "distPath": "/app/backend/dist"
}
```

**Source:** [app.js#L87-L100](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/app.js#L87-L100)

---

### Authentication (`/api/auth`)

---

#### `POST /api/auth/register`

**Description:** Create a new user account.

**Authentication:** None required

**Validation (Zod):**
```json
{
  "fullName": "string (min 2, max 50)",
  "email": "string (valid email)",
  "password": "string (min 8)"
}
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
Sets `jwt` cookie (HttpOnly, SameSite=strict, 90-day expiry)
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "665...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+91 98765 43210",
      "farmName": "Green Valley Farms",
      "farmLocation": "Punjab, India",
      "farmSize": 15.5,
      "primaryCrop": "Rice",
      "preferences": { "notifications": true, "theme": "dark", "currency": "INR", "language": "en" },
      "inventory": [...],
      "tasks": [...],
      "createdAt": "2026-06-01T12:00:00.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "E11000 duplicate key error collection: ... email_1 dup key"
}
```

**Source:** [authController.js#L33-L43](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js#L33-L43)

---

#### `POST /api/auth/login`

**Description:** Authenticate an existing user.

**Authentication:** None required

**Validation (Zod):**
```json
{
  "email": "string (valid email)",
  "password": "string (min 1)"
}
```

**Request Body:**
```json
{
  "email": "demo@agrimind.ai",
  "password": "password123"
}
```

**Success Response (200):** Same as register (sets jwt cookie)

**Error Response (401):**
```json
{
  "status": "fail",
  "message": "Incorrect email or password"
}
```

**Source:** [authController.js#L46-L68](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js#L46-L68)

---

#### `GET /api/auth/logout`

**Description:** Clear the JWT cookie (sets to expired 'loggedout' value).

**Authentication:** None required

**Response (200):**
```json
{
  "status": "success"
}
```

**Source:** [authController.js#L70-L76](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js#L70-L76)

---

#### `GET /api/auth/me`

**Description:** Get the currently authenticated user's profile.

**Authentication:** Required (JWT)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": { /* full user object without password */ }
  }
}
```

**Error Response (401):**
```json
{
  "status": "fail",
  "message": "You are not logged in! Please log in to get access."
}
```

**Source:** [authController.js#L78-L85](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js#L78-L85)

---

#### `PUT /api/auth/profile`

**Description:** Update the authenticated user's profile fields.

**Authentication:** Required (JWT)

**Allowed Fields:** `fullName`, `phone`, `farmName`, `farmLocation`, `farmSize`, `primaryCrop`, `preferences`, `inventory`, `tasks`, `diseaseHistory`

**Request Body (partial update):**
```json
{
  "farmName": "Updated Farm Name",
  "farmSize": 20.5,
  "preferences": {
    "theme": "light",
    "language": "hi"
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

**Source:** [authController.js#L87-L117](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/authController.js#L87-L117)

---

### Recommendation (`/api/recommend`)

---

#### `POST /api/recommend`

**Description:** Get an AI-powered crop recommendation with yield estimation, market analysis, and fertilizer advice. This is the **core API** of the platform.

**Authentication:** Required (JWT)

**Rate Limit:** 10 requests per 60 seconds per IP

**Validation (Zod):**
```json
{
  "fieldName": "string (optional, defaults to 'Unnamed Field')",
  "N": "number (0–500, required)",
  "P": "number (0–500, required)",
  "K": "number (0–500, required)",
  "temperature": "number (-50–60, required)",
  "humidity": "number (0–100, required)",
  "ph": "number (0–14, required)",
  "rainfall": "number (0–500, required)"
}
```

**Request Body:**
```json
{
  "fieldName": "Main Paddy Field",
  "N": 52,
  "P": 38,
  "K": 32,
  "temperature": 29.8,
  "humidity": 82,
  "ph": 6.7,
  "rainfall": 240
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "crop": "rice",
  "irrigation": "Low",
  "yield": "5.20",
  "yieldInterval": [4.9, 5.5],
  "market": {
    "pricePerTon": 37575,
    "predictedPrice": 38000,
    "estimatedRevenue": 197600,
    "trend": "Up"
  },
  "fertilizer": {
    "N": "Optimal",
    "P": "Optimal",
    "K": "Optimal",
    "summary": ["Soil nutrient levels are optimal for rice."]
  },
  "recordId": "665abc..."
}
```

**Error Responses:**
- `400` — Validation error
- `401` — Not authenticated
- `429` — Rate limit exceeded
- `503` — ML service unavailable
```json
{
  "status": "fail",
  "message": "Prediction service temporarily unavailable. Please try again later.",
  "code": "ML_SERVICE_UNAVAILABLE"
}
```

**Source:** [recommendController.js#L54-L185](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/recommendController.js#L54-L185)

---

### Weather (`/api/weather`)

---

#### `GET /api/weather`

**Description:** Fetch current weather data for a given location.

**Authentication:** Required (JWT)

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `lat` | string (float) | Yes | Latitude (-90 to 90) |
| `lon` | string (float) | Yes | Longitude (-180 to 180) |

**Example:** `GET /api/weather?lat=30.9000&lon=75.8500`

**Success Response (200) — Live Mode:**
```json
{
  "status": "success",
  "mode": "live",
  "data": {
    "temp": 32.5,
    "humidity": 45,
    "rainfall": 0
  }
}
```

**Success Response (200) — Simulation Mode** (if API key is placeholder):
```json
{
  "status": "success",
  "mode": "simulation",
  "data": {
    "temp": 28.3,
    "humidity": 71.4,
    "rainfall": 152.7
  }
}
```

**Source:** [weatherController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/weatherController.js)

---

### Market (`/api/market`)

---

#### `GET /api/market/prices/all`

**Description:** Get live commodity prices for all 22 supported crops.

**Authentication:** None required (bypasses DB middleware)

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "crop": "rice",
      "inr_per_quintal": 2350,
      "inr_per_ton": 23500,
      "current_price": 281.44,
      "trend": "Up",
      "best_mandi": {
        "state": "Punjab",
        "district": "Amritsar",
        "market": "Amritsar(Amritsar Mandi)",
        "price": 2800
      },
      "regional_data": [
        { "state": "Punjab", "avg": 2500 },
        { "state": "Haryana", "avg": 2300 }
      ],
      "usd_to_inr": 83.5
    }
  ],
  "meta": {
    "usd_to_inr": 83.5,
    "currency": "INR",
    "unit": "per quintal (100kg)"
  }
}
```

**Source:** [marketController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/marketController.js)

---

### History (`/api/history`)

---

#### `GET /api/history`

**Description:** Get the authenticated user's recommendation history (last 30 records).

**Authentication:** Required (JWT)

**Response (200):** Array of Recommendation documents sorted by `createdAt` descending.

**Source:** [historyController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/historyController.js)

---

### Posts (`/api/posts`)

---

#### `GET /api/posts`

**Description:** Get all community posts with user and recommendation details.

**Authentication:** Required (JWT)

**Response (200):**
```json
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "665...",
      "user": { "_id": "...", "fullName": "Demo User" },
      "content": "Post content...",
      "recommendation": { "prediction": {...}, "fieldName": "..." },
      "likes": ["userId1"],
      "createdAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

**Source:** [postController.js#L21-L39](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/postController.js#L21-L39)

---

#### `POST /api/posts`

**Description:** Create a new community post.

**Authentication:** Required (JWT)

**Validation (Zod):**
```json
{
  "content": "string (1–2000 chars, required)",
  "recommendation": "string (optional, valid ObjectId)"
}
```

**Source:** [postController.js#L3-L19](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/postController.js#L3-L19)

---

#### `POST /api/posts/:id/like`

**Description:** Toggle like/unlike on a post.

**Authentication:** Required (JWT)

**Params Validation (Zod):** `id` must be a valid 24-char hex ObjectId

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "likes": ["userId1", "userId2"],
    "isLiked": true
  }
}
```

**Source:** [postController.js#L41-L67](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/postController.js#L41-L67)

---

### Machinery (`/api/machinery`)

---

#### `GET /api/machinery`

**Description:** List all machinery items.

**Authentication:** None required

**Response (200):**
```json
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "665...",
      "name": "John Deere 5310 GearPro",
      "owner": "Harpreet Singh",
      "pricePerDay": 2500,
      "location": "Amritsar, Punjab",
      "available": true,
      "image": "https://picsum.photos/seed/tractor1/800/600"
    }
  ]
}
```

**Source:** [machineryController.js#L3-L14](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/machineryController.js#L3-L14)

---

#### `POST /api/machinery`

**Description:** List a new machinery item for rental.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Mahindra 575 DI",
  "pricePerDay": 2000,
  "location": "Ludhiana, Punjab",
  "image": "https://example.com/tractor.jpg"
}
```

**Source:** [machineryController.js#L16-L35](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/machineryController.js#L16-L35)

---

#### `POST /api/machinery/:id/rent`

**Description:** Mark a machinery item as rented (unavailable).

**Authentication:** Required (JWT)

**Error Responses:**
- `404` — Machinery not found
- `400` — Already rented

**Source:** [machineryController.js#L37-L58](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/controllers/machineryController.js#L37-L58)

---

## ML Service API Endpoints (Internal)

> [!NOTE]
> These endpoints are served by the Flask ML service on port 5001 and are **not exposed externally**. They are called by the Express backend via axios + opossum circuit breaker.

---

#### `GET /api/health`

**Description:** ML service health check.
**Response:** `{"status": "ok"}`

---

#### `POST /api/predict`

**Description:** Predict the optimal crop and irrigation level.

**Request Body:**
```json
{
  "N": 52, "P": 38, "K": 32,
  "temperature": 29.8, "humidity": 82,
  "ph": 6.7, "rainfall": 240
}
```

**Response:**
```json
{
  "status": "success",
  "crop": "rice",
  "irrigation": "Low"
}
```

**Source:** [ml_api.py#L63-L88](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L63-L88)

---

#### `POST /api/predict_yield`

**Description:** Predict crop yield with confidence intervals.

**Request Body:**
```json
{
  "crop": "Rice",
  "N": 90, "P": 40, "K": 40,
  "temperature": 28, "humidity": 80,
  "ph": 6.5, "rainfall": 100
}
```

**Response:**
```json
{
  "status": "success",
  "yield": 4.15,
  "interval": [3.82, 4.48]
}
```

**Source:** [ml_api.py#L90-L124](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L90-L124)

---

#### `POST /api/predict_price_trend`

**Description:** Predict next-period price trend for a crop.

**Request Body:**
```json
{
  "crop": "rice"
}
```

**Response:**
```json
{
  "status": "success",
  "current_price": 23000.00,
  "predicted_price": 23460.00,
  "trend": "Up"
}
```

**Source:** [ml_api.py#L189-L240](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L189-L240)

---

#### `GET /api/prices/all`

**Description:** Get current prices and predictions for all 22 crops.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "crop": "rice",
      "current_price": 23000.00,
      "predicted_price": 23460.00,
      "trend": "Up",
      "best_mandi": {
        "state": "Punjab",
        "district": "Amritsar",
        "market": "Amritsar",
        "price": 25000.00
      }
    }
  ]
}
```

**Source:** [ml_api.py#L128-L187](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L128-L187)
