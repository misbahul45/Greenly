# Greenly — Eco Product Marketplace

Platform marketplace produk ramah lingkungan berbasis microservices dengan semantic search ML, rekomendasi berbasis vektor, dan mobile app Flutter.

---

## Daftar Isi

- [Gambaran Sistem](#gambaran-sistem)
- [Arsitektur](#arsitektur)
- [Tech Stack](#tech-stack)
- [Struktur Direktori](#struktur-direktori)
- [Services](#services)
  - [Core Service](#core-service-nodejs--nestjs)
  - [Catalog Service](#catalog-service-go--gin)
  - [ML Engine](#ml-engine-python--fastapi)
  - [Mobile App](#mobile-app-flutter)
- [Workflow Utama](#workflow-utama)
  - [Arsitektur Sistem](#1-arsitektur-sistem-keseluruhan)
  - [Request Flow Mobile → Backend](#2-request-flow-mobile--backend)
  - [ML Pipeline — Product Indexing](#3-ml-pipeline--product-indexing)
  - [Event-Driven Sync via RabbitMQ](#4-event-driven-sync-via-rabbitmq)
  - [Semantic Search Flow](#5-semantic-search-flow)
  - [ML Recommendation Flow](#6-ml-recommendation-flow)
  - [Mobile App Data Flow](#7-mobile-app-data-flow-flutter)
- [Getting Started](#getting-started)
- [Konfigurasi Environment](#konfigurasi-environment)
- [API Reference](#api-reference)
- [Infrastruktur](#infrastruktur)

---

## Gambaran Sistem

Greenly adalah marketplace untuk produk eco-friendly. Sistem ini terdiri dari:

| Komponen | Teknologi | Fungsi |
|---|---|---|
| **core-service** | NestJS + MySQL + Redis | Auth, user, notifikasi, chat, order |
| **catalog-service** | Go/Gin + MongoDB + Redis | Produk, kategori, inventori, harga, diskon, eco attribute |
| **ml-engine** | FastAPI + FAISS + Sentence Transformers | Semantic search, rekomendasi, eco score |
| **mobile app** | Flutter + BLoC | Antarmuka pengguna Android/iOS |
| **Traefik** | Reverse proxy | Routing publik semua service ke port 80 |
| **RabbitMQ** | Message broker | Event-driven sync catalog → ml-engine |

---

## Arsitektur

### 1. Arsitektur Sistem Keseluruhan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GREENLY PLATFORM                                   │
│                                                                             │
│    ┌──────────────────────────────────────────────────────────────────┐    │
│    │                    Flutter Mobile App                            │    │
│    │         (Android / iOS  —  BLoC + ApiClient)                    │    │
│    └──────────────────────────────┬───────────────────────────────────┘    │
│                                   │ HTTP/REST  (ENV.API = http://host/api) │
│    ┌──────────────────────────────▼───────────────────────────────────┐    │
│    │                  Traefik Reverse Proxy  :80                      │    │
│    │                                                                  │    │
│    │   /api/core/*    ─────────────────────► core-service:3000       │    │
│    │   /api/catalog/* ─────────────────────► catalog-service:8081    │    │
│    │   /api/ml/*      ─────────────────────► ml-engine:8000          │    │
│    └────────────┬──────────────────┬───────────────────┬─────────────┘    │
│                 │                  │                   │                   │
│    ┌────────────▼──────┐  ┌────────▼──────────┐  ┌────▼───────────────┐  │
│    │   core-service    │  │  catalog-service  │  │    ml-engine       │  │
│    │  NestJS · :3000   │  │  Go/Gin · :8081   │  │  FastAPI · :8000   │  │
│    │                   │  │                   │  │                    │  │
│    │  · Auth / JWT     │  │  · Products       │  │  · FAISS Index     │  │
│    │  · Users          │  │  · Categories     │  │  · Sentence Trans. │  │
│    │  · Orders         │  │  · Inventory      │  │  · Semantic Search │  │
│    │  · Notifications  │  │  · Price          │  │  · Recommendations │  │
│    │  · Chat           │  │  · Discounts      │  │  · Eco Score API   │  │
│    │  · Banners        │  │  · Eco Attributes │  │  · Event Consumer  │  │
│    └────────┬──────────┘  └────────┬──────────┘  └────────────────────┘  │
│             │                      │                       ▲              │
│    ┌────────▼──────┐     ┌─────────▼──────┐               │              │
│    │     MySQL     │     │    MongoDB     │               │ subscribe     │
│    │  greenly_core │     │    catalog     │               │              │
│    └───────────────┘     └────────────────┘               │              │
│                                   │                        │              │
│    ┌──────────────┐               │ publish events         │              │
│    │    Redis     │◄──────────────┤                        │              │
│    │  Cache/Queue │               │                        │              │
│    └──────────────┘     ┌─────────▼────────────────────────┐             │
│                         │           RabbitMQ               │             │
│                         │   Exchange: greenly_events        │             │
│                         │   Type: topic · Durable           │             │
│                         │                                   │             │
│                         │  catalog_service_queue  (catalog) │             │
│                         │  ml-engine-products     (ML)      │             │
│                         └──────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend

| Service | Language | Framework | Database | Extras |
|---|---|---|---|---|
| core-service | TypeScript | NestJS | MySQL 8 | Redis, JWT, RabbitMQ |
| catalog-service | Go 1.24 | Gin | MongoDB 7 | Redis cache, RabbitMQ publisher |
| ml-engine | Python 3.12 | FastAPI | — | FAISS, Sentence Transformers, Kombu/RabbitMQ |

### Mobile

| Layer | Teknologi |
|---|---|
| Framework | Flutter (Dart SDK ^3.10.8) |
| State Management | flutter_bloc ^9.1.1 |
| HTTP Client | http ^1.6.0 (custom ApiClient) |
| Persistence | shared_preferences ^2.3.0 |
| Equality | equatable ^2.0.8 |
| Internationalization | intl ^0.20.2 |

### Infrastruktur

| Komponen | Versi | Port |
|---|---|---|
| Traefik | v2.11 | 80, 8080 (dashboard) |
| RabbitMQ | 3-management | 5672, 15672 |
| MySQL | 8.0 | 3307 (host) |
| MongoDB | 7 | 27017 |
| Redis | 7 | 6379 |

---

## Struktur Direktori

```
Greenly/
├── apps/
│   ├── app/                         # Flutter mobile app
│   │   └── lib/
│   │       ├── core/
│   │       │   ├── config/          # ENV config
│   │       │   ├── router/          # Named routes + route generator
│   │       │   ├── theme/           # AppTheme
│   │       │   ├── constants/       # UIConstants
│   │       │   └── utils/           # ApiClient, ApiResponse, CurrencyHelper
│   │       ├── features/
│   │       │   ├── auth/            # Login, register, JWT
│   │       │   ├── Main/            # Home, notification, chat, profile
│   │       │   │   └── features/
│   │       │   │       └── home/    # HomeBloc, HomeMlBloc, widgets
│   │       │   ├── ml-products/     # MlProductResult, MlProductService, widgets
│   │       │   ├── search-product/  # SearchProductBloc, semantic search + filter
│   │       │   ├── product-detail/  # ProductDetailBloc, SimilarProductsBloc
│   │       │   ├── cart/
│   │       │   ├── order/
│   │       │   ├── favorite/
│   │       │   └── shop/
│   │       └── shared/              # Reusable widgets + models
│   └── web/                         # Web frontend (future)
│
├── services/
│   ├── core-service/                # NestJS — auth, users, orders, chat
│   │   └── src/
│   │       └── modules/             # auth, identity, commerce, notification, ...
│   │
│   ├── catalog-service/             # Go — produk, katalog, inventori
│   │   ├── cmd/api/
│   │   │   ├── main.go
│   │   │   ├── routes.go            # Publisher adapters + router wiring
│   │   │   └── rabbitmq_init.go     # Consumer goroutine dengan retry loop
│   │   └── modules/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── inventory/           # Publishes inventory.updated
│   │       ├── price/               # Publishes price.updated
│   │       ├── product_discount/    # Publishes discount.applied
│   │       ├── eco_attribute/       # Publishes product.eco_attribute.updated
│   │       └── ...
│   │
│   └── ml-engine/                   # Python/FastAPI — ML & semantic search
│       ├── main.py
│       └── app/
│           ├── api/
│           │   ├── search.py        # POST /search, POST /products/index
│           │   ├── recommendation.py # GET /recommendations/{home,eco,similar}
│           │   └── eco.py           # POST /eco-score
│           ├── core/
│           │   ├── vector_store.py  # FAISS wrapper + persistent meta
│           │   ├── embedding.py     # Sentence Transformers embedder
│           │   ├── ranking.py       # Home score algorithm
│           │   └── eco_score.py     # Eco scoring logic
│           ├── clients/
│           │   └── catalog_client.py # Fetch products dari catalog-service
│           └── workers/
│               └── event_consumer.py # Kombu consumer — RabbitMQ → FAISS upsert
│
├── infra/                           # Infrastruktur notes
├── docs/                            # Planning docs
├── scripts/                         # Helper scripts
└── docker-compose.yml               # Semua service + infra
```

---

## Services

### Core Service (Node.js + NestJS)

Service utama untuk autentikasi dan manajemen pengguna.

**Modul:** `auth` · `identity` · `commerce` · `finance` · `notification` · `chat` · `banner` · `shops` · `analytics`

**Endpoints utama (via `/api/core`):**
```
POST   /auth/login              Login, kembalikan access + refresh token
POST   /auth/register           Registrasi pengguna baru
POST   /auth/refresh            Refresh access token
GET    /banners/active          Banner aktif untuk home screen
GET    /users/me                Profil user saat ini
```

---

### Catalog Service (Go + Gin)

Service untuk manajemen katalog produk. Setiap mutasi data produk (harga, stok, diskon, eco attribute) **mempublish event ke RabbitMQ** agar ML engine dapat meng-update FAISS index secara real-time.

**Endpoints utama (via `/api/catalog`):**
```
GET    /products                Daftar produk (paginasi)
GET    /products/slug/:slug     Detail produk by slug
GET    /products/search         Full-text search produk
GET    /categories              Daftar kategori
PUT    /inventory/:id           Update stok     → publishes inventory.updated
PUT    /price/:id               Update harga    → publishes price.updated
POST   /discounts               Buat diskon     → publishes discount.applied
PUT    /eco-attributes/:id      Update eco attr → publishes eco_attribute.updated
```

**Publisher Adapter Pattern:**
```
rabbitmq.Publisher (interface)
    ↓
inventoryEventPublisher   → inventory.updated
priceEventPublisher       → price.updated
discountEventPublisher    → discount.applied
ecoAttrEventPublisher     → product.eco_attribute.updated
```

---

### ML Engine (Python + FastAPI)

Service ML untuk semantic search dan rekomendasi berbasis vektor.

**Model:** `paraphrase-multilingual-MiniLM-L12-v2` (384 dimensi)
**Index:** FAISS `IndexFlatIP` — inner product similarity
**Persistence:** `products.faiss` + `products_meta.json`

**Endpoints utama (via `/api/ml`):**
```
POST   /search                         Semantic search produk
GET    /recommendations/home           Rekomendasi home (ranking by eco+rating+favorites)
GET    /recommendations/eco            Eco picks (sorted by eco_score)
GET    /recommendations/similar/:id    Produk mirip berdasarkan vektor embedding
POST   /eco-score                      Kalkulasi eco score dari atribut produk
POST   /products/index                 Rebuild index dari list produk
POST   /products/upsert                Upsert satu produk ke index
POST   /products/rebuild-index         Fetch dari catalog + rebuild penuh
DELETE /products/:id                   Hapus produk dari index
GET    /health                         Health check
```

**Home Ranking Score:**
```
score = 0.35 × generic
      + 0.20 × (eco_score / 100)
      + 0.15 × (rating / 5)
      + 0.10 × min(favorites / 100, 1)
      + 0.10 × (stock > 0 ? 1 : 0)
      + 0.10 × (price > 0 ? 1 : 0)
```

---

### Mobile App (Flutter)

Single-codebase mobile app untuk Android dan iOS.

**Fitur utama:**
- Auth (login, register, verify email, forgot password)
- Home: banner, kategori, search entry card, rekomendasi ML, eco picks, product grid
- Semantic Search: ML primary + catalog fallback, filter (kategori / harga / eco score), recent history
- Product Detail: gallery, info, review, **produk mirip (ML)**, produk lainnya (catalog)
- Cart, Order, Favorite, Shop
- Notifikasi, Chat, Profil

**BLoC yang terdaftar globally (`main.dart`):**
```
AuthBloc         — auth state
HomeBloc         — catalog home data (banner, kategori, produk)
HomeMlBloc       — ML recommendations (home + eco)
CartBloc         — cart items
```

---

## Workflow Utama

### 2. Request Flow Mobile → Backend

```
 Flutter App
     │
     │  HTTP Request ke ENV.API (http://host/api/...)
     │
     ▼
 ┌─────────────────────────────────────────────────────────┐
 │                Traefik  (port 80)                       │
 │                                                         │
 │  Rule: PathPrefix(`/api/core`)    → core-service:3000   │
 │  Rule: PathPrefix(`/api/catalog`) → catalog-service:8081│
 │  Rule: PathPrefix(`/api/ml`)      → ml-engine:8000      │
 │                                                         │
 │  Middleware: StripPrefix (hapus /api/xxx sebelum forward)│
 └────────┬──────────────────┬──────────────┬──────────────┘
          │                  │              │
          ▼                  ▼              ▼
   core-service        catalog-svc     ml-engine
   (NestJS)            (Go/Gin)        (FastAPI)
          │                  │              │
          ▼                  ▼              ▼
       MySQL              MongoDB         FAISS
                          + Redis        + Meta JSON
```

**Contoh request lifecycle:**
```
GET /api/catalog/products?page=1&limit=10

Flutter ApiClient
  → Tambah header Authorization: Bearer {token}
  → GET http://host/api/catalog/products?page=1&limit=10

Traefik
  → Match PathPrefix /api/catalog
  → Strip prefix → forward ke catalog-service:8081/products?page=1&limit=10

catalog-service
  → Handler GetProducts
  → Query MongoDB dengan filter + paginasi
  → Return JSON {status,statusCode,data,metaData}

Flutter ApiResponse<GetProductsRespon>.fromJson(...)
  → Deserialisasi → update HomeBloc → render UI
```

---

### 3. ML Pipeline — Product Indexing

```
 ┌──────────────────────────────────────────────────────────────┐
 │                  ML Product Indexing Pipeline                │
 └──────────────────────────────────────────────────────────────┘

 Trigger: POST /api/ml/products/rebuild-index
                │
                ▼
 ┌──────────────────────────┐
 │     CatalogClient        │
 │  GET catalog-service:    │
 │  8081/products (semua)   │
 └────────────┬─────────────┘
              │ List[ProductIndexItem]
              ▼
 ┌──────────────────────────┐
 │    EmbeddingService      │
 │                          │
 │  model: paraphrase-      │
 │  multilingual-           │
 │  MiniLM-L12-v2           │
 │                          │
 │  text = f"{name}         │
 │    {description}         │
 │    {category} {eco}"     │
 │                          │
 │  → encode(texts)         │
 │  → np.ndarray [N × 384]  │
 └────────────┬─────────────┘
              │ embeddings matrix
              ▼
 ┌──────────────────────────┐     ┌─────────────────────────┐
 │     VectorStore          │────►│  products.faiss          │
 │                          │     │  (FAISS IndexFlatIP)     │
 │  rebuild(products,       │     └─────────────────────────┘
 │          embeddings)     │
 │                          │     ┌─────────────────────────┐
 │  save() →                │────►│  products_meta.json      │
 └──────────────────────────┘     │  {dimension, products[], │
                                   │   embeddings[]}          │
                                   └─────────────────────────┘
```

---

### 4. Event-Driven Sync via RabbitMQ

Setiap mutasi produk di catalog-service otomatis meng-update FAISS index tanpa perlu rebuild penuh.

```
 catalog-service                 RabbitMQ                    ml-engine
       │                              │                           │
       │  MUTASI PRODUK               │                           │
       │                              │                           │
       │  PUT /inventory/:id          │                           │
       │  → Update stock di Mongo     │                           │
       │  → go func() {              │                           │
       │      PublishInventoryUpdated │                           │
       │    }()                       │                           │
       │                              │                           │
       │──── inventory.updated ──────►│                           │
       │                              │                           │
       │  PUT /price/:id              │                           │
       │──── price.updated ──────────►│                           │
       │                              │                           │
       │  POST /discounts             │                           │
       │──── discount.applied ───────►│                           │
       │                              │                           │
       │  PUT /eco-attributes/:id     │                           │
       │──── eco_attribute.updated ──►│                           │
       │                              │                           │
       │                              │◄─── ml-engine-products ───│
       │                              │     routing_key: #        │
       │                              │                           │
       │                              │                           │
       │                              │──── deliver message ─────►│
       │                              │                           │
       │                              │           EventConsumer   │
       │                              │           handle_message()│
       │                              │                           │
       │                              │           VectorStore     │
       │                              │           .upsert(product,│
       │                              │            embedding)     │
       │                              │                           │
       │                              │           Save to disk    │
       │                              │           (faiss + meta)  │

 ─────────────────────────────────────────────────────────────────
 Exchange: greenly_events  (topic, durable)
 Queue:    ml-engine-products  (binding: routing_key = #)
 Retry:    backoff [5s, 10s, 20s, 30s, 60s] — loop permanen
```

---

### 5. Semantic Search Flow

```
 User mengetik "tas bambu organik"
        │
        ▼
 Flutter SearchProductScreen
        │  POST /api/ml/search
        │  Body: {
        │    "query": "tas bambu organik",
        │    "limit": 10,
        │    "filters": {
        │      "category_id": "...",      ← opsional
        │      "min_price": 50000,        ← opsional
        │      "max_price": 500000,       ← opsional
        │      "min_eco_score": 70        ← opsional
        │    }
        │  }
        ▼
 Traefik → ml-engine:8000/search
        │
        ▼
 EmbeddingService.embed_query("tas bambu organik")
        │  → 384-dim float32 vector
        ▼
 VectorStore.search(query_vector, limit=10, filters)
        │
        │  FAISS IndexFlatIP.search()
        │  → top-K kandidat by inner product score
        │
        │  Filter kandidat:
        │    ✓ category_id match
        │    ✓ price range
        │    ✓ min_eco_score
        │
        │  → List[SearchResult]
        ▼
 Response: [{
   "product_id": "...",
   "score": 0.87,
   "name": "Tas Bambu Anyam",
   "reason": "Cocok karena memiliki skor eco tinggi",
   "eco_score": 85.0,
   "price": 125000,
   "image_url": "..."
 }, ...]
        │
        ▼
 Flutter: render SearchResultCard
   • Semantic label (source indicator)
   • SemanticReasonChip (reason text)
   • EcoScoreBadge
   • Harga

 ─── FALLBACK ───────────────────────────────────────
 Jika ML gagal / timeout:
   SearchProductService → GET /api/catalog/products/search?q=...
   → SearchResultCard dengan label "Katalog"
```

---

### 6. ML Recommendation Flow

```
 ┌──────────────────────────────────────────────────────────────┐
 │              ML Recommendation Endpoints                     │
 └──────────────────────────────────────────────────────────────┘

 A. Home Recommendations
    GET /api/ml/recommendations/home?limit=10
    │
    │  rank_home_products(store.products, limit)
    │  Score = 0.35×generic + 0.20×eco + 0.15×rating
    │        + 0.10×favorites + 0.10×stock + 0.10×price
    │
    └──► List[SearchResult] sorted by score DESC
         → Flutter: "Rekomendasi Untuk Kamu" section


 B. Eco Picks
    GET /api/ml/recommendations/eco?limit=10
    │
    │  Sort store.products by eco_score DESC
    │  → rank_home_products(sorted, limit)
    │
    └──► List[SearchResult]
         → Flutter: "Eco Picks" section


 C. Similar Products
    GET /api/ml/recommendations/similar/{product_id}?limit=8
    │
    │  1. Get product embedding from FAISS
    │  2. VectorStore.search(embedding, limit+5, exclude=product_id)
    │  3. Boost score +0.05 jika same category
    │  4. Sort by score DESC, take [:limit]
    │
    └──► List[SearchResult]
         → Flutter: "Produk Mirip" section di product detail


 Semua endpoint mengembalikan SearchResult shape yang sama:
 {id, product_id, score, name, slug, price, currency,
  image_url, image_urls, eco_score, rating_average,
  review_count, favorite_count, reason}
```

---

### 7. Mobile App Data Flow (Flutter)

```
 ┌───────────────────────────────────────────────────────────────┐
 │                  Flutter App — Data Flow                      │
 └───────────────────────────────────────────────────────────────┘

 main.dart
   MultiBlocProvider
   ├── AuthBloc(AuthService)
   ├── HomeBloc(HomeService)          ← catalog home data
   ├── HomeMlBloc(MlProductService)   ← ML recommendations (BARU)
   └── CartBloc(CartService)

 ─── HOME SCREEN ────────────────────────────────────────────────

 HomeScreen.initState()
   ├── HomeBloc.add(GetActiveBannersRequested)     → /api/core/banners/active
   ├── HomeBloc.add(GetCategoriesRequested)        → /api/catalog/categories
   ├── HomeBloc.add(GetFeaturedProductsRequested)  → /api/catalog/products
   └── HomeMlBloc.add(HomeMlStarted)
                └── Future.wait([
                      MlProductService.getHomeRecommendations()  → /api/ml/recommendations/home
                      MlProductService.getEcoRecommendations()   → /api/ml/recommendations/eco
                    ])

 HomeScreen render:
   ┌──────────────────────┐
   │  HomeSearchEntryCard │  → tap → SearchProductScreen
   ├──────────────────────┤
   │  BannerWidget        │  ← HomeBloc.banner
   ├──────────────────────┤
   │  CategoriesWidget    │  ← HomeBloc.category
   ├──────────────────────┤
   │  "Rekomendasi Untuk  │
   │   Kamu"              │  ← HomeMlBloc.homeRecs
   │  [card][card][card]► │
   ├──────────────────────┤
   │  "Eco Picks"         │
   │  [card][card][card]► │  ← HomeMlBloc.ecoRecs
   ├──────────────────────┤
   │  ProductsWidget      │  ← HomeBloc.product (infinite scroll)
   └──────────────────────┘

 ─── SEARCH SCREEN ──────────────────────────────────────────────

 SearchProductScreen
   └── BlocProvider<SearchProductBloc>(SearchProductService)

 User ketik + submit
   └── SearchProductBloc._onSubmitted
         └── SearchProductService.search(query, filter)
               ├── try:  POST /api/ml/search      → MlResult
               └── catch: GET /api/catalog/products/search  → fallback

 Filter sheet
   └── categories dari HomeBloc.state.category.data (global)
   └── SearchProductFilter {categoryId, minPrice, maxPrice, minEcoScore}

 ─── PRODUCT DETAIL SCREEN ──────────────────────────────────────

 ProductDetailScreen
   MultiBlocProvider (local)
   ├── ProductDetailBloc  → /api/catalog/products/slug/:slug
   ├── HomeBloc (local)   → /api/catalog/products  (produk lainnya)
   ├── FavoriteBloc
   └── SimilarProductsBloc → idle

 SimilarProductsSection.initState()
   └── SimilarProductsBloc.add(SimilarProductsRequested(productId))
         └── MlProductService.getSimilarProducts(id)
               → /api/ml/recommendations/similar/:id

 render:
   ┌──────────────────────┐
   │  Image Gallery       │
   ├──────────────────────┤
   │  Info + Harga        │
   ├──────────────────────┤
   │  Shop Info           │
   ├──────────────────────┤
   │  Deskripsi           │
   ├──────────────────────┤
   │  Reviews             │
   ├──────────────────────┤
   │  "Produk Mirip"      │  ← SimilarProductsBloc
   │  [card][card][card]► │
   ├──────────────────────┤
   │  "Produk Lainnya"    │  ← HomeBloc (local)
   │  [grid produk]       │
   └──────────────────────┘
```

---

## Getting Started

### Prasyarat

- Docker + Docker Compose
- Flutter SDK (≥ 3.10)
- Android Studio / VS Code

### 1. Clone & jalankan backend

```bash
git clone <repo-url>
cd Greenly

# Jalankan semua service
docker compose up --build

# Atau dengan file watch (hot reload dev)
docker compose watch
```

Service akan tersedia di:

| Service | URL |
|---|---|
| Traefik Dashboard | http://localhost:8080 |
| Core API | http://localhost/api/core |
| Catalog API | http://localhost/api/catalog |
| ML Engine API | http://localhost/api/ml |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

### 2. Seed & index produk ke ML

```bash
# Rebuild FAISS index dari catalog
curl -X POST http://localhost/api/ml/products/rebuild-index

# Verifikasi index
curl http://localhost/api/ml/health
```

### 3. Setup mobile app

```bash
cd apps/app

# Buat file .env
echo 'API_URL=http://<your-ip>/api' > .env

# Install dependencies
flutter pub get

# Jalankan ke emulator / device
flutter run
```

> **Catatan:** Ganti `<your-ip>` dengan IP lokal mesin (bukan `localhost`) agar emulator Android bisa menjangkau host.

---

## Konfigurasi Environment

### catalog-service

| Variable | Default | Keterangan |
|---|---|---|
| `MONGODB_URL` | — | MongoDB connection string |
| `REDIS_HOST` | redis | Redis hostname |
| `REDIS_PORT` | 6379 | Redis port |
| `RABBITMQ_URL` | amqp://guest:guest@rabbitmq:5672/ | RabbitMQ URL |
| `CORE_SERVICE_URL` | http://core-service:3000 | URL internal core |
| `JWT_ACCESS_SECRET_KEY` | — | JWT secret (shared dengan core) |
| `PORT` | 8081 | HTTP port |

### ml-engine

| Variable | Default | Keterangan |
|---|---|---|
| `MODEL_NAME` | paraphrase-multilingual-MiniLM-L12-v2 | Sentence Transformers model |
| `CATALOG_SERVICE_URL` | http://catalog-service:8081 | URL internal catalog |
| `RABBITMQ_URL` | amqp://guest:guest@rabbitmq:5672/ | RabbitMQ URL |
| `REDIS_URL` | redis://redis:6379/0 | Redis URL |
| `FAISS_INDEX_PATH` | /app/app/storage/indexes/products.faiss | Path FAISS index |
| `PRODUCT_META_PATH` | /app/app/storage/indexes/products_meta.json | Path metadata |
| `ML_PORT` | 8000 | HTTP port |

### mobile app (`apps/app/.env`)

| Variable | Keterangan |
|---|---|
| `API_URL` | Base URL backend, misal `http://192.168.1.x/api` |

---

## API Reference

### ML Engine — Search

```http
POST /api/ml/search
Content-Type: application/json

{
  "query": "botol minum ramah lingkungan",
  "limit": 10,
  "filters": {
    "category_id": "abc123",
    "min_price": 20000,
    "max_price": 200000,
    "min_eco_score": 70
  }
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "id": "prod_001",
      "product_id": "prod_001",
      "score": 0.912,
      "name": "Botol Minum Bambu 500ml",
      "slug": "botol-minum-bambu-500ml",
      "price": 85000.0,
      "currency": "IDR",
      "image_url": "https://...",
      "eco_score": 88.5,
      "rating_average": 4.7,
      "favorite_count": 213,
      "reason": "Cocok karena memiliki skor eco tinggi"
    }
  ]
}
```

### ML Engine — Recommendations

```http
GET /api/ml/recommendations/home?limit=10
GET /api/ml/recommendations/eco?limit=10
GET /api/ml/recommendations/similar/{product_id}?limit=8
```

Semua mengembalikan array `SearchResult` dengan shape yang sama.

### ML Engine — Eco Score

```http
POST /api/ml/eco-score
Content-Type: application/json

{
  "name": "Tas Kanvas Organik",
  "material_type": "cotton",
  "recyclable": true,
  "carbon_footprint": 2.5
}
```

**Response:**
```json
{
  "data": {
    "eco_score": 78.5,
    "label": "Eco Friendly",
    "reasons": ["Material daur ulang", "Carbon footprint rendah"]
  }
}
```

---

## Infrastruktur

### RabbitMQ — Event Routing

```
Exchange: greenly_events  (type: topic, durable)

Routing Keys            Queue                 Consumer
─────────────────────   ───────────────────   ────────────────
product.created         ml-engine-products    ml-engine
product.updated                               (upsert FAISS)
product.deleted
price.updated
inventory.updated
discount.applied
product.eco_attribute.updated

(semua key #)           catalog_service_queue  catalog-service
                                               (internal events)
```

### Retry Strategy

**catalog-service RabbitMQ consumer:**
```
for {
  connect → on error: sleep 5s, retry
  start consumer → on error: stop, sleep 5s, retry
  select{} — block forever (goroutine)
}
```

**ml-engine event consumer (Python/Kombu):**
```
attempt = 0
while True:
  try:
    connect + drain_events loop
    attempt = 0
  except:
    delay = [5, 10, 20, 30, 60][min(attempt, 4)]
    log.exception(...)
    attempt += 1
    sleep(delay)
```

### FAISS Dimension Guard

Saat load dari disk, dimension FAISS index dibandingkan dengan dimension dari metadata. Jika berbeda (misal setelah ganti model), FAISS index di-rebuild dari embeddings yang tersimpan di metadata, bukan dari file `.faiss` yang stale.

---

## Pengembangan

### Tambah produk baru ke index ML

Produk baru akan otomatis di-index via event `product.created` dari catalog-service ke RabbitMQ. Untuk force rebuild:

```bash
curl -X POST http://localhost/api/ml/products/rebuild-index
```

### Run flutter analyze

```bash
cd apps/app
flutter analyze
```

### Build Docker service spesifik

```bash
docker compose build catalog-service
docker compose up -d catalog-service
```

---

*Greenly — Making eco-shopping smarter.*
