# AntiVirus-AKN Backend

> High-performance FastAPI antivirus & threat detection engine powering the **AntiVirus-AKN** React Native mobile application.

---

## Features

| Capability | Implementation |
|---|---|
| Hash Reputation Lookup | Redis cache → PostgreSQL fallback |
| YARA Static File Analysis | Compiled rules: trojans, ransomware, webshells |
| Shannon Entropy Detection | Detects packed/encrypted payloads (> 7.2 bits/byte) |
| APK Permission Inspection | androguard + 7 dangerous combo rules |
| Async Deep Scan | Celery task queue with Redis broker |
| Virus Definition Versioning | DB-backed with live rule checksum |
| Structured Logging | structlog JSON output |
| Docker Ready | Multi-stage build, non-root user, health check |

---

## Quick Start

### 1. Clone & configure
```bash
cd antivirus-backend
cp .env.example .env
# Edit .env with your secrets
```

### 2. Run with Docker Compose (recommended)
```bash
docker-compose up --build
```

Services:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Flower** (Celery monitor): http://localhost:5555

### 3. Run locally (development)
```bash
pip install -r requirements.txt

# Start Redis and PostgreSQL (Docker)
docker-compose up redis postgres -d

# Run API
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run Celery worker (separate terminal)
celery -A app.worker.celery_app.celery worker --loglevel=info -Q deep_scan,default
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

### `POST /scan/hash`
Batch hash reputation lookup.
```json
// Request
{ "hashes": ["sha256hex1", "md5hex2"] }

// Response
{
  "queried_count": 2,
  "malicious_count": 1,
  "results": [{ "hash": "...", "is_malicious": true, "severity": "danger", ... }],
  "duration_seconds": 0.003
}
```

### `POST /scan/file`
Static file analysis (multipart upload).
```
curl -X POST http://localhost:8000/api/v1/scan/file \
  -F "file=@suspicious.exe" \
  -F "scan_type=deep"
```

**scan_type values:** `quick` (hash only) | `files` (YARA) | `deep` (all + entropy)

### `POST /scan/apk`
Android APK permission analysis.
```
curl -X POST http://localhost:8000/api/v1/scan/apk \
  -F "file=@app.apk"
```

### `POST /scan/deep`
Enqueue async deep scan via Celery. Returns `task_id` for polling.

### `GET /scan/status/{task_id}`
Poll Celery deep scan result.

### `GET /definitions/latest`
Current virus definition version and checksums.

### `GET /stats/summary`
Global scan statistics.

### `GET /health`
Service liveness + dependency health check.

---

## Running Tests
```bash
pip install -r requirements.txt
pytest tests/ -v --asyncio-mode=auto --cov=app --cov-report=term-missing
```

---

## Project Structure
```
antivirus-backend/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/
│   │   │   ├── scan.py          ← Core scan endpoints
│   │   │   ├── definitions.py   ← Definition versioning
│   │   │   └── stats.py         ← Aggregate statistics
│   │   └── api_router.py
│   ├── core/
│   │   ├── config.py            ← Pydantic Settings
│   │   └── security.py          ← API key middleware
│   ├── db/
│   │   ├── session.py           ← Async SQLAlchemy
│   │   └── redis_client.py      ← Async Redis pool
│   ├── engine/
│   │   ├── yara_engine.py       ← YARA compiler & scanner
│   │   ├── hash_matcher.py      ← Redis+PG hash lookup
│   │   ├── apk_inspector.py     ← Androguard APK analysis
│   │   └── entropy.py           ← Shannon entropy
│   ├── models/
│   │   ├── schemas.py           ← Pydantic v2 models
│   │   └── db_models.py         ← SQLAlchemy ORM
│   ├── rules/
│   │   ├── trojans.yar
│   │   ├── ransomware.yar
│   │   └── webshells.yar
│   ├── worker/
│   │   ├── celery_app.py        ← Celery configuration
│   │   └── tasks.py             ← Async task definitions
│   └── main.py                  ← FastAPI application
├── tests/
│   ├── conftest.py
│   ├── test_hash_scan.py
│   ├── test_file_scan.py
│   └── test_apk_scan.py
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── requirements.txt
```

---

## Schema Alignment

| Backend Field | React Native Client | Type |
|---|---|---|
| `scan_id` | `ScanResultSummary.id` | UUID string |
| `status` | `overallStatus` | `"clean"` \| `"threats_found"` |
| `scanned_items_count` | `totalItemsScanned` | int |
| `duration_seconds` | `durationSeconds` | float |
| `threats[].name` | `ThreatItem.threatName` | string |
| `threats[].type` | `ThreatItem.threatCategory` | ThreatTypeEnum |
| `threats[].severity` | `ThreatItem.riskLevel` | SeverityEnum |
| `threats[].file_path` | `ThreatItem.targetPath` | string? |
| `threats[].description` | `ThreatItem.description` | string |
| `threats[].recommendation` | `ThreatItem.recommendation` | string |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Async PostgreSQL URL |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL |
| `SECRET_KEY` | (required) | App secret key |
| `YARA_RULES_DIR` | `./app/rules` | Path to .yar files |
| `MAX_FILE_SIZE_MB` | `50` | Max upload size |
| `HIGH_ENTROPY_THRESHOLD` | `7.2` | Entropy flag threshold |
| `API_KEY_ENABLED` | `false` | Enable X-API-Key auth |
| `ALLOWED_ORIGINS` | `http://localhost:19006,...` | CORS allowed origins |
