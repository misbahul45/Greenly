# Greenly ML Engine

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![FAISS](https://img.shields.io/badge/FAISS-1.8-5299CC)](https://github.com/facebookresearch/faiss)
[![Celery](https://img.shields.io/badge/Celery-5.3-37814A?logo=celery)](https://docs.celeryq.dev/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)

**ML Engine** adalah service machine learning Greenly yang menangani semantic search berbasis vector embedding, rekomendasi produk, dan kalkulasi eco score. Dibangun dengan FastAPI, Sentence Transformers, FAISS, Celery, dan RabbitMQ.

---

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Prerequisites](#prerequisites)
- [Setup & Instalasi](#setup--instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [ML Pipeline](#ml-pipeline)
- [Event Driven](#event-driven)
- [Integrasi dengan Service Lain](#integrasi-dengan-service-lain)

---

## ✨ Fitur

- **🧠 Semantic Search**
  - Pencarian produk berdasarkan makna/konsep (bukan keyword literal)
  - Multi-language support via `paraphrase-multilingual-MiniLM-L12-v2`
  - Filter berdasarkan kategori, harga, dan eco score
  - Vector similarity search dengan FAISS (384-dimensi)
- **🎯 Recommendations**
  - **Home Recommendations** — Produk ter-ranking untuk halaman utama (weighted formula: eco 20%, rating 15%, favorites 10%, stock 10%, price 10%, generic 35%)
  - **Eco Picks** — Rekomendasi produk ramah lingkungan terbaik
  - **Similar Products** — Produk serupa berdasarkan vector similarity + category boost
  - Setiap rekomendasi menyertakan `reason` (alasan text) untuk explainability
- **🌱 Eco Score Calculator**
  - Kalkulasi skor ramah lingkungan (0-100) berdasarkan material, recyclability, carbon footprint, packaging, dan keyword description
  - Output: score, label (`Not Eco-Friendly` — `Very Eco-Friendly`), dan alasan detail
- **🔄 Real-time Index Sync**
  - FAISS index otomatis sinkron via RabbitMQ event consumer
  - Product created/updated/deleted → otomatis update index
  - Eco attribute, price, inventory, discount updates → otomatis update metadata
- **⚙️ Background Tasks (Celery)**
  - Rebuild index task (fetch all products dari Catalog Service + regenerate embeddings)

---

## 🛠 Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Python** | 3.12 | Bahasa pemrograman |
| **FastAPI** | >=0.110 | REST API framework |
| **Uvicorn** | >=0.27 | ASGI server |
| **Sentence Transformers** | 2.7.x | Text embedding model (384-d vectors) |
| **FAISS (CPU)** | >=1.8 | Vector similarity search (IndexFlatIP) |
| **PyTorch** | 2.7.x | Deep learning backend untuk embedding |
| **Celery** | >=5.3 | Distributed task queue |
| **RabbitMQ** | - | Message broker (Celery + event consumer) |
| **Redis** | >=8.0 | Result backend (Celery) |
| **httpx** | >=0.27 | Async HTTP client |
| **Pydantic** | >=2.6 | Data validation & settings |

---

## 🏗 Arsitektur

```
┌───────────────┐     ┌───────────────┐
│  Mobile App   │     │  Catalog      │
│  (Flutter)    │     │  Service (Go) │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ├─────────────────────┤
        │ HTTP                │ HTTP (fetch products)
        ▼                     ▼
┌──────────────────────────────────┐
│         ML Engine                │  ← Port 8000
│  ┌──────────────────────────┐    │
│  │   FastAPI Application    │    │
│  │  ┌─────┐ ┌────┐ ┌────┐  │    │
│  │  │Search│ │Rec │ │Eco │  │    │
│  │  │ API  │ │ API│ │ API│  │    │
│  │  └──┬──┘ └──┬─┘ └──┬──┘  │    │
│  └─────┼────────┼──────┼──────┘    │
│        ▼        ▼      ▼           │
│  ┌──────────────────────────┐      │
│  │      Core Logic          │      │
│  │  ┌──────────┐ ┌───────┐  │      │
│  │  │Embedding │ │FAISS  │  │      │
│  │  │Service   │ │Vector │  │      │
│  │  │(Sentence │ │Store  │  │      │
│  │  │Transform)│ │(Index)│  │      │
│  │  └────┬─────┘ └──┬────┘  │      │
│  │  ┌────┴─────┐ ┌──┴────┐  │      │
│  │  │ Ranking  │ │Eco    │  │      │
│  │  │Algorithm │ │Score  │  │      │
│  │  └──────────┘ └───────┘  │      │
│  └──────────────────────────┘      │
│                                      │
│  ┌──────────────────────────┐      │
│  │   Background Workers     │      │
│  │  ┌────────┐ ┌─────────┐  │      │
│  │  │ Celery │ │RabbitMQ │  │      │
│  │  │ Tasks  │ │Consumer │  │      │
│  │  └────────┘ └─────────┘  │      │
│  └──────────────────────────┘      │
└──────────────────────────────────┘
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────┐
│   RabbitMQ   │    │    Redis     │
│  (Events +   │    │ (Celery      │
│   Celery)    │    │  Backend)    │
└──────────────┘    └──────────────┘
```

### Alur Semantic Search

```
User Query: "sikat gigi bambu ramah lingkungan"
       │
       ▼
EmbeddingService.embed_query(query)
       │
       ▼
384-d vector [0.123, -0.456, ...]
       │
       ▼
FAISS Index.search(vector, top_k)
       │
       ▼
Similar Products [score: 0.89, 0.76, ...]
       │
       ▼
Filter + Sort + Return
```

### Alur Index Sync (Event-Driven)

```
Catalog Service                       ML Engine
──────────────                       ──────────
Product Created ──▶ RabbitMQ ──▶ Event Consumer
       │              Event          │
       │           ──▶ upsert() ─────┤
       │                              ▼
Product Updated ──▶ RabbitMQ ──▶ FAISS Index
       │              Event       Updated
       │           ──▶ upsert() ─────┤
       │                              ▼
Product Deleted ──▶ RabbitMQ ──▶ Product Removed
                      Event       from Index
                   ──▶ delete() ────┤
```

---

## 📋 Prerequisites

- **Python** >= 3.11, < 3.13
- **uv** (Python package manager) — [Install Guide](https://docs.astral.sh/uv/#installation)
- **RabbitMQ** >= 3.x
- **Redis** >= 7.x
- **Catalog Service** — Harus berjalan untuk rebuild index

---

## 🔧 Setup & Instalasi

### 1. Clone & Setup Environment

```bash
cd services/ml-engine
cp .env.example .env
# Edit .env sesuai konfigurasi lokal Anda
```

### 2. Install Dependencies (dengan uv)

```bash
# Install uv jika belum
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies
uv sync
```

### 3. Aktifkan Virtual Environment

```bash
source .venv/bin/activate
```

### 4. Jalankan Aplikasi

```bash
# Development
uv run uvicorn main:app --reload --port 8000

# Production
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. Jalankan Celery Worker (Opsional)

```bash
# Terminal terpisah
uv run celery -A app.workers.celery_app worker --loglevel=info
```

---

## 🌍 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | Environment name |
| `ML_PORT` | `8000` | Server port |
| `MODEL_NAME` | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Embedding model |
| `CATALOG_SERVICE_URL` | `http://catalog-service:8081` | Upstream catalog API |
| `CORE_SERVICE_URL` | `http://core-service:3000` | Upstream core API |
| `RABBITMQ_URL` | `amqp://greenly:change-me@rabbitmq:5672/` | RabbitMQ connection |
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection (Celery backend) |
| `FAISS_INDEX_PATH` | `app/storage/indexes/products.faiss` | Path FAISS index file |
| `PRODUCT_META_PATH` | `app/storage/indexes/products_meta.json` | Path product metadata |
| `ML_INTERNAL_TOKEN` | `change-me-local-dev-token` | Token autentikasi internal endpoints |
| `ML_USE_HASH_EMBEDDINGS` | `false` | Gunakan hash embeddings (testing ringan) |

---

## 🚀 Menjalankan Aplikasi

```bash
# Development API
uv run uvicorn main:app --reload --port 8000

# Production API
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Celery Worker (background tasks)
uv run celery -A app.workers.celery_app worker --loglevel=info

# Celery Beat (scheduled tasks, jika ada)
uv run celery -A app.workers.celery_app beat --loglevel=info

# Semua dengan Docker
docker compose up -d ml-engine
```

---

## 📁 Struktur Proyek

```
main.py                              # Entry point FastAPI + middleware
pyproject.toml                       # Project config & dependencies
app/
├── __init__.py
├── config.py                        # Settings via pydantic-settings
├── deps.py                          # FastAPI dependency injection (singleton)
├── schemas.py                       # Pydantic models (ProductIndexItem, SearchRequest, etc.)
│
├── api/                             # API Routes
│   ├── __init__.py
│   ├── health.py                    # GET /health — model & index status
│   ├── search.py                    # POST /search, POST /products/*
│   ├── recommendation.py            # GET /recommendations/*
│   └── eco.py                       # POST /eco/score
│
├── core/                            # Core ML Logic
│   ├── __init__.py
│   ├── embedding.py                 # EmbeddingService (sentence-transformers)
│   ├── vector_store.py              # VectorStore (FAISS index management)
│   ├── ranking.py                   # rank_home_products() — weighted scoring
│   └── eco_score.py                 # calculate_eco_score() — heuristic eco scoring
│
├── clients/                         # External HTTP Clients
│   ├── __init__.py
│   └── catalog_client.py            # CatalogClient — fetch products from Catalog Service
│
├── workers/                         # Background Tasks
│   ├── __init__.py
│   ├── celery_app.py                # Celery app configuration
│   ├── tasks.py                     # Celery tasks (rebuild_index_task)
│   └── event_consumer.py            # RabbitMQ event consumer (Kombu)
│
└── storage/
    └── indexes/                     # Persisted FAISS index + metadata
        ├── products.faiss           # FAISS binary index file
        └── products_meta.json       # Product metadata + embeddings
```

---

## 📡 API Endpoints

Dokumentasi API lengkap tersedia di [`report.md`](./report.md).

### Public Endpoints (Tidak Perlu Auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/` | Service info |
| `GET` | `/health` | Status model, index, jumlah produk terindex |
| `POST` | `/search` | Semantic search dengan filter opsional |
| `GET` | `/recommendations/home` | Home recommendations (weighted ranking) |
| `GET` | `/recommendations/eco` | Eco-friendly picks |
| `GET` | `/recommendations/similar/{product_id}` | Similar products (vector similarity) |
| `POST` | `/eco/score` | Kalkulasi eco score |

### Internal Endpoints (Header `x-internal-token`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/products/index` | Bulk index products (rebuild) |
| `POST` | `/products/upsert` | Index/update single product |
| `DELETE` | `/products/{product_id}` | Remove product from index |
| `POST` | `/products/rebuild-index` | Full rebuild dari Catalog Service |

### Contoh Request

**Semantic Search:**
```json
// POST /search
{
  "query": "sikat gigi bambu ramah lingkungan",
  "limit": 20,
  "filters": {
    "category_id": "cat123",
    "min_price": 5000,
    "max_price": 100000,
    "min_eco_score": 70
  }
}
```

**Eco Score:**
```json
// POST /eco/score
{
  "name": "Organic Bamboo Toothbrush",
  "description": "Sikat gigi bambu organik dengan bristle biodegradable...",
  "material_type": "bamboo",
  "recyclable": true,
  "carbon_footprint": 2.5,
  "packaging": "recycled"
}
```

---

## 🧠 ML Pipeline

### Embedding Model

- **Model:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Dimensi:** 384
- **Multi-language:** Support 50+ bahasa (termasuk Bahasa Indonesia)
- **Fallback:** Hash-based embeddings jika `ML_USE_HASH_EMBEDDINGS=true` (untuk testing)

### FAISS Index

- **Index type:** `IndexFlatIP` (Inner Product = Cosine Similarity untuk normalized vectors)
- **Persistence:** Index + metadata disimpan ke disk
- **Thread safety:** threading.Lock untuk operasi read/write
- **Auto-save:** Index otomatis disimpan setelah operasi rebuild/upsert/delete

### Home Ranking Formula

```
score = (eco_score/100 × 0.20)
      + (rating_average/5 × 0.15)
      + (favorite_count/max_fav × 0.10)
      + (stock > 0 ? 0.10 : 0)
      + (1 - price/max_price) × 0.10
      + 0.35  // generic boost
```

### Eco Score Formula (Heuristic)

| Komponen | Max Score | Kriteria |
|----------|-----------|----------|
| Material Type | 30 | organic_cotton=30, bamboo=25, recycled_polyester=20, ... |
| Recyclable | 15 | true=15, false=0 |
| Carbon Footprint | 20 | Inverse linear: ≤1kg=20, ≤5kg=15, ≤10kg=10, >10kg=5 |
| Packaging | 15 | recycled=15, biodegradable=12, minimal=10, plastic=0 |
| Description Keywords | 20 | Scanning kata kunci ramah lingkungan |

**Label Threshold:**
- 0-20: "Not Eco-Friendly"
- 21-40: "Less Eco-Friendly"
- 41-60: "Moderately Eco-Friendly"
- 61-80: "Eco-Friendly"
- 81-100: "Very Eco-Friendly"

---

## 📨 Event-Driven (RabbitMQ Consumer)

ML Engine mendengarkan event dari **Catalog Service** melalui exchange `greenly_events` untuk menjaga FAISS index tetap sinkron secara real-time.

### Consumed Events

| Event | Handler | Aksi |
|-------|---------|------|
| `product.created` | `handle_product_created` | Embed product → upsert ke FAISS index |
| `product.updated` | `handle_product_updated` | Re-embed → upsert ke FAISS index |
| `product.deleted` | `handle_product_deleted` | Remove dari FAISS index |
| `eco.attribute.updated` | `handle_eco_updated` | Update eco metadata di index |
| `price.updated` | `handle_price_updated` | Update price metadata di index |
| `inventory.updated` | `handle_inventory_updated` | Update stock metadata di index |
| `discount.applied` | `handle_discount_applied` | Update promo metadata di index |

---

## 🔗 Integrasi dengan Service Lain

### Mobile App (Flutter) — Konsumer Utama

| Fitur Mobile | Endpoint ML | Keterangan |
|-------------|-------------|------------|
| Search Screen | `POST /search` | Semantic search **primary**, fallback ke Catalog |
| Home Screen | `GET /recommendations/home` | "Rekomendasi Untuk Kamu" section |
| Home Screen | `GET /recommendations/eco` | "Eco Picks" section |
| Product Detail | `GET /recommendations/similar/{id}` | "Produk Mirip" horizontal scroll |

### Catalog Service (Go) — Sumber Data

| Aksi | Protocol | Detail |
|------|----------|--------|
| Fetch all products | HTTP (httpx) | `GET /api/catalog/products` (rebuild index) |
| Fetch single product | HTTP (httpx) | `GET /api/catalog/products/{id}` |
| Receive product events | RabbitMQ | `product.created/updated/deleted` |
| Receive price events | RabbitMQ | `price.updated` |
| Receive inventory events | RabbitMQ | `inventory.updated` |

---

## 🐳 Docker

```dockerfile
# Dockerfile.dev
FROM python:3.12-slim

RUN pip install uv

WORKDIR /app
COPY . .

RUN uv sync

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build & Run

```bash
docker build -t greenly-ml-engine -f Dockerfile.dev .
docker run -p 8000:8000 --env-file .env greenly-ml-engine
```

---

## 📄 Lisensi

Private — Greenly Project
