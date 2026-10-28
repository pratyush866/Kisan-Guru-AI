# ==========================================
# STAGE 1: Build & Compile Python Packages
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /build

# Install compilation system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY requirements.txt .

# Compile wheels to local cache directory
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt

# ==========================================
# STAGE 2: Lightweight Production Execution
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install runtime library dependencies (Postgres client, OpenCV headless requirements)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels from builder and install
COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Create secure system non-root execution user
RUN groupadd -r appgroup && useradd -r -g appgroup -s /sbin/nologin -c "Application User" appuser

# Copy application codes
COPY --chown=appuser:appgroup app /app/app

# Set ownership and read/write rules
RUN mkdir -p /app/data && chown -r appuser:appgroup /app/data

# Switch security context
USER appuser

# Configure runtime execution metrics
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

# Run with Uvicorn server launcher
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
