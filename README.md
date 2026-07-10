# 🌿 Greenly

**Sustainable e-commerce platform** — marketplace ramah lingkungan yang menghubungkan penjual produk eco-friendly dengan konsumen yang sadar akan keberlanjutan.

Greenly dibangun dengan arsitektur **microservices** yang diorkestrasikan melalui **Docker Compose**, di mana setiap service menggunakan bahasa dan framework yang paling sesuai dengan tanggung jawabnya.

---

## 📐 Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│   │ Flutter App   │    │  Web App      │    │  Seed / Admin Script │  │
│   │ (Android/iOS) │    │ (TanStack +   │    │  (Bash)              │  │
│   │ apps/app      │    │  React)       │    │  scripts/            │  │
│   │               │    │  apps/web     │    │                      │  │
│   └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│          │                   │                       │               │
└──────────┼───────────────────┼───────────────────────┼───────────────┘
           │                   │                       │
           ▼                   ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     TRAEFIK API GATEWAY (:80)                        │
│                                                                      │
│   /api/core/*    → core-service:3000                                 │
│   /api/catalog/* → catalog-service:8081                              │
│   /api/ml/*      → ml-engine:8000                                    │
│                                                                      │
│   Dashboard: http://localhost:8080                                    │
└──────┬───────────────────┬────────────────────────┬──────────────────┘
       │                   │                        │
       ▼                   ▼                        ▼
┌──────────────┐   ┌───────────────┐   ┌────────────────────┐
│ CORE SERVICE │   │CATALOG SERVICE│   │    ML ENGINE        │
│              │   │               │   │                     │
│ NestJS       │   │ Go + Gin      │   │ Python + FastAPI    │
│ TypeScript   │   │ Go 1.24       │   │ Python 3.12         │
│ Node 22      │   │               │   │                     │
│ Port: 3000   │   │ Port: 8081    │   │ Port: 8000          │
│              │   │               │   │                     │
│ • Auth/JWT   │   │ • Products    │   │ • Semantic Search   │
│ • Users      │   │ • Categories  │   │ • Recommendations   │
│ • Orders     │   │ • Reviews     │   │ • Similar Products  │
│ • Cart       │   │ • Favorites   │   │ • Eco Score Calc    │
│ • Payments   │   │ • Image Upload│   │ • FAISS Vector Index│
│ • Chat (SSE) │   │ • Shops       │   │                     │
│ • Notif (SSE)│   │               │   │  ML Worker (Celery) │
│ • Banners    │   │               │   │  • Index rebuild    │
│ • Shops      │   │               │   │  • Background tasks │
└──────┬───────┘   └───────┬───────┘   └──────────┬─────────┘
       │                   │                      │
       ▼                   ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE                               │
│                                                                      │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  MySQL  │  │ MongoDB │  │  Redis   │  │     RabbitMQ         │   │
│  │  8.0    │  │    7    │  │    7     │  │   3-management       │   │
│  │ :3307   │  │ :27017  │  │ :6379   │  │ :5672 / :15672 (UI)  │   │
│  │         │  │         │  │         │  │                      │   │
│  │ core-   │  │ catalog │  │ session  │  │  Exchange:           │   │
│  │ service │  │ service │  │ cache    │  │  greenly_events      │   │
│  │ (Prisma)│  │ (driver)│  │ tokens   │  │  (topic, durable)    │   │
│  └─────────┘  └─────────┘  └──────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| **API Gateway** | Traefik | v2.11 |
| **Core Service** | NestJS + Prisma + TypeScript | NestJS 11, Node 22 |
| **Catalog Service** | Go + Gin + MongoDB Driver | Go 1.24, Gin 1.11 |
| **ML Engine** | FastAPI + FAISS + Sentence Transformers | Python 3.12 |
| **ML Worker** | Celery (via ML Engine codebase) | Celery 5.3+ |
| **Mobile App** | Flutter + BLoC | Dart SDK ^3.10.8 |
| **Web App** | TanStack Start + React + Vite + TailwindCSS | React 19 |
| **Database (Relational)** | MySQL | 8.0 |
| **Database (Document)** | MongoDB | 7 |
| **Cache / Session** | Redis | 7 |
| **Message Broker** | RabbitMQ | 3-management |
| **Containerization** | Docker + Docker Compose | - |
| **Payment** | Stripe | - |
| **Image CDN** | ImageKit | - |

---

## 📂 Struktur Project

```
greenly/
├── apps/
│   ├── app/                    # Flutter mobile app (Android/iOS)
│   └── web/                    # Web app (TanStack Start + React + Vite)
│
├── services/
│   ├── core-service/           # NestJS — auth, users, orders, cart, payments, chat, notifications
│   ├── catalog-service/        # Go Gin — products, categories, reviews, favorites, shops, images
│   └── ml-engine/              # FastAPI — semantic search, recommendations, eco score, FAISS
│
├── infra/
│   └── traefik/                # Traefik API Gateway config (traefik.yml, dynamic.yml)
│
├── scripts/
│   ├── seed-all.sh             # Full seed: core migrate + catalog seed + ML index rebuild
│   ├── seed-all.ps1            # PowerShell version untuk Windows
│   ├── health-check.sh         # Health check semua service endpoints
│   └── flutter-android-*.sh    # Build, analyze, test, dev scripts untuk Flutter
│
├── docs/
│   ├── event-contracts.md      # RabbitMQ event schema contracts
│   ├── event-driven-architecture-analysis.md
│   ├── event-driven-fix-summary.md
│   └── mobile-android-docker.md
│
├── docker-compose.yml          # Orkestrasi seluruh infrastruktur + services
├── .env.example                # Template environment variables
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) v2+
- [Flutter SDK](https://docs.flutter.dev/get-started/install) ^3.10 (untuk mobile development)
- [Go](https://go.dev/dl/) 1.24+ (opsional, untuk catalog-service development lokal)
- [Node.js](https://nodejs.org/) 22+ & [pnpm](https://pnpm.io/) (opsional, untuk core-service/web development lokal)
- [Python](https://www.python.org/) 3.12 & [uv](https://github.com/astral-sh/uv) (opsional, untuk ML engine development lokal)

### 1. Clone & Setup Environment

```bash
git clone <repository-url> greenly
cd greenly
cp .env.example .env
```

Edit `.env` dan ganti semua value `change-me` dengan secret yang aman.

### 2. Start Infrastructure & Services

```bash
# Start semua services
docker compose up -d

# Cek status
docker compose ps
```

Services yang akan berjalan:

| Service | URL | Keterangan |
|---------|-----|------------|
| Traefik Dashboard | `http://localhost:8080` | API Gateway dashboard |
| Core Service | `http://localhost/api/core` | NestJS API |
| Catalog Service | `http://localhost/api/catalog` | Go Gin API |
| ML Engine | `http://localhost/api/ml` | FastAPI ML |
| RabbitMQ Management | `http://localhost:15672` | Message broker UI |
| MySQL | `localhost:3307` | Relational DB |
| MongoDB | `localhost:27017` | Document DB |
| Redis | `localhost:6379` | Cache |

### 3. Seed Database & Build ML Index

```bash
# Full seed: Core migrate → Catalog seed → ML FAISS index rebuild
./scripts/seed-all.sh

# Dengan mode docker (seed catalog juga di dalam container)
./scripts/seed-all.sh --mode docker

# Reset database (hapus semua data, migrasi ulang, seed ulang)
./scripts/seed-all.sh --reset
```

### 4. Health Check

```bash
./scripts/health-check.sh
```

Atau manual:

```bash
curl http://localhost/api/core/health
curl http://localhost/api/catalog/health
curl http://localhost/api/ml/health
```

---

## 📱 Mobile App (Flutter)

```bash
cd apps/app

# Setup
cp .env.example .env
# Edit .env → set API_URL ke IP lokal (misal: http://192.168.18.6/api)

flutter pub get
flutter run
```

> **Penting:** Untuk device fisik Android, gunakan IP jaringan lokal host (bukan `localhost`).
> Contoh: `API_URL=http://192.168.18.6/api`

### Fitur Mobile

- Autentikasi (register, login, email verification, forgot password)
- Product browsing dengan infinite scroll
- Semantic search (ML-powered) dengan fallback ke catalog
- Rekomendasi personal (Home) & Eco Picks (ML-powered)
- Similar products di halaman detail (ML-powered)
- Keranjang belanja & checkout
- Payment via Stripe WebView
- Order management dengan pembatalan pesanan
- Chat real-time (SSE)
- Notifikasi real-time (SSE)
- Profil & edit profil dengan image upload
- Review & rating produk
- Favorit produk
- Follow toko

---

## 🌐 Web App (TanStack Start + React)

```bash
cd apps/web

pnpm install
pnpm dev  # → http://localhost:3000
```

---

## 🔌 API Routing (Traefik)

Traefik bertindak sebagai single entry point pada port `80`. Request di-route berdasarkan path prefix:

| Path Prefix | Target Service | Strip Prefix |
|-------------|----------------|--------------|
| `/api/core/*` | `core-service:3000` | `/api/core` |
| `/api/catalog/*` | `catalog-service:8081` | `/api/catalog` |
| `/api/ml/*` | `ml-engine:8000` | `/api/ml` |

---

## 📨 Event-Driven Architecture (RabbitMQ)

Greenly menggunakan arsitektur event-driven untuk komunikasi antar service yang asinkron.

**Exchange:** `greenly_events` (topic, durable)

### Event Flow

```
┌──────────────┐                                    ┌───────────────┐
│ Core Service │──── order.created ────────────────▶│               │
│              │──── payment.completed ───────────▶ │   RabbitMQ    │
│              │──── payment.refunded ────────────▶ │   Exchange:   │
│              │──── auth.user.deleted ───────────▶ │greenly_events │
└──────────────┘                                    │               │
                                                    │               │
┌──────────────┐                                    │               │
│   Catalog    │──── product.created ────────────▶ │               │
│   Service    │──── product.updated ────────────▶ │               │
│              │──── product.deleted ────────────▶ │               │
│              │──── inventory.updated ──────────▶ │               │
│              │──── price.updated ──────────────▶ │               │
│              │──── discount.applied ───────────▶ │               │
│              │──── product.eco_attribute.updated▶│               │
└──────────────┘                                    └───────┬───────┘
                                                            │
                          ┌─────────────────────────────────┘
                          ▼
               ┌────────────────────┐
               │     ML Engine      │
               │  (Event Consumer)  │
               │                    │
               │ • product.created  │ → upsert FAISS index
               │ • product.updated  │ → upsert FAISS index
               │ • product.deleted  │ → remove from index
               │ • inventory.updated│ → update metadata
               │ • price.updated    │ → update metadata
               │ • discount.applied │ → update metadata
               │ • eco_attribute    │ → recalculate + update
               └────────────────────┘
```

Detail kontrak event tersedia di [`docs/event-contracts.md`](docs/event-contracts.md).

---

## 🤖 ML Engine

ML Engine menggunakan **FAISS** (Facebook AI Similarity Search) dan **Sentence Transformers** untuk menyediakan:

| Fitur | Endpoint | Deskripsi |
|-------|----------|-----------|
| **Semantic Search** | `POST /api/ml/search` | Vector similarity search dengan filter (kategori, harga, eco score) |
| **Home Recommendations** | `GET /api/ml/recommendations/home` | Ranking produk personal (blend: user preference + business logic) |
| **Eco Picks** | `GET /api/ml/recommendations/eco` | Produk teratas berdasarkan eco score murni |
| **Similar Products** | `GET /api/ml/recommendations/similar/{id}` | Produk serupa berbasis cosine similarity |
| **Eco Score Calculator** | `POST /api/ml/eco/score` | Kalkulasi skor ramah lingkungan (0-100) |
| **Telemetry** | `POST /api/ml/events` | Logging user interaction events |

**Model:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dim vectors)

**ML Worker:** Celery worker terpisah untuk background task (index rebuild), menggunakan RabbitMQ sebagai broker dan Redis sebagai result backend.

---

## 🗄️ Database Schema

### MySQL (Core Service — via Prisma ORM)

Menyimpan data transaksional dan user-centric:
- Users, Addresses, Shops
- Orders, Order Items, Payments
- Cart, Cart Items
- Notifications
- Chat Conversations, Messages
- Banners
- Event Outbox (untuk reliable event publishing)

### MongoDB (Catalog Service)

Menyimpan data catalog produk:
- Products (dengan eco attributes, pricing, promotion)
- Categories
- Reviews
- Favorites
- Product Images (metadata — file di-host via ImageKit)

---

## 🔧 Development

### Docker Compose Watch (Hot Reload)

```bash
docker compose up --watch
```

Perubahan file akan otomatis di-sync ke container tanpa perlu rebuild:

| Service | Trigger Sync | Trigger Rebuild |
|---------|-------------|-----------------|
| Core Service | Semua file di `services/core-service/` | `package.json` berubah |
| Catalog Service | Semua file di `services/catalog-service/` | `go.mod` berubah |
| ML Engine | Semua file di `services/ml-engine/` | `pyproject.toml` berubah |

### Logs

```bash
# Semua service
docker compose logs -f

# Service tertentu
docker compose logs -f core-service
docker compose logs -f catalog-service
docker compose logs -f ml-engine
docker compose logs -f ml-worker
```

### Rebuild Single Service

```bash
docker compose up -d --build core-service
```

---

## 📊 Environment Variables

Semua environment variable didefinisikan di root `.env` dan diinjeksi ke setiap container melalui `docker-compose.yml`.

Lihat [`.env.example`](.env.example) untuk daftar lengkap. Kategori utama:

| Kategori | Contoh Variable |
|----------|-----------------|
| **Network** | `HTTP_PORT`, `TRAEFIK_DASHBOARD_PORT` |
| **MySQL** | `MYSQL_DATABASE`, `MYSQL_USER`, `DATABASE_URL` |
| **MongoDB** | `MONGODB_URL`, `MONGO_INITDB_ROOT_PASSWORD` |
| **Redis** | `REDIS_HOST`, `REDIS_URL` |
| **RabbitMQ** | `RABBITMQ_URL`, `RABBITMQ_EXCHANGE` |
| **Core Service** | `JWT_ACCESS_SECRET_KEY`, `STRIPE_SECRET_KEY` |
| **Catalog Service** | `IMAGEKIT_PRIVATE_KEY`, `GIN_MODE` |
| **ML Engine** | `ML_MODEL_NAME`, `FAISS_INDEX_PATH`, `ML_INTERNAL_TOKEN` |

---

## 📚 Dokumentasi Tambahan

| Dokumen | Lokasi |
|---------|--------|
| Core Service API Report | `services/core-service/report.md` |
| Catalog Service API Report | `services/catalog-service/report.md` |
| ML Engine API Report | `services/ml-engine/report.md` |
| Mobile App + ML Integration Report | `apps/app/report.md` |
| Event Contracts | `docs/event-contracts.md` |
| Event-Driven Architecture Analysis | `docs/event-driven-architecture-analysis.md` |
| Mobile Android Docker Setup | `docs/mobile-android-docker.md` |


