# Audit API ↔ UI Sync — Greenly Frontend (TanStack Start)

## Ringkasan Eksekutif

Dari ~123 endpoint yang terdokumentasi di `docs/api/`, hanya **28 endpoint** yang benar-benar dipanggil oleh frontend TanStack Start (`apps/web`). **~77% endpoint terdokumentasi tidak tersentuh UI sama sekali**. Frontend memiliki **3 client API paralel yang tidak konsisten** (`server/api.ts`, `features/*/api.ts`) dengan strategi base URL berbeda, dan **tidak ada file `.env`** di `apps/web/` — fallback ke hardcoded URL. Register endpoint tidak terkoneksi sama sekali (hanya toast kosong). Traefik hanya menggunakan HTTP (port 80), tidak ada HTTPS/TLS. Flutter app (`apps/app`) masih mengarah ke IP lokal (`192.168.110.239`).

---

## 1. Matrix Cakupan Endpoint

### Auth (`docs/api/auth.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/auth/register` | POST | 🔴 Tidak dipakai UI | — | `FormRegister.tsx:54` hanya toast, tidak panggil API |
| `/api/core/auth/login` | POST | ✅ | `src/server/auth.ts:16` | — |
| `/api/core/auth/refresh-token` | POST | ✅ | `src/lib/request.ts:31` | Otomatis via interceptor, bukan explicit call |
| `/api/core/auth/verify-email` | POST | 🟡 | — | — |
| `/api/core/auth/verify-password` | POST | 🟡 | — | — |
| `/api/core/auth/forgot-password` | POST | 🟡 | — | — |
| `/api/core/auth/resend-token` | POST | 🟡 | — | — |
| `/api/core/auth/change-password` | PATCH | 🟡 | — | — |
| `/api/core/auth/logout` | POST | ✅ | `src/server/auth.ts:47` | — |

### Me (`docs/api/me.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/me` | GET | ✅ | `src/server/auth.ts:35` | — |
| `/api/core/me/update` | PATCH | 🟡 | — | — |
| `/api/core/me/following/shops` | GET | 🟡 | — | — |

### Cart (`docs/api/cart.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/cart` | GET | 🟡 | — | — |
| `/api/core/cart/items` | POST | 🟡 | — | — |
| `/api/core/cart/items/:productId` | PUT | 🟡 | — | — |
| `/api/core/cart/items/:productId` | DELETE | 🟡 | — | — |
| `/api/core/cart` | DELETE | 🟡 | — | — |

### Checkout (`docs/api/checkout.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/checkout` | POST | 🟡 | — | — |

### Orders (`docs/api/orders.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/orders` | GET | ✅ | `src/features/admin/api.ts:323` | — |
| `/api/core/orders/shop/:shopId` | GET | ✅ | `src/features/seller/api.ts:179` | — |
| `/api/core/orders/:orderId` | GET | 🟡 | — | — |
| `/api/core/orders/:orderId/status` | PATCH | ✅ | `src/features/seller/api.ts:189` | ⚠️ Method UI: `createServerFn({method: "POST"})` |
| `/api/core/orders/payment-callback` | POST | 🟡 | — | — |
| `/api/core/orders/refund` | POST | 🟡 | — | — |

### Shops (`docs/api/shops.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/shops` | GET | ✅ | `src/server/web-api.ts:207`, `src/features/admin/api.ts:136` | — |
| `/api/core/shops` | POST | 🟡 | — | — |
| `/api/core/shops/me` | GET | ✅ | `src/server/web-api.ts:219`, `src/features/seller/api.ts:55`, `src/features/dashboard/api.ts:100` | — |
| `/api/core/shops/:id` | GET | 🟡 | — | — |
| `/api/core/shops/:id` | PATCH | ⚠️ | `src/features/admin/api.ts:146` | Method UI: `POST`, dipakai untuk update status |
| `/api/core/shops/:id` | DELETE | 🟡 | — | — |

### Shops Application (`docs/api/shops-application.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/shops/:shopId/application` | POST | 🟡 | — | — |
| `/api/core/shops/:shopId/application` | PATCH | 🟡 | — | — |
| `/api/core/shops/:shopId/application/review` | PATCH | ✅ | `src/server/web-api.ts:247`, `src/features/admin/api.ts:237` | ⚠️ Method UI: `POST` |
| `/api/core/shops/:shopId/application` | GET | ✅ | `src/features/admin/api.ts:198` | Dipakai admin untuk list app per-shop |
| `/api/core/shops/:shopId/application/list` | GET | ✅ | `src/server/web-api.ts:232` | — |
| `/api/core/shops/:shopId/application/me` | GET | 🟡 | — | — |
| `/api/core/shops/:shopId/application` | DELETE | 🟡 | — | — |

### Shop Dashboard (`docs/api/shops-dashboard.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/shops/:shopId/dashboard/summary` | GET | ✅ | `src/server/web-api.ts:329` | — |
| `/api/core/shops/:shopId/dashboard/revenue` | GET | ✅ | `src/server/web-api.ts:338` | — |
| `/api/core/shops/:shopId/dashboard/recent-orders` | GET | 🟡 | — | — |

### Shop Finance (`docs/api/shops-finance.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/shops/:shopId/finance/balance` | GET | ✅ | `src/features/seller/api.ts:200`, `src/features/dashboard/api.ts:117` | — |
| `/api/core/shops/:shopId/finance/ledger` | GET | ✅ | `src/features/seller/api.ts:214` | — |
| `/api/core/shops/:shopId/finance/payout` | POST | 🟡 | — | — |
| `/api/core/shops/:shopId/finance/payouts` | GET | 🟡 | — | — |

### Shop Followers (`docs/api/shops-followers.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/shops/:shopId/follow` | POST | 🟡 | — | — |
| `/api/core/shops/:shopId/follow` | DELETE | 🟡 | — | — |
| `/api/core/shops/:shopId/followers` | GET | 🟡 | — | — |
| `/api/core/shops/:shopId/following` | GET | 🟡 | — | — |

### Shop Members (`docs/api/shops-members.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All members endpoints | ALL | 🟡 | — | 5 endpoint: POST, GET list, GET detail, PATCH, DELETE |

### Shop Orders Internal (`docs/api/shops-orders.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/shops/:shopId/orders` | GET | ✅ | `src/server/web-api.ts:301` | — |
| `/api/core/shops/:shopId/orders/:id` | GET | 🟡 | — | — |
| `/api/core/shops/:shopId/orders/:id/status` | PATCH | ✅ | `src/server/web-api.ts:316` | ⚠️ Method UI: `POST` |
| `/api/core/shops/:shopId/orders/:id/refund/:refundId` | PATCH | 🟡 | — | — |

### Users (`docs/api/users.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/users` | GET | ✅ | `src/features/admin/api.ts:86` | — |
| `/api/core/users/:id` | GET | 🟡 | — | — |
| `/api/core/users` | POST | 🟡 | — | — |
| `/api/core/users/:id` | PATCH | ✅ | `src/features/admin/api.ts:96` | ⚠️ Method UI: `POST` |
| `/api/core/users/delete` | DELETE | 🟡 | — | — |
| `/api/core/users/delete/verify` | DELETE | 🟡 | — | — |

### Roles (`docs/api/roles.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All roles endpoints | ALL | 🟡 | — | 8 endpoint not used |

### Promotions (`docs/api/promotions.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All promotions endpoints | ALL | 🟡 | — | 8 endpoint not used |

### Finance Admin (`docs/api/finance/*.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/core/admin/finance/overview` | GET | ✅ | `src/features/admin/api.ts:333` | — |
| `/api/core/admin/finance/payments` | GET | 🟡 | — | — |
| `/api/core/admin/finance/payments/:id/status` | PATCH | 🟡 | — | — |
| `/api/core/admin/finance/payouts/:id/approve` | PATCH | 🟡 | — | — |
| `/api/core/admin/finance/payouts/:id/reject` | PATCH | 🟡 | — | — |
| All finance refunds endpoints | ALL | 🟡 | — | 6 endpoint |

### Catalog Categories (`docs/api/catalog/categories.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/catalog/categories` | GET | ✅ | `src/server/web-api.ts:261`, `src/features/admin/api.ts:265` | ⚠️ Path berbeda: admin pake `/catalog/categories`, web-api pake `/categories` |
| `/api/catalog/categories/tree` | GET | 🟡 | — | — |
| `/api/catalog/categories/:id` | GET | 🟡 | — | — |
| `/api/catalog/categories` | POST | ✅ | `src/features/admin/api.ts:275` | ⚠️ Path: `/catalog/categories` |
| `/api/catalog/categories/:id` | PUT | 🟡 | — | — |
| `/api/catalog/categories/:id` | DELETE | ✅ | `src/features/admin/api.ts:285` | ⚠️ Path: `/catalog/categories/:id` |

### Catalog Products (`docs/api/catalog/products.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/catalog/products` | GET | ✅ | `src/server/web-api.ts:273`, `src/features/seller/api.ts:107`, `src/features/dashboard/api.ts:76` | — |
| `/api/catalog/products/search` | GET | 🟡 | — | — |
| `/api/catalog/products/:id` | GET | 🟡 | — | — |
| `/api/catalog/products/slug/:slug` | GET | 🟡 | — | — |
| `/api/catalog/products` | POST | ✅ | `src/features/seller/api.ts:117` | — |
| `/api/catalog/products/:id` | PUT | ✅ | `src/features/seller/api.ts:127` | — |
| `/api/catalog/products/:id/toggle` | PATCH | ✅ | `src/features/seller/api.ts:147` | — |
| `/api/catalog/products/bulk` | PATCH | 🟡 | — | — |
| `/api/catalog/products/:id` | DELETE | ✅ | `src/features/seller/api.ts:137` | — |

### Catalog Prices (`docs/api/catalog/prices.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All prices endpoints | ALL | 🟡 | — | 3 endpoint |

### Catalog Inventory (`docs/api/catalog/inventory.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All inventory endpoints | ALL | 🟡 | — | 5 endpoint |

### Catalog Active Prices (`docs/api/catalog/active-prices.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All active prices endpoints | ALL | 🟡 | — | 3 endpoint |

### Catalog Discounts (`docs/api/catalog/discounts.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| All discounts endpoints | ALL | 🟡 | — | 5 endpoint |

### ML Engine (`docs/api/ml-engine.md`)
| Endpoint | Method | Status | Digunakan di | Catatan |
|---|---|---|---|---|
| `/api/ml` | GET | 🟡 | — | — |
| `/api/ml/health` | GET | 🔴 | `src/features/dashboard/api.ts:78` | **Tidak terdokumentasi** |

---

## 2. Temuan Environment & Base URL

### 🔴 KRITIS: Tidak ada file `.env` untuk web app

Tidak ada file `.env`, `.env.production`, `.env.local`, atau `.env.example` di `apps/web/`. Semua konfigurasi bergantung pada hardcoded fallback atau environment variable runtime (Nitro server).

### 🔴 KRITIS: Tiga (3) client API paralel dengan strategi base URL berbeda

**Client 1 — `src/server/api.ts` (server functions)**
- `createApi()`: `baseURL = process.env.API_URL ?? "https://greenly-api.duckdns.org/api/core"`
- `createCatalogApi()`: `baseURL = process.env.CATALOG_API_URL ?? "https://greenly-api.duckdns.org/api/catalog"`
- Path yang digunakan: *tanpa* prefix service (e.g., `/me`, `/shops`, `/categories`, `/products`)

**Client 2 — `src/features/{admin,seller,dashboard}/api.ts` (feature modules)**
- `apiBaseUrl()`: `process.env.API_URL` → strip `/core` suffix → fallback `process.env.VITE_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost/api"`
- Path yang digunakan: *dengan* prefix service (e.g., `/core/users`, `/catalog/categories`)
- **Fallback ke `http://localhost/api`** — tidak aman dan tidak konsisten dengan production

**Client 3 — `src/features/dashboard/api.ts` (dashboard)**
- Sama struktur dengan client 2, fallback `http://localhost/api`

**Dampak inkonsistensi:**
- Admin/seller feature API tidak akan pernah terhubung ke production jika env var tidak diset, karena fallback `http://localhost/api` tidak valid di production.
- Server functions (auth, web-api) punya fallback production yang benar, jadi akan tetap bekerja.

### 🔴 KRITIS: Flutter app mengarah ke IP lokal

`apps/app/.env:1` — `API_URL=http://192.168.110.239/api`
- Ini adalah IP lokal, bukan production URL.
- Untuk production harusnya `https://greenly-api.duckdns.org/api`

### ⚠️ Variabel env tidak standar Vite

Frontend TanStack Start menggunakan `process.env.API_URL`, `process.env.CATALOG_API_URL`, `process.env.SESSION_SECRET` — bukan `VITE_*`. Ini bekerja di server-side (Nitro) tapi tidak akan di-inject ke client bundle. Wajar untuk TanStack Start (SSR), tapi patut dicatat tidak ada `.env.example` yang mendokumentasikan variabel yang dibutuhkan.

---

## 3. Temuan Konfigurasi Traefik

### 🔴 KRITIS: Tidak ada HTTPS/TLS

- `infra/traefik/traefik.yml:10` — Entrypoint hanya `web` (port 80, HTTP). Tidak ada `websecure` entrypoint.
- `infra/docker-compose.dev.yml:28` — `--entrypoints.web.address=:80`
- Semua router di docker labels menggunakan `entrypoints=web`, bukan `websecure`.
- Tidak ada konfigurasi Let's Encrypt atau certResolver.
- `infra/docker-compose.yml` (seharusnya production) — **file kosong (0 bytes)**.

### ⚠️ Path prefix routing benar

Router rules sudah benar:
- `PathPrefix(`/api/core`)` → core-service (port 3000)
- `PathPrefix(`/api/catalog`)` → catalog-service (port 8081)
- `PathPrefix(`/api/ml`)` → ml-engine (port 8000)
- Middleware `stripprefix` sudah terpasang di semua router.

### ⚠️ `traefik.yml` static config

File `infra/traefik/traefik.yml:22` — Menggunakan file provider (`dynamic.yml`). Dynamic config hanya berisi middleware `security-headers` dan `rate-limit`, tidak ada konfigurasi TLS.

---

## 4. Endpoint Tidak Terdokumentasi (dipakai UI tapi tidak ada di docs/api)

| Endpoint | Method | File | Baris |
|---|---|---|---|
| `/api/ml/health` | GET | `src/features/dashboard/api.ts` | 78 |

ML Engine hanya mendokumentasikan `GET /api/ml` (root). Dashboard memanggil `/ml/health` yang tidak ada di dokumentasi — mungkin endpoint internal atau belum ditambahkan ke docs.

---

## 5. Temuan Kualitas Integrasi

### ⚠️ Method mismatch (server fn method vs actual HTTP method)

Beberapa `createServerFn` menggunakan method `"POST"` tapi memanggil endpoint `PATCH`:

| File | ServerFn method | Endpoint | Actual method |
|---|---|---|---|
| `src/server/web-api.ts:242` | POST | `/shops/:shopId/application/review` | PATCH |
| `src/server/web-api.ts:311` | POST | `/shops/:shopId/orders/:orderId/status` | PATCH |
| `src/features/admin/api.ts:89` | POST | `/core/users/:id` | PATCH |
| `src/features/admin/api.ts:139` | POST | `/core/shops/:id` | PATCH |
| `src/features/seller/api.ts:182` | POST | `/core/orders/:orderId/status` | PATCH |

Ini tidak menyebabkan error functional karena TanStack Start server functions adalah RPC-style (method hanya menentukan bagaimana data dikirim). Tapi ini misleading dan bisa menyebabkan issue jika ada middleware HTTP-level yang memeriksa method.

### ⚠️ Register endpoint tidak terkoneksi

`FormRegister.tsx:54` — Tidak memanggil API register. Hanya menampilkan toast dengan JSON `value`. Ini berarti **fitur registrasi tidak berfungsi**.

### ⚠️ Banyak halaman menggunakan data dummy/fallback

Beberapa route menggunakan data dummy tanpa koneksi API:
- `/admin/dashboard` — Data statis hardcoded
- `/admin/tokotoko` — Data statis, tidak ada panggilan API
- `/admin/approval2` — Data statis
- `/admin/daftarkategori` — Data statis
- `/admin/pesanini` — Data statis
- `/seller/produkdua` — Data statis
- `/seller/pesanandua` — Data statis
- `/seller/customer` — Data statis
- `/seller/chat` — UI only, no API
- `/admin/toko` — Menggunakan `ShopTableDummy` (data dummy)
- `/admin/kategori` — Menggunakan `CategoryTableDummy` (data dummy)
- `/admin/pesanan` — Menggunakan `OrderTableDummy` (data dummy)
- `/admin/approval` — Menggunakan `ApprovalTableDummy` (data dummy)
- `/admin/customer` — Menggunakan `CustomerTableDummy` (data dummy)

Komponen yang terhubung ke API (`OrderTable`, `ProductTable`, `ProductTableFull`) fallback ke data dummy saat API gagal. Ini bagus untuk UX tapi bisa menyembunyikan error.

### ⚠️ Type Response mismatch

`UserResponse` di `src/types/user.me.ts:17` memiliki field `shop` yang tidak ada di dokumentasi `/me` response. Sebaliknya, dokumentasi `/me` response memiliki `profile.photoUrl` yang juga ada di type, tapi `UserResponse.profile` tidak memiliki `fullName` yang match dengan dokumentasi (`fullName` di dokumentasi, ada di type).

Dokumentasi `/me` response punya `profile.photoUrl` tapi response documented di `src/modules/identity/me/me.controller.ts` harus diverifikasi apakah `photoUrl` benar ada.

### ✅ Loading & error states

Komponen yang menggunakan server functions (`OrderTable`, `ProductTable`, `SellerDashboard`, `LaporanKeuangan`) sudah memiliki loading dan error states yang baik.

### ❌ Role-based UI gating

Tidak ada pengecekan role eksplisit di route level. Routing ke admin/seller dilakukan berdasarkan heuristic string matching (`name.includes("nesa")`, `roles.includes("ADMIN")`) di `FormLogin.tsx:38-56` — ini rapuh dan tidak aman.

---

## 6. Rekomendasi Prioritas

### 🔴 P1 — Production-Breaking (perlu ditindak segera)

1. **Setup Traefik HTTPS** — Buat `docker-compose.prod.yml` dengan entrypoint `websecure`, certResolver Let's Encrypt, dan TLS. Atau deploy di balik reverse proxy terpisah yang handle TLS (Nginx/Caddy/CDN).
2. **Flutter .env** — Ubah `apps/app/.env` dari `http://192.168.110.239/api` ke `https://greenly-api.duckdns.org/api` untuk production.
3. **Register flow** — Hubungkan `FormRegister.tsx` ke `POST /api/core/auth/register` endpoint. Saat ini tidak berfungsi sama sekali.
4. **Fallback `http://localhost/api`** — Di `features/*/api.ts`, ganti fallback menjadi `https://greenly-api.duckdns.org/api` untuk production safety.

### 🟡 P2 — Konsistensi & Maintainability

5. **Konsolidasi API client** — Hanya gunakan satu pola client API (`src/server/api.ts`) untuk semua server functions. Buang `apiBaseUrl()` di `features/*/api.ts` atau refactor semuanya ke satu tempat.
6. **Buat `.env.example`** — Dokumentasikan semua env var yang dibutuhkan: `API_URL`, `CATALOG_API_URL`, `SESSION_SECRET`.
7. **Path prefix konsisten** — Pilih satu strategi: path dengan prefix (`/core/...`) atau base URL sudah mencakup prefix. Jangan campur aduk.
8. **Method server fn vs actual method** — Sinkronkan method `createServerFn` dengan actual HTTP method yang dipanggil.

### 🟢 P3 — Penyempurnaan

9. **Role-based routing** — Ganti heuristic string matching dengan pengecekan role dari response `/me`.
10. **Dokumentasi `/ml/health`** — Tambahkan endpoint ke `docs/api/ml-engine.md` atau hapus dari dashboard.
11. **Data dummy** — Untuk halaman yang masih dummy, buat rencana koneksi API atau dokumentasikan sebagai "belum implementasi".
12. **Audit tipe** — Sinkronkan `UserResponse` type dengan actual response API `/me` (verifikasi field `shop`, `photoUrl`).
