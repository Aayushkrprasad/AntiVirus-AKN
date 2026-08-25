# ────────────────────────────────────────────────────────────────────────────────
# Stage 1: Build — install Python deps with build tools available
# ────────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

# System build dependencies (required for yara-python, androguard, pefile, magic)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libmagic1 \
    libmagic-dev \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --prefix=/install --no-cache-dir -r requirements.txt

# ────────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — lean image
# ────────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL maintainer="AntiVirus-AKN Backend <dev@antivirus-akn.io>"
LABEL description="FastAPI Antivirus & Threat Detection Engine"

# Runtime system libraries only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Create non-root user for security
RUN groupadd -r avscanner && useradd -r -g avscanner avscanner

WORKDIR /app

# Copy application source
COPY app/ ./app/

# YARA rules directory (compiled at runtime — do NOT pre-compile in Docker layer)
COPY app/rules/ ./app/rules/

# Ensure rules dir is readable by scanner user
RUN chown -R avscanner:avscanner /app

USER avscanner

EXPOSE 8000

# Health check — calls our /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Uvicorn with multiple workers (adjust --workers based on CPU cores)
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--log-level", "info", \
     "--access-log"]
