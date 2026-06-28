# Greenly Core Service

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![MariaDB](https://img.shields.io/badge/MariaDB-003545?logo=mariadb)](https://mariadb.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)

**Core Service** adalah backend utama Greenly yang menangani autentikasi, manajemen pengguna, toko, pesanan, pembayaran, notifikasi, chat, dan keuangan platform. Dibangun dengan NestJS, Prisma ORM, MariaDB, dan RabbitMQ.

---

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Prerequisites](#prerequisites)
- [Setup & Instalasi](#setup--instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Testing](#testing)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [Event Driven](#event-driven)
- [Koneksi ke Service Lain](#koneksi-ke-service-lain)

---

## ✨ Fitur

- **Autentikasi & Authorization**
  - Registrasi & Login dengan JWT (Access + Refresh Token)
  - Verifikasi email & reset password
  - Role-based access control (RBAC): SUPER_ADMIN, ADMIN, SELLER, USER
  - Global JWT Guard + Role Guard
- **Manajemen Pengguna**
  - CRUD user oleh admin
  - Profil pengguna (update, delete akun)
- **Manajemen Toko**
  - CRUD toko, member toko dengan role (OWNER, ADMIN, STAFF)
  - Dashboard toko (summary, revenue, orders)
  - Follow/unfollow toko
  - Aplikasi/verifikasi toko
  - Banner toko
- **Manajemen Roles & Permissions**
  - CRUD roles
  - Attach/replace permissions ke role
- **Commerce**
  - Keranjang belanja (cart)
  - Checkout & order management
  - Payment via Stripe integration
- **Finance Platform**
  - Platform finance overview
  - Manajemen payout (request, approve, reject)
  - Manajemen refund
  - Payment tracking
  - Ledger per toko
- **Promotions**
  - CRUD promosi oleh admin
  - Validasi kode promo
- **Banner Management**
  - CRUD banner oleh admin
  - Banner aktif publik
- **Chat** — Realtime messaging dengan SSE
- **Notifications** — Notifikasi realtime dengan SSE
- **Health Check** — Endpoint monitoring service

---

## 🛠 Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **NestJS** | ^11.0 | Framework backend |
| **TypeScript** | ^5.7 | Bahasa pemrograman |
| **Prisma** | ^7.4 | ORM & database migration |
| **MariaDB** | - | Database relasional |
| **RabbitMQ** | - | Message broker (event bus) |
| **JWT** | - | Access & refresh token authentication |
| **Passport** | ^0.7 | Strategy autentikasi |
| **Stripe** | ^22.2 | Payment gateway |
| **Zod** | ^4.3 | Validasi schema |
| **Jest** | ^30.0 | Unit & e2e testing |
| **ESLint** | ^9.18 | Linting |

---

## 🏗 Arsitektur

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Mobile App   │     │   Web App     │     │   External    │
│  (Flutter)    │     │   (Next.js)   │     │   Services    │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │ HTTP/HTTPS
                              ▼
                    ┌─────────────────┐
                    │   Core Service  │  ← Port 3000
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌────────────┐
      │  MariaDB   │ │  RabbitMQ  │ │   Redis    │
      │  (Prisma)  │ │ (EventBus) │ │  (Cache)   │
      └────────────┘ └────────────┘ └────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌────────────┐
      │  Catalog   │ │  ML Engine │ │  Payment   │
      │  Service   │ │  (Python)  │ │  (Stripe)  │
      └────────────┘ └────────────┘ └────────────┘
```

### Design Patterns

- **Modular Architecture** — Setiap fitur adalah module NestJS independen
- **Repository Pattern** — Data access layer via Prisma Service
- **Guard-based Auth** — Global `JwtAccessGuard` + `RolesGuard`
- **Zod Validation Pipe** — Validasi request menggunakan Zod schema
- **Global Exception Filter** — Centralized error handling
- **Response Interceptor** — Standard JSON response envelope
- **Event-driven** — RabbitMQ event bus untuk komunikasi antar service

---

## 📋 Prerequisites

- **Node.js** >= 22.x
- **pnpm** >= 9.x
- **MariaDB** >= 10.x
- **RabbitMQ** >= 3.x
- **Redis** >= 7.x (opsional, untuk caching)

---

## 🔧 Setup & Instalasi

### 1. Clone & Install Dependencies

```bash
cd services/core-service
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env sesuai konfigurasi lokal Anda
```

### 3. Setup Database & Prisma

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Opsional) Seed data awal
pnpm prisma db seed
```

### 4. Jalankan Aplikasi

```bash
# Development (watch mode)
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

---

## 🌍 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port server |
| `DATABASE_URL` | required | MariaDB connection string |
| `JWT_ACCESS_SECRET_KEY` | required | Secret key JWT access token |
| `JWT_REFRESH_SECRET_KEY` | required | Secret key JWT refresh token |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672/` | RabbitMQ connection |
| `RABBITMQ_QUEUE` | `greenly_queue` | Queue name |
| `STRIPE_SECRET_KEY` | required | Stripe secret key |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

---

## 🚀 Scripts

```bash
pnpm start          # Production start
pnpm start:dev      # Development (watch mode)
pnpm build          # Build untuk production
pnpm lint           # ESLint fix
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests
pnpm test:cov       # Coverage report
pnpm reset          # Reset DB + seed
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

---

## 📁 Struktur Proyek

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
├── modules/
│   ├── auth/                        # Autentikasi (login, register, JWT)
│   ├── banner/                      # Banner management
│   ├── chat/                        # Realtime chat
│   ├── commerce/
│   │   ├── cart/                    # Keranjang belanja
│   │   ├── checkout/               # Checkout
│   │   └── order/                   # Order management
│   ├── finance/
│   │   ├── finance.controller.ts    # Platform finance overview
│   │   ├── ledger/                  # Ledger management
│   │   ├── payout/                  # Payout management
│   │   ├── payment/                 # Payment (Stripe)
│   │   └── refund/                  # Refund management
│   ├── health/                      # Health check
│   ├── identity/
│   │   ├── me/                      # Profile pengguna
│   │   ├── roles/                   # Roles & permissions
│   │   └── users/                   # Manajemen user (admin)
│   ├── notification/                # Notifikasi realtime (SSE)
│   ├── promotion/                   # Promotions
│   └── shops/
│       ├── application/             # Aplikasi toko
│       ├── banner/                  # Banner toko
│       ├── dashboard/               # Dashboard toko
│       ├── finance/                 # Keuangan toko
│       ├── follower/               # Follow toko
│       ├── member/                  # Member toko
│       └── order/                   # Order toko
├── libs/
│   ├── config/                      # Environment config
│   ├── database/                    # Prisma service
│   ├── errors/                      # Custom error classes
│   ├── filters/                     # Global exception filter
│   ├── interceptors/               # Response interceptor
│   ├── messaging/                   # RabbitMQ messaging
│   ├── middleware/                  # Request logger, correlation ID
│   └── pipes/                       # Zod validation pipe
├── common/                          # Shared utilities
└── infrastructure/
    ├── messaging/                   # RabbitMQ event bus
    └── outbox/                      # Outbox pattern
```

---

## 📡 API Endpoints

Dokumentasi API lengkap tersedia di [`report.md`](./report.md).

### Ringkasan Grup Endpoint

| Prefix | Jumlah Endpoint | Deskripsi |
|--------|----------------|-----------|
| `/health` | 1 | Health check |
| `/auth` | 10 | Autentikasi |
| `/admin/banners` | 5 | Banner admin CRUD |
| `/banners` | 1 | Banner publik |
| `/chat` | 5 | Realtime chat |
| `/notifications` | 6 | Notifikasi |
| `/admin/finance` | 1 | Platform finance |
| `/roles` | 7 | Manajemen role |
| `/checkout` | 1 | Checkout |
| `/cart` | 5 | Keranjang |
| `/shops` | 6 | Manajemen toko |
| `/me` | 3 | Profil user |
| `/admin/promotions` | 5 | Promosi admin |
| `/promotions` | 2 | Promosi publik |
| `/:shopId/*` (shops) | 16 | Berbagai fitur per-toko |
| `/orders` | 6 | Order management |
| `/users` | 6 | Manajemen user |
| `/shops/:shopId/finance/*` | 3 | Ledger, payout, refund |
| `/admin/finance/*` | 6 | Payment, payout, refund admin |
| `/payments/stripe` | 4 | Stripe payment |

**Total: ~94 endpoint**

---

## 📨 Event-Driven (RabbitMQ)

Core Service menggunakan RabbitMQ sebagai event bus untuk komunikasi asynchronous dengan service lain:

**Published Events:**
- `user.registered` — Saat user baru mendaftar
- `order.created` — Saat order baru dibuat
- `order.cancelled` — Saat order dibatalkan
- `payment.completed` — Saat pembayaran sukses
- `shop.approved` — Saat toko disetujui

**Consumed Events:**
- `inventory.updated` — Update stok dari Catalog Service
- `price.updated` — Update harga dari Catalog Service

---

## 🔗 Koneksi ke Service Lain

| Service | Koneksi | Protocol |
|---------|---------|----------|
| **Catalog Service** | REST API + RabbitMQ Events | HTTP + AMQP |
| **ML Engine** | REST API (optional, via Catalog) | HTTP |
| **Stripe** | REST API | HTTPS |

---

## 📄 Lisensi

Private — Greenly Project
