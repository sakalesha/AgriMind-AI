# AgriMindAI — Deployment Guide

## Deployment Architecture

AgriMindAI deploys as a **single Docker container** running two processes:
1. **Flask ML Service** (Python, port 5001 — internal only)
2. **Express Node.js Server** (port 5000 — exposed)

```mermaid
graph TD
    subgraph "Docker Container"
        SS["start.sh (Entrypoint)"]
        SS -->|"1. Launch background"| FLASK["Flask ML API<br/>(port 5001)"]
        SS -->|"2. Health poll loop"| HC["Health Check<br/>(POST /api/health)"]
        HC -->|"3. On success"| NODE["Node.js Express<br/>(port 5000)"]
    end
    
    EXT["External Port 5000"] --> NODE
    NODE -->|"localhost:5001"| FLASK
    NODE -->|"Serves dist/"| SPA["React SPA"]
```

---

## Environment Variables

### Backend (`.env` or container environment)

**Source:** [backend/.env](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/.env)

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/agrimind?retryWrites=true&w=majority` |
| `JWT_SECRET` | ✅ | Secret key for JWT signing | `your-super-secret-key-here` |
| `ML_SERVICE_URL` | ✅ | Flask ML service URL | `http://localhost:5001` |
| `PORT` | No | Express server port | `5000` (default) |
| `WEATHER_API_KEY` | No | OpenWeatherMap API key | `abc123...` |
| `DATA_GOV_API_KEY` | No | Data.gov.in Agmarknet API key | `xyz789...` |

### Frontend (`.env` or build-time)

| Variable | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | No | Google Gemini API key for disease detection & chatbot | `AIza...` |

### ML Service (environment or `.env` in ml/src/)

| Variable | Required | Description | Example |
|---|---|---|---|
| `ML_SERVICE_PORT` | No | Flask server port | `5001` (default) |
| `DATA_GOV_API_KEY` | No | Same key used by price scraper | `xyz789...` |

---

## Local Development Setup

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Backend + Frontend build |
| Python | 3.10+ | ML service |
| MongoDB | Atlas or local | Database |
| npm | 9+ | Package management |
| pip | 23+ | Python package management |

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/sakalesha/AI-Farmer-Advisory.git
cd AI-Farmer-Advisory

# 2. Install all Node.js dependencies (root + backend + frontend)
npm run install-all

# 3. Set up Python ML environment
cd ml
pip install -r requirements.txt
cd ..

# 4. Configure environment variables
# Copy and edit backend/.env with your MongoDB URI, JWT secret, and API keys
cp backend/.env.example backend/.env    # (if example exists, otherwise create manually)

# 5. Seed the database (optional — creates demo user and sample data)
cd backend/src/scripts
node runSeed.js
cd ../../..

# 6. Start the ML service
cd ml
python ml_api.py &
cd ..

# 7. Start the backend
cd backend
npm run dev &
cd ..

# 8. Start the frontend
cd frontend
npm run dev
```

### Alternative: Full-Stack Start

```bash
# From root directory — starts backend + frontend concurrently
npm run full-stack
```

> [!IMPORTANT]
> The ML service must be started separately when using `npm run full-stack`. The bash orchestration in `start.sh` is designed for Docker containers only.

### Available Scripts

**Root [package.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/package.json):**

| Script | Command | Description |
|---|---|---|
| `install-all` | Installs root, backend, and frontend deps | Run once after clone |
| `dev` | `cd backend && npm run dev` | Start backend only |
| `full-stack` | `concurrently` backend + frontend dev | Start both servers |

**Backend [package.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/package.json):**

| Script | Command | Description |
|---|---|---|
| `dev` | `node src/app.js` | Start Express server |

**Frontend [package.json](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/package.json):**

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start Vite dev server (port 3000) |
| `build` | `tsc -b && vite build` | Build production bundle → `dist/` |
| `preview` | `vite preview` | Preview production build locally |

### Development Ports

| Service | Port | URL |
|---|---|---|
| Frontend (Vite dev) | 3000 | `http://localhost:3000` |
| Backend (Express) | 5000 | `http://localhost:5000` |
| ML Service (Flask) | 5001 | `http://localhost:5001` |

### Vite Proxy Configuration

The Vite dev server proxies API requests to the Express backend:

**Source:** [vite.config.ts](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/frontend/vite.config.ts)

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

---

## Docker Deployment

### Dockerfile Overview

**Source:** [Dockerfile](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/Dockerfile)

The Dockerfile uses a **multi-stage build**:

```mermaid
graph LR
    subgraph "Stage 1: build"
        A["Node 20-slim"] --> B["Install frontend deps"]
        B --> C["vite build → dist/"]
    end
    
    subgraph "Stage 2: final"
        D["Node 20-slim + Python 3"] --> E["Copy backend/"]
        E --> F["Copy ml/"]
        F --> G["Copy dist/ from Stage 1"]
        G --> H["pip install in venv"]
        H --> I["start.sh entrypoint"]
    end
    
    C -->|"COPY --from=build"| G
```

### Build & Run

```bash
# Build the Docker image
docker build -t agrimind-ai .

# Run with environment variables
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret" \
  -e ML_SERVICE_URL="http://localhost:5001" \
  -e WEATHER_API_KEY="your-key" \
  -e DATA_GOV_API_KEY="your-key" \
  agrimind-ai
```

### Container Startup Sequence

**Source:** [start.sh](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/start.sh)

```
1. Start Python ML service in background:
   python3 ml/ml_api.py &

2. Health check polling loop:
   - POST http://localhost:5001/api/predict with test payload
   - Max 30 retries × 2 seconds = 60-second window
   - If ML responds, proceed to step 3
   - If all retries fail, log error and proceed anyway

3. Start Node.js Express server:
   node backend/src/app.js
```

---

## Database Seeding

### Purpose
Seeds a high-fidelity demo environment for product evaluation with:
- **Demo User:** `demo@agrimind.ai` / `password123`
- **Machinery Listings:** 3 pre-configured items (if collection empty)
- **Recommendation History:** Historical prediction records
- **Community Posts:** Sample farmer posts

### How to Run

```bash
cd backend/src/scripts
node runSeed.js
```

### What It Does

1. Connects to MongoDB using `MONGODB_URI` from `.env`
2. Deletes existing demo users (by email filter)
3. Creates demo user with raw password (Mongoose pre-save hook hashes it)
4. Seeds machinery collection (if empty)
5. Creates recommendation history records
6. Creates community posts

**Source:** [dbSeeder.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/utils/dbSeeder.js), [runSeed.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/backend/src/scripts/runSeed.js)

> [!CAUTION]
> The seeder **deletes existing demo users** before recreating them. Do not run in production without understanding the cleanup logic.

---

## Production Checklist

- [ ] Set strong, unique `JWT_SECRET` (not the default)
- [ ] Use MongoDB Atlas with authentication enabled
- [ ] Set `DATA_GOV_API_KEY` for live market prices
- [ ] Set `WEATHER_API_KEY` for live weather data
- [ ] Set `GEMINI_API_KEY` for disease detection and chatbot
- [ ] Review rate limiter settings for expected traffic
- [ ] Consider increasing `ML_SERVICE_URL` timeout for cold starts
- [ ] Enable HTTPS (currently HTTP-only)
- [ ] Add CORS whitelist (currently accepts all origins)
- [ ] Run database seeder once to create demo user
- [ ] Verify ML models are present in `ml/models/` directory
- [ ] Test Docker health endpoint: `GET /api/health`

---

## Cloud Platform Notes

### Render.com (Designed For)
The architecture references indicate Render as the target platform:
- Single web service type
- Port 5000 exposed
- Start command: `bash start.sh`
- Health check path: `/api/health`

### Railway / Fly.io / AWS ECS
The Dockerfile is compatible with any container platform. Key considerations:
- **Single port exposure:** Only port 5000 needs to be exposed
- **Memory:** Yield model (~60 MB) + LSTM model require adequate RAM (~512 MB minimum)
- **Startup time:** Flask model loading can take 10–30 seconds; configure health check grace period accordingly
- **Persistent storage:** Not required (all state in MongoDB Atlas)
