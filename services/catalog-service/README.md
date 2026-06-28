# Greenly Catalog Service

[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go)](https://go.dev/)
[![Gin](https://img.shields.io/badge/Gin-1.11-008ECF?logo=gin)](https://gin-gonic.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)

**Catalog Service** adalah backend Greenly yang menangani katalog produk, kategori, harga, stok, review, rating, favorit, gambar, diskon, dan atribut ramah lingkungan. Dibangun dengan Go (Gin), MongoDB, Redis cache, dan RabbitMQ event-driven.

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
- [Event Driven](#event-driven)
- [Koneksi ke Service Lain](#koneksi-ke-service-lain)

---

## ✨ Fitur

- **Manajemen Produk**
  - CRUD produk dengan soft delete
  - Pencarian produk (keyword via MongoDB)
  - Filter berdasarkan kategori, harga, status
  - Bulk update produk
  - Toggle aktif/nonaktif produk
  - Pencarian via slug untuk SEO-friendly URL
- **Manajemen Kategori**
  - CRUD kategori dengan struktur tree (parent-child)
- **Harga & Diskon**
  - Harga dasar produk
  - Diskon produk (percentage / fixed amount dengan periode)
  - **Active Price** — Harga final hasil kalkulasi (base price - discount)
- **Stok / Inventory**
  - Manajemen stok dengan threshold
  - Reserve & release stok (untuk proses checkout)
- **Gambar Produk**
  - Upload & manajemen gambar via ImageKit
  - Multi-image dengan urutan dan primary image
- **Atribut Ramah Lingkungan (Eco)**
  - Eco score, material type, recyclability, carbon footprint
- **Reviews & Ratings**
  - CRUD review produk
  - Rating aggregation (average, count, distribution)
  - Mark helpful pada review
- **Favorites**
  - Toggle favorit produk
  - Daftar favorit user
- **Semantic Search Support**
  - Data siap pakai untuk semantic search oleh ML Engine
- **Event-driven**
  - Publikasi event ke RabbitMQ untuk product, price, inventory, discount, eco attributes

---

## 🛠 Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Go** | 1.24.11 | Bahasa pemrograman |
| **Gin** | 1.11.0 | HTTP Framework |
| **MongoDB** | - | Database utama |
| **Redis** | - | Caching (produk, harga, stok, user session) |
| **RabbitMQ** | - | Event bus (message broker) |
| **JWT** | v5 | Autentikasi token |
| **ImageKit** | - | Image upload & management |
| **Google UUID** | 1.6.0 | UUID generation |

---

## 🏗 Arsitektur

```
┌───────────────┐     ┌───────────────┐
│  Mobile App   │     │  Web App      │
│  (Flutter)    │     │  (Next.js)    │
└───────┬───────┘     └───────┬───────┘
        │                     │
        └──────────┬──────────┘
                   │ HTTP/HTTPS
                   ▼
         ┌─────────────────┐
         │  Catalog Service│  ← Port 8081
         │  (Go/Gin)       │
         └────────┬────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ MongoDB  │ │  Redis   │ │ RabbitMQ │
│ (Catalog)│ │  (Cache) │ │ (Events) │
└──────────┘ └──────────┘ └──────────┘
      │                          │
      │                          ▼
      │                  ┌──────────────┐
      │                  │ Core Service │
      └──────────────────│ (Auth/User)  │
                         └──────────────┘
```

### Design Patterns

- **Modular Clean Architecture** — Setiap module: `router → handler → service → repository`
- **Repository Pattern** — Data access via MongoDB repository layer
- **Dependency Injection** — Manual DI via constructor injection
- **Middleware Chain** — JWT Auth, Role-based, Shop Membership
- **Event Publisher** — Async event publishing via RabbitMQ
- **Redis Caching** — Cache produk, harga, stok dengan TTL
- **Soft Delete** — Semua entity menggunakan `deleted_at`
- **Response Envelope** — Standard JSON response dengan metadata pagination

---

## 📋 Prerequisites

- **Go** >= 1.24
- **MongoDB** >= 6.x
- **Redis** >= 7.x
- **RabbitMQ** >= 3.x
- **ImageKit Account** (untuk upload gambar)

---

## 🔧 Setup & Instalasi

### 1. Clone & Download Dependencies

```bash
cd services/catalog-service
go mod download
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env sesuai konfigurasi lokal Anda
```

### 3. Jalankan Aplikasi

```bash
# Development (dengan Air hot-reload jika tersedia)
air

# Atau manual
go run cmd/api/main.go

# Build & run
go build -o bin/catalog-service cmd/api/main.go
./bin/catalog-service
```

### 4. Seed Data (Opsional)

```bash
go run cmd/seed/main.go
```

---

## 🌍 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8081` | Port server |
| `MONGODB_URL` | required | MongoDB connection string |
| `CORE_SERVICE_URL` | required | Base URL core-service untuk auth |
| `JWT_ACCESS_SECRET_KEY` | required | Secret key JWT (sama dengan core-service) |
| `REDIS_URL` | `localhost:6379` | Redis connection |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672/` | RabbitMQ connection |
| `IMAGEKIT_PUBLIC_KEY` | required | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | required | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | required | ImageKit URL endpoint |

---

## 🚀 Menjalankan Aplikasi

```bash
# Development dengan hot-reload
air

# Development manual
go run cmd/api/main.go

# Production
go build -o bin/catalog-service cmd/api/main.go
./bin/catalog-service
```

---

## 📁 Struktur Proyek

```
cmd/
├── api/
│   ├── main.go              # Entry point (Gin, MongoDB, Redis init)
│   ├── routes.go            # Route registration + event publisher adapters
│   └── rabbitmq_init.go     # RabbitMQ consumer initialization
└── seed/
    ├── main.go              # Seed command
    └── seeds/               # Data seed

databases/
├── init.go                  # MongoDB connection + index creation
└── models.go                # Database models (Base, Category, Product, dll)

internal/
├── cache/redis.go           # Redis caching layer
├── coreclient/init.go       # HTTP client untuk core-service
├── imagekit/client.go       # ImageKit upload client
└── rabbitmq/
    ├── init.go              # RabbitMQ setup + event handlers
    ├── publisher.go         # Event publisher
    └── consumer.go          # Event consumer

middleware/
├── auth_middleware.go       # JWT authentication
├── jwt.go                   # JWT helpers
├── role_middleware.go       # Role-based access (SellerOnly, AdminOnly)
├── dto.go                   # UserLogin claims DTO
├── error_middleware.go      # Global error handler
├── request_logger.go        # Request logging
├── required_shop_role.go    # Shop role requirement
└── shop_member_middleware.go # Shop membership validation

modules/
├── active_price/            # Harga aktif (base - discount)
├── categories/              # Kategori produk
├── eco_attribute/           # Atribut ramah lingkungan
├── favorites/               # Favorit produk
├── inventory/               # Stok / inventory
├── price/                   # Harga produk
├── product_discount/        # Diskon produk
├── product_image/           # Gambar produk (ImageKit)
├── product_rating/          # Agregasi rating
├── products/                # Produk (CRUD, search, bulk)
└── reviews/                 # Review produk

utils/
├── format.go                # Format helpers
├── generate_slug.go         # Slug generator
├── id.go                    # ID generator
└── response_util.go         # Response helpers (OK, Created, Error, Pagination)
```

---

## 📡 API Endpoints

Dokumentasi API lengkap tersedia di [`report.md`](./report.md).

### Ringkasan Grup Endpoint

| Prefix | Public | Auth | Total | Deskripsi |
|--------|--------|------|-------|-----------|
| `/health` | 1 | 0 | 1 | Health check |
| `/categories` | 3 | 3 | 6 | Kategori produk (tree, CRUD) |
| `/products` | 4 | 5 | 9 | Produk (search, slug, CRUD, bulk, toggle) |
| `/prices` | 1 | 2 | 3 | Harga produk |
| `/inventory` | 1 | 4 | 5 | Stok (reserve, release) |
| `/discounts` | 1 | 3 | 4 | Diskon produk |
| `/eco-attributes` | 1 | 3 | 4 | Atribut ramah lingkungan |
| `/product-images` | 1 | 4 | 5 | Gambar produk (upload, reorder) |
| `/active-prices` | 3 | 0 | 3 | Harga aktif (recalculate) |
| `/favorites` | 1 | 3 | 4 | Favorit produk |
| `/reviews` | 3 | 4 | 7 | Review & rating |
| `/ratings` | 3 | 0 | 3 | Agregasi rating |

**Total: 54 endpoint** (22 public, 32 protected)

---

## 📨 Event-Driven (RabbitMQ)

### Published Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `product.created` | Produk baru dibuat | ProductID, Name, ShopID, CategoryID |
| `product.updated` | Produk diupdate | ProductID, Name, ShopID, CategoryID |
| `product.deleted` | Produk dihapus | ProductID, Name, ShopID |
| `inventory.updated` | Stok berubah | ProductID, Stock |
| `price.updated` | Harga berubah | ProductID, Amount, Currency |
| `discount.applied` | Diskon diterapkan | ProductID, Percentage, FixedAmount |
| `eco.attribute.updated` | Eco attribute berubah | ProductID, EcoScore, MaterialType |

### Consumed Events (dari Core Service)

| Event | Handler | Aksi |
|-------|---------|------|
| `order.created` | HandleOrderCreated | Reserve inventory stock |
| `order.cancelled` | HandleOrderCancelled | Release inventory stock |
| `promotion.created` | HandlePromotionCreated | Log promotion |
| `promotion.expired` | HandlePromotionExpired | Recalculate active prices |
| `shop.approved` | HandleShopApproved | Enable products for shop |

---

## 🔗 Koneksi ke Service Lain

| Service | Koneksi | Protocol | Endpoint |
|---------|---------|----------|----------|
| **Core Service** | REST API + RabbitMQ | HTTP + AMQP | `/auth/me`, `/shops/:id`, `/shops/:id/members/:userId` |
| **ML Engine** | REST API (diminta) | HTTP | Menyediakan data untuk indexing |
| **ImageKit** | REST API | HTTPS | Upload & manage gambar |
| **Mobile/Web App** | REST API | HTTP | Semua endpoint catalog |

---

## 📄 Lisensi

Private — Greenly Project
