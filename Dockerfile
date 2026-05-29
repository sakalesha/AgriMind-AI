# Build Stage for Frontend
FROM node:20-slim AS build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# Final Stage: Unified Node + Python Environment
FROM node:20-slim
WORKDIR /app

# Install Python, curl, and essential build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Root dependencies and install Node.js modules
COPY package*.json ./
RUN npm install

# Copy backend dependencies and install
COPY backend/package*.json ./backend/
RUN npm install --prefix backend

# Copy Python requirements and install in a venv
COPY ml/requirements.txt ./ml/requirements.txt
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r ml/requirements.txt

# Copy built frontend from Stage 1
COPY --from=build /app/frontend/dist ./backend/dist

# Copy Backend and ML directories
COPY backend/ ./backend/
COPY ml/ ./ml/

# Copy entrypoint script
COPY start.sh ./
RUN chmod +x start.sh

# Expose Node.js port
EXPOSE 5000

# Start services
CMD ["./start.sh"]
