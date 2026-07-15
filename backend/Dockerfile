FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for PostgreSQL + ML
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-train ML models (if not already present)
RUN python -m ml.train_model 2>/dev/null || echo "ML models already exist, skipping training"

EXPOSE 8000

# Use $PORT for Render compatibility, fallback to 8000 for local
CMD uvicorn main:socket_app --host 0.0.0.0 --port ${PORT:-8000}
