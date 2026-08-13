#!/bin/bash

set -e

ML_PORT=${ML_SERVICE_PORT:-5001}
NODE_PORT=${PORT:-5000}
MAX_RETRIES=30
RETRY_INTERVAL=2

# Start Python ML service in the background (gunicorn production server)
echo "🌱 Starting Python ML service on port ${ML_PORT}..."
gunicorn --bind 0.0.0.0:${ML_PORT} --chdir /app/ml --workers 1 --timeout 120 ml_api:app &
ML_PID=$!

# Wait for ML service to be healthy
echo "⏳ Waiting for ML service to be ready..."
retries=0
while true; do
    if curl -sf "http://localhost:${ML_PORT}/api/health" > /dev/null 2>&1; then
        echo "✅ ML service is healthy on port ${ML_PORT}"
        break
    fi

    retries=$((retries + 1))
    if [ $retries -ge $MAX_RETRIES ]; then
        echo "❌ ML service failed to start after ${MAX_RETRIES} retries. Exiting."
        kill $ML_PID 2>/dev/null || true
        exit 1
    fi

    echo "   Attempt ${retries}/${MAX_RETRIES} — ML not ready yet, waiting ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

# Start Node.js API server
echo "🚀 Starting Node.js Unified Server on port ${NODE_PORT}..."
node backend/src/app.js